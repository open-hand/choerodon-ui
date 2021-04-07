import React, { cloneElement, Component, CSSProperties, HTMLProps, isValidElement, Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, remove, set } from 'mobx';
import classNames from 'classnames';
import defer from 'lodash/defer';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import ReactIntersectionObserver from 'react-intersection-observer';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps, columnWidth } from './Column';
import TableCell, { TableCellProps } from './TableCell';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import ExpandIcon from './ExpandIcon';
import { ColumnLock, DragColumnAlign, HighLightRowType, SelectionMode } from './enum';
import { findCell, getColumnKey, getColumnLock, isDisabledRow, isSelectedRow, isStickySupport } from './utils';
import { CUSTOMIZED_KEY, DRAG_KEY, EXPAND_KEY, SELECTION_KEY } from './TableStore';
import { ExpandedRowProps } from './ExpandedRow';
import autobind from '../_util/autobind';
import { RecordStatus } from '../data-set/enum';
import ResizeObservedRow from './ResizeObservedRow';
import Spin from '../spin';

export interface TableRowProps extends ElementProps {
  lock?: ColumnLock | boolean;
  columns: ColumnProps[];
  record: Record;
  indentSize: number;
  index: number;
  snapshot?: DraggableStateSnapshot;
  provided?: DraggableProvided;
}

@observer
export default class TableRow extends Component<TableRowProps, any> {
  static displayName = 'TableRow';

  static propTypes = {
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    columns: PropTypes.array.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
  };

  static contextType = TableContext;

  rowKey: Key;

  rowExternalProps: any = {};

  childrenRendered: boolean = false;

  isCurrent: boolean = false;

  node: HTMLTableRowElement | null;

  @computed
  get expandable(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    const { isLeaf } = this.rowExternalProps;
    const {
      props: { expandedRowRenderer },
      isTree,
      canTreeLoadData,
    } = tableStore;
    if (isLeaf === true) {
      return false;
    }
    return !!expandedRowRenderer || (isTree && (!!record.children || (canTreeLoadData && !this.isLoaded)));
  }

  @computed
  get isLoading(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    return tableStore.isRowPending(record);
  }

  @computed
  get isLoaded(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    return tableStore.isRowLoaded(record);
  }

  @computed
  get isExpanded(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    return tableStore.isRowExpanded(record);
  }

  set isExpanded(expanded: boolean) {
    const { tableStore } = this.context;
    const { record } = this.props;
    tableStore.setRowExpanded(record, expanded);
  }

  @computed
  get isHover(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    return tableStore.isRowHover(record);
  }

  @computed
  get isClicked(): boolean {
    const { tableStore } = this.context;
    const { record } = this.props;
    return tableStore.isRowClick(record);
  }

  set isClicked(click: boolean) {
    const { tableStore } = this.context;
    if (tableStore.highLightRow) {
      const { record } = this.props;
      tableStore.setRowClicked(record, click);
    }
  }

  @computed
  get isHighLightRow(): boolean {
    const {
      tableStore: { highLightRow },
      tableStore,
    } = this.context;
    if (highLightRow === false) {
      return false;
    }
    if (highLightRow === HighLightRowType.click) {
      return highLightRow && tableStore.isRowHighLight && this.isClicked;
    }
    return highLightRow && tableStore.isRowHighLight;
  }

  set isHover(hover: boolean) {
    const { tableStore } = this.context;
    if (tableStore.highLightRow) {
      const { record } = this.props;
      tableStore.setRowHover(record, hover);
    }
  }

  @autobind
  @action
  private saveRef(node: HTMLTableRowElement | null) {
    if (node) {
      this.node = node;
      const { lock, record } = this.props;
      const {
        tableStore: { rowHeight, lockColumnsBodyRowsHeight },
      } = this.context;
      if (rowHeight === 'auto' && !lock) {
        set(lockColumnsBodyRowsHeight, (this.rowKey = record.key), node.offsetHeight);
      }
    }
  }

  @autobind
  handleMouseEnter() {
    this.isHover = true;
  }

  @autobind
  handleMouseLeave() {
    this.isHover = false;
  }

  @autobind
  async handleSelectionByClick(e) {
    if (await this.handleClick(e) !== false) {
      this.handleSelection();
    }
  }

  @autobind
  handleSelectionByMouseDown(e) {
    this.handleSelection();
    const { onMouseDown } = this.rowExternalProps;
    if (typeof onMouseDown === 'function') {
      onMouseDown(e);
    }
  }

  @autobind
  handleSelectionByDblClick(e) {
    this.handleSelection();
    const { onDoubleClick } = this.rowExternalProps;
    if (typeof onDoubleClick === 'function') {
      onDoubleClick(e);
    }
  }

  @autobind
  handleExpandChange() {
    if (this.expandable) {
      this.isExpanded = !this.isExpanded;
    }
  }

  @autobind
  handleClickCapture(e) {
    const {
      record,
      record: { dataSet },
    } = this.props;
    if (dataSet && !isDisabledRow(record) && e.target.dataset.selectionKey !== SELECTION_KEY) {
      dataSet.current = record;
    }
    const { onClickCapture } = this.rowExternalProps;
    if (typeof onClickCapture === 'function') {
      onClickCapture(e);
    }
  }

  @autobind
  handleClick(e) {
    const { onClick } = this.rowExternalProps;
    const {
      tableStore: {
        highLightRow,
      },
      tableStore,
    } = this.context;
    if (highLightRow !== true) {
      this.isClicked = true;
      tableStore.setRowHighLight(true);
    }
    if (typeof onClick === 'function') {
      return onClick(e);
    }
  }

  @autobind
  handleResize(index: Key, height: number) {
    this.setRowHeight(index, height);
  }

  @action
  setRowHeight(index: Key, height: number) {
    const { tableStore } = this.context;
    set(tableStore.lockColumnsBodyRowsHeight, index, height);
  }

  @autobind
  getCell(column: ColumnProps, index: number, props: Partial<TableCellProps>): ReactNode {
    const { record, indentSize, lock, provided, snapshot, index: rowIndex } = this.props;
    const {
      tableStore: { leafColumns, rightLeafColumns, node, props: { virtualCell } },
    } = this.context;
    const columnIndex =
      lock === ColumnLock.right ? index + leafColumns.length - rightLeafColumns.length : index;
    const isDragging = snapshot ? snapshot.isDragging : false;
    const cell = (
      <TableCell
        inView
        column={column}
        record={record}
        indentSize={indentSize}
        isDragging={isDragging}
        lock={lock}
        provided={props.key === DRAG_KEY ? provided : undefined}
        {...props}
      >
        {this.hasExpandIcon(columnIndex) && this.renderExpandIcon()}
      </TableCell>
    );
    return virtualCell ? (
      <ReactIntersectionObserver
        key={props.key}
        root={node.tableBodyWrap || node.element}
        rootMargin="100px"
        initialInView={rowIndex <= 10}
      >
        {
          ({ ref, inView }) => (
            cloneElement<any>(cell, { inView, intersectionRef: ref })
          )
        }
      </ReactIntersectionObserver>
    ) : cell;
  }

  focusRow() {
    const row = this.node;
    if (row) {
      const {
        tableStore: { node, overflowY, editing },
      } = this.context;
      const { lock, record } = this.props;
      if (!lock && !editing) {
        const { element } = node;
        if (
          element &&
          element.contains(document.activeElement) &&
          (isStickySupport() ? !row.contains(document.activeElement) : Array.from<HTMLTableRowElement>(
            element.querySelectorAll(`tr[data-index="${record.id}"]`),
          ).every(tr => !tr.contains(document.activeElement)))
        ) {
          row.focus();
        }
        // table 包含目前被focus的element
        // 找到当前组件对应record生成的组件对象 然后遍历 每个 tr里面不是focus的目标那么这个函数触发row.focus
      }

      if (!isStickySupport() && overflowY) {
        const { offsetParent } = row;
        if (offsetParent) {
          const tableBodyWrap = offsetParent.parentNode as HTMLDivElement;
          if (tableBodyWrap) {
            const { offsetTop, offsetHeight } = row;
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
              node.handleBodyScrollTop({
                target: tableBodyWrap,
                currentTarget: tableBodyWrap,
              });
            }
          }
        }
      }
    }
  }

  componentDidMount() {
    const { lock, record } = this.props;
    const { tableStore } = this.context;
    if (record.status === RecordStatus.add && tableStore.autoFocus) {
      const editor = [...tableStore.editors.values()][0];
      if (editor && (isStickySupport() || getColumnLock(editor.props.column.lock) === getColumnLock(lock))) {
        const cell = findCell(tableStore, getColumnKey(editor.props.column), lock);
        if (cell) {
          defer(() => cell.focus())
        }
      }
    }
    this.syncLoadData();
  }

  componentDidUpdate() {
    const { record } = this.props;
    if (record.isCurrent && !this.isCurrent) {
      this.focusRow();
    }
    this.isCurrent = record.isCurrent;
    this.syncLoadData();
  }

  @action
  componentWillUnmount() {
    const { record } = this.props;
    const { tableStore } = this.context;
    /**
     * Fixed the when row resize has scrollbar the expanded row would be collapsed
     */
    if (!tableStore.isRowExpanded(record)) {
      tableStore.setRowExpanded(record, false, true);
    }
    if (!isStickySupport()) {
      remove(tableStore.lockColumnsBodyRowsHeight, this.rowKey);
    }
  }

  handleSelection() {
    const { record } = this.props;
    const { dataSet } = record;
    if (dataSet) {
      dataSet[record.isSelected ? 'unSelect' : 'select'](record);
    }
  }

  hasExpandIcon(columnIndex) {
    const { tableStore } = this.context;
    const {
      props: { expandRowByClick, expandedRowRenderer },
      expandIconColumnIndex,
      isTree,
    } = tableStore;
    return (
      !expandRowByClick && (expandedRowRenderer || isTree) && columnIndex === expandIconColumnIndex
    );
  }

  syncLoadData() {
    if (this.isLoading) return;
    const { record } = this.props;
    const {
      tableStore,
    } = this.context;
    const { isExpanded, isLoaded, expandable } = this;
    const {
      canTreeLoadData,
    } = tableStore;

    if (canTreeLoadData && isExpanded && expandable) {
      if (!record.children && !isLoaded) {
        tableStore.onTreeNodeLoad({ record });
      }
    }
  }

  renderExpandIcon() {
    const { record } = this.props;
    const {
      tableStore,
      tableStore: { prefixCls, expandIcon },
    } = this.context;
    const { isExpanded: expanded, expandable, handleExpandChange } = this;
    if (typeof expandIcon === 'function') {
      return expandIcon({
        prefixCls,
        expanded,
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
        expanded={expanded}
      />
    );
  }

  renderExpandRow(): ReactNode[] {
    const {
      isExpanded,
      props: { children, columns, record, index },
    } = this;
    const { tableStore } = this.context;
    const {
      props: { expandedRowRenderer, onRow },
      prefixCls,
      expandIconAsCell,
      overflowX,
    } = tableStore;
    const expandRows: ReactNode[] = [];
    if (isExpanded || this.childrenRendered) {
      this.childrenRendered = true;
      if (expandedRowRenderer) {
        const rowExternalProps =
          typeof onRow === 'function'
            ? onRow({
              dataSet: record.dataSet!,
              record,
              expandedRow: true,
              index,
            })
            : {};
        const classString = classNames(`${prefixCls}-expanded-row`, rowExternalProps.className);
        const rowProps: HTMLProps<HTMLTableRowElement> & { style: CSSProperties; } = {
          key: `${record.key}-expanded-row`,
          className: classString,
          style: { ...rowExternalProps.style },
        };

        if (overflowX || !record.isCurrent) {
          rowProps.onMouseEnter = this.handleMouseEnter;
          rowProps.onMouseLeave = this.handleMouseLeave;
        }

        if (!isExpanded) {
          rowProps.style.display = 'none';
        }
        expandRows.push(
          <tr {...rowExternalProps} {...rowProps}>
            {expandIconAsCell && <td key={EXPAND_KEY} />}
            <td
              key={`${EXPAND_KEY}-rest`}
              className={`${prefixCls}-cell`}
              colSpan={columns.length - (expandIconAsCell ? 1 : 0)}
            >
              <div className={`${prefixCls}-cell-inner`}>
                {expandedRowRenderer({ dataSet: record.dataSet!, record })}
              </div>
            </td>
          </tr>,
        );
      }
      if (isValidElement<ExpandedRowProps>(children)) {
        expandRows.push(cloneElement(children, { isExpanded, key: `${record.key}-expanded-rows` }));
      }
    }
    return expandRows;
  }

  getColumns() {
    const { columns, lock } = this.props;
    const { tableStore } = this.context;
    const { prefixCls, customizable, rowDraggable, dragColumnAlign } = tableStore;
    let leftWidth = 0;
    let rightWidth = isStickySupport() && tableStore.overflowX ? tableStore.rightLeafColumnsWidth : 0;
    const columnLength = columns.length;
    return columns.map((column, index, cols) => {
      const key = getColumnKey(column);
      if (key !== CUSTOMIZED_KEY) {
        const colSpan = customizable && lock !== ColumnLock.left && (!rowDraggable || dragColumnAlign !== DragColumnAlign.right) && index === columnLength - 2 ? 2 : 1;
        const props: Partial<TableCellProps> = {
          key,
        };
        if (colSpan > 1) {
          props.colSpan = colSpan;
        }
        if (isStickySupport() && tableStore.overflowX) {
          const columnLock = getColumnLock(column.lock);
          if (columnLock === ColumnLock.left) {
            props.style = {
              left: pxToRem(leftWidth)!,
            };
            const next = cols[index + 1];
            if (!next || getColumnLock(next.lock) !== ColumnLock.left) {
              props.className = `${prefixCls}-cell-fix-left-last`;
            }
            leftWidth += columnWidth(column);
          } else if (columnLock === ColumnLock.right) {
            rightWidth -= columnWidth(column);
            const prev = cols[index - 1];
            if (!prev || prev.lock !== ColumnLock.right) {
              props.className = `${prefixCls}-cell-fix-right-first`;
            }
            if (colSpan > 1) {
              for (let i = 1; i < colSpan; i++) {
                const next = cols[index + i];
                if (next) {
                  rightWidth -= columnWidth(next);
                }
              }
            }
            props.style = {
              right: pxToRem(rightWidth)!,
            };
          }
        }
        return this.getCell(column, index, props);
      }
      return undefined;
    });
  }

  render() {
    const { record, lock, hidden, index, provided, className } = this.props;
    const {
      tableStore,
    } = this.context;
    const {
      prefixCls,
      rowHeight,
      overflowX,
      highLightRow,
      selectedHighLightRow,
      mouseBatchChooseIdList,
      mouseBatchChooseState,
      dragColumnAlign,
      rowDraggable,
      totalLeafColumnsWidth,
      width,
      props: { onRow, rowRenderer, selectionMode },
    } = tableStore;
    const { key, id } = record;
    const rowExternalProps: any = {
      ...(typeof rowRenderer === 'function' ? rowRenderer(record, index) : {}), // deprecated
      ...(typeof onRow === 'function'
        ? onRow({
          dataSet: record.dataSet!,
          record,
          expandedRow: false,
          index,
        })
        : {}),
    };
    this.rowExternalProps = rowExternalProps;
    const disabled = isDisabledRow(record);
    const rowPrefixCls = `${prefixCls}-row`;
    const classString = classNames(
      rowPrefixCls,
      {
        [`${rowPrefixCls}-current`]: highLightRow && record.isCurrent, // 性能优化，在 highLightRow 为 false 时，不受 record.isCurrent 影响
        [`${rowPrefixCls}-hover`]: highLightRow && this.isHover,
        [`${rowPrefixCls}-clicked`]: highLightRow === HighLightRowType.click && this.isClicked,
        [`${rowPrefixCls}-highlight`]: this.isHighLightRow,
        [`${rowPrefixCls}-selected`]: selectedHighLightRow && isSelectedRow(record),
        [`${rowPrefixCls}-disabled`]: disabled,
        [`${rowPrefixCls}-mouse-batch-choose`]: mouseBatchChooseState && (mouseBatchChooseIdList || []).includes(id),
        [`${rowPrefixCls}-expanded`]: this.isExpanded,
      },
      className, // 增加可以自定义类名满足拖拽功能
      rowExternalProps.className,
    );
    const rowProps: HTMLProps<HTMLTableRowElement> & {
      style: CSSProperties;
      'data-index': number;
    } = {
      ref: (ref) => {
        this.saveRef(ref);
        if (provided) {
          provided.innerRef(ref);
        }
      },
      className: classString,
      style: { ...rowExternalProps.style },
      onClick: this.handleClick,
      onClickCapture: this.handleClickCapture,
      tabIndex: -1,
      disabled,
      'data-index': id,
    };
    if (!isStickySupport() && overflowX) {
      rowProps.onMouseEnter = this.handleMouseEnter;
      rowProps.onMouseLeave = this.handleMouseLeave;
    }

    if (hidden) {
      rowProps.style.display = 'none';
    }
    if (!isStickySupport() && lock && rowHeight === 'auto') {
      rowProps.style.height = pxToRem(get(tableStore.lockColumnsBodyRowsHeight, key) as number);
    }
    if (selectionMode === SelectionMode.click) {
      rowProps.onClick = this.handleSelectionByClick;
    } else if (selectionMode === SelectionMode.dblclick) {
      rowProps.onDoubleClick = this.handleSelectionByDblClick;
    } else if (selectionMode === SelectionMode.mousedown) {
      rowProps.onMouseDown = this.handleSelectionByMouseDown;
    }
    if (rowDraggable && provided) {
      Object.assign(rowProps, provided.draggableProps);
      rowProps.style = { ...provided.draggableProps.style, ...rowExternalProps.style, width: Math.max(totalLeafColumnsWidth, width) };
      if (!dragColumnAlign) {
        rowProps.style.cursor = 'move';
        Object.assign(rowProps, provided.dragHandleProps);
      }
    }

    const tr = (
      <tr
        key={key}
        {...rowExternalProps}
        {...rowProps}
      >
        {this.getColumns()}
      </tr>
    );
    return [
      !isStickySupport() && !lock && rowHeight === 'auto' ? (
        <ResizeObservedRow onResize={this.handleResize} rowIndex={key}>
          {tr}
        </ResizeObservedRow>
      ) : tr,
      ...this.renderExpandRow(),
    ];
  }
}
