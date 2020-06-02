import React, {
  cloneElement,
  Component,
  CSSProperties,
  HTMLProps,
  isValidElement,
  Key,
  ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, remove, set } from 'mobx';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps } from './Column';
import TableCell from './TableCell';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import ExpandIcon from './ExpandIcon';
import { ColumnLock, SelectionMode } from './enum';
import { getColumnKey, isDisabledRow, isSelectedRow } from './utils';
import { EXPAND_KEY } from './TableStore';
import { ExpandedRowProps } from './ExpandedRow';
import autobind from '../_util/autobind';

export interface TableRowProps extends ElementProps {
  lock?: ColumnLock | boolean;
  columns: ColumnProps[];
  record: Record;
  indentSize: number;
  index: number;
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
  };

  static contextType = TableContext;

  rowKey: Key;

  rowExternalProps: any = {};

  childrenRendered: boolean = false;

  node: HTMLTableRowElement | null;

  @computed
  get expandable(): boolean {
    const {
      tableStore: {
        isTree,
        props: { expandedRowRenderer },
      },
    } = this.context;
    const { record } = this.props;
    return !!expandedRowRenderer || (isTree && !!record.children);
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
  handleSelectionByClick(e) {
    this.handleSelection();
    this.handleClick(e);
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
    if (dataSet && !isDisabledRow(record)) {
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
    if (typeof onClick === 'function') {
      onClick(e);
    }
  }

  @autobind
  getCell(column: ColumnProps, index: number): ReactNode {
    const { prefixCls, record, indentSize, lock } = this.props;
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
      >
        {this.hasExpandIcon(columnIndex) && this.renderExpandIcon()}
      </TableCell>
    );
  }

  focusRow(row: HTMLTableRowElement | null) {
    if (row) {
      const {
        tableStore: { node, overflowY, currentEditorName },
      } = this.context;
      const { lock, record } = this.props;
      if (!lock && !currentEditorName) {
        const { element } = node;
        if (
          element &&
          element.contains(document.activeElement) &&
          Array.from<HTMLTableRowElement>(
            element.querySelectorAll(`tr[data-index="${record.id}"]`),
          ).every(tr => !tr.contains(document.activeElement))
        ) {
          row.focus();
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
    const { record } = this.props;
    if (record.isCurrent) {
      this.focusRow(this.node);
    }
  }

  componentDidUpdate() {
    const { record } = this.props;
    if (record.isCurrent) {
      this.focusRow(this.node);
    }
  }

  @action
  componentWillUnmount() {
    const { record } = this.props;
    const { tableStore } = this.context;
    tableStore.setRowExpanded(record, false);
    remove(tableStore.lockColumnsBodyRowsHeight, this.rowKey);
  }

  handleSelection() {
    const { record } = this.props;
    const { dataSet } = record;
    if (dataSet) {
      dataSet.select(record);
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

  renderExpandIcon() {
    const { prefixCls, record } = this.props;
    const {
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
    const { prefixCls, columns, record, lock, hidden, index } = this.props;
    const {
      tableStore: {
        rowHeight,
        lockColumnsBodyRowsHeight,
        overflowX,
        highLightRow,
        selectedHighLightRow,
        mouseBatchChooseIdList,
        mouseBatchChooseState,
        props: { onRow, rowRenderer, selectionMode },
      },
    } = this.context;
    const { dataSet, isCurrent, key, id } = record;
    const rowExternalProps = {
      ...(typeof rowRenderer === 'function' ? rowRenderer(record, index) : {}),
      ...(typeof onRow === 'function'
        ? onRow({
          dataSet: dataSet!,
          record,
          expandedRow: false,
          index,
        })
        : {}),
    };
    this.rowExternalProps = rowExternalProps;
    const disabled = isDisabledRow(record);
    const selected = isSelectedRow(record);
    const rowPrefixCls = `${prefixCls}-row`;
    const classString = classNames(
      rowPrefixCls,
      {
        [`${rowPrefixCls}-current`]: highLightRow && isCurrent,
        [`${rowPrefixCls}-hover`]: highLightRow && !isCurrent && this.isHover,
        [`${rowPrefixCls}-highlight`]: highLightRow,
        [`${rowPrefixCls}-selected`]: selectedHighLightRow && selected,
        [`${rowPrefixCls}-disabled`]: disabled,
        [`${rowPrefixCls}-mouse-batch-choose`]: mouseBatchChooseState && (mouseBatchChooseIdList || []).includes(id),
      },
      rowExternalProps.className,
    );
    const rowProps: HTMLProps<HTMLTableRowElement> & {
      style: CSSProperties;
      'data-index': number;
    } = {
      ref: this.saveRef,
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
    if (hidden) {
      rowProps.style.display = 'none';
    }
    if (lock) {
      if (rowHeight === 'auto') {
        rowProps.style.height = pxToRem(get(lockColumnsBodyRowsHeight, key) as number);
      }
    }
    if (selectionMode === SelectionMode.click) {
      rowProps.onClick = this.handleSelectionByClick;
    } else if (selectionMode === SelectionMode.dblclick) {
      rowProps.onDoubleClick = this.handleSelectionByDblClick;
    } else if (selectionMode === SelectionMode.mousedown) {
      rowProps.onMouseDown = this.handleSelectionByMouseDown;
    }
    return [
      <tr key={key} {...rowExternalProps} {...rowProps}>
        {columns.map(this.getCell)}
      </tr>,
      ...this.renderExpandRow(),
    ];
  }
}
