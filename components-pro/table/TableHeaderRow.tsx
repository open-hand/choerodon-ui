import React, { FunctionComponent, Key, ReactNode, useCallback, useContext } from 'react';
import { action, get, set } from 'mobx';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ResizeObservedRow from './ResizeObservedRow';
import { ColumnLock } from './enum';
import ColumnGroup from './ColumnGroup';
import TableContext from './TableContext';
import { isStickySupport } from './utils';

export interface TableHeaderRowProps {
  rowIndex: number;
  lock?: ColumnLock | boolean;
  children: ReactNode;
  rows: ColumnGroup[][];
}

const TableHeaderRow: FunctionComponent<TableHeaderRowProps> = function TableHeaderRow(props) {
  const { rowIndex, lock, children, rows } = props;
  const { rowHeight, tableStore } = useContext(TableContext);
  const setRowHeight = useCallback(action((index: Key, height: number) => {
    set(tableStore.lockColumnsHeadRowsHeight, index, height);
  }), [tableStore]);

  const getRowHeight = (index): number => {
    return get(tableStore.lockColumnsHeadRowsHeight, index) || 0;
  };

  const getHeaderRowStyle = (): string | number | undefined => {
    const height = getRowHeight(rowIndex);
    return pxToRem(
      rows
        .slice(rowIndex + 1)
        .reduce(
          (total, r, index) =>
            r.length
              ? total
              : total +
              getRowHeight(index + rowIndex + 1),
          height,
        ),
      true,
    );
  };
  const needStoreRowHeight = !isStickySupport() && (tableStore.headerRowHeight === 'auto' || rowHeight === 'auto' || rows.length > 1);
  const style = lock && needStoreRowHeight ? {
    height: getHeaderRowStyle(),
  } : undefined;
  const tr = (
    <tr style={style}>
      {children}
    </tr>
  );

  return !lock && needStoreRowHeight ? (
    <ResizeObservedRow onResize={setRowHeight} rowIndex={rowIndex}>
      {tr}
    </ResizeObservedRow>
  ) : tr;
};

TableHeaderRow.displayName = 'TableHeaderRow';

export default observer(TableHeaderRow);
