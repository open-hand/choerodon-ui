import React, { ChangeEvent, Component, CSSProperties, FocusEvent, FormEventHandler, KeyboardEvent, TextareaHTMLAttributes } from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { AbstractInputProps } from './Input';
import calculateNodeHeight from './calculateNodeHeight';
import { getPrefixCls } from '../configure';

function onNextFrame(cb: () => void) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(cb);
  }
  return window.setTimeout(cb, 1);
}

function clearNextFrameAction(nextFrameId: number) {
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(nextFrameId);
  } else {
    window.clearTimeout(nextFrameId);
  }
}

export interface AutoSizeType {
  minRows?: number;
  maxRows?: number;
}

export interface TextAreaProps extends AbstractInputProps {
  autosize?: boolean | AutoSizeType;
  onPressEnter?: FormEventHandler<any>;
  autoFocus?: boolean;
}

export interface TextAreaState {
  textareaStyles?: CSSProperties;
  inputLength?: number;
  focused?: boolean;
}

export type HTMLTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default class TextArea extends Component<TextAreaProps & HTMLTextareaProps, TextAreaState> {
  static displayName = 'TextArea';
  static defaultProps = {
    underline: true,
    showLengthInfo: true,
  };

  nextFrameActionId: number;

  state = {
    textareaStyles: {},
    inputLength: 0,
    focused: false,
  };

  private textAreaRef: HTMLTextAreaElement;

  componentDidMount() {
    this.resizeTextarea();
    if (this.textAreaRef.value) {
      this.setState({
        inputLength: this.textAreaRef.value.length,
      });
    }
    if (this.props.autoFocus) {
      this.setState({
        focused: true,
      });
    }
  }

  componentWillReceiveProps(nextProps: TextAreaProps) {
    // Re-render with the new content then recalculate the height as required.

    if (this.textAreaRef.value !== nextProps.value) {
      const inputLength = nextProps.value && nextProps.value.length;
      this.setState({
        inputLength: inputLength || 0,
      });
    }

    if (nextProps.autoFocus) {
      this.setState({
        focused: true,
      });
    }

    if (this.props.value !== nextProps.value) {
      if (this.nextFrameActionId) {
        clearNextFrameAction(this.nextFrameActionId);
      }
      this.nextFrameActionId = onNextFrame(this.resizeTextarea);
    }
  }

  focus() {
    this.textAreaRef.focus();
  }

  blur() {
    this.textAreaRef.blur();
  }

  resizeTextarea = () => {
    const { autosize } = this.props;
    if (!autosize || !this.textAreaRef) {
      return;
    }
    const minRows = autosize ? (autosize as AutoSizeType).minRows : null;
    const maxRows = autosize ? (autosize as AutoSizeType).maxRows : null;
    const textareaStyles = calculateNodeHeight(this.textAreaRef, false, minRows, maxRows);
    this.setState({ textareaStyles });
  };

  getPrefixCls() {
    return getPrefixCls('input', this.props.prefixCls);
  }

  getTextAreaClassName() {
    const { className } = this.props;
    return classNames(this.getPrefixCls(), className);
  }

  handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!('value' in this.props)) {
      this.resizeTextarea();
    }
    const { onChange } = this.props;
    if (onChange) {
      onChange(e);
    }
  };

  handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  handleInput = () => {
    this.setState({
      inputLength: this.textAreaRef.value.length,
    });
  };

  saveTextAreaRef = (textArea: HTMLTextAreaElement) => {
    this.textAreaRef = textArea;
  };

  getWrapperClassName() {
    const { disabled, label } = this.props;
    const prefixCls = this.getPrefixCls();
    return classNames(`${prefixCls}-wrapper`, `${prefixCls}-textarea`, {
      [`${prefixCls}-has-value`]: this.state.inputLength !== 0,
      [`${prefixCls}-focused`]: this.state.focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
    });
  }

  handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    const { onFocus } = this.props;
    this.setState({
      focused: true,
    });
    if (onFocus) {
      onFocus(e);
    }
  };

  handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    const { onBlur } = this.props;
    this.setState({
      focused: false,
    });
    if (onBlur) {
      onBlur(e);
    }
  };

  render() {
    const props = this.props;
    const prefixCls = this.getPrefixCls();
    const otherProps: TextAreaProps & HTMLTextareaProps = omit(
      props,
      [
        'prefixCls',
        'onPressEnter',
        'autosize',
        'placeholder',
        'underline',
        'focused',
        'showLengthInfo',
      ],
    );
    const style = {
      ...props.style,
      ...this.state.textareaStyles,
    };

    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    otherProps.onInput = this.handleInput;

    const lengthInfo = props.maxLength && props.showLengthInfo ? (
      <div className={`${prefixCls}-length-info`}>{`${this.state.inputLength}/${props.maxLength}`}</div>
    ) : null;

    const border = props.underline ? (
      <div>
        <hr className={`${prefixCls}-border`} />
        <hr className={`${prefixCls}-border-active`} />
      </div>
    ) : null;
    const label = props.label ? (
      <div className={`${prefixCls}-rendered`}>
        <div className={`${prefixCls}-label`}>{props.label}</div>
      </div>
    ) : null;
    const placeholder = !label || this.state.focused ? props.placeholder : '';
    return (
      <span className={this.getWrapperClassName()}>
        {label}
        <textarea
          {...otherProps}
          placeholder={placeholder}
          className={this.getTextAreaClassName()}
          style={style}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleTextareaChange}
          ref={this.saveTextAreaRef}
          onInput={this.handleInput}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
        />
        {border}
        {lengthInfo}
      </span>
    );
  }
}
