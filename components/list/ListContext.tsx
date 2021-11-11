import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';
import { ListGridType } from './index';

export interface ListContextValue {
  grid?: ListGridType;

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface ListContextProviderProps extends ListContextValue {
  children?: ReactNode;
}

const ListContext = getContext<ListContextValue>(Symbols.ListContext, { getPrefixCls });

const BaseListContextProvider: FunctionComponent<ListContextProviderProps> = function ListContextProvider(props) {
  const { children, grid, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    grid,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, grid]);
  return (
    <ListContext.Provider value={value}>
      {children}
    </ListContext.Provider>
  );
};

BaseListContextProvider.displayName = 'ListContextProvider';

export const ListContextProvider = memo(BaseListContextProvider);

export default ListContext;
