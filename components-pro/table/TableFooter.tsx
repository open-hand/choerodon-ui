import React, { Component, Key } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, set } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import TableFooterCell from './TableFooterCell';
import { getColumnKey } from './utils';
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


  render() {
    const { prefixCls, lock, dataSet } = this.props;
    const { tableStore: { autoFootHeight } } = this.context;
    const {
      tableStore: { lockColumnsFootRowsHeight, overflowY, rowHeight },
    } = this.context;
    const tds = this.leafColumns.map(column => {
      return (
        <TableFooterCell
          key={getColumnKey(column)}
          prefixCls={prefixCls}
          dataSet={dataSet}
          column={column}
        />
      );
    });
    if (overflowY && lock !== ColumnLock.left) {
      tds.push(
        <th key="fixed-column" className={`${prefixCls}-cell`}>
          &nbsp;
        </th>,
      );
    }
    const tr = (
      <tr
        style={{
          height:
            lock && (rowHeight === 'auto' || autoFootHeight) ? pxToRem(get(lockColumnsFootRowsHeight, 0)) : undefined,
        }}
      >
        {tds}
      </tr>
    );
    return (
      <tfoot className={`${prefixCls}-tfoot`}>
        {
          !lock && (rowHeight === 'auto' || autoFootHeight) ? (
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
