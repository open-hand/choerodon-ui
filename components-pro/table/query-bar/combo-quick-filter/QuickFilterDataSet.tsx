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

export const QuickFilterDataSet = ({ queryDataSet, tableFilterAdapter }) => ({
  paging: false,
  autoQuery: false,
  primaryKey: 'searchId',
  dataToJSON: DataToJSON.all,
  transport: {
    adapter: (config: AxiosRequestConfig, type: string) => getTransportConfig({
      config,
      type,
      queryDataSet,
      tableFilterAdapter,
    }),
  },
  fields: [
    { name: 'searchName', label: $l('Table', 'filter_name'), type: 'string', maxLength: 20, required: true },
    { name: 'searchId', type: 'string' },
    { name: 'searchIcon', type: 'string' },
    { name: 'personalFilter', type: 'string' },
    { name: 'personalColumn', type: 'string' },
  ],
});
