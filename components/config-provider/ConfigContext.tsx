import { getContext, Symbols } from 'choerodon-ui/shared';
import { getConfig, getCustomizable, getPrefixCls, getProPrefixCls } from '../configure/utils';
import { getTooltip, getTooltipTheme, getTooltipPlacement } from '../_util/TooltipUtils';

export interface ConfigContextValue {
  getConfig: typeof getConfig;

  getPrefixCls: typeof getPrefixCls;

  getProPrefixCls: typeof getProPrefixCls;

  getCustomizable: typeof getCustomizable;

  getTooltip: typeof getTooltip;

  getTooltipTheme: typeof getTooltipTheme;

  getTooltipPlacement: typeof getTooltipPlacement;
}

const ConfigContext = getContext<ConfigContextValue>(Symbols.ConfigContext, {
  getConfig,
  getPrefixCls,
  getProPrefixCls,
  getCustomizable,
  getTooltip,
  getTooltipTheme,
  getTooltipPlacement,
});

export default ConfigContext;
