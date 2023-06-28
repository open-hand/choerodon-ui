import { cloneElement, Component, isValidElement, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import alignElement, { alignPoint } from './domAlign';
import EventManager from '../_util/EventManager';
import TaskRunner from '../_util/TaskRunner';

import { isSamePoint, isWindow } from './util';

export type AlignPoint = { pageX?: number; pageY?: number; clientX?: number; clientY?: number };

export type AlignTarget = (() => Element | Text | null) | AlignPoint;

function getElement(func: AlignTarget | undefined): Element | Text | null {
  if (typeof func !== 'function' || !func) return null;
  return func();
}

function getPoint(point: AlignTarget | undefined): AlignPoint | null {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

export type ChildrenFunction = (innerRef: (node) => void) => ReactNode;

function isChildrenFunction(fn: ReactNode | ChildrenFunction): fn is ChildrenFunction {
  return typeof fn === 'function';
}

export interface AlignProps {
  childrenProps?: object;
  childrenRef?: (node) => void;
  align: object;
  target?: AlignTarget;
  onAlign?: (source: Element | Text | null, align: object, target: HTMLElement | null, translate: { x: number; y: number }, point: AlignPoint | null) => void;
  monitorBufferTime?: number;
  monitorWindowResize?: boolean;
  hidden?: boolean;
  children?: ReactNode | ChildrenFunction;
}

export default class Align extends Component<AlignProps, any> {
  static displayName = 'Align';

  static defaultProps = {
    target: () => window,
    monitorBufferTime: 50,
    monitorWindowResize: false,
    hidden: true,
  };

  resizeHandler: EventManager | null;

  bufferMonitor: TaskRunner | null;

  source?: HTMLElement;

  sourceRect: ClientRect | DOMRect | null;

  saveSourceRef = (node) => {
    this.source = node;
    const { childrenRef } = this.props;
    if (childrenRef) {
      childrenRef(node);
    }
  };

  componentDidMount() {
    const { hidden, monitorWindowResize } = this.props;
    this.forceAlign();
    if (!hidden && monitorWindowResize) {
      this.startMonitorWindowResize();
    }
  }

  componentDidUpdate(prevProps) {
    const { hidden, align, target, monitorWindowResize } = this.props;
    const { hidden: preHidden, align: preAlign, target: preTarget } = prevProps;
    let reAlign = false;

    if (!hidden) {
      const { source = findDOMNode(this) as HTMLElement } = this;
      const sourceRect = source ? source.getBoundingClientRect() : null;
      if (preHidden || preAlign !== align) {
        reAlign = true;
      } else {
        const lastElement = getElement(preTarget);
        const currentElement = getElement(target);
        const lastPoint = getPoint(preTarget);
        const currentPoint = getPoint(target);

        if (isWindow(lastElement) && isWindow(currentElement)) {
          // Skip if is window
          reAlign = false;
        } else if (
          lastElement !== currentElement || // Element change
          (lastElement && !currentElement && currentPoint) || // Change from element to point
          (lastPoint && currentPoint && currentElement) || // Change from point to element
          (currentPoint && !isSamePoint(lastPoint, currentPoint))
        ) {
          reAlign = true;
        }

        // If source element size changed
        const preRect = this.sourceRect;
        if (!reAlign && sourceRect
          && (!preRect || (Math.round(preRect.width) !== Math.round(sourceRect.width) || Math.round(preRect.height) !== Math.round(sourceRect.height)))) {
          reAlign = true;
        }
      }

      this.sourceRect = sourceRect;
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
    const { monitorBufferTime } = this.props;
    if (!this.resizeHandler) {
      this.resizeHandler = new EventManager(window);
      this.bufferMonitor = new TaskRunner();
      this.resizeHandler.addEventListener(
        'resize',
        this.bufferMonitor.delay.bind(
          this.bufferMonitor,
          monitorBufferTime,
          this.forceAlign.bind(this),
        ),
      );
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

  forceAlign() {
    const { hidden, onAlign = noop, target, align } = this.props;
    if (!hidden && target) {
      const { source = findDOMNode(this) as HTMLElement } = this;
      if (source && source.offsetParent) {
        let result;
        const element: HTMLElement | null = getElement(target) as HTMLElement | null;
        const point = getPoint(target);
        if (element) {
          if (!element.offsetParent && !(element instanceof SVGElement)) {
            return;
          }
          result = alignElement(source, element, align);
        } else if (point) {
          result = alignPoint(source, point, align);
        }
        const translate = {
          x: 0,
          y: 0,
        };
        const { points, overflow: { adjustX, adjustY } } = result;
        if (element && (adjustX || adjustY) && (points.includes('bc') || points.includes('tc'))) {
          const r1 = source.getBoundingClientRect();
          const r2 = element.getBoundingClientRect();
          if (adjustX) {
            translate.x = Math.round(r1.left + r1.width / 2 - r2.left - r2.width / 2);
          }
          if (adjustY) {
            translate.y = Math.round(r1.top + r1.height / 2 - r2.top - r2.height / 2);
          }
        }
        onAlign(source, result, element, translate, point);
      }
    }
  }

  render() {
    const { props } = this;
    const { childrenProps, children } = props;
    const node = isChildrenFunction(children) ? children(this.saveSourceRef) : children;
    if (childrenProps && isValidElement(node)) {
      const newProps = {};
      Object.keys(childrenProps).forEach(prop => {
        if ({}.hasOwnProperty.call(childrenProps, prop)) {
          newProps[prop] = props[childrenProps[prop]];
        }
      });
      return cloneElement(node, newProps);
    }
    return node;
  }
}
