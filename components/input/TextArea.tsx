import React, {
  ChangeEvent,
  Component,
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { findDOMNode } from 'react-dom';
import omit from 'lodash/omit';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import { AbstractInputProps } from './Input';
import calculateNodeHeight from './calculateNodeHeight';
import { InnerRowCtx } from '../rc-components/table/TableRowContext';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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

export interface TextAreaProps extends AbstractInputProps<HTMLTextAreaElement> {
  autosize?: boolean | AutoSizeType;
  autoFocus?: boolean;
  border?: boolean;
}

export interface TextAreaState {
  textareaStyles?: CSSProperties;
  inputLength?: number;
  focused?: boolean;
}

export type HTMLTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'prefix'>;

export default class TextArea extends Component<TextAreaProps & HTMLTextareaProps, TextAreaState> {
  static displayName = 'TextArea';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    showLengthInfo: true,
    border: true,
    labelLayout: 'float',
  };

  context: ConfigContextValue;

  nextFrameActionId: number;

  state = {
    textareaStyles: {},
    inputLength: 0,
    focused: false,
  };

  private textAreaRef: HTMLTextAreaElement;

  private resizeObserver?: ResizeObserver;

  componentDidMount() {
    this.resizeTextarea();
    if (this.textAreaRef.value) {
      this.setState({
        inputLength: this.textAreaRef.value.length,
      });
    }
    const { autoFocus } = this.props;
    if (autoFocus) {
      this.setState({
        focused: true,
      });
    }
  }

  componentWillReceiveProps(nextProps: TextAreaProps) {
    // Re-render with the new content then recalculate the height as required.

    if (this.textAreaRef.value !== nextProps.value) {
      const inputLength = nextProps.value && String(nextProps.value).length;
      this.setState({
        inputLength: inputLength || 0,
      });
    }

    if (nextProps.autoFocus) {
      this.setState({
        focused: true,
      });
    }
    const { value } = this.props;
    if (value !== nextProps.value) {
      if (this.nextFrameActionId) {
        clearNextFrameAction(this.nextFrameActionId);
      }
      this.nextFrameActionId = onNextFrame(this.resizeTextarea);
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      delete this.resizeObserver;
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
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('input', prefixCls);
  }

  getTextAreaClassName() {
    const { className, disabled } = this.props;
    const prefixCls = this.getPrefixCls();
    return classNames(prefixCls, className, `${prefixCls}-textarea-element`, {
      [`${prefixCls}-disabled`]: disabled,
    });
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
    if (e.keyCode === 13 && typeof onPressEnter === 'function') {
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
    const { disabled, label, border, labelLayout } = this.props;
    const { inputLength, focused } = this.state;
    const prefixCls = this.getPrefixCls();
    return classNames(`${prefixCls}-wrapper`, `${prefixCls}-textarea`, {
      [`${prefixCls}-has-value`]: inputLength !== 0,
      [`${prefixCls}-focused`]: focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
      [`${prefixCls}-has-border`]: border && labelLayout === 'float',
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

  getLengthInfo(prefixCls) {
    const { maxLength, showLengthInfo } = this.props;
    const { inputLength } = this.state;
    return showLengthInfo !== 'never' && ((maxLength && showLengthInfo) || (maxLength && maxLength > 0 && inputLength === maxLength)) ? (
      <div className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
    ) : null;
  }

  renderFloatLabel(): ReactNode {
    const { label } = this.props;
    if (label) {
      const prefixCls = this.getPrefixCls();
      return (
        <div className={`${prefixCls}-label-wrapper`}>
          <div className={`${prefixCls}-label`}>{label}</div>
        </div>
      );
    }
  }

  render() {
    const props = this.props;
    const state = this.state;
    const prefixCls = this.getPrefixCls();
    const omits = [
      'prefixCls',
      'onPressEnter',
      'autosize',
      'focused',
      'showLengthInfo',
      'labelLayout',
    ];
    const hasBorder = props.border && props.labelLayout === 'float';
    const floatLabel = hasBorder && this.renderFloatLabel();
    if (floatLabel && !state.focused) {
      omits.push('placeholder');
    }
    const otherProps: TextAreaProps & HTMLTextareaProps = omit(props, omits);
    const style = {
      ...props.style,
      ...state.textareaStyles,
    };

    // Make sure it could be reset when using form.getFieldDecorator
    if ('value' in otherProps) {
      otherProps.value = otherProps.value || '';
    }
    otherProps.onInput = this.handleInput;
    return (
      <InnerRowCtx.Consumer>
        {(options) => {
          if (options && !this.resizeObserver && this.textAreaRef) {
            this.resizeObserver = new ResizeObserver(options.syncRowHeight);
            const dom = findDOMNode(this.textAreaRef);
            // eslint-disable-next-line no-unused-expressions
            dom && this.resizeObserver.observe(dom as Element);
          }

          const textarea = (
            <textarea
              {...otherProps}
              className={this.getTextAreaClassName()}
              style={style}
              onKeyDown={this.handleKeyDown}
              onChange={this.handleTextareaChange}
              ref={this.saveTextAreaRef}
              onInput={this.handleInput}
              onBlur={this.handleBlur}
              onFocus={this.handleFocus}
            />
          );

          const labeledTextArea = hasBorder ? (
            <div className={`${prefixCls}-rendered-wrapper`}>
              {textarea}
              {floatLabel}
            </div>
          ) : textarea;

          const lengthInfo = this.getLengthInfo(prefixCls);

          return lengthInfo || hasBorder ? (
            <span className={this.getWrapperClassName()}>
              {labeledTextArea}
              {lengthInfo}
            </span>
          ) : labeledTextArea;
        }}
      </InnerRowCtx.Consumer>
    );
  }
}
