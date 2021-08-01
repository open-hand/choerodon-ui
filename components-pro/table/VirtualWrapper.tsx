import React, { FunctionComponent, ReactElement, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { TableWrapperProps } from './TableWrapper';

export interface VirtualWrapperProps {
  children?: ReactElement<TableWrapperProps>
}

const VirtualWrapper: FunctionComponent<VirtualWrapperProps> = observer(function VirtualWrapper(props) {
  const {
    tableStore: { virtualTop, virtualHeight }, prefixCls,
  } = useContext(TableContext);
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
