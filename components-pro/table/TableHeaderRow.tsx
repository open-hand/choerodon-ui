import React, { Component, Key, ReactNode } from 'react';
import { action, get, set } from 'mobx';
import { observer } from 'mobx-react';
import { DroppableProvided } from 'react-beautiful-dnd';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ResizeObservedRow from './ResizeObservedRow';
import { ColumnLock } from './enum';
import ColumnGroup from './ColumnGroup';
import TableContext from './TableContext';
import autobind from '../_util/autobind';

export interface TableHeaderRowProps {
  rowIndex: number;
  lock?: ColumnLock | boolean;
  droppableProvided?: DroppableProvided;
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
    columnResizable: boolean,
  ): string | number | undefined {
    const {
      tableStore: { rowHeight },
    } = this.context;
    const height = rowHeight === 'auto' ? this.getRowHeight(rowIndex++) : rowHeight;
    return pxToRem(
      rows
        .slice(rowIndex)
        .reduce(
          (total, r, index) =>
            r.length
              ? total
              : total +
              (rowHeight === 'auto'
                ? this.getRowHeight(index + rowIndex)
                : rowHeight + (columnResizable ? 4 : 3)),
          height,
        ),
    );
  }

  render() {
    const { rowIndex, lock, tds, rows, droppableProvided } = this.props;
    const {
      tableStore: { rowHeight, columnResizable },
    } = this.context;
    const tr = (
      <tr
        style={{
          height: lock ? this.getHeaderRowStyle(rows, rowIndex, columnResizable) : undefined,
        }}
        ref={droppableProvided && droppableProvided.innerRef}
        {...(droppableProvided && droppableProvided.droppableProps)}
      >
        {tds}
        {droppableProvided && droppableProvided.placeholder}
      </tr>
    );

    return !lock && rowHeight === 'auto' ? (
      <ResizeObservedRow onResize={this.handleResize} rowIndex={rowIndex}>
        {tr}
      </ResizeObservedRow>
    ) : tr;
  }
};

