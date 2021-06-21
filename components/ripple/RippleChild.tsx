import React, { Children, cloneElement, isValidElement, PureComponent, ReactElement, ReactNode } from 'react';
import Animate from '../animate';
import createChains from '../_util/createChains';
import MouseDown, { Size } from './MouseDown';

export interface RippleChildProps {
  prefixCls?: string;
}

export default class RippleChild extends PureComponent<RippleChildProps> {
  static displayName = 'RippleChild';

  currentCircleStyle: any;

  currentStyle: any;

  componentProps?: any;

  render() {
    const { children } = this.props;
    return this.ripple(Children.only(children));
  }

  getComponentProps(prefixCls) {
    const className = `${prefixCls}-wrapper`;
    const { componentProps } = this;
    if (!componentProps || className !== componentProps.className) {
      this.componentProps = {
        className,
      };
    }
    return this.componentProps;
  }

  handleMouseDown = (child: ReactElement<any>, size?: Size) => {
    const { prefixCls, ...rest } = this.props;
    const { children, style } = child.props;
    if (size) {
      const { x, y, width, height } = size;
      const maxWidth = Math.max(width - x, x);
      const maxHeight = Math.max(height - y, y);
      const max = Math.sqrt(maxWidth * maxWidth + maxHeight * maxHeight);
      this.currentCircleStyle = {
        width: max + max,
        height: max + max,
        left: x - max,
        top: y - max,
      };
    }
    const newProps: any = {
      ...createChains(rest, child.props),
      children: [
        children,
        <Animate
          key="ripple"
          component="div"
          componentProps={this.getComponentProps(prefixCls)}
          transitionName={size ? 'zoom-small-slow' : 'fade'}
          hiddenProp="hidden"
        >
          {this.currentCircleStyle && (
            <div
              hidden={!size}
              className={prefixCls}
              key="circle"
              style={this.currentCircleStyle}
            />
          )}
        </Animate>,
      ],
      style: this.currentStyle || style,
    };
    if (size && size.position === 'static') {
      newProps.style = { ...style, position: 'relative' };
      this.currentStyle = newProps.style;
    }
    return cloneElement<any>(child, newProps);
  };

  ripple = (child: ReactNode) => {
    if (isValidElement<any>(child)) {
      return <MouseDown rippleChild={child}>{this.handleMouseDown}</MouseDown>;
    }
    return child;
  };
}
