import React, { ChangeEventHandler, Component, CSSProperties, FocusEvent, FormEventHandler, KeyboardEvent, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Icon from '../icon';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

function fixControlledValue(value: undefined | null | string) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

export interface AbstractInputProps {
  prefixCls?: string;
  className?: string;
  defaultValue?: any;
  value?: any;
  tabIndex?: number;
  style?: CSSProperties;
  label?: ReactNode;
  showLengthInfo?: boolean;
  showPasswordEye?: boolean;
}

export interface InputProps extends AbstractInputProps {
  placeholder?: string;
  copy?: boolean;
  type?: string;
  id?: string;
  name?: string;
  size?: Size;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  onPressEnter?: FormEventHandler<HTMLInputElement>;
  onKeyDown?: FormEventHandler<HTMLInputElement>;
  onKeyUp?: FormEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: FormEventHandler<HTMLInputElement>;
  onFocus?: FormEventHandler<HTMLInputElement>;
  onBlur?: FormEventHandler<HTMLInputElement>;
  onInput?: FormEventHandler<HTMLInputElement>
  onCopy?: (value: any) => void;
  autoComplete?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  spellCheck?: boolean;
  autoFocus?: boolean;
  focused?: boolean;
  border?: boolean;
}

export interface InputState {
  inputLength?: number;
  focused?: boolean;
  renderedStyle?: {};
  showPasswordEye?: boolean;
  type?: string;
  showPassword?: boolean;
}

export default class Input extends Component<InputProps, any> {
  static displayName = 'Input';
  static Group: typeof Group;
  static Search: typeof Search;
  static TextArea: typeof TextArea;

  static defaultProps = {
    type: 'text',
    disabled: false,
    readOnly: false,
    showLengthInfo: true,
    showPasswordEye: false,
    border: true,
  };

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    label: PropTypes.node,
    size: PropTypes.oneOf([Size.small, Size.default, Size.large]),
    maxLength: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    disabled: PropTypes.bool,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    className: PropTypes.string,
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    prefixCls: PropTypes.string,
    autosize: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onPressEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    copy: PropTypes.bool,
    onCopy: PropTypes.func,
    readOnly: PropTypes.bool,
    focused: PropTypes.bool,
    showLengthInfo: PropTypes.bool,
    showPasswordEye: PropTypes.bool,
  };

  state: InputState = {
    inputLength: 0,
    focused: false,
    renderedStyle: {
      width: '100%',
      margin: 0,
    },
    showPassword: false,
    type: 'text',
  };

  input: HTMLInputElement;

  handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  componentDidMount() {
    const { inputLength } = this.state;
    const { focused } = this.props;
    const inputValueLength = this.input.value.length;
    if (inputValueLength !== inputLength) {
      this.setState({
        inputLength: inputValueLength,
      });
    }
    if (this.props.autoFocus) {
      this.setState({
        focused: true,
      });
    }
    if (typeof focused === 'boolean') {
      this.setState({
        focused: focused,
      });
    }
    this.setState({
      type: this.props.type,
    });
    this.setRenderedStyle();
  }

  componentWillReceiveProps(nextProps: InputProps) {
    if (this.input.value !== nextProps.value) {
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
    if (typeof nextProps.focused === 'boolean') {
      this.setState({
        focused: nextProps.focused,
      });
    }
    this.setState({
      type: nextProps.type,
    });
  }

  componentDidUpdate() {
    const { inputLength } = this.state;
    const inputValueLength = this.input.value.length;
    if (inputValueLength !== inputLength) {
      this.setState({
        inputLength: inputValueLength,
      });
    }
    this.setRenderedStyle();
  }

  setRenderedStyle() {
    const suffix: any = this.refs.suffix;
    const prefix: any = this.refs.prefix;
    const rendered: any = this.refs.rendered;
    let suffixWidth: string;
    let prefixWidth: string;
    let margin: string = '0';
    let width: string = '100%';
    if (suffix && prefix) {
      suffixWidth = (suffix.clientWidth || -2) + 2 + 'px';
      prefixWidth = (prefix.clientWidth || -2) + 2 + 'px';
      margin = `0 ${suffixWidth} 0 ${prefixWidth}`;
      width = `calc(100% - ${suffixWidth} - ${prefixWidth})`;
    } else if (suffix) {
      suffixWidth = (suffix.clientWidth || -2) + 2 + 'px';
      margin = `0 ${suffixWidth} 0 0`;
      width = `calc(100% - ${suffixWidth})`;
    } else if (prefix) {
      prefixWidth = (prefix.clientWidth || -2) + 2 + 'px';
      margin = `0 0 0 ${prefixWidth}`;
      width = `calc(100% - ${prefixWidth})`;
    }
    rendered.style.margin = margin;
    rendered.style.width = width;
  }

  handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    const { onFocus, readOnly } = this.props;
    if (!readOnly) {
      this.setState({
        focused: true,
      });
    }
    if (onFocus) {
      onFocus(e);
    }
  };

  handleInput = (e) => {
    const { onInput } = this.props;
    this.setState({
      inputLength: this.input.value.length,
    });
    if (onInput) {
      onInput(e);
    }
  };

  handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { onBlur, readOnly } = this.props;
    if (!readOnly) {
      this.setState({
        focused: false,
      });
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  handleCopy = () => {
    const { onCopy } = this.props;
    this.input.select();
    document.execCommand('Copy');
    if (onCopy) {
      onCopy(this.input.value);
    }
  };

  handleTogglePassword = () => {
    if (this.state.type === 'password') {
      this.handleShowPassword();
    } else {
      this.handleHidePassword();
    }
  };

  handleShowPassword = () => {
    this.setState({
      type: 'text',
      showPassword: true,
    });
  };

  handleHidePassword = () => {
    this.setState({
      type: 'password',
      showPassword: false,
    });
  };

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  getPrefixCls() {
    return getPrefixCls('input', this.props.prefixCls);
  }

  getInputClassName() {
    const { size, copy } = this.props;
    const prefixCls = this.getPrefixCls();
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === Size.small,
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-has-copy`]: copy,
    });
  }

  saveInput = (node: HTMLInputElement) => {
    this.input = node;
  };

  renderCopyIcon() {
    const { copy } = this.props;
    const prefixCls = this.getPrefixCls();
    return copy ? (
      <span className={`${prefixCls}-icon`} onClick={this.handleCopy}>
        <Icon className={`${prefixCls}-icon-copy`} type="library_books" />
      </span>) : null;
  }

  renderShowPassword() {
    const { type } = this.props;
    const prefixCls = this.getPrefixCls();
    const { showPassword } = this.state;
    return type === 'password' ? (
      <span
        className={`${prefixCls}-icon`}
        onClick={this.handleTogglePassword}
      >
        <Icon className={`${prefixCls}-icon-copy`} type={showPassword ? 'visibility' : 'visibility_off'} />
      </span>) : null;
  }

  renderInput() {
    const { value, className } = this.props;
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit<InputProps, 'placeholder' | 'prefixCls' | 'onPressEnter' | 'addonBefore' | 'addonAfter' | 'prefix' |
      'suffix' | 'label' | 'copy' | 'style' | 'focused' | 'showLengthInfo' | 'showPasswordEye' | 'size'>(
      this.props, [
        'placeholder',
        'prefixCls',
        'onPressEnter',
        'addonBefore',
        'addonAfter',
        'prefix',
        'suffix',
        'label',
        'copy',
        'style',
        'focused',
        'showLengthInfo',
        'showPasswordEye',
        'size',
      ]);

    if ('value' in this.props) {
      otherProps.value = fixControlledValue(value);
      // Input elements must be either controlled or uncontrolled,
      // specify either the value prop, or the defaultValue prop, but not both.
      delete otherProps.defaultValue;
    }
    otherProps.onInput = this.handleInput;

    return (
      <input
        {...otherProps}
        className={classNames(this.getInputClassName(), className)}
        onKeyDown={this.handleKeyDown}
        ref={this.saveInput}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        type={this.state.type}
      />
    );
  }

  getLengthInfo() {
    const { maxLength, showLengthInfo } = this.props;
    const prefixCls = this.getPrefixCls();
    const { inputLength } = this.state;
    return (maxLength && showLengthInfo) || (maxLength && maxLength > 0 && inputLength === maxLength ) ? (
      <div className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
    ) : null;
  }

  getLabel() {
    const { placeholder, label } = this.props;
    if (!this.hasValue() && placeholder) {
      return placeholder;
    }
    return label;
  }

  renderFloatLabel(): ReactNode {
    const label = this.getLabel();
    const { border } = this.props;
    if (label && border) {
      const prefixCls = this.getPrefixCls();
      return (
        <div className={`${prefixCls}-label-wrapper`}>
          <div className={`${prefixCls}-label`}>{label}</div>
        </div>
      );
    }
  }

  getSizeClassName(name: string) {
    const { size } = this.props;
    const prefixCls = this.getPrefixCls();
    return classNames(`${prefixCls}-${name}`, {
      [`${prefixCls}-${name}-sm`]: size === Size.small,
      [`${prefixCls}-${name}-lg`]: size === Size.large,
    });
  }

  hasValue() {
    return this.state.inputLength !== 0;
  }

  renderPlaceholder() {
    const { placeholder, border } = this.props;
    if (!border && placeholder) {
      const prefixCls = this.getPrefixCls();
      return (
        <div className={`${prefixCls}-placeholder`}>{placeholder}</div>
      );
    }
  }

  render() {
    const props = this.props;
    const { disabled, label, style, showPasswordEye, border } = this.props;
    const prefixCls = this.getPrefixCls();
    const { focused } = this.state;
    const prefix = props.prefix ? (
      <span ref="prefix" className={this.getSizeClassName('prefix')}>
        {props.prefix}
      </span>
    ) : null;
    const suffix = props.suffix ? (
      <span ref="suffix" className={this.getSizeClassName('suffix')}>
         {props.suffix}
      </span>
    ) : null;

    const className = classNames(`${prefixCls}-wrapper`, {
      [`${prefixCls}-has-value`]: this.hasValue(),
      [`${prefixCls}-focused`]: focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
      [`${prefixCls}-has-prefix`]: !!prefix,
      [`${prefixCls}-has-suffix`]: !!suffix,
      [`${prefixCls}-has-border`]: border,
    });

    return (
      <span className={className} style={style}>
        <div className={`${prefixCls}-content`}>
          <div className={`${prefixCls}-rendered-wrapper`}>
            {prefix}
            <div className={this.getSizeClassName('rendered')} ref="rendered">
              {this.renderPlaceholder()}
              {this.renderInput()}
              {this.renderFloatLabel()}
              {this.renderCopyIcon()}
              {showPasswordEye ? this.renderShowPassword() : null}
            </div>
            {suffix}
          </div>
          {this.getLengthInfo()}
        </div>
      </span>
    );
  }
}
