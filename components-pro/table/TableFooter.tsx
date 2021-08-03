import React, { DetailedHTMLProps, FunctionComponent, Key, ThHTMLAttributes, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { action, get, set } from 'mobx';
import classNames from 'classnames';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock, DragColumnAlign } from './enum';
import TableFooterCell, { TableFooterCellProps } from './TableFooterCell';
import { getColumnKey, isStickySupport } from './utils';
import ResizeObservedRow from './ResizeObservedRow';
import { CUSTOMIZED_KEY } from './TableStore';

export interface TableFooterProps extends ElementProps {
  lock?: ColumnLock | boolean;
  columns: ColumnProps[];
}

const TableFooter: FunctionComponent<TableFooterProps> = observer(function TableFooter(props) {
  const { lock, columns } = props;
  const { prefixCls, rowHeight, tableStore } = useContext(TableContext);
  const { overflowX } = tableStore;

  const handleResize = useCallback(action<(index: Key, height: number) => void>((index: Key, height: number) => {
    set(tableStore.lockColumnsFootRowsHeight, index, height);
  }), [tableStore]);

  const getTds = () => {
    const { customizable, rowDraggable, dragColumnAlign } = tableStore;
    const hasPlaceholder = tableStore.overflowY && lock !== ColumnLock.left;
    const right = hasPlaceholder ? measureScrollbar() : 0;
    const tds = columns.map((column, index, cols) => {
      const key = getColumnKey(column);
      if (key !== CUSTOMIZED_KEY) {
        const colSpan = customizable && lock !== ColumnLock.left && (!rowDraggable || dragColumnAlign !== DragColumnAlign.right) && index === cols.length - 2 ? 2 : 1;
        const cellProps: Partial<TableFooterCellProps> = {};
        if (colSpan > 1) {
          cellProps.colSpan = colSpan;
        }
        return (
          <TableFooterCell
            key={key}
            column={column}
            right={right}
            {...cellProps}
          />
        );
      }
      return undefined;
    });

    if (hasPlaceholder) {
      const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> = {
        key: 'fixed-column',
      };
      const classList = [`${prefixCls}-cell`];
      if (isStickySupport() && overflowX) {
        placeHolderProps.style = { right: 0 };
        classList.push(`${prefixCls}-cell-fix-right`);
      }
      placeHolderProps.className = classList.join(' ');
      tds.push(
        <th {...placeHolderProps}>
          &nbsp;
        </th>,
      );
    }
    return tds;
  };
  const style = !isStickySupport() && lock && (rowHeight === 'auto' || tableStore.autoFootHeight) ? {
    height: pxToRem(get(tableStore.lockColumnsFootRowsHeight, 0)),
  } : undefined;
  const tr = (
    <tr style={style}>
      {getTds()}
    </tr>
  );
  const classString = classNames(`${prefixCls}-tfoot`, {
    [`${prefixCls}-tfoot-bordered`]: overflowX,
  });
  return (
    <tfoot className={classString}>
      {
        !isStickySupport() && !lock && (rowHeight === 'auto' || tableStore.autoFootHeight) ? (
          <ResizeObservedRow onResize={handleResize} rowIndex={0}>
            {tr}
          </ResizeObservedRow>
        ) : tr
      }
    </tfoot>
  );
});

TableFooter.displayName = 'TableFooter';

export default TableFooter;
