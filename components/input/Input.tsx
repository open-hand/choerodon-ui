import React, {
  ChangeEventHandler,
  cloneElement,
  Component,
  CompositionEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Icon from '../icon';
import { Size } from '../_util/enum';
import { getIeVersion, isChrome } from '../_util/browser';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

function fixControlledValue(value: undefined | null | string) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

function isNeedTriggerAfterComposition(): boolean {
  return isChrome() || getIeVersion() === 11;
}

function upperCaseString(value: any) {
  if (isString(value)) {
    return value.toUpperCase();
  }
  return undefined;
}

function lowerCaseString(value: any) {
  if (isString(value)) {
    return value.toLowerCase();
  }
  return undefined;
}

/**
 * 判断是否全角
 */
function isDbc(s: string) {
  let dbc = false;
  if (isString(s)) {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if ((c > 65248) || (c === 12288)) {
        dbc = true;
        break;
      }
    }
  }
  return dbc;
}

/**
 * 全角转半角
 */
function dbcToSbc(str: string) {
  const result: string[] = [];
  if (isString(str)) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i); // 获取当前字符的unicode编码
      if (code >= 65281 && code <= 65373) { // 在这个unicode编码范围中的是所有的英文字母已及各种字符
        result.push(String.fromCharCode(code - 65248)); // 把全角字符的unicode编码转换为对应半角字符的unicode码
      } else if (code === 12288) { // 空格
        result.push(' ');
      } else {
        result.push(str.charAt(i));
      }
    }
  }
  return result.join('');
}

export type InputSelection = {
  start: number | null,
  end: number | null,
} | null;

export interface AbstractInputProps<T> extends Omit<InputHTMLAttributes<T>, 'onChange' | 'onCopy' | 'size' | 'prefix'> {
  prefixCls?: string;
  label?: ReactNode;
  showLengthInfo?: boolean | 'never';
  showPasswordEye?: boolean | 'hold' | 'nohold';
  labelLayout?: 'float' | 'none';
  onChange?: ChangeEventHandler<T>;
  onPressEnter?: KeyboardEventHandler<T>;
}

export interface InputProps extends AbstractInputProps<HTMLInputElement> {
  copy?: boolean;
  size?: Size;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  onCopy?: (value: any) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  focused?: boolean;
  border?: boolean;
  typeCase?: 'upper' | 'lower';
  dbc2sbc?: boolean;
  trimAll?: boolean;
  trim?: boolean;
  inputChinese?: boolean;
}

export interface InputState {
  value?: any;
  focused?: boolean;
  showPassword?: boolean;
}

export default class Input extends Component<InputProps, any> {
  static displayName = 'Input';

  static get contextType(): typeof ConfigContext {
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
    dbc2sbc: false,
    trim: false,
    trimAll: false,
    inputChinese: true,
    labelLayout: 'float',
  };

  context: ConfigContextValue;

  state: InputState;

  input: HTMLInputElement;

  rendered?: HTMLDivElement;

  prefix?: HTMLSpanElement;

  suffix?: HTMLSpanElement;

  isOnComposition = false;

  inputSelection: InputSelection;

  constructor(props, context: ConfigContextValue) {
    super(props, context);
    this.state = {
      value: typeof props.value === 'undefined' ? props.defaultValue : props.value,
      focused: false,
      showPassword: false,
    };
  }

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

  componentDidUpdate(prevProps: InputProps) {
    const { inputSelection } = this;
    const { value } = prevProps;
    if (inputSelection && value && !this.isOnComposition) {
      // 在 didUpdate 时根据情况恢复光标的位置
      // 如果光标的位置小于值的长度，那么可以判定属于中间编辑的情况
      // 此时恢复光标的位置
      // 当如果不是 onComposiotionend 触发的事件时不用修改位置
      if (inputSelection.start &&
        this.transformValue(value).length &&
        inputSelection.start < this.transformValue(value).length) {
        const input = this.input;
        input.selectionStart = inputSelection.start;
        input.selectionEnd = inputSelection.end;
        this.inputSelection = null;
      }
    }
    this.setRenderedStyle();
  }

  setRenderedStyle() {
    const { rendered, input, suffix, prefix } = this;
    if (rendered || input) {
      let suffixWidth: string;
      let prefixWidth: string;
      let marginRight = '';
      let marginLeft = '';
      let width = '100%';
      if (suffix && prefix) {
        suffixWidth = `${(suffix.clientWidth || -2) + 2}px`;
        prefixWidth = `${(prefix.clientWidth || -2) + 2}px`;
        marginRight = suffixWidth;
        marginLeft = prefixWidth;
        width = `calc(100% - ${suffixWidth} - ${prefixWidth})`;
      } else if (suffix) {
        suffixWidth = `${(suffix.clientWidth || -2) + 2}px`;
        marginRight = suffixWidth;
        width = `calc(100% - ${suffixWidth})`;
      } else if (prefix) {
        prefixWidth = `${(prefix.clientWidth || -2) + 2}px`;
        marginLeft = prefixWidth;
        width = `calc(100% - ${prefixWidth})`;
      }
      if (rendered) {
        rendered.style.marginRight = marginRight;
        rendered.style.marginLeft = marginLeft;
        rendered.style.width = width;
      } else if (input) {
        input.style.paddingRight = marginRight;
        input.style.paddingLeft = marginLeft;
      }
    }
  }

  handleComposition = (e: CompositionEvent) => {
    if (e.type === 'compositionend') {
      // composition is end
      this.isOnComposition = false;
      if (isNeedTriggerAfterComposition()) {
        this.handleChange(e);
      }
    } else {
      // in composition
      this.isOnComposition = true;
    }
  };

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
    const value = e.target.value;
    const { onChange, trim, trimAll, onBlur, readOnly } = this.props;
    if (!readOnly) {
      this.setState({
        focused: false,
      });
    }
    let trimValue = value;
    if (trim && isString(value)) {
      trimValue = value.trim();
    }
    if (trimAll && isString(value)) {
      trimValue = value.replace(/\s/g, '');
    }
    if (trimValue !== value) {
      this.input.value = trimValue;
      if (onChange && isFunction(onChange)) {
        e.target.value = trimValue;
        onChange(e);
      }
    }
    if (onBlur && isFunction(onBlur)) {
      onBlur(e);
    }
  };

  handleChange = e => {
    const { onChange } = this.props;
    if (!this.isOnComposition) {
      // 在 onChange 时记录光标的位置
      if (this.input) {
        this.inputSelection = {
          start: this.input.selectionStart,
          end: this.input.selectionEnd,
        };
      }
      const transformValue = this.transformValue(e.target.value);
      if (transformValue !== e.target.value) {
        e.target.value = this.transformValue(e.target.value);
        if (this.inputSelection && (this.inputSelection.start || this.inputSelection.end)) {
          e.target.setSelectionRange(this.inputSelection.start, this.inputSelection.end);
          this.inputSelection = null;
        }
      }
    }
    if (!('value' in this.props)) {
      this.setState({ value: e.target.value });
    }
    if (onChange && isFunction(onChange)) {
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

  handleShowPassword = () => {
    this.setState({
      showPassword: true,
    });
  };

  handleHidePassword = () => {
    this.setState({
      showPassword: false,
    });
  };

  handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
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
    const { size, copy, disabled, typeCase, showPasswordEye, type } = this.props;
    const prefixCls = this.getPrefixCls();
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === Size.small,
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-upper`]: typeCase === 'upper',
      [`${prefixCls}-lower`]: typeCase === 'lower',
      [`${prefixCls}-has-copy`]: copy,
      [`${prefixCls}-has-eye`]: showPasswordEye && type === 'password',
    });
  }

  transformValue(v: any) {
    const { typeCase, dbc2sbc = true, inputChinese } = this.props;
    let value = v;
    if (typeCase === 'upper') {
      value = upperCaseString(v);
    } else if (typeCase === 'lower') {
      value = lowerCaseString(v);
    }

    if (dbc2sbc && isDbc(v)) {
      value = dbcToSbc(v);
    }

    if (!inputChinese && isString(value)) {
      value = value.replace(/[\u4e00-\u9fa5]/g, '');
    }

    return value;
  }

  renderCopyIcon(prefixCls?: string) {
    const { copy } = this.props;
    return copy ? (
      <span className={`${prefixCls}-icon `} onClick={this.handleCopy}>
        <Icon className={`${prefixCls}-icon-copy`} type="library_books" />
      </span>
    ) : null;
  }

  renderShowPassword(prefixCls?: string) {
    const { type, showPasswordEye } = this.props;
    if (showPasswordEye && type === 'password') {
      const { showPassword } = this.state;
      const props: any = {};
      if (showPasswordEye === 'nohold') {
        props.onMouseDown = this.handleShowPassword;
        props.onMouseLeave = this.handleHidePassword;
        props.onMouseUp = this.handleHidePassword;
      } else {
        props.onClick = this.handleTogglePassword;
      }
      return (
        <span className={`${prefixCls}-icon ${prefixCls}-icon-eye`} {...props}>
          <Icon
            className={`${prefixCls}-icon-copy`}
            type={showPassword ? 'visibility' : 'visibility_off'}
          />
        </span>
      );
    }
  }

  getLengthInfo(prefixCls?: string) {
    const { maxLength, showLengthInfo } = this.props;
    const { value } = this.state;
    const inputLength = value ? value.length : 0;
    return showLengthInfo !== 'never' && ((maxLength && showLengthInfo === true) || (maxLength && maxLength > 0 && inputLength === maxLength)) ? (
      <div className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
    ) : null;
  }

  renderFloatLabel(prefixCls?: string): ReactNode {
    const { label } = this.props;
    if (label) {
      return (
        <div className={`${prefixCls}-label-wrapper`}>
          <div className={`${prefixCls}-label`}>{label}</div>
        </div>
      );
    }
  }

  getSizeClassName(name: string, prefixCls?: string) {
    const { size } = this.props;
    return classNames(`${prefixCls}-${name}`, {
      [`${prefixCls}-${name}-sm`]: size === Size.small,
      [`${prefixCls}-${name}-lg`]: size === Size.large,
    });
  }

  hasValue() {
    const { value } = this.state;
    return value && value.length !== 0;
  }

  renderLabeledIcon(children: ReactElement<any>, prefixCls?: string) {
    const { props } = this;
    const hasBorder = props.border && props.labelLayout === 'float';
    const passwordEye = this.renderShowPassword(prefixCls);
    const copyIcon = this.renderCopyIcon(prefixCls);
    const floatLabel = hasBorder && this.renderFloatLabel(prefixCls);
    const { className } = props;
    const prefix = props.prefix ? (
      <span className={`${prefixCls}-prefix`} ref={this.savePrefix}>
        {props.prefix}
      </span>
    ) : null;

    const $suffix = props.showPasswordEye === 'nohold' && passwordEye ? passwordEye : props.suffix;
    const $passwordEye = props.showPasswordEye === 'nohold' ? undefined : passwordEye;
    const suffix = $suffix ? (
      <span className={`${prefixCls}-suffix`} ref={this.saveSuffix}>
        {$suffix}
      </span>
    ) : null;
    if (hasBorder) {
      const { focused } = this.state;
      const preProps = children.props;
      children = cloneElement<InputProps>(children, {
        className: classNames(preProps.className, className),
        placeholder: (!floatLabel || focused) ? preProps.placeholder : null,
      });
    }
    if ($passwordEye || copyIcon || floatLabel) {
      children = (
        <div
          className={this.getSizeClassName('rendered', prefixCls)}
          ref={this.saveRenderedRef}
        >
          {children}
          {floatLabel}
          {copyIcon}
          {$passwordEye}
        </div>
      );
    }

    if (prefix || suffix) {
      const affixWrapperCls = classNames(this.getSizeClassName('affix-wrapper', prefixCls), {
        [`${className}`]: className && !hasBorder,
        [`${prefixCls}-has-border`]: hasBorder,
      });
      return (
        <span
          className={affixWrapperCls}
          style={props.style}
        >
          {prefix}
          {cloneElement(children, { style: null })}
          {suffix}
        </span>
      );
    }
    if (hasBorder) {
      return (
        <span className={`${prefixCls}-has-border`} style={props.style}>
          {cloneElement(children, { style: null })}
        </span>
      );
    }
    return cloneElement(children, { className: classNames(className, children.props.className), style: props.style });
  }

  renderInput(prefixCls?: string) {
    const { type } = this.props;
    const { value, showPassword } = this.state;
    const omits = [
      'prefixCls',
      'onPressEnter',
      'addonBefore',
      'addonAfter',
      'prefix',
      'suffix',
      'label',
      'labelLayout',
      'copy',
      'style',
      'focused',
      'showLengthInfo',
      'showPasswordEye',
      'size',
      'border',
      'form',
      'onChange',
      'dbc2sbc',
      'typeCase',
      'trim',
      'trimAll',
      'inputChinese',
      'type',
    ];
    const otherProps: Omit<InputProps,
      'prefixCls'
      | 'onPressEnter'
      | 'addonBefore'
      | 'addonAfter'
      | 'prefix'
      | 'suffix'
      | 'label'
      | 'labelLayout'
      | 'copy'
      | 'style'
      | 'focused'
      | 'showLengthInfo'
      | 'showPasswordEye'
      | 'size'
      | 'border'
      | 'form'
      | 'onChange'
      | 'dbc2sbc'
      | 'typeCase'
      | 'trim'
      | 'trimAll'
      | 'inputChinese'
      | 'type'
      | 'placeholder'> = omit(this.props, omits);

    return this.renderLabeledIcon(
      <input
        {...otherProps}
        value={fixControlledValue(value)}
        className={this.getInputClassName()}
        onKeyDown={this.handleKeyDown}
        ref={this.saveInput}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onCompositionStart={this.handleComposition}
        onCompositionUpdate={this.handleComposition}
        onCompositionEnd={this.handleComposition}
        type={showPassword ? 'text' : type}
      />,
      prefixCls,
    );
  }

  getWrapperClassName(prefixCls?: string) {
    const { disabled, label, prefix, suffix } = this.props;
    const { focused } = this.state;
    return classNames({
      [`${prefixCls}-has-value`]: this.hasValue(),
      [`${prefixCls}-focused`]: focused,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-has-label`]: !!label,
      [`${prefixCls}-has-prefix`]: !!prefix,
      [`${prefixCls}-has-suffix`]: !!suffix,
    });
  }

  renderLabeledInput(children: ReactElement<any>, prefixCls?: string) {
    const props = this.props;

    const wrapperClassName = `${prefixCls}-group`;
    const addonClassName = `${wrapperClassName}-addon`;
    const addonBefore = props.addonBefore ? (
      <span className={addonClassName}>
        {props.addonBefore}
      </span>
    ) : null;

    const addonAfter = props.addonAfter ? (
      <span className={addonClassName}>
        {props.addonAfter}
      </span>
    ) : null;
    const lengthInfo = this.getLengthInfo(prefixCls);
    const className = classNames(`${prefixCls}-wrapper`, this.getWrapperClassName(prefixCls), {
      [wrapperClassName]: (addonBefore || addonAfter),
    });

    const groupClassName = this.getSizeClassName('group-wrapper', prefixCls);

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    if (addonBefore || addonAfter) {
      return (
        <span
          className={groupClassName}
          style={props.style}
        >
          <span className={className}>
            {addonBefore}
            {cloneElement(children, { style: null })}
            {addonAfter}
          </span>
          {lengthInfo}
        </span>
      );
    }
    if (lengthInfo) {
      return (
        <span className={className} style={props.style}>
          {cloneElement(children, { style: null })}
          {lengthInfo}
        </span>
      );
    }
    return cloneElement(children, { className: classNames(children.props.className, className) });
  }

  render() {
    const prefixCls = this.getPrefixCls();
    return this.renderLabeledInput(this.renderInput(prefixCls), prefixCls);
  }
}
