import React, { Component, DetailedHTMLProps } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { action, computed } from 'mobx';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import { getColumnKey } from './utils';
import ColumnGroup from './ColumnGroup';
import autobind from '../_util/autobind';
import TableHeaderRow from './TableHeaderRow';

export interface TableHeaderProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
}

@observer
export default class TableHeader extends Component<TableHeaderProps, any> {
  static displayName = 'TableHeader';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
  };

  static contextType = TableContext;

  node: HTMLTableSectionElement | null;

  columnDeep: number = 0;

  @autobind
  saveRef(node) {
    this.node = node;
  }

  @autobind
  getHeaderNode() {
    return this.node;
  }

  @autobind
  @action
  handleTheadMouseEnter() {
    const {
      tableStore,
    } = this.context;
    tableStore.isHeaderHover = true;
  }

  @autobind
  @action
  handleTheadMouseLeave() {
    const {
      tableStore,
    } = this.context;
    tableStore.isHeaderHover = false;
  }

  render() {
    const { prefixCls, lock, dataSet } = this.props;
    const { groupedColumns } = this;
    const {
      tableStore: { overflowX, overflowY, columnResizable, isHeaderHover, columnResizing },
    } = this.context;
    const rows = this.getTableHeaderRows(groupedColumns);
    const trs = rows.map((row, rowIndex) => {
      if (row.length) {
        let prevColumn: ColumnProps | undefined;
        const tds = row.map(({ hidden, column, rowSpan, colSpan, lastLeaf }) => {
          if (!hidden) {
            const key = String(getColumnKey(column));
            const props: TableHeaderCellProps = {
              key,
              prefixCls,
              dataSet,
              prevColumn,
              column,
              rowIndex,
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
            return (
              <TableHeaderCell {...props} />
            );
          }
          return undefined;
        });
        if (overflowY && lock !== ColumnLock.left && rowIndex === 0) {
          tds.push(
            <th key="fixed-column" className={`${prefixCls}-cell`} rowSpan={rows.length}>
              &nbsp;
            </th>,
          );
        }
        return (
          <TableHeaderRow
            key={String(rowIndex)}
            rowIndex={rowIndex}
            tds={tds}
            rows={rows}
            lock={lock}
          />
        );
      }
      return undefined;
    });
    const theadProps: DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> = {
      ref: this.saveRef,
      className: classNames(`${prefixCls}-thead`, {
        [`${prefixCls}-column-resizable`]: columnResizable,
        [`${prefixCls}-column-group`]: rows && rows.length > 1,
        [`${prefixCls}-thead-hover`]: isHeaderHover || columnResizing,
      }),
    };
    if (overflowX) {
      theadProps.onMouseEnter = this.handleTheadMouseEnter;
      theadProps.onMouseLeave = this.handleTheadMouseLeave;
    }
    return (
      <thead {...theadProps}>
        {trs}
      </thead>
    );
  }

  getTableHeaderRows(
    columns: ColumnGroup[],
    currentRow: number = 0,
    rows: ColumnGroup[][] = [],
  ): ColumnGroup[][] {
    rows[currentRow] = rows[currentRow] || [];
    columns.forEach(column => {
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
