import { PureComponent, ReactNode } from 'react';
import isObject from 'lodash/isObject';
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
  [Breakpoint.xxl]?: string;
  [Breakpoint.xl]?: string;
  [Breakpoint.lg]?: string;
  [Breakpoint.md]?: string;
  [Breakpoint.sm]?: string;
  [Breakpoint.xs]?: string;
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

export type ChildrenFunction = (items: any[]) => ReactNode;

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

  isDisabled(props) {
    const { disabled, items } = props;
    if (!disabled && items) {
      return !items.some(isObject);
    }
    return true;
  }

  componentDidMount() {
    if (!this.isDisabled(this.props)) {
      this.register();
    }
  }

  componentDidUpdate() {
    const { onChange } = this.props;
    if (onChange) {
      onChange(this.getValues());
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.isDisabled(this.props) && !this.isDisabled(nextProps)) {
      this.register();
    }
    if (!this.isDisabled(this.props) && this.isDisabled(nextProps)) {
      this.unregister();
    }
  }

  componentWillUnmount() {
    if (!this.isDisabled(this.props)) {
      this.unregister();
    }
  }

  register() {
    if (enquire) {
      responsiveArray.map((breakpoint: Breakpoint) =>
        enquire.register(responsiveMap[breakpoint], {
          match: () => {
            this.setState(prevState => ({
              breakpoints: {
                ...prevState.breakpoints,
                [breakpoint]: true,
              },
            }));
          },
          unmatch: () => {
            this.setState(prevState => ({
              breakpoints: {
                ...prevState.breakpoints,
                [breakpoint]: false,
              },
            }));
          },
          // Keep a empty destory to avoid triggering unmatch when unregister
          destroy() {},
        }),
      );
    }
  }

  unregister() {
    Object.keys(responsiveMap).map((breakpoint: Breakpoint) =>
      enquire.unregister(responsiveMap[breakpoint]),
    );
  }

  processValue(value) {
    const { breakpoints } = this.state;
    if (isArrayLike(value)) {
      return value.map(this.processValue, this);
    }
    if (isObject(value)) {
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
    const { children } = this.props;
    if (typeof children === 'function') {
      return (children as ChildrenFunction)(this.getValues());
    }
    return children;
  }
}
