import React, { cloneElement, Component, CSSProperties, HTMLProps, isValidElement, Key, ReactElement, ReactNode } from 'react';
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
import { ColumnProps } from './Column';
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
  };

  static contextType = TableContext;

  rowKey: Key;

  rowExternalProps: any = {};

  childrenRendered: boolean = false;

  isCurrent: boolean | undefined;

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
  get isHighLightRow(): boolean {
    const {
      tableStore: { highLightRow },
      tableStore,
    } = this.context;
    if (highLightRow === HighLightRowType.click) {
      return tableStore.rowClicked;
    }
    if (highLightRow === HighLightRowType.focus) {
      return tableStore.node.isFocused;
    }
    return highLightRow;
  }

  set isHover(hover: boolean) {
    const { tableStore } = this.context;
    if (tableStore.highLightRow) {
      const { record } = this.props;
      tableStore.setRowHover(record, hover);
    }
  }

  private needSaveRowHeight(): boolean {
    if (!isStickySupport()) {
      const { lock, record } = this.props;
      const { tableStore } = this.context;
      return !lock && (tableStore.rowHeight === 'auto' || (tableStore.hasAggregationColumn && tableStore.aggregation) || [...record.fields.values()].some(field => field.get('multiLine')));
    }
    return false;
  }

  @autobind
  private saveRef(node: HTMLTableRowElement | null) {
    if (node) {
      this.node = node;
      if (this.needSaveRowHeight()) {
        const { record } = this.props;
        this.setRowHeight(this.rowKey = record.key, node.offsetHeight);
      }
    }
    const { provided } = this.props;
    if (provided) {
      provided.innerRef(node);
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
  @action
  handleClick(e) {
    const { onClick } = this.rowExternalProps;
    const { tableStore } = this.context;
    if (tableStore.highLightRow === HighLightRowType.click && !tableStore.rowClicked) {
      tableStore.rowClicked = true;
    }
    if (typeof onClick === 'function') {
      return onClick(e);
    }
  }

  @autobind
  handleResize(key: Key, height: number) {
    this.setRowHeight(key, height);
  }

  @action
  setRowHeight(key: Key, height: number) {
    const { tableStore } = this.context;
    set(tableStore.lockColumnsBodyRowsHeight, key, height);
  }

  @autobind
  getCell(column: ColumnProps, index: number, props: Partial<TableCellProps>): ReactNode {
    const { record, lock, provided, snapshot } = this.props;
    const isDragging = snapshot ? snapshot.isDragging : false;
    return (
      <TableCell
        column={column}
        record={record}
        isDragging={isDragging}
        lock={lock}
        provided={props.key === DRAG_KEY ? provided : undefined}
        {...props}
      >
        {this.hasExpandIcon(index) ? this.renderExpandIcon() : undefined}
      </TableCell>
    );
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
          defer(() => cell.focus());
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

  hasExpandIcon(index: number) {
    const { props } = this;
    const { tableStore } = this.context;
    const {
      props: { expandRowByClick, expandedRowRenderer },
      expandIconColumnIndex,
    } = tableStore;
    return (
      !expandRowByClick &&
      (expandedRowRenderer || tableStore.isTree) &&
      (props.lock === ColumnLock.right ? index + tableStore.leafColumns.length - tableStore.rightLeafColumns.length : index) === expandIconColumnIndex
    );
  }

  syncLoadData() {
    if (this.isLoading) return;
    const { tableStore } = this.context;
    if (tableStore.canTreeLoadData && this.expandable && this.isExpanded && !this.isLoaded) {
      const { record } = this.props;
      if (!record.children) {
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

  renderExpandRow(): ReactElement<ExpandedRowProps>[] {
    if (this.expandable) {
      const { isExpanded } = this;
      if (isExpanded || this.childrenRendered) {
        const {
          props: { children, columns, record, index },
        } = this;
        const { tableStore } = this.context;
        const {
          props: { expandedRowRenderer, onRow },
          prefixCls,
          expandIconAsCell,
          overflowX,
          parityRow,
        } = tableStore;
        const expandRows: ReactElement<ExpandedRowProps>[] = [];
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

          if (!isStickySupport() && (overflowX || !record.isCurrent)) {
            rowProps.onMouseEnter = this.handleMouseEnter;
            rowProps.onMouseLeave = this.handleMouseLeave;
          }

          if (!isExpanded) {
            rowProps.hidden = true;
          }
          const Element = isExpanded || !parityRow ? 'tr' : 'div';
          expandRows.push(
            <Element {...rowExternalProps} {...rowProps}>
              {expandIconAsCell && <td className={`${prefixCls}-cell`} key={EXPAND_KEY} />}
              <td
                key={`${EXPAND_KEY}-rest`}
                className={`${prefixCls}-cell`}
                colSpan={columns.length - (expandIconAsCell ? 1 : 0)}
              >
                <div className={`${prefixCls}-cell-inner`}>
                  {expandedRowRenderer({ dataSet: record.dataSet!, record })}
                </div>
              </td>
            </Element>,
          );
        }
        if (isValidElement<ExpandedRowProps>(children)) {
          expandRows.push(cloneElement(children, { isExpanded, key: `${record.key}-expanded-rows` }));
        }
        return expandRows;
      }
    }
    return [];
  }

  getColumns(disabled: boolean) {
    const { columns, lock } = this.props;
    const { tableStore } = this.context;
    const { customizable, rowDraggable, dragColumnAlign } = tableStore;
    const columnLength = columns.length;
    return columns.map((column, index) => {
      const key = getColumnKey(column);
      if (key !== CUSTOMIZED_KEY) {
        const colSpan = customizable && lock !== ColumnLock.left && (!rowDraggable || dragColumnAlign !== DragColumnAlign.right) && index === columnLength - 2 ? 2 : 1;
        const props: Partial<TableCellProps> = {
          key,
          disabled,
        };
        if (colSpan > 1) {
          props.colSpan = colSpan;
        }
        return this.getCell(column, index, props);
      }
      return undefined;
    });
  }

  render() {
    const { record, hidden, index, provided, className, lock } = this.props;
    const {
      tableStore,
    } = this.context;
    const {
      prefixCls,
      highLightRow,
      selectedHighLightRow,
      mouseBatchChooseState,
      dragColumnAlign,
      rowDraggable,
      parityRow,
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
        [`${rowPrefixCls}-current`]: highLightRow && record.isCurrent && this.isHighLightRow, // 性能优化，在 highLightRow 为 false 时，不受 record.isCurrent 影响
        [`${rowPrefixCls}-hover`]: !isStickySupport() && highLightRow && this.isHover,
        [`${rowPrefixCls}-selected`]: selectedHighLightRow && isSelectedRow(record),
        [`${rowPrefixCls}-disabled`]: disabled,
        [`${rowPrefixCls}-mouse-batch-choose`]: mouseBatchChooseState && record.selectable && (tableStore.mouseBatchChooseIdList || []).includes(id),
        [`${rowPrefixCls}-expanded`]: this.expandable && this.isExpanded,
      },
      className, // 增加可以自定义类名满足拖拽功能
      rowExternalProps.className,
    );
    const { style } = rowExternalProps;
    const rowProps: HTMLProps<HTMLTableRowElement> & {
      style?: CSSProperties;
      'data-index': number;
    } = {
      ref: this.saveRef,
      className: classString,
      onClick: this.handleClick,
      onClickCapture: this.handleClickCapture,
      tabIndex: -1,
      disabled,
      'data-index': id,
    };
    if (!isStickySupport() && tableStore.overflowX) {
      rowProps.onMouseEnter = this.handleMouseEnter;
      rowProps.onMouseLeave = this.handleMouseLeave;
    }

    if (hidden) {
      rowProps.hidden = true;
    }
    const Element = hidden && parityRow ? 'div' : 'tr';
    if (selectionMode === SelectionMode.click) {
      rowProps.onClick = this.handleSelectionByClick;
    } else if (selectionMode === SelectionMode.dblclick) {
      rowProps.onDoubleClick = this.handleSelectionByDblClick;
    } else if (selectionMode === SelectionMode.mousedown) {
      rowProps.onMouseDown = this.handleSelectionByMouseDown;
    }
    if (rowDraggable && provided) {
      Object.assign(rowProps, provided.draggableProps);
      rowProps.style = {
        ...provided.draggableProps.style, ...style,
        width: Math.max(tableStore.totalLeafColumnsWidth, tableStore.width),
      };
      if (!dragColumnAlign) {
        rowProps.style!.cursor = 'move';
        Object.assign(rowProps, provided.dragHandleProps);
      }
    } else if (style) {
      rowProps.style = { ...style };
    }
    if (lock) {
      const height = pxToRem(get(tableStore.lockColumnsBodyRowsHeight, key) as number);
      if (height) {
        if (rowProps.style) {
          rowProps.style.height = height;
        } else {
          rowProps.style = { height };
        }
      }
    }

    const tr = (
      <Element
        key={key}
        {...rowExternalProps}
        {...rowProps}
      >
        {this.getColumns(disabled)}
      </Element>
    );
    let row = tr;
    if (!hidden && tableStore.virtualCell) {
      const { node } = tableStore;
      const { index: rowIndex } = this.props;
      row = (
        <ReactIntersectionObserver
          key={key}
          root={tableStore.overflowY ? node.tableBodyWrap || node.element : undefined}
          rootMargin="100px"
          initialInView={rowIndex <= 10}
          triggerOnce
        >
          {
            ({ ref, inView }) => {
              if (record.getState('__inView') !== true) {
                record.setState('__inView', inView);
              }
              const trProps: { ref, style?: CSSProperties } = {
                ref,
              };
              if (record.getState('__inView') !== true) {
                const { rowHeight, aggregation } = tableStore;
                trProps.style = {
                  ...tr.props.style,
                  height: pxToRem((rowHeight === 'auto' ? 30 : rowHeight) * (aggregation && tableStore.hasAggregationColumn ? 4 : 1)),
                };
              }
              return cloneElement<any>(tr, trProps);
            }
          }
        </ReactIntersectionObserver>
      );
    }
    return [
      this.needSaveRowHeight() ? (
        <ResizeObservedRow onResize={this.handleResize} rowIndex={key} key={key}>
          {row}
        </ResizeObservedRow>
      ) : row,
      ...this.renderExpandRow(),
    ];
  }
}
