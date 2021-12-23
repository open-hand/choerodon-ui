import React, { FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { toTransformValue } from '../_util/transform';

export interface VirtualWrapperProps {
  children?: ReactNode;
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = function VirtualWrapper(props) {
  const { children } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const { virtualTop, virtualHeight, rowHeight: virtualRowHeight, scrolling } = tableStore;
  const [height, setHeight] = useState(virtualHeight);
  const [rowHeight, setRowHeight] = useState(virtualRowHeight);
  useEffect(action(() => {
    if (virtualHeight !== height) {
      const { lastScrollTop, node: { tableBodyWrap } } = tableStore;
      if (lastScrollTop && tableBodyWrap) {
        const scrollTop = Math.max(0, virtualHeight - height + lastScrollTop);
        if (scrollTop === tableBodyWrap.scrollTop) {
          tableStore.setLastScrollTop(scrollTop);
        } else {
          tableBodyWrap.scrollTop = scrollTop;
        }
      }
      setHeight(virtualHeight);
    }
  }), [virtualHeight, height, tableStore]);
  useEffect(() => {
    const { lastScrollTop, node: { tableBodyWrap } } = tableStore;
    if (lastScrollTop) {
      tableStore.setLastScrollTop(tableBodyWrap ? tableBodyWrap.scrollTop : 0);
    }
  }, [tableStore]);
  useEffect(action(() => {
    if (virtualRowHeight !== rowHeight) {
      tableStore.actualRowHeight = undefined;
      setRowHeight(virtualRowHeight);
    }
  }), [virtualRowHeight, rowHeight, tableStore]);
  return (
    <div
      className={`${prefixCls}-tbody-wrapper`}
      style={{ height: pxToRem(virtualHeight), pointerEvents: scrolling ? 'none' : undefined }}
    >
      <div style={{ transform: toTransformValue({ translateY: pxToRem(virtualTop) }) }}>
        {children}
      </div>
    </div>
  );
};

VirtualWrapper.displayName = 'VirtualWrapper';

export default observer(VirtualWrapper);
