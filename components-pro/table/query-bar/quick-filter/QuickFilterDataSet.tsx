import { AxiosRequestConfig } from 'axios';
import { DataSetProps, DataToJSON, FieldType } from '../../../data-set/interface';
import { $l } from '../../../locale-context';

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

export const QuickFilterDataSet = ({ searchCode, queryDataSet, tableFilterAdapter }) => ({
  paging: false,
  autoQuery: false,
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
