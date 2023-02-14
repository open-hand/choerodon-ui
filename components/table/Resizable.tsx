import React, { Component, MouseEventHandler } from 'react';
import classes from 'component-classes';
import transform, { toTransformValue } from 'choerodon-ui/pro/lib/_util/transform';
import { transformZoomData } from 'choerodon-ui/shared/util';
import EventManager, { stopEvent } from '../_util/EventManager';

function cloneElement(element: any, props: any) {
  if (props.style && element.props.style) {
    props.style = { ...element.props.style, ...props.style };
  }
  if (props.className && element.props.className) {
    props.className = `${element.props.className} ${props.className}`;
  }
  return React.cloneElement(element, props);
}

type DragCallbackData = {
  node: HTMLElement,
  x: number, y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number,
};

export default class Resizable extends Component<any> {

  draggable: HTMLSpanElement | null;

  resizeEvent?: EventManager;

  componentWillUnmount(): void {
    const { resizeEvent } = this;
    if (resizeEvent) {
      resizeEvent.clear();
      delete this.resizeEvent;
    }
  }

  handleMouseDown: MouseEventHandler<HTMLSpanElement> = (event) => {
    stopEvent(event);
    const { currentTarget } = event;
    const clientX = transformZoomData(event.clientX);
    const { resizeEvent = new EventManager() } = this;
    const clz = classes(currentTarget);
    this.resizeEvent = resizeEvent;
    clz.add('react-draggable-dragging');
    resizeEvent
      .setTarget(currentTarget.ownerDocument)
      .addEventListener('mousemove', (e) => {
        transform(toTransformValue({
          translateX: `${e.clientX - clientX}px`,
        }), currentTarget.style);
      })
      .addEventListener('mouseup', (e) => {
        const { onResize } = this.props;
        if (onResize) {
          const x = transformZoomData(e.clientX) - clientX;
          const dragCallbackData: DragCallbackData = {
            x,
            y: 0,
            lastX: x,
            lastY: 0,
            deltaX: 0,
            deltaY: 0,
            node: currentTarget,
          };
          onResize(event, dragCallbackData);
        }
        currentTarget.style.cssText = '';
        resizeEvent.clear();
        clz.remove('react-draggable-dragging');
      });
  };

  saveDraggable = (draggable: HTMLSpanElement | null) => {
    this.draggable = draggable;
  };

  render() {
    const { children, className } = this.props;

    const { props: { children: subchildren } } = children as any;

    return cloneElement(children, {
      className: className ? `${className} react-resizable` : 'react-resizable',
      children: [
        subchildren,
        <span
          ref={this.saveDraggable}
          key="resizableHandle"
          className="column-resizable-handle"
          onMouseDown={this.handleMouseDown}
        />,
      ],
    });
  }
}
