import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import noop from 'lodash/noop';
import KeyCode from '../../_util/KeyCode';
import { getOffsetLeft } from './util';
import Star from './Star';

export default class Rate extends Component {
  static defaultProps = {
    defaultValue: 0,
    count: 5,
    allowHalf: false,
    allowClear: true,
    style: {},
    prefixCls: 'rc-rate',
    onChange: noop,
    character: '★',
    onHoverChange: noop,
    tabIndex: 0,
  };

  constructor(props) {
    super(props);
    let value = props.value;
    if (value === undefined) {
      value = props.defaultValue;
    }

    this.stars = {};

    this.state = {
      value,
      focused: false,
      cleanedValue: null,
    };
  }

  componentDidMount() {
    if (this.props.autoFocus && !this.props.disabled) {
      this.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      let value = nextProps.value;
      if (value === undefined) {
        value = nextProps.defaultValue;
      }
      this.setState({
        value,
      });
    }
  }

  onHover = (event, index) => {
    const hoverValue = this.getStarValue(index, event.pageX);
    const { cleanedValue } = this.state;
    if (hoverValue !== cleanedValue) {
      this.setState({
        hoverValue,
        cleanedValue: null,
      });
    }
    this.props.onHoverChange(hoverValue);
  };

  onMouseLeave = () => {
    this.setState({
      hoverValue: undefined,
      cleanedValue: null,
    });
    this.props.onHoverChange(undefined);
  };

  onClick = (event, index) => {
    const value = this.getStarValue(index, event.pageX);
    let isReset = false;
    if (this.props.allowClear) {
      isReset = value === this.state.value;
    }
    this.onMouseLeave(true);
    this.changeValue(isReset ? 0 : value);
    this.setState({
      cleanedValue: isReset ? value : null,
    });
  };

  onFocus = () => {
    const { onFocus } = this.props;
    this.setState({
      focused: true,
    });
    if (onFocus) {
      onFocus();
    }
  };

  onBlur = () => {
    const { onBlur } = this.props;
    this.setState({
      focused: false,
    });
    if (onBlur) {
      onBlur();
    }
  };

  onKeyDown = (event) => {
    const { keyCode } = event;
    const { count, allowHalf, onKeyDown } = this.props;
    let { value } = this.state;
    if (keyCode === KeyCode.RIGHT && value < count) {
      if (allowHalf) {
        value += 0.5;
      } else {
        value += 1;
      }
      this.changeValue(value);
      event.preventDefault();
    } else if (keyCode === KeyCode.LEFT && value > 0) {
      if (allowHalf) {
        value -= 0.5;
      } else {
        value -= 1;
      }
      this.changeValue(value);
      event.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  getStarDOM(index) {
    return ReactDOM.findDOMNode(this.stars[index]);
  }

  getStarValue(index, x) {
    let value = index + 1;
    if (this.props.allowHalf) {
      const starEle = this.getStarDOM(index);
      const leftDis = getOffsetLeft(starEle);
      const width = starEle.clientWidth;
      if ((x - leftDis) < width / 2) {
        value -= 0.5;
      }
    }
    return value;
  }

  focus() {
    if (!this.props.disabled) {
      this.rate.focus();
    }
  }

  blur() {
    if (!this.props.disabled) {
      this.rate.focus();
    }
  }

  changeValue(value) {
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }
    this.props.onChange(value);
  }

  saveRef = (index) => (node) => {
    this.stars[index] = node;
  };

  saveRate = (node) => {
    this.rate = node;
  };

  render() {
    const {
      count,
      allowHalf,
      style,
      prefixCls,
      disabled,
      className,
      character,
      tabIndex,
      checkedColor,
      unCheckedColor,
    } = this.props;
    const { value, hoverValue, focused } = this.state;
    const stars = [];
    const disabledClass = disabled ? `${prefixCls}-disabled` : '';
    for (let index = 0; index < count; index++) {
      stars.push(
        <Star
          ref={this.saveRef(index)}
          index={index}
          count={count}
          disabled={disabled}
          prefixCls={`${prefixCls}-star`}
          allowHalf={allowHalf}
          value={hoverValue === undefined ? value : hoverValue}
          onClick={this.onClick}
          onHover={this.onHover}
          key={index}
          character={character}
          focused={focused}
          checkedColor={checkedColor}
          unCheckedColor={unCheckedColor}
        />,
      );
    }
    return (
      <ul
        className={classNames(prefixCls, disabledClass, className)}
        style={style}
        onMouseLeave={disabled ? null : this.onMouseLeave}
        tabIndex={disabled ? -1 : tabIndex}
        onFocus={disabled ? null : this.onFocus}
        onBlur={disabled ? null : this.onBlur}
        onKeyDown={disabled ? null : this.onKeyDown}
        ref={this.saveRate}
        role="radiogroup"
      >
        {stars}
      </ul>
    );
  }
}
