import isNil from 'lodash/isNil';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import axios from '../axios';
import { ColumnAlign } from '../table/enum';
import { FieldProps } from '../data-set/Field';
import { action, remove } from 'mobx';
import { FieldType } from '../data-set/enum';
import { LovFieldType } from './enum';

export type LovConfigItem = {
  display?: string,
  conditionField?: string,
  conditionFieldLovCode?: string,
  conditionFieldType?: string,
  conditionFieldName?: string,
  conditionFieldSelectCode?: string,
  conditionFieldSelectUrl?: string,
  conditionFieldSelectTf?: string,
  conditionFieldSelectVf?: string,
  conditionFieldSequence: number,
  gridField?: string,
  gridFieldName?: string,
  gridFieldWidth?: number,
  gridFieldAlign?: ColumnAlign,
};

export type LovConfig = {
  title?: string,
  width?: number,
  height?: number,
  customUrl?: string,
  lovPageSize?: string,
  lovItems: LovConfigItem[],
  treeFlag?: string,
  parentIdField?: string,
  idField?: string,
  textField?: string,
  valueField?: string,
}

function getFieldType(conditionFieldType?: string): FieldType {
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
      return FieldType.string;
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

  static getConfigUrl = code => `/sys/lov/lov_define?code=${code}`;

  static getQueryUrl = code => `/common/lov/dataset/${code}`;

  lovCodes = {};

  lovDS = {};

  pendings = {};

  async fetchConfig(code: string): Promise<LovConfig | undefined> {
    let config = this.lovCodes[code];
    // SSR do not fetch the lookup
    if (!config && typeof window !== 'undefined') {
      try {
        const pending = this.pendings[code] = this.pendings[code] || axios.post(this.getConfigUrl(code));
        config = await pending;
        this.lovCodes[code] = config;
      } finally {
        delete this.pendings[code];
      }
    }
    return config;
  }

  async getLovDataSet(code: string): Promise<DataSet | undefined> {
    let ds = this.lovDS[code];
    if (!ds) {
      const config = await this.fetchConfig(code);
      if (!config) {
        warning(false, `LOV: code<${code}> is not exists`);
      } else {
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
        this.lovDS[code] = ds = new DataSet(dataSetProps);
      }
    }
    return ds;
  }

  getConfigUrl(code: string): string {
    const { getConfigUrl } = this.constructor as any;
    if (typeof getConfigUrl === 'function') {
      return getConfigUrl(code);
    } else {
      return getConfigUrl as string;
    }
  }

  getQueryUrl(code: string): string {
    const config = this.lovCodes[code];
    if (config) {
      const { customUrl } = config;
      if (customUrl) {
        return customUrl;
      }
    }
    const { getQueryUrl } = this.constructor as any;
    if (typeof getQueryUrl === 'function') {
      return getQueryUrl(code);
    } else {
      return getQueryUrl as string;
    }
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      codes.forEach(code => (remove(this.lovCodes, code), remove(this.lovDS, code)));
    } else {
      this.lovCodes = {};
      this.lovDS = {};
    }
  }
}

export default new LovCodeStore();
