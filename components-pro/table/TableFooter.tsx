import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import TableFooterCell from './TableFooterCell';
import { getColumnKey } from './utils';

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

  render() {
    const { prefixCls, lock, dataSet } = this.props;
    const {
      tableStore: { lockColumnsFootRowsHeight, overflowY, rowHeight },
    } = this.context;
    const tds = this.leafColumns.map(column => {
      // const { hidden } = column;
      // if (!hidden) {
      return (
        <TableFooterCell
          key={getColumnKey(column)}
          prefixCls={prefixCls}
          dataSet={dataSet}
          column={column}
        />
      );
      // }
      // return undefined;
    });
    if (overflowY && lock !== ColumnLock.left) {
      tds.push(
        <th key="fixed-column" className={`${prefixCls}-cell`}>
          &nbsp;
        </th>,
      );
    }
    return (
      <tfoot className={`${prefixCls}-tfoot`}>
        <tr
          style={{
            height:
              lock && rowHeight === 'auto' ? pxToRem(get(lockColumnsFootRowsHeight, 0)) : undefined,
          }}
        >
          {tds}
        </tr>
      </tfoot>
    );
  }

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    if (lock === 'right') {
      return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
    }
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
  }
}
