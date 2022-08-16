import React, { Component } from 'react';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import { math, Utils } from 'choerodon-ui/dataset';
import KeyCode from '../../_util/KeyCode';
import InputHandler from './InputHandler';
import Icon from '../../icon';
import { preventDefault } from '../../_util/EventManager';

function defaultParser(input) {
  return input.replace(/[^\w\.-]+/g, '');
}

/**
 * When click and hold on a button - the speed of auto changin the value.
 */
const SPEED = 200;

/**
 * When click and hold on a button - the delay before auto changin the value.
 */
const DELAY = 600;


const isEqual = (oldValue, newValue) => newValue === oldValue ||
  ((!isString(newValue) || !newValue.endsWith('.')) && (!isString(oldValue) || !oldValue.endsWith('.')) && math.eq(newValue, oldValue)) ||
  (isNumber(newValue) && isNumber(oldValue) && math.isNaN(newValue) && math.isNaN(oldValue));

export default class InputNumber extends Component {
  static defaultProps = {
    focusOnUpDown: true,
    useTouch: false,
    prefixCls: 'rc-input-number',
    max: Infinity,
    min: -Infinity,
    step: 1,
    style: {},
    onChange: noop,
    onKeyDown: noop,
    onPressEnter: noop,
    onFocus: noop,
    onBlur: noop,
    parser: defaultParser,
    required: false,
    autoComplete: 'off',
  };

  constructor(props) {
    super(props);

    let value;
    if ('value' in props) {
      value = props.value;
    } else {
      value = props.defaultValue;
    }
    this.state = {
      focused: props.autoFocus,
    };
    const validValue = this.getValidValue(this.toNumber(value));
    this.state = {
      ...this.state,
      inputValue: this.toPrecisionAsStep(validValue),
      value: validValue,
    };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentWillUpdate() {
    try {
      this.start = this.input.selectionStart;
      this.end = this.input.selectionEnd;
    } catch (e) {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  }

  componentDidUpdate(prevProps) {
    const { value, onChange, max, min } = this.props;
    const { focused } = this.state;

    // Don't trigger in componentDidMount
    if (prevProps) {
      if (!isEqual(prevProps.value, value) ||
        !isEqual(prevProps.max, max) ||
        !isEqual(prevProps.min, min)) {
        const validValue = focused ? value : this.getValidValue(value);
        let nextInputValue;
        if (this.pressingUpOrDown) {
          nextInputValue = validValue;
        } else if (this.inputting) {
          nextInputValue = this.rawInput;
        } else {
          nextInputValue = this.toPrecisionAsStep(validValue);
        }
        this.setState({ // eslint-disable-line
          value: validValue,
          inputValue: nextInputValue,
        });
      }

      // Trigger onChange when max or min change
      // https://github.com/ant-design/ant-design/issues/11574
      const nextValue = 'value' in this.props ? value : this.state.value;
      // ref: null < 20 === true
      // https://github.com/ant-design/ant-design/issues/14277
      if (onChange && 'max' in this.props &&
        !math.eq(prevProps.max, max) &&
        math.isFinite(nextValue) &&
        math.gt(nextValue, max)
      ) {
        onChange(max);
      }
      if (onChange && 'min' in this.props &&
        !math.eq(prevProps.min, min) &&
        math.isFinite(nextValue) &&
        math.lt(nextValue, min)) {
        onChange(min);
      }
    }

    // Restore cursor
    try {
      // Firefox set the input cursor after it get focused.
      // This caused that if an input didn't init with the selection,
      // set will cause cursor not correct when first focus.
      // Safari will focus input if set selection. We need skip this.
      if (this.cursorStart !== undefined && this.state.focused) {
        // In most cases, the string after cursor is stable.
        // We can move the cursor before it

        if (
          // If not match full str, try to match part of str
          !this.partRestoreByAfter(this.cursorAfter) && this.state.value !== this.props.value
        ) {
          // If not match any of then, let's just keep the position
          // TODO: Logic should not reach here, need check if happens
          let pos = this.cursorStart + 1;

          // If not have last string, just position to the end
          if (!this.cursorAfter) {
            pos = this.input.value.length;
          } else if (this.lastKeyCode === KeyCode.BACKSPACE) {
            pos = this.cursorStart - 1;
          } else if (this.lastKeyCode === KeyCode.DELETE) {
            pos = this.cursorStart;
          }
          this.fixCaret(pos, pos);
        } else if (this.currentValue === this.input.value) {
          // Handle some special key code
          switch (this.lastKeyCode) {
            case KeyCode.BACKSPACE:
              this.fixCaret(this.cursorStart - 1, this.cursorStart - 1);
              break;
            case KeyCode.DELETE:
              this.fixCaret(this.cursorStart + 1, this.cursorStart + 1);
              break;
            default:
            // Do nothing
          }
        }
      }
    } catch (e) {
      // Do nothing
    }

    // Reset last key
    this.lastKeyCode = null;

    // pressingUpOrDown is true means that someone just click up or down button
    if (!this.pressingUpOrDown) {
      return;
    }
    if (this.props.focusOnUpDown && this.state.focused) {
      const selectionRange = this.input.setSelectionRange;
      if (selectionRange &&
        typeof selectionRange === 'function' &&
        this.start !== undefined &&
        this.end !== undefined) {
        this.input.setSelectionRange(this.start, this.end);
      } else {
        this.focus();
      }
    }

    this.pressingUpOrDown = false;
  }

  componentWillUnmount() {
    this.stop();
  }

  onKeyDown = (e, ...args) => {
    const { onKeyDown, onPressEnter } = this.props;

    if (e.keyCode === KeyCode.UP) {
      const ratio = this.getRatio(e);
      this.up(e, ratio);
      this.stop();
    } else if (e.keyCode === KeyCode.DOWN) {
      const ratio = this.getRatio(e);
      this.down(e, ratio);
      this.stop();
    } else if (e.keyCode === KeyCode.ENTER && onPressEnter) {
      onPressEnter(e);
    }

    // Trigger user key down
    this.recordCursorPosition();
    this.lastKeyCode = e.keyCode;
    if (onKeyDown) {
      onKeyDown(e, ...args);
    }
  };

  onKeyUp = (e, ...args) => {
    this.stop();
    const { onKeyUp } = this.props;

    this.recordCursorPosition();

    // Trigger user key up
    if (onKeyUp) {
      onKeyUp(e, ...args);
    }
  };

  onChange = (e) => {
    const { onChange, value } = this.props;
    const { value: stateValue } = this.state;
    if (this.state.focused) {
      this.inputting = true;
    }
    // 限制数字输入框只能输入数字
    let newValue = this.props.parser(this.getValueFromEvent(e));
    if (isNaN(`${newValue}0`)) newValue = this.rawInput !== undefined ? this.rawInput : stateValue !== undefined ? stateValue : value;
    this.rawInput = newValue;
    if (this.composing) {
      this.setState({ inputValue: this.getValueFromEvent(e) });
    } else {
      this.setState({ inputValue: this.rawInput });
      onChange(this.toNumber(this.rawInput)); // valid number or invalid string
    }
  };

  onMouseUp = (...args) => {
    const { onMouseUp } = this.props;

    this.recordCursorPosition();

    if (onMouseUp) {
      onMouseUp(...args);
    }
  };

  onFocus = (...args) => {
    this.setState({
      focused: true,
    });
    this.props.onFocus(...args);
  };

  onBlur = (e, ...args) => {
    this.inputting = false;
    this.setState({
      focused: false,
    });
    const value = this.getCurrentValidValue(this.state.inputValue);
    e.persist();
    this.setValue(value, (newValue) => {
      const { onBlur } = this.props;
      if (onBlur) {
        const originValue = this.input.value;
        const inputValue = this.getInputDisplayValue({ focus: false, value: newValue });
        this.input.value = inputValue;
        onBlur(e, ...args);
        this.input.value = originValue;
      }
    });
  };

  onComposition = (e) => {
    if (e.type === 'compositionstart') {
      this.composing = true;
    } else if (e.type === 'compositionend') {
      this.composing = false;
      this.onChange(e);
    }
  };

  getCurrentValidValue(value) {
    let val = value;
    if (val === '') {
      val = '';
    } else if (!this.isNotCompleteNumber(val)) {
      val = this.getValidValue(val);
    } else {
      val = this.state.value;
    }
    return this.toNumber(val);
  }

  getRatio(e) {
    let ratio = 1;
    if (e.metaKey || e.ctrlKey) {
      ratio = 0.1;
    } else if (e.shiftKey) {
      ratio = 10;
    }
    return ratio;
  }

  getValueFromEvent(e) {
    // optimize for chinese input expierence
    let value = e.target.value.trim().replace(/。/g, '.');

    if (!isNil(this.props.decimalSeparator)) {
      value = value.replace(this.props.decimalSeparator, '.');
    }

    return value;
  }

  getValidValue(value, min = this.props.min, max = this.props.max) {
    if (math.isNaN(value)) {
      return value;
    }
    if (math.lt(value, min)) {
      value = min;
    }
    if (math.gt(value, max)) {
      value = max;
    }
    return value;
  }

  setValue(v, callback) {
    // trigger onChange
    const { precision } = this.props;
    const newValue = this.isNotCompleteNumber(v) ? null : v;
    const { value = null, inputValue = null } = this.state;
    const newValueInString = math.isFinite(newValue)
      ? math.toFixed(newValue, precision) : `${newValue}`;
    const changed = newValue !== value || newValueInString !== `${inputValue}`;
    if (!('value' in this.props)) {
      this.setState({
        value: newValue,
        inputValue: this.toPrecisionAsStep(v),
      }, callback ? () => callback(newValue) : undefined);
    } else {
      // always set input value same as value
      this.setState({
        inputValue: this.toPrecisionAsStep(this.state.value),
      }, callback ? () => callback(newValue) : undefined);
    }
    if (changed) {
      this.props.onChange(newValue);
    }

    return newValue;
  }

  getPrecision(value) {
    if (!isNil(this.props.precision)) {
      return this.props.precision;
    }
    return math.dp(value);
  }

  // step={1.0} value={1.51}
  // press +
  // then value should be 2.51, rather than 2.5
  // if this.props.precision is undefined
  // https://github.com/react-component/input-number/issues/39
  getMaxPrecision(currentValue, ratio = 1) {
    const { precision } = this.props;
    if (!isNil(precision)) {
      return precision;
    }
    const { step } = this.props;
    const ratioPrecision = this.getPrecision(ratio);
    const stepPrecision = this.getPrecision(step);
    if (!currentValue) {
      return ratioPrecision + stepPrecision;
    }
    const currentValuePrecision = this.getPrecision(currentValue);
    return Math.max(currentValuePrecision, ratioPrecision + stepPrecision);
  }

  getPrecisionFactor(currentValue, ratio = 1) {
    const precision = this.getMaxPrecision(currentValue, ratio);
    return math.pow(10, precision);
  }

  getInputDisplayValue = (state) => {
    const { focused, inputValue, value } = state || this.state;
    let inputDisplayValue;
    if (focused) {
      inputDisplayValue = inputValue;
    } else {
      inputDisplayValue = this.toPrecisionAsStep(value);
    }

    if (inputDisplayValue === undefined || inputDisplayValue === null) {
      inputDisplayValue = '';
    }

    let inputDisplayValueFormat = this.formatWrapper(inputDisplayValue);
    if (!isNil(this.props.decimalSeparator)) {
      inputDisplayValueFormat = inputDisplayValueFormat
        .toString()
        .replace('.', this.props.decimalSeparator);
    }

    return inputDisplayValueFormat;
  };

  recordCursorPosition = () => {
    // Record position
    try {
      this.cursorStart = this.input.selectionStart;
      this.cursorEnd = this.input.selectionEnd;
      this.currentValue = this.input.value;
      this.cursorBefore = this.input.value.substring(0, this.cursorStart);
      this.cursorAfter = this.input.value.substring(this.cursorEnd);
    } catch (e) {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  };

  fixCaret(start, end) {
    if (start === undefined || end === undefined || !this.input || !this.input.value) {
      return;
    }

    try {
      const currentStart = this.input.selectionStart;
      const currentEnd = this.input.selectionEnd;

      if (start !== currentStart || end !== currentEnd) {
        this.input.setSelectionRange(start, end);
      }
    } catch (e) {
      // Fix error in Chrome:
      // Failed to read the 'selectionStart' property from 'HTMLInputElement'
      // http://stackoverflow.com/q/21177489/3040605
    }
  }

  restoreByAfter = (str) => {
    if (str === undefined) return false;

    const fullStr = this.input.value;
    const index = fullStr.lastIndexOf(str);

    if (index === -1) return false;

    const prevCursorPos = this.cursorBefore.length;
    if (this.lastKeyCode === KeyCode.DELETE &&
      this.cursorBefore.charAt(prevCursorPos - 1) === str[0]) {
      this.fixCaret(prevCursorPos, prevCursorPos);
      return true;
    }

    if (index + str.length === fullStr.length) {
      this.fixCaret(index, index);

      return true;
    }
    return false;
  };

  partRestoreByAfter = (str) => {
    if (str === undefined) return false;

    // For loop from full str to the str with last char to map. e.g. 123
    // -> 123
    // -> 23
    // -> 3
    return Array.prototype.some.call(str, (_, start) => {
      const partStr = str.substring(start);

      return this.restoreByAfter(partStr);
    });
  };

  focus() {
    this.input.focus();
    this.recordCursorPosition();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  formatWrapper(num) {
    // http://2ality.com/2012/03/signedzero.html
    if (math.isNegativeZero(num)) {
      return '-0';
    }
    if (this.props.formatter) {
      return this.props.formatter(num);
    }
    return num;
  }

  toPrecisionAsStep(num) {
    if (this.isNotCompleteNumber(num) || num === '') {
      return num;
    }
    const precision = Math.abs(this.getMaxPrecision(num));
    if (precision === 0) {
      return math.toString(num);
    }
    if (!isNaN(precision)) {
      return math.toFixed(num, precision);
    }
    return math.toString(num);
  }

  // '1.' '1x' 'xx' '' => are not complete numbers
  isNotCompleteNumber(num) {
    return (
      math.isNaN(num) ||
      num === '' ||
      num === null ||
      (num && num.toString().indexOf('.') === num.toString().length - 1)
    );
  }

  toNumber(num) {
    const { precision } = this.props;
    if (this.isNotCompleteNumber(num)) {
      return num;
    }
    return Utils.parseNumber(num, precision);
  }

  upStep(val, rat) {
    const { step, min } = this.props;
    let result;
    if (math.isFinite(val)) {
      const precision = Math.abs(this.getMaxPrecision(val, rat));
      result = math.fix(new BigNumber(math.toFixed(math.plus(val, step), precision)));
    } else {
      result = min === -Infinity ? step : min;
    }
    return this.toNumber(result);
  }

  downStep(val, rat) {
    const { step, min } = this.props;
    let result;
    if (math.isFinite(val)) {
      const precision = Math.abs(this.getMaxPrecision(val, rat));
      result = math.fix(new BigNumber(math.toFixed(math.minus(val, step), precision)));
    } else {
      result = min === -Infinity ? math.negated(step) : min;
    }
    return this.toNumber(result);
  }

  step(type, e, ratio = 1, recursive) {
    this.stop();
    if (e) {
      e.persist();
      e.preventDefault();
    }
    const props = this.props;
    if (props.disabled) {
      return;
    }
    const value = this.getCurrentValidValue(this.state.inputValue) || 0;
    if (this.isNotCompleteNumber(value)) {
      return;
    }
    let val = this[`${type}Step`](value, ratio);
    let outOfRange;
    if (math.gt(val, props.max)) {
      val = props.max;
      outOfRange = true;
    } else if (math.lt(val, props.min)) {
      val = props.min;
      outOfRange = true;
    }
    this.setValue(val);
    this.setState({
      focused: true,
    });
    if (outOfRange) {
      return;
    }
    this.autoStepTimer = setTimeout(() => {
      this[type](e, ratio, true);
    }, recursive ? SPEED : DELAY);
  }

  stop = () => {
    if (this.autoStepTimer) {
      clearTimeout(this.autoStepTimer);
    }
  };

  down = (e, ratio, recursive) => {
    this.pressingUpOrDown = true;
    this.step('down', e, ratio, recursive);
  };

  up = (e, ratio, recursive) => {
    this.pressingUpOrDown = true;
    this.step('up', e, ratio, recursive);
  };

  saveUp = (node) => {
    this.upHandler = node;
  };

  saveDown = (node) => {
    this.downHandler = node;
  };

  saveInput = (node) => {
    this.input = node;
  };

  renderSuffix = () => {
    const props = { ...this.props };
    const { prefixCls, disabled, readOnly, useTouch, upHandler, downHandler } = props;
    let upDisabledClass = '';
    let downDisabledClass = '';
    const { value } = this.state;
    if (value || value === 0) {
      if (!isNaN(value)) {
        const val = new BigNumber(value);
        if (math.gte(val, props.max)) {
          upDisabledClass = `${prefixCls}-handler-up-disabled`;
        }
        if (math.lte(val, props.min)) {
          downDisabledClass = `${prefixCls}-handler-down-disabled`;
        }
      } else {
        upDisabledClass = `${prefixCls}-handler-up-disabled`;
        downDisabledClass = `${prefixCls}-handler-down-disabled`;
      }
    }

    const editable = !props.readOnly && !props.disabled;

    let upEvents;
    let downEvents;
    if (useTouch) {
      upEvents = {
        onTouchStart: (editable && !upDisabledClass) ? this.up : noop,
        onTouchEnd: this.stop,
      };
      downEvents = {
        onTouchStart: (editable && !downDisabledClass) ? this.down : noop,
        onTouchEnd: this.stop,
      };
    } else {
      upEvents = {
        onMouseDown: (editable && !upDisabledClass) ? this.up : noop,
        onMouseUp: this.stop,
        onMouseLeave: this.stop,
      };
      downEvents = {
        onMouseDown: (editable && !downDisabledClass) ? this.down : noop,
        onMouseUp: this.stop,
        onMouseLeave: this.stop,
      };
    }
    const isUpDisabled = !!upDisabledClass || disabled || readOnly;
    const isDownDisabled = !!downDisabledClass || disabled || readOnly;
    return (
      <div className={`${prefixCls}-handler-wrap`}>
        <InputHandler
          ref={this.saveUp}
          disabled={isUpDisabled}
          prefixCls={prefixCls}
          unselectable="unselectable"
          {...upEvents}
          role="button"
          aria-label="Increase Value"
          aria-disabled={!!isUpDisabled}
          className={`${prefixCls}-handler ${prefixCls}-handler-up ${upDisabledClass}`}
        >
          {upHandler || <Icon
            unselectable="unselectable"
            type="baseline-arrow_drop_up"
            className={`${prefixCls}-handler-up-inner`}
            onClick={preventDefault}
          />}
        </InputHandler>
        <InputHandler
          ref={this.saveDown}
          disabled={isDownDisabled}
          prefixCls={prefixCls}
          unselectable="unselectable"
          {...downEvents}
          role="button"
          aria-label="Decrease Value"
          aria-disabled={!!isDownDisabled}
          className={`${prefixCls}-handler ${prefixCls}-handler-down ${downDisabledClass}`}
        >
          {downHandler || <Icon
            unselectable="unselectable"
            type="baseline-arrow_drop_down"
            className={`${prefixCls}-handler-down-inner`}
            onClick={preventDefault}
          />}
        </InputHandler>
      </div>
    );
  };

  render() {
    const props = { ...this.props };
    const { prefixCls, disabled, autoComplete = 'off', renderInput = (inputProps) => <input {...inputProps} />, renderHandler = noop } = props;
    const { value, inputValue, focused } = this.state;
    const classes = classNames({
      [prefixCls]: true,
      [props.className]: !!props.className,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-focused`]: focused,
    });
    const editable = !props.readOnly && !props.disabled;


    const dataOrAriaAttributeProps = {};
    for (const key in props) {
      if (
        props.hasOwnProperty(key) &&
        (
          key.substr(0, 5) === 'data-' ||
          key.substr(0, 5) === 'aria-' ||
          key === 'role'
        )
      ) {
        dataOrAriaAttributeProps[key] = props[key];
      }
    }
    // focus state, show input value
    // unfocus state, show valid value
    const inputDisplayValue = this.composing ? inputValue : this.getInputDisplayValue();
    const handler = this.renderSuffix();
    return (
      <div
        className={classes}
        style={props.style}
        title={props.title}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
        onCompositionStart={this.onComposition}
        onCompositionEnd={this.onComposition}
      >
        {renderHandler(handler)}
        <div
          className={`${prefixCls}-input-wrap`}
        >
          {
            renderInput({
              role: 'spinbutton',
              'aria-valuemin': props.min,
              'aria-valuemax': props.max,
              'aria-valuenow': value,
              required: props.required,
              type: props.type,
              placeholder: props.placeholder,
              onClick: props.onClick,
              onMouseUp: this.onMouseUp,
              className: `${prefixCls}-input`,
              tabIndex: props.tabIndex,
              autoComplete: autoComplete,
              onFocus: this.onFocus,
              onBlur: this.onBlur,
              onKeyDown: editable ? this.onKeyDown : noop,
              onKeyUp: editable ? this.onKeyUp : noop,
              autoFocus: props.autoFocus,
              maxLength: props.maxLength,
              readOnly: props.readOnly,
              disabled: props.disabled,
              max: props.max,
              min: props.min,
              step: props.step,
              name: props.name,
              title: props.title,
              id: props.id,
              onChange: this.onChange,
              ref: this.saveInput,
              value: inputDisplayValue,
              pattern: props.pattern,
              suffix: handler,
              label: props.label,
              inputMode: props.inputMode,
              ...dataOrAriaAttributeProps,
            })
          }
        </div>
      </div>
    );
  }
}
