import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'omit.js';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Icon from '../icon';

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
  style?: React.CSSProperties;
  label?: React.ReactNode;
  underline?: boolean;
  showLengthInfo?: boolean;
  showPasswordEye?: boolean;
}

export interface InputProps extends AbstractInputProps {
  placeholder?: string;
  copy?: boolean;
  type?: string;
  id?: number | string;
  name?: string;
  size?: 'large' | 'default' | 'small';
  maxLength?: number | string;
  disabled?: boolean;
  readOnly?: boolean;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  onPressEnter?: React.FormEventHandler<HTMLInputElement>;
  onKeyDown?: React.FormEventHandler<HTMLInputElement>;
  onKeyUp?: React.FormEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.FormEventHandler<HTMLInputElement>;
  onFocus?: React.FormEventHandler<HTMLInputElement>;
  onBlur?: React.FormEventHandler<HTMLInputElement>;
  onCopy?: (value: any) => void;
  autoComplete?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  spellCheck?: boolean;
  autoFocus?: boolean;
  focused?: boolean;
}

export interface InputState {
  inputLength?: number;
  focused?: boolean;
  renderedStyle?: {};
  showLengthInfo?: boolean;
  showPasswordEye?: boolean;
  type?: string;
  showPassword?: boolean;
}

export default class Input extends React.Component<InputProps, any> {
  static Group: typeof Group;
  static Search: typeof Search;
  static TextArea: typeof TextArea;

  static defaultProps = {
    prefixCls: 'ant-input',
    type: 'text',
    disabled: false,
    underline: true,
    readOnly: false,
    showLengthInfo: true,
    showPasswordEye: false,
  };

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    label: PropTypes.node,
    size: PropTypes.oneOf(['small', 'default', 'large']),
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
    underline: PropTypes.bool,
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
    showLengthInfo: true,
    showPassword: false,
    type: 'text',
  };

  input: HTMLInputElement;

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    const { focused, showLengthInfo } = this.props;
    const inputValueLength = this.input.value.length;
    if (inputValueLength !== inputLength) {
      this.setState({
        inputLength: inputValueLength,
        showLengthInfo,
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
    if ('showLengthInfo' in nextProps) {
      this.setState({
        showLengthInfo: nextProps.showLengthInfo,
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

  handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
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

  handleInput = () => {
    this.setState({
      inputLength: this.input.value.length,
    });
  };

  handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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

  handleShowPassword = () => {
    this.setState({
      type: 'text',
      showPassword: true,
    })
  };

  handleHidePassword = () => {
    this.setState({
      type: 'password',
      showPassword: false,
    })
  };

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  getInputClassName() {
    const { prefixCls, size, copy } = this.props;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-has-copy`]: copy,
    });
  }

  saveInput = (node: HTMLInputElement) => {
    this.input = node;
  };

  renderCopyIcon() {
    const { prefixCls, copy } = this.props;
    return copy ? (
      <span className={`${prefixCls}-icon`} onClick={this.handleCopy}>
        <Icon className={`${prefixCls}-icon-copy`} type="library_books" />
      </span>) : null;
  }

  renderShowPassword() {
    const { prefixCls, type } = this.props;
    const { showPassword } = this.state;
    return type === 'password' ? (
      <span
        className={`${prefixCls}-icon`}
        onMouseDown={this.handleShowPassword}
        onMouseLeave={this.handleHidePassword}
        onMouseUp={this.handleHidePassword}
      >
        <Icon className={`${prefixCls}-icon-copy`} type={showPassword ? 'visibility' : 'visibility_off'} />
      </span>) : null;
  }

  renderInput() {
    const { value, className, label } = this.props;
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit(this.props, [
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
      'underline',
      'focused',
      'showLengthInfo',
      'showPasswordEye',
    ]);

    if ('value' in this.props) {
      otherProps.value = fixControlledValue(value);
      // Input elements must be either controlled or uncontrolled,
      // specify either the value prop, or the defaultValue prop, but not both.
      delete otherProps.defaultValue;
    }
    otherProps.onInput = this.handleInput;

    if ('placeholder' in this.props && label) {
      delete otherProps.placeholder;
    }
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
    const { prefixCls, maxLength } = this.props;
    const { inputLength, showLengthInfo } = this.state;
    return maxLength && showLengthInfo ? (
      <span className={`${prefixCls}-icon`}>
        <span className={`${prefixCls}-icon-copy ${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</span>
      </span>
    ) : null;
  }

  getUnderLine() {
    const { prefixCls, underline } = this.props;
    return underline ? (
      <div className={`${prefixCls}-underline`}>
        <span className={`${prefixCls}-ripple`} />
      </div>
    ) : null;
  }

  getSizeClassName(name: string) {
    const { prefixCls, size } = this.props;
    return classNames(`${prefixCls}-${name}`, {
      [`${prefixCls}-${name}-sm`]: size === 'small',
      [`${prefixCls}-${name}-lg`]: size === 'large',
    });
  }

  render() {
    const props = this.props;
    const { prefixCls, disabled, label, style, placeholder, showPasswordEye } = this.props;
    const { inputLength, focused } = this.state;
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
      [`${prefixCls}-has-value`]: inputLength !== 0,
      [`${prefixCls}-focus`]: focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
      [`${prefixCls}-has-prefix`]: !!prefix,
      [`${prefixCls}-has-suffix`]: !!suffix,
    });

    return (
      <span className={className} style={style}>
        <div className={`${prefixCls}-content`}>
          {label ? <div className={`${prefixCls}-label`}>{label}</div> : null}
          <div className={`${prefixCls}-rendered-wrapper`}>
            {prefix}
            <div className={this.getSizeClassName('rendered')} ref="rendered">
              <div className={`${prefixCls}-placeholder`}>{placeholder}</div>
              {this.renderInput()}
              {this.renderCopyIcon()}
              {showPasswordEye ? this.renderShowPassword() : null}
            </div>
            {suffix}
          </div>
          {this.getLengthInfo()}
        </div>
        {this.getUnderLine()}
      </span>
    );
  }
}
