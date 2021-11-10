import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';

export interface LayoutSiderContextValue {
  siderCollapsed?: boolean;
  collapsedWidth?: number | string;

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface LayoutSiderContextProviderProps extends LayoutSiderContextValue {
  children?: ReactNode;
}

const LayoutSiderContext = getContext<LayoutSiderContextValue>(Symbols.LayoutSiderContext, { getPrefixCls });

const BaseLayoutSiderContextProvider: FunctionComponent<LayoutSiderContextProviderProps> = function LayoutSiderContextProvider(props) {
  const { children, siderCollapsed, collapsedWidth, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    siderCollapsed,
    collapsedWidth,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, siderCollapsed, collapsedWidth]);
  return (
    <LayoutSiderContext.Provider value={value}>
      {children}
    </LayoutSiderContext.Provider>
  );
};

BaseLayoutSiderContextProvider.displayName = 'LayoutSiderContextProvider';

export const LayoutSiderContextProvider = memo(BaseLayoutSiderContextProvider);

export default LayoutSiderContext;
