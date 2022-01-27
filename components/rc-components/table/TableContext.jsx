import React, { memo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';

const TableContext = getContext(Symbols.TableContext, {});

const BaseTableContextProvider = function BaseTableContextProvider(props) {
  const { children, ...value } = props;
  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};

BaseTableContextProvider.displayName = 'TableContextProvider';

export const TableContextProvider = memo(BaseTableContextProvider);

export default TableContext;
