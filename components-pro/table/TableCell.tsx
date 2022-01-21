import React, { CSSProperties, FunctionComponent, HTMLProps, Key, TdHTMLAttributes, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import { IteratorHelper } from 'choerodon-ui/dataset';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { getColumnLock, getEditorByColumnAndRecord, isStickySupport } from './utils';
import { ColumnLock } from './enum';
import TableCellInner from './TableCellInner';
import ColumnGroup from './ColumnGroup';
import { treeSome } from '../_util/treeUtils';
import TableGroupCellInner from './TableGroupCellInner';
import TableStore from './TableStore';
import AggregationTree from './AggregationTree';

function getRowSpan(group: Group, tableStore: TableStore) {
  if (tableStore.headerTableGroups.length) {
    const { subGroups, subHGroups } = group;
    if (subHGroups) {
      return IteratorHelper.iteratorReduce(subHGroups.values(), (rowSpan, group) => Math.max(rowSpan, group.records.length), 0);
    }
    return subGroups.reduce((rowSpan, subGroup) => rowSpan + (subGroup.subGroups.length ? getRowSpan(subGroup, tableStore) : 0) + subGroup.records.length, 0);
  }
  return group.expandedRecords.length;
}

export interface TableCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  record: Record | undefined;
  rowIndex: number;
  colSpan?: number;
  isDragging: boolean;
  provided?: DraggableProvided;
  disabled?: boolean;
  inView?: boolean | undefined;
  groupPath?: [Group, boolean][];
}

const TableCell: FunctionComponent<TableCellProps> = function TableCell(props) {
  const { columnGroup, record, isDragging, provided, colSpan, className, children, disabled, inView, groupPath, rowIndex } = props;
  const { column, key } = columnGroup;
  const { tableStore, prefixCls, dataSet, expandIconAsCell, aggregation: tableAggregation, rowHeight } = useContext(TableContext);
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = tableStore.getConfig('tableColumnOnCell');
  const { __tableGroup } = column;
  const [group, isLast]: [Group | undefined, boolean] = __tableGroup && groupPath && groupPath.find(([path]) => path.name === __tableGroup.name) || [undefined, false];
  const [rowGroup]: [Group | undefined, boolean] = group || !groupPath || !groupPath.length ? [undefined, false] : groupPath[groupPath.length - 1];
  const getInnerNode = useCallback((col: ColumnProps, onCellStyle?: CSSProperties, inAggregation?: boolean, headerGroup?: Group) => record ? (
    <TableCellInner
      column={col}
      record={record}
      style={onCellStyle}
      disabled={disabled}
      inAggregation={inAggregation}
      prefixCls={cellPrefix}
      colSpan={colSpan}
      headerGroup={headerGroup}
      rowGroup={rowGroup}
    >
      {children}
    </TableCellInner>
  ) : undefined, [record, disabled, children, cellPrefix, colSpan, rowGroup]);

  const aggregationTreeRenderer = useCallback(({ colGroup, style }) => {
    return getInnerNode(colGroup.column, style, true, colGroup.headerGroup);
  }, [getInnerNode]);
  const { style, lock, onCell, aggregation } = column;
  const columnLock = isStickySupport() && getColumnLock(lock);
  const baseStyle: CSSProperties | undefined = (() => {
    if (columnLock) {
      if (columnLock === ColumnLock.left) {
        return {
          ...style,
          left: pxToRem(columnGroup.left, true)!,
        };
      }
      if (columnLock === ColumnLock.right) {
        return {
          ...style,
          right: pxToRem(colSpan && colSpan > 1 ? 0 : columnGroup.right, true)!,
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
        colSpan={colSpan}
      />
    );
  }
  const indexInGroup: number = group ? group.expandedRecords.indexOf(record) : -1;
  const groupCell = indexInGroup === 0 || tableStore.virtual && indexInGroup > -1 && tableStore.virtualStartIndex === rowIndex;
  if (group && !groupCell) {
    return null;
  }
  const getAggregationColumns = ($aggregation) => {
    if ($aggregation) {
      const { childrenInAggregation } = columnGroup;
      if (childrenInAggregation) {
        const groups = childrenInAggregation.columns;
        return (
          <AggregationTree
            rowGroup={__tableGroup ? group : rowGroup}
            headerGroup={columnGroup.headerGroup}
            record={record}
            groups={groups}
            column={column}
            renderer={aggregationTreeRenderer}
          />
        );
      }
    }
  };
  const groupRowSpan = groupCell && group ? getRowSpan(group, tableStore) - indexInGroup : undefined;
  const rowSpan = groupRowSpan === 1 ? undefined : groupRowSpan;
  const renderInnerNode = ($aggregation, onCellStyle?: CSSProperties) => {
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
    const aggregationList = getAggregationColumns($aggregation);
    if (groupCell && group && __tableGroup) {
      return (
        <TableGroupCellInner rowSpan={rowSpan} group={group} column={column}>
          {aggregationList}
        </TableGroupCellInner>
      );
    }
    if (aggregationList) {
      const { renderer = defaultAggregationRenderer } = column;
      return (
        <span className={`${cellPrefix}-inner`}>
          {renderer({ text: aggregationList, record, dataSet, aggregation: tableAggregation, headerGroup: columnGroup.headerGroup, rowGroup })}
        </span>
      );
    }
    return getInnerNode(column, onCellStyle, undefined, columnGroup.headerGroup);
  };
  const scope = groupCell ? 'row' : undefined;
  const TCell = scope ? 'th' : 'td';
  if (inView === false || columnGroup.inView === false) {
    const hasEditor: boolean = aggregation ? treeSome(column.children || [], (node) => !!getEditorByColumnAndRecord(node, record)) : !!getEditorByColumnAndRecord(column, record);
    const emptyCellProps: TdHTMLAttributes<HTMLTableDataCellElement> & { 'data-index': Key } = {
      colSpan,
      rowSpan,
      'data-index': key,
      className: baseClassName,
      style: baseStyle,
      scope,
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

    return <TCell {...emptyCellProps} />;
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
    <TCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      {...cellExternalProps}
      className={classString}
      data-index={key}
      {...(provided && provided.dragHandleProps)}
      style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle() }}
      scope={scope}
    >
      {renderInnerNode(aggregation, onCellStyle)}
    </TCell>
  );
};

TableCell.displayName = 'TableCell';

export default observer(TableCell);
