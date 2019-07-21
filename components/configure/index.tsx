import { observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ReactNode } from 'react';
import { LovConfig } from 'components-pro/lov/Lov';

export type Config = {
  prefixCls?: string;
  proPrefixCls?: string;
  ripple?: boolean;
  lookupUrl?: string | ((code: string) => string);
  lookupAxiosMethod?: string;
  lovDefineUrl?: string | ((code: string) => string);
  lovDefineAxiosConfig?: (code: string) => AxiosRequestConfig;
  lovQueryUrl?: string | ((code: string, lovConfig?: LovConfig) => string);
  lovQueryAxiosConfig?: (code: string, lovConfig?: LovConfig) => AxiosRequestConfig;
  axios?: AxiosInstance;
  dataKey?: string;
  totalKey?: string;
  labelLayout?: string;
  queryBar?: string;
  tableBorder?: boolean;
  tableHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number;
  tableColumnResizable?: boolean;
  modalSectionBorder?: boolean;
  modalOkFirst?: boolean;
  buttonFuncType?: string;
  renderEmpty?: (componentName?: string) => ReactNode;
  generatePageQuery?: (pageParams: { page: number, pageSize: number }) => object;
}

export type ConfigKeys = keyof Config;

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys, Config[ConfigKeys]>([
  ['prefixCls', 'c7n'],
  ['proPrefixCls', 'c7n-pro'],
  ['ripple', true],
  ['lookupUrl', code => `/common/code/${code}/`],
  ['lookupAxiosMethod', 'post'],
  ['lovDefineUrl', code => `/sys/lov/lov_define?code=${code}`],
  ['lovQueryUrl', code => `/common/lov/dataset/${code}`],
  ['dataKey', 'rows'],
  ['totalKey', 'total'],
  ['labelLayout', 'horizontal'],
  ['queryBar', 'normal'],
  ['tableBorder', true],
  ['tableHighLightRow', true],
  ['tableRowHeight', 30],
  ['tableColumnResizable', true],
  ['modalSectionBorder', true],
  ['modalOkFirst', true],
]);

export function getConfig<T extends ConfigKeys>(key: T): Config[T] {
  return globalConfig.get(key);
}

export function getPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${getConfig('prefixCls')}-${suffixCls}`;
}

export function getProPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${getConfig('proPrefixCls')}-${suffixCls}`;
}

export default function configure(config: Config) {
  runInAction(() => {
    Object.keys(config).forEach((key: keyof Config) => globalConfig.set(key, config[key]));
  });
}
