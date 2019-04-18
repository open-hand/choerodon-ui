import isNil from 'lodash/isNil';
import { action, observable, ObservableMap, runInAction } from 'mobx';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import axios from '../axios';
import { FieldProps } from '../data-set/Field';
import { FieldType } from '../data-set/enum';
import { LovFieldType } from '../lov/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import { LovConfig, LovConfigItem } from '../lov/Lov';

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
      return conditionFieldType as FieldType || FieldType.string;
  }
}

function generateConditionField(fields: FieldProps[], {
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
}: LovConfigItem): void {
  if (conditionField === 'Y') {
    const name = conditionFieldName || gridFieldName;
    const field = {
      name,
      type: getFieldType(conditionFieldType),
      label: display,
      lovCode: conditionFieldLovCode || void 0,
      lookupCode: conditionFieldSelectCode || void 0,
      lookupUrl: conditionFieldSelectUrl || void 0,
      textField: conditionFieldSelectTf || void 0,
      valueField: conditionFieldSelectVf || void 0,
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

function generateGridField(fields: FieldProps[], {
                             gridField,
                             gridFieldName,
                             display,
                           }: LovConfigItem,
                           valueField?: string): void {
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

  constructor() {
    this.init();
  }

  @action
  init() {
    this.lovCodes = observable.map<string, LovConfig>();
    this.lovDS = observable.map<string, DataSet>();
  }

  getConfig(code: string): LovConfig | undefined {
    return this.lovCodes.get(code);
  }

  async fetchConfig(code: string): Promise<LovConfig | undefined> {
    let config = this.getConfig(code);
    // SSR do not fetch the lookup
    if (!config && typeof window !== 'undefined') {
      try {
        const pending = this.pendings[code] = this.pendings[code] || axios.post(this.getConfigUrl(code));
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
    return config;
  }

  getLovDataSet(code: string): DataSet | undefined {
    let ds = this.lovDS.get(code);
    if (!ds) {
      const config = this.getConfig(code);
      if (config) {
        const { lovPageSize, lovItems, parentIdField, idField, valueField, treeFlag } = config;
        const dataSetProps: DataSetProps = {
          queryUrl: this.getQueryUrl(code),
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

        if (lovItems.length) {
          const { querys, fields } = lovItems.sort(({ conditionFieldSequence }, { conditionFieldSequence: conditionFieldSequence2 }) => (
            conditionFieldSequence - conditionFieldSequence2
          )).reduce((obj, configItem) => (
            generateConditionField(obj.querys, configItem), generateGridField(obj.fields, configItem, valueField), obj
          ), { querys: [] as FieldProps[], fields: [] as FieldProps[] });
          if (querys.length) {
            dataSetProps.queryFields = querys;
          }
          if (fields.length) {
            dataSetProps.fields = fields;
          }
        }
        runInAction(() => {
          this.lovDS.set(code, ds = new DataSet(dataSetProps));
        });
      } else {
        warning(false, `LOV: code<${code}> is not exists`);
      }
    }
    return ds;
  }

  getConfigUrl(code: string): string {
    const lovDefineUrl = getConfig('lovDefineUrl');
    if (typeof lovDefineUrl === 'function') {
      return lovDefineUrl(code);
    } else {
      return lovDefineUrl as string;
    }
  }

  getQueryUrl(code: string): string {
    const config = this.getConfig(code);
    if (config) {
      const { customUrl } = config;
      if (customUrl) {
        return customUrl;
      }
    }
    const lovQueryUrl = getConfig('lovQueryUrl');
    if (typeof lovQueryUrl === 'function') {
      return lovQueryUrl(code);
    } else {
      return lovQueryUrl as string;
    }
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      codes.forEach(code => (this.lovCodes.delete(code), this.lovDS.delete(code)));
    } else {
      this.lovCodes.clear();
      this.lovDS.clear();
    }
  }
}

export default new LovCodeStore();
