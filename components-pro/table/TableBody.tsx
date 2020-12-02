import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import autobind from '../_util/autobind';
import TableContext from './TableContext';
import { ColumnLock, DragColumnAlign } from './enum';

export interface TableBodyProps {
  prefixCls?: string;
  lock?: ColumnLock | boolean;
  height?: number;
  getRef?: (node: HTMLDivElement | null) => void;
  onScroll?: (e) => void;
  dragColumnAlign?: DragColumnAlign;
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
    const { children, lock, prefixCls, height, onScroll, dragColumnAlign } = this.props;
    const {
      tableStore: { leftLeafColumnsWidth, hasFooter },
    } = this.context;
    const fixedLeft = lock === true || lock === ColumnLock.left;
    const scrollbar = measureScrollbar();
    const hasFooterAndNotLock = !lock && hasFooter && scrollbar;
    const tableBody = (
      <div
        ref={this.saveRef}
        className={`${prefixCls}-body`}
        style={{
          height: pxToRem(
            hasFooterAndNotLock && height !== undefined ? height + scrollbar : height,
          ),
          marginBottom: hasFooterAndNotLock ? pxToRem(-scrollbar) : undefined,
          width: dragColumnAlign ? pxToRem(50 + (scrollbar || 20)) : fixedLeft ? pxToRem(leftLeafColumnsWidth + (scrollbar || 20)) : undefined,
        }}
        onScroll={onScroll}
      >
        {children}
      </div>
    );
    if(dragColumnAlign === DragColumnAlign.left) {
      return (
        <div style={{ width: pxToRem(50), overflow: 'hidden' }}>{tableBody}</div>
      );
    }
    if (fixedLeft) {
      return (
        <div style={{ width: pxToRem(leftLeafColumnsWidth), overflow: 'hidden' }}>{tableBody}</div>
      );
    }

    return tableBody;
  }
}
