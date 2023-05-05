import { AxiosRequestConfig } from 'axios';
import omit from 'lodash/omit';
import DataSet from '../../../data-set/DataSet';
import { DataSetProps, DataSetSelection, DataToJSON, FieldType } from '../../../data-set/interface';
import { $l } from '../../../locale-context';
import { OPERATOR, OPERATOR_TYPE } from './Operator';


function processAxiosConfig(
  axiosConfig: AxiosRequestConfig | ((...args: any[]) => AxiosRequestConfig) = {},
  args: {},
): AxiosRequestConfig {
  if (typeof axiosConfig === 'function') {
    return axiosConfig({ ...args });
  }
  return axiosConfig;
}

function getTransportConfig(props) {
  const { config, type, searchCode, queryDataSet, tableFilterAdapter } = props;
  return processAxiosConfig(tableFilterAdapter, { type, config, searchCode, queryDataSet });
}

export const ConditionDataSet: () => DataSetProps = () => ({
  paging: false,
  fields: [
    {
      name: 'fieldName',
      type: FieldType.string,
    },
    {
      name: 'comparator',
      type: FieldType.string,
      defaultValue: 'EQUAL',
    },
    {
      name: 'conditionType',
      type: FieldType.string,
      defaultValue: 'regular',
    },    
    {
      name: 'value',
      transformRequest: value => {
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      },
      transformResponse: value => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      },
    },
  ],
  dataToJSON: DataToJSON.all,
  events: {
    update: () => {/* noop */
    },
  },
});

export enum AdvancedFieldSet {
  fieldName = '__fieldName__',
  comparator = '__comparator__',
  tableName = '__tableName__',
  alias = '__alias__',
  source = '__source__',
  conditionType = '__conditionType__',
}


export const NewFilterDataSet = ({ propFields }) => {
  const advancedFields = propFields.map(field => omit(field, ['defaultValue', 'ignore', 'cascadeMap']));
  return {
    paging: false,
    selection: false,
    autoCreate: false,
    primaryKey: 'searchId',
    autoQuery: false,
    fields: [
      {
        name: AdvancedFieldSet.fieldName,
        type: FieldType.string,
        required: true,
      },
      {
        name: AdvancedFieldSet.comparator,
        type: FieldType.string,
        required: true,
        options: new DataSet({
          selection: DataSetSelection.single,
          paging: false,
          data: OPERATOR_TYPE.ALL,
        }),
      },
      {
        name: AdvancedFieldSet.tableName,
        type: FieldType.string,
      },
      {
        name: AdvancedFieldSet.alias,
        type: FieldType.string,
      },
      {
        name: AdvancedFieldSet.source,
        type: FieldType.string,
      },
      {
        name: AdvancedFieldSet.conditionType,
        type: FieldType.string,
        defaultValue: 'comparator',
      }, 
      {
        name: 'value',
        computedProps: {
          bind: ({ record }) => {
            return record.get(AdvancedFieldSet.fieldName);
          },
        },
        transformRequest: value => {
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return value;
        },
        transformResponse: value => {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        },
      },
      ...advancedFields,
    ],
    dataToJSON: DataToJSON.dirty,
    events: {
      update: ({ record, name, oldValue }) => {
        const fieldName = record.get(AdvancedFieldSet.fieldName);
        const comparator = record.get(AdvancedFieldSet.comparator);
        if ([OPERATOR.IS_NULL.value, OPERATOR.IS_NOT_NULL.value].includes(comparator)) {
          record.set(fieldName, null);
        }
        if (name === AdvancedFieldSet.fieldName) {
          record.set(oldValue, null);
          if (comparator) {
            record.init(AdvancedFieldSet.comparator, null);
          }
        }
      },
    },
  }
};

export const QuickFilterDataSet = ({ searchCode, queryDataSet, tableFilterAdapter }) => ({
  paging: false,
  autoQuery: false,
  autoLocateFirst: false,
  primaryKey: 'searchId',
  transport: {
    adapter: (config: AxiosRequestConfig, type: string) => getTransportConfig({
      config,
      type,
      searchCode,
      queryDataSet,
      tableFilterAdapter,
    }),
  },
  fields: [
    { name: 'searchName', label: $l('Table', 'filter_name'), type: 'string', maxLength: 20, required: true },
    { name: 'searchId', type: 'string' },
    // 条件逻辑值
    { 
      name: 'conExpression', 
      type: 'string', 
      defaultValue: 'all',
      // 兼容旧数据
      transformResponse: value => {
        if (!value) {
          return 'all';
        }
        return value;
      },
      transformRequest: value => {
        return value || 'all';
      },
    },
    { name: 'defaultFlag', type: 'boolean', falseValue: 0, trueValue: 1, label: $l('Table', 'set_default') },
    { name: 'searchCode', type: 'string', defaultValue: searchCode },
    { name: 'conditionList', type: 'object' },
    {
      name: 'saveFilterValue',
      type: 'boolean',
      falseValue: 0,
      trueValue: 1,
      defaultValue: 1,
      // 默认保存筛选值，兼容旧数据
      transformResponse: value => {
        if (value === 0) {
          return 0;
        }
        return 1;
      },
      label: $l('Table', 'save_filter_value'),
    },
    {
      // 是否租户默认配置
      name: 'isTenant',
      type: 'boolean',
      falseValue: 0,
      trueValue: 1,
    },
  ],
});
