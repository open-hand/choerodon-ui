import { action, get, observable, ObservableMap, toJS } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import queryString from 'querystringify';
import omitBy from 'lodash/omitBy';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import axios from '../axios';
import Field from '../data-set/Field';
import lovCodeStore from './LovCodeStore';
import { FieldType } from '../data-set/enum';
import { append, generateResponseData } from '../data-set/utils';
import isSameLike from '../_util/isSameLike';

function splitKeys(lookupKey: string): string[] {
  const [key, subKey] = lookupKey.split('?');
  const keys: string[] = [key, ''];
  if (subKey) {
    const params = queryString.parse(subKey);
    const newParams = {};
    Object.keys(params)
      .sort()
      .forEach(name => (newParams[name] = params[name]));
    keys[1] = queryString.stringify(newParams);
  }
  return keys;
}

export type responseData = object[];
export type responseType = responseData | undefined;

export class LookupCodeStore {
  @observable lookupCodes: ObservableMap<string, ObservableMap<string, responseData>>;

  pendings: { [key: string]: Promise<responseType> } = {};

  get axios(): AxiosInstance {
    return getConfig('axios') || axios;
  }

  constructor() {
    this.init();
  }

  @action
  init() {
    this.lookupCodes = observable.map<string, ObservableMap<string, responseData>>();
  }

  // all(lookupKey: string, valueField: string): responseData | undefined {
  //   const [key] = splitKeys(lookupKey);
  //   if (key) {
  //     const rootData = this.lookupCodes.get(key);
  //     if (rootData) {
  //       return [...[...rootData.values()].reduce((obj, values) => {
  //         values.forEach(item => obj.set(item[valueField], item));
  //         return obj;
  //       }, observable.map<string, object>()).values()];
  //     }
  //   }
  // }

  get(lookupKey: string): responseData | undefined {
    const [key, subKey] = splitKeys(lookupKey);
    if (key) {
      const rootData = this.lookupCodes.get(key);
      if (rootData) {
        return rootData.get(subKey);
      }
    }
  }

  @action
  set(lookupKey: string, data: responseData | undefined) {
    if (data) {
      const [key, subKey] = splitKeys(lookupKey);
      if (key) {
        let rootData = this.lookupCodes.get(key);
        if (!rootData) {
          rootData = observable.map<string, responseData>();
          this.lookupCodes.set(key, rootData);
        }
        rootData.set(subKey, data);
      }
    }
  }

  getByValue(lookupKey: string, value: any, valueField: string): object | undefined {
    const lookup = this.get(lookupKey);
    if (lookup) {
      return lookup.find(obj => isSameLike(get(obj, valueField), value));
    }
  }

  getText(
    lookupKey: string,
    value: any,
    valueField: string,
    textField: string,
  ): string | undefined {
    const found = this.getByValue(lookupKey, value, valueField);
    if (found) {
      return get(found, textField);
    }
  }

  async fetchLookupData(
    key: AxiosRequestConfig | string,
    axiosConfig: AxiosRequestConfig = {},
  ): Promise<responseData | undefined> {
    let lookupKey: string | undefined;
    let config: AxiosRequestConfig = {};
    if (isString(key)) {
      lookupKey = key;
      config = {
        ...axiosConfig,
        url: key,
        method: axiosConfig.method || getConfig('lookupAxiosMethod') || 'post',
      };
    } else {
      config = key as AxiosRequestConfig;
      lookupKey = this.getKey(config);
    }
    if (lookupKey) {
      let data: responseData | undefined = this.get(lookupKey);
      // SSR do not fetch the lookup
      if (!data && typeof window !== 'undefined') {
        try {
          const pending: Promise<responseType> = this.pendings[lookupKey] || this.axios(config);
          this.pendings[lookupKey] = pending;
          const result: responseType = await pending;
          if (result) {
            data = generateResponseData(result, getConfig('dataKey'));
            this.set(lookupKey, data);
          }
          warning(!!data, `Lookup<${lookupKey}> is not exists`);
        } finally {
          delete this.pendings[lookupKey];
        }
      }
      return data;
    }
  }

  getAxiosConfig(field: Field): AxiosRequestConfig {
    const lookupAxiosConfig = field.get('lookupAxiosConfig');
    let config: AxiosRequestConfig = {};
    const { record } = field;
    const params = toJS(field.get('lookupPara')) || {};
    const cascadeMap = field.get('cascadeMap');
    if (cascadeMap && record) {
      Object.keys(cascadeMap).forEach(key => {
        params[key] = record.get(cascadeMap[key]);
      });
    }
    if (typeof lookupAxiosConfig === 'function') {
      const lookupCode = field.get('lookupCode');
      config = lookupAxiosConfig({ dataSet: field.dataSet, record, params, lookupCode });
    } else if (lookupAxiosConfig) {
      config = lookupAxiosConfig;
    }
    return {
      ...config,
      url: config.url || this.getUrl(field),
      method: config.method || getConfig('lookupAxiosMethod') || 'post',
      params: config.params || params,
    };
  }

  getKey(field: Field | AxiosRequestConfig): string | undefined {
    if (field instanceof Field) {
      return this.getKey(this.getAxiosConfig(field));
    }
    const { url, params, data } = field as AxiosRequestConfig;
    if (url) {
      return append(url, omitBy({ ...params, ...data }, value => value === ''));
    }
  }

  getUrl(field: Field): string | undefined {
    const type = field.get('type');
    const lovCode = field.get('lovCode');
    const lookupUrl = field.get('lookupUrl');
    const lookupCode = field.get('lookupCode');
    if (typeof lookupUrl === 'function' && lookupCode) {
      return lookupUrl(lookupCode);
    }
    if (isString(lookupUrl)) {
      return lookupUrl;
    }
    if (lovCode && type !== FieldType.object) {
      return lovCodeStore.getQueryUrl(lovCode, field);
    }
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      const lookupUrl = getConfig('lookupUrl');
      if (typeof lookupUrl === 'function') {
        codes.forEach(code => {
          this.lookupCodes.delete(lookupUrl(code));
          this.lookupCodes.delete(code);
        });
      } else {
        codes.forEach(code => this.lookupCodes.delete(code));
      }
    } else {
      this.lookupCodes.clear();
    }
  }
}

export default new LookupCodeStore();
