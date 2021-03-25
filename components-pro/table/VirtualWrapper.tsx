import React, { FunctionComponent, ReactElement, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import TableContext from './TableContext';
import { TableWrapperProps } from './TableWrapper';

export interface VirtualWrapperProps {
  children?: ReactElement<TableWrapperProps>
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = observer((props) => {
  const { children } = props;
  const {
    tableStore: { virtualTop, virtualHeight, prefixCls },
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
