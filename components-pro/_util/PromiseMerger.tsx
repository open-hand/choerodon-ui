import { action, IReactionDisposer, toJS } from 'mobx';
import Cache, { refreshCacheOptions } from './Cache';

export default class PromiseMerger<V> {
  timeout: number;

  cache: Cache<string, V>;

  promiseList: { [key: string]: { resolves: Function[]; rejects: Function[] } } = {};

  waitID;

  callback: (codes) => Promise<{ [key: string]: V }>;

  reaction: IReactionDisposer;

  constructor(callback: (codes) => Promise<{ [key: string]: V }>, config, timeout: number = 200) {
    this.timeout = timeout;
    const lookupCache = toJS(config);
    this.cache = new Cache<string, V>(lookupCache);
    this.callback = callback;
    this.reaction = refreshCacheOptions(this.cache);
  }

  dispose() {
    this.reaction();
  }

  @action
  add(code: string): Promise<V> {
    const { cache, promiseList } = this;
    const item = cache.get(code);
    if (item) {
      return Promise.resolve(item);
    }
    return new Promise<V>((resolve, reject) => {
      let promise = promiseList[code];
      const resolveCallback = () => {
        resolve(cache.get(code));
      };
      const rejectCallback = () => {
        reject();
      };
      if (promise) {
        promise.resolves.push(resolveCallback);
        promise.rejects.push(rejectCallback);
      } else {
        if (this.waitID) {
          clearTimeout(this.waitID);
        }
        promise = {
          resolves: [resolveCallback],
          rejects: [rejectCallback],
        };
        this.promiseList[code] = promise;
        this.waitID = setTimeout(() => {
          const codeList: string[] = Object.keys(promiseList);
          const memo = { ...promiseList };
          this.promiseList = {};

          if (process.env.LOGGER_LEVEL === 'info') {
            // eslint-disable-next-line no-console
            console.info(`batch request: ${codeList}`);
          }
          this.callback(codeList)
            .then(res => {
              codeList.forEach(key => {
                const data = res[key];
                const { resolves = [] } = memo[key] || {};
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
