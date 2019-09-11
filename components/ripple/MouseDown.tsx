import { cloneElement, MouseEventHandler, PureComponent, ReactElement } from 'react';
import PropTypes from 'prop-types';

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

export type Size = { x: number; y: number; width: number; height: number; position: string };

export interface MouseDownProps {
  children: (child: ReactElement<any>, size?: Size) => ReactElement<any>;
  rippleChild: ReactElement<any>;
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

  show: MouseEventHandler<HTMLElement> = e => {
    const { currentTarget } = e;
    const pos: ClientRect = currentTarget.getBoundingClientRect();
    this.setState({
      size: {
        x: e.clientX - pos.left,
        y: e.clientY - pos.top,
        width: currentTarget.clientWidth,
        height: currentTarget.clientHeight,
        position:
          document.defaultView && document.defaultView.getComputedStyle(currentTarget).position,
      },
    });
  };

  hide = () => {
    this.setState({
      size: undefined,
    });
  };
}
