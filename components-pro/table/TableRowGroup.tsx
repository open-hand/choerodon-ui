import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import ColumnGroups from './ColumnGroups';
import TableContext from './TableContext';
import { isStickySupport } from './utils';

export const ROW_GROUP_HEIGHT = 25;

export interface TableRowGroupProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
  children?: ReactNode;
  level: number;
}

const TableRowGroup: FunctionComponent<TableRowGroupProps> = function TableRowGroup(props) {
  const { prefixCls, tableStore } = useContext(TableContext);
  const { lock, columnGroups, children, level } = props;
  const colSpan = (() => {
    switch (lock) {
      case ColumnLock.left:
        return columnGroups.leftLeafs.length;
      case ColumnLock.right:
        return columnGroups.rightLeafs.length;
      default:
        return columnGroups.leafs.length;
    }
  })();
  const Cmp = tableStore.parityRow ? 'div' : 'tr';
  return (
    <Cmp className={`${prefixCls}-row-group`} style={isStickySupport() ? undefined : { height: pxToRem(ROW_GROUP_HEIGHT) }}>
      <th colSpan={colSpan} className={`${prefixCls}-row-group-title`} style={{ top: level * ROW_GROUP_HEIGHT }}  scope="colgroup">
        {
          lock !== ColumnLock.right && (
            <div className={`${prefixCls}-row-group-title-content`}>{children}</div>
          )
        }
      </th>
    </Cmp>
  );
};

TableRowGroup.displayName = 'TableRowGroup';

export default observer(TableRowGroup);
