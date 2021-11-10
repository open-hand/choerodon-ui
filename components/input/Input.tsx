import React, { ChangeEventHandler, Component, CSSProperties, FocusEvent, FormEventHandler, KeyboardEvent, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Icon from '../icon';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  onInput?: FormEventHandler<HTMLInputElement>;
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
  value?: any;
  focused?: boolean;
  showPasswordEye?: boolean;
  showPassword?: boolean;
}

export default class Input extends Component<InputProps, any> {
  static displayName = 'Input';

  static get contextType() {
    return ConfigContext;
  }

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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.node,
    size: PropTypes.oneOf([Size.small, Size.default, Size.large]),
    maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    border: PropTypes.bool,
    showLengthInfo: PropTypes.bool,
    showPasswordEye: PropTypes.bool,
  };

  context: ConfigContextValue;

  state: InputState;

  input: HTMLInputElement;

  rendered: HTMLDivElement;

  prefix: HTMLSpanElement;

  suffix: HTMLSpanElement;

  constructor(props, context: ConfigContextValue) {
    super(props, context);
    this.state = {
      value: typeof props.value === 'undefined' ? props.defaultValue : props.value,
      focused: false,
      showPassword: false,
    };
  }

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
    const { focused, autoFocus } = this.props;
    if (autoFocus) {
      this.setState({
        focused: true,
      });
    }
    if (typeof focused === 'boolean') {
      this.setState({
        focused,
      });
    }
    this.setRenderedStyle();
  }

  componentWillReceiveProps(nextProps: InputProps) {
    const { value } = this.state;
    if ('value' in nextProps && value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
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
    if (nextProps.type !== 'password') {
      this.setState({
        showPassword: false,
      });
    }
  }

  componentDidUpdate() {
    this.setRenderedStyle();
  }

  setRenderedStyle() {
    const { rendered, suffix, prefix } = this;
    let suffixWidth: string;
    let prefixWidth: string;
    let margin = '0';
    let width = '100%';
    if (suffix && prefix) {
      suffixWidth = `${(suffix.clientWidth || -2) + 2}px`;
      prefixWidth = `${(prefix.clientWidth || -2) + 2}px`;
      margin = `0 ${suffixWidth} 0 ${prefixWidth}`;
      width = `calc(100% - ${suffixWidth} - ${prefixWidth})`;
    } else if (suffix) {
      suffixWidth = `${(suffix.clientWidth || -2) + 2}px`;
      margin = `0 ${suffixWidth} 0 0`;
      width = `calc(100% - ${suffixWidth})`;
    } else if (prefix) {
      prefixWidth = `${(prefix.clientWidth || -2) + 2}px`;
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

  handleChange = e => {
    const { onChange } = this.props;
    if (!('value' in this.props)) {
      this.setState({ value: e.target.value });
    }
    if (onChange) {
      onChange(e);
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
    const { showPassword } = this.state;
    this.setState({
      showPassword: !showPassword,
    });
  };

  saveInput = (node: HTMLInputElement) => {
    this.input = node;
  };

  saveRenderedRef = (node: HTMLDivElement) => {
    this.rendered = node;
  };

  savePrefix = (node: HTMLSpanElement) => {
    this.prefix = node;
  };

  saveSuffix = (node: HTMLSpanElement) => {
    this.suffix = node;
  };

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('input', prefixCls);
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

  renderCopyIcon() {
    const { copy } = this.props;
    const prefixCls = this.getPrefixCls();
    return copy ? (
      <span className={`${prefixCls}-icon`} onClick={this.handleCopy}>
        <Icon className={`${prefixCls}-icon-copy`} type="library_books" />
      </span>
    ) : null;
  }

  renderShowPassword() {
    const { type } = this.props;
    const prefixCls = this.getPrefixCls();
    const { showPassword } = this.state;
    return type === 'password' ? (
      <span className={`${prefixCls}-icon`} onClick={this.handleTogglePassword}>
        <Icon
          className={`${prefixCls}-icon-copy`}
          type={showPassword ? 'visibility' : 'visibility_off'}
        />
      </span>
    ) : null;
  }

  renderInput() {
    const { className, type } = this.props;
    const { showPassword, value } = this.state;
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit<InputProps,
      | 'placeholder'
      | 'prefixCls'
      | 'onPressEnter'
      | 'addonBefore'
      | 'addonAfter'
      | 'prefix'
      | 'suffix'
      | 'label'
      | 'copy'
      | 'style'
      | 'focused'
      | 'showLengthInfo'
      | 'showPasswordEye'
      | 'size'
      | 'border'>(this.props, [
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
        'border',
      ]);

    return (
      <input
        {...otherProps}
        value={fixControlledValue(value)}
        className={classNames(this.getInputClassName(), className)}
        onKeyDown={this.handleKeyDown}
        ref={this.saveInput}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        type={showPassword ? 'text' : type}
      />
    );
  }

  getLengthInfo() {
    const { maxLength, showLengthInfo } = this.props;
    const prefixCls = this.getPrefixCls();
    const { value } = this.state;
    const inputLength = value ? value.length : 0;
    return (maxLength && showLengthInfo) ||
    (maxLength && maxLength > 0 && inputLength === maxLength) ? (
        <div className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
      ) : null;
  }

  getLabel() {
    const { focused } = this.state;
    const { placeholder, label } = this.props;
    if (!this.hasValue() && !focused && placeholder) {
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
    const { value } = this.state;
    return value && value.length !== 0;
  }

  renderPlaceholder() {
    const { placeholder, border } = this.props;
    if (!border && placeholder) {
      const prefixCls = this.getPrefixCls();
      return <div className={`${prefixCls}-placeholder`}>{placeholder}</div>;
    }
  }

  render() {
    const props = this.props;
    const { disabled, label, style, showPasswordEye, border } = this.props;
    const prefixCls = this.getPrefixCls();
    const { focused } = this.state;
    const prefix = props.prefix ? (
      <span ref={this.savePrefix} className={this.getSizeClassName('prefix')}>
        {props.prefix}
      </span>
    ) : null;
    const suffix = props.suffix ? (
      <span ref={this.saveSuffix} className={this.getSizeClassName('suffix')}>
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
            <div className={this.getSizeClassName('rendered')} ref={this.saveRenderedRef}>
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
