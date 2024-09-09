import React, { Component } from 'react';

export default class Star extends Component {
  onHover = (e) => {
    const { onHover, index } = this.props;
    onHover(e, index);
  }

  onClick = (e) => {
    const { onClick, index } = this.props;
    onClick(e, index);
  }

  onKeyDown = (e) => {
    const { onClick, index } = this.props;
    if (e.keyCode === 13) {
      onClick(e, index);
    }
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
    const { onHover, onClick, onKeyDown } = this;
    const { disabled, prefixCls, character, index, count, value, checkedColor, unCheckedColor } = this.props;
    const starValue = index + 1;
    const isHalf = value + 0.5 === starValue;
    const isFull = starValue <= value;
    const firstStyle = checkedColor && unCheckedColor ? { color: isFull || isHalf ? checkedColor : unCheckedColor } : {};
    const secondStyle = checkedColor && unCheckedColor ? { color: isFull ? checkedColor : unCheckedColor } : {};
    return (
      <li
        className={this.getClassName()}
        onClick={disabled ? null : onClick}
        onKeyDown={disabled ? null : onKeyDown}
        onMouseMove={disabled ? null : onHover}
        role="radio"
        aria-checked={value > index ? 'true' : 'false'}
        aria-posinset={index + 1}
        aria-setsize={count}
        tabIndex={0}
      >
        <div className={`${prefixCls}-first`} style={firstStyle}>{character}</div>
        <div className={`${prefixCls}-second`} style={secondStyle}>{character}</div>
      </li>
    );
  }
}
