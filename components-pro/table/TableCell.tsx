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
  useMemo,
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
import TableStore, { DRAG_KEY, SELECTION_KEY } from './TableStore';
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
  const { clipboard, startChooseCell, endChooseCell, isFinishChooseCell, currentEditorName, node: { rangeBorder } } = tableStore;
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
    if (tableStore.currentEditorName && key === DRAG_KEY) {
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

  const handleMouseDown = useCallback(action<(e) => void>((event) => {
    const { target } = event;
    const startTarget = (target as HTMLElement).parentElement;
    const colIndex = tableStore.columns.findIndex(x => x.name === key);
    if (colIndex < 0 || startTarget && startTarget.tagName.toLowerCase() === 'tr' || target.tagName.toLowerCase() === 'input') return;
    if (startTarget) {
      const initPosition = { rowIndex, colIndex, target: startTarget };
      if (tableStore.startChooseCell && event.shiftKey) {
        tableStore.shiftKey = true;
        tableStore.endChooseCell = initPosition;
        if (rangeBorder) {
          drawCopyBorder({ startTarget: tableStore.startChooseCell.target, endTarget: startTarget })
        }
      } else {
        tableStore.shiftKey = false;
        tableStore.startChooseCell = initPosition;
        tableStore.endChooseCell = initPosition;
        if (rangeBorder) {
          drawCopyBorder({ startTarget, endTarget: startTarget })
        }
      }
      tableStore.isFinishChooseCell = false;
    }
  }), [endChooseCell]);

  const handleMouseMove = useCallback(action<(e) => void>(({ target }) => {
    if (startChooseCell && !isFinishChooseCell && !currentEditorName) {
      const colIndex = tableStore.columns.findIndex(x => x.name === key);
      if (colIndex > 0) {
        const startTarget = startChooseCell.target;
        const endTarget = target && (target as HTMLElement).parentElement;
        tableStore.endChooseCell = { colIndex, rowIndex, target: endTarget! };
        if (endTarget && endTarget !== startTarget && endTarget.tagName.toLowerCase() === 'td' && rangeBorder) {
          drawCopyBorder({ startTarget, endTarget })
        }
      }

    }
  }), [startChooseCell, isFinishChooseCell, currentEditorName])

  const drawCopyBorder = ({ startTarget, endTarget }) => {
    if (rangeBorder) {
      const rectStart = startTarget.getBoundingClientRect();
      const rectEnd = endTarget.getBoundingClientRect();
      const minX = Math.min(rectStart.left, rectEnd.left);
      const maxX = Math.max(rectStart.right, rectEnd.right);
      const minY = Math.min(rectStart.top, rectEnd.top);
      const maxY = Math.max(rectStart.bottom, rectEnd.bottom);
      const left = Math.min(startTarget.offsetLeft, endTarget.offsetLeft);
      const top = Math.min(startTarget.offsetTop, endTarget.offsetTop);
      const width = maxX - minX;
      const height = maxY - minY;
      rangeBorder.style.left = pxToRem(left)!;
      rangeBorder.style.top = pxToRem(top)!;
      rangeBorder.style.width = pxToRem(width)!;
      rangeBorder.style.height = pxToRem(height)!;
      rangeBorder.style.display = 'block';
    }
  }

  const handleMouseUp = useCallback(action<(e) => void>((e) => {
    e.preventDefault();
    tableStore.isFinishChooseCell = true;
  }), [])

  const isChoose = useMemo(() => {
    const colIndex = tableStore.columns.findIndex(x => x.name === key);
    if (startChooseCell && startChooseCell.colIndex === colIndex && startChooseCell.rowIndex === rowIndex) {
      return true;
    }
    if (endChooseCell && endChooseCell.colIndex === colIndex && endChooseCell.rowIndex === rowIndex) {
      return true;
    }
    if (endChooseCell && startChooseCell) {
      let finalStartRowIndex = startChooseCell.rowIndex;
      let finalStartColumnIndex = startChooseCell.colIndex;
      let finalEndRowIndex = endChooseCell.rowIndex;
      let finalEndColumnIndex = endChooseCell.colIndex;
      if (finalStartRowIndex > finalEndRowIndex) {
        finalStartRowIndex = endChooseCell.rowIndex;
        finalEndRowIndex = startChooseCell.rowIndex;
      }
      if (finalStartColumnIndex > finalEndColumnIndex) {
        finalStartColumnIndex = endChooseCell.colIndex;
        finalEndColumnIndex = startChooseCell.colIndex;
      }
      if (
        colIndex >= finalStartColumnIndex &&
        colIndex <= finalEndColumnIndex &&
        rowIndex >= finalStartRowIndex &&
        rowIndex <= finalEndRowIndex
      ) {
        return true;
      }
    }

    return false;
  }, [startChooseCell, endChooseCell])

  const isFirstChoosed = useMemo(() => {
    const colIndex = tableStore.columns.findIndex(x => x.name === key);
    return startChooseCell && startChooseCell.rowIndex === rowIndex && startChooseCell.colIndex === colIndex;
  }, [startChooseCell]);

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
      [`${cellPrefix}-choosed`]: clipboard && clipboard.copy && isChoose,
      [`${cellPrefix}-first-choosed`]: clipboard && clipboard.copy && isFirstChoosed,
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
  let clipboardCopyEvents = {};
  if (clipboard && clipboard.copy) {
    clipboardCopyEvents = {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    }
  }
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
      {...clipboardCopyEvents}
    >
      {renderInnerNode(aggregation, onCellStyle)}
    </TCell>
  );
};

TableCell.displayName = 'TableCell';

export default observer(TableCell);
