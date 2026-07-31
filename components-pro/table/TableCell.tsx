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
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isFunction from 'lodash/isFunction';
import { IteratorHelper } from 'choerodon-ui/dataset';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import TableContext from './TableContext';
import { getColumnLock, getEditorByColumnAndRecord, isDisabledRow, isStickySupport } from './utils';
import { ColumnLock } from './enum';
import TableCellInner from './TableCellInner';
import { treeSome } from '../_util/treeUtils';
import TableGroupCellInner from './TableGroupCellInner';
import TableStore, { DRAG_KEY, SELECTION_KEY, ROW_NUMBER_KEY } from './TableStore';
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

export function getTdElementByTarget(target: HTMLElement): HTMLElement {
  if (target.tagName.toLowerCase() !== "td" || !target.className.includes("-table-cell")) {
    return getTdElementByTarget(target.parentElement!);
  }
  return target;
}

const AUTO_SCROLL_SENSITIVITY = 50; // 控制开始滚动的边距
const AUTO_SCROLL_SPEED = 20; // 滚动速率

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
  const mousePosition = React.useRef<{ x: number; y: number } | null>(null);
  const renderedTextObserver = useRef<MutationObserver>();

  const dragDisabled = isFunction(isDragDisabled) ? isDragDisabled(record) : isDragDisabled;
  const { column, key } = columnGroup;
  const { tableStore, prefixCls, dataSet, expandIconAsCell, aggregation: tableAggregation, rowHeight } = useContext(TableContext);
  const { clipboard, startChooseCell, endChooseCell, isFinishChooseCell, currentEditorName, drawCopyBorder, dragColumnAlign, rowDraggable, dragCorner, drawExpandArea, node: { rangeBorder, element } } = tableStore;
  const clipboardCopyEnabled = Boolean(clipboard && clipboard.copy);
  const cellPrefix = `${prefixCls}-cell`;
  const tableColumnOnCell = tableStore.getConfig('tableColumnOnCell');
  const { __tableGroup, style, lock, onCell, aggregation } = column;
  const [group, isLast]: [Group | undefined, boolean] = __tableGroup && groupPath && groupPath.find(([path]) => path.name === __tableGroup.name) || [undefined, false];
  const [rowGroup]: [Group | undefined, boolean] = group || !groupPath || !groupPath.length ? [undefined, false] : groupPath[groupPath.length - 1];
  useEffect(() => {
    return () => {
      if (tableStore.isFinishChooseCell) {
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      }
    }
  }, [])
  const getInnerNode = useCallback((
    col: ColumnProps,
    onCellStyle?: CSSProperties,
    inAggregation?: boolean,
    headerGroup?: Group,
    tableCellFinalStyle?: CSSProperties,
  ) => record ? (
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
      columnGroup={columnGroup}
      isDragging={isDragging}
      tableCellFinalStyle={tableCellFinalStyle}
      rowIndex={rowIndex}
    >
      {children}
    </TableCellInner>
  ) : undefined, [record, disabled, children, cellPrefix, colSpan, rowGroup, columnGroup, isDragging, rowIndex]);
  const isBuiltInColumn = tableStore.isBuiltInColumn(column);

  const columnOnCell = onCell || (!isBuiltInColumn && tableColumnOnCell);
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

  const handleDocumentMouseMove = (event: MouseEvent) => {
    if (tableStore.isFinishChooseCell) {
      if (tableStore.copyChooseCleanup) {
        tableStore.copyChooseCleanup();
      }
      return;
    }
    autoScroll(event);
  };

  const handleMouseDown = useCallback(action<(e) => void>((event) => {
    const { target } = event;
    if (element && !element.contains(target)) return;
    if ((key === DRAG_KEY || key === ROW_NUMBER_KEY || target.tagName.toLowerCase() === 'input' || target.classList.contains(`${cellPrefix}-inner-editable`)) && !event.shiftKey) {
      if (rangeBorder) {
        rangeBorder.style.display = 'none';
      }
      tableStore.shiftKey = false;
      tableStore.startChooseCell = null;
      tableStore.endChooseCell = null;
      tableStore.clearArrangeValue();
      return;
    }
    // 往上层一直找到  td  元素
    const startTarget = getTdElementByTarget(target);
    const colIndex = tableStore.columnGroups.leafs.findIndex(x => x.column.name === key || x.column.key === key);
    if (colIndex < 0) return;
    if (startTarget) {
      const initPosition = { rowIndex, colIndex, target: startTarget };
      if (tableStore.startChooseCell && event.shiftKey) {
        tableStore.shiftKey = true;
        tableStore.endChooseCell = initPosition;
      } else {
        tableStore.shiftKey = false;
        tableStore.startChooseCell = initPosition;
        tableStore.endChooseCell = initPosition;
      }
      drawCopyBorder(tableStore.startChooseCell.target, startTarget);
      tableStore.isFinishChooseCell = false;
      if (tableStore.copyChooseCleanup) {
        tableStore.copyChooseCleanup();
      }
      const cleanup = () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        stopAutoScroll();
        if (tableStore.copyChooseCleanup === cleanup) {
          tableStore.copyChooseCleanup = undefined;
        }
      };
      tableStore.copyChooseCleanup = cleanup;
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp, { once: true });
    }
  }), [endChooseCell]);

  const handleDocumentMouseUp = useCallback(action<(e) => void>((event) => {
    tableStore.isFinishChooseCell = true;
    document.removeEventListener('mousemove', handleDocumentMouseMove);
    const { target } = event;
    if (tableStore.copyChooseCleanup) {
      tableStore.copyChooseCleanup();
    }
    // 开始计数求和、求平均、个数、最小、最大
    tableStore.calcArrangeValue();
    if (key === DRAG_KEY || key === ROW_NUMBER_KEY) return;
    const isEditableTarget = target.tagName.toLowerCase() === 'input' || target.classList.contains(`${cellPrefix}-inner-editable`);
    if (!isEditableTarget || !tableStore.currentEditorName) {
      tableStore.node.focus();
    }
  }), [dragCorner]);

  const handleMouseOver = useCallback(action<(e) => void>((event) => {
    if (dragCorner) {
      // 绘制扩展区域
      drawExpandArea(event);
    } else {
      if ((rowDraggable && !dragColumnAlign) || key === DRAG_KEY || key === ROW_NUMBER_KEY) return;
      if (startChooseCell && !isFinishChooseCell && !currentEditorName) {
        const colIndex = tableStore.columnGroups.leafs.findIndex(x => x.column.name === key || x.column.key === key);
        if (colIndex >= 0) {
          const startTarget = startChooseCell.target;
          const endTarget = getTdElementByTarget(event.target);
          tableStore.endChooseCell = { colIndex, rowIndex, target: endTarget! };
          if (endTarget) {
            drawCopyBorder(startTarget, endTarget)
          }
        }
        autoScroll(event)
      }
    }
  }), [startChooseCell, isFinishChooseCell, currentEditorName, dragCorner]);

  const autoScroll = (event) => {
    // 控制滚动条自动滚动
    const { node, rightColumnGroups, leftColumnGroups, overflowY, overflowX, lastScrollLeft, lastScrollTop } = tableStore;
    const { tableContentWrap, tableBodyWrap } = node;
    const overflowWrapper = tableBodyWrap || tableContentWrap;
    if (!overflowWrapper) return;
    const tableRect = overflowWrapper.getBoundingClientRect();
    const overflowYWidth = overflowY ? measureScrollbar() : 0;

    const { height, width, x, y } = tableRect;
    const mouseX = event.clientX - x;
    const mouseY = event.clientY - y;
    mousePosition.current = { x: mouseX, y: mouseY };

    const maxScrollLeft = overflowWrapper.scrollWidth - overflowWrapper.clientWidth;
    const maxScrollHeight = overflowWrapper.scrollHeight - overflowWrapper.clientHeight;

    const hasEnteredVerticalSensitivityArea =
     (mouseY <= AUTO_SCROLL_SENSITIVITY && lastScrollTop !== 0) || (lastScrollTop !== maxScrollHeight && mouseY >= height - AUTO_SCROLL_SENSITIVITY - (overflowX ? measureScrollbar('horizontal') : 0));

    const hasEnteredHorizontalSensitivityArea =
      (mouseX >= leftColumnGroups.width - AUTO_SCROLL_SENSITIVITY && mouseX <= AUTO_SCROLL_SENSITIVITY + leftColumnGroups.width) ||
      (maxScrollLeft !== lastScrollLeft && mouseX >= width - rightColumnGroups.width - AUTO_SCROLL_SENSITIVITY - overflowYWidth && mouseX <= width - rightColumnGroups.width + AUTO_SCROLL_SENSITIVITY - overflowYWidth);

    const hasEnteredSensitivityArea =
      hasEnteredVerticalSensitivityArea || hasEnteredHorizontalSensitivityArea;

    if (hasEnteredSensitivityArea) {
      // 鼠标在sensitivity区域，开始自动滚动
      startAutoScroll(overflowWrapper);
    } else {
      // 鼠标离开sensitivity区域，停止自动滚动
      stopAutoScroll();
    }
  }

  const startAutoScroll = (overflowWrapper: HTMLElement) => {
    if (tableStore.autoScrollRAF || !mousePosition.current) {
      return;
    }
    const execScroll = action(() => {
      const { rightColumnGroups, leftColumnGroups, overflowX, overflowY, lastScrollLeft, lastScrollTop } = tableStore;
      const { x: mouseX, y: mouseY } = mousePosition.current!;
      const overflowRect = overflowWrapper.getBoundingClientRect();
      const { height, width } = overflowRect;
      const scrollVerticalWidth = overflowY ? measureScrollbar() : 0;
      const scrollHorizontalWidth = overflowX ? measureScrollbar('horizontal') : 0;
      const mouseClientX = overflowRect.left + mouseX;
      const mouseClientY = overflowRect.top + mouseY;
      const getPointCell = (clientX: number, clientY: number) => document.elementsFromPoint(clientX, clientY)
        .map(pointElement => pointElement.closest(`td.${cellPrefix}`) as HTMLElement | null)
        .find(cell => cell && overflowWrapper.contains(cell));
      const pointCell = getPointCell(mouseClientX, mouseClientY);
      const clampedPointCell = !pointCell ? getPointCell(
        Math.min(
          Math.max(mouseClientX, overflowRect.left + leftColumnGroups.width + 1),
          overflowRect.right - rightColumnGroups.width - scrollVerticalWidth - 1,
        ),
        Math.min(
          Math.max(mouseClientY, overflowRect.top + 1),
          overflowRect.bottom - scrollHorizontalWidth - 1,
        ),
      ) : undefined;
      // 鼠标位于视口空白区域时，pointCell 为空。
      // 从已渲染且视口相交的单元格中筛选鼠标所在列，作为边界候选节点。
      const renderedCells = pointCell || clampedPointCell ? [] : Array.from(overflowWrapper.querySelectorAll<HTMLElement>(`td.${cellPrefix}[data-row-index]`))
        .filter((cell) => {
          const { left, right, top, bottom } = cell.getBoundingClientRect();
          return left <= mouseClientX && right >= mouseClientX && top < overflowRect.bottom && bottom > overflowRect.top;
        });
      // 鼠标位于视口空白区域时，pointCell 为空。
      // 从已渲染且视口相交的单元格中筛选鼠标所在列，作为边界候选节点。
      const boundaryCell = renderedCells.reduce<HTMLElement | undefined>((result, cell) => {
        if (!result) return cell;
        const cellRect = cell.getBoundingClientRect();
        const resultRect = result.getBoundingClientRect();
        // 计算垂直距离：鼠标在单元格顶部时距离为顶部坐标差，在底部时为底部坐标差，
        // 中间时为 0。选择距离最小的节点，即为垂直方向上离鼠标最近的可见行。
        const cellDistance = Math.max(cellRect.top - mouseClientY, mouseClientY - cellRect.bottom, 0);
        const resultDistance = Math.max(resultRect.top - mouseClientY, mouseClientY - resultRect.bottom, 0);
        return cellDistance < resultDistance ? cell : result;
      }, undefined);
      // 实际命中 td 优先使用；否则使用可见边界节点兜底。
      const currentPointCell = pointCell || clampedPointCell || boundaryCell;
      if (currentPointCell) {
        const pointRowIndex = Number(currentPointCell.dataset.rowIndex);
        const pointColIndex = tableStore.columnGroups.leafs.findIndex(({ key: columnKey }) => String(columnKey) === currentPointCell.dataset.index);
        const endCellChanged = !tableStore.endChooseCell ||
          tableStore.endChooseCell.rowIndex !== pointRowIndex ||
          tableStore.endChooseCell.colIndex !== pointColIndex ||
          tableStore.endChooseCell.target !== currentPointCell;
        if (!Number.isNaN(pointRowIndex) && pointColIndex >= 0 && endCellChanged) {
          tableStore.endChooseCell = {
            rowIndex: pointRowIndex,
            colIndex: pointColIndex,
            target: currentPointCell,
          };
          if (startChooseCell) {
            drawCopyBorder(startChooseCell.target, currentPointCell);
          }
        }
      }

      let deltaX = 0;
      let deltaY = 0;
      let factor = 0;
      let appliedFactor = 0;

      const maxScrollLeft = overflowWrapper.scrollWidth - overflowWrapper.clientWidth;
      const maxScrollHeight = overflowWrapper.scrollHeight - overflowWrapper.clientHeight;

      if (mouseY <= AUTO_SCROLL_SENSITIVITY && overflowY && lastScrollTop !== 0) {
        // 向上滚动，距离越近，滚动的速度越快
        factor = (AUTO_SCROLL_SENSITIVITY - mouseY) / - AUTO_SCROLL_SENSITIVITY;
        deltaY = AUTO_SCROLL_SPEED;
      } else if (mouseY >= height - scrollHorizontalWidth - AUTO_SCROLL_SENSITIVITY && overflowY && maxScrollHeight !== lastScrollTop) {
        // 向下滚动，距离越近，滚动的速度越快
        factor = (mouseY - (height - scrollHorizontalWidth - AUTO_SCROLL_SENSITIVITY)) / AUTO_SCROLL_SENSITIVITY;
        deltaY = AUTO_SCROLL_SPEED;
      } else if (mouseX - leftColumnGroups.width <= AUTO_SCROLL_SENSITIVITY && overflowX) {
        // 滚动到最左边，距离越近，滚动的速度越快
        factor = (AUTO_SCROLL_SENSITIVITY - mouseX + leftColumnGroups.width) / -AUTO_SCROLL_SENSITIVITY;
        deltaX = AUTO_SCROLL_SPEED;
      } else if (mouseX >= width - rightColumnGroups.width - scrollVerticalWidth - AUTO_SCROLL_SENSITIVITY && overflowX && maxScrollLeft !== lastScrollLeft) {
        // 滚动到最右边，距离越近，滚动的速度越快
        factor = (mouseX - (width - rightColumnGroups.width - AUTO_SCROLL_SENSITIVITY - scrollVerticalWidth)) / AUTO_SCROLL_SENSITIVITY;
        deltaX = AUTO_SCROLL_SPEED;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        const useBlankAreaSpeedBoost = !pointCell && !clampedPointCell && Boolean(currentPointCell);
        appliedFactor = useBlankAreaSpeedBoost
          ? Math.sign(factor || 1) * Math.max(Math.abs(factor), 1)
          : factor;
        overflowWrapper.scrollTo({
          left: lastScrollLeft + deltaX * appliedFactor,
          top: lastScrollTop + deltaY * appliedFactor,
        })
      }
      tableStore.autoScrollRAF = requestAnimationFrame(execScroll);
    })
    execScroll();
  }

  const stopAutoScroll = () => {
    if (tableStore.autoScrollRAF) {
      cancelAnimationFrame(tableStore.autoScrollRAF);
      runInAction(() => {
        tableStore.autoScrollRAF = null;
      })
    }
  }

  const handleMouseUp = useCallback(action<(e) => void>(( ) => {
    tableStore.isFinishChooseCell = true;
    if (key === DRAG_KEY || key === ROW_NUMBER_KEY) return;
    // 开始计数求和、求平均、个数、最小、最大
    if (dragCorner) {
      tableStore.calcArrangeValue();
      // 批量赋值
      tableStore.batchSetCellValue();
    }
    stopAutoScroll();
  }), [dragCorner]);

  const isChoose = useMemo(() => {
    if (!clipboardCopyEnabled || !startChooseCell) return undefined;
    const colIndex = tableStore.columnGroups.leafs.findIndex(x => x.column.name === key || x.column.key === key);
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
  }, [clipboardCopyEnabled, startChooseCell, endChooseCell])

  const isFirstChoosed = useMemo(() => {
    if (!clipboardCopyEnabled || !startChooseCell) return;
    const colIndex = tableStore.columnGroups.leafs.findIndex(x => x.column.name === key || x.column.key === key);
    return startChooseCell.rowIndex === rowIndex && startChooseCell.colIndex === colIndex;
  }, [clipboardCopyEnabled, startChooseCell]);

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
  const renderInnerNode = ($aggregation, onCellStyle?: CSSProperties, tableCellFinalStyle?: CSSProperties) => {
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
              rowIndex,
            })
          }
        </span>
      );
    }
    return getInnerNode(column, onCellStyle, undefined, columnGroup.headerGroup, tableCellFinalStyle);
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
      [`${cellPrefix}-choosed`]: clipboardCopyEnabled && isChoose,
      [`${cellPrefix}-first-choosed`]: clipboardCopyEnabled && isFirstChoosed,
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
  if (clipboardCopyEnabled) {
    clipboardCopyEvents = {
      onMouseDown: handleMouseDown,
      onMouseOver: handleMouseOver,
      onMouseUp: handleMouseUp,
    }
  }

  const tableCellFinalStyle = { ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle(), ...intersectionProps.style };

  const cacheRenderedCellText = clipboardCopyEnabled && column.renderer ? (node: HTMLTableCellElement | null) => {
    renderedTextObserver.current?.disconnect();
    renderedTextObserver.current = undefined;
    let recordCellNode = tableStore.renderedCellNode.get(record);
    if (!recordCellNode) {
      recordCellNode = new Map();
      tableStore.renderedCellNode.set(record, recordCellNode);
    }
    if (node) {
      recordCellNode.set(key, node);
      let recordCellText = tableStore.renderedCellText.get(record);
      if (!recordCellText) {
        recordCellText = new Map();
        tableStore.renderedCellText.set(record, recordCellText);
      }
      const updateText = () => recordCellText!.set(key, node.innerText);
      updateText();
      renderedTextObserver.current = new MutationObserver(updateText);
      renderedTextObserver.current.observe(node, { childList: true, characterData: true, subtree: true });
    } else {
      recordCellNode.delete(key);
    }
  } : undefined;
  const cellRef = (node: HTMLTableCellElement | null) => {
    if (typeof cellExternalProps.ref === 'function') {
      cellExternalProps.ref(node);
    } else if (cellExternalProps.ref && typeof cellExternalProps.ref !== 'string') {
      (cellExternalProps.ref as React.MutableRefObject<HTMLTableCellElement | null>).current = node;
    }
    intersectionRef?.(node);
    cacheRenderedCellText?.(node);
  };

  return (
    <TCell
      colSpan={colSpan}
      rowSpan={rowSpan}
      {...cellExternalProps}
      className={classString}
      data-index={key}
      data-row-index={clipboardCopyEnabled ? rowIndex : undefined}
      {...(provided && provided.dragHandleProps)}
      {...intersectionProps}
      {...(cacheRenderedCellText ? { ref: cellRef } : {})}
      style={tableCellFinalStyle}
      scope={scope}
      onClickCapture={handleClickCapture}
      {...clipboardCopyEvents}
    >
      {renderInnerNode(aggregation, onCellStyle, tableCellFinalStyle)}
    </TCell>
  );
};

TableCell.displayName = 'TableCell';

export default observer(TableCell);
