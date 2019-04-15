import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { computed, get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import { getColumnKey } from './utils';
import ColumnGroups, { ColumnGroup } from './ColumnGroups';

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

  node: HTMLTableSectionElement | null;

  saveRef = node => this.node = node;

  getHeaderNode = () => {
    return this.node;
  };

  render() {
    const { prefixCls, lock, rowHeight, dataSet } = this.props;
    const { groupedColumns } = this;
    const rows = this.getTableHeaderRows(groupedColumns);
    const trs = rows.map((row, rowIndex) => {
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
            rowHeight,
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
        <tr key={rowIndex} style={{ height: lock && rowHeight === 'auto' ? this.getHeaderRowStyle(groupedColumns, rows, rowIndex) : void 0 }}>
          {tds}
        </tr>
      );
    });
    return (
      <thead ref={this.saveRef} className={`${prefixCls}-thead`}>{trs}</thead>
    );
  }

  getTableHeaderRows(groups: ColumnGroups, currentRow: number = 0, rows: ColumnGroup[][] = []): ColumnGroup[][] {
    rows[currentRow] = rows[currentRow] || [];
    groups.columns.forEach((column) => {
      const { hidden, rowSpan, colSpan, children } = column;
      if (!hidden) {
        if (rowSpan && rows.length < rowSpan) {
          while (rows.length < rowSpan) {
            rows.push([]);
          }
        }
        if (children) {
          this.getTableHeaderRows(children, currentRow + rowSpan, rows);
        }
        if (colSpan !== 0) {
          rows[currentRow].push(column);
        }
      }
    });
    return rows.filter(row => row.length > 0);
  }

  getHeaderRowStyle(columns: ColumnGroups, rows: ColumnGroup[][], index: number): string | number | undefined {
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

  @computed
  get groupedColumns(): ColumnGroups {
    return new ColumnGroups(this.columns);
  }
}
