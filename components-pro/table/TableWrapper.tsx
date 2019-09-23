import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, set } from 'mobx';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ColumnProps, minColumnWidth } from './Column';
import { ColumnLock } from './enum';
import TableEditor from './TableEditor';
import TableCol from './TableCol';
import { getColumnKey } from './utils';

export interface TableWrapperProps extends ElementProps {
  lock?: ColumnLock | boolean;
  hasBody?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

@observer
export default class TableWrapper extends Component<TableWrapperProps, any> {
  static contextType = TableContext;

  static propTypes = {
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    hasBody: PropTypes.bool,
    hasHeader: PropTypes.bool,
    hasFooter: PropTypes.bool,
  };

  tableWrapper: HTMLTableElement | null;

  @computed
  get leafColumnsWidth(): number | undefined {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftLeafColumnsWidth;
      case ColumnLock.right:
        return tableStore.rightLeafColumnsWidth;
      default:
        if (tableStore.overflowX) {
          return tableStore.totalLeafColumnsWidth;
        }
    }
    return undefined;
  }

  @computed
  get leafEditorColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftLeafColumns.filter(
          ({ editor, name, hidden }) => editor && name && !hidden,
        );
      case ColumnLock.right:
        return tableStore.rightLeafColumns.filter(
          ({ editor, name, hidden }) => editor && name && !hidden,
        );
      default:
        return tableStore.leafColumns.filter(
          ({ editor, name, hidden, lock: columnLock }) => editor && name && !columnLock && !hidden,
        );
    }
  }

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
      case ColumnLock.right:
        return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
      default:
        return tableStore.leafColumns.filter(({ hidden }) => !hidden);
    }
  }

  handleResizeEnd = () => {
    const { tableStore } = this.context;
    if (tableStore.rowHeight === 'auto') {
      this.syncFixedTableRowHeight();
    }
  };

  getCol(column, width): ReactNode {
    if (!column.hidden) {
      const { prefixCls } = this.props;
      return (
        <TableCol
          key={getColumnKey(column)}
          prefixCls={prefixCls}
          width={width}
          minWidth={minColumnWidth(column)}
          onResizeEnd={this.handleResizeEnd}
        />
      );
    }
  }

  getColGroup(): ReactNode {
    const { lock, hasHeader, hasFooter } = this.props;
    const {
      tableStore: { overflowY, overflowX },
    } = this.context;
    let hasEmptyWidth = false;
    const cols = this.leafColumns.map((column, index, array) => {
      let width = get(column, 'width');
      if (!overflowX) {
        if (!hasEmptyWidth && index === array.length - 1) {
          width = undefined;
        } else if (isNil(width)) {
          hasEmptyWidth = true;
        }
      }
      return this.getCol(column, width);
    });
    if (overflowY && lock !== ColumnLock.left && (hasHeader || hasFooter)) {
      cols.push(<col key="fixed-column" style={{ width: pxToRem(measureScrollbar()) }} />);
    }
    return <colgroup>{cols}</colgroup>;
  }

  getEditors() {
    const { prefixCls } = this.props;
    return this.leafEditorColumns.map(column => (
      <TableEditor key={column.name} prefixCls={prefixCls} column={column} />
    ));
  }

  saveRef = node => {
    this.tableWrapper = node;
  };

  @computed
  get tableWidth() {
    const { lock, hasBody } = this.props;
    const {
      tableStore: { overflowY, overflowX },
    } = this.context;
    if (overflowX) {
      let tableWidth = this.leafColumnsWidth;
      if (tableWidth !== undefined && overflowY && lock !== ColumnLock.left && !hasBody) {
        tableWidth += measureScrollbar();
      }
      return pxToRem(tableWidth);
    }
    return '100%';
  }

  render() {
    const { children, lock, hasBody, prefixCls } = this.props;
    const {
      tableStore: { overflowY, height },
    } = this.context;
    const editors = hasBody && this.getEditors();
    const className = classNames({
      [`${prefixCls}-last-row-bordered`]: hasBody && !overflowY && height !== undefined,
    });
    const table = (
      <table
        key="table"
        ref={lock ? undefined : this.saveRef}
        className={className}
        style={{ width: this.tableWidth }}
      >
        {this.getColGroup()}
        {children}
      </table>
    );

    return [editors, table];
  }

  @action
  syncFixedTableRowHeight() {
    const { prefixCls, hasFooter, hasBody, hasHeader } = this.props;
    if (this.tableWrapper) {
      const { tableStore } = this.context;
      const {
        lockColumnsHeadRowsHeight,
        lockColumnsBodyRowsHeight,
        lockColumnsFootRowsHeight,
      } = tableStore;
      if (hasHeader) {
        const headRows = Array.from<HTMLTableRowElement>(
          this.tableWrapper.querySelectorAll('thead tr'),
        );
        headRows.forEach((row, index) => set(lockColumnsHeadRowsHeight, index, row.offsetHeight));
      }
      if (hasBody) {
        const bodyRows = Array.from<HTMLTableRowElement>(
          this.tableWrapper.querySelectorAll(`.${prefixCls}-row`),
        );
        bodyRows.forEach(row =>
          set(lockColumnsBodyRowsHeight, row.dataset.index, row.offsetHeight),
        );
      }
      if (hasFooter) {
        const footRows = Array.from<HTMLTableRowElement>(
          this.tableWrapper.querySelectorAll('tfoot tr'),
        );
        footRows.forEach((row, index) => set(lockColumnsFootRowsHeight, index, row.offsetHeight));
      }
    }
  }
}
