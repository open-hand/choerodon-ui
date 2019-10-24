import { AxiosRequestConfig } from 'axios';
import { toJS } from 'mobx';
import Field from '../data-set/Field';
import Record from '../data-set/Record';

export function getLovPara(field: Field, record?: Record) {
  const lovPara = toJS(field.get('lovPara')) || {};
  const cascadeMap = field.get('cascadeMap');
  if (record && cascadeMap) {
    Object.keys(cascadeMap).forEach(
      cascade => (lovPara[cascade] = record.get(cascadeMap[cascade])),
    );
  }
  return lovPara;
}

export function processAxiosConfig(
  axiosConfig: AxiosRequestConfig | ((...args: any[]) => AxiosRequestConfig) = {},
  ...args: any[]
): AxiosRequestConfig {
  if (typeof axiosConfig === 'function') {
    return axiosConfig(...args);
  }
  return axiosConfig;
}
