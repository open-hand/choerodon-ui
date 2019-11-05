import { AxiosAdapter, AxiosPromise } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import { reaction } from 'mobx';
import Cache from '../_util/Cache';
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
  const cache = new Cache<string, AxiosPromise>(getConfig('lookupCache'));

  reaction(
    () => getConfig('lookupCache'),
    (lookupCache = {}) => {
      if ('max' in lookupCache) {
        cache.max = lookupCache.max;
      }
      if ('maxAge' in lookupCache) {
        cache.maxAge = lookupCache.maxAge;
      }
      if ('stale' in lookupCache) {
        cache.allowStale = lookupCache.stale;
      }
      if ('length' in lookupCache) {
        cache.lengthCalculator = lookupCache.length;
      }
    },
  );

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
