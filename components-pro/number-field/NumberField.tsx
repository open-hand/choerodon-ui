import React, { isValidElement, ReactNode } from 'react';
import { action, computed, isArrayLike, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import { BigNumber } from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import { BigNumberOptions } from 'choerodon-ui/dataset/math';
import { FormatNumberFuncOptions } from 'choerodon-ui/dataset/data-set/Field';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import keepRunning, { KeepRunningProps } from '../_util/keepRunning';
import Icon from '../icon';
import { getNearStepValues, parseNumber } from './utils';
import { ValidationMessages } from '../validator/Validator';
import isEmpty from '../_util/isEmpty';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import defaultFormatNumber from '../formatter/formatNumber';
import { Lang } from '../locale-context/enum';
import localeContext from '../locale-context/LocaleContext';
import { getNumberFormatOptions, getNumberFormatter, ProcessValueOptions } from '../field/utils';
import isMobile from '../_util/isMobile';

function getCurrentValidValue(value: string, options: BigNumberOptions): BigNumber.Value {
  const valueBig = new BigNumber(value.replace(/\.$/, ''));
  return math.isValidBigNumber(valueBig) ? options.strict ? valueBig : math.fix(valueBig) : 0;
}

function getStepUpGenerator() {
  return this.stepGenerator(true);
}

function getStepDownGenerator() {
  return this.stepGenerator(false);
}

function run(value: number) {
  const { element } = this;
  if (element) {
    element.value = String(value);
  }
}

function enabled() {
  return Boolean(this.getProp('step'));
}

const stepUpKeyboardProps: KeepRunningProps = {
  getStepGenerator: getStepUpGenerator,
  run,
  validator(target: EventTarget) {
    return target === this.element;
  },
  enabled,
};

const stepDownKeyboardProps: KeepRunningProps = {
  getStepGenerator: getStepDownGenerator,
  run,
  validator(target: EventTarget) {
    return target === this.element;
  },
  enabled,
};

const stepUpMouseProps: KeepRunningProps = {
  getStepGenerator: getStepUpGenerator,
  run,
  validator(target: EventTarget) {
    return target === this.plusElement;
  },
};

const stepDownMouseProps: KeepRunningProps = {
  getStepGenerator: getStepDownGenerator,
  run,
  validator(target: EventTarget) {
    return target === this.minusElement;
  },
};

export type FormatNumberFunc = (value: string, lang: string, options: Intl.NumberFormatOptions) => string;

export { FormatNumberFuncOptions };

export interface NumberFieldProps<V = number> extends TextFieldProps<V> {
  /**
   * 最小值
   */
  min?: BigNumber.Value | null;
  /**
   * 最大值
   */
  max?: BigNumber.Value | null;
  /**
   * 步距
   */
  step?: BigNumber.Value;
  /**
   * 非严格步距
   */
  nonStrictStep?: boolean;
  /**
   * 格式器
   */
  formatter?: FormatNumberFunc;
  /**
   * 格式器参数
   */
  formatterOptions?: FormatNumberFuncOptions;
  /**
   *是否长按按钮按步距增加
   */
  longPressPlus?: boolean;
  /**
   * 小数点精度
   */
  precision?: number;
  /**
   * 千分位分组显示
   */
  numberGrouping?: boolean;
  /**
   * 是否启用UP DOWN键盘事件
   */
  keyboard?: boolean;
  /**
   * @deprecated
   */
  stringMode?: boolean;
}

export class NumberField<T extends NumberFieldProps> extends TextField<T & NumberFieldProps> {
  static displayName = 'NumberField';

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'input-number',
    longPressPlus: true,
    max: Infinity,
    min: -Infinity,
  };

  static format = defaultFormatNumber;

  /**
   * @deprecated
   */
  static bigNumberFormat = defaultFormatNumber;

  plusElement?: HTMLDivElement | null;

  minusElement?: HTMLDivElement | null;

  @computed
  get lang(): Lang {
    const { lang } = this.observableProps;
    if (lang) {
      return lang;
    }
    const { dataSet } = this;
    if (dataSet && dataSet.lang) {
      return dataSet.lang;
    }
    const { numberFormatLanguage, locale } = localeContext;
    if (numberFormatLanguage) {
      return numberFormatLanguage;
    }
    return locale.lang;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('NumberField', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
    };
  }

  get strict() {
    const { field } = this;
    return field ? field.get('type', this.record) === FieldType.bigNumber : false;
  }

  @computed
  get allowDecimal(): boolean {
    const { min, nonStrictStep } = this;
    const precision = this.getProp('precision');
    if (precision === 0) {
      return false;
    }
    // 非严格步距下允许输入小数
    if (nonStrictStep) {
      return true;
    }
    const step = this.getProp('step');
    return !step || !math.eq(math.mod(step, 1), 0) || (!!min && !math.eq(math.mod(min, 1), 0));
  }

  @computed
  get nonStrictStep(): boolean {
    const nonStrictStep = this.getProp('nonStrictStep');
    if (nonStrictStep !== undefined) {
      return nonStrictStep;
    }
    const numberFieldNonStrictStep = this.getContextConfig('numberFieldNonStrictStep');
    if (numberFieldNonStrictStep !== undefined) {
      return numberFieldNonStrictStep;
    }
    return false;
  }

  @computed
  get allowNegative(): boolean {
    const { min } = this;
    return isNil(min) || min < 0;
  }

  @computed
  get min(): BigNumber.Value | undefined | null {
    return this.getLimit('min');
  }

  @computed
  get max(): BigNumber.Value | undefined | null {
    return this.getLimit('max');
  }

  @computed
  get value(): any | undefined {
    const { value } = this.observableProps;
    if (isArrayLike(value)) {
      return value;
    }
    const { range } = this;
    if (isArrayLike(range)) {
      if (isPlainObject(value)) {
        const [start, end] = range;
        return {
          [start]: value[start],
          [end]: value[end],
        };
      }
    }
    return value;
  }

  set value(value: any | undefined) {
    runInAction(() => {
      this.observableProps.value = value;
    });
  }

  get clearButton(): boolean {
    const step = this.getProp('step');
    if (step) {
      return false;
    }
    return super.clearButton;
  }

  get keyboard(): boolean {
    if ('keyboard' in this.props) {
      return this.props.keyboard!;
    }
    return this.getContextConfig('numberFieldKeyboard') !== false;
  }

  @autobind
  savePlusRef(ref) {
    this.plusElement = ref;
  }

  @autobind
  saveMinusRef(ref) {
    this.minusElement = ref;
  }

  isLowerRange(value1: number | string, value2: number | string): boolean {
    return math.lt(value1, value2);
  }

  getFieldType(): FieldType {
    return FieldType.number;
  }

  getLimit(type: string): BigNumber | number | string | undefined | null {
    const { record } = this;
    const limit = this.getProp(type);
    if (record && isString(limit)) {
      const num = record.get(limit);
      if (num !== undefined) {
        return num;
      }
    }
    return limit;
  }

  getValidatorProp(key: string) {
    if (['maxLength', 'minLength'].includes(key)) {
      return;
    }
    switch (key) {
      case 'min':
        return this.min;
      case 'max':
        return this.max;
      case 'nonStrictStep':
        return this.nonStrictStep;
      default:
        return super.getValidatorProp(key);
    }
  }

  getInnerSpanButton(): ReactNode {
    const { prefixCls, range, clearButton } = this;
    const { longPressPlus } = this.props;
    const step = this.getProp('step');
    const isMob = isMobile();
    const plusEvent = longPressPlus ? this.handlePlus : this.handleOncePlus;
    const minusEvent = longPressPlus ? this.handleMinus : this.handleOnceMinus;
    if (step && !range && !this.readOnly && !this.disabled) {
      const plusIconProps: any = {
        ref: this.savePlusRef,
        key: 'plus',
        className: `${prefixCls}-plus`,
        onMouseDown: isMob ? undefined : plusEvent,
        onTouchStart: isMob ? plusEvent : undefined,
      };
      const minIconProps: any = {
        ref: this.saveMinusRef,
        key: 'minus',
        className: `${prefixCls}-minus`,
        onMouseDown: isMob ? undefined : minusEvent,
        onTouchStart: isMob ? minusEvent : undefined,
      };
      return this.wrapperInnerSpanButton(
        <div>
          <div {...plusIconProps}>
            <Icon type="keyboard_arrow_up" />
          </div>
          <div {...minIconProps}>
            <Icon type="keyboard_arrow_down" />
          </div>
        </div>,
      );
    }
    if (clearButton) {
      let right: number | undefined;
      if (this.suffixWidth && this.isSuffixClick) {
        right = defaultTo(this.suffixWidth, 0);
      }
      return this.wrapperInnerSpanButton(
        <Icon
          type="close"
          onClick={this.handleClearButtonClick}
          onMouseDown={this.handleInnerButtonMouseDown}
        />,
        {
          className: `${prefixCls}-clear-button`,
          style: { right },
        },
      )
    }
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    const step = this.getProp('step');
    const suffix = this.getSuffix();
    const button = this.getInnerSpanButton();
    return super.getWrapperClassNames({
      [`${prefixCls}-step-suffix`]: button && isValidElement<{ onClick }>(suffix) && step,
    }, ...args);
  }

  @action
  handleEnterDown(e) {
    if (this.multiple && this.range && this.text) {
      this.prepareSetValue(this.text);
    }
    super.handleEnterDown(e);
    if (this.multiple && this.range) {
      this.setRangeTarget(0);
      this.beginRange();
    }
  }

  @autobind
  handleKeyDown(e) {
    if (!this.disabled && !this.readOnly && this.keyboard) {
      switch (e.keyCode) {
        case KeyCode.UP:
          this.handleKeyDownUp(e);
          break;
        case KeyCode.DOWN:
          this.handleKeyDownDown(e);
          break;
        default:
      }
    }
    super.handleKeyDown(e);
  }

  @keepRunning(stepUpKeyboardProps)
  handleKeyDownUp(value) {
    this.afterStep(value);
  }

  @keepRunning(stepDownKeyboardProps)
  handleKeyDownDown(value) {
    this.afterStep(value);
  }

  @keepRunning(stepUpMouseProps)
  handlePlus(value) {
    this.afterStep(value);
  }

  @keepRunning(stepDownMouseProps)
  handleMinus(value) {
    this.afterStep(value);
  }

  @autobind
  handleOncePlus() {
    this.step(true);
  }

  @autobind
  handleOnceMinus() {
    this.step(false);
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'nonStrictStep',
      'formatter',
      'formatterOptions',
      'longPressPlus',
      'precision',
      'numberGrouping',
      'maxLength',
      'minLength',
      'keyboard',
      'stringMode',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.maxLength;
    otherProps.max = this.max;
    otherProps.min = this.min;
    return otherProps;
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      max: props.max,
      min: props.min,
      precision: props.precision,
      nonStrictStep: props.nonStrictStep,
    };
  }

  stepGenerator(isPlus: boolean): IterableIterator<BigNumber.Value> {
    const { min, max, nonStrictStep, strict } = this;
    const options: BigNumberOptions = {
      strict,
    };
    const step = defaultTo(this.getProp('step'), 1);
    const value = this.getCurrentInputValue();
    const currentValue = getCurrentValidValue(String(value), options);
    return (function* (newValue: BigNumber.Value) {
      while (true) {
        const nearStep = nonStrictStep === false ? getNearStepValues(newValue, step, min, max, options) : undefined;
        if (nonStrictStep === false && nearStep) {
          switch (nearStep.length) {
            case 1:
              newValue = nearStep[0];
              break;
            case 2:
              newValue = nearStep[isPlus ? 1 : 0];
              break;
            default:
          }
        } else {
          const nextValue = isPlus ? math.plus(newValue, step, options) : math.minus(newValue, step, options);
          if (!isEmpty(min) && math.lt(nextValue, min)) {
            newValue = min;
          } else if (!isEmpty(max) && math.gt(nextValue, max)) {
            const nearMaxStep = nonStrictStep === false ? getNearStepValues(max, step, min, max, options) : undefined;
            if (nonStrictStep === false && nearMaxStep) {
              newValue = nearMaxStep[0];
            } else {
              newValue = max;
            }
          } else {
            newValue = nextValue;
          }
        }
        yield newValue;
      }
    })(currentValue);
  }

  getCurrentInputValue() {
    let value;
    if (!isEmpty(this.text)) {
      value = this.text;
    } else if (this.range && !isNil(this.rangeTarget) && this.rangeValue) {
      value = this.rangeValue[this.rangeTarget];
    } else {
      value = this.getValue();
    }
    return value;
  }

  step(isPlus: boolean) {
    this.afterStep(this.stepGenerator(isPlus).next().value);
  }

  afterStep(newValue) {
    this.setText(String(newValue));
    if (!this.multiple) {
      this.handleChangeWait(newValue);
    }
  }

  prepareSetValue(value: any): void {
    if (isNaN(value) || isEmpty(value)) {
      super.prepareSetValue(null);
    } else {
      super.prepareSetValue(parseNumber(value, this.getProp('precision'), this.strict));
    }
  }

  getProcessValueOptions(): ProcessValueOptions {
    const options = super.getProcessValueOptions();
    options.isNumber = true;
    options.precision = this.getProp('precision');
    options.useZeroFilledDecimal = this.getContextConfig('useZeroFilledDecimal');
    return options;
  }

  restrictInput(value: string): string {
    if (value) {
      const nextInputStr = value.replace(/。/, '.');
      if (nextInputStr !== value) {
        this.lock = false;
        value = nextInputStr;
      }
      if (this.lock) return value;
      let restrict = '0-9';
      if (this.allowDecimal) {
        restrict += '.';
      } else if (value.indexOf('.') !== -1) {
        let boforeValue = this.getCurrentInputValue();
        boforeValue = !isNil(boforeValue) ? String(boforeValue) : '';
        if (boforeValue.indexOf('.') === -1) {
          return boforeValue;
        }
        value = String(this.stepGenerator(false).next().value);
      }
      const isNegative = this.allowNegative && /^-/.test(value);
      value = super.restrictInput(value.replace(new RegExp(`[^${restrict}]+`, 'g'), ''));
      const values = value.split('.');
      if (values.length > 2) {
        value = `${values.shift()}.${values.join('')}`;
      }
      if (isNegative) {
        value = `-${value}`;
      }
    }
    return value;
  }

  getFormatOptions(value?: number | BigNumber): FormatNumberFuncOptions {
    return getNumberFormatOptions((name) => this.getProp(name), (name) => this.getDisplayProp(name), () => this.getValue(), value, this.lang, this.getContextConfig);
  }

  getFormatter() {
    return this.getProp('formatter') || getNumberFormatter(this.getContextConfig);
  }

  processText(value: ReactNode): ReactNode {
    const fixedValue = math.fix(new BigNumber(String(value)));
    const formatOptions = this.getFormatOptions(fixedValue);
    return this.getFormatter()(value, formatOptions.lang, formatOptions.options);
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }

  @autobind
  compare(oldValue, newValue) {
    return math.eq(oldValue, newValue);
  }

  isValidInput(input: string): boolean {
    return !input.endsWith('.');
  }
}

@observer
export default class ObserverNumberField extends NumberField<NumberFieldProps> {
  static defaultProps = NumberField.defaultProps;

  static format = defaultFormatNumber;

  /**
   * @deprecated
   */
  static bigNumberFormat = defaultFormatNumber;

}
