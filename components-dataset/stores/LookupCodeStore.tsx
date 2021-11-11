import { action } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import { getConfig } from '../configure';
import axios from '../axios';
import Field from '../data-set/Field';
import Record from '../data-set/Record';
import lovCodeStore from './LovCodeStore';
import { FieldType } from '../data-set/enum';
import { generateResponseData } from '../data-set/utils';
import { getGlobalConfig, getLovPara, processAxiosConfig } from './utils';
import cacheAdapterEnhancer from '../axios/cacheAdapterEnhancer';
import throttleAdapterEnhancer from '../axios/throttleAdapterEnhancer';
import PromiseMerger from '../promise-merger';

const adapter = throttleAdapterEnhancer(cacheAdapterEnhancer(axios.defaults.adapter!));
const noCacheAdapter = throttleAdapterEnhancer(axios.defaults.adapter!);

export type responseData = object[];
export type responseType = responseData | undefined;

type callbackArgs = [(codes: string[]) => AxiosRequestConfig, Field | undefined];

export class LookupCodeStore {
  getAxios(field?: Field): AxiosInstance {
    return getGlobalConfig('axios', field) || axios;
  }

  batchCallback = (codes: string[], args?: callbackArgs): Promise<{ [key: string]: responseData }> => {
    if (args) {
      const [lookupBatchAxiosConfig, field] = args;
      if (lookupBatchAxiosConfig) {
        return this.getAxios(field)(lookupBatchAxiosConfig(codes)) as any;
      }
    }
    return Promise.resolve({});
  };

  merger: PromiseMerger<responseData, callbackArgs> = new PromiseMerger<responseData, callbackArgs>(
    this.batchCallback,
    getConfig('lookupCache'),
  );

  fetchLookupData(
    key: AxiosRequestConfig | string,
    axiosConfig: AxiosRequestConfig = {},
    field?: Field,
  ): Promise<responseType> {
    let config: AxiosRequestConfig = {};
    if (isString(key)) {
      config = {
        ...axiosConfig,
        url: key,
        method: axiosConfig.method || getGlobalConfig('lookupAxiosMethod', field) || 'post',
      };
    } else {
      config = key as AxiosRequestConfig;
    }
    if (config.url) {
      // SSR do not fetch the lookup
      if (typeof window !== 'undefined') {
        return this.getAxios(field)(config).then((result) => {
          if (result) {
            return generateResponseData(result, getGlobalConfig('dataKey', field));
          }
        });
      }
    }
    return Promise.resolve<responseType>(undefined);
  }

  fetchLookupDataInBatch(code: string, lookupBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig, field?: Field): Promise<responseType> {
    const getBatchKey = (defaultKey) => {
      const { url } = lookupBatchAxiosConfig([code]);
      return url ? url.split('?')[0] : defaultKey;
    };
    return this.merger.add(code, getBatchKey, [lookupBatchAxiosConfig, field]);
  }

  getAxiosConfig(field: Field, record?: Record | undefined, noCache?: boolean): AxiosRequestConfig {
    const lookupAxiosConfig = field.get('lookupAxiosConfig', record) || field.dataSet.getConfig('lookupAxiosConfig');
    const params = getLovPara(field, record);
    const config = processAxiosConfig(lookupAxiosConfig, {
      dataSet: field.dataSet,
      record,
      params,
      lookupCode: field.get('lookupCode', record),
    });
    return {
      ...config,
      adapter: config.adapter || (noCache ? noCacheAdapter : adapter),
      url: config.url || this.getUrl(field, record),
      method: config.method || field.dataSet.getConfig('lookupAxiosMethod') || 'post',
      params: config.params || params,
    };
  }

  getUrl(field: Field, record?: Record | undefined): string | undefined {
    const type = field.get('type', record);
    const lovCode = field.get('lovCode', record);
    const lookupUrl = field.get('lookupUrl', record);
    const lookupCode = field.get('lookupCode', record);
    if (typeof lookupUrl === 'function' && lookupCode) {
      return lookupUrl(lookupCode);
    }
    if (isString(lookupUrl)) {
      return lookupUrl;
    }
    if (lovCode && type !== FieldType.object) {
      return lovCodeStore.getQueryAxiosConfig(lovCode, field, undefined, record)({ dataSet: field.dataSet }).url;
    }
  }

  /** @deprecated */
  @action
  clearCache() {
    // noop
  }
}

export default new LookupCodeStore();
