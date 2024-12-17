import isNil from 'lodash/isNil';
import { action, observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { warning } from '../utils';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import axios from '../axios';
import Field, { FieldProps } from '../data-set/Field';
import Record from '../data-set/Record';
import { FieldType } from '../data-set/enum';
import { LovFieldType } from '../enum';
import { LovConfig, LovConfigItem } from '../interface';
import { getGlobalConfig, processAxiosConfig } from './utils';
import { TransportHookProps } from '../data-set/Transport';
import { mergeDataSetProps } from '../data-set/utils';
import PromiseMerger from '../promise-merger';
import { getConfig as globalGetConfig } from '../configure';

type callbackArgs = [(codes: string[]) => AxiosRequestConfig, Field | undefined];

function getFieldType(conditionFieldType?: FieldType | LovFieldType): FieldType {
  switch (conditionFieldType) {
    case LovFieldType.INT:
      return FieldType.number;
    case LovFieldType.TEXT:
      return FieldType.string;
    case LovFieldType.DATE:
      return FieldType.date;
    case LovFieldType.DATETIME:
      return FieldType.dateTime;
    case LovFieldType.POPUP:
      return FieldType.object;
    default:
      return (conditionFieldType as FieldType) || FieldType.string;
  }
}

function generateConditionField(
  fields: FieldProps[],
  {
    conditionField,
    conditionFieldType,
    conditionFieldName,
    gridFieldName,
    display,
    conditionFieldLovCode,
    conditionFieldSelectCode,
    conditionFieldSelectUrl,
    conditionFieldSelectTf,
    conditionFieldSelectVf,
    conditionFieldRequired,
    fieldProps,
  }: LovConfigItem,
): void {
  if (conditionField === 'Y') {
    const name = conditionFieldName || gridFieldName;
    const field = {
      name,
      type: getFieldType(conditionFieldType),
      label: display,
      lovCode: conditionFieldLovCode || undefined,
      lookupCode: conditionFieldSelectCode || undefined,
      lookupUrl: conditionFieldSelectUrl || undefined,
      textField: conditionFieldSelectTf || undefined,
      valueField: conditionFieldSelectVf || undefined,
      required: conditionFieldRequired || undefined,
      ...fieldProps,
    };
    fields.push(field);
    if (conditionFieldType === LovFieldType.POPUP) {
      const aliasName = `__lov__${name}`;
      field.name = aliasName;
      fields.push({
        name,
        bind: `${aliasName}.${conditionFieldSelectVf}`,
      });
    }
  }
}

function generateGridField(
  fields: FieldProps[],
  { gridField, gridFieldName, display, fieldProps }: LovConfigItem,
): void {
  if (gridField === 'Y') {
    fields.push({
      name: gridFieldName,
      label: display,
      ...fieldProps,
    });
  }
}

export class LovCodeStore {
  @observable lovCodes: ObservableMap<string, LovConfig>;

  pendings = {};

  constructor() {
    this.init();
  }

  batchCallback = (codes: string[], args: callbackArgs): Promise<{ [key: string]: LovConfig }> => {
    const [lovDefineBatchAxiosConfig, field] = args;
    if (lovDefineBatchAxiosConfig) {
      return this.getAxios(field)(lovDefineBatchAxiosConfig(codes)) as any;
    }
    return Promise.resolve({});
  }

  merger: PromiseMerger<LovConfig, callbackArgs, undefined> = new PromiseMerger(this.batchCallback, { maxAge: 60000, max: 100 });

  getAxios(field?: Field): AxiosInstance {
    return getGlobalConfig('axios', field) || axios;
  }

  @action
  init() {
    this.lovCodes = observable.map<string, LovConfig>();
  }

  getDefineAxiosConfig(
    code: string,
    field?: Field,
    record?: Record,
    fieldLovDefineAxiosConfig?: AxiosRequestConfig | ((code: string, field?: Field) => AxiosRequestConfig),
  ): AxiosRequestConfig | undefined {
    const lovDefineAxiosConfig =
      fieldLovDefineAxiosConfig ||
      (field && field.get('lovDefineAxiosConfig', record)) ||
      getGlobalConfig('lovDefineAxiosConfig', field);
    const config = processAxiosConfig(lovDefineAxiosConfig, code, field);
    return {
      ...config,
      url: config.url || this.getConfigUrl(code, field, record),
      method: config.method || 'post',
    };
  }

  getConfig(code: string): LovConfig | undefined {
    return this.lovCodes.get(code);
  }

  fetchDefineInBatch = (code: string, lovDefineBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig, field?: Field)
    : Promise<LovConfig | undefined> => {
    const getBatchKey = (defaultKey) => {
      const { url } = lovDefineBatchAxiosConfig([code]);
      return url ? url.split('?')[0] : defaultKey;
    }
    return this.merger.add(code, getBatchKey, [lovDefineBatchAxiosConfig, field]);
  }

  async fetchConfig(code: string, field?: Field, record?: Record): Promise<LovConfig | undefined> {
    let config = this.getConfig(code);
    // SSR do not fetch the lookup
    if (!config && typeof window !== 'undefined') {
      const defineBatch = field
        ? field.get('lovDefineBatchAxiosConfig', record) || field.dataSet.getConfig('lovDefineBatchAxiosConfig')
        : globalGetConfig('lovDefineBatchAxiosConfig');
      const useLovDefineBatchFunc = field
        ? field.get('useLovDefineBatch', record) || field.dataSet.getConfig('useLovDefineBatch')
        : globalGetConfig('useLovDefineBatch');
      const useLovDefineBatch = code && useLovDefineBatchFunc(code, field) !== false;

      let lovDefineAxiosConfig: AxiosRequestConfig | ((code: string, field?: Field) => AxiosRequestConfig) | undefined;
      let pending: any = this.pendings[code];
      // 优化 dynamicProps 中配置 lovCode 和 lovDefineAxiosConfig 引起循环调用问题
      if ((defineBatch && useLovDefineBatch) || !pending) {
        lovDefineAxiosConfig = field ? field.get('lovDefineAxiosConfig', record) : undefined;
      }
      if (defineBatch && useLovDefineBatch && !lovDefineAxiosConfig) {
        config = await this.fetchDefineInBatch(code, defineBatch, field);
        runInAction(() => {
          if (config) {
            this.lovCodes.set(code, config);
          }
        });
      } else {
        const axiosConfig = !pending ? this.getDefineAxiosConfig(code, field, record, lovDefineAxiosConfig) : undefined;
        if (pending || axiosConfig) {
          try {
            pending = pending || this.pendings[code] || this.getAxios(field)(axiosConfig!);
            this.pendings[code] = pending;
            config = await pending;
            runInAction(() => {
              if (config) {
                this.lovCodes.set(code, config);
              }
            });
          } finally {
            delete this.pendings[code];
          }
        }
      }
    }
    return config;
  }

  // lovCode 作为key 缓存了 ds
  getLovDataSet(code: string, field?: Field, dataSetProps?: DataSetProps | ((p: DataSetProps) => DataSetProps), record?: Record): DataSet | undefined {
    const config = this.getConfig(code);
    if (config) {
      const { lovPageSize, lovItems, parentIdField, idField, treeFlag, dataSetProps: configDataSetProps } = config;
      const valueField = field ? field.get('valueField', record) : config.valueField;
      const dsProps: DataSetProps = {
        transport: {
          read: this.getQueryAxiosConfig(code, field, config, record),
        },
        primaryKey: valueField,
        cacheSelection: true,
      };
      if (!isNil(lovPageSize) && !isNaN(Number(lovPageSize))) {
        dsProps.pageSize = Number(lovPageSize);
      } else {
        dsProps.paging = false;
      }
      if (treeFlag === 'Y' && parentIdField && idField) {
        dsProps.parentField = parentIdField;
        dsProps.idField = idField;
        if (dsProps.pageSize !== undefined) {
          dsProps.paging = 'server';
        }
      }

      if (lovItems && lovItems.length) {
        const { querys, fields } = lovItems
          .sort(
            ({ conditionFieldSequence }, { conditionFieldSequence: conditionFieldSequence2 }) =>
              conditionFieldSequence - conditionFieldSequence2,
          )
          .reduce(
            (obj, configItem) => {
              generateConditionField(obj.querys, configItem);
              generateGridField(obj.fields, configItem);
              return obj;
            },
            { querys: [] as FieldProps[], fields: [] as FieldProps[] },
          );
        if (querys.length) {
          dsProps.queryFields = querys;
        }
        if (fields.length) {
          dsProps.fields = fields;
        }
      }
      return new DataSet(mergeDataSetProps(mergeDataSetProps(dsProps, configDataSetProps), dataSetProps), field && field.dataSet.context);
    }
    warning(false, `LOV: code<${code}> is not exists`);
    return undefined;
  }

  getConfigUrl(code: string, field?: Field, record?: Record | undefined): string {
    const lovDefineUrl = (field && field.get('lovDefineUrl', record)) || getGlobalConfig('lovDefineUrl', field);
    if (typeof lovDefineUrl === 'function') {
      return lovDefineUrl(code);
    }
    return lovDefineUrl as string;
  }

  getQueryAxiosConfig(code: string, field?: Field, config?: LovConfig, record?: Record | undefined) {
    return (props: TransportHookProps) => {
      const lovQueryAxiosConfig =
        (field && field.get('lovQueryAxiosConfig', record)) || getGlobalConfig('lovQueryAxiosConfig', field);
      const lovQueryUrl = this.getQueryUrl(code, field, props, record);
      const axiosConfig = processAxiosConfig(lovQueryAxiosConfig, code, config, props, lovQueryUrl);
      return {
        ...axiosConfig,
        url: axiosConfig.url || lovQueryUrl,
        method: axiosConfig.method || 'post',
      };
    };
  }

  getQueryUrl(code: string, field: Field | undefined, props: TransportHookProps, record?: Record | undefined): string {
    const config = this.getConfig(code);
    if (config) {
      const { customUrl } = config;
      if (customUrl) {
        return customUrl;
      }
    }

    const lovQueryUrl = (field && field.get('lovQueryUrl', record)) || getGlobalConfig('lovQueryUrl', field);

    if (typeof lovQueryUrl === 'function') {
      return lovQueryUrl(code, config, props);
    }
    return lovQueryUrl as string;
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      codes.forEach(code => {
        this.lovCodes.delete(code);
        this.merger.cache.del(code);
      });
    } else {
      this.lovCodes.clear();
      this.merger.cache.reset();
    }
  }
}

export default new LovCodeStore();
