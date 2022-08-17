import React, { FunctionComponent } from 'react';
import { ElementProps } from 'choerodon-ui/pro/lib/core/ViewComponent';
import ReactResizeObserver from '../_util/resizeObserver';

export interface PopupInnerProps extends ElementProps {
  innerRef: (node) => void;
  onResize: (width: number, height: number, target: Element | null) => void;
}

const PopupInner: FunctionComponent<PopupInnerProps> = ({ innerRef, onResize, ...props }) => (
  <ReactResizeObserver onResize={onResize}>
    <div {...props} ref={innerRef} />
  </ReactResizeObserver>
);

export default PopupInner;
