import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';

export interface LayoutContextValue {
  siderHook?: {
    addSider: (id: string) => void,
    removeSider: (id: string) => void;
  };

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface LayoutContextProviderProps extends LayoutContextValue {
  children?: ReactNode;
}

const LayoutContext = getContext<LayoutContextValue>(Symbols.LayoutContext, { getPrefixCls });

const BaseLayoutContextProvider: FunctionComponent<LayoutContextProviderProps> = function LayoutContextProvider(props) {
  const { children, siderHook, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    siderHook,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, siderHook]);
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

BaseLayoutContextProvider.displayName = 'LayoutContextProvider';

export const LayoutContextProvider = memo(BaseLayoutContextProvider);

export default LayoutContext;
