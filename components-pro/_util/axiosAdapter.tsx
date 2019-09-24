import { AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import DataSet from '../data-set/DataSet';
import { TransportType } from '../data-set/Transport';

export default function axiosAdapter(
  config: TransportType,
  dataSet: DataSet,
  data?: any,
  params?: any,
): AxiosRequestConfig {
  const newConfig: AxiosRequestConfig = {
    data,
    params,
    method: 'post',
  };
  if (isString(config)) {
    newConfig.url = config;
  } else if (config) {
    Object.assign(
      newConfig,
      typeof config === 'function' ? config({ data, dataSet, params }) : config,
    );
  }
  if (newConfig.data && newConfig.method && newConfig.method.toLowerCase() === 'get') {
    newConfig.params = {
      ...newConfig.params,
      ...newConfig.data,
    };
  }
  return newConfig;
}
