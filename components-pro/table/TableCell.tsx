import React, { CSSProperties, FunctionComponent, HTMLProps, Key, TdHTMLAttributes, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import defaultTo from 'lodash/defaultTo';
import Group from 'choerodon-ui/dataset/data-set/Group';
import Tree, { TreeNodeProps } from 'choerodon-ui/lib/tree';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { getColumnKey, getColumnLock, getEditorByColumnAndRecord, getHeader, isStickySupport } from './utils';
import { ColumnLock, GroupType } from './enum';
import TableCellInner from './TableCellInner';
import AggregationButton from './AggregationButton';
import ColumnGroup from './ColumnGroup';
import { treeSome } from '../_util/treeUtils';

export interface TableCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  record: Record | undefined;
  colSpan?: number;
  isDragging: boolean;
  lock?: ColumnLock | boolean;
  provided?: DraggableProvided;
  disabled?: boolean;
  inView?: boolean | undefined;
  groupPath?: [Group, boolean][];
  rowIndex?: number;
}

const TableCell: FunctionComponent<TableCellProps> = function TableCell(props) {
  const { columnGroup, record, isDragging, provided, colSpan, className, children, disabled, inView, groupPath } = props;
  const { column, key } = columnGroup;
  const { tableStore, prefixCls, dataSet, expandIconAsCell, aggregation: tableAggregation, rowHeight } = useContext(TableContext);
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = tableStore.getConfig('tableColumnOnCell');
  const getInnerNode = useCallback((col: ColumnProps, onCellStyle?: CSSProperties, inAggregation?: boolean) => record ? (
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
  ) : undefined, [record, disabled, children, cellPrefix, colSpan]);

  const getColumnsInnerNode = useCallback((columns: ColumnProps[]) => {
    return record ? columns.map((col) => {
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
    }) : [];
  }, [tableStore, record, dataSet, cellPrefix, getInnerNode, tableColumnOnCell, tableAggregation]);
  const { style, lock, onCell, aggregation, __tableGroup } = column;
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
  if (!record) {
    return (
      <td
        className={baseClassName}
        style={baseStyle}
        data-index={key}
      />
    );
  }
  const [group, isLast]: [Group | undefined, boolean] = __tableGroup && groupPath && groupPath.find(([path]) => path.name === __tableGroup.name) || [undefined, false];
  const indexInGroup: number = group ? group.totalRecords.indexOf(record) : -1;
  if (indexInGroup > 0) {
    return null;
  }
  const groupCell = indexInGroup === 0;
  const renderInnerNode = (aggregation, onCellStyle?: CSSProperties) => {
    if (groupCell && group && __tableGroup) {
      const { columnProps } = __tableGroup;
      const renderer = columnProps && columnProps.renderer || defaultAggregationRenderer;
      const text = renderer({ text: group.value, group, dataSet, record: group.totalRecords[0], type: GroupType.column });
      return (
        <div className={`${cellPrefix}-inner`}>
          {text}
        </div>
      );
    }
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
          const { renderer = defaultAggregationRenderer, aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll, aggregationLimitDefaultExpanded } = column;
          const expanded: boolean = defaultTo(
            tableStore.isAggregationCellExpanded(record, key),
            typeof aggregationLimitDefaultExpanded === 'function' ? aggregationLimitDefaultExpanded(record) : aggregationLimitDefaultExpanded,
          ) || false;
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
  const rowSpan = groupCell && group ? tableStore.headerTableGroups.length ? group.rowSpan : group.totalRecords.length : undefined;
  if (inView === false || columnGroup.inView === false) {
    const hasEditor: boolean = aggregation ? treeSome(column.children || [], (node) => !!getEditorByColumnAndRecord(node, record)) : !!getEditorByColumnAndRecord(column, record);
    const emptyCellProps: TdHTMLAttributes<HTMLTableDataCellElement> & { 'data-index': Key } = {
      colSpan,
      rowSpan,
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
        dataSet,
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
      [`${cellPrefix}-last-group`]: groupCell && isLast,
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
      rowSpan={rowSpan}
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
