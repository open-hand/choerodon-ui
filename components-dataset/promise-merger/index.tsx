import { action, IReactionDisposer, toJS } from 'mobx';
import Cache, { refreshCacheOptions } from '../cache';

const KEY = Symbol('KEY');

export default class PromiseMerger<V, ARGS> {
  timeout: number;

  cache: Cache<string, V>;

  promiseMap: Map<string | symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>;

  waitID;

  callback: (codes: string[], args?: ARGS) => Promise<{ [key: string]: V }>;

  reaction: IReactionDisposer;

  constructor(callback: (codes: string[], args?: ARGS) => Promise<{ [key: string]: V }>, config, timeout = 200) {
    this.timeout = timeout;
    this.promiseMap = new Map<string | symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>();
    this.cache = new Cache<string, V>(toJS(config));
    this.callback = callback;
    this.reaction = refreshCacheOptions(this.cache);
  }

  dispose() {
    this.reaction();
  }

  @action
  add(code: string, getBatchKey?: (defaultKey: symbol) => string | symbol, args?: ARGS): Promise<V> {
    const { cache, promiseMap } = this;
    const item = cache.get(code);
    if (item) {
      return Promise.resolve(item);
    }
    const batchKey = getBatchKey ? getBatchKey(KEY) : KEY;
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
          const codeList: string[] = Array.from(promiseList.keys());

          if (process.env.LOGGER_LEVEL === 'info') {
            // eslint-disable-next-line no-console
            console.info(`batch request: ${codeList}`);
          }
          this.callback(codeList, args)
            .then(res => {
              codeList.forEach((key) => {
                const value = promiseList.get(key);
                const data = res[key];
                this.cache.set(key, data);
                promiseList.delete(key);
                const { resolves = [] } = value || {};
                resolves.forEach(r => r(data));
              });
            })
            .catch(error => {
              codeList.forEach(key => {
                const value = promiseList.get(key);
                promiseList.delete(key);
                const { rejects = [] } = value || {};
                rejects.forEach(r => r(error));
              });
            });
        }, this.timeout);
      }
    });
  }
}
