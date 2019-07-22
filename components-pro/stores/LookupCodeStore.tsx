import { action, get, observable, ObservableMap } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import axios from '../axios';
import Field from '../data-set/Field';
import lovCodeStore from './LovCodeStore';
import { FieldType } from '../data-set/enum';
import { isSameLike } from '../data-set/utils';
import { getConfig } from 'choerodon-ui/lib/configure';

export type responseData = object[];
export type responseType = responseData | undefined;

export class LookupCodeStore {

  @observable lookupCodes: ObservableMap<string, responseData>;

  pendings: { [key: string]: Promise<responseType> } = {};

  get axios(): AxiosInstance {
    return getConfig('axios') || axios;
  }

  constructor() {
    this.init();
  }

  @action
  init() {
    this.lookupCodes = observable.map<string, responseData>();
  }

  get(lookupKey: string): responseData | undefined {
    return this.lookupCodes.get(lookupKey);
  }

  @action
  set(lookupKey: string, data: responseData | undefined) {
    if (data) {
      this.lookupCodes.set(lookupKey, data);
    }
  }

  getByValue(lookupKey: string, value: any, valueField: string): object | undefined {
    const lookup = this.get(lookupKey);
    if (lookup) {
      return lookup.find(obj => isSameLike(get(obj, valueField), value));
    }
  }

  getText(lookupKey: string, value: any, valueField: string, textField: string): string | undefined {
    const found = this.getByValue(lookupKey, value, valueField);
    if (found) {
      return get(found, textField);
    }
  }

  async fetchLookupData(lookupKey, axiosConfig: AxiosRequestConfig = {}): Promise<responseData | undefined> {
    let data: responseData | undefined = this.get(lookupKey);
    // SSR do not fetch the lookup
    if (!data && typeof window !== 'undefined') {
      try {
        const config = {
          ...axiosConfig,
          url: lookupKey,
          method: axiosConfig.method || getConfig('lookupAxiosMethod') || 'post',
        };
        const pending: Promise<responseType> = this.pendings[lookupKey] = this.pendings[lookupKey] || this.axios(config as AxiosRequestConfig);
        const result: responseType = await pending;
        if (result) {
          const { [getConfig<'dataKey'>('dataKey') || 'rows']: rows } = result as { [key: string]: any };
          if (rows) {
            data = rows;
          } else {
            data = result;
          }
          this.set(lookupKey, data);
        }
        warning(!!data, `Lookup<${lookupKey}> is not exists`);
      } finally {
        delete this.pendings[lookupKey];
      }
    }
    return data;
  }

  getKey(field: Field): string | undefined {
    const type = field.get('type');
    const lovCode = field.get('lovCode');
    const lookupUrl = field.get('lookupUrl');
    const lookupCode = field.get('lookupCode');
    if (typeof lookupUrl === 'function' && lookupCode) {
      return lookupUrl(lookupCode);
    } else if (isString(lookupUrl)) {
      return lookupUrl;
    }
    if (lovCode && type !== FieldType.object) {
      return lovCodeStore.getQueryUrl(lovCode);
    }
  }

  @action
  clearCache(codes?: string[]) {
    if (codes) {
      const lookupUrl = getConfig('lookupUrl');
      if (typeof lookupUrl === 'function') {
        codes.forEach(code => this.lookupCodes.delete(lookupUrl(code)));
      }
    } else {
      this.lookupCodes.clear();
    }
  }
}

export default new LookupCodeStore();
