import React, { Children, PureComponent, ReactChild } from 'react';
import RippleChild from './RippleChild';
import { getPrefixCls } from '../configure';

export interface RippleProps {
  prefixCls?: string;
}

export default class Ripple extends PureComponent<RippleProps> {
  static displayName = 'Ripple';

  render() {
    const { children } = this.props;
    if (!children) {
      return null;
    }
    return Children.map(children, this.rippleChild);
  }

  rippleChild = (child: ReactChild) => {
    return <RippleChild prefixCls={getPrefixCls('ripple', this.props.prefixCls)}>{child}</RippleChild>;
  };
}
