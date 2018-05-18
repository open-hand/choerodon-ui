import * as React from 'react';

export type Size = { x: number, y: number, width: number, height: number, position: string };

export interface MouseDownProps {
  children: (size?: Size) => React.ReactElement<any>;
}

export interface MouseDownState {
  size?: Size;
}

export default class MouseDown extends React.Component<MouseDownProps> {

  state: MouseDownState = {};

  render() {
    const element = this.props.children(this.state.size);
    const { visible } = element.props;
    const newProps = {
      onMouseDown: wrapEvent(element, 'onMouseDown', this.show),
    };
    if (visible) {
      Object.assign(newProps, {
        onMouseUp: wrapEvent(element, 'onMouseUp', this.hide),
        onMouseLeave: wrapEvent(element, 'onMouseLeave', this.hide),
        onDragEnd: wrapEvent(element, 'onDragEnd', this.hide),
      });
    }
    return React.cloneElement(element, newProps);
  }

  show = (e: React.MouseEvent<HTMLElement>) => {
    const { currentTarget } = e;
    const pos: ClientRect = currentTarget.getBoundingClientRect();
    this.setState({
      size: {
        x: e.clientX - pos.left,
        y: e.clientY - pos.top,
        width: currentTarget.clientWidth,
        height: currentTarget.clientHeight,
        position: document.defaultView.getComputedStyle(currentTarget).position,
      },
    });
  };

  hide = () => {
    this.setState({
      size: undefined,
    });
  };
}

function wrapEvent(element: React.ReactElement<any>, eventName: string, callback: (e: React.MouseEvent<HTMLElement>) => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    const originalEvent = element.props[eventName];
    if (originalEvent) {
      originalEvent(e);
    }
    callback(e);
  };
}
