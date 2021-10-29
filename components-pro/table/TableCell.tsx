import React, { CSSProperties, FunctionComponent, HTMLProps, Key, TdHTMLAttributes, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import Tree, { TreeNodeProps } from 'choerodon-ui/lib/tree';
import { getConfig } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { getColumnKey, getColumnLock, getEditorByColumnAndRecord, getHeader, isStickySupport } from './utils';
import { ColumnLock } from './enum';
import TableCellInner from './TableCellInner';
import AggregationButton from './AggregationButton';
import ColumnGroup from './ColumnGroup';
import { treeSome } from '../_util/treeUtils';

export interface TableCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  record: Record;
  colSpan?: number;
  isDragging: boolean;
  lock?: ColumnLock | boolean;
  provided?: DraggableProvided;
  disabled?: boolean;
  inView?: boolean | undefined;
}

const TableCell: FunctionComponent<TableCellProps> = function TableCell(props) {
  const { columnGroup, record, isDragging, provided, colSpan, className, children, disabled, inView } = props;
  const { column, key } = columnGroup;
  const { tableStore, prefixCls, dataSet, expandIconAsCell, aggregation: tableAggregation, rowHeight } = useContext(TableContext);
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = getConfig('tableColumnOnCell');
  const getInnerNode = useCallback((col: ColumnProps, onCellStyle?: CSSProperties, inAggregation?: boolean) => (
    <TableCellInner
      column={col}
      record={record}
      style={onCellStyle}
      disabled={disabled}
      inAggregation={inAggregation}
      prefixCls={cellPrefix}
      colSpan={colSpan}
    >
      {children}
    </TableCellInner>
  ), [record, disabled, children, cellPrefix, colSpan]);

  const getColumnsInnerNode = useCallback((columns: ColumnProps[]) => {
    return columns.map((col) => {
      const { hidden, hiddenInAggregation } = col;
      if (!hidden && !(typeof hiddenInAggregation === 'function' ? hiddenInAggregation(record) : hiddenInAggregation)) {
        const { onCell } = col;
        const isBuiltInColumn = tableStore.isBuiltInColumn(col);
        const columnOnCell = !isBuiltInColumn && (onCell || tableColumnOnCell);
        const cellExternalProps: Partial<TreeNodeProps> =
          typeof columnOnCell === 'function'
            ? columnOnCell({
              dataSet,
              record,
              column: col,
            })
            : {};
        const columnKey = getColumnKey(col);
        const header = getHeader(col, dataSet, tableAggregation);
        // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
        const onCellStyle = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;
        const childColumns = col.children;
        if (childColumns && childColumns.length) {
          return (
            <Tree.TreeNode
              {...cellExternalProps}
              key={columnKey}
              title={header}
            >
              {getColumnsInnerNode(childColumns)}
            </Tree.TreeNode>
          );
        }
        const innerNode = getInnerNode(col, onCellStyle, true);
        return (
          <Tree.TreeNode
            {...cellExternalProps}
            key={columnKey}
            title={
              <>
                <span className={`${cellPrefix}-label`}>{header}</span>
                {innerNode}
              </>
            }
          />
        );
      }
      return undefined;
    });
  }, [tableStore, record, dataSet, cellPrefix, getInnerNode, tableColumnOnCell, tableAggregation]);
  const renderInnerNode = (aggregation, onCellStyle?: CSSProperties) => {
    if (expandIconAsCell && children) {
      return (
        <span
          className={classNames(`${cellPrefix}-inner`, { [`${cellPrefix}-inner-row-height-fixed`]: rowHeight !== 'auto' })}
          style={{ textAlign: 'center', ...onCellStyle }}
        >
          {children}
        </span>
      );
    }
    if (aggregation) {
      const { column: { children: childColumns } } = columnGroup;
      if (childColumns) {
        const visibleChildren = childColumns.filter(child => !child.hidden);
        const { length } = visibleChildren;
        if (length > 0) {
          const { renderer = defaultAggregationRenderer, aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll } = column;
          const expanded = tableStore.isAggregationCellExpanded(record, key);
          const hasExpand = length > aggregationLimit!;
          const nodes = hasExpand && !expanded ? visibleChildren.slice(0, aggregationLimit! - 1) : visibleChildren;

          const text = (
            <Tree
              prefixCls={`${cellPrefix}-tree`}
              virtual={false}
              focusable={false}
              defaultExpandedKeys={aggregationDefaultExpandedKeys}
              defaultExpandAll={aggregationDefaultExpandAll}
            >
              {
                getColumnsInnerNode(nodes)
              }
              {
                hasExpand && (
                  <Tree.TreeNode title={<AggregationButton expanded={expanded} record={record} columnGroup={columnGroup} />} />
                )
              }
            </Tree>
          );
          return (
            <div className={`${cellPrefix}-inner`}>
              {renderer({ text, record, dataSet, aggregation: tableAggregation })}
            </div>
          );
        }
      }
    }
    return getInnerNode(column, onCellStyle);
  };
  const { style, lock } = column;
  const columnLock = isStickySupport() && getColumnLock(lock);
  const baseStyle: CSSProperties | undefined = (() => {
    if (columnLock) {
      if (columnLock === ColumnLock.left) {
        return {
          ...style,
          left: pxToRem(columnGroup.left)!,
        };
      }
      if (columnLock === ColumnLock.right) {
        return {
          ...style,
          right: pxToRem(colSpan && colSpan > 1 ? 0 : columnGroup.right)!,
        };
      }
    }
    return style;
  })();
  const baseClassName = classNames(cellPrefix, {
    [`${cellPrefix}-fix-${columnLock}`]: columnLock,
  });
  const { onCell, aggregation } = column;
  if (inView === false || columnGroup.inView === false) {
    const hasEditor: boolean = aggregation ? treeSome(column.children || [], (node) => !!getEditorByColumnAndRecord(node, record)) : !!getEditorByColumnAndRecord(column, record);
    const emptyCellProps: TdHTMLAttributes<HTMLTableDataCellElement> & { 'data-index': Key } = {
      colSpan,
      'data-index': key,
      className: baseClassName,
      style: baseStyle,
    };
    if (hasEditor) {
      emptyCellProps.onFocus = (e) => {
        tableStore.activeEmptyCell = e.target;
      };
      emptyCellProps.onBlur = () => {
        delete tableStore.activeEmptyCell;
      };
      emptyCellProps.tabIndex = 0;
    }

    return <td {...emptyCellProps} />;
  }
  const isBuiltInColumn = tableStore.isBuiltInColumn(column);
  const columnOnCell = !isBuiltInColumn && (onCell || tableColumnOnCell);
  const cellExternalProps: HTMLProps<HTMLTableCellElement> =
    typeof columnOnCell === 'function'
      ? columnOnCell({
        dataSet: record.dataSet!,
        record,
        column,
      })
      : {};
  const cellStyle: CSSProperties = {
    ...baseStyle,
    ...cellExternalProps.style,
    ...(provided && { cursor: 'move' }),
  };
  const classString = classNames(
    baseClassName,
    {
      [`${cellPrefix}-aggregation`]: aggregation,
    },
    column.className,
    className,
    cellExternalProps.className,
  );
  const widthDraggingStyle = (): React.CSSProperties => {
    const draggingStyle: React.CSSProperties = {};
    if (isDragging) {
      const dom = tableStore.node.element.querySelector(`.${prefixCls}-tbody .${prefixCls}-cell[data-index="${key}"]`);
      if (dom) {
        draggingStyle.width = dom.clientWidth;
        draggingStyle.whiteSpace = 'nowrap';
      }
    }
    return draggingStyle;
  };
  // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
  const onCellStyle = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;
  return (
    <td
      colSpan={colSpan}
      {...cellExternalProps}
      className={classString}
      data-index={key}
      {...(provided && provided.dragHandleProps)}
      style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle() }}
    >
      {renderInnerNode(aggregation, onCellStyle)}
    </td>
  );
};

TableCell.displayName = 'TableCell';

export default observer(TableCell);
