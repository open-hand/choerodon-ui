import { PureComponent, ReactNode } from 'react';
import isObject from 'lodash/isObject';
import debounce from 'lodash/debounce';
import { isArrayLike } from 'mobx';
import { matchMediaPolifill } from '../_util/mediaQueryListPolyfill';
import { Breakpoint } from './enum';

let enquire: any;
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || matchMediaPolifill;
  // eslint-disable-next-line global-require
  enquire = require('enquire.js');
}

export type BreakpointMap = {
  [Breakpoint.xxl]?: any;
  [Breakpoint.xl]?: any;
  [Breakpoint.lg]?: any;
  [Breakpoint.md]?: any;
  [Breakpoint.sm]?: any;
  [Breakpoint.xs]?: any;
};

const responsiveMap: BreakpointMap = {
  [Breakpoint.xxl]: '(min-width: 1600px)',
  [Breakpoint.xl]: '(min-width: 1200px)',
  [Breakpoint.lg]: '(min-width: 992px)',
  [Breakpoint.md]: '(min-width: 768px)',
  [Breakpoint.sm]: '(min-width: 576px)',
  [Breakpoint.xs]: '(max-width: 575px)',
};

const responsiveArray: Breakpoint[] = Object.keys(responsiveMap) as Breakpoint[];

export function isBreakPointMap(item: any): item is BreakpointMap {
  if (isObject(item)) {
    const keys = Object.keys(item);
    if (keys.length) {
      return keys.every(key => key in responsiveMap);
    }
  }
  return false;
}

export function hasBreakPointMap(items: any[]): boolean {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return items.some(isOrHasBreakPointMap);
}

function isOrHasBreakPointMap(item: any | any[]) {
  return isArrayLike(item) ? hasBreakPointMap(item) : isBreakPointMap(item);
}

export type ChildrenFunction = (items: any[], disabled: boolean) => ReactNode;

export interface ResponsiveProps {
  disabled?: boolean;
  items?: (any | BreakpointMap)[];
  children?: ReactNode | ChildrenFunction;
  onChange?: (items: any[]) => void;
}

export interface ResponsiveState {
  breakpoints: BreakpointMap;
}

export default class Responsive extends PureComponent<ResponsiveProps, ResponsiveState> {
  static displayName = 'Responsive';

  state = { breakpoints: {} };

  handlers = new Map();

  isDisabled(props) {
    const { disabled, items } = props;
    if (!disabled && items) {
      return !hasBreakPointMap(items);
    }
    return true;
  }

  componentDidMount() {
    if (!this.isDisabled(this.props)) {
      this.register();
    }
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    if (!this.isDisabled(prevProps) && this.isDisabled(props)) {
      this.unregister();
    }
    if (this.isDisabled(prevProps) && !this.isDisabled(props)) {
      this.register();
    }
  }

  componentWillUnmount() {
    if (!this.isDisabled(this.props)) {
      this.unregister();
    }
  }

  fireUpdate = debounce(() => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(this.getValues());
    }
  }, 10);

  register() {
    if (enquire) {
      const { handlers } = this;
      responsiveArray.forEach((breakpoint: Breakpoint) => {
        const query = responsiveMap[breakpoint];
        const handler = {
          match: () => {
            this.setState(prevState => ({
              breakpoints: {
                ...prevState.breakpoints,
                [breakpoint]: true,
              },
            }), this.fireUpdate);
          },
          unmatch: () => {
            this.setState(prevState => ({
              breakpoints: {
                ...prevState.breakpoints,
                [breakpoint]: false,
              },
            }), this.fireUpdate);
          },
          // Keep a empty destory to avoid triggering unmatch when unregister
          destroy() {/* noop */},
        };
        enquire.register(query, handler);
        handlers.set(query, handler);
      });
    }
  }

  unregister() {
    const { handlers } = this;
    Object.keys(responsiveMap).forEach((breakpoint: Breakpoint) => {
      const query = responsiveMap[breakpoint];
      const handler = handlers.get(query);
      if (handler) {
        enquire.unregister(query, handler);
      }
    });
  }

  processValue(value) {
    const { breakpoints } = this.state;
    if (isArrayLike(value) && hasBreakPointMap(value)) {
      return value.map(this.processValue, this);
    }
    if (isBreakPointMap(value)) {
      for (let i = 0; i < responsiveArray.length; i++) {
        const breakpoint: Breakpoint = responsiveArray[i];
        if (breakpoints[breakpoint] && value[breakpoint] !== undefined) {
          return value[breakpoint];
        }
      }
      return undefined;
    }
    return value;
  }

  getValues(): any[] {
    const { items } = this.props;
    if (items) {
      return items.map(this.processValue, this);
    }
    return [];
  }

  render() {
    const { props } = this;
    const { children } = props;
    if (typeof children === 'function') {
      return (children as ChildrenFunction)(this.getValues(), this.isDisabled(props));
    }
    return children;
  }
}
