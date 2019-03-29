import { cloneElement, MouseEvent, PureComponent, ReactElement } from 'react';
import PropTypes from 'prop-types';

export type Size = { x: number, y: number, width: number, height: number, position: string };

export interface MouseDownProps {
  children: (child: ReactElement<any>, size?: Size) => ReactElement<any>;
  rippleChild: ReactElement<any>
}

export interface MouseDownState {
  size?: Size;
}

export default class MouseDown extends PureComponent<MouseDownProps> {
  static displayName = 'MouseDown';

  static propTypes = { rippleChild: PropTypes.node };

  state: MouseDownState = {};

  render() {
    const { children, rippleChild } = this.props;
    const { size } = this.state;
    const element = children(rippleChild, size);
    const newProps = {
      onMouseDown: wrapEvent(element, 'onMouseDown', this.show),
    };
    if (size) {
      Object.assign(newProps, {
        onMouseUp: wrapEvent(element, 'onMouseUp', this.hide),
        onMouseLeave: wrapEvent(element, 'onMouseLeave', this.hide),
        onDragEnd: wrapEvent(element, 'onDragEnd', this.hide),
      });
    }
    return cloneElement(element, newProps);
  }

  show = (e: MouseEvent<HTMLElement>) => {
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
      size: void 0,
    });
  };
}

function wrapEvent(element: ReactElement<any>, eventName: string, callback: (e: MouseEvent<HTMLElement>) => void) {
  return (e: MouseEvent<HTMLElement>) => {
    const originalEvent = element.props[eventName];
    if (originalEvent) {
      originalEvent(e);
    }
    callback(e);
  };
}
