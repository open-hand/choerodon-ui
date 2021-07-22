import React, { FunctionComponent, ReactElement, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { TableWrapperProps } from './TableWrapper';

export interface VirtualWrapperProps {
  children?: ReactElement<TableWrapperProps>
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = observer((props) => {
  const {
    tableStore: { virtualTop, virtualHeight, prefixCls },
  } = useContext(TableContext);
  const wrapperStyle = useMemo(() => ({ height: pxToRem(virtualHeight) }), [virtualHeight]);
  const style = useMemo(() => ({ transform: `translate(0, ${pxToRem(virtualTop)})` }), [virtualTop]);
  return (
    <div
      className={`${prefixCls}-tbody-wrapper`}
      style={wrapperStyle}
    >
      <div style={style}>
        {props.children}
      </div>
    </div>
  );
});

VirtualWrapper.displayName = 'VirtualWrapper';

export default VirtualWrapper;
