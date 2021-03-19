import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import autobind from '../_util/autobind';
import TableContext from './TableContext';
import { ColumnLock } from './enum';

export interface TableBodyProps {
  prefixCls?: string;
  lock?: ColumnLock | boolean;
  height?: number;
  getRef?: (node: HTMLDivElement | null) => void;
  onScroll?: (e) => void;
}

@observer
export default class TableBody extends Component<TableBodyProps> {
  static displayName = 'TableBody';

  static contextType = TableContext;

  @autobind
  saveRef(node: HTMLDivElement | null) {
    const { getRef } = this.props;
    if (getRef) {
      getRef(node);
    }
  }

  render() {
    const { children, lock, prefixCls, height, onScroll } = this.props;
    const {
      tableStore: { leftLeafColumnsWidth, rightLeafColumnsWidth, hasFooter, overflowY, overflowX },
    } = this.context;
    const fixedLeft = lock === true || lock === ColumnLock.left;
    const scrollbar = measureScrollbar();
    const hasFooterAndNotLock = !lock && hasFooter && overflowX && scrollbar;
    const tableBody = (
      <div
        ref={this.saveRef}
        className={`${prefixCls}-body`}
        style={{
          height: pxToRem(
            hasFooterAndNotLock && height !== undefined ? height + scrollbar : height,
          ),
          marginBottom: hasFooterAndNotLock ? pxToRem(-scrollbar) : undefined,
          width: fixedLeft ? pxToRem(leftLeafColumnsWidth + (scrollbar || 20)) :
            lock === ColumnLock.right
              ? pxToRem(rightLeafColumnsWidth - 1 + (overflowY ? scrollbar : 0))
              : undefined,
          marginLeft: lock === ColumnLock.right ? pxToRem(1) : undefined,
        }}
        onScroll={onScroll}
      >
        {children}
      </div>
    );
    if (fixedLeft) {
      return (
        <div style={{ width: pxToRem(leftLeafColumnsWidth), overflow: 'hidden' }}>{tableBody}</div>
      );
    }

    return tableBody;
  }
}
