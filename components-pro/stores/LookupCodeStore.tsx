import { action } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import { getConfig } from 'choerodon-ui/lib/configure';
import axios from '../axios';
import Field from '../data-set/Field';
import lovCodeStore from './LovCodeStore';
import { FieldType } from '../data-set/enum';
import { generateResponseData } from '../data-set/utils';
import { getLovPara, processAxiosConfig } from './utils';
import cacheAdapterEnhancer from '../axios/cacheAdapterEnhancer';
import throttleAdapterEnhancer from '../axios/throttleAdapterEnhancer';
import PromiseMerger from '../_util/PromiseMerger';

const adapter = throttleAdapterEnhancer(cacheAdapterEnhancer(axios.defaults.adapter!));
const noCacheAdapter = throttleAdapterEnhancer(axios.defaults.adapter!);

export type responseData = object[];
export type responseType = responseData | undefined;

type callbackArgs = [(codes: string[]) => AxiosRequestConfig];

export class LookupCodeStore {
  get axios(): AxiosInstance {
    return getConfig('axios') || axios;
  }

  batchCallback = (codes: string[], args?: callbackArgs): Promise<{ [key: string]: responseData }> => {
    if (args) {
      const [lookupBatchAxiosConfig] = args;
      if (lookupBatchAxiosConfig) {
        return this.axios(lookupBatchAxiosConfig(codes)) as any;
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
  ): Promise<responseType> {
    let config: AxiosRequestConfig = {};
    if (isString(key)) {
      config = {
        ...axiosConfig,
        url: key,
        method: axiosConfig.method || getConfig('lookupAxiosMethod') || 'post',
      };
    } else {
      config = key as AxiosRequestConfig;
    }
    if (config.url) {
      // SSR do not fetch the lookup
      if (typeof window !== 'undefined') {
        return this.axios(config).then((result) => {
          if (result) {
            return generateResponseData(result, getConfig('dataKey'));
          }
        });
      }
    }
    return Promise.resolve<responseType>(undefined);
  }

  fetchLookupDataInBatch(code: string, lookupBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig): Promise<responseType> {
    const getBatchKey = (defaultKey) => {
      const { url } = lookupBatchAxiosConfig([code]);
      return url ? url.split('?')[0] : defaultKey;
    };
    return this.merger.add(code, getBatchKey, [lookupBatchAxiosConfig]);
  }

  getAxiosConfig(field: Field, noCache?: boolean): AxiosRequestConfig {
    const lookupAxiosConfig = field.get('lookupAxiosConfig') || getConfig('lookupAxiosConfig');
    const { record } = field;
    const params = getLovPara(field, record);
    const config = processAxiosConfig(lookupAxiosConfig, {
      dataSet: field.dataSet,
      record,
      params,
      lookupCode: field.get('lookupCode'),
    });
    return {
      ...config,
      adapter: config.adapter || (noCache ? noCacheAdapter : adapter),
      url: config.url || this.getUrl(field),
      method: config.method || getConfig('lookupAxiosMethod') || 'post',
      params: config.params || params,
    };
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
      return lovCodeStore.getQueryAxiosConfig(lovCode, field)({ dataSet: field.dataSet }).url;
    }
  }

  // @deprecate
  @action
  clearCache() {
  }
}

export default new LookupCodeStore();
