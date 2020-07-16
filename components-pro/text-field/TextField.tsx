import React, { createElement, CSSProperties, isValidElement, ReactNode } from 'react';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import Icon from '../icon';
import { ValidatorProps } from '../validator/rules';
import { preventDefault, stopPropagation } from '../_util/EventManager';
import measureTextWidth from '../_util/measureTextWidth';
import Animate from '../animate';
import Tooltip from '../tooltip/Tooltip';
import { GroupItemCategory } from './enum';
import { ShowHelp } from '../field/enum';
import { FieldFormat } from '../data-set/enum';

let PLACEHOLDER_SUPPORT;

export function isPlaceHolderSupport(): boolean {
  if (PLACEHOLDER_SUPPORT !== undefined) {
    return PLACEHOLDER_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    return (PLACEHOLDER_SUPPORT = 'placeholder' in document.createElement('input'));
  }
  return true;
}

export interface TextFieldProps extends FormFieldProps {
  /**
   * 占位词
   */
  placeholder?: string | string[];
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
  /**
   * 限制可输入的字符
   */
  restrict?: string;
}

export class TextField<T extends TextFieldProps> extends FormField<T> {
  static displayName = 'TextField';

  static propTypes = {
    /**
     * 占位词
     */
    placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
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
    /**
     * 限制可输入的字符
     */
    restrict: PropTypes.string,
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'input',
    clearButton: false,
    multiple: false,
  };

  @observable text?: string;

  type: string = 'text';

  tagContainer: HTMLUListElement | null;

  @autobind
  saveTagContainer(node) {
    this.tagContainer = node;
  }

  isEmpty() {
    return isEmpty(this.text) && super.isEmpty();
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'prefix',
      'suffix',
      'clearButton',
      'addonBefore',
      'addonAfter',
      'restrict',
      'placeholder',
      'placeHolder',
      'maxLengths',
      'autoComplete',
    ]);
    otherProps.type = this.type;
    otherProps.maxLength = this.getProp('maxLength');
    otherProps.onKeyDown = this.handleKeyDown;
    otherProps.autoComplete = this.props.autoComplete || getConfig('textFieldAutoComplete') || 'off';
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
    const { prefixCls, multiple, range } = this;
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-empty`]: this.isEmpty(),
        [`${prefixCls}-suffix-button`]: isValidElement<{ onClick; }>(suffix),
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-range`]: range,
        [`${prefixCls}-prefix-button`]: isValidElement<{ onClick; }>(prefix),
      },
      ...args,
    );
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
    const renderedValue = this.renderRenderedValue();
    const floatLabel = this.renderFloatLabel();
    const multipleHolder = this.renderMultipleHolder();

    const element = (
      <span key="element" {...this.getWrapperProps()}>
        {multipleHolder}
        {otherPrevNode}
        {placeholderDiv}
        {renderedValue}
        <label onMouseDown={this.handleMouseDown}>
          {prefix}
          {input}
          {floatLabel}
          {button}
          {suffix}
        </label>
      </span>
    );

    if (otherNextNode) {
      return (
        <>
          {element}
          {otherNextNode}
        </>
      );
    }

    return element;
  }

  renderGroup(): ReactNode {
    const {
      prefixCls,
      props: { addonBefore, addonAfter, showHelp },
    } = this;
    const inputElement = this.renderInputElement();
    const help = showHelp === ShowHelp.tooltip ? this.renderTooltipHelp() : null;

    if (!addonBefore && !addonAfter && !help) {
      return inputElement;
    }

    const classString = classNames(`${prefixCls}-group`, {
      [`${prefixCls}-float-label-group`]: this.hasFloatLabel,
    });

    return (
      <div key="wrapper" className={`${prefixCls}-group-wrapper`}>
        <div {...this.getWrapperProps()} className={classString}>
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
      <Tooltip title={this.getProp('help')} placement="bottom">
        <Icon type="help" />
      </Tooltip>
    );
  }

  getPlaceholders(): string[] {
    const { placeholder } = this.props;
    const holders: string[] = [];
    return placeholder ? holders.concat(placeholder!) : holders;
  }

  getLabel() {
    const [placeholder] = this.getPlaceholders();
    if (this.isEmpty() && placeholder) {
      return placeholder;
    }
    return this.getProp('label');
  }

  wrapGroupItem(node: ReactNode, category: GroupItemCategory): ReactNode {
    const { prefixCls } = this;
    if (!node) {
      return null;
    }
    return <div className={`${prefixCls}-group-${category}`}>{node}</div>;
  }

  setRangeTarget(target) {
    if (this.text !== undefined) {
      this.prepareSetValue(this.text);
      this.setText();
    }
    super.setRangeTarget(target);
    defer(() => this.isFocused && this.select());
  }

  renderRangeEditor(props) {
    const { prefixCls, rangeTarget, isFocused } = this;
    const [startPlaceholder, endPlaceHolder = startPlaceholder] = this.getPlaceholders();
    const [startValue = '', endValue = ''] = this.processRangeValue();
    const editorStyle = {} as CSSProperties;
    if (rangeTarget === 1) {
      editorStyle.right = 0;
    } else {
      editorStyle.left = 0;
    }
    return (
      <span key="text" className={`${prefixCls}-range-text`}>
        {/* 确保 range-input 为第一个 当点击label的时候出了会让element聚焦以外还会让 label的第一个表单元素聚焦 因此导致意料之外的bug */}
        <input
          {...props}
          className={`${prefixCls}-range-input`}
          key="text"
          value={
            rangeTarget === undefined || !this.isFocused
              ? ''
              : this.text === undefined
                ? rangeTarget === 0
                  ? startValue
                  : endValue
                : this.text
          }
          placeholder={
            rangeTarget === undefined || !this.isFocused
              ? ''
              : rangeTarget === 0
                ? startPlaceholder
                : endPlaceHolder
          }
          readOnly={this.isReadOnly()}
          style={editorStyle}
        />
        <input
          tabIndex={-1}
          className={`${prefixCls}-range-start`}
          onChange={noop}
          onMouseDown={this.handleRangeStart}
          value={rangeTarget === 0 && isFocused ? '' : startValue}
          placeholder={rangeTarget === 0 && isFocused ? '' : startPlaceholder}
          disabled={props.disabled === undefined ? false : props.disabled}
          readOnly
        />
        <span className={`${prefixCls}-range-split`}>~</span>
        <input
          tabIndex={-1}
          className={`${prefixCls}-range-end`}
          onChange={noop}
          onMouseDown={this.handleRangeEnd}
          value={rangeTarget === 1 && isFocused ? '' : endValue}
          placeholder={rangeTarget === 1 && isFocused ? '' : endPlaceHolder}
          disabled={props.disabled === undefined ? false : props.disabled}
          readOnly
        />
      </span>
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
        <input {...(props as Object)} value={text || ''} style={editorStyle} />
      </li>
    );
  }

  getWrappedEditor(): ReactNode {
    return this.getEditor();
  }

  getClassName(...props): string | undefined {
    const { prefixCls, format } = this;
    return super.getClassName(
      {
        [`${prefixCls}-${format}`]: [
          FieldFormat.uppercase,
          FieldFormat.lowercase,
          FieldFormat.capitalize,
        ].includes(format as FieldFormat),
      },
      ...props,
    );
  }

  getEditor(): ReactNode {
    const {
      prefixCls,
      multiple,
      range,
      props: { style },
    } = this;
    const otherProps = this.getOtherProps();
    const { height } = (style || {}) as CSSProperties;
    if (multiple) {
      return (
        <div key="text" className={otherProps.className}>
          <Animate
            component="ul"
            componentProps={{
              ref: this.saveTagContainer,
              onScroll: stopPropagation,
              style:
                height && height !== 'auto' ? { height: pxToRem(toPx(height)! - 2) } : undefined,
            }}
            transitionName="zoom"
            exclusive
            onEnd={this.handleTagAnimateEnd}
            onEnter={this.handleTagAnimateEnter}
          >
            {this.renderMultipleValues()}
            {range
              ? this.renderRangeEditor(otherProps)
              : this.renderMultipleEditor({
                ...otherProps,
                className: `${prefixCls}-multiple-input`,
              } as T)}
          </Animate>
        </div>
      );
    }
    if (range) {
      return (
        <span key="text" className={otherProps.className}>
          {this.renderRangeEditor(otherProps)}
        </span>
      );
    }
    const text = this.getTextNode();
    if (isValidElement(text)) {
      otherProps.style = { ...otherProps.style, textIndent: -1000 };
    }
    return (
      <input
        key="text"
        {...otherProps}
        placeholder={this.hasFloatLabel ? undefined : this.getPlaceholders()[0]}
        value={isString(text) ? text : this.getText(this.getValue())}
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
    return undefined;
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
    return <div className={`${prefixCls}-prefix`}>{children}</div>;
  }

  renderMultipleHolder() {
    const { name, multiple } = this;
    if (multiple) {
      return (
        <input
          key="value"
          className={`${this.prefixCls}-multiple-value`}
          value={this.toValueString(this.getValue()) || ''}
          name={name}
          onChange={noop}
        />
      );
    }
  }

  getOtherPrevNode(): ReactNode {
    return undefined;
  }

  getOtherNextNode(): ReactNode {
    return undefined;
  }

  renderPlaceHolder(): ReactNode {
    if ((this.multiple || !isPlaceHolderSupport()) && !this.hasFloatLabel && !this.range) {
      return this.getPlaceHolderNode();
    }
  }

  renderRenderedValue(): ReactNode {
    const { prefixCls, range, multiple } = this;
    if (!range && !multiple) {
      const text = this.getTextNode();
      if ((!this.isFocused || !this.editable) && isValidElement(text)) {
        return (
          <span key="renderedText" className={`${prefixCls}-rendered-value`}>
            <span className={`${prefixCls}-rendered-value-inner`}>{text}</span>
          </span>
        );
      }
    }
  }

  getPlaceHolderNode(): ReactNode {
    const { prefixCls } = this;
    const [placeholder] = this.getPlaceholders();
    if (placeholder) {
      return <div className={`${prefixCls}-placeholder`}>{placeholder}</div>;
    }
  }

  getInnerSpanButton(): ReactNode {
    const {
      props: { clearButton },
      prefixCls,
    } = this;
    if (clearButton && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(
        <Icon type="close" onClick={this.handleClearButtonClick} />,
        {
          className: `${prefixCls}-clear-button`,
        },
      );
    }
  }

  wrapperInnerSpanButton(children: ReactNode, props: any = {}): ReactNode {
    const { prefixCls } = this;
    const { className, ...otherProps } = props;
    return (
      !this.isDisabled() && (
        <div
          key="inner-button"
          {...otherProps}
          className={classNames(`${prefixCls}-inner-button`, className)}
        >
          {children}
        </div>
      )
    );
  }

  @action
  removeLastValue() {
    const values = this.getValues();
    const value = values.pop();
    this.setValue(values);
    this.afterRemoveValue(value, -1);
  }

  handleTagAnimateEnd() { }

  @autobind
  handleTagAnimateEnter() {
    const { tagContainer } = this;
    const { style } = this.props;
    if (tagContainer && style && style.height) {
      if (tagContainer.scrollTo) {
        tagContainer.scrollTo(0, tagContainer.getBoundingClientRect().height);
      } else {
        tagContainer.scrollTop = tagContainer.getBoundingClientRect().height;
      }

    }
  }

  @autobind
  handleRangeStart(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    // 进行切换的时候默认不会收起 popup 因为点击start的时候也会触发 trigger 的 handleClick
    // 导致在设置了 isClickToHide 的情况下回收起
    // handleRangeEnd 同理
    if (this.rangeTarget === 1 && this.isFocused) {
      event.preventDefault();
    }
    this.setRangeTarget(0);
  }

  @autobind
  handleRangeEnd(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    if (this.rangeTarget === 0 && this.isFocused) {
      event.preventDefault();
    }
    this.setRangeTarget(1);
  }

  @autobind
  handleKeyDown(e) {
    const { disabled, clearButton } = this.props;
    if (!this.isReadOnly() && !disabled) {
      if (this.range && e.keyCode === KeyCode.TAB) {
        if (this.rangeTarget === 0 && !e.shiftKey) {
          this.setRangeTarget(1);
          e.preventDefault();
        }
        if (this.rangeTarget === 1 && e.shiftKey) {
          this.setRangeTarget(0);
          e.preventDefault();
        }
      }
      if (this.multiple) {
        if (!this.text) {
          switch (e.keyCode) {
            case KeyCode.DELETE:
              this.clear();
              break;
            case KeyCode.BACKSPACE:
              this.removeLastValue();
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
    this.setRangeTarget(0);
    this.clear();
  }

  @autobind
  handleFocus(e) {
    super.handleFocus(e);
    defer(() => this.isFocused && this.select());
  }

  @autobind
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      if (this.editable) {
        this.syncValueOnBlur(e.target.value);
      } else if (!this.getValues().length) {
        this.setValue(null);
      }
    }
    super.handleBlur(e);
  }

  @action
  setValue(value: any): void {
    super.setValue(value);
    this.setText(undefined);
  }

  getTextNode() {
    return this.text === undefined ? (super.getTextNode() as string) : this.text;
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
    const {
      target,
      target: { value },
    } = e;
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(restricted);
  }

  restrictInput(value: string): string {
    const { restrict } = this.props;
    if (restrict) {
      return value.replace(new RegExp(`[^${restrict}]+`, 'g'), '');
    }
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
export default class ObserverTextField extends TextField<TextFieldProps> {
  static defaultProps = TextField.defaultProps;
}
