import React, { FunctionComponent, ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import ColumnGroups from './ColumnGroups';
import TableContext from './TableContext';
import { isStickySupport } from './utils';
import { toTransformValue } from '../_util/transform';

export interface TableRowGroupProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
  children?: ReactNode;
}

const TableRowGroup: FunctionComponent<TableRowGroupProps> = function TableRowGroup(props) {
  const { prefixCls, tableStore } = useContext(TableContext);
  const stickyRef = useRef<HTMLTableCellElement | null>(null);
  const [stickyOffset, setStickyOffset] = useState<number>(0);
  const needFixSticky = isStickySupport() && tableStore.virtual;
  const currentScrollTop: number = needFixSticky ? tableStore.lastScrollTop : 0;
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
  const style = needFixSticky && stickyOffset ? { transform: toTransformValue({ translate: `0,${pxToRem(-stickyOffset)}` }) } : undefined;
  useLayoutEffect(() => {
    const { current } = stickyRef;
    if (current) {
      const { parentElement } = current;
      if (parentElement) {
        const currentOffsetTop = current.offsetTop;
        const offsetTop = tableStore.virtualTop - currentScrollTop + currentOffsetTop;
        setStickyOffset(currentScrollTop > currentOffsetTop ? offsetTop : Math.min(offsetTop, currentOffsetTop - parentElement.offsetTop));
      }
    }
  }, [currentScrollTop]);
  return (
    <Cmp className={`${prefixCls}-row-group`} style={isStickySupport() ? undefined : { height: pxToRem(25) }}>
      <td colSpan={colSpan} className={`${prefixCls}-row-group-title`} style={style} ref={needFixSticky ? stickyRef : undefined}>
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

export default observer(TableRowGroup);
