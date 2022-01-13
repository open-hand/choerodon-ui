import React, { FunctionComponent, Key, memo, ReactNode, useCallback } from 'react';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';

export interface ResizeObservedRowProps {
  onResize: (rowIndex: Key, height: number, target: HTMLTableRowElement) => void;
  rowIndex: Key;
  children?: ReactNode;
}

const ResizeObservedRow: FunctionComponent<ResizeObservedRowProps> = function ResizeObservedRow(props) {
  const { children, onResize, rowIndex } = props;
  const handleResize = useCallback((_width: number, height: number, target: HTMLTableRowElement) => {
    onResize(rowIndex, height, target);
  }, [onResize, rowIndex]);
  return (
    <ReactResizeObserver resizeProp="height" onResize={handleResize} immediately>
      {children}
    </ReactResizeObserver>
  );
};

ResizeObservedRow.displayName = 'ResizeObservedRow';

export default memo<ResizeObservedRowProps>(ResizeObservedRow);
