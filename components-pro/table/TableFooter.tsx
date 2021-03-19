import React, { Component, DetailedHTMLProps, Key, ThHTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, set } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { ColumnProps, columnWidth } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import TableFooterCell, { TableFooterCellProps } from './TableFooterCell';
import { getColumnKey, getColumnLock, isStickySupport } from './utils';
import autobind from '../_util/autobind';
import ResizeObservedRow from './ResizeObservedRow';

export interface TableFooterProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
}

@observer
export default class TableFooter extends Component<TableFooterProps, any> {
  static displayName = 'TableFooter';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
  };

  static contextType = TableContext;

  @autobind
  handleResize(index: Key, height: number) {
    this.setRowHeight(index, height);
  }

  @action
  setRowHeight(index: Key, height: number) {
    const { tableStore } = this.context;
    set(tableStore.lockColumnsFootRowsHeight, index, height);
  }

  getTds() {
    const { prefixCls, lock, dataSet } = this.props;
    const { tableStore } = this.context;
    const hasPlaceholder = tableStore.overflowY && lock !== ColumnLock.left;
    let leftWidth = 0;
    let rightWidth = isStickySupport() && tableStore.overflowX ? tableStore.rightLeafColumnsWidth + (hasPlaceholder ? measureScrollbar() : 0) : 0;
    const tds = this.leafColumns.map((column, index, cols) => {
      const props: Partial<TableFooterCellProps> = {};
      if (isStickySupport() && tableStore.overflowX) {
        const columnLock = getColumnLock(column.lock);
        if (columnLock === ColumnLock.left) {
          props.style = {
            left: pxToRem(leftWidth)!,
          };
          const next = cols[index + 1];
          if (!next || getColumnLock(next.lock) !== ColumnLock.left) {
            props.className = `${prefixCls}-cell-fix-left-last`;
          }
          leftWidth += columnWidth(column);
        } else if (columnLock === ColumnLock.right) {
          rightWidth -= columnWidth(column);
          props.style = {
            right: pxToRem(rightWidth)!,
          };
          const prev = cols[index - 1];
          if (!prev || prev.lock !== ColumnLock.right) {
            props.className = `${prefixCls}-cell-fix-right-first`;
          }
        }
      }
      return (
        <TableFooterCell
          key={getColumnKey(column)}
          prefixCls={prefixCls}
          dataSet={dataSet}
          column={column}
          {...props}
        />
      );
    });

    if (hasPlaceholder) {
      const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> = {
        key: 'fixed-column',
      };
      const classList = [`${prefixCls}-cell`];
      if (isStickySupport() && tableStore.overflowX) {
        placeHolderProps.style = { right: 0 };
        classList.push(`${prefixCls}-cell-fix-right`);
      }
      placeHolderProps.className = classList.join(' ');
      tds.push(
        <th {...placeHolderProps}>
          &nbsp;
        </th>,
      );
    }
    return tds;
  }

  render() {
    const { prefixCls, lock } = this.props;
    const {
      tableStore,
    } = this.context;
    const { autoFootHeight, rowHeight } = tableStore;
    const tds = this.getTds();
    const tr = (
      <tr
        style={{
          height:
            !isStickySupport() && lock && (rowHeight === 'auto' || autoFootHeight) ? pxToRem(get(tableStore.lockColumnsFootRowsHeight, 0)) : undefined,
        }}
      >
        {tds}
      </tr>
    );
    return (
      <tfoot className={`${prefixCls}-tfoot`}>
        {
          !isStickySupport() && !lock && (rowHeight === 'auto' || autoFootHeight) ? (
            <ResizeObservedRow onResize={this.handleResize} rowIndex={0}>
              {tr}
            </ResizeObservedRow>
          ) : tr
        }
      </tfoot>
    );
  }

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    if (lock === ColumnLock.right) {
      return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
    }
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
  }
}
