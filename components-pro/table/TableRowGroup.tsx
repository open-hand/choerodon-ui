import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import ColumnGroups from './ColumnGroups';
import TableContext from './TableContext';
import { isStickySupport } from './utils';

export interface TableRowGroupProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
  children?: ReactNode;
}

const TableRowGroup: FunctionComponent<TableRowGroupProps> = function TableRowGroup(props) {
  const { prefixCls, tableStore } = useContext(TableContext);
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
  const Cmp = tableStore.parityRow ? 'div' : 'tr';
  return (
    <Cmp className={`${prefixCls}-row-group`} style={isStickySupport() ? undefined : { height: pxToRem(25) }}>
      <td colSpan={colSpan} className={`${prefixCls}-row-group-title`}>
        {
          lock !== ColumnLock.right && (
            <div className={`${prefixCls}-row-group-title-content`}>{children}</div>
          )
        }
      </td>
    </Cmp>
  );
};

TableRowGroup.displayName = 'TableRowGroup';

export default TableRowGroup;
