import { observable, ObservableMap, runInAction } from 'mobx';

export type Config = {
  prefixCls?: string;
  ripple?: boolean;
  lookupUrl?: string | ((code: string) => string);
  lovDefineUrl?: string | ((code: string) => string);
  lovQueryUrl?: string | ((code: string) => string);
}

const globalConfig: ObservableMap<keyof Config, Config[keyof Config]> = observable.map<keyof Config, Config[keyof Config]>([
  ['prefixCls', 'c7n'],
  ['ripple', true],
  ['lookupUrl', code => `/common/code/${code}/`],
  ['lovDefineUrl', code => `/sys/lov/lov_define?code=${code}`],
  ['lovQueryUrl', code => `/common/lov/dataset/${code}`],
]);

export function getConfig(key: keyof Config): Config[keyof Config] {
  return globalConfig.get(key);
}

export function getPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${getConfig('prefixCls')}-${suffixCls}`;
}

export default function configure(config: Config) {
  runInAction(() => {
    Object.keys(config).forEach((key: keyof Config) => globalConfig.set(key, config[key]));
  });
}
