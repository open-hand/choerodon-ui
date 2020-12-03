import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, get } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock,DragColumnAlign } from './enum';
import DataSet from '../data-set/DataSet';
import TableFooterCell from './TableFooterCell';
import { getColumnKey } from './utils';
import {DRAG_KEY} from './TableStore';

export interface TableFooterProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
  dragColumnAlign?:DragColumnAlign;
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
    dragColumnAlign:PropTypes.oneOf([DragColumnAlign.right, DragColumnAlign.left]),
  };

  static contextType = TableContext;

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
    return (
      <tfoot className={`${prefixCls}-tfoot`}>
        <tr
          style={{
            height:
              lock && (rowHeight === 'auto' || autoFootHeight) ? pxToRem(get(lockColumnsFootRowsHeight, 0)) : undefined,
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
    const filterDrag = (columnItem:ColumnProps):boolean => {
      const {dragColumnAlign} = this.props
      if(dragColumnAlign){
        return columnItem.key === DRAG_KEY
      }
      return true
    }
    if (lock === 'right') {
      return tableStore.rightLeafColumns.filter(filterDrag).filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(filterDrag).filter(({ hidden }) => !hidden);
    }
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
  }
}
