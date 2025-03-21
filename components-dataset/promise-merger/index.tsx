import { action, IReactionDisposer, toJS } from 'mobx';
import isNil from 'lodash/isNil';
import Cache, { refreshCacheOptions } from '../cache';

// key 为 lookupCode
export type BatchParaType = { [key: string]: object };

const KEY = Symbol('KEY');

export default class PromiseMerger<K, ARGS, V> {
  timeout: number;

  cache: Cache<string, K>;

  dataMap: Map<string, V>;

  batchParaMap: Map<string, object>;

  promiseMap: Map<string | symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>;

  waitID;

  callback: (codes: string[], args: ARGS, dataList: V[], batchParaObj: BatchParaType) => Promise<{ [key: string]: K }>;

  reaction: IReactionDisposer;

  constructor(callback: (codes: string[], args: ARGS, dataList: V[], batchParaObj: BatchParaType) => Promise<{ [key: string]: K }>, config, timeout = 200) {
    this.timeout = timeout;
    this.promiseMap = new Map<string | symbol, Map<string, { resolves: Function[]; rejects: Function[] }>>();
    this.cache = new Cache<string, K>(toJS(config));
    this.dataMap = new Map<string, V>();
    this.batchParaMap = new Map<string, object>();
    this.callback = callback;
    this.reaction = refreshCacheOptions(this.cache);
  }

  dispose() {
    this.reaction();
  }

  @action
  add(code: string, getBatchKey: ((defaultKey: symbol) => string | symbol) | undefined, args: ARGS, data?: V, batchPara?: object): Promise<K> {
    const { cache, promiseMap, dataMap, batchParaMap } = this;
    const item = cache.get(code);
    if (item !== undefined) {
      return Promise.resolve(item);
    }
    if (data) {
      dataMap.set(code, data);
    }
    if (batchPara) {
      batchParaMap.set(code, batchPara);
    }
    const batchKey = getBatchKey ? getBatchKey(KEY) : KEY;
    return new Promise<K>((resolve, reject) => {
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
          const batchParaObj: BatchParaType = codeList.reduce<BatchParaType>((obj, code) => {
            const value = batchParaMap.get(code);
            if (!isNil(value)) {
              obj[code] = value;
            }
            return obj;
          }, {});

          if (process.env.LOGGER_LEVEL === 'info') {
            // eslint-disable-next-line no-console
            console.info(`batch request: ${codeList}`);
          }
          this.callback(
            codeList,
            args,
            codeList.reduce<V[]>(
              (list, $code) => {
                const $value = dataMap.get($code);
                if ($value !== undefined) {
                  list.push($value);
                }
                return list;
              },
              []),
            batchParaObj,
          ).then(res => {
            codeList.forEach((key) => {
              this.batchParaMap.delete(key);
              const value = promiseList.get(key);
              promiseList.delete(key);
              const { resolves = [] } = value || {};
              if (res) {
                const data = res[key];
                this.cache.set(key, data);
                resolves.forEach(r => r(data));
              } else {
                resolves.forEach(r => r());
              }
            });
          })
            .catch(error => {
              codeList.forEach(key => {
                this.batchParaMap.delete(key);
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
