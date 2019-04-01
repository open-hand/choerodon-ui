import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LazyRenderBox from './LazyRenderBox';

export default class PopupInner extends Component {
  static propTypes = {
    hiddenClassName: PropTypes.string,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    children: PropTypes.any,
  };

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
      >
        <LazyRenderBox className={`${props.prefixCls}-content`} hidden={props.hidden}>
          {props.children}
        </LazyRenderBox>
      </div>
    );
  }
}
