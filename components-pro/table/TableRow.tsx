import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  HTMLProps,
  isValidElement,
  Key,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { observer } from 'mobx-react-lite';
import { action, get, reaction, remove, set } from 'mobx';
import classNames from 'classnames';
import defer from 'lodash/defer';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useInView } from 'react-intersection-observer';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import TableCell, { TableCellProps } from './TableCell';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import ExpandIcon from './ExpandIcon';
import { ColumnLock, DragColumnAlign, HighLightRowType, SelectionMode } from './enum';
import { findCell, getColumnKey, getColumnLock, isDisabledRow, isSelectedRow, isStickySupport } from './utils';
import { CUSTOMIZED_KEY, DRAG_KEY, EXPAND_KEY, SELECTION_KEY, VIRTUAL_ROOT_MARGIN } from './TableStore';
import { ExpandedRowProps } from './ExpandedRow';
import { RecordStatus } from '../data-set/enum';
import ResizeObservedRow from './ResizeObservedRow';
import Spin from '../spin';
import useComputed from '../use-computed';
import ColumnGroups from './ColumnGroups';
import ColumnGroup from './ColumnGroup';
import { iteratorSome } from '../_util/iteratorUtils';
import { Group } from '../data-set/DataSet';
import VirtualRowMetaData from './VirtualRowMetaData';

function getGroupByPath(group: Group, groupPath: [Group, boolean][]): Group | undefined {
  const { subGroups } = group;
  if (groupPath.length) {
    const path = groupPath.shift();
    if (path && subGroups.length) {
      const subGroup = subGroups.find(sub => sub.value === path[0].value);
      if (subGroup) {
        return getGroupByPath(subGroup, groupPath);
      }
      return undefined;
    }
  }
  return group;
}

function getRecord(columnGroup: ColumnGroup, groupPath: [Group, boolean][] | undefined, index: number, record: Record): Record | undefined {
  const { headerGroup } = columnGroup;
  if (headerGroup && groupPath) {
    const group = getGroupByPath(headerGroup, groupPath.slice());
    if (group) {
      return group.totalRecords[index];
    }
    return undefined;
  }
  return record;
}

const VIRTUAL_HEIGHT = '__VIRTUAL_HEIGHT__';

export interface TableRowProps extends ElementProps {
  lock?: ColumnLock | boolean | undefined;
  isExpanded?: boolean | undefined;
  columnGroups: ColumnGroups;
  record: Record;
  index: number;
  virtualIndex?: number | undefined;
  headerGroupIndex?: number | undefined;
  expandIconColumnIndex?: number | undefined;
  snapshot?: DraggableStateSnapshot | undefined;
  provided?: DraggableProvided | undefined;
  groupPath?: [Group, boolean][] | undefined;
  metaData?: VirtualRowMetaData;
  children?: ReactNode;
}

const TableRow: FunctionComponent<TableRowProps> = function TableRow(props) {
  const {
    record, hidden, index, virtualIndex, headerGroupIndex, provided, snapshot, className, lock, columnGroups,
    children, groupPath, expandIconColumnIndex, metaData, style: propStyle,
  } = props;
  const context = useContext(TableContext);
  const {
    tableStore, prefixCls, dataSet, selectionMode, onRow, rowRenderer, parityRow,
    expandIconAsCell, expandedRowRenderer, isTree, canTreeLoadData,
  } = context;
  const {
    highLightRow,
    selectedHighLightRow,
    mouseBatchChooseState,
    dragColumnAlign,
    rowDraggable,
    showRemovedRow,
    node,
  } = tableStore;
  const { id, key: rowKey } = record;
  const mounted = useRef<boolean>(false);
  const dragRef = useRef<boolean>(false);
  const needIntersection = !hidden && tableStore.virtualCell;
  const columnsInView = needIntersection ? tableStore.columnGroups.inView : true;
  const { ref: intersectionRef, inView, entry } = useInView({
    root: needIntersection && tableStore.overflowY ? node.tableBodyWrap || node.element : null,
    rootMargin: `${VIRTUAL_ROOT_MARGIN}px`,
    initialInView: !needIntersection || mounted.current || tableStore.isRowInView(index),
  });
  const disabled = isDisabledRow(record);
  const rowRef = useRef<HTMLTableRowElement | null>(null);
  const childrenRenderedRef = useRef<boolean | undefined>();
  const needSaveRowHeight = isStickySupport() ? tableStore.propVirtual || needIntersection : (!lock && (!tableStore.isFixedRowHeight || iteratorSome(dataSet.fields.values(), field => field.get('multiLine', record))));
  const rowExternalProps: any = useComputed(() => ({
    ...(typeof rowRenderer === 'function' ? rowRenderer(record, index) : {}), // deprecated
    ...(typeof onRow === 'function'
      ? onRow({
        dataSet,
        record,
        expandedRow: false,
        index,
      })
      : {}),
  }), [record, dataSet, index, onRow, rowRenderer]);
  const isLoading = tableStore.isRowPending(record);
  const isLoaded = tableStore.isRowLoaded(record);
  const isExpanded = tableStore.isRowExpanded(record);
  const isHover = tableStore.isRowHover(record);
  const expandable = ((): boolean | undefined => {
    const { isLeaf } = rowExternalProps;
    if (isLeaf === true) {
      return false;
    }
    return !!expandedRowRenderer || (isTree && (!!record.children || (canTreeLoadData && !isLoaded)));
  })();

  const setRowHeight = useCallback(action((key: Key, height: number, target: HTMLTableRowElement) => {
    if (inView && columnsInView && height && target.offsetParent) {
      if (metaData) {
        if (metaData.actualHeight !== height) {
          tableStore.batchSetRowHeight(key, () => metaData.setHeight(height));
        }
      } else if (needIntersection) {
        if (record.getState(VIRTUAL_HEIGHT) !== height) {
          record.setState(VIRTUAL_HEIGHT, height);
        }
      }
      if (!isStickySupport()) {
        if (get(tableStore.lockColumnsBodyRowsHeight, key) !== height) {
          set(tableStore.lockColumnsBodyRowsHeight, key, height);
        }
      }
    }
  }), [tableStore, metaData, inView, columnsInView, needIntersection, record]);

  const saveRef = useCallback(action((row: HTMLTableRowElement | null) => {
    rowRef.current = row;
    if (needSaveRowHeight) {
      if (row) {
        setRowHeight(rowKey, row.offsetHeight, row);
      } else if (!isStickySupport() && get(tableStore.lockColumnsBodyRowsHeight, rowKey)) {
        remove(tableStore.lockColumnsBodyRowsHeight, rowKey);
      }
    }
    if (provided) {
      provided.innerRef(row);
    }
    if (needIntersection && typeof intersectionRef === 'function') {
      intersectionRef(row);
    }
  }), [rowRef, intersectionRef, needIntersection, needSaveRowHeight, rowKey, provided, setRowHeight]);

  const handleMouseEnter = useCallback(() => {
    if (highLightRow) {
      tableStore.setRowHover(record, true);
    }
  }, [highLightRow, tableStore, record]);

  const handleMouseLeave = useCallback(() => {
    if (highLightRow) {
      tableStore.setRowHover(record, false);
    }
  }, [highLightRow, tableStore, record]);

  const handleSelection = useCallback(() => {
    dataSet[record.isSelected ? 'unSelect' : 'select'](record);
  }, [record, dataSet]);

  const handleClickCapture = useCallback(action<(e) => void>((e) => {
    if (!isDisabledRow(record) && e.target.dataset.selectionKey !== SELECTION_KEY) {
      dataSet.current = record;
    }
    const { onClickCapture } = rowExternalProps;
    if (typeof onClickCapture === 'function') {
      onClickCapture(e);
    }
  }), [record, dataSet, rowExternalProps]);

  const handleClick = useCallback(action<(e) => boolean | undefined>((e) => {
    const { onClick } = rowExternalProps;
    if (highLightRow === HighLightRowType.click && !tableStore.rowClicked) {
      tableStore.rowClicked = true;
    }
    if (typeof onClick === 'function') {
      return onClick(e);
    }
  }), [tableStore, rowExternalProps]);

  const handleSelectionByClick = useCallback(async (e) => {
    if (await handleClick(e) !== false) {
      handleSelection();
    }
  }, [handleClick, handleSelection]);

  const handleSelectionByMouseDown = useCallback((e) => {
    handleSelection();
    const { onMouseDown } = rowExternalProps;
    if (typeof onMouseDown === 'function') {
      onMouseDown(e);
    }
  }, [handleSelection, rowExternalProps]);

  const handleSelectionByDblClick = useCallback((e) => {
    handleSelection();
    const { onDoubleClick } = rowExternalProps;
    if (typeof onDoubleClick === 'function') {
      onDoubleClick(e);
    }
  }, [handleSelection, rowExternalProps]);

  const handleExpandChange = useCallback(() => {
    if (expandable) {
      tableStore.setRowExpanded(record, !isExpanded);
    }
  }, [tableStore, record, expandable, isExpanded]);

  const focusRow = useCallback(() => {
    const { current } = rowRef;
    if (current) {
      if (!lock && !tableStore.editing) {
        const { element } = node;
        const { activeElement } = document;
        if (
          element &&
          element.contains(activeElement) &&
          (isStickySupport() ? !current.contains(activeElement) : Array.from<HTMLTableRowElement>(
            element.querySelectorAll(`tr[data-index="${record.id}"]`),
          ).every(tr => !tr.contains(activeElement)))
        ) {
          current.focus();
        }
        // table 包含目前被focus的element
        // 找到当前组件对应record生成的组件对象 然后遍历 每个 tr里面不是focus的目标那么这个函数触发row.focus
      }

      if (tableStore.overflowY) {
        const { offsetParent } = current;
        if (offsetParent) {
          const tableBodyWrap = offsetParent.parentNode as HTMLDivElement;
          if (tableBodyWrap) {
            const { offsetTop, offsetHeight } = current;
            const { scrollTop, offsetHeight: height } = tableBodyWrap;
            const bottomSide = offsetTop + offsetHeight - height + measureScrollbar();
            let st = scrollTop;
            if (st < bottomSide) {
              st = bottomSide;
            }
            if (st > offsetTop) {
              st = offsetTop + 1;
            }
            if (st !== scrollTop) {
              tableBodyWrap.scrollTop = st;
              // node.handleBodyScrollTop({
              //   target: tableBodyWrap,
              //   currentTarget: tableBodyWrap,
              // });
            }
          }
        }
      }
    }
  }, [rowRef, tableStore, lock, node]);

  // componentDidMount
  useEffect(() => {
    mounted.current = true;
    if (record.status === RecordStatus.add && tableStore.autoFocus) {
      const editor = tableStore.editors.values().next().value;
      if (editor && (isStickySupport() || getColumnLock(editor.props.column.lock) === getColumnLock(lock))) {
        const cell = findCell(tableStore, getColumnKey(editor.props.column), lock);
        if (cell) {
          defer(() => cell.focus());
        }
      }
    }
    // componentWillUnmount
    return action(() => {
      mounted.current = false;
      /**
       * Fixed the when row resize has scrollbar the expanded row would be collapsed
       */
      if (!tableStore.isRowExpanded(record)) {
        tableStore.setRowExpanded(record, false, true);
      }
      if (!isStickySupport()) {
        remove(tableStore.lockColumnsBodyRowsHeight, rowKey);
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoading && expandable && isExpanded && !isLoaded && tableStore.canTreeLoadData && !record.children) {
      tableStore.onTreeNodeLoad({ record });
    }
  }, [isLoading, expandable, isExpanded, isLoaded, tableStore, record]);

  useEffect(() => {
    return reaction(() => record.isCurrent, isCurrent => isCurrent && focusRow());
  }, [record, focusRow]);

  const renderExpandRow = (): ReactElement<ExpandedRowProps>[] => {
    if (expandable && (isExpanded || childrenRenderedRef.current)) {
      const expandRows: ReactElement<ExpandedRowProps>[] = [];
      childrenRenderedRef.current = true;
      if (expandedRowRenderer) {
        const expandRowExternalProps: any =
          typeof onRow === 'function'
            ? onRow({
              dataSet,
              record,
              expandedRow: true,
              index,
            })
            : {};
        const classString = classNames(`${prefixCls}-expanded-row`, expandRowExternalProps.className);
        const rowProps: HTMLProps<HTMLTableRowElement> & { style: CSSProperties } = {
          key: `${rowKey}-expanded-row`,
          className: classString,
          style: { ...expandRowExternalProps.style },
        };

        if (!isStickySupport() && (tableStore.overflowX || !record.isCurrent)) {
          rowProps.onMouseEnter = handleMouseEnter;
          rowProps.onMouseLeave = handleMouseLeave;
        }

        if (!isExpanded) {
          rowProps.hidden = true;
        }
        const Element = isExpanded || !parityRow ? 'tr' : 'div';
        expandRows.push(
          <Element {...expandRowExternalProps} {...rowProps}>
            {expandIconAsCell && <td className={`${prefixCls}-cell`} key={EXPAND_KEY} />}
            <td
              key={`${EXPAND_KEY}-rest`}
              className={`${prefixCls}-cell`}
              colSpan={columnGroups.leafs.length - (expandIconAsCell ? 1 : 0)}
            >
              <div className={`${prefixCls}-cell-inner`}>
                {expandedRowRenderer({ dataSet, record })}
              </div>
            </td>
          </Element>,
        );
      }
      if (isValidElement<ExpandedRowProps>(children)) {
        expandRows.push(cloneElement(children, { parentExpanded: isExpanded, key: `${rowKey}-expanded-rows` }));
      }
      return expandRows;
    }
    return [];
  };

  const renderExpandIcon = () => {
    const { expandIcon } = tableStore;
    if (typeof expandIcon === 'function') {
      return expandIcon({
        prefixCls,
        expanded: isExpanded,
        expandable,
        needIndentSpaced: !expandable,
        record,
        onExpand: handleExpandChange,
      });
    }
    if (tableStore.isRowPending(record)) {
      return <Spin size={Size.small} />;
    }
    return (
      <ExpandIcon
        prefixCls={prefixCls}
        expandable={expandable}
        onChange={handleExpandChange}
        expanded={isExpanded}
      />
    );
  };

  const hasExpandIcon = (columnIndex: number) => (
    expandIconColumnIndex !== undefined && expandIconColumnIndex > -1 && (columnIndex + expandIconColumnIndex) === tableStore.expandIconColumnIndex
  );

  const getCell = (columnGroup: ColumnGroup, columnIndex: number, rest: Partial<TableCellProps>): ReactNode => (
    <TableCell
      columnGroup={columnGroup}
      record={headerGroupIndex === undefined ? record : getRecord(columnGroup, groupPath, headerGroupIndex, record)}
      isDragging={snapshot ? snapshot.isDragging : false}
      provided={rest.key === DRAG_KEY ? provided : undefined}
      inView={needIntersection ? inView : undefined}
      groupPath={groupPath}
      rowIndex={virtualIndex === undefined ? index : virtualIndex}
      {...rest}
    >
      {hasExpandIcon(columnIndex) ? renderExpandIcon() : undefined}
    </TableCell>
  );

  const getColumns = () => {
    const { customizable } = tableStore;
    const { leafs } = columnGroups;
    const columnLength = leafs.length;
    return leafs.map((columnGroup, columnIndex) => {
      const { key } = columnGroup;
      if (key !== CUSTOMIZED_KEY) {
        const colSpan = customizable && lock !== ColumnLock.left && (!rowDraggable || dragColumnAlign !== DragColumnAlign.right) && columnIndex === columnLength - 2 ? 2 : 1;
        const rest: Partial<TableCellProps> = {
          key,
          disabled,
        };
        if (colSpan > 1) {
          rest.colSpan = colSpan;
        }
        return getCell(columnGroup, columnIndex, rest);
      }
      return undefined;
    });
  };
  const rowPrefixCls = `${prefixCls}-row`;
  const classString = classNames(
    rowPrefixCls,
    {
      [`${rowPrefixCls}-current`]: highLightRow && record.isCurrent && (highLightRow === HighLightRowType.click ? tableStore.rowClicked : highLightRow === HighLightRowType.focus ? node.isFocused : highLightRow), // 性能优化，在 highLightRow 为 false 时，不受 record.isCurrent 影响
      [`${rowPrefixCls}-hover`]: !isStickySupport() && highLightRow && isHover,
      [`${rowPrefixCls}-selected`]: selectedHighLightRow && isSelectedRow(record),
      [`${rowPrefixCls}-disabled`]: disabled,
      [`${rowPrefixCls}-mouse-batch-choose`]: mouseBatchChooseState && record.selectable && (tableStore.mouseBatchChooseIdList || []).includes(id),
      [`${rowPrefixCls}-expanded`]: expandable && isExpanded,
      [`${rowPrefixCls}-has-next`]: metaData && metaData.next,
    },
    className, // 增加可以自定义类名满足拖拽功能
    rowExternalProps.className,
  );
  const { style } = rowExternalProps;
  const rowProps: HTMLProps<HTMLTableRowElement> & {
    style?: CSSProperties;
    'data-index': number;
  } = {
    ref: saveRef,
    className: classString,
    onClick: handleClick,
    onClickCapture: handleClickCapture,
    tabIndex: -1,
    disabled,
    'data-index': id,
  };
  if (!isStickySupport() && tableStore.overflowX) {
    rowProps.onMouseEnter = handleMouseEnter;
    rowProps.onMouseLeave = handleMouseLeave;
  }

  if (hidden || (!showRemovedRow && record.status === RecordStatus.delete)) {
    rowProps.hidden = true;
  }

  const Element = hidden && parityRow ? 'div' : 'tr';
  if (selectionMode === SelectionMode.click) {
    rowProps.onClick = handleSelectionByClick;
  } else if (selectionMode === SelectionMode.dblclick) {
    rowProps.onDoubleClick = handleSelectionByDblClick;
  } else if (selectionMode === SelectionMode.mousedown) {
    rowProps.onMouseDown = handleSelectionByMouseDown;
  }
  const rowStyle: CSSProperties = {
    ...style,
  };
  if (rowDraggable && provided) {
    Object.assign(rowProps, provided.draggableProps);
    Object.assign(rowStyle, provided.draggableProps.style, style);
    if (propStyle) {
      const { transform } = propStyle;
      if (transform) {
        if (rowStyle.transform) {
          rowStyle.transform = 'none';
        } else {
          rowStyle.transform = transform;
          if (!dragRef.current) {
            rowStyle.transition = 'none';
            dragRef.current = true;
          }
        }
      }
    } else {
      dragRef.current = false;
    }
    rowStyle.width = Math.max(tableStore.columnGroups.width, tableStore.width || 0);
    if (!dragColumnAlign) {
      rowStyle.cursor = 'move';
      Object.assign(rowProps, provided.dragHandleProps);
    }
  }

  const height = needIntersection && (!inView || !columnsInView) ? entry && (entry.target as HTMLTableRowElement).offsetParent ? pxToRem(entry.boundingClientRect.height || (entry.target as HTMLTableRowElement).offsetHeight, true) :
    pxToRem(metaData ? metaData.height : record.getState(VIRTUAL_HEIGHT) || tableStore.virtualRowHeight, true) : lock ?
    pxToRem(get(tableStore.lockColumnsBodyRowsHeight, rowKey) as number, true) : undefined;
  if (height) {
    rowStyle.height = height;
  }
  const tr = (
    <Element
      key={rowKey}
      {...rowExternalProps}
      {...rowProps}
      style={rowStyle}
    >
      {getColumns()}
    </Element>
  );
  return (
    <>
      {
        needSaveRowHeight ? (
          <ResizeObservedRow onResize={setRowHeight} rowIndex={rowKey} key={rowKey}>
            {tr}
          </ResizeObservedRow>
        ) : tr
      }
      {renderExpandRow()}
    </>
  );
};

TableRow.displayName = 'TableRow';

export default observer(TableRow);
