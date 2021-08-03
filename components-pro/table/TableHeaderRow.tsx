import React, { Component, Key, ReactNode } from 'react';
import { action, get, set } from 'mobx';
import { observer } from 'mobx-react';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ResizeObservedRow from './ResizeObservedRow';
import { ColumnLock } from './enum';
import ColumnGroup from './ColumnGroup';
import TableContext from './TableContext';
import autobind from '../_util/autobind';
import { isStickySupport } from './utils';

export interface TableHeaderRowProps {
  rowIndex: number;
  lock?: ColumnLock | boolean;
  children: ReactNode,
  rows: ColumnGroup[][],
}

@observer
export default class TableHeaderRow extends Component<TableHeaderRowProps> {

  static contextType = TableContext;

  @autobind
  handleResize(rowIndex: Key, height: number) {
    this.setRowHeight(rowIndex, height);
  }

  @action
  setRowHeight(index: Key, height: number) {
    const { tableStore } = this.context;
    set(tableStore.lockColumnsHeadRowsHeight, index, height);
  }

  getRowHeight(index): number {
    const { tableStore } = this.context;
    return get(tableStore.lockColumnsHeadRowsHeight, index) || 0;
  }

  getHeaderRowStyle(
    rows: ColumnGroup[][],
    rowIndex: number,
  ): string | number | undefined {
    const height = this.getRowHeight(rowIndex++);
    return pxToRem(
      rows
        .slice(rowIndex)
        .reduce(
          (total, r, index) =>
            r.length
              ? total
              : total +
              this.getRowHeight(index + rowIndex),
          height,
        ),
    );
  }

  render() {
    const { rowIndex, lock, children, rows } = this.props;
    const {
      rowHeight,
    } = this.context;
    const needStoreRowHeight = !isStickySupport() && (rowHeight === 'auto' || rows.length > 1);
    const style = lock && needStoreRowHeight ? {
      height: this.getHeaderRowStyle(rows, rowIndex),
    } : undefined;
    const tr = (
      <tr style={style}>
        {children}
      </tr>
    );

    return !lock && needStoreRowHeight ? (
      <ResizeObservedRow onResize={this.handleResize} rowIndex={rowIndex}>
        {tr}
      </ResizeObservedRow>
    ) : tr;
  }
};

