import { AxiosAdapter, AxiosPromise, AxiosRequestConfig } from 'axios';
import Cache from '../_util/Cache';
import { ICacheLike } from './cacheAdapterEnhancer';
import { buildURLWithData } from './utils';

export type RecordedCache = {
  timestamp: number;
  value?: AxiosPromise;
};

export type Options = {
  threshold?: number;
  cache?: ICacheLike<RecordedCache>;
};

export default function throttleAdapterEnhancer(
  adapter: AxiosAdapter,
  options: Options = {},
): AxiosAdapter {
  const { threshold = 1000, cache = new Cache<string, RecordedCache>({ max: 10 }) } = options;

  const recordCacheWithRequest = (index: string, config: AxiosRequestConfig) => {
    const responsePromise = (async () => {
      try {
        const response = await adapter(config);
        cache.set(index, {
          timestamp: Date.now(),
          value: Promise.resolve(response),
        });
        return response;
      } catch (reason) {
        cache.del(index);
        throw reason;
      }
    })();

    cache.set(index, {
      timestamp: Date.now(),
      value: responsePromise,
    });

    return responsePromise;
  };

  return config => {
    const { url, params, paramsSerializer, data } = config;
    const index = buildURLWithData(data, url, params, paramsSerializer);
    const now = Date.now();
    const cachedRecord = cache.get(index) || { timestamp: now };
    if (now - cachedRecord.timestamp <= threshold) {
      const responsePromise = cachedRecord.value;
      if (responsePromise) {
        if (process.env.LOGGER_LEVEL === 'info') {
          // eslint-disable-next-line no-console
          console.info(`request cached by throttle adapter: ${index}`);
        }
        return responsePromise;
      }
    }

    return recordCacheWithRequest(index, config);
  };
}
