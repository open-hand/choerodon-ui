import isNil from 'lodash/isNil';
import { action, observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import axios from '../axios';
import Field, { FieldProps } from '../data-set/Field';
import { FieldType } from '../data-set/enum';
import { LovFieldType } from '../lov/enum';
import { LovConfig, LovConfigItem } from '../lov/Lov';
import { processAxiosConfig } from './utils';
import { TransportHookProps } from '../data-set/Transport';

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
  { gridField, gridFieldName, display }: LovConfigItem,
  valueField?: string,
): void {
  if (gridField === 'Y') {
    fields.push({
      name: gridFieldName,
      label: display,
      unique: valueField === gridFieldName,
    });
  }
}

export class LovCodeStore {
  @observable lovCodes: ObservableMap<string, LovConfig>;

  @observable lovDS: ObservableMap<string, DataSet>;

  pendings = {};

  get axios(): AxiosInstance {
    return getConfig('axios') || axios;
  }

  constructor() {
    this.init();
  }

  @action
  init() {
    this.lovCodes = observable.map<string, LovConfig>();
    this.lovDS = observable.map<string, DataSet>();
  }

  getDefineAxiosConfig(code: string, field?: Field): AxiosRequestConfig | undefined {
    const lovDefineAxiosConfig =
      (field && field.get('lovDefineAxiosConfig')) || getConfig('lovDefineAxiosConfig');
    const config = processAxiosConfig(lovDefineAxiosConfig, code);
    return {
      ...config,
      url: config.url || this.getConfigUrl(code, field),
      method: config.method || 'post',
    };
  }

  getConfig(code: string): LovConfig | undefined {
    return this.lovCodes.get(code);
  }

  async fetchConfig(code: string, field?: Field): Promise<LovConfig | undefined> {
    let config = this.getConfig(code);
    // SSR do not fetch the lookup
    if (!config && typeof window !== 'undefined') {
      const axiosConfig = this.getDefineAxiosConfig(code, field);
      if (axiosConfig) {
        try {
          const pending = this.pendings[code] || this.axios(axiosConfig);
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
    return config;
  }

  getLovDataSet(code: string, field?: Field): DataSet | undefined {
    let ds = this.lovDS.get(code);
    if (!ds) {
      const config = this.getConfig(code);
      if (config) {
        const { lovPageSize, lovItems, parentIdField, idField, valueField, treeFlag } = config;
        const dataSetProps: DataSetProps = {
          transport: {
            read: this.getQueryAxiosConfig(code, field, config),
          },
          primaryKey: valueField,
          cacheSelection: true,
        };
        if (!isNil(lovPageSize) && !isNaN(Number(lovPageSize))) {
          dataSetProps.pageSize = Number(lovPageSize);
        } else {
          dataSetProps.paging = false;
        }
        if (treeFlag === 'Y' && parentIdField && idField) {
          dataSetProps.parentField = parentIdField;
          dataSetProps.idField = idField;
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
                generateGridField(obj.fields, configItem, valueField);
                return obj;
              },
              { querys: [] as FieldProps[], fields: [] as FieldProps[] },
            );
          if (querys.length) {
            dataSetProps.queryFields = querys;
          }
          if (fields.length) {
            dataSetProps.fields = fields;
          }
        }
        runInAction(() => {
          this.lovDS.set(code, (ds = new DataSet(dataSetProps)));
        });
      } else {
        warning(false, `LOV: code<${code}> is not exists`);
      }
    }
    return ds;
  }

  getConfigUrl(code: string, field?: Field): string {
    const lovDefineUrl = (field && field.get('lovDefineUrl')) || getConfig('lovDefineUrl');
    if (typeof lovDefineUrl === 'function') {
      return lovDefineUrl(code);
    }
    return lovDefineUrl as string;
  }

  getQueryAxiosConfig(code: string, field?: Field, config?: LovConfig) {
    return (props: TransportHookProps) => {
      const lovQueryAxiosConfig =
        (field && field.get('lovQueryAxiosConfig')) || getConfig('lovQueryAxiosConfig');
      const axiosConfig = processAxiosConfig(lovQueryAxiosConfig, code, config, props);
      return {
        ...axiosConfig,
        url: axiosConfig.url || this.getQueryUrl(code, field, props),
        method: axiosConfig.method || 'post',
      };
    };
  }

  getQueryUrl(code: string, field: Field | undefined, props: TransportHookProps): string {
    const config = this.getConfig(code);
    if (config) {
      const { customUrl } = config;
      if (customUrl) {
        return customUrl;
      }
    }

    const lovQueryUrl = (field && field.get('lovQueryUrl')) || getConfig('lovQueryUrl');

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
        this.lovDS.delete(code);
      });
    } else {
      this.lovCodes.clear();
      this.lovDS.clear();
    }
  }
}

export default new LovCodeStore();
