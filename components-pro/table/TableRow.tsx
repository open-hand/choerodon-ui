import React, { cloneElement, Component, CSSProperties, HTMLProps, isValidElement, Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, remove, set } from 'mobx';
import classNames from 'classnames';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import omit from 'lodash/omit';
import { ColumnProps } from './Column';
import TableCell from './TableCell';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import ExpandIcon from './ExpandIcon';
import { ColumnLock, DragColumnAlign, HighLightRowType, SelectionMode } from './enum';
import { findFirstFocusableElement, getColumnKey, isDisabledRow, isSelectedRow } from './utils';
import { DRAG_KEY, EXPAND_KEY, SELECTION_KEY } from './TableStore';
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
  dragColumnAlign?: DragColumnAlign;
}

@observer
export default class TableRow extends Component<TableRowProps, any> {
  static displayName = 'TableRow';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    columns: PropTypes.array.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
    dragColumnAlign: PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
  };

  static contextType = TableContext;

  rowKey: Key;

  rowExternalProps: any = {};

  childrenRendered: boolean = false;

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
  getCell(column: ColumnProps, index: number, isDragging: boolean): ReactNode {
    const { prefixCls, record, indentSize, lock, dragColumnAlign } = this.props;
    const {
      tableStore: { leafColumns, rightLeafColumns },
    } = this.context;
    const columnIndex =
      lock === 'right' ? index + leafColumns.length - rightLeafColumns.length : index;
    return (
      <TableCell
        key={getColumnKey(column)}
        prefixCls={prefixCls}
        column={column}
        record={record}
        indentSize={indentSize}
        isDragging={isDragging}
        lock={lock}
        style={dragColumnAlign && column.key === DRAG_KEY ? { cursor: 'move' } : {}}
      >
        {this.hasExpandIcon(columnIndex) && this.renderExpandIcon()}
      </TableCell>
    );
  }

  focusRow(row: HTMLTableRowElement | null) {
    if (row) {
      const {
        tableStore: { node, overflowY, currentEditorName, inlineEdit },
      } = this.context;
      const { lock, record } = this.props;
      /**
       * 判断是否为ie浏览器
       */
        // @ts-ignore
      const isIE: boolean = !!window.ActiveXObject || 'ActiveXObject' in window;
      // 当不是为lock 和 当前不是编辑状态的时候
      if (!lock && !currentEditorName) {
        const { element } = node;
        // table 包含目前被focus的element
        // 找到当前组件对应record生成的组件对象 然后遍历 每个 tr里面不是focus的目标那么这个函数触发row.focus
        if (
          element &&
          element.contains(document.activeElement) &&
          !inlineEdit &&   // 这里的原因是因为当编辑状态为inline的时候currentEditorName永远为 undefined 所以暂时屏蔽掉
          Array.from<HTMLTableRowElement>(
            element.querySelectorAll(`tr[data-index="${record.id}"]`),
          ).every(tr => !tr.contains(document.activeElement))
        ) {
          if (isIE) {
            element.setActive(); // IE/Edge 暂时这样使用保证ie下可以被检测到已经激活
          } else {
            element.focus(); // All other browsers
          }
        }
      }

      if (overflowY) {
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
    const {
      tableStore: { autoFocus },
    } = this.context;
    if (record.status === RecordStatus.add && autoFocus) {
      const cell = this.node && lock !== ColumnLock.right ? findFirstFocusableElement(this.node) : null;
      if (cell) {
        cell.focus();
      }
    }
    this.syncLoadData();
  }

  componentDidUpdate() {
    const { record } = this.props;
    if (record.isCurrent) {
      this.focusRow(this.node);
    }
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
    remove(tableStore.lockColumnsBodyRowsHeight, this.rowKey);
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
    const { prefixCls, record } = this.props;
    const {
      tableStore,
      tableStore: { expandIcon },
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
      props: { children, columns, record, prefixCls, index },
    } = this;
    const { tableStore } = this.context;
    const {
      props: { expandedRowRenderer, onRow },
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

  render() {
    const { prefixCls, columns, record, lock, hidden, index, provided, snapshot, dragColumnAlign, className } = this.props;
    const {
      tableStore: {
        rowHeight,
        lockColumnsBodyRowsHeight,
        overflowX,
        highLightRow,
        selectedHighLightRow,
        mouseBatchChooseIdList,
        mouseBatchChooseState,
        dragColumnAlign: dragColumnAlignProps,
        dragRow,
        props: { onRow, rowRenderer, selectionMode },
      },
    } = this.context;
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
    if (overflowX) {
      rowProps.onMouseEnter = this.handleMouseEnter;
      rowProps.onMouseLeave = this.handleMouseLeave;
    }
    if (dragRow && provided && provided.draggableProps) {
      rowProps.style = { ...provided.draggableProps.style, ...rowExternalProps.style, cursor: 'move' };
      if (!dragColumnAlign && dragColumnAlignProps) {
        rowProps.style = omit(rowProps.style, ['cursor']);
      }
    }

    if (hidden) {
      rowProps.style.display = 'none';
    }
    if (lock && rowHeight === 'auto') {
      rowProps.style.height = pxToRem(get(lockColumnsBodyRowsHeight, key) as number);
    }
    if (selectionMode === SelectionMode.click) {
      rowProps.onClick = this.handleSelectionByClick;
    } else if (selectionMode === SelectionMode.dblclick) {
      rowProps.onDoubleClick = this.handleSelectionByDblClick;
    } else if (selectionMode === SelectionMode.mousedown) {
      rowProps.onMouseDown = this.handleSelectionByMouseDown;
    }

    const getCellWithDrag = (columnItem: ColumnProps, indexItem: number) => {
      return this.getCell(columnItem, indexItem, snapshot ? snapshot.isDragging : false);
    };

    const filterDrag = (columnItem: ColumnProps) => {
      if (dragColumnAlign) {
        return columnItem.key === DRAG_KEY;
      }
      return true;
    };
    const tr = (
      <tr
        key={key}
        {...rowExternalProps}
        {...rowProps}
        {...(provided && provided.draggableProps)}
        {...(provided && provided.dragHandleProps)}
        style={rowProps.style}
      >
        {columns.filter(filterDrag).map(getCellWithDrag)}
      </tr>
    );
    return [
      !lock && rowHeight === 'auto' ? (
        <ResizeObservedRow onResize={this.handleResize} rowIndex={key}>
          {tr}
        </ResizeObservedRow>
      ) : tr,
      ...this.renderExpandRow(),
    ];
  }
}
