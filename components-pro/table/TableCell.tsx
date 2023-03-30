import React, {
  CSSProperties,
  DetailedHTMLProps,
  FunctionComponent,
  HTMLAttributes,
  HTMLProps,
  Key,
  ReactElement,
  useCallback,
  useContext,
} from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isFunction from 'lodash/isFunction';
import { IteratorHelper } from 'choerodon-ui/dataset';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import TableContext from './TableContext';
import { getColumnLock, getEditorByColumnAndRecord, isDisabledRow, isStickySupport } from './utils';
import { ColumnLock } from './enum';
import TableCellInner from './TableCellInner';
import { treeSome } from '../_util/treeUtils';
import TableGroupCellInner from './TableGroupCellInner';
import TableStore, { SELECTION_KEY } from './TableStore';
import { AggregationTreeProps, groupedAggregationTree } from './AggregationTree';
import AggregationTreeGroups from './AggregationTreeGroups';
import { TableVirtualCellProps } from './TableVirtualCell';

function getRowSpan(group: Group, tableStore: TableStore): number {
  if (tableStore.headerTableGroups.length) {
    const { subGroups, subHGroups } = group;
    if (subHGroups) {
      return IteratorHelper.iteratorReduce(subHGroups.values(), (rowSpan, group) => Math.max(rowSpan, group.records.length), 0);
    }
    return subGroups.reduce((rowSpan, subGroup) => rowSpan + (subGroup.subGroups.length ? getRowSpan(subGroup, tableStore) : 0) + subGroup.records.length, 0);
  }
  return group.expandedRecords.length;
}

export interface TableCellProps extends TableVirtualCellProps {
  intersectionRef?: (node?: Element | null) => void;
  inView?: boolean;
  virtualHeight?: string;
  isRenderCell?: boolean;
}

const TableCell: FunctionComponent<TableCellProps> = function TableCell(props) {
  const {
    columnGroup, record, isDragging, provided, isDragDisabled, colSpan, className, children, disabled,
    groupPath, rowIndex, virtualHeight, intersectionRef, isFixedRowHeight, isRenderCell,
  } = props;
  const dragDisabled = isFunction(isDragDisabled) ? isDragDisabled(record) : isDragDisabled;
  const { column, key } = columnGroup;
  const { tableStore, prefixCls, dataSet, expandIconAsCell, aggregation: tableAggregation, rowHeight } = useContext(TableContext);
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = tableStore.getConfig('tableColumnOnCell');
  const { __tableGroup, style, lock, onCell, aggregation } = column;
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
  const isBuiltInColumn = tableStore.isBuiltInColumn(column);

  const columnOnCell = !isBuiltInColumn && (onCell || tableColumnOnCell);
  const cellExternalProps: HTMLProps<HTMLTableCellElement> =
    typeof columnOnCell === 'function' && record
      ? columnOnCell({
        dataSet,
        record,
        column,
      })
      : {};

  const handleClickCapture = useCallback(action<(e) => void>((e) => {
    if (tableStore.currentEditorName) {
      tableStore.blurEditor();
    }
    if (record && !isDisabledRow(record) && e.target.dataset.selectionKey !== SELECTION_KEY) {
      dataSet.current = record;
    }
    const { onClickCapture } = cellExternalProps;
    if (typeof onClickCapture === 'function') {
      onClickCapture(e);
    }
  }), [record, dataSet, cellExternalProps]);
  const aggregationTreeRenderer = useCallback(({ colGroup, style }) => {
    return getInnerNode(colGroup.column, style, true, colGroup.headerGroup);
  }, [getInnerNode]);
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
    [`${cellPrefix}-no-transition`]: !tableStore.tableColumnResizeTransition,
  });
  const intersectionProps: DetailedHTMLProps<HTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement> = {};
  if (intersectionRef) {
    intersectionProps.ref = intersectionRef;
    if (virtualHeight !== undefined) {
      intersectionProps.style = {
        ...baseStyle,
        height: virtualHeight,
      };
    }
  }
  if (!record) {
    return (
      <td
        className={baseClassName}
        style={baseStyle}
        data-index={key}
        colSpan={colSpan}
        {...intersectionProps}
      />
    );
  }
  const indexInGroup: number = group ? group.expandedRecords.indexOf(record) : -1;
  const groupCell = indexInGroup === 0 || tableStore.virtual && indexInGroup > -1 && tableStore.virtualStartIndex === rowIndex;
  if (group && !groupCell) {
    return null;
  }
  const getAggregationTreeGroups = ($aggregation): ReactElement<AggregationTreeProps>[] | undefined => {
    if ($aggregation) {
      const { childrenInAggregation } = columnGroup;
      if (childrenInAggregation) {
        const groups = childrenInAggregation.columns;
        return groupedAggregationTree({
          rowGroup: __tableGroup ? group : rowGroup,
          headerGroup: columnGroup.headerGroup,
          record,
          groups,
          column,
          renderer: aggregationTreeRenderer,
        });
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
    const aggregationList = getAggregationTreeGroups($aggregation);
    if (groupCell && group && __tableGroup) {
      return (
        <TableGroupCellInner rowSpan={rowSpan} group={group} column={column} isFixedRowHeight={isFixedRowHeight}>
          {aggregationList}
        </TableGroupCellInner>
      );
    }
    if (aggregationList) {
      const { renderer = defaultAggregationRenderer } = column;
      const treeGroups = <AggregationTreeGroups trees={aggregationList} />;
      return (
        <span className={`${cellPrefix}-inner`}>
          {
            renderer({
              text: treeGroups,
              record,
              dataSet,
              aggregation: tableAggregation,
              headerGroup: columnGroup.headerGroup,
              rowGroup,
              aggregationTree: aggregationList,
            })
          }
        </span>
      );
    }
    return getInnerNode(column, onCellStyle, undefined, columnGroup.headerGroup);
  };
  const scope = groupCell ? 'row' : undefined;
  const TCell = scope ? 'th' : 'td';
  if (!isRenderCell) {
    const hasEditor: boolean = aggregation ? treeSome(column.children || [], (node) => !!getEditorByColumnAndRecord(node, record)) : !!getEditorByColumnAndRecord(column, record);
    const emptyCellProps: HTMLProps<HTMLTableCellElement> & { 'data-index': Key } = {
      colSpan,
      rowSpan,
      'data-index': key,
      ...cellExternalProps,
      className: classNames(baseClassName, cellExternalProps.className),
      scope,
      onClickCapture: handleClickCapture,
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

    return <TCell {...emptyCellProps} {...intersectionProps} style={{ ...baseStyle, ...cellExternalProps.style, ...intersectionProps.style }} />;
  }
  const cellStyle: CSSProperties = {
    ...baseStyle,
    ...cellExternalProps.style,
    ...(provided && { cursor: dragDisabled ? 'not-allowed' : 'move' }),
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
      {...intersectionProps}
      style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle(), ...intersectionProps.style }}
      scope={scope}
      onClickCapture={handleClickCapture}
    >
      {renderInnerNode(aggregation, onCellStyle)}
    </TCell>
  );
};

TableCell.displayName = 'TableCell';

export default observer(TableCell);
