import React, { FunctionComponent, ReactElement, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import TableContext from './TableContext';
import TableWrapper from './TableWrapper';

export interface VirtualWrapperProps {
  prefixCls?: string;
  children?: ReactElement<TableWrapper>
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = observer((props) => {
  const { children, prefixCls } = props;
  const {
    tableStore: { virtualTop, virtualHeight },
  } = useContext(TableContext);
  const style = useMemo(() => ({ transform: `translate(0, ${virtualTop}px)` }), [virtualTop]);
  return (
    <div
      className={`${prefixCls}-tbody-wrapper`}
      style={{ height: virtualHeight }}
    >
      <div style={style}>
        {children}
      </div>
    </div>
  );
});

export default VirtualWrapper;
