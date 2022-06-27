import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';
import { Size } from '../_util/enum';

export interface AvatarContextValue {
  size?: Size | number;

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface AvatarContextProviderProps extends AvatarContextValue {
  children?: ReactNode;
}

const AvatarContext = getContext<AvatarContextValue>(Symbols.AvatarContext, { getPrefixCls });

const BaseAvatarContextProvider: FunctionComponent<AvatarContextProviderProps> = function AvatarContextProvider(props) {
  const { children, size, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    size,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, size]);
  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
};

BaseAvatarContextProvider.displayName = 'AvatarContextProvider';

export const AvatarContextProvider = memo(BaseAvatarContextProvider);

export default AvatarContext;
