import * as React from 'react';
import omit from 'omit.js';
import classNames from 'classnames';
import { AbstractInputProps } from './Input';
import calculateNodeHeight from './calculateNodeHeight';

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
  onPressEnter?: React.FormEventHandler<any>;
  autoFocus?: boolean;
}

export interface TextAreaState {
  textareaStyles?: React.CSSProperties;
  inputLength?: number;
  focused?: boolean;
}

export type HTMLTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default class TextArea extends React.Component<TextAreaProps & HTMLTextareaProps, TextAreaState> {
  static defaultProps = {
    prefixCls: 'ant-input',
    underline: true,
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
      })
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
  }

  getTextAreaClassName() {
    const { prefixCls, className } = this.props;
    return classNames(prefixCls, className);
  }

  handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!('value' in this.props)) {
      this.resizeTextarea();
    }
    const { onChange } = this.props;
    if (onChange) {
      onChange(e);
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  }

  handleInput = () => {
    this.setState({
      inputLength: this.textAreaRef.value.length,
    })
  }

  saveTextAreaRef = (textArea: HTMLTextAreaElement) => {
    this.textAreaRef = textArea;
  }

  getWapperClassName() {
    const { prefixCls, disabled, label } = this.props;
    return classNames(`${prefixCls}-wrapper`, `${prefixCls}-textarea`, {
      [`${prefixCls}-has-value`]: this.state.inputLength !== 0,
      [`${prefixCls}-focus`]: this.state.focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
    });
  }

  handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const { onFocus } = this.props;
    this.setState({
      focused: true,
    });
    if (onFocus) {
      onFocus(e)
    }
  }

  handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const { onBlur } = this.props;
    this.setState({
      focused: false,
    });
    if (onBlur) {
      onBlur(e)
    }
  }

  render() {
    const props = this.props;
    const otherProps = omit(props, [
      'prefixCls',
      'onPressEnter',
      'autosize',
      'placeholder',
      'underline',
    ]);
    const style = {
      ...props.style,
      ...this.state.textareaStyles,
    };
    // Fix https://github.com/ant-design/ant-design/issues/6776
    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    otherProps.onInput = this.handleInput;

    const lengthInfo = props.maxLength ? (
      <div className={`${props.prefixCls}-length-info`}>{`${this.state.inputLength}/${props.maxLength}`}</div>
    ) : null;

    const border = props.underline ? (
      <div>
        <hr className={`${props.prefixCls}-border`} />
        <hr className={`${props.prefixCls}-border-active`}/>
      </div>
    ) : null;
    const label = props.label ? (
        <div className={`${this.props.prefixCls}-rendered`}>
          <div className={`${this.props.prefixCls}-label`}>{props.label}</div>
        </div>
      ) : null;
    const placeholder = !label || this.state.focused ? props.placeholder : '';
    return (
      <span className={this.getWapperClassName()}>
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
