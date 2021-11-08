import { AxiosRequestConfig } from 'axios';
import { DataSetProps, DataToJSON, FieldType } from '../../../data-set/interface';

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
    },
    {
      name: 'searchConditionId',
      type: FieldType.number,
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
    { name: 'searchName', type: 'string', maxLength: 10, required: true },
    { name: 'searchId', type: 'string' },
    { name: 'defaultFlag', type: 'boolean', falseValue: 0, trueValue: 1 },
    { name: 'searchCode', type: 'string', defaultValue: searchCode },
    { name: 'conditionList', type: 'object' },
  ],
});
