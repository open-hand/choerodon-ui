import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Star extends Component {
  static propTypes = {
    value: PropTypes.number,
    index: PropTypes.number,
    prefixCls: PropTypes.string,
    allowHalf: PropTypes.bool,
    disabled: PropTypes.bool,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    character: PropTypes.node,
    focused: PropTypes.bool,
  };

  onHover = (e) => {
    const { onHover, index } = this.props;
    onHover(e, index);
  }

  onClick = (e) => {
    const { onClick, index } = this.props;
    onClick(e, index);
  }

  getClassName() {
    const { prefixCls, index, value, allowHalf, focused } = this.props;
    const starValue = index + 1;
    let className = prefixCls;
    if (value === 0 && index === 0 && focused) {
      className += ` ${prefixCls}-focused`;
    } else if (allowHalf && value + 0.5 === starValue) {
      className += ` ${prefixCls}-half ${prefixCls}-active`;
      if (focused) {
        className += ` ${prefixCls}-focused`;
      }
    } else {
      className += starValue <= value ? ` ${prefixCls}-full` : ` ${prefixCls}-zero`;
      if (starValue === value && focused) {
        className += ` ${prefixCls}-focused`;
      }
    }
    return className;
  }

  render() {
    const { onHover, onClick } = this;
    const { disabled, prefixCls, character } = this.props;
    return (
      <li
        className={this.getClassName()}
        onClick={disabled ? null : onClick}
        onMouseMove={disabled ? null : onHover}
      >
        <div className={`${prefixCls}-first`}>{character}</div>
        <div className={`${prefixCls}-second`}>{character}</div>
      </li>
    );
  }
}
