export type Config = {
  prefixCls?: string;
  ripple?: boolean;
}

const globalConfig: Config = {
  prefixCls: 'c7n',
  ripple: true,
};

export function getPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${globalConfig.prefixCls}-${suffixCls}`;
}

export function getConfig(key) {
  return globalConfig[key];
}

export default function configure(config: Config) {
  Object.assign(globalConfig, config);
}
