import React, { Children, cloneElement, isValidElement, PureComponent, ReactNode } from 'react';
import RippleChild from './RippleChild';
import { getConfig, getPrefixCls } from '../configure';
import createChains from '../_util/createChains';

export interface RippleProps {
  prefixCls?: string;
  disabled?: boolean;
}

export default class Ripple extends PureComponent<RippleProps> {
  static displayName = 'Ripple';

  render() {
    const { disabled, children, ...rest } = this.props;
    if (disabled || !children || !getConfig('ripple')) {
      if (children) {
        return Children.map(children, child => isValidElement(child) ? cloneElement(child, createChains(rest, child.props)) : child);
      }
      return children;
    }
    return Children.map(children, (child) => this.rippleChild(child, rest));
  }

  rippleChild(child: ReactNode, rest) {
    const { prefixCls } = this.props;
    return <RippleChild prefixCls={getPrefixCls('ripple', prefixCls)} {...rest}>{child}</RippleChild>;
  }
}
