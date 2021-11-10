import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import { getConfig as getDataSetConfig } from 'choerodon-ui/dataset';
import { Config, Customizable, DefaultConfig } from './index';

export function isCustomizable(target: boolean | Customizable | undefined): target is Customizable {
  return isObject(target);
}

export function getConfig<T extends keyof Config>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
  return getDataSetConfig<Config, T, DefaultConfig>(key);
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

export function getCustomizable<T extends keyof Customizable>(component: T): boolean | undefined {
  const customizable = getConfig('customizable');
  if (isBoolean(customizable)) {
    return customizable;
  }
  if (isCustomizable(customizable)) {
    return customizable[component];
  }
}
