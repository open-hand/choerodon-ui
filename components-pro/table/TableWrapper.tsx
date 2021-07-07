import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, get } from 'mobx';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ColumnProps, minColumnWidth } from './Column';
import { ColumnLock, DragColumnAlign } from './enum';
import TableEditor from './TableEditor';
import TableCol from './TableCol';
import { getColumnKey, isStickySupport } from './utils';
import autobind from '../_util/autobind';
import { treeReduce } from '../_util/treeUtils';

export interface TableWrapperProps extends ElementProps {
  lock?: ColumnLock | boolean;
  hasBody?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

@observer
export default class TableWrapper extends Component<TableWrapperProps, any> {
  static displayName = 'TableWrapper';

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
        return treeReduce<ColumnProps[], ColumnProps>(tableStore.leftLeafColumns, (columns, column) => {
          const { editor, name, hidden } = column;
          if (editor && name && !hidden) {
            columns.push(column);
          }
          return columns;
        }, []);
      case ColumnLock.right:
        return treeReduce<ColumnProps[], ColumnProps>(tableStore.rightLeafColumns, (columns, column) => {
          const { editor, name, hidden } = column;
          if (editor && name && !hidden) {
            columns.push(column);
          }
          return columns;
        }, []);
      default:
        return treeReduce<ColumnProps[], ColumnProps>(tableStore.leafColumns, (columns, column) => {
          const { editor, name, hidden, lock: columnLock } = column;
          if (editor && name && !hidden && (isStickySupport() || !columnLock || !tableStore.overflowX)) {
            columns.push(column);
          }
          return columns;
        }, []);
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

  getCol(column, width): ReactNode {
    if (!column.hidden) {
      return (
        <TableCol
          key={getColumnKey(column)}
          width={width}
          minWidth={minColumnWidth(column)}
        />
      );
    }
  }

  getColGroup(): ReactNode {
    const { lock, hasHeader, hasFooter } = this.props;
    const {
      tableStore: { overflowY, overflowX, customizable, rowDraggable, dragColumnAlign },
    } = this.context;
    let hasEmptyWidth = false;
    let fixedColumnLength = 1;
    if (customizable) {
      fixedColumnLength += 1;
    }
    if (rowDraggable && dragColumnAlign === DragColumnAlign.right) {
      fixedColumnLength += 1;
    }

    const cols = this.leafColumns.map((column, index, array) => {
      let width = get(column, 'width');
      if (!overflowX) {
        if (!hasEmptyWidth && index === array.length - fixedColumnLength) {
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
    return this.leafEditorColumns.map(column => (
      <TableEditor key={getColumnKey(column)} column={column} />
    ));
  }

  @autobind
  saveRef(node) {
    this.tableWrapper = node;
  }

  @computed
  get tableWidth() {
    const { lock, hasBody } = this.props;
    const { tableStore } = this.context;

    if (tableStore.overflowX) {
      let tableWidth = this.leafColumnsWidth;
      if (tableWidth !== undefined && lock !== ColumnLock.left && !hasBody && tableStore.overflowY) {
        tableWidth += measureScrollbar();
      }
      return pxToRem(tableWidth);
    }
    return '100%';
  }

  render() {
    const { children, lock, hasBody } = this.props;
    const {
      tableStore,
    } = this.context;
    const { prefixCls, props: { summary } } = tableStore;
    const editors = hasBody && this.getEditors();
    const className = classNames({
      [`${prefixCls}-last-row-bordered`]: hasBody && !tableStore.overflowY && tableStore.height !== undefined,
    });
    const table = (
      <table
        key="table"
        ref={lock ? undefined : this.saveRef}
        className={className}
        style={{ width: this.tableWidth }}
        summary={summary}
      >
        {this.getColGroup()}
        {children}
      </table>
    );

    return [table, editors];
  }
}
