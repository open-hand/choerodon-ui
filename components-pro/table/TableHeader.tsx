import React, { Component, DetailedHTMLProps, ReactElement, ThHTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { action, computed } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import { getColumnKey, getColumnLock, isStickySupport } from './utils';
import ColumnGroup from './ColumnGroup';
import autobind from '../_util/autobind';
import TableHeaderRow, { TableHeaderRowProps } from './TableHeaderRow';

export interface TableHeaderProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
}

@observer
export default class TableHeader extends Component<TableHeaderProps, any> {
  static displayName = 'TableHeader';

  static propTypes = {
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

  getTrs(): (ReactElement<TableHeaderRowProps> | undefined)[] {
    const { lock, dataSet } = this.props;
    const {
      tableStore,
    } = this.context;
    const { prefixCls } = tableStore;
    const rows = this.getTableHeaderRows(this.groupedColumns);
    return rows.map<ReactElement<TableHeaderRowProps> | undefined>((row, rowIndex) => {
      if (row.length) {
        const hasPlaceholder = tableStore.overflowY && rowIndex === 0 && lock !== ColumnLock.left;
        let prevColumn: ColumnProps | undefined;
        const placeholderWidth = hasPlaceholder ? measureScrollbar() : 0;
        const tds = row.map((col, index, cols) => {
          if (!col.hidden) {
            const { column, rowSpan, colSpan, lastLeaf, children } = col;
            const key = String(getColumnKey(column));
            const props: TableHeaderCellProps = {
              key,
              dataSet,
              prevColumn,
              column,
              resizeColumn: lastLeaf,
              getHeaderNode: this.getHeaderNode,
            };
            if (rowSpan > 1 || children) {
              props.rowSpan = rowSpan;
            }
            if (colSpan > 1 || children) {
              props.colSpan = colSpan;
            }
            prevColumn = lastLeaf;
            if (isStickySupport() && tableStore.overflowX) {
              const columnLock = getColumnLock(column.lock);
              if (columnLock === ColumnLock.left) {
                props.style = {
                  left: pxToRem(col.left)!,
                };
                const next = cols[index + 1];
                if (!next || getColumnLock(next.column.lock) !== ColumnLock.left) {
                  props.className = `${prefixCls}-cell-fix-left-last`;
                }
              } else if (columnLock === ColumnLock.right) {
                props.style = {
                  right: pxToRem(col.right + placeholderWidth)!,
                };
                const prev = cols[index - 1];
                if (!prev || prev.column.lock !== ColumnLock.right) {
                  props.className = `${prefixCls}-cell-fix-right-first`;
                }
              }
            }
            return (
              <TableHeaderCell {...props} />
            );
          }
          return undefined;
        });
        if (hasPlaceholder) {
          const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> = {
            key: 'fixed-column',
            rowSpan: rows.length,
          };
          const classList = [`${prefixCls}-cell`];
          if (isStickySupport() && tableStore.overflowX) {
            const hasColRightLock = tds.some(td => {
              if (td) {
                return td.props.column.lock === ColumnLock.right;
              }
              return false;
            });
            placeHolderProps.style = hasColRightLock ? { right: 0 } : {};
            classList.push(`${prefixCls}-cell-fix-right`);
          }
          placeHolderProps.className = classList.join(' ');
          tds.push(
            <th
              {...placeHolderProps}
            >
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
  }

  render() {
    const {
      tableStore: { prefixCls, overflowX, columnResizable, isHeaderHover, columnResizing, props: { border } },
    } = this.context;
    const trs = this.getTrs();
    const theadProps: DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> = {
      ref: this.saveRef,
      className: classNames(`${prefixCls}-thead`, {
        [`${prefixCls}-column-resizable`]: columnResizable,
        [`${prefixCls}-column-group`]: trs && trs.length > 1,
        [`${prefixCls}-thead-hover`]: isHeaderHover || columnResizing,
      }),
    };
    if (!isStickySupport() && overflowX && !border) {
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
