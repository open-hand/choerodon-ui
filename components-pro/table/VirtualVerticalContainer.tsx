import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import TableContext from './TableContext';

export interface VirtualVerticalContainerProps {
  renderBefore?: (startIndex: number) => ReactNode;
  children: (rowIndex: number) => ReactNode;
}

const VirtualVerticalContainer: FunctionComponent<VirtualVerticalContainerProps> = function VirtualVerticalContainer(props) {
  const { children, renderBefore } = props;
  const { tableStore } = useContext(TableContext);
  let { virtualStartIndex } = tableStore;
  const { virtualEndIndex } = tableStore;
  const rows: ReactNode[] = [];
  if (renderBefore) {
    const before = renderBefore(virtualStartIndex);
    if (before) {
      rows.push(before);
    }
  }
  while (virtualStartIndex < virtualEndIndex) {
    rows.push(children(virtualStartIndex));
    virtualStartIndex++;
  }
  return <>{rows}</>;
};

VirtualVerticalContainer.displayName = 'VirtualVerticalContainer';

export default observer(VirtualVerticalContainer);
