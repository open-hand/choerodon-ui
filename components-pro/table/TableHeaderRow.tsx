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
  tds: ReactNode,
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
    const { rowIndex, lock, tds, rows } = this.props;
    const {
      tableStore: { rowHeight },
    } = this.context;
    const needStoreRowHeight = !isStickySupport() && (rowHeight === 'auto' || rows.length > 1);
    const tr = (
      <tr
        style={{
          height: lock && needStoreRowHeight ? this.getHeaderRowStyle(rows, rowIndex) : undefined,
        }}
      >
        {tds}
      </tr>
    );

    return !lock && needStoreRowHeight ? (
      <ResizeObservedRow onResize={this.handleResize} rowIndex={rowIndex}>
        {tr}
      </ResizeObservedRow>
    ) : tr;
  }
};

