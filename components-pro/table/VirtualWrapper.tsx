import React, { FunctionComponent, ReactNode, useContext, useEffect, useState } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import omit from 'lodash/omit';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Spin from '../spin';
import TableContext from './TableContext';
import { toTransformValue } from '../_util/transform';
import mergeProps from '../_util/mergeProps';

export interface VirtualWrapperProps {
  children?: ReactNode;
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = function VirtualWrapper(props) {
  const { children } = props;
  const { tableStore, prefixCls, virtualSpin, spinProps } = useContext(TableContext);
  const { virtualTop, virtualHeight, rowHeight: virtualRowHeight, scrolling = false } = tableStore;
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
    <>
      <div
        className={`${prefixCls}-tbody-wrapper`}
        style={{ height: pxToRem(virtualHeight), pointerEvents: scrolling ? 'none' : undefined }}
      >
        <div style={{ transform: toTransformValue({ translateY: pxToRem(virtualTop) }) }}>
          {children}
        </div>
      </div>
      {
        virtualSpin && scrolling && (
          <Spin
            {
              ...mergeProps(omit(spinProps, ['dataSet']), {
                spinning: true,
                style: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: pxToRem(tableStore.lastScrollTop)!,
                  transform: toTransformValue({ translate: '-50% -50%' }),
                },
              })
            }
          />
        )
      }
    </>
  );
};

VirtualWrapper.displayName = 'VirtualWrapper';

export default observer(VirtualWrapper);
