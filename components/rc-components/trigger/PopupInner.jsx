import React, { Component } from 'react';
import LazyRenderBox from './LazyRenderBox';

export default class PopupInner extends Component {
  static displayName = 'RcPopupInner';

  render() {
    const props = this.props;
    let className = props.className;
    if (props.hidden) {
      className += ` ${props.hiddenClassName}`;
    }
    return (
      <div
        className={className}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        style={props.style}
        ref={props.innerRef}
      >
        <LazyRenderBox className={`${props.prefixCls}-content`} hidden={props.hidden}>
          {props.children}
        </LazyRenderBox>
      </div>
    );
  }
}
