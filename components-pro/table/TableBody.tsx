import React, { Component } from 'react';
import { observer } from 'mobx-react';
import raf from 'raf';
import isNumber from 'lodash/isNumber';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import autobind from '../_util/autobind';
import TableContext from './TableContext';
import { ColumnLock, TableAutoHeightType } from './enum';

export interface TableBodyProps {
  lock?: ColumnLock | boolean;
  getRef?: (node: HTMLDivElement | null) => void;
  onScroll?: (e) => void;
}

@observer
export default class TableBody extends Component<TableBodyProps> {
  static displayName = 'TableBody';

  static contextType = TableContext;

  element: HTMLDivElement | null;

  @autobind
  saveRef(node: HTMLDivElement | null) {
    const { getRef } = this.props;
    if (getRef) {
      getRef(node);
    }
    this.element = node;
  }

  componentDidUpdate(): void {
    const { element } = this;
    if (element) {
      const { scrollHeight, clientHeight } = element;
      // Fixed vertical scrollbar not displayed in Chrome when scrollHeight - clientHeight < scrollbarHeight
      if (scrollHeight > clientHeight && scrollHeight - clientHeight < measureScrollbar()) {
        const { overflow } = element.style;
        element.style.overflow = 'scroll';
        raf(() => {
          element.style.overflow = overflow;
        });
      }
    }
  }

  getHeightStyle(scrollbar: number) {
    const { lock } = this.props;
    const {
      tableStore: {
        lockColumnsBodyRowsHeight, rowHeight, hasFooter, height, autoHeight, customized: { heightType },
      },
    } = this.context;
    if (!heightType && autoHeight && autoHeight.type === TableAutoHeightType.maxHeight) {
      return undefined;
    }
    if (isNumber(height)) {
      const bodyHeight = Math.max(
        height,
        isNumber(rowHeight) ? rowHeight : lockColumnsBodyRowsHeight[0] || 0,
      );
      if (lock && !hasFooter) {
        return pxToRem(bodyHeight - scrollbar);
      }

      return pxToRem(bodyHeight);
    }
    return undefined;
  }

  render() {
    const { children, lock, onScroll } = this.props;
    const {
      tableStore: {
        prefixCls, leftLeafColumnsWidth, rightLeafColumnsWidth, hasFooter, overflowY, overflowX,
      },
    } = this.context;
    const fixedLeft = lock === true || lock === ColumnLock.left;
    const scrollbar = measureScrollbar();
    const hasFooterAndNotLock = !lock && hasFooter && overflowX && scrollbar;
    const height = this.getHeightStyle(scrollbar);
    const tableBody = (
      <div
        ref={this.saveRef}
        className={`${prefixCls}-body`}
        style={{
          height,
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
