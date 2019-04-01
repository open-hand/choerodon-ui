export type Config = {
  prefixCls?: string;
}

const globalConfig: Config = {
  prefixCls: 'c7n',
};

export function getPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${globalConfig.prefixCls}-${suffixCls}`;
}

export default function configure(config: Config) {
  Object.assign(globalConfig, config);
}
