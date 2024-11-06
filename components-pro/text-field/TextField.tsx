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
import { DebouncedFunc, DebounceSettings, isFunction } from 'lodash';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isRegExp from 'lodash/isRegExp';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { action, computed, observable, runInAction, toJS, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import { global } from 'choerodon-ui/shared';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Tooltip as TextTooltip, WaitType, FieldFocusMode } from '../core/enum';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import isIE from '../_util/isIE';
import isMobile from '../_util/isMobile';
import Icon from '../icon';
import { preventDefault, stopPropagation } from '../_util/EventManager';
import measureTextWidth from '../_util/measureTextWidth';
import Animate from '../animate';
import { GroupItemCategory, ValueChangeAction } from './enum';
import { ShowHelp } from '../field/enum';
import Record from '../data-set/Record';
import { FieldFormat } from '../data-set/enum';
import { LabelLayout } from '../form/interface';
import { getProperty } from '../form/utils';
import RenderedText, { RenderedTextProps } from './RenderedText';
import isReactChildren from '../_util/isReactChildren';
import TextFieldGroup from './TextFieldGroup';
import { findFirstFocusableElement } from '../_util/focusable';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import { toRangeValue } from '../field/utils';
import { TooltipProps } from '../tooltip/Tooltip';

const defaultWrap: (node: ReactElement) => ReactElement = node => node;

export function isPlaceHolderSupport(): boolean {
  if (global.PLACEHOLDER_SUPPORT !== undefined) {
    return global.PLACEHOLDER_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    const support = 'placeholder' in document.createElement('input');
    global.PLACEHOLDER_SUPPORT = support;
    return support;
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
  /**
   * 是否显示边框
   * @default true
   */
  border?: boolean;
  /**
   * 用tooltip显示输入框内容（禁用模式下生效）
   * 可选值：`none` `always` `overflow` 或自定义 tooltip
   * 配置自定义tooltip属性：tooltip={['always', { theme: 'light', ... }]}
   */
  tooltip?: TextTooltip | [TextTooltip, TooltipProps];
}

export class TextField<T extends TextFieldProps> extends FormField<T> {
  static displayName = 'TextField';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'input',
    clearButton: false,
    multiple: false,
    border: true,
    waitType: WaitType.debounce,
  };

  @observable text?: string;

  type = 'text';

  renderedValue: ReactNode;

  tagContainer: HTMLUListElement | null;

  handleChangeWait: DebouncedFunc<(...value: any[]) => void>;

  addonAfterRef?: HTMLDivElement | null;

  addonBeforeRef?: HTMLDivElement | null;

  @observable suffixRef?: HTMLDivElement | null;

  @observable renderedText?: {
    text: string;
    width: number;
  } | undefined;

  @observable renderedStartText?: {
    text: string;
    width: number;
  } | undefined;

  @observable renderedEndText?: {
    text: string;
    width: number;
  } | undefined;

  prefixWidth?: number;

  lengthElement?: ReactNode;

  lengthInfoWidth?: number;

  suffixWidth?: number;

  isSuffixClick?: boolean;

  lastAnimationRecord?: Record;

  get clearButton(): boolean {
    const { clearButton } = this.props;
    return !!clearButton && !this.readOnly && !this.disabled;
  }

  /**
   * 是否显示长度信息
   */
  @computed
  get valueChangeAction(): ValueChangeAction | undefined {
    if ('valueChangeAction' in this.props) {
      return this.props.valueChangeAction;
    }
    return this.getContextConfig('valueChangeAction');
  }

  @computed
  get showLengthInfo(): boolean | undefined {
    if ('showLengthInfo' in this.props) {
      return this.props.showLengthInfo;
    }
    return this.getContextConfig('showLengthInfo');
  }

  @computed
  get showHelp(): ShowHelp {
    const { showHelp } = this.observableProps;
    if (isString(showHelp)) {
      return showHelp as ShowHelp;
    }
    return this.context.showHelp || this.getContextConfig('showHelp') || ShowHelp.newLine;
  }

  get border(): boolean | undefined {
    return this.props.border;
  }

  constructor(props, context) {
    super(props, context);
    this.handleChangeWait = this.getHandleChange(props);
  }

  @autobind
  @action
  handleRenderedValueChange(text: string, width: number, rangeTarget?: 0 | 1) {
    switch (rangeTarget) {
      case 0: {
        this.renderedStartText = {
          text,
          width,
        };
        break;
      }
      case 1: {
        this.renderedEndText = {
          text,
          width,
        };
        break;
      }
      default: {
        this.renderedText = {
          text,
          width,
        };
      }
    }
  }

  clearRenderedText(rangeTarget?: 0 | 1) {
    switch (rangeTarget) {
      case 0: {
        if (this.renderedStartText) {
          runInAction(() => {
            this.renderedStartText = undefined;
          });
        }
        break;
      }
      case 1: {
        if (this.renderedEndText) {
          runInAction(() => {
            this.renderedEndText = undefined;
          });
        }
        break;
      }
      default: {
        if (this.renderedText) {
          runInAction(() => {
            this.renderedText = undefined;
          });
        }
      }
    }
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

  saveSuffixRef(node) {
    return node;
  }

  measureTextWidth(text: string): number {
    const element = this.element && this.element.element ?
      this.element.element : this.element;
    const computedStyle: CSSStyleDeclaration | undefined =
      element ?
        getComputedStyle(element) :
        undefined;
    return measureTextWidth(text, computedStyle);
  }

  getEditorTextInfo(rangeTarget?: 0 | 1): { text: string; width: number; placeholder?: string } {
    const { isFlat } = this.props;
    const [startPlaceHolder, endPlaceHolder = startPlaceHolder] = this.hasFloatLabel && !this.isFocused ? [] : this.getPlaceholders();
    const { text } = this;
    if (rangeTarget === undefined) {
      if (text !== undefined) {
        return {
          text,
          width: isFlat ? this.measureTextWidth(text) : 0,
        };
      }
      const { renderedText } = this;
      if (renderedText) {
        if (renderedText.text) {
          return renderedText;
        }
      } else {
        const unRenderedText = this.getTextNode(this.getValue());
        const processedText = isNumber(unRenderedText) ? String(unRenderedText) : unRenderedText;
        if (isString(processedText) && processedText.length) {
          return {
            text: processedText,
            width: isFlat ? this.measureTextWidth(processedText) : 0,
          };
        }
      }
      if (startPlaceHolder) {
        return {
          text: '',
          width: isFlat ? this.measureTextWidth(startPlaceHolder) : 0,
          placeholder: startPlaceHolder,
        };
      }
      return {
        text: '',
        width: 0,
      };
    }
    const [startValue, endValue] = this.processRangeValue(this.isEditableLike() ? undefined : this.rangeValue);
    if (rangeTarget === 0) {
      const { renderedStartText } = this;
      if (renderedStartText) {
        if (renderedStartText.text) {
          return renderedStartText;
        }
      } else {
        const unRenderedStartText = this.getTextByValue(startValue);
        const startText = isNumber(unRenderedStartText) ? String(unRenderedStartText) : unRenderedStartText;
        if (isString(startText) && startText.length) {
          return {
            text: startText,
            width: isFlat ? this.measureTextWidth(startText) : 0,
          };
        }
      }
      if (!isNil(startPlaceHolder) || !isNil(text)) {
        const width = !isNil(text) ? this.measureTextWidth(text) : !isNil(startPlaceHolder) ? this.measureTextWidth(startPlaceHolder) : 0;
        return {
          text: '',
          width: isFlat ? width : 0,
          placeholder: isNil(text) ? startPlaceHolder : undefined,
        };
      }
    }
    if (rangeTarget === 1) {
      const { renderedEndText } = this;
      if (renderedEndText) {
        if (renderedEndText.text) {
          return renderedEndText;
        }
      } else {
        const unRenderedEndText = this.getTextByValue(endValue);
        const endText = isNumber(unRenderedEndText) ? String(unRenderedEndText) : unRenderedEndText;
        if (isString(endText) && endText.length) {
          return {
            text: endText,
            width: isFlat ? this.measureTextWidth(endText) : 0,
          };
        }
      }
      if (!isNil(endPlaceHolder) || !isNil(text)) {
        const width = !isNil(text) ? this.measureTextWidth(text) : !isNil(endPlaceHolder) ? this.measureTextWidth(endPlaceHolder) : 0;
        return {
          text: '',
          width: isFlat ? width : 0,
          placeholder: isNil(text) ? endPlaceHolder : undefined,
        };
      }
    }
    return {
      text: '',
      width: 0,
    };
  }

  isRenderEmpty() {
    if (!this.multiple) {
      return this.range ? isEmpty(this.getEditorTextInfo(0).text) && isEmpty(this.getEditorTextInfo(1).text) : isEmpty(this.getEditorTextInfo().text);
    }
    return true;
  }

  isEmpty() {
    return (this.isEditableLike() || isEmpty(this.text)) && super.isEmpty() && this.isRenderEmpty();
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
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
      'border',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.type = this.type;
    otherProps.maxLength = this.getProp('maxLength');
    otherProps.onKeyDown = this.handleKeyDown;
    otherProps.autoComplete = this.props.autoComplete || this.getContextConfig('textFieldAutoComplete') || 'off';
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
  handleMultipleMouseEnter(e) {
    const { onMouseEnter } = this.getOtherProps();
    const { overMaxTagCountTooltip } = this.props;
    // 禁用时 ViewComponent 会在 wrapper 层触发 mouseEnter
    if (!this.disabled && onMouseEnter) {
      onMouseEnter(e);
    }
    if (overMaxTagCountTooltip) {
      const title = isFunction(overMaxTagCountTooltip) ? overMaxTagCountTooltip({ title: this.getMultipleText(), record: this.record }) : this.getMultipleText();
      show(e.currentTarget, {
        title,
      });
      this.tooltipShown = true;
    }
  }

  @autobind
  handleMultipleMouseLeave() {
    const { onMouseLeave } = this.getOtherProps();
    // 禁用时 ViewComponent 会在 wrapper 层触发 mouseLeave
    if (!this.disabled && onMouseLeave) {
      onMouseLeave();
    }
    this.handleHelpMouseLeave();
  }

  @autobind
  handleHelpMouseEnter(e) {
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    const { helpTooltipProps } = this;
    let helpTooltipCls = `${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`;
    if (helpTooltipProps && helpTooltipProps.popupClassName) {
      helpTooltipCls = helpTooltipCls.concat(' ', helpTooltipProps.popupClassName)
    }
    show(e.currentTarget, {
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
      title: this.getDisplayProp('help'),
      ...helpTooltipProps,
      popupClassName: helpTooltipCls,
    });
    this.tooltipShown = true;
  }

  @autobind
  handleHelpMouseLeave() {
    if (this.tooltipShown) {
      hide();
      this.tooltipShown = false;
    }
  }

  getWrapperClassNames(...args): string {
    const { prefixCls, multiple, range, border } = this;
    const suffix = this.getSuffix();
    const prefix = this.getPrefix();
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-suffix-button`]: isValidElement<{ onClick }>(suffix),
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-range`]: range,
        [`${prefixCls}-border`]: border,
        [`${prefixCls}-prefix-button`]: isValidElement<{ onClick }>(prefix),
      },
      ...args,
    );
  }

  renderWrapper(): ReactNode {
    return this.renderGroup();
  }

  getRenderedValue(): ReactNode {
    if (this.range) {
      return this.renderRangeValue(toRangeValue(this.getValue(), this.range));
    }
    return this.processRenderer(this.getValue());
  }

  showTooltip(e): boolean {
    if (super.showTooltip(e)) {
      return true;
    }
    const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const { tooltip: inputTooltip } = this.props;
    const disabledTooltip =  getTooltip('text-field-disabled');
    const { element, renderedValue } = this;
    const title = this.getRenderedValue();
    const judgeOverflowElement = renderedValue ? element.parentNode.previousElementSibling : element;
    const tooltip = this.disabled ? disabledTooltip : inputTooltip;
    const tooltipPlacement = this.disabled ? getTooltipPlacement('text-field-disabled') : getTooltipPlacement('output');
    const tooltipTheme = this.disabled ? getTooltipTheme('text-field-disabled') : getTooltipTheme('output');
    if (judgeOverflowElement && !this.multiple && title) {
      if (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(judgeOverflowElement))) {
        show(judgeOverflowElement, {
          title,
          placement: tooltipPlacement || 'right',
          theme: tooltipTheme,
        });
        return true;
      }
      if (isArrayLike(tooltip)) {
        const tooltipType = tooltip[0];
        const TextTooltipProps = tooltip[1] || {};
        const { mouseEnterDelay } = TextTooltipProps;
        if (tooltipType === TextTooltip.always || (tooltipType === TextTooltip.overflow && isOverflow(judgeOverflowElement))) {
          show(judgeOverflowElement, {
            title: TextTooltipProps.title ? TextTooltipProps.title : title,
            placement: tooltipPlacement || 'right',
            theme: tooltipTheme,
            ...TextTooltipProps,
          }, mouseEnterDelay);
          return true;
        }
      }
    }
    return false;
  }

  renderInputElement(): ReactNode {
    const { addonBefore, addonAfter, isFlat } = this.props;
    const renderedValue = this.renderRenderedValue(undefined, { isFlat });
    this.renderedValue = renderedValue;
    // 先计算lengthElement,然后计算suffix,再计算clearButton,设置right和输入框paddingRight,避免重叠
    this.renderLengthElement();
    const suffix = this.getSuffix();
    const button = this.getInnerSpanButton();
    const prefix = this.getPrefix();

    const input = this.getWrappedEditor(renderedValue);
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
    const ZIndexOfIEProps: { style: CSSProperties } | {} = isIE() ? { style: { zIndex: 'auto' } } : {};

    const element = (
      <span key="element" {...wrapperProps}>
        {multipleHolder}
        {otherPrevNode}
        {placeholderDiv}
        {renderedValue}
        <label
          {...ZIndexOfIEProps}
          onMouseDown={this.handleMouseDown}
          onClick={this.handleClick}
        >
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
      showHelp,
      prefixCls,
      props: { addonBefore, addonAfter, addonBeforeStyle, addonAfterStyle, groupClassName, _inTable, onBlur, tabIndex },
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
    const help = this.getDisplayProp('help');
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
    const { prefixCls } = this;
    return maxLength && maxLength > 0 ? (
      <div key="length-info" className={`${prefixCls}-length-info`}>{`${inputLength}/${maxLength}`}</div>
    ) : null;
  }

  // 处理 form 中的 labelLayout 为 placeholder 情况避免以前 placeholder 和 label 无法区分彼此。
  getPlaceholders(): string[] {
    const { dataSet, record, props, labelLayout } = this;
    const placeholderOrigin = this.getProp('placeholder');
    let placeholder = placeholderOrigin;
    if (labelLayout === LabelLayout.placeholder) {
      const label = getProperty(props, 'label', dataSet, record);
      placeholder = label && !this.isFocused ? label : placeholderOrigin || label;
    }
    const holders: string[] = [];
    return placeholder ? holders.concat(toJS(placeholder)) : holders;
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
      this.prepareSetValue(this.text || this.emptyValue);
      this.setText();
    }
    super.setRangeTarget(target);
    defer(() => this.isFocused && this.select());
  }

  renderRangeEditor(props) {
    const { isFlat } = this.props;
    const { prefixCls, rangeTarget, isFocused, editable } = this;
    const [startValue = '', endValue = ''] = this.processRangeValue(this.isEditableLike() ? undefined : this.rangeValue);
    const startRenderedValue = this.renderRenderedValue(startValue, {
      key: 'startRenderedText',
      className: `${prefixCls}-range-start-rendered-value`,
      rangeTarget: 0,
      isFlat,
    });
    const startStyle: CSSProperties = {};
    const endStyle: CSSProperties = {};
    const endRenderedValue = this.renderRenderedValue(endValue, {
      key: 'endRenderedText',
      className: `${prefixCls}-range-end-rendered-value`,
      rangeTarget: 1,
      isFlat,
    });
    const { text: startText, placeholder: startPlaceholder, width: startWidth } = this.getEditorTextInfo(0);
    const { text: endText, placeholder: endPlaceholder, width: endWidth } = this.getEditorTextInfo(1);
    const editorStyle = {} as CSSProperties;
    if (rangeTarget === 1) {
      editorStyle.right = 0;
    } else {
      editorStyle.left = 0;
    }
    if (!editable) {
      editorStyle.textIndent = -100000;
      editorStyle.color = 'transparent';
    }
    // 筛选条默认宽度处理
    const addWidth = 4 + (this.isFocused && ((rangeTarget === 0 && startText) || (rangeTarget === 1 && endText)) ? 4 : 0);
    if (isFlat) {
      startStyle.width = startWidth + addWidth;
      startStyle.boxSizing = 'content-box';
      endStyle.width = endWidth + addWidth;
      endStyle.boxSizing = 'content-box';
      editorStyle.width = (
        !isNil(rangeTarget)
          ? rangeTarget === 0 ? startWidth + addWidth : endWidth + addWidth
          : undefined);
      editorStyle.boxSizing = !isNil(rangeTarget) ? 'content-box' : undefined;
    }
    if (startRenderedValue && (!editable || !isFocused)) {
      startStyle.textIndent = -100000;
      startStyle.color = 'transparent';
    }
    if (endRenderedValue && (!editable || !isFocused)) {
      endStyle.textIndent = -100000;
      endStyle.color = 'transparent';
    }
    const splitClassNames = classNames(`${prefixCls}-range-split`, {
      [`${prefixCls}-range-split-custom`]: this.rangeSeparator !== '~',
    });
    return (
      <span key="text" className={`${prefixCls}-range-text`}>
        {startRenderedValue}
        {endRenderedValue}
        {
          !this.disabled && (
            <input
              {...props}
              className={this.getInputClassString(`${prefixCls}-range-input`)}
              key="text"
              value={this.getRangeInputValue(startText, endText)}
              placeholder={
                !editable || rangeTarget === undefined || !this.isFocused
                  ? '' : rangeTarget === 0 ? startPlaceholder : endPlaceholder
              }
              readOnly={!editable}
              style={editorStyle}
            />
          )
        }
        <input
          tabIndex={-1}
          className={`${prefixCls}-range-start`}
          onChange={noop}
          onMouseDown={this.handleRangeStart}
          value={editable && rangeTarget === 0 && isFocused ? '' : startText}
          placeholder={editable && rangeTarget === 0 && isFocused ? '' : startPlaceholder}
          disabled={props.disabled === undefined ? false : props.disabled}
          style={startStyle}
          readOnly
        />
        <span className={splitClassNames}>{(!isFlat || startPlaceholder || endPlaceholder || !this.isEmpty()) && this.rangeSeparator}</span>
        <input
          tabIndex={-1}
          className={`${prefixCls}-range-end`}
          onChange={noop}
          onMouseDown={this.handleRangeEnd}
          value={editable && rangeTarget === 1 && isFocused ? '' : endText}
          placeholder={editable && rangeTarget === 1 && isFocused ? '' : endPlaceholder}
          disabled={props.disabled === undefined ? false : props.disabled}
          style={endStyle}
          readOnly
        />
      </span>
    );
  }

  getRangeInputValue(startText: string, endText: string): string {
    const { rangeTarget, text } = this;
    return (
      rangeTarget === undefined || !this.isFocused
        ? '' : text === undefined ? rangeTarget === 0 ? startText : endText : text
    );
  }

  getInputClassString(className: string): string {
    return className;
  }

  renderMultipleEditor(props: T) {
    const { text } = this;
    const editorStyle = {} as CSSProperties;
    if (!this.editable) {
      editorStyle.position = 'absolute';
      editorStyle.left = 0;
      editorStyle.top = 0;
      editorStyle.zIndex = -1;
      props.readOnly = true;
    } else if (text) {
      editorStyle.width = pxToRem(this.measureTextWidth(text), true)!;
    }
    return (
      <li key="text">
        <input {...(props as object)} value={text || ''} style={editorStyle} />
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
  getMultipleWrap(wrap: (node: ReactNode) => ReactNode): ReactNode {
    const {
      prefixCls,
      range,
      props: { isFlat },
    } = this;
    const {
      onFocus,
      onBlur,
      onMouseEnter: propsOnMouseEnter,
      onMouseLeave: propsOnMouseLeave,
      onMouseDown,
      onMouseUp,
      onClick,
      onDoubleClick,
      onContextMenu,
      ...otherProps
    } = this.getOtherProps();
    // 禁用时 ViewComponent 会在 wrapper 层触发 mouseEnter & mouseLeave
    const onMouseEnter = this.disabled ? noop : propsOnMouseEnter;
    const onMouseLeave = this.disabled ? noop : propsOnMouseLeave;
    const { record } = this;
    const { tags: multipleTags, isOverflowMaxTagCount } = this.renderMultipleValues();
    const isOverflow = isOverflowMaxTagCount || isFlat;
    const eventsProps = !this.disabled ? {
      onMouseDown,
      onMouseUp,
      onClick,
      onDoubleClick,
      onContextMenu,
    } : undefined;
    const tags = (
      <Animate
        component="ul"
        componentProps={{
          ref: this.saveTagContainer,
          onScroll: stopPropagation,
        }}
        transitionName={!record || record === this.lastAnimationRecord ? 'zoom' : ''}
        exclusive
        onEnd={this.handleTagAnimateEnd}
        onEnter={this.handleTagAnimateEnter}
      >
        {multipleTags}
        {
          range
            ? this.renderRangeEditor(otherProps)
            : this.renderMultipleEditor({
              ...otherProps,
              className: `${prefixCls}-multiple-input`,
            } as T)
        }
      </Animate>
    );
    this.lastAnimationRecord = record;
    this.setInputStylePadding(otherProps);
    return wrap(
      <div
        key="text"
        className={otherProps.className}
        style={otherProps.style}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={isOverflow ? this.handleMultipleMouseEnter : onMouseEnter}
        onMouseLeave={isOverflow ? this.handleMultipleMouseLeave : onMouseLeave}
        {...eventsProps}
      >
        {tags}
      </div>,
    );
  }

  @autobind
  getEditor(wrap: (node: ReactNode) => ReactNode, renderedValue?: ReactNode): ReactNode {
    const {
      multiple,
      range,
      props: { isFlat },
    } = this;
    const {
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...otherProps
    } = this.getOtherProps();
    if (multiple) {
      return this.getMultipleWrap(wrap);
    }
    if (range) {
      return wrap(
        <span
          key="text"
          className={otherProps.className}
          style={otherProps.style}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {this.renderRangeEditor(otherProps)}
        </span>,
      );
    }
    const editorTextInfo = this.getEditorTextInfo();
    if (renderedValue && (!this.editable || !this.isFocused)) {
      otherProps.style = {
        ...otherProps.style,
        textIndent: -100000,
        color: 'transparent',
      };
    }
    // 筛选条默认宽度处理
    if (isFlat) {
      otherProps.style = {
        ...otherProps.style,
        width: editorTextInfo.width + 4,
        boxSizing: 'content-box',
      };
    }

    // 兼容继承的组件
    if (this.showLengthInfo && !this.lengthElement) {
      this.renderLengthElement();
    }

    otherProps.className = this.getInputClassString(otherProps.className);

    this.setInputStylePadding(otherProps);
    const childNodes: ReactNode[] = [
      <input
        key="text"
        {...otherProps}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        placeholder={editorTextInfo.placeholder}
        value={editorTextInfo.text}
        readOnly={!this.editable}
      />,
    ];
    if (this.showLengthInfo && this.lengthElement) {
      childNodes.push(this.lengthElement);
    }

    return wrap(
      <>
        {childNodes}
      </>,
    );
  }

  getSuffixWidth() {
    let wrapperWidth = 0;
    if (this.suffixRef) {
      wrapperWidth = this.suffixRef.getBoundingClientRect().width;
    }
    return this.suffixWidth ? Math.max(this.suffixWidth, wrapperWidth): this.suffixWidth;
  }

  setInputStylePadding(otherProps: any): void {
    // 存在lengthInfo, 或suffix, 或clearButton, 计算paddingRight
    if (this.lengthInfoWidth || this.getSuffixWidth() || this.clearButton) {
      let paddingRight = this.isSuffixClick
        ? defaultTo(this.lengthInfoWidth, 0) + defaultTo(this.getSuffixWidth(), 0) + (this.clearButton ? toPx('0.18rem')! : 0)
        : defaultTo(this.lengthInfoWidth, 0) + Math.max(defaultTo(this.getSuffixWidth(), 0), (this.clearButton ? toPx('0.18rem')! : 0));
      if (this.lengthInfoWidth && !this.getSuffixWidth() && !this.clearButton) {
        paddingRight += toPx('0.03rem')!;
      }
      if (paddingRight >= toPx('0.25rem')!) {
        const pr = `${Number(pxToRem(paddingRight + 2, true)?.split('rem')[0]).toFixed(3)}rem`;
        otherProps.style = {
          ...otherProps.style,
          paddingRight: pr,
        };
      }
    }
    if (this.prefixWidth && this.prefixWidth > toPx('0.24rem')!) {
      otherProps.style = {
        ...otherProps.style,
        paddingLeft: pxToRem(this.prefixWidth + toPx('0.02rem')!, true),
      };
    }
  }

  renderLengthElement(): void {
    const { multiple, range, showLengthInfo } = this;
    if (!multiple && !range && showLengthInfo) {
      const editorTextInfo = this.getEditorTextInfo();
      const inputLength = editorTextInfo.text.length;
      const maxLength = this.getProp('maxLength');
      this.lengthElement = this.renderLengthInfo(maxLength, inputLength);

      if (this.lengthElement) {
        this.lengthInfoWidth = this.measureTextWidth(`${inputLength} / ${maxLength}`);
      } else {
        this.lengthInfoWidth = undefined;
      }
    } else {
      this.lengthElement = undefined;
      this.lengthInfoWidth = undefined;
    }
  }

  getSuffix(): ReactNode {
    const { suffix = this.getDefaultSuffix() } = this.props;
    if (suffix) {
      return this.wrapperSuffix(suffix);
    }
    this.suffixWidth = undefined;
  }

  getDefaultSuffix(): ReactNode {
    return undefined;
  }

  @action
  wrapperSuffix(children: ReactNode, props?: any): ReactNode {
    const suffixEvents = ['MouseDown', 'MouseUp', 'Click', 'DoubleClick', 'ContextMenu'];
    const {
      prefixCls,
      clearButton,
      props: {
        onMouseDown,
        onMouseUp,
        onClick,
        onDoubleClick,
        onContextMenu,
      },
    } = this;
    let divStyle = {};
    if (isValidElement<any>(children)) {
      this.suffixWidth = toPx('0.21rem');
      if (children.props && children.props.style) {
        divStyle = {
          width: children.props.style.width,
        };
        this.suffixWidth = defaultTo(toPx(children.props.style.width), toPx('0.21rem'));
      }
      const { type } = children;
      const { onClick, ...otherProps } = children.props;
      if (onClick) {
        children = createElement(type, otherProps);
        props = {
          onClick,
          ...props,
        };
      }
    } else if (children && children !== true) {
      this.suffixWidth = this.measureTextWidth(children.toString()) + toPx('0.02rem')!;
      divStyle = {
        width: pxToRem(this.getSuffixWidth(), true),
      };
    } else {
      this.suffixWidth = undefined;
    }

    const isSuffixClick = props && props.onClick;
    this.isSuffixClick = isSuffixClick;
    const classString = classNames(`${prefixCls}-suffix`, {
      [`${prefixCls}-allow-clear`]: clearButton && !isSuffixClick,
    });
    const right = pxToRem(this.lengthInfoWidth ? this.lengthInfoWidth + toPx('0.03rem')! : undefined, true);
    const eventsProps = {
      onMouseDown,
      onMouseUp,
      onClick,
      onDoubleClick,
      onContextMenu,
    };
    suffixEvents.forEach((evt: string) => {
      eventsProps[`on${evt}`] = (e: Event) => {
        if (`on${evt}` === 'onMouseDown') {
          preventDefault(e);
        }
        if (props && props[`on${evt}`]) {
          props[`on${evt}`](e);
        }
        if (this.element) {
          setTimeout(() => this.element.dispatchEvent(new MouseEvent(`${evt === 'DoubleClick' ? 'dblclick' : evt.toLowerCase()}`, { bubbles: true })));
        }
      };
    })
    return (
      <div
        className={classString}
        style={{ ...divStyle, right }}
        {...props}
        {...eventsProps}
        ref={this.saveSuffixRef}
      >
        {children}
      </div>
    );
  }

  getPrefix(): ReactNode {
    const { prefix } = this.props;
    let wrapperPrefixNode;
    if (prefix) {
      wrapperPrefixNode = this.wrapperPrefix(prefix);
    } else {
      this.prefixWidth = undefined;
    }
    runInAction(() => {
      if (this.prefixWidth && this.prefixWidth > toPx('0.24rem')!) {
        if (this.floatLabelOffsetX !== this.prefixWidth - toPx('0.24rem')!) {
          this.floatLabelOffsetX = this.prefixWidth - toPx('0.24rem')!;
        }
      } else if (this.floatLabelOffsetX !== undefined) {
        this.floatLabelOffsetX = undefined;
      }
    });
    return wrapperPrefixNode;
  }

  wrapperPrefix(children: ReactNode): ReactNode {
    const { prefixCls } = this;
    let divStyle = {};
    if (isValidElement<any>(children)) {
      this.prefixWidth = toPx('0.24rem')!;
      if (children.props && children.props.style) {
        divStyle = {
          width: children.props.style.width,
        };
        const calculateWidth = toPx(children.props.style.width);
        this.prefixWidth = calculateWidth != null ? calculateWidth : toPx('0.24rem')!;
      }
    } else if (children && children !== true) {
      this.prefixWidth = this.measureTextWidth(children.toString()) + toPx('0.04rem')!;
      divStyle = {
        width: pxToRem(this.prefixWidth > toPx('0.24rem')! ? this.prefixWidth : undefined, true),
      };
    } else {
      this.prefixWidth = undefined;
    }
    return <div className={`${prefixCls}-prefix`} style={{ ...divStyle }}>{children}</div>;
  }

  renderMultipleHolder() {
    const { name, multiple, props: { isFlat } } = this;
    let width: string | number = 'auto';
    if (isFlat) {
      const hasValue = !this.isEmpty();
      const placeholder = this.hasFloatLabel ? undefined : this.getPlaceholders()[0];
      width = hasValue ? 'auto' : this.measureTextWidth(placeholder || '') + toPx('0.22rem')! + (this.getSuffix() ? toPx('0.20rem')! : 0);
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
    if ((this.multiple || !isPlaceHolderSupport()) && (!this.hasFloatLabel || this.isFocused) && !this.range) {
      return this.getPlaceHolderNode();
    }
  }

  renderRenderedValue(value: any | undefined, props: RenderedTextProps & { key?: Key }): ReactNode {
    const { prefixCls, range, multiple } = this;
    const { rangeTarget } = props;
    const noRangeValue = rangeTarget === undefined;
    if ((!range && !multiple) || !noRangeValue) {
      const hidden = this.editable && this.isFocused;
      if (!hidden || isReactChildren(this.processValue(noRangeValue ? this.getValue() : value))) {
        const text = this.processRenderer(noRangeValue ? this.getValue() : value);
        if (isReactChildren(text)) {
          return (
            <RenderedText
              key="renderedText"
              prefixCls={prefixCls}
              onContentChange={this.handleRenderedValueChange}
              hidden={hidden}
              {...props}
            >
              {toJS(text)}
            </RenderedText>
          );
        }
      }
    }
    this.clearRenderedText(rangeTarget);
  }

  getPlaceHolderNode(): ReactNode {
    const { prefixCls } = this;
    const [placeholder] = this.getPlaceholders();
    if (placeholder) {
      let divStyle;
      if (this.prefixWidth && this.prefixWidth > toPx('0.24rem')!) {
        divStyle = {
          paddingLeft: pxToRem(this.prefixWidth + toPx('0.05rem')!, true),
        };
      }
      return (
        <div className={`${prefixCls}-placeholder`} style={{ ...divStyle }}>
          <span className={`${prefixCls}-placeholder-inner`}>{placeholder}</span>
        </div>
      );
    }
  }

  getInnerSpanButton(hidden?: boolean): ReactNode {
    if (hidden) return null; 
    const {
      clearButton,
      prefixCls,
    } = this;
    if (clearButton) {
      let right: number | undefined;
      if (this.lengthInfoWidth || this.getSuffixWidth()) {
        right = this.isSuffixClick
          ? defaultTo(this.lengthInfoWidth, 0) + defaultTo(this.getSuffixWidth(), 0)
          : this.lengthInfoWidth;
      }
      return this.wrapperInnerSpanButton(
        isMobile() && !this.isFocused
          ? null
          : <Icon
            type="close"
            onClick={this.handleClearButtonClick}
            onMouseDown={this.handleInnerButtonMouseDown}
          />,
        {
          className: `${prefixCls}-clear-button`,
          style: { right: pxToRem(right, true) },
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

  handleTagAnimateEnd() {
    // noop
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
  handleRangeStart(event) {
    // 进行切换的时候默认不会收起 popup 因为点击start的时候也会触发 trigger 的 handleClick
    // 导致在设置了 isClickToHide 的情况下回收起
    // handleRangeEnd 同理
    if (this.rangeTarget === 1 && this.isFocused) {
      event.preventDefault();
    }
    this.setRangeTarget(0);
  }

  @autobind
  handleRangeEnd(event) {
    if (this.rangeTarget === 0 && this.isFocused) {
      event.preventDefault();
    }
    this.setRangeTarget(1);
  }

  @autobind
  handleKeyDown(e) {
    if (!this.disabled && !this.readOnly) {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === KeyCode.C && this.format) {
        e.preventDefault();
        // 执行复制操作
        this.blur();
        const text = this.getValue();
        navigator.clipboard.writeText(text).then(() => {
          this.focus();
        }).catch(err => {
          this.focus();
          console.error('Failed to copy text: ', err);
        });
      }
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
  handleClick(e) {
    const { target, currentTarget } = e;
    if (target && currentTarget && currentTarget.contains(target as any)) {
      preventDefault(e);
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
      if (this.editable || this.isEditableLike()) {
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
  setValue(value: any, noVaidate?: boolean, reserveParam?: boolean, triggerHiddenDelay?: number): void {
    super.setValue(value, noVaidate);
    if (!reserveParam) {
      // 下拉框收起后再清除搜索值
      setTimeout(() => this.setText(undefined), triggerHiddenDelay);
    }
    if (this.tooltipShown) {
      hide();
      this.tooltipShown = false;
    }
  }

  getTextNode(value?: any) {
    return this.text === undefined || this.isEditableLike() ? super.getTextNode(value) : this.text;
  }

  @action
  setText(text?: string): void {
    this.text = text;
  }

  select() {
    const { element } = this;
    const fieldFocusMode = this.getContextConfig('fieldFocusMode');
    if (element && this.editable && fieldFocusMode === FieldFocusMode.checked) {
      element.select();
    }
  }

  getHandleChange(props): DebouncedFunc<(...value: any[]) => void> {
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
    const { valueChangeAction } = this;
    if (type === 'compositionend') {
      this.lock = false;
    }
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(restricted);
    if (!this.isFocus || (!this.lock && valueChangeAction === ValueChangeAction.input && this.isValidInput(restricted))) {
      this.handleChangeWait(restricted);
    }
  }

  restrictInput(value: string): string {
    const { restrict } = this.props;
    if (restrict && !this.lock) {
      const pattern = isRegExp(restrict) ? restrict : new RegExp(`[^${restrict}]+`, 'g');
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

  isValidInput(_input: string): boolean {
    return true;
  }
}

@observer
export default class ObserverTextField extends TextField<TextFieldProps> {
  static defaultProps = TextField.defaultProps;
}
