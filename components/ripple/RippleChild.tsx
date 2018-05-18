import * as React from 'react';
import Animate from '../rc-components/animate';
import MouseDown, { Size } from './MouseDown';

export interface RippleChildProps {
  prefixCls?: string;
}

export default class RippleChild extends React.Component<RippleChildProps> {

  currentCircleStyle: any;
  currentStyle: any;

  render() {
    return this.ripple(React.Children.only(this.props.children));
  }

  handleMouseDown(child: React.ReactElement<any>, size?: Size) {
    const { prefixCls } = this.props;
    const { children, style } = child.props;
    const componentProps: any = {
      className: `${prefixCls}-wrapper`,
    };
    let circle;
    if (size) {
      const { x, y, width, height } = size;
      const maxWidth = Math.max(width - x, x);
      const maxHeight = Math.max(height - y, y);
      const max = Math.sqrt(maxWidth * maxWidth + maxHeight * maxHeight);
      this.currentCircleStyle = {
        width: max * 2,
        height: max * 2,
        left: x - max,
        top: y - max,
      };
      circle = <div className={prefixCls} key="circle" style={this.currentCircleStyle} />;
    }
    const newProps: any = {
      children: [
        children,
        <Animate
          key="ripple"
          component="div"
          componentProps={componentProps}
          transitionName={size ? 'zoom-small-slow' : 'fade'}
        >
          {circle}
        </Animate>,
      ],
      style: this.currentStyle || style,
    };
    if (size) {
      newProps.visible = 'visible';
      if (size.position === 'static') {
        newProps.style = this.currentStyle = Object.assign({}, style, { position: 'relative' });
      }
    }
    return React.cloneElement(child as React.ReactElement<any>, newProps);
  }

  ripple = (child: React.ReactChild) => {
    if (React.isValidElement(child)) {
      return (
        <MouseDown>
          {this.handleMouseDown.bind(this, child)}
        </MouseDown>
      );
    }
    return child;
  };
}
