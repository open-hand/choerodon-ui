import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell from './TableHeaderCell';
import TableContext from './TableContext';
import { computed, get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';

export interface TableHeaderProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
  rowHeight: number | 'auto';
}

@observer
export default class TableHeader extends Component<TableHeaderProps, any> {
  static displayName = 'TableHeader';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([ColumnLock.right, ColumnLock.left])]),
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  render() {
    const { prefixCls, lock, rowHeight, dataSet } = this.props;
    const { columns } = this;
    const rows = this.getTableHeaderRows(columns, 0, []);
    const trs = rows.map((row, rowIndex) => {
      let prevColumn: ColumnProps | undefined;
      const tds = row.map((column, columnIndex) => {
        const { key, name } = column;
        const result = (
          <TableHeaderCell
            key={name || key || columnIndex}
            prefixCls={prefixCls}
            dataSet={dataSet}
            prevColumn={prevColumn}
            column={column}
            rowHeight={rowHeight}
          />
        );
        prevColumn = column;
        return result;
      });
      if (this.context.tableStore.overflowY && lock !== ColumnLock.left && rowIndex === 0) {
        tds.push(<th key="fixed-column" className={`${prefixCls}-cell`} rowSpan={rows.length} />);
      }
      return (
        <tr key={rowIndex} style={{ height: lock && rowHeight === 'auto' ? this.getHeaderRowStyle(columns, rows, rowIndex) : void 0 }}>
          {tds}
        </tr>
      );
    });
    return (
      <thead className={`${prefixCls}-thead`}>{trs}</thead>
    );
  }

  getTableHeaderRows(columns: ColumnProps[], currentRow: number, rows: ColumnProps[][]): ColumnProps[][] {
    rows[currentRow] = rows[currentRow] || [];
    columns.forEach((column) => {
      if (column.rowSpan && rows.length < column.rowSpan) {
        while (rows.length < column.rowSpan) {
          rows.push([]);
        }
      }
      if (column.children) {
        this.getTableHeaderRows(column.children, currentRow + 1, rows);
      }
      if (column.colSpan !== 0) {
        rows[currentRow].push(column);
      }
    });
    return rows.filter((row) => row.length > 0);
  }

  getHeaderRowStyle(columns: ColumnProps[], rows: ColumnProps[][], index: number): string | number | undefined {
    if (columns) {
      const headerHeight: number | undefined = get(this.context.tableStore.lockColumnsHeadRowsHeight, index);
      if (headerHeight === void 0) {
        return 'auto';
      }
      return pxToRem(headerHeight / rows.length);
    }
  }

  @computed
  get columns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftColumns;
      case ColumnLock.right:
        return tableStore.rightColumns;
      default:
        return tableStore.columns;
    }
  }

}
