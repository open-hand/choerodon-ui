import React, { Component, DetailedHTMLProps, ReactElement, ThHTMLAttributes } from 'react';
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
import { getColumnKey, getHeight, getTableHeaderRows, isStickySupport } from './utils';
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
    const { headerRows } = this;
    return headerRows.map<ReactElement<TableHeaderRowProps> | undefined>((row, rowIndex) => {
      const { length } = row;
      if (length) {
        const notLockLeft = lock !== ColumnLock.left;
        const lastColumnClassName = notLockLeft ? `${prefixCls}-cell-last` : undefined;
        const hasPlaceholder = tableStore.overflowY && rowIndex === 0 && notLockLeft;
        let prevColumn: ColumnProps | undefined;
        const tds = row.map((col, index) => {
          if (!col.hidden) {
            const { column, rowSpan, colSpan, lastLeaf, children } = col;
            const key = String(getColumnKey(column));
            const props: TableHeaderCellProps = {
              key,
              dataSet,
              prevColumn,
              column,
              columnGroup: col,
              resizeColumn: lastLeaf,
              getHeaderNode: this.getHeaderNode,
              rowIndex,
            };
            if (notLockLeft && !hasPlaceholder && index === length - 1 && tableStore.leafColumns[tableStore.leafColumns.length - 1] === lastLeaf) {
              props.className = lastColumnClassName;
            }
            if (rowSpan > 1 || children) {
              props.rowSpan = rowSpan;
            }
            if (colSpan > 1 || children) {
              props.colSpan = colSpan;
            }
            prevColumn = lastLeaf;
            return (
              <TableHeaderCell {...props} />
            );
          }
          return undefined;
        });
        if (hasPlaceholder) {
          const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> = {
            key: 'fixed-column',
            rowSpan: headerRows.length,
          };
          const classList = [`${prefixCls}-cell`, lastColumnClassName];
          if (isStickySupport() && tableStore.overflowX) {
            placeHolderProps.style = tableStore.isAnyColumnsRightLock ? { right: 0 } : {};
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
            rows={headerRows}
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

  getHeight(): number {
    const { node } = this;
    if (node) {
      return getHeight(node);
    }
    return 0;
  }

  @computed
  get headerRows(): ColumnGroup[][] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return getTableHeaderRows(tableStore.leftGroupedColumns);
      case ColumnLock.right:
        return getTableHeaderRows(tableStore.rightGroupedColumns);
      default:
        return getTableHeaderRows(tableStore.groupedColumns);
    }
  }
}
