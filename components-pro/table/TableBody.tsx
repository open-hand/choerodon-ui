import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import TableContext from './TableContext';
import { ColumnLock, TableAutoHeightType } from './enum';

export interface TableBodyProps {
  lock?: ColumnLock | boolean;
  getRef?: (node: HTMLDivElement | null) => void;
  onScroll?: (e) => void;
  style?: CSSProperties;
}

const TableBody: FunctionComponent<TableBodyProps> = observer(function TableBody(props) {
  const { children, lock, onScroll, style, getRef } = props;
  const { prefixCls, tableStore } = useContext(TableContext);
  const { hasFooter, overflowY, overflowX } = tableStore;
  // const saveRef = useCallback((node: HTMLDivElement | null) => {
  //   const { getRef } = this.props;
  //   if (getRef) {
  //     getRef(node);
  //   }
  //   // this.element = node;
  // },[getRef])

  //   componentDidUpdate(): void {
  //     const { element } = this;
  //   if (element) {
  //     const { scrollHeight, clientHeight } = element;
  //     // Fixed vertical scrollbar not displayed in Chrome when scrollHeight - clientHeight < scrollbarHeight
  //     if (scrollHeight > clientHeight && scrollHeight - clientHeight < measureScrollbar()) {
  //       const { overflow } = element.style;
  //       element.style.overflow = 'scroll';
  //       raf(() => {
  //         element.style.overflow = overflow;
  //       });
  //     }
  //   }
  // }

  const getHeightStyle = () => {
    if (!tableStore.customized.heightType) {
      const { autoHeight } = tableStore;
      if (autoHeight && autoHeight.type === TableAutoHeightType.maxHeight) {
        return undefined;
      }
    }
    return tableStore.height;
  };
  const fixedLeft = lock === true || lock === ColumnLock.left;
  const scrollbar = measureScrollbar();
  const hasFooterAndNotLock = !lock && hasFooter && overflowX && scrollbar;
  const height = getHeightStyle();
  const hasLockAndNoFooter = lock && !hasFooter && overflowX && height !== undefined && scrollbar;
  const tableBody = (
    <div
      ref={getRef}
      className={`${prefixCls}-body`}
      style={{
        ...(height === undefined ? style : {}),
        height: pxToRem(
          hasFooterAndNotLock && height !== undefined ? height + scrollbar : hasLockAndNoFooter && height !== undefined ? height - scrollbar : height,
        ),
        marginBottom: hasFooterAndNotLock ? pxToRem(-scrollbar) : undefined,
        width: fixedLeft ? pxToRem(tableStore.leftColumnGroups.width + (scrollbar || 20)) :
          lock === ColumnLock.right
            ? pxToRem(tableStore.rightColumnGroups.width - 1 + (overflowY ? scrollbar : 0))
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
      <div className={`${prefixCls}-body-wrapper`} style={{ width: pxToRem(tableStore.leftColumnGroups.width) }}>
        {tableBody}
      </div>
    );
  }

  return tableBody;
});

TableBody.displayName = 'TableBody';

export default TableBody;
