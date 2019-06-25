import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { computed, get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import { getColumnKey } from './utils';
import { ColumnGroup } from './ColumnGroups';

export interface TableHeaderProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
}

@observer
export default class TableHeader extends Component<TableHeaderProps, any> {
  static displayName = 'TableHeader';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([ColumnLock.right, ColumnLock.left])]),
  };

  static contextType = TableContext;

  node: HTMLTableSectionElement | null;

  saveRef = node => this.node = node;

  getHeaderNode = () => {
    return this.node;
  };

  render() {
    const { prefixCls, lock, dataSet } = this.props;
    const { groupedColumns } = this;
    const rows = this.getTableHeaderRows(groupedColumns);
    const trs = rows.map((row, rowIndex) => {
      if (row.length) {
        let prevColumn: ColumnProps | undefined;
        const tds = row.map(({ hidden, column, rowSpan, colSpan, lastLeaf }) => {
          if (!hidden) {
            const props: TableHeaderCellProps = {
              key: getColumnKey(column),
              prefixCls,
              dataSet,
              prevColumn,
              column,
              resizeColumn: lastLeaf,
              getHeaderNode: this.getHeaderNode,
            };
            if (rowSpan > 1) {
              props.rowSpan = rowSpan;
            }
            if (colSpan > 1) {
              props.colSpan = colSpan;
            }
            prevColumn = lastLeaf;
            return <TableHeaderCell {...props} />;
          }
        });
        if (this.context.tableStore.overflowY && lock !== ColumnLock.left && rowIndex === 0) {
          tds.push(<th key="fixed-column" className={`${prefixCls}-cell`} rowSpan={rows.length} />);
        }
        return (
          <tr key={rowIndex} style={{ height: lock ? this.getHeaderRowStyle(rows, rowIndex) : void 0 }}>
            {tds}
          </tr>
        );
      }
    });
    const classString = classNames(`${prefixCls}-thead`, {
      [`${prefixCls}-column-resizable`]: this.context.tableStore.columnResizable,
    })
    return (
      <thead ref={this.saveRef} className={classString}>{trs}</thead>
    );
  }

  getTableHeaderRows(columns: ColumnGroup[], currentRow: number = 0, rows: ColumnGroup[][] = []): ColumnGroup[][] {
    rows[currentRow] = rows[currentRow] || [];
    columns.forEach((column) => {
      const { hidden, rowSpan, colSpan, children } = column;
      if (!hidden) {
        if (rowSpan && rows.length < rowSpan) {
          while (rows.length < rowSpan) {
            rows.push([]);
          }
        }
        if (children) {
          this.getTableHeaderRows(children.columns, currentRow + rowSpan, rows);
        }
        if (colSpan !== 0) {
          rows[currentRow].push(column);
        }
      }
    });
    return rows;
  }

  getHeaderRowStyle(rows: ColumnGroup[][], rowIndex: number): string | number | undefined {
    const { rowHeight } = this.context.tableStore;
    const height = rowHeight === 'auto' ? this.getRowHeight(rowIndex++) : rowHeight;
    return pxToRem(rows.slice(rowIndex).reduce((total, r, index) => (
      r.length ? total : total + 1 + (rowHeight === 'auto' ? this.getRowHeight(index + rowIndex) : rowHeight)
    ), height));
  }

  getRowHeight(index): number {
    return get(this.context.tableStore.lockColumnsHeadRowsHeight, index) || 0;
  }

  @computed
  get groupedColumns(): ColumnGroup[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftGroupedColumns;
      case ColumnLock.right:
        return tableStore.rightGroupedColumns;
      default:
        return tableStore.groupedColumns;
    }
  }
}
