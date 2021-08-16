import React, {
  Children,
  cloneElement,
  createElement,
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  isValidElement,
  Key,
  ReactElement,
  ReactNode,
} from 'react';
import { Cancelable, DebounceSettings } from 'lodash';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import flattenDeep from 'lodash/flattenDeep';
import isArray from 'lodash/isArray';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import { getTooltipTheme } from 'choerodon-ui/lib/_util/TooltipUtils';
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
import RenderedText, { RenderedTextProps } from './RenderedText';
import isReactChildren from '../_util/isReactChildren';
import TextFieldGroup from './TextFieldGroup';
import { findFirstFocusableElement } from '../_util/focusable';
import { hide, show } from '../tooltip/singleton';

let PLACEHOLDER_SUPPORT;

const defaultWrap: (node: ReactElement) => ReactElement = node => node;

export function isPlaceHolderSupport(): boolean {
  if (PLACEHOLDER_SUPPORT !== undefined) {
    return PLACEHOLDER_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    return (PLACEHOLDER_SUPPORT = 'placeholder' in document.createElement('input'));
  }
  return true;
}

export interface TextFieldProps<V = any> extends FormFieldProps<V> {
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
  autoComplete?: string;
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
   * 前置标签样式
   */
  addonBeforeStyle?: CSSProperties;
  /**
   * 后置标签
   */
  addonAfter?: ReactNode;
  /**
   * 后置标签样式
   */
  addonAfterStyle?: CSSProperties;
  /**
   * 限制可输入的字符
   */
  restrict?: string | RegExp;
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
  groupClassName?: string;
  /**
   * 是否显示长度信息
   */
  showLengthInfo?: boolean;
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
     * 前置标签样式
     */
    addonBeforeStyle: PropTypes.object,
    /**
     * 后置标签
     */
    addonAfter: PropTypes.node,
    /**
     * 后置标签样式
     */
    addonAfterStyle: PropTypes.object,
    /**
     * 限制可输入的字符
     */
    restrict: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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
    groupClassName: PropTypes.string,
    showLengthInfo: PropTypes.bool,
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

  addonAfterRef?: HTMLDivElement | null;

  addonBeforeRef?: HTMLDivElement | null;

  @observable renderedTextContent?: string;

  lengthInfoWidth?: number;

  get clearButton(): boolean {
    const { clearButton } = this.props;
    return clearButton && !this.readOnly && !this.disabled;
  }

  /**
   * 是否显示长度信息
   */
  @computed
  get showLengthInfo(): boolean | undefined {
    if ('showLengthInfo' in this.props) {
      return this.props.showLengthInfo;
    }
    return getConfig('showLengthInfo');
  }

  constructor(props, context) {
    super(props, context);
    this.handleChangeWait = this.getHandleChange(props);
  }

  @autobind
  @action
  handleRenderedValueChange(text) {
    this.renderedTextContent = text;
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

  @autobind
  saveAddonAfterRef(node) {
    this.addonAfterRef = node;
  }

  @autobind
  saveAddonBeforeRef(node) {
    this.addonBeforeRef = node;
  }

  isRenderEmpty() {
    if (!this.range && !this.multiple) {
      const value = this.getValue();
      const text = this.getTextNode(value);
      const unRenderedText = this.processValue(value);
      const finalText = isString(text) ? text : isString(unRenderedText) ? unRenderedText : (this.renderedTextContent || '');
      return isEmpty(finalText);
    }
    return true;
  }

  isEmpty() {
    return isEmpty(this.text) && super.isEmpty() && this.isRenderEmpty();
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'prefix',
      'suffix',
      'clearButton',
      'addonBefore',
      'addonAfter',
      'addonBeforeStyle',
      'addonAfterStyle',
      'restrict',
      'placeholder',
      'placeHolder',
      'maxLengths',
      'autoComplete',
      'valueChangeAction',
      'wait',
      'waitType',
      'groupClassName',
      'showLengthInfo',
    ]);
    otherProps.type = this.type;
    otherProps.maxLength = this.getProp('maxLength');
    otherProps.onKeyDown = this.handleKeyDown;
    otherProps.autoComplete = this.props.autoComplete || getConfig('textFieldAutoComplete') || 'off';
    return otherProps;
  }

  forceBlur(e) {
    const { addonBefore, addonAfter, _inTable } = this.props;
    if (!_inTable || (!addonBefore && !addonAfter)) {
      super.forceBlur(e);
    }
  }

  @autobind
  handleAddonBeforeKeyDown(e) {
    const { _inTable, onKeyDown } = this.props;
    if (_inTable && onKeyDown && e.keyCode === KeyCode.TAB && e.shiftKey) {
      onKeyDown(e);
    }
  }

  @autobind
  handleAddonAfterKeyDown(e) {
    const { _inTable, onKeyDown } = this.props;
    if (_inTable && onKeyDown && e.keyCode === KeyCode.TAB && !e.shiftKey) {
      onKeyDown(e);
    }
  }

  @autobind
  handleHelpMouseEnter(e) {
    show(e.currentTarget, {
      title: this.getProp('help'),
      popupClassName: `${getConfig('proPrefixCls')}-tooltip-popup-help`,
      theme: getTooltipTheme('help'),
    });
  }

  handleHelpMouseLeave() {
    hide();
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
    const renderedValue = this.renderRenderedValue();
    const input = this.getWrappedEditor(renderedValue);
    const button = this.getInnerSpanButton();
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    const otherPrevNode = this.getOtherPrevNode();
    const otherNextNode = this.getOtherNextNode();
    const placeholderDiv = renderedValue ? undefined : this.renderPlaceHolder();
    const floatLabel = this.renderFloatLabel();
    const multipleHolder = this.renderMultipleHolder();
    const wrapperProps = this.getWrapperProps();

    // 修复设置宽度导致拥有addon出现宽度超出
    if (addonAfter || addonBefore) {
      wrapperProps.style = omit(wrapperProps.style, 'width');
    }

    // 修复ie下出现多层model导致的输入框遮盖问题
    // fixed the input would shadow each other in ie brower
    const ZIndexOfIEProps: { style: CSSProperties; } | {} = isIE() ? { style: { zIndex: 'auto' } } : {};

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
          {suffix}
          {button}
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
      props: { addonBefore, addonAfter, addonBeforeStyle, addonAfterStyle, showHelp, groupClassName, _inTable, onBlur, tabIndex },
    } = this;
    const inputElement = this.renderInputElement();
    const help = showHelp === ShowHelp.tooltip ? this.renderTooltipHelp() : null;

    if (!addonBefore && !addonAfter && !help) {
      return inputElement;
    }

    const classString = classNames(`${prefixCls}-group`, groupClassName, {
      [`${prefixCls}-float-label-group`]: this.hasFloatLabel,
    });

    return (
      <TextFieldGroup key="wrapper" prefixCls={prefixCls} onBlur={_inTable && (addonBefore || addonAfter) ? onBlur : undefined}>
        <div className={classString}>
          {
            this.wrapGroupItem(addonBefore, GroupItemCategory.before, {
              style: addonBeforeStyle,
              ref: this.saveAddonBeforeRef,
              onKeyDown: this.handleAddonBeforeKeyDown,
            }, { tabIndex })
          }
          {this.wrapGroupItem(inputElement, GroupItemCategory.input)}
          {this.wrapGroupItem(help, GroupItemCategory.help)}
          {this.wrapGroupItem(addonAfter, GroupItemCategory.after, {
            style: addonAfterStyle,
            ref: this.saveAddonAfterRef,
            onKeyDown: this.handleAddonAfterKeyDown,
          }, { tabIndex })}
        </div>
      </TextFieldGroup>
    );
  }

  renderTooltipHelp(): ReactNode {
    const help = this.getProp('help');
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={this.handleHelpMouseEnter}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  renderLengthInfo(maxLength?: number, inputLength?: number): ReactNode {
    const { showLengthInfo, prefixCls } = this;
    return maxLength && maxLength > 0 && showLengthInfo ? (
      <div className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
    ) : null;
  }

  // 处理 form 中的 labelLayout 为 placeholder 情况避免以前 placeholder 和 label 无法区分彼此。
  getPlaceholders(): string[] {
    const { dataSet, record, props, labelLayout } = this;
    const placeholderOrigin = this.getProp('placeholder');
    const label = getProperty(props, 'label', dataSet, record);
    let placeholder = placeholderOrigin;
    if (labelLayout === LabelLayout.placeholder) {
      placeholder = label && !this.isFocused ? label : placeholderOrigin || label;
    }
    const holders: string[] = [];
    return placeholder ? holders.concat(placeholder!) : holders;
  }

  getLabel() {
    const [placeholder, endPlaceHolder] = this.getPlaceholders();
    if (this.isEmpty() && !this.isFocused && this.rangeTarget === 1 && !isNil(endPlaceHolder)) {
      return endPlaceHolder;
    }
    if (this.isEmpty() && !this.isFocused && placeholder && (this.rangeTarget === 0 || !this.range)) {
      return placeholder;
    }
    return this.getProp('label');
  }

  wrapGroupItem(node: ReactNode, category: GroupItemCategory, props?: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, childrenProps?: any): ReactNode {
    if (!node) {
      return null;
    }
    const { prefixCls } = this;
    const children = childrenProps ? Children.map(node, (child) => {
      if (isValidElement<any>(child) && !isString(child.type)) {
        return cloneElement<any>(child, childrenProps);
      }
      return child;
    }) : node;
    return <div className={`${prefixCls}-group-${category}`} {...props}>{children}</div>;
  }

  setRangeTarget(target) {
    if (this.text !== undefined) {
      this.prepareSetValue(this.text);
      this.setText();
    }
    super.setRangeTarget(target);
    defer(() => this.isFocused && this.select());
  }

  renderRangeEditor(props, wrap: (node: ReactElement) => ReactElement) {
    const { prefixCls, rangeTarget, isFocused } = this;
    const [startPlaceholder, endPlaceHolder = startPlaceholder] = this.getPlaceholders();
    const [startValue = '', endValue = ''] = this.processRangeValue();
    const startRenderedValue = this.renderRenderedValue(startValue, {
      key: 'startRenderedText',
      className: `${prefixCls}-range-start-rendered-value`,
    });
    const endRenderedValue = this.renderRenderedValue(endValue, {
      key: 'endRenderedText',
      className: `${prefixCls}-range-end-rendered-value`,
    });
    const startText = startRenderedValue ? '' : this.getTextByValue(startValue) as string;
    const endText = endRenderedValue ? '' : this.getTextByValue(endValue) as string;
    const editorStyle = {} as CSSProperties;
    if (rangeTarget === 1) {
      editorStyle.right = 0;
    } else {
      editorStyle.left = 0;
    }
    return (
      <span key="text" className={`${prefixCls}-range-text`}>
        {startRenderedValue}
        {endRenderedValue}
        {/* 确保 range-input 为第一个 当点击label的时候出了会让element聚焦以外还会让 label的第一个表单元素聚焦 因此导致意料之外的bug */}
        {
          !this.disabled && wrap(
            <input
              {...props}
              className={`${prefixCls}-range-input`}
              key="text"
              value={
                rangeTarget === undefined || !this.isFocused
                  ? ''
                  : this.text === undefined
                  ? rangeTarget === 0
                    ? startText
                    : endText
                  : this.text
              }
              placeholder={
                rangeTarget === undefined || !this.isFocused
                  ? ''
                  : rangeTarget === 0
                  ? startPlaceholder
                  : endPlaceHolder
              }
              readOnly={this.readOnly}
              style={editorStyle}
            />,
          )
        }
        <input
          tabIndex={-1}
          className={`${prefixCls}-range-start`}
          onChange={noop}
          onMouseDown={this.handleRangeStart}
          value={rangeTarget === 0 && isFocused ? '' : startText}
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
          value={rangeTarget === 1 && isFocused ? '' : endText}
          placeholder={rangeTarget === 1 && isFocused ? '' : endPlaceHolder}
          disabled={props.disabled === undefined ? false : props.disabled}
          readOnly
        />
      </span>
    );
  }

  renderMultipleEditor(props: T, wrap: (node: ReactElement) => ReactElement) {
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
        {wrap(<input {...(props as Object)} value={text || ''} style={editorStyle} />)}
      </li>
    );
  }

  getWrappedEditor(renderedValue?: ReactNode): ReactNode {
    return this.getEditor(defaultWrap, renderedValue);
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
      const text = this.processText(this.processValue(v));
      repeats.set(key, repeat + 1);
      if (!isNil(text)) {
        return text;
      }
      return undefined;
    });
    return texts.join('、');
  }

  @autobind
  getEditor(wrap: (node: ReactElement) => ReactElement, renderedValue?: ReactNode): ReactNode {
    const {
      prefixCls,
      multiple,
      range,
      props: { style, isFlat, suffixCls },
    } = this;
    const otherProps = this.getOtherProps();
    if (multiple) {
      const { onMouseEnter, onMouseLeave } = otherProps;
      const { height } = (style || {}) as CSSProperties;
      const tags = (
        <Animate
          component="ul"
          componentProps={{
            ref: this.saveTagContainer,
            onScroll: stopPropagation,
            onMouseEnter,
            onMouseLeave,
            style:
              height && height !== 'auto' ? { height: pxToRem(toPx(height)! - 2) } : undefined,
          }}
          transitionName="zoom"
          exclusive
          onEnd={this.handleTagAnimateEnd}
          onEnter={this.handleTagAnimateEnter}
        >
          {this.renderMultipleValues()}
          {
            range
              ? this.renderRangeEditor(otherProps, wrap)
              : this.renderMultipleEditor({
                ...otherProps,
                className: `${prefixCls}-multiple-input`,
              } as T, wrap)
          }
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
          {this.renderRangeEditor(otherProps, wrap)}
        </span>
      );
    }
    const value = this.getValue();
    const text = this.getTextNode(value);
    const maxLength = this.getProp('maxLength');
    const inputLength = value ? value.length : 0;
    const lengthElement = this.renderLengthInfo(maxLength, inputLength);
    const finalText = (renderedValue ? this.renderedTextContent : isString(text) ? text : isNumber(text) ? String(text) : isArrayLike(text) && flattenDeep(text).filter(v => !isBoolean(v)).join('')) || '';
    const placeholder = this.hasFloatLabel || renderedValue ? undefined : this.getPlaceholders()[0];
    if ((!this.isFocused || !this.editable) && isValidElement(text)) {
      otherProps.style = {
        ...otherProps.style,
        textIndent: -1000,
      };
    }
    // 筛选条默认宽度处理
    if (isFlat) {
      const width = !isNil(value) ? measureTextWidth(finalText) + (suffixCls !== 'input' ? 37 : 21) : measureTextWidth(placeholder || '') + 24;
      otherProps.style = {
        ...otherProps.style,
        width,
      };
    }

    // 存在长度信息，计算paddingRight
    if (lengthElement) {
      this.lengthInfoWidth = measureTextWidth(`${inputLength} / ${maxLength}`);
      const paddingRight = this.lengthInfoWidth + 21;
      otherProps.style = {
        ...otherProps.style,
        paddingRight,
      };
    }

    return wrap(
      <>
        <input
          key="text"
          {...otherProps}
          placeholder={placeholder}
          value={renderedValue && !(this.isFocused && this.editable) ? '' : finalText}
          readOnly={!this.editable}
        />
        {lengthElement}
      </>,
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
    const { prefixCls, clearButton } = this;
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
    const classString = classNames(`${prefixCls}-suffix`, {
      [`${prefixCls}-allow-clear`]: clearButton && !props?.onClick,
    });
    return (
      <div className={classString} style={{ right: this.lengthInfoWidth }} onMouseDown={preventDefault} {...props}>
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

  renderRenderedValue(value?: any, props?: RenderedTextProps & { key?: Key }): ReactNode {
    const { prefixCls, range, multiple } = this;
    const noRangeValue = isNil(value);
    if ((!range && !multiple) || !noRangeValue) {
      const hidden = this.isFocused && this.editable;
      if (!hidden || isReactChildren(this.processValue(noRangeValue ? this.getValue() : value))) {
        const text = this.processRenderer(noRangeValue ? this.getValue() : value);
        if (isReactChildren(text)) {
          return (
            <RenderedText
              key="renderedText"
              prefixCls={prefixCls}
              onContentChange={noRangeValue ? this.handleRenderedValueChange : undefined}
              hidden={hidden}
              {...props}
            >
              {toJS(text)}
            </RenderedText>
          );
        }
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
      clearButton,
      prefixCls,
    } = this;
    if (clearButton) {
      return this.wrapperInnerSpanButton(
        <Icon
          type="close"
          onClick={this.handleClearButtonClick}
          onMouseDown={this.handleInnerButtonMouseDown}
        />,
        {
          className: `${prefixCls}-clear-button`,
          style: { right: this.lengthInfoWidth },
        },
      );
    }
  }

  wrapperInnerSpanButton(children: ReactNode, props: any = {}): ReactNode {
    const { prefixCls } = this;
    const { className, ...otherProps } = props;
    return (
      <div
        key="inner-button"
        {...otherProps}
        className={classNames(`${prefixCls}-inner-button`, className)}
      >
        {children}
      </div>
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
    if (!this.disabled && !this.readOnly) {
      if (e.keyCode === KeyCode.TAB) {
        const { _inTable } = this.props;
        if (_inTable) {
          if (e.shiftKey) {
            const { addonBeforeRef } = this;
            if (addonBeforeRef) {
              const focusableElement = findFirstFocusableElement(addonBeforeRef);
              if (focusableElement) {
                focusableElement.focus();
                e.preventDefault();
              }
            }
          } else {
            const { addonAfterRef } = this;
            if (addonAfterRef) {
              const focusableElement = findFirstFocusableElement(addonAfterRef);
              if (focusableElement) {
                focusableElement.focus();
                e.preventDefault();
              }
            }
          }
        }
        const { range } = this;
        if (range) {
          if (e.shiftKey) {
            if (this.rangeTarget === 1) {
              this.setRangeTarget(0);
              e.preventDefault();
            }
          } else if (this.rangeTarget === 0) {
            this.setRangeTarget(1);
            e.preventDefault();
          }
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
      } else {
        const { clearButton } = this.props;
        if (clearButton && !this.editable) {
          switch (e.keyCode) {
            case KeyCode.DELETE:
            case KeyCode.BACKSPACE:
              this.clear();
              break;
            default:
          }
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
      if (!this.disabled) {
        e.preventDefault();
      }
      if (!this.isFocused) {
        this.focus();
      }
    }
  }

  @autobind
  handleClearButtonClick(e) {
    e.preventDefault();
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

  @autobind
  handleInnerButtonMouseDown(e) {
    if (!this.isFocus) {
      e.stopPropagation();
    }
  }

  @action
  setValue(value: any): void {
    super.setValue(value);
    this.setText(undefined);
  }

  getTextNode(value?: any) {
    return this.text === undefined ? super.getTextNode(value) : this.text;
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
      const pattern = restrict instanceof RegExp ? restrict : new RegExp(`[^${restrict}]+`, 'g');
      return value.replace(pattern, '');
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
