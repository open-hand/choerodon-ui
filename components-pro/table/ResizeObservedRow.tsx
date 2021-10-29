import React, { FunctionComponent, Key, memo, useCallback } from 'react';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';

export interface ResizeObservedRowProps {
  onResize: (rowIndex: Key, height: number) => void;
  rowIndex: Key;
}

const ResizeObservedRow: FunctionComponent<ResizeObservedRowProps> = function ResizeObservedRow(props) {
  const { children, onResize, rowIndex } = props;
  const handleResize = useCallback((_width: number, height: number) => {
    onResize(rowIndex, height);
  }, [onResize, rowIndex]);
  return (
    <ReactResizeObserver resizeProp="height" onResize={handleResize} immediately>
      {children}
    </ReactResizeObserver>
  );
};

ResizeObservedRow.displayName = 'ResizeObservedRow';

export default memo(ResizeObservedRow);
