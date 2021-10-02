import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { ColumnLock } from './enum';
import ColumnGroups from './ColumnGroups';
import TableContext from './TableContext';

export interface TableGroupTitleProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
  children?: ReactNode;
}

const TableGroupTitle: FunctionComponent<TableGroupTitleProps> = function TableGroupTitle(props) {
  const { prefixCls } = useContext(TableContext);
  const { lock, columnGroups, children } = props;
  const colSpan = (() => {
    switch (lock) {
      case ColumnLock.left:
        return columnGroups.leftLeafs.length;
      case ColumnLock.right:
        return columnGroups.rightLeafs.length;
      default:
        return columnGroups.allLeafs.length;
    }
  })();
  return (
    <tr>
      <td colSpan={colSpan} className={`${prefixCls}-group-title`}>
        {
          lock !== ColumnLock.right && (
            <div className={`${prefixCls}-group-title-content`}>{children}</div>
          )
        }
      </td>
    </tr>
  );
};

TableGroupTitle.displayName = 'TableGroupTitle';

export default TableGroupTitle;
