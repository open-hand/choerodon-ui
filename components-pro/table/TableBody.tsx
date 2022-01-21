import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import TableContext from './TableContext';
import { ColumnLock } from './enum';

export interface TableBodyProps {
  lock?: ColumnLock | boolean;
  getRef?: (node: HTMLDivElement | null) => void;
  onScroll?: (e) => void;
  style?: CSSProperties;
}

const TableBody: FunctionComponent<TableBodyProps> = function TableBody(props) {
  const { children, lock, onScroll, style, getRef } = props;
  const { prefixCls, tableStore } = useContext(TableContext);
  const { hasFooter, overflowY, overflowX, height } = tableStore;
  const fixedLeft = lock === true || lock === ColumnLock.left;
  const scrollbar = measureScrollbar();
  const hasFooterAndNotLock = !lock && hasFooter && overflowX && scrollbar;
  const hasLockAndNoFooter = lock && !hasFooter && overflowX && height !== undefined && scrollbar;
  const tableBody = (
    <div
      ref={getRef}
      className={`${prefixCls}-body`}
      style={{
        ...(height === undefined ? style : {}),
        height: pxToRem(
          hasFooterAndNotLock && height !== undefined ? height + scrollbar : hasLockAndNoFooter && height !== undefined ? height - scrollbar : height,
          true,
        ),
        marginBottom: hasFooterAndNotLock ? pxToRem(-scrollbar, true) : undefined,
        width: fixedLeft ? pxToRem(tableStore.leftColumnGroups.width + (scrollbar || 20), true) :
          lock === ColumnLock.right
            ? pxToRem(tableStore.rightColumnGroups.width - 1 + (overflowY ? scrollbar : 0), true)
            : undefined,
        marginLeft: lock === ColumnLock.right ? pxToRem(1) : undefined,
      }}
      onScroll={onScroll}
    >
      {children}
    </div>
  );
  if (fixedLeft) {
    return (
      <div className={`${prefixCls}-body-wrapper`} style={{ width: pxToRem(tableStore.leftColumnGroups.width, true) }}>
        {tableBody}
      </div>
    );
  }

  return tableBody;
};

TableBody.displayName = 'TableBody';

export default observer(TableBody);
