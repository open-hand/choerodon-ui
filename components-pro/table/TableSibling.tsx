import React, { FunctionComponent, useCallback, useContext } from 'react';
import { action } from 'mobx';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { TableBoxSizing } from './enum';
import TableContext from './TableContext';

export interface TableSiblingProps {
  prefixCls?: string;
  position: 'before' | 'after';
  boxSizing?: TableBoxSizing;
}

const TableSibling: FunctionComponent<TableSiblingProps> = function TableSibling(props) {
  const { position, boxSizing, children } = props;
  const { tableStore } = useContext(TableContext);
  const handleResize = useCallback(action((_: number, height: number) => {
    tableStore.siblingHeihgt = {
      ...tableStore.siblingHeihgt,
      [position]: height,
    };
  }), [tableStore, position]);
  if (boxSizing === TableBoxSizing.wrapper) {
    return (
      <ReactResizeObserver resizeProp="height" onResize={handleResize}>
        <div className={`${tableStore.prefixCls}-sibling`}>
          {children}
        </div>
      </ReactResizeObserver>
    );
  }
  return (
    <>{children}</>
  );
};

TableSibling.displayName = 'TableSibling';

export default TableSibling;
