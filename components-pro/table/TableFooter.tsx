import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, get } from 'mobx';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnLock } from './enum';
import DataSet from '../data-set/DataSet';
import TableFooterCell from './TableFooterCell';

export interface TableFooterProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
  rowHeight: number | 'auto';
}

@observer
export default class TableFooter extends Component<TableFooterProps, any> {
  static displayName = 'TableFooter';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([ColumnLock.right, ColumnLock.left])]),
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  render() {
    const { prefixCls, lock, rowHeight, dataSet } = this.props;
    const { lockColumnsFootRowsHeight, overflowY } = this.context.tableStore;
    const tds = this.leafColumns.map((column, columnIndex) => {
      const { key, name } = column;
      return (
        <TableFooterCell
          key={name || key || columnIndex}
          prefixCls={prefixCls}
          dataSet={dataSet}
          column={column}
          rowHeight={rowHeight}
        />
      );
    });
    if (overflowY && lock !== ColumnLock.left) {
      tds.push(<th key="fixed-column" className={`${prefixCls}-cell`} />);
    }
    return (
      <tfoot className={`${prefixCls}-tfoot`}>
      <tr style={{ height: lock && rowHeight === 'auto' ? pxToRem(get(lockColumnsFootRowsHeight, 0)) : void 0 }}>{tds}</tr>
      </tfoot>
    );
  }

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    if (lock === 'right') {
      return tableStore.rightLeafColumns;
    } else if (lock) {
      return tableStore.leftLeafColumns;
    } else {
      return tableStore.leafColumns;
    }
  }

}
