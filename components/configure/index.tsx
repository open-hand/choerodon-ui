import { observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance } from 'axios';
import { ReactNode } from 'react';

export type Config = {
  prefixCls?: string;
  proPrefixCls?: string;
  ripple?: boolean;
  lookupUrl?: string | ((code: string) => string);
  lookupAxiosMethod?: string;
  lovDefineUrl?: string | ((code: string) => string);
  lovQueryUrl?: string | ((code: string) => string);
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

export function getConfig<T extends ConfigKeys>(key: T): any {
  // FIXME: observable.map把构建map时传入的key类型和value类型分别做了union，
  // 丢失了一一对应的映射关系，导致函数调用者无法使用union后的返回值类型，因此需要指定本函数返回值为any
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
