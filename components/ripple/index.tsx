import React, { Children, PureComponent, ReactChild } from 'react';
import RippleChild from './RippleChild';
import { getConfig, getPrefixCls } from '../configure';

export interface RippleProps {
  prefixCls?: string;
  disabled?: boolean;
}

export default class Ripple extends PureComponent<RippleProps> {
  static displayName = 'Ripple';

  render() {
    const { disabled, children } = this.props;
    if (disabled || !children || !getConfig('ripple')) {
      return children;
    }
    return Children.map(children, this.rippleChild);
  }

  rippleChild = (child: ReactChild) => {
    const { prefixCls } = this.props;
    return <RippleChild prefixCls={getPrefixCls('ripple', prefixCls)}>{child}</RippleChild>;
  };
}
