import React, { isValidElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import { BigNumber } from 'bignumber.js';
import { FormatNumberFuncOptions } from 'choerodon-ui/dataset/data-set/Field';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import keepRunning, { KeepRunningProps } from '../_util/keepRunning';
import Icon from '../icon';
import { getNearStepValues, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, parseNumber, plus, bigNumberToFixed, parseBigNumber } from './utils';
import { ValidationMessages } from '../validator/Validator';
import isEmpty from '../_util/isEmpty';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import defaultFormatNumber from '../formatter/formatNumber';
import defaultFormatBigNumber from '../formatter/formatBigNumber';
import { Lang } from '../locale-context/enum';
import localeContext from '../locale-context/LocaleContext';
import { getNumberFormatOptions, getNumberFormatter, getBigNumberFormatter, getBigNumberFormatOptions } from '../field/utils';

// BigNumber: https://mikemcl.github.io/bignumber.js/
function getCurrentValidValue(value: string, stringMode?: boolean): number | string {
  if (stringMode) {
    const valueBig = new BigNumber(value.replace(/\.$/, ''));
    const validateValue = bigNumberToFixed(valueBig, undefined, '0')!;
    return validateValue;
  }
  return Number(value.replace(/\.$/, '')) || 0;
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
  min?: number | string | null;
  /**
   * 最大值
   */
  max?: number | string | null;
  /**
   * 步距
   */
  step?: number | string;
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
   * 字符值模式，支持大数字
   */
  stringMode?: boolean;
}

export class NumberField<T extends NumberFieldProps> extends TextField<T & NumberFieldProps> {
  static displayName = 'NumberField';

  static propTypes = {
    /**
     * 最小值
     */
    min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 最大值
     */
    max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 步距
     */
    step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 非严格步距
     */
    nonStrictStep: PropTypes.bool,
    /**
     * 格式器
     */
    formatter: PropTypes.func,
    /**
     * 格式器参数
     */
    longPressPlus: PropTypes.bool,
    /**
     * 是否开启长按步距增加
     */
    formatterOptions: PropTypes.object,
    /**
     * 是否启用UP DOWN键盘事件
     */
    keyboard: PropTypes.bool,
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'input-number',
    longPressPlus: true,
    max: MAX_SAFE_INTEGER,
    min: MIN_SAFE_INTEGER,
  };

  static format = defaultFormatNumber;

  static bigNumberFormat = defaultFormatBigNumber;

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

  @computed
  get allowDecimal(): boolean {
    const { min, nonStrictStep, stringMode } = this;
    const precision = this.getProp('precision');
    if (precision === 0) {
      return false;
    }
    // 非严格步距下允许输入小数
    if (nonStrictStep) {
      return true;
    }
    const step = this.getProp('step');
    if (stringMode) {
      return !step
        || !new BigNumber(step).modulo(1).isEqualTo(0)
        || (!!min && !new BigNumber(min).modulo(1).isEqualTo(0));
    }
    return !step || (step as number) % 1 !== 0 || (!!min && (min as number) % 1 !== 0);
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
  get min(): number | string | undefined | null {
    return this.getLimit('min');
  }

  @computed
  get max(): number | string | undefined | null {
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

  get keyboard(): boolean {
    if ('keyboard' in this.props) {
      return this.props.keyboard!;
    }
    return this.getContextConfig('numberFieldKeyboard') !== false;
  }

  get stringMode(): boolean {
    if ('stringMode' in this.props) {
      return this.props.stringMode!;
    }
    return !!this.field && !!this.record && this.field.get('type', this.record) === FieldType.bigNumber;
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
    if (this.stringMode) {
      return new BigNumber(value1).isLessThan(value2);
    }
    return value1 < value2;
  }

  getFieldType(): FieldType {
    return FieldType.number;
  }

  getLimit(type: string): number | string | undefined | null {
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
      case 'stringMode':
        return this.stringMode;
      default:
        return super.getValidatorProp(key);
    }
  }

  getInnerSpanButton(): ReactNode {
    const { prefixCls, range } = this;
    const { longPressPlus } = this.props;
    const step = this.getProp('step');
    if (step && !range && !this.readOnly && !this.disabled) {
      const plusIconProps: any = {
        ref: this.savePlusRef,
        key: 'plus',
        className: `${prefixCls}-plus`,
        onMouseDown: longPressPlus ? this.handlePlus : this.handleOncePlus,
        onTouchStart: this.handleOncePlus,
      };
      const minIconProps: any = {
        ref: this.saveMinusRef,
        key: 'minus',
        className: `${prefixCls}-minus`,
        onMouseDown: longPressPlus ? this.handleMinus : this.handleOnceMinus,
        onTouchStart: this.handleOnceMinus,
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
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    const suffix = this.getSuffix();
    const button = this.getInnerSpanButton();
    return super.getWrapperClassNames({
      [`${prefixCls}-step-suffix`]: button && isValidElement<{ onClick }>(suffix),
      ...args,
    });
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

  stepGenerator(isPlus: boolean): IterableIterator<number | string> {
    const { min, max, nonStrictStep, stringMode } = this;
    const step = defaultTo(this.getProp('step'), 1);
    const value = this.getCurrentInputValue();
    const currentValue = getCurrentValidValue(String(value), stringMode);
    return (function* (newValue: number | string) {
      while (true) {
        const nearStep = getNearStepValues(newValue, step, min, max, stringMode);
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
          let nextValue;
          if (stringMode) {
            const newValueBig = new BigNumber(newValue);
            const nextValueBig = isPlus ? newValueBig.plus(step) : newValueBig.minus(step);
            nextValue = bigNumberToFixed(nextValueBig, undefined, '0')!;
          }
          else {
            nextValue = plus(Number(newValue), (isPlus ? Number(step) : -Number(step)));
          }
          if (min && ((stringMode && new BigNumber(nextValue).isLessThan(min)) || (!stringMode && nextValue < min))) {
            newValue = min;
          } else if (max && ((stringMode && new BigNumber(nextValue).isGreaterThan(max)) || (!stringMode && nextValue > max))) {
            const nearMaxStep = getNearStepValues(max, step, min, max, stringMode);
            if (nearMaxStep) {
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
    if (this.text) {
      value = this.text;
    }
    else if (this.range && !isNil(this.rangeTarget) && this.rangeValue) {
      value = this.rangeValue[this.rangeTarget];
    }
    else {
      value = this.getValue();
    }
    return value;
  }

  step(isPlus: boolean) {
    this.afterStep(this.stepGenerator(isPlus).next().value);
  }

  afterStep(newValue) {
    if (this.multiple) {
      this.setText(String(newValue));
    } else {
      this.prepareSetValue(newValue);
    }
  }

  prepareSetValue(value: any): void {
    if (isNaN(value) || isEmpty(value)) {
      super.prepareSetValue(null);
    }
    else if (this.stringMode) {
      const valueBig = new BigNumber(value);
      super.prepareSetValue(parseBigNumber(valueBig, this.getProp('precision'), null));
    }
    else {
      super.prepareSetValue(parseNumber(value, this.getProp('precision')));
    }
  }

  restrictInput(value: string): string {
    if (value) {
      let restrict = '0-9';
      if (this.allowDecimal) {
        restrict += '.';
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

  getFormatOptions(value?: number): FormatNumberFuncOptions {
    return getNumberFormatOptions((name) => this.getProp(name), () => this.getValue(), value, this.lang);
  }

  getFormatter() {
    return this.getProp('formatter') || getNumberFormatter();
  }

  getBigNumberFormatValue(value: ReactNode, numberField: boolean): ReactNode {
    if (isNil(value)) {
      return value;
    }
    const formatOptions = getBigNumberFormatOptions((name) => this.getProp(name), () => this.getValue(), String(value), this.lang,
      numberField ? 'number-field' : 'currency');
    const formatter = this.getProp('formatter') || getBigNumberFormatter();
    return formatter(value, formatOptions.lang, formatOptions.options, numberField ? 'number-field' : 'currency');
  }

  processText(value: ReactNode): ReactNode {
    if (this.stringMode) {
      return this.getBigNumberFormatValue(value, true);
    }
    const formatOptions = this.getFormatOptions(Number(value));
    return this.getFormatter()(value, formatOptions.lang, formatOptions.options);
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }
}

@observer
export default class ObserverNumberField extends NumberField<NumberFieldProps> {
  static defaultProps = NumberField.defaultProps;

  static format = defaultFormatNumber;

  static bigNumberFormat = defaultFormatBigNumber;
}
