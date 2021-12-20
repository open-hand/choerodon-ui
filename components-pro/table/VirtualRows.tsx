import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import TableContext from './TableContext';

export interface VirtualRowsProps {
  renderBefore?: (startIndex: number) => ReactNode;
  children: (rowIndex: number) => ReactNode;
}

const VirtualRows: FunctionComponent<VirtualRowsProps> = function VirtualRows(props) {
  const { children, renderBefore } = props;
  const { tableStore } = useContext(TableContext);
  const { virtualStartIndex, virtualEndIndex } = tableStore;
  const rows: ReactNode[] = [];
  if (renderBefore) {
    const before = renderBefore(virtualStartIndex);
    if (before) {
      rows.push(before);
    }
  }
  for (let rowIndex = virtualStartIndex; rowIndex < virtualEndIndex; rowIndex++) {
    rows.push(children(rowIndex));
  }
  return <>{rows}</>;
};

VirtualRows.displayName = 'VirtualRows';

export default observer(VirtualRows);
