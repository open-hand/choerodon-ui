import { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import domAlign from 'dom-align';
import EventManager from '../_util/EventManager';
import TaskRunner from '../_util/TaskRunner';

type FirstParam<T extends (...args: any) => any> = T extends (arg1: infer A, ...rest: any) => any ? A : never;

export interface AlignProps {
  childrenProps?: object;
  align: object;
  target?: () => Node | Window;
  onAlign?: (source: Element | Text | null, align: object, target: Node | Window) => void;
  monitorBufferTime?: number;
  monitorWindowResize?: boolean;
  hidden?: boolean;
  children: FirstParam<typeof cloneElement>;
}

export default class Align extends Component<AlignProps, any> {
  static displayName = 'Align';

  static propTypes = {
    childrenProps: PropTypes.object,
    align: PropTypes.object.isRequired,
    target: PropTypes.func,
    onAlign: PropTypes.func,
    monitorBufferTime: PropTypes.number,
    monitorWindowResize: PropTypes.bool,
    hidden: PropTypes.bool,
    children: PropTypes.any,
  };

  static defaultProps = {
    monitorBufferTime: 50,
    monitorWindowResize: false,
    hidden: true,
  };

  resizeHandler: EventManager | null;
  bufferMonitor: TaskRunner | null;

  forceAlign() {
    const { hidden, onAlign = noop, target = () => window, align } = this.props;
    if (!hidden) {
      const source = findDOMNode(this);
      const ref = target();
      onAlign(source, domAlign(source, ref, align), ref);
    }
  }

  componentDidMount() {
    const { hidden, monitorWindowResize } = this.props;
    this.forceAlign();
    if (!hidden && monitorWindowResize) {
      this.startMonitorWindowResize();
    }
  }

  componentDidUpdate(prevProps) {
    const { hidden, align, target = () => window, monitorWindowResize } = this.props;
    const { hidden: preHidden, align: preAlign, target: preTarget } = prevProps;
    let reAlign = false;

    if (!hidden) {
      if (preHidden || preAlign !== align) {
        reAlign = true;
      } else {
        const lastTarget = preTarget();
        const currentTarget = target();
        if (isWindow(lastTarget) && isWindow(currentTarget)) {
          reAlign = false;
        } else if (lastTarget !== currentTarget) {
          reAlign = true;
        }
      }
    }

    if (reAlign) {
      this.forceAlign();
    }

    if (monitorWindowResize && !hidden) {
      this.startMonitorWindowResize();
    } else {
      this.stopMonitorWindowResize();
    }
  }

  componentWillUnmount() {
    this.stopMonitorWindowResize();
  }

  startMonitorWindowResize() {
    if (!this.resizeHandler) {
      this.resizeHandler = new EventManager(window);
      this.bufferMonitor = new TaskRunner();
      this.resizeHandler.addEventListener('resize',
        this.bufferMonitor.delay.bind(this.bufferMonitor, this.props.monitorBufferTime, this.forceAlign.bind(this)));
    }
  }

  stopMonitorWindowResize() {
    if (this.resizeHandler) {
      if (this.bufferMonitor) {
        this.bufferMonitor.cancel();
      }
      this.resizeHandler.clear();
      this.resizeHandler = null;
    }
  }

  render() {
    const { childrenProps, children } = this.props;
    if (childrenProps) {
      const newProps = {};
      for (let prop in childrenProps) {
        if (childrenProps.hasOwnProperty(prop)) {
          newProps[prop] = this.props[childrenProps[prop]];
        }
      }
      return cloneElement(Children.only(children), newProps);
    }
    return children;
  }

}

function isWindow(obj) {
  return obj != null && obj === obj.window;
}
