import React, { FunctionComponent, Key, ReactElement, ReactNode, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ColumnLock, DragColumnAlign } from './enum';
import TableEditor, { TableEditorProps } from './TableEditor';
import TableCol from './TableCol';
import { getColumnKey, isStickySupport } from './utils';
import { treeReduce } from '../_util/treeUtils';
import ColumnGroups from './ColumnGroups';
import { ColumnProps } from './Column';

export interface TableWrapperProps extends ElementProps {
  lock?: ColumnLock;
  hasBody?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
  columnGroups: ColumnGroups;
}

const TableWrapper: FunctionComponent<TableWrapperProps> = function TableWrapper(props) {
  const { children, hasBody, lock, hasHeader, hasFooter, columnGroups } = props;
  const { prefixCls, summary, tableStore } = useContext(TableContext);
  const { leafs, width } = columnGroups;
  const { overflowX, customizable, rowDraggable, dragColumnAlign } = tableStore;
  const hasPlaceHolder = lock !== ColumnLock.left && (hasHeader || hasFooter) && tableStore.overflowY;
  const tableWidth: number | string | undefined = overflowX ?
    lock !== ColumnLock.left && !hasBody && tableStore.overflowY ?
      pxToRem(width + measureScrollbar()) : pxToRem(width) : '100%';
  const editorKeys = new Set<Key>();
  const editors = useMemo((): ReactElement<TableEditorProps>[] | undefined => hasBody ?
    treeReduce<ReactElement<TableEditorProps>[], ColumnProps>(leafs.map(({ column }) => column), (nodes, column) => {
      const { editor, name } = column;
      if (editor && name && (lock || isStickySupport() || !column.lock || !overflowX)) {
        const key = getColumnKey(column);
        if (!editorKeys.has(key)) {
          editorKeys.add(key);
          nodes.push(
            <TableEditor key={key} column={column} />,
          );
        }
      }
      return nodes;
    }, []) : undefined,
  [leafs, overflowX, lock, hasBody],
  );

  const colGroup = useMemo((): ReactNode => {
    let fixedColumnLength = 1;
    if (customizable) {
      fixedColumnLength += 1;
    }
    if (rowDraggable && dragColumnAlign === DragColumnAlign.right) {
      fixedColumnLength += 1;
    }

    const cols = leafs.map(({ column, key }, index, array) => (
      <TableCol
        key={key}
        column={column}
        last={!overflowX && index === array.length - fixedColumnLength}
      />
    ));
    if (hasPlaceHolder) {
      cols.push(<col key="fixed-column" style={{ width: pxToRem(measureScrollbar()) }} />);
    }
    return <colgroup>{cols}</colgroup>;
  }, [leafs, customizable, rowDraggable, dragColumnAlign, hasPlaceHolder, overflowX]);

  const style = useMemo(() => ({ width: tableWidth }), [tableWidth]);

  const className = classNames({
    [`${prefixCls}-last-row-bordered`]: hasBody && !tableStore.overflowY && (tableStore.height !== undefined || (!tableStore.hasFooter && overflowX)),
  });

  return (
    <>
      <table
        key="table"
        className={className}
        style={style}
        summary={hasBody ? summary : undefined}
      >
        {colGroup}
        {children}
      </table>
      {editors}
    </>
  );
};

TableWrapper.displayName = 'TableWrapper';

export default observer(TableWrapper);
