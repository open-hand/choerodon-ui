import React, { FunctionComponent, ReactNode, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ColumnProps } from './Column';
import { ColumnLock, DragColumnAlign } from './enum';
import TableEditor from './TableEditor';
import TableCol from './TableCol';
import { getColumnKey, isStickySupport } from './utils';
import { treeReduce } from '../_util/treeUtils';
import useComputed from '../use-computed';

export interface TableWrapperProps extends ElementProps {
  lock?: ColumnLock | boolean;
  hasBody?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

const TableWrapper: FunctionComponent<TableWrapperProps> = observer(function TableWrapper(props) {
  const { children, hasBody, lock, hasHeader, hasFooter } = props;
  const { prefixCls, tableStore } = useContext(TableContext);
  type MemoColumns = { leafColumnsWidth?: number, leafEditorColumns?: ColumnProps[] | undefined, leafColumns: ColumnProps[] };
  const { leafColumnsWidth, leafEditorColumns, leafColumns } = useComputed((): MemoColumns => {
    switch (lock) {
      case ColumnLock.left:
      case true:
        return {
          leafColumnsWidth: tableStore.leftLeafColumnsWidth,
          leafEditorColumns: hasBody ? treeReduce<ColumnProps[], ColumnProps>(tableStore.leftLeafColumns, (columns, column) => {
            const { editor, name, hidden } = column;
            if (editor && name && !hidden) {
              columns.push(column);
            }
            return columns;
          }, []) : undefined,
          leafColumns: tableStore.leftLeafColumns.filter(({ hidden }) => !hidden),
        };
      case ColumnLock.right:
        return {
          leafColumnsWidth: tableStore.rightLeafColumnsWidth,
          leafEditorColumns: hasBody ? treeReduce<ColumnProps[], ColumnProps>(tableStore.rightLeafColumns, (columns, column) => {
            const { editor, name, hidden } = column;
            if (editor && name && !hidden) {
              columns.push(column);
            }
            return columns;
          }, []) : undefined,
          leafColumns: tableStore.rightLeafColumns.filter(({ hidden }) => !hidden),
        };
      default: {
        const editorColumns = treeReduce<ColumnProps[], ColumnProps>(tableStore.leafColumns, (columns, column) => {
          const { editor, name, hidden, lock: columnLock } = column;
          if (editor && name && !hidden && (isStickySupport() || !columnLock || !tableStore.overflowX)) {
            columns.push(column);
          }
          return columns;
        }, []);
        const result: MemoColumns = {
          leafEditorColumns: hasBody ? editorColumns : undefined,
          leafColumns: tableStore.leafColumns.filter(({ hidden }) => !hidden),
        };
        if (tableStore.overflowX) {
          result.leafColumnsWidth = tableStore.totalLeafColumnsWidth;
        }
        return result;
      }
    }
  }, [tableStore, lock, hasBody]);

  const colGroup = useComputed((): ReactNode => {
    const { overflowX, customizable, rowDraggable, dragColumnAlign } = tableStore;
    let fixedColumnLength = 1;
    if (customizable) {
      fixedColumnLength += 1;
    }
    if (rowDraggable && dragColumnAlign === DragColumnAlign.right) {
      fixedColumnLength += 1;
    }

    const cols = leafColumns.map((column, index, array) => (
      <TableCol
        key={getColumnKey(column)}
        column={column}
        last={!overflowX && index === array.length - fixedColumnLength}
      />
    ));
    if (lock !== ColumnLock.left && (hasHeader || hasFooter) && tableStore.overflowY) {
      cols.push(<col key="fixed-column" style={{ width: pxToRem(measureScrollbar()) }} />);
    }
    return <colgroup>{cols}</colgroup>;
  }, [lock, hasHeader, hasFooter, leafColumns, prefixCls]);

  const editors = useMemo(() => leafEditorColumns && leafEditorColumns.map(column => (
    <TableEditor key={getColumnKey(column)} column={column} />
  )), [leafEditorColumns]);

  const style = useComputed(() => {
    if (tableStore.overflowX) {
      if (leafColumnsWidth !== undefined && lock !== ColumnLock.left && !hasBody && tableStore.overflowY) {
        return { width: pxToRem(leafColumnsWidth + measureScrollbar()) };
      }
      return { width: pxToRem(leafColumnsWidth) };
    }
    return { width: '100%' };
  }, [tableStore, hasBody, lock, leafColumnsWidth]);

  const className = classNames({
    [`${prefixCls}-last-row-bordered`]: hasBody && !tableStore.overflowY && (tableStore.height !== undefined || (!tableStore.hasFooter && tableStore.overflowX)),
  });

  return (
    <>
      <table
        key="table"
        className={className}
        style={style}
        summary={hasBody ? tableStore.props.summary : undefined}
      >
        {colGroup}
        {children}
      </table>
      {editors}
    </>
  );
});

TableWrapper.displayName = 'TableWrapper';

export default TableWrapper;
