import { action, IReactionDisposer, toJS } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import Cache, { refreshCacheOptions } from './Cache';

const KEY = Symbol('KEY');

export default class PromiseMerger<V> {
  timeout: number;

  cache: Cache<string, V>;

  promiseMap: Map<string | Symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>;

  waitID;

  callback: (codes: string[], lookupBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig) => Promise<{ [key: string]: V }>;

  reaction: IReactionDisposer;

  constructor(callback: (codes: string[], lookupBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig) => Promise<{ [key: string]: V }>, config, timeout: number = 200) {
    this.timeout = timeout;
    this.promiseMap = new Map<string | Symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>();
    this.cache = new Cache<string, V>(toJS(config));
    this.callback = callback;
    this.reaction = refreshCacheOptions(this.cache);
  }

  dispose() {
    this.reaction();
  }

  @action
  add(code: string, lookupBatchAxiosConfig: (codes: string[]) => AxiosRequestConfig): Promise<V> {
    const { cache, promiseMap } = this;
    const item = cache.get(code);
    if (item) {
      return Promise.resolve(item);
    }
    const { url } = lookupBatchAxiosConfig([code]);
    const batchKey = url ? url.split('?')[0] : KEY;
    return new Promise<V>((resolve, reject) => {
      const promiseList = promiseMap.get(batchKey) || new Map();
      promiseMap.set(batchKey, promiseList);
      let promise = promiseList.get(code);

      const resolveCallback = () => {
        resolve(cache.get(code));
      };
      if (promise) {
        promise.resolves.push(resolveCallback);
        promise.rejects.push(reject);
      } else {
        if (this.waitID) {
          clearTimeout(this.waitID);
        }
        promise = {
          resolves: [resolveCallback],
          rejects: [reject],
        };
        promiseList.set(code, promise);
        this.waitID = setTimeout(() => {
          const codeList: string[] = [...promiseList.keys()];
          const memo = [...promiseList.entries()];
          promiseList.clear();

          if (process.env.LOGGER_LEVEL === 'info') {
            // eslint-disable-next-line no-console
            console.info(`batch request: ${codeList}`);
          }
          this.callback(codeList, lookupBatchAxiosConfig)
            .then(res => {
              memo.forEach(([key, value]) => {
                const data = res[key];
                const { resolves = [] } = value || {};
                this.cache.set(key, data);
                resolves.forEach(r => r(data));
              });
            })
            .catch(error => {
              codeList.forEach(key => {
                const { rejects = [] } = memo[key] || {};
                rejects.forEach(r => r(error));
              });
            });
        }, this.timeout);
      }
    });
  }
}
