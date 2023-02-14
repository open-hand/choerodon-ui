import { transformZoomData } from 'choerodon-ui/shared/util';
import { cloneElement, FunctionComponent, memo, MouseEventHandler, ReactElement, useCallback, useState } from 'react';

function wrapEvent(
  element: ReactElement<any>,
  eventName: string,
  callback: MouseEventHandler<HTMLElement>,
): MouseEventHandler<HTMLElement> {
  return e => {
    const originalEvent = element.props[eventName];
    if (originalEvent) {
      originalEvent(e);
    }
    callback(e);
  };
}

export type Size = { x: number; y: number; width: number; height: number; position: string | null };

export interface MouseDownProps {
  children: (child: ReactElement<any>, size?: Size) => ReactElement<any>;
  rippleChild: ReactElement<any>;
}

const MouseDown: FunctionComponent<MouseDownProps> = function MouseDown(props) {
  const [size, setSize] = useState<Size | undefined>();
  const show: MouseEventHandler<HTMLElement> = useCallback(e => {
    const { currentTarget } = e;
    const pos: ClientRect = currentTarget.getBoundingClientRect();
    const { ownerDocument } = currentTarget;
    const defaultView = ownerDocument && ownerDocument.defaultView;
    setSize({
      x: transformZoomData(e.clientX) - pos.left,
      y: transformZoomData(e.clientY) - pos.top,
      width: currentTarget.clientWidth,
      height: currentTarget.clientHeight,
      position:
        defaultView ? defaultView.getComputedStyle(currentTarget).position : null,
    });
  }, []);

  const hide = useCallback(() => {
    setSize(undefined);
  }, []);
  const { children, rippleChild } = props;
  const element = children(rippleChild, size);
  const newProps = {
    onMouseDown: wrapEvent(element, 'onMouseDown', show),
  };
  if (size) {
    Object.assign(newProps, {
      onMouseUp: wrapEvent(element, 'onMouseUp', hide),
      onMouseLeave: wrapEvent(element, 'onMouseLeave', hide),
      onDragEnd: wrapEvent(element, 'onDragEnd', hide),
    });
  }
  return cloneElement(element, newProps);
};

MouseDown.displayName = 'MouseDown';

export default memo(MouseDown);
