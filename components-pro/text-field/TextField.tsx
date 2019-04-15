import React, { createElement, CSSProperties, isValidElement, ReactNode } from 'react';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import isArray from 'lodash/isArray';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import Icon from '../icon';
import { ValidatorProps } from '../validator/rules';
import { preventDefault } from '../_util/EventManager';
import measureTextWidth from '../_util/measureTextWidth';
import Animate from '../animate';
import Tooltip from '../tooltip/Tooltip';
import { GroupItemCategory } from './enum';
import { ShowHelp } from '../field/enum';

let PLACEHOLDER_SUPPORT;

export function isPlaceHolderSupport(): boolean {
  if (PLACEHOLDER_SUPPORT !== void 0) {
    return PLACEHOLDER_SUPPORT;
  } else if (typeof window !== 'undefined') {
    return PLACEHOLDER_SUPPORT = 'placeholder' in document.createElement('input');
  } else {
    return true;
  }
}

export interface TextFieldProps extends FormFieldProps {
  /**
   * 占位词
   */
  placeholder?: string;
  /**
   * 最小长度
   */
  minLength?: number;
  /**
   * 最大长度
   */
  maxLength?: number;
  /**
   * 正则校验
   */
  pattern?: string | RegExp;
  /**
   * 自动完成
   */
  autoComplete?: 'on' | 'off';
  /**
   * 前缀
   */
  prefix?: ReactNode;
  /**
   * 后缀
   */
  suffix?: ReactNode;
  /**
   * 是否显示清除按钮
   */
  clearButton?: boolean;
  /**
   * 前置标签
   */
  addonBefore?: ReactNode;
  /**
   * 后置标签
   */
  addonAfter?: ReactNode;
}

export class TextField<T extends TextFieldProps> extends FormField<T & TextFieldProps> {
  static displayName = 'TextField';

  static propTypes = {
    /**
     * 占位词
     */
    placeholder: PropTypes.string,
    /**
     * 最小长度
     */
    minLength: PropTypes.number,
    /**
     * 最大长度
     */
    maxLength: PropTypes.number,
    /**
     * 正则校验
     */
    pattern: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * 自动完成
     */
    autoComplete: PropTypes.string,
    /**
     * 前缀
     */
    prefix: PropTypes.node,
    /**
     * 后缀
     */
    suffix: PropTypes.node,
    /**
     * 是否显示清除按钮
     */
    clearButton: PropTypes.bool,
    /**
     * 前置标签
     */
    addonBefore: PropTypes.node,
    /**
     * 后置标签
     */
    addonAfter: PropTypes.node,
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'pro-input',
    autoComplete: 'off',
    clearButton: false,
    multiple: false,
  };

  @observable text?: string;

  type: string = 'text';

  isEmpty() {
    return isEmpty(this.text) && super.isEmpty();
  }

  canPlaceholderShown() {
    if (this.hasFloatLabel && !this.isFocused) {
      return false;
    }
    return true;
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'prefix',
      'suffix',
      'clearButton',
      'addonBefore',
      'addonAfter',
    ]);
    otherProps.type = this.type;
    otherProps.maxLength = this.getProp('maxLength');
    otherProps.onKeyDown = this.handleKeyDown;
    if (!this.canPlaceholderShown()) {
      delete otherProps.placeholder;
    }
    return otherProps;
  }

  getValidatorProps(): ValidatorProps {
    const pattern = this.getProp('pattern');
    const maxLength = this.getProp('maxLength');
    const minLength = this.getProp('minLength');
    return {
      ...super.getValidatorProps(),
      pattern,
      maxLength,
      minLength,
    };
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    return super.getWrapperClassNames({
      [`${prefixCls}-empty`]: this.isEmpty(),
      [`${prefixCls}-suffix-button`]: isValidElement<{ onClick }>(suffix),
      [`${prefixCls}-multiple`]: this.multiple,
      [`${prefixCls}-prefix-button`]: isValidElement<{ onClick }>(prefix),
    }, ...args);
  }

  renderWrapper(): ReactNode {
    return this.renderGroup();
  }

  renderInputElement(): ReactNode {
    const input = this.getWrappedEditor();
    const button = this.getInnerSpanButton();
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    const otherPrevNode = this.getOtherPrevNode();
    const otherNextNode = this.getOtherNextNode();
    const placeholderDiv = this.renderPlaceHolder();
    const floatLabel = this.renderFloatLabel();
    const underLine = this.renderUnderLine();
    const multipleHolder = this.renderMultipleHolder();

    return (
      <span {...this.getWrapperProps()}>
        {multipleHolder}
        {otherPrevNode}
        {placeholderDiv}
        <label onMouseDown={this.handleMouseDown}>
          {prefix}
          {input}
          {floatLabel}
          {button}
          {suffix}
        </label>
        {underLine}
        {otherNextNode}
      </span>
    );
  }

  renderGroup(): ReactNode {
    const { prefixCls, props: { addonBefore, addonAfter, showHelp } } = this;
    const inputElement = this.renderInputElement();
    const isTooltipHelp = showHelp === ShowHelp.tooltip;
    const help = isTooltipHelp ? this.renderHelpMessage() : null;

    if (!addonBefore && !addonAfter && (!help || showHelp !== ShowHelp.tooltip)) {
      return inputElement;
    }

    return (
      <div className={`${prefixCls}-group-wrapper`}>
        <div {...this.getWrapperProps()} className={`${prefixCls}-group`}>
          {this.wrapGroupItem(addonBefore, GroupItemCategory.before)}
          {this.wrapGroupItem(inputElement, GroupItemCategory.input)}
          {this.wrapGroupItem(help, GroupItemCategory.help)}
          {this.wrapGroupItem(addonAfter, GroupItemCategory.after)}
        </div>
      </div>
    );
  }

  renderTooltipHelp(): ReactNode {
    return (
      <Tooltip
        title={this.props.help}
        placement="bottom"
      >
        <Icon type="help" />
      </Tooltip>
    );
  }

  wrapGroupItem(node: ReactNode, category: GroupItemCategory): ReactNode {
    const { prefixCls } = this;
    if (!node) {
      return null;
    }
    return (
      <div className={`${prefixCls}-group-${category}`}>
        {node}
      </div>
    );
  }

  renderMultipleEditor(props: T) {
    const { style } = this.props;
    const { text } = this;
    const editorStyle = {} as CSSProperties;
    if (!this.editable) {
      editorStyle.position = 'absolute';
      editorStyle.left = 0;
      editorStyle.top = 0;
      editorStyle.zIndex = -1;
      props.readOnly = true;
    } else if (text) {
      editorStyle.width = pxToRem(measureTextWidth(text, style));
    }
    return (
      <li key="text">
        <input
          {...props}
          value={text || ''}
          style={editorStyle}
        />
      </li>
    );
  }

  getWrappedEditor(): ReactNode {
    return this.getEditor();
  }

  getEditor(): ReactNode {
    const { prefixCls, props: { style } } = this;
    const { placeholder, ...otherProps } = this.getOtherProps();
    const { height } = (style || {}) as CSSProperties;
    return this.multiple ? (
      <div key="text" className={otherProps.className}>
        <Animate
          component="ul"
          componentProps={{ style: height && height !== 'auto' ? { height: pxToRem(toPx(height)! - 2) } : void 0 }}
          transitionName="zoom"
          exclusive
        >
          {this.renderMultipleValues()}
          {this.renderMultipleEditor({ ...otherProps, className: `${prefixCls}-multiple-input` })}
        </Animate>
      </div>
    ) : (
      <input
        key="text"
        {...otherProps}
        placeholder={placeholder}
        value={this.getText()}
        readOnly={!this.editable}
      />
    );
  }

  getSuffix(): ReactNode {
    const { suffix = this.getDefaultSuffix() } = this.props;
    if (suffix) {
      return this.wrapperSuffix(suffix);
    }
  }

  getDefaultSuffix(): ReactNode {
    return;
  }

  wrapperSuffix(children: ReactNode, props?: any): ReactNode {
    const { prefixCls } = this;
    if (isValidElement<any>(children)) {
      const { type } = children;
      const { onClick, ...otherProps } = children.props;
      if (onClick) {
        children = createElement(type, otherProps);
        props = {
          onClick,
          ...props,
        };
      }
    }
    return (
      <div className={`${prefixCls}-suffix`} onMouseDown={preventDefault} {...props}>
        {children}
      </div>
    );
  }

  getPrefix(): ReactNode {
    const { prefix } = this.props;
    if (prefix) {
      return this.wrapperPrefix(prefix);
    }
  }

  wrapperPrefix(children: ReactNode): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-prefix`}>
        {children}
      </div>
    );
  }

  renderMultipleHolder() {
    const { name, multiple } = this;
    if (multiple) {
      return (
        <input key="value" className={`${this.prefixCls}-multiple-value`} value={this.toValueString(this.getValue()) || ''} name={name} />
      );
    }
  }

  getOtherPrevNode(): ReactNode {
    return;
  }

  getOtherNextNode(): ReactNode {
    return;
  }

  renderPlaceHolder(): ReactNode {
    if ((this.multiple || !isPlaceHolderSupport()) && this.canPlaceholderShown()) {
      return this.getPlaceHolderNode();
    }
  }

  getPlaceHolderNode(): ReactNode {
    const { prefixCls } = this;
    const { placeholder } = this.getOtherProps();
    if (placeholder) {
      return <div className={`${prefixCls}-placeholder`}>{placeholder}</div>;
    }
  }

  getInnerSpanButton(): ReactNode {
    const { props: { clearButton }, prefixCls } = this;
    if (clearButton && !this.isDisabled() && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(<Icon type="close" onClick={this.handleClearButtonClick} />, {
        className: `${prefixCls}-clear-button`,
      });
    }
  }

  wrapperInnerSpanButton(children: ReactNode, props: any = {}): ReactNode {
    const { prefixCls } = this;
    const { className, ...otherProps } = props;
    return (
      <div key="inner-button" {...otherProps} className={classNames(`${prefixCls}-inner-button`, className)}>
        {children}
      </div>
    );
  }

  @autobind
  handleKeyDown(e) {
    const { disabled, clearButton } = this.props;
    if (!this.isReadOnly() && !disabled) {
      if (this.multiple) {
        if (!this.text) {
          switch (e.keyCode) {
            case KeyCode.DELETE:
              this.clear();
              break;
            case KeyCode.BACKSPACE:
              const values = this.getValues();
              const value = values.pop();
              this.setValue(values);
              this.afterRemoveValue(value, -1);
              break;
            default:
          }
        }
      } else if (clearButton && !this.editable) {
        switch (e.keyCode) {
          case KeyCode.DELETE:
          case KeyCode.BACKSPACE:
            this.clear();
            break;
          default:
        }
      }
    }
    super.handleKeyDown(e);
  }

  @autobind
  handleMouseDown(e) {
    if (e.target !== this.element) {
      e.preventDefault();
      if (!this.isFocused) {
        this.focus();
      }
    }
  }

  @autobind
  handleClearButtonClick() {
    this.clear();
  }

  @autobind
  handleFocus(e) {
    super.handleFocus(e);
    defer(() => this.select());
  }

  @autobind
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      if (this.editable) {
        this.syncValueOnBlur(e.target.value);
      } else if (!this.getValues().length) {
        this.setValue(null); // to excute validation
      }
    }
    super.handleBlur(e);
  }

  syncValueOnBlur(value) {
    this.addValue(value);
  }

  setValue(value: any): void {
    super.setValue(value);
    this.setText(void 0);
  }

  getText() {
    return this.text === void 0 ? super.getText() : this.text;
  }

  @action
  setText(text?: string): void {
    this.text = text;
  }

  select() {
    const { element } = this;
    if (element && this.editable) {
      element.select();
    }
  }

  @autobind
  handleChange(e) {
    const { target, target: { value } } = e;
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(restricted);
  }

  restrictInput(value: string): string {
    return value;
  }

  toValueString(value: any): string | undefined {
    if (isArray(value)) {
      return value.join(',');
    }
    return value;
  }

}

@observer
export default class ObserverTextField<T extends TextFieldProps> extends TextField<T & TextFieldProps> {
  static defaultProps = TextField.defaultProps;
}
