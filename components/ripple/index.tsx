import React, { Children, cloneElement, FunctionComponent, isValidElement, memo, ReactNode, useContext } from 'react';
import RippleChild from './RippleChild';
import createChains from '../_util/createChains';
import ConfigContext from '../config-provider/ConfigContext';

export interface RippleProps {
  prefixCls?: string;
  disabled?: boolean;
  children?: ReactNode;
}

const Ripple: FunctionComponent<RippleProps> = function Ripple(props) {
  const { prefixCls: customizePrefixCls, disabled, children, ...rest } = props;
  const { getPrefixCls, getConfig } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('ripple', customizePrefixCls);

  const rippleChild = (child: ReactNode) => {
    return <RippleChild prefixCls={prefixCls} {...rest}>{child}</RippleChild>;
  };
  if (disabled || !children || !getConfig('ripple')) {
    if (children) {
      return <>{Children.map(children, child => isValidElement(child) ? cloneElement(child, createChains(rest, child.props)) : child)}</>;
    }
    return null;
  }
  return <>{Children.map(children, (child) => rippleChild(child))}</>;
};

Ripple.displayName = 'Ripple';

export default memo(Ripple);
