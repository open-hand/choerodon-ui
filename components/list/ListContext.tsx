import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import DataSet from 'choerodon-ui/pro/lib/data-set';
import { getPrefixCls } from '../configure/utils';
import { ListGridType, RowSelection } from './index';

export interface ListContextValue {
  grid?: ListGridType;
  rowSelection?: RowSelection;
  selectionDataSet?: DataSet;
  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface ListContextProviderProps extends ListContextValue {
  children?: ReactNode;
}

const ListContext = getContext<ListContextValue>(Symbols.ListContext, { getPrefixCls });

const BaseListContextProvider: FunctionComponent<ListContextProviderProps> = function ListContextProvider(props) {
  const { children, grid, rowSelection, selectionDataSet, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    grid,
    rowSelection,
    selectionDataSet,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, grid, rowSelection, selectionDataSet]);
  return (
    <ListContext.Provider value={value}>
      {children}
    </ListContext.Provider>
  );
};

BaseListContextProvider.displayName = 'ListContextProvider';

export const ListContextProvider = memo(BaseListContextProvider);

export default ListContext;
