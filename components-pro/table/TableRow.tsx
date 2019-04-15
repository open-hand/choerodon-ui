import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, get, runInAction, set } from 'mobx';
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
import { getColumnKey, isDisabledRow } from './utils';

export interface TableRowProps extends ElementProps {
  lock?: ColumnLock | boolean;
  columns: ColumnProps[];
  record: Record;
  indentSize: number;
  rowHeight: number | 'auto';
  children?: (isExpanded: boolean) => ReactNode;
}

@observer
export default class TableRow extends Component<TableRowProps, any> {
  static displayName = 'TableRow';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([ColumnLock.right, ColumnLock.left])]),
    columns: PropTypes.array.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  rowExternalProps: any = {};

  childrenRendered: boolean = false;

  node: HTMLTableRowElement | null;

  @computed
  get expandable(): boolean {
    const { record } = this.props;
    const { isTree } = this.context.tableStore;
    return isTree && !!record.children;
  }

  @computed
  get isExpanded(): boolean {
    return this.context.tableStore.isRowExpanded(this.props.record);
  }

  set isExpanded(expanded: boolean) {
    this.context.tableStore.setRowExpanded(this.props.record, expanded);
  }

  saveRef = (node: HTMLTableRowElement | null) => {
    if (node) {
      this.node = node;
      if (this.props.rowHeight === 'auto' && !this.props.lock) {
        runInAction(() => {
          const { lockColumnsBodyRowsHeight } = this.context.tableStore;
          const { id } = this.props.record;
          set(lockColumnsBodyRowsHeight, id, node.offsetHeight);
        });
      }
    }
  };

  handleSelectionByClick = () => {
    this.handleSelection();
    this.handleClick();
  };

  handleSelectionByDblClick = () => {
    this.handleSelection();
    const { onDoubleClick } = this.rowExternalProps;
    if (typeof onDoubleClick === 'function') {
      onDoubleClick();
    }
  };

  handleExpandChange = () => {
    if (this.expandable) {
      this.isExpanded = !this.isExpanded;
    }
  };

  handleClick = () => {
    const { record, record: { dataSet } } = this.props;
    if (dataSet && !isDisabledRow(record)) {
      dataSet.current = record;
    }
    const { onClick } = this.rowExternalProps;
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  getCell = (column: ColumnProps, index: number): ReactNode => {
    const {
      prefixCls, record, indentSize, rowHeight,
    } = this.props;
    const { hidden } = column;
    if (!hidden) {
      return (
        <TableCell
          key={getColumnKey(column)}
          prefixCls={prefixCls}
          column={column}
          record={record}
          indentSize={indentSize}
          rowHeight={rowHeight}
        >
          {this.hasExpandIcon(index) && this.renderExpandIcon()}
        </TableCell>
      );
    }
  };

  focusRow(row: HTMLTableRowElement | null) {
    if (row) {
      const { node, overflowY, currentEditorName } = this.context.tableStore;
      const { lock, record } = this.props;
      if (!lock && !currentEditorName) {
        const { element } = node;
        if (element && element.contains(document.activeElement)
          && Array.from<HTMLTableRowElement>(element.querySelectorAll(`tr[data-index="${record.id}"]`))
            .every(tr => !tr.contains(document.activeElement))) {
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
            let _scrollTop = scrollTop;
            if (_scrollTop < bottomSide) {
              _scrollTop = bottomSide;
            }
            if (_scrollTop > offsetTop) {
              _scrollTop = offsetTop + 1;
            }
            if (_scrollTop !== scrollTop) {
              tableBodyWrap.scrollTop = _scrollTop;
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
    if (this.props.record.isCurrent) {
      this.focusRow(this.node);
    }
  }

  componentDidUpdate() {
    if (this.props.record.isCurrent) {
      this.focusRow(this.node);
    }
  }

  componentWillUnmount() {
    this.context.tableStore.setRowExpanded(this.props.record, false);
  }

  handleSelection() {
    const { record } = this.props;
    const { dataSet } = record;
    if (dataSet) {
      dataSet.select(record);
    }
  }

  hasExpandIcon(columnIndex) {
    const { lock } = this.props;
    const { tableStore } = this.context;
    const { props: { expandRowByClick }, hasRowBox, isTree } = tableStore;
    const expandIconColumnIndex = hasRowBox ? 1 : 0;
    return isTree && lock !== ColumnLock.right &&
      // !this.expandIconAsCell &&
      !expandRowByClick &&
      columnIndex === expandIconColumnIndex;
  }

  renderExpandIcon() {
    const { prefixCls } = this.props;
    return (
      <ExpandIcon
        prefixCls={prefixCls}
        expandable={this.expandable}
        onChange={this.handleExpandChange}
        expanded={this.isExpanded}
      />
    );
  }

  render() {
    const { prefixCls, columns, record, lock, hidden, children, rowHeight } = this.props;
    const { lockColumnsBodyRowsHeight, props: { rowRenderer, selectionMode } } = this.context.tableStore;
    const rowExternalProps = this.rowExternalProps = typeof rowRenderer === 'function' ? rowRenderer() : {};
    const classString = classNames(`${prefixCls}-row`, {
      [`${prefixCls}-current-row`]: record.isCurrent,
      [`${prefixCls}-disabled-row`]: isDisabledRow(record),
    }, rowExternalProps.className);
    const rowProps: any = {
      ref: this.saveRef,
      className: classString,
      style: { ...rowExternalProps.style },
      onClick: this.handleClick,
      tabIndex: -1,
      'data-index': record.id,
    };
    if (hidden) {
      rowProps.style.display = 'none';
    }
    if (lock) {
      if (rowHeight === 'auto') {
        rowProps.style.height = pxToRem(get(lockColumnsBodyRowsHeight, record.id) as number);
      }
    }
    if (selectionMode === SelectionMode.click) {
      rowProps.onClick = this.handleSelectionByClick;
    } else if (selectionMode === SelectionMode.dblclick) {
      rowProps.onDoubleClick = this.handleSelectionByDblClick;
    }
    return [
      <tr key={record.id} {...rowExternalProps} {...rowProps}>
        {columns.map(this.getCell)}
      </tr>,
      typeof children === 'function' && (this.isExpanded || this.childrenRendered) && (this.childrenRendered = true, children(this.isExpanded)),
    ];
  }
}
