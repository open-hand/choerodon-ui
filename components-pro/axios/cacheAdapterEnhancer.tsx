import { AxiosAdapter, AxiosPromise } from 'axios';
import Cache from '../_util/Cache';
import { buildURLWithData, isCacheLike } from './utils';

const FIVE_MINUTES = 1000 * 60 * 10;
const CAPACITY = 100;

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

export default function cacheAdapterEnhancer(
  adapter: AxiosAdapter,
  options: Options = {},
): AxiosAdapter {
  const {
    enabledByDefault = true,
    cacheFlag = 'cache',
    defaultCache = new Cache<string, AxiosPromise>({ maxAge: FIVE_MINUTES, max: CAPACITY }),
  } = options;

  return config => {
    const { url, params, paramsSerializer, data } = config;
    const useCache =
      config[cacheFlag] !== undefined && config[cacheFlag] !== null
        ? config[cacheFlag]
        : enabledByDefault;
    if (useCache) {
      const cache: ICacheLike<AxiosPromise> = isCacheLike(useCache) ? useCache : defaultCache;
      const index = buildURLWithData(data, url, params, paramsSerializer);
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
