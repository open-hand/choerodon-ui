import React, { CSSProperties, FunctionComponent, HTMLProps, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { get } from 'mobx';
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
import { getColumnKey, getColumnLock, getHeader, isStickySupport } from './utils';
import { ColumnLock } from './enum';
import TableCellInner from './TableCellInner';
import AggregationButton from './AggregationButton';
import useComputed from '../use-computed';

export interface TableCellProps extends ElementProps {
  column: ColumnProps;
  record: Record;
  colSpan?: number;
  isDragging: boolean;
  lock?: ColumnLock | boolean;
  provided?: DraggableProvided;
  disabled?: boolean;
}

const TableCell: FunctionComponent<TableCellProps> = observer((props) => {
  const { column, record, isDragging, provided, colSpan, className, children, disabled } = props;
  const { tableStore } = useContext(TableContext);
  const { prefixCls, dataSet } = tableStore;
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = getConfig('tableColumnOnCell');
  const getInnerNode = useCallback((col: ColumnProps, onCellStyle?: CSSProperties, inAggregation?: boolean) => (
    <TableCellInner
      column={col}
      record={record}
      style={onCellStyle}
      disabled={disabled}
      inAggregation={inAggregation}
    >
      {children}
    </TableCellInner>
  ), [record, disabled, children]);

  const getColumnsInnerNode = useCallback((columns: ColumnProps[]) => {
    return columns.map((col) => {
      const { children: childColumns, hidden, hiddenInAggregation } = col;
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
        const header = getHeader(col, dataSet, tableStore);
        // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
        const onCellStyle = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;
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
  }, [tableStore, record, dataSet, cellPrefix, getInnerNode, tableColumnOnCell]);
  const renderInnerNode = useCallback((aggregation, onCellStyle?: CSSProperties) => {
    if (tableStore.expandIconAsCell && children) {
      return children;
    }
    if (aggregation) {
      const { children: childColumns } = column;
      if (childColumns) {
        const visibleChildren = childColumns.filter(child => !child.hidden);
        const { length } = visibleChildren;
        if (length > 0) {
          const { renderer = defaultAggregationRenderer, aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll } = column;
          const expanded = tableStore.isAggregationCellExpanded(record, column);
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
                  <Tree.TreeNode title={<AggregationButton expanded={expanded} record={record} column={column} />} />
                )
              }
            </Tree>
          );
          return (
            <div className={`${cellPrefix}-inner`}>
              {renderer({ text, record, dataSet, aggregation: tableStore.aggregation })}
            </div>
          );
        }
      }
    }
    return getInnerNode(column, onCellStyle);
  }, [tableStore, column, record, dataSet, children, getInnerNode]);
  const { style, lock, _group } = column;
  const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
  const baseStyle: CSSProperties | undefined = useComputed(() => {
    if (columnLock) {
      if (_group) {
        if (columnLock === ColumnLock.left) {
          return {
            ...style,
            left: pxToRem(_group.left)!,
          };
        }
        if (columnLock === ColumnLock.right) {
          return {
            ...style,
            right: pxToRem(colSpan && colSpan > 1 ? 0 : _group.right)!,
          };
        }
      }
    }
    return style;
  }, [style, columnLock, _group]);
  const baseClassName = classNames(cellPrefix, {
    [`${cellPrefix}-fix-${columnLock}`]: columnLock,
  });
  if (record.getState('__inView') === false || get(column, '_inView') === false) {
    return (
      <td
        colSpan={colSpan}
        data-index={getColumnKey(column)}
        className={baseClassName}
        style={baseStyle}
      />
    );
  }
  const { onCell, aggregation } = column;
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
      const dom = tableStore.node.element.querySelector(`.${prefixCls}-tbody .${prefixCls}-cell[data-index="${getColumnKey(column)}"]`);
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
      data-index={getColumnKey(column)}
      {...(provided && provided.dragHandleProps)}
      style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle() }}
    >
      {renderInnerNode(aggregation, onCellStyle)}
    </td>
  );
});

TableCell.displayName = 'TableCell';

TableCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.instanceOf(Record).isRequired,
};

export default TableCell;
