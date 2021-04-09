import React, { createElement, CSSProperties, isValidElement, ReactNode } from 'react';
import { Cancelable, DebounceSettings } from 'lodash';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isArrayLike from 'lodash/isArrayLike';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import { WaitType } from '../core/enum';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import isIE from '../_util/isIE';
import Icon from '../icon';
import { ValidatorProps } from '../validator/rules';
import { preventDefault, stopPropagation } from '../_util/EventManager';
import measureTextWidth from '../_util/measureTextWidth';
import Animate from '../animate';
import Tooltip from '../tooltip/Tooltip';
import { GroupItemCategory, ValueChangeAction } from './enum';
import { ShowHelp } from '../field/enum';
import { FieldFormat } from '../data-set/enum';
import { LabelLayout } from '../form/interface';
import { getProperty } from '../form/utils';

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
  /**
   * 是否是筛选条 flat 模式
   */
  isFlat?: boolean;
  /**
   * 触发值变更的动作， default: blur
   */
  valueChangeAction?: ValueChangeAction;
  /**
   * 值变更间隔时间，只有在valueChangeAction为input时起作用
   */
  wait?: number;
  /**
   * 值变更间隔类型，可选值：throttle | debounce
   * @default throttle
   */
  waitType?: WaitType;
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
    /**
     * 是否是筛选条 flat 模式
     */
    isFlat: PropTypes.bool,
    /**
     * 触发值变更的动作， default: blur
     */
    valueChangeAction: PropTypes.oneOf([ValueChangeAction.input, ValueChangeAction.blur]),
    /**
     * 值变更间隔时间，只有在valueChangeAction为input时起作用
     */
    wait: PropTypes.number,
    /**
     * 值变更间隔类型，可选值：throttle | debounce
     * @default throttle
     */
    waitType: PropTypes.oneOf([WaitType.throttle, WaitType.debounce]),
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'input',
    clearButton: false,
    multiple: false,
    valueChangeAction: ValueChangeAction.blur,
    waitType: WaitType.debounce,
  };

  @observable text?: string;

  type: string = 'text';

  tagContainer: HTMLUListElement | null;

  handleChangeWait: Function & Cancelable;

  constructor(props, context) {
    super(props, context);
    this.handleChangeWait = this.getHandleChange(props);
  }


  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    const { wait, waitType } = this.props;
    if (wait !== nextProps.wait || waitType !== nextProps.waitType) {
      this.handleChangeWait = this.getHandleChange(nextProps);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.handleChangeWait.cancel();
  }


  @autobind
  saveTagContainer(node) {
    this.tagContainer = node;
  }

  isEmpty() {
    const result = isEmpty(this.text) && super.isEmpty();
    if (this.range === true) {
      if (this.value && isArrayLike(this.value) && !this.value.find(v => v)) {
        return true;
      }
      return result;
    }

    if (isArrayLike(this.range)) {
      if (this.value && !Object.values(this.value).find(v => v)) {
        return true;
      }
      return result;
    }
    return result;
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
      'isFlat',
      'valueChangeAction',
      'wait',
      'waitType',
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
    const { addonBefore, addonAfter } = this.props;
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
    const wrapperProps = this.getWrapperProps();

    // 修复设置宽度导致拥有addon出现宽度超出
    if (addonAfter || addonBefore) {
      wrapperProps.style = omit(wrapperProps.style, 'width');
    }

    // 修复ie下出现多层model导致的输入框遮盖问题
    // fixed the input would shadow each other in ie brower
    const ZIndexOfIEProps: { style: CSSProperties } | {} = isIE() ? { style: { zIndex: 'auto' } } : {};

    const element = (
      <span key="element" {...wrapperProps}>
        {multipleHolder}
        {otherPrevNode}
        {placeholderDiv}
        {renderedValue}
        <label {...ZIndexOfIEProps} onMouseDown={this.handleMouseDown}>
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

  // 处理 form 中的 labelLayout 为 placeholder 情况避免以前 placeholder 和 label 无法区分彼此。
  getPlaceholders(): string[] {
    const { dataSet, record, props, labelLayout } = this;
    const placeholderOrigin = this.getProp('placeholder');
    const label = getProperty(props, 'label', dataSet, record);
    let placeholder = placeholderOrigin 
    if (labelLayout === LabelLayout.placeholder) {
      placeholder = label && !this.isFocused ? label : placeholderOrigin || label ;
    }
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
        {!this.isDisabled() && <input
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
        />}
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

  /**
   * 处理 flat 多选tooltip text
   */
  getMultipleText() {
    const values = this.getValues();
    const repeats: Map<any, number> = new Map<any, number>();
    const texts = values.map((v) => {
      const key = this.getValueKey(v);
      const repeat = repeats.get(key) || 0;
      const text = this.processText(this.getText(v));
      repeats.set(key, repeat + 1);
      if (!isNil(text)) {
        return text;
      }
      return undefined;
    });
    return texts.join('、');
  }

  getEditor(): ReactNode {
    const {
      prefixCls,
      multiple,
      range,
      props: { style, isFlat, clearButton },
    } = this;
    const otherProps = this.getOtherProps();
    const { height } = (style || {}) as CSSProperties;
    if (multiple) {
      const tags = (
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
      );
      return (
        <div key="text" className={otherProps.className}>
          {
            isFlat ? (
              <Tooltip title={this.getMultipleText()}>
                {tags}
              </Tooltip>
            ) : tags
          }
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
    const placeholder = this.hasFloatLabel ? undefined : this.getPlaceholders()[0];
    const finalText = isString(text) ? text : this.getText(this.getValue());

    let width = 0;
    // 筛选条默认宽度处理
    if (isFlat) {
      const hasValue = this.getValue() !== undefined && this.getValue() !== null;
      width = hasValue ? measureTextWidth(finalText) + (clearButton ? 37 : 21) : measureTextWidth(placeholder || '') + 24;
    }

    if (isValidElement(text)) {
      otherProps.style = {
        ...otherProps.style,
        textIndent: -1000,
        width: isFlat ? width : undefined,
      };
    } else if (isFlat) {
      otherProps.style = { width, ...otherProps.style };
    }
    return (
      <input
        key="text"
        {...otherProps}
        placeholder={placeholder}
        value={finalText}
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
    const { name, multiple, props: { isFlat } } = this;
    let width: string | number = 'auto';
    if (isFlat) {
      const hasValue = !this.isEmpty();
      const placeholder = this.hasFloatLabel ? undefined : this.getPlaceholders()[0];
      width = hasValue ? 'auto' : measureTextWidth(placeholder || '') + 22;
    }
    if (multiple) {
      return (
        <input
          key="value"
          className={`${this.prefixCls}-multiple-value`}
          value={this.toValueString(this.getValue()) || ''}
          name={name}
          onChange={noop}
          style={{ width: isFlat ? width : 'auto' }}
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
      props: { clearButton, isFlat },
      prefixCls,
    } = this;
    if (clearButton && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(
        <Icon type="close" onClick={this.handleClearButtonClick} />,
        {
          className: isFlat ? `${prefixCls}-clear-button ${prefixCls}-clear-button-flat` : `${prefixCls}-clear-button`,
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

  handleTagAnimateEnd() {
  }

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
    } else if (isIE()) {
      /**
       * 修复ie出现点击backSpace的页面回到上一页问题
       */
      if (e.keyCode === KeyCode.BACKSPACE) {
        e.preventDefault();
      }
    }
    super.handleKeyDown(e);
  }

  @autobind
  handleMouseDown(e) {
    if (e.target !== this.element) {
      if (!this.isDisabled()) {
        e.preventDefault();
      }
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

  getHandleChange(props): Function & Cancelable {
    const { wait, waitType } = props;
    if (wait && waitType) {
      const options: DebounceSettings = { leading: true, trailing: true };
      if (waitType === WaitType.throttle) {
        options.trailing = false;
        options.maxWait = wait;
      } else if (waitType === WaitType.debounce) {
        options.leading = false;
      }
      return debounce(this.prepareSetValue, wait, options);
    }
    return debounce(this.prepareSetValue, 0);
  }


  @autobind
  handleChange(e) {
    const {
      target,
      type,
      target: { value },
    } = e;
    const { valueChangeAction } = this.props;
    if (type === 'compositionend') {
      this.lock = false;
    }

    if (!this.lock) {
      const restricted = this.restrictInput(value);
      if (restricted !== value) {
        const selectionEnd = target.selectionEnd + restricted.length - value.length;
        target.value = restricted;
        target.setSelectionRange(selectionEnd, selectionEnd);
      }
      this.setText(restricted);
      if (valueChangeAction === ValueChangeAction.input) {
        this.handleChangeWait(restricted);
      }
    } else {
      this.setText(value);
      if (valueChangeAction === ValueChangeAction.input) {
        this.handleChangeWait(value);
      }
    }
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
