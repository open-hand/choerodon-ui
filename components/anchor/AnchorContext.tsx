import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';
import { C7NAnchor } from './Anchor';

export interface AnchorContextValue {
  c7nAnchor?: C7NAnchor;

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface AnchorContextProviderProps extends AnchorContextValue {
  children?: ReactNode;
}

const AnchorContext = getContext<AnchorContextValue>(Symbols.AnchorContext, { getPrefixCls });

const BaseAnchorContextProvider: FunctionComponent<AnchorContextProviderProps> = function AnchorContextProvider(props) {
  const { children, c7nAnchor, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    c7nAnchor,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, c7nAnchor]);
  return (
    <AnchorContext.Provider value={value}>
      {children}
    </AnchorContext.Provider>
  );
};

BaseAnchorContextProvider.displayName = 'AnchorContextProvider';

export const AnchorContextProvider = memo(BaseAnchorContextProvider);

export default AnchorContext;
