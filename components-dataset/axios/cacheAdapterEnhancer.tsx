import { AxiosAdapter, AxiosPromise } from 'axios';
import { toJS } from 'mobx';
import { getConfig } from '../configure';
import Cache, { refreshCacheOptions } from '../cache';
import { buildURLWithAxiosConfig, isCacheLike } from './utils';

export interface ICacheLike<T> {
  get(key: string): T | undefined;

  set(key: string, value: T, maxAge?: number): boolean;

  del(key: string): void;
}

export type Options = {
  enabledByDefault?: boolean;
  cacheFlag?: string;
  defaultCache?: ICacheLike<AxiosPromise>;
};

function getDefaultCache() {
  const lookupCache = toJS(getConfig('lookupCache'));
  const cache = new Cache<string, AxiosPromise>(lookupCache);
  refreshCacheOptions(cache);
  return cache;
}

export default function cacheAdapterEnhancer(
  adapter: AxiosAdapter,
  options: Options = {},
): AxiosAdapter {
  const {
    enabledByDefault = true,
    cacheFlag = 'cache',
    defaultCache = getDefaultCache(),
  } = options;

  return config => {
    const useCache =
      config[cacheFlag] !== undefined && config[cacheFlag] !== null
        ? config[cacheFlag]
        : enabledByDefault;
    if (useCache) {
      const cache: ICacheLike<AxiosPromise> = isCacheLike(useCache) ? useCache : defaultCache;
      const index = buildURLWithAxiosConfig(config);
      let responsePromise = cache.get(index);

      if (!responsePromise) {
        responsePromise = (async () => {
          try {
            return await adapter(config);
          } catch (reason) {
            cache.del(index);
            throw reason;
          }
        })();

        if (process.env.LOGGER_LEVEL === 'info') {
          // eslint-disable-next-line no-console
          console.info(`request: ${index}`);
        }
        cache.set(index, responsePromise);

        return responsePromise;
      }

      if (process.env.LOGGER_LEVEL === 'info') {
        // eslint-disable-next-line no-console
        console.info(`request cached by cache adapter: ${index}`);
      }

      return responsePromise;
    }

    return adapter(config);
  };
}
