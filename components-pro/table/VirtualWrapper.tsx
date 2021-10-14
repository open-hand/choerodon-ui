import React, { FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { TableWrapperProps } from './TableWrapper';

export interface VirtualWrapperProps {
  children?: ReactElement<TableWrapperProps>;
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = observer(function VirtualWrapper(props) {
  const { tableStore, prefixCls } = useContext(TableContext);
  const { virtualTop, virtualHeight } = tableStore;
  const [height, setHeight] = useState(virtualHeight);
  useEffect(() => {
    if (virtualHeight !== height) {
      const { lastScrollTop, node: { tableBodyWrap } } = tableStore;
      if (lastScrollTop && tableBodyWrap) {
        tableBodyWrap.scrollTop = Math.max(0, virtualHeight - height + lastScrollTop);
      }
      setHeight(virtualHeight);
    }
  }, [virtualHeight, height, tableStore]);
  return (
    <div
      className={`${prefixCls}-tbody-wrapper`}
      style={{ height: pxToRem(virtualHeight) }}
    >
      <div style={{ transform: `translate(0, ${pxToRem(virtualTop)})` }}>
        {props.children}
      </div>
    </div>
  );
});

VirtualWrapper.displayName = 'VirtualWrapper';

export default VirtualWrapper;
