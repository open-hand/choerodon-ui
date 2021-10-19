import React, { isValidElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import keepRunning from '../_util/keepRunning';
import Icon from '../icon';
import { getNearStepValues, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, parseNumber, plus } from './utils';
import { ValidationMessages } from '../validator/Validator';
import isEmpty from '../_util/isEmpty';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import defaultFormatNumber from '../formatter/formatNumber';
import { Lang } from '../locale-context/enum';
import localeContext from '../locale-context/LocaleContext';
import { getNumberFormatOptions, getNumberFormatter } from '../field/utils';

function getCurrentValidValue(value: string): number {
  return Number(value.replace(/\.$/, '')) || 0;
}

export type FormatNumberFunc = (value: string, lang: string, options: Intl.NumberFormatOptions) => string;

export type FormatNumberFuncOptions = {
  lang?: string | undefined;
  options: Intl.NumberFormatOptions;
};

export interface NumberFieldProps<V = number> extends TextFieldProps<V> {
  /**
   * 最小值
   */
  min?: number | null;
  /**
   * 最大值
   */
  max?: number | null;
  /**
   * 步距
   */
  step?: number;
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
}

export class NumberField<T extends NumberFieldProps> extends TextField<T & NumberFieldProps> {
  static displayName = 'NumberField';

  static propTypes = {
    /**
     * 最小值
     */
    min: PropTypes.number,
    /**
     * 最大值
     */
    max: PropTypes.number,
    /**
     * 步距
     */
    step: PropTypes.number,
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
    return !step || (step as number) % 1 !== 0 || (!!min && (min as number) % 1 !== 0);
  }

  @computed
  get nonStrictStep(): boolean {
    const nonStrictStep = this.getProp('nonStrictStep');
    if (nonStrictStep !== undefined) {
      return nonStrictStep;
    }
    const numberFieldNonStrictStep = getConfig('numberFieldNonStrictStep');
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
  get min(): number | undefined | null {
    return this.getLimit('min');
  }

  @computed
  get max(): number | undefined | null {
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

  @autobind
  savePlusRef(ref) {
    this.plusElement = ref;
  }

  @autobind
  saveMinusRef(ref) {
    this.minusElement = ref;
  }

  isLowerRange(value1: number, value2: number): boolean {
    return value1 < value2;
  }

  getFieldType(): FieldType {
    return FieldType.number;
  }

  getLimit(type: string): number | undefined | null {
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

  getValidatorProp(key) {
    if (['maxLength', 'minLength'].includes(key)) {
      return;
    }
    switch (key) {
      case 'min':
      case 'max':
      case 'nonStrictStep':
        return this[key];
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
    if (!this.disabled && !this.readOnly) {
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

  handleKeyDownUp(e) {
    e.preventDefault();
    if (this.getProp('step')) {
      this.step(true);
    }
  }

  handleKeyDownDown(e) {
    e.preventDefault();
    if (this.getProp('step')) {
      this.step(false);
    }
  }

  @keepRunning(function () {
    return this.plusElement;
  })
  handlePlus(_e, isKeeping) {
    this.step(true, isKeeping);
  }

  @keepRunning(function () {
    return this.minusElement;
  })
  handleMinus(_e, isKeeping) {
    this.step(false, isKeeping);
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
    ]);
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

  step(isPlus: boolean, isKeeping?: boolean) {
    const min = defaultTo(this.min, -MAX_SAFE_INTEGER);
    const max = defaultTo(this.max, MAX_SAFE_INTEGER);
    const step = defaultTo(this.getProp('step'), 1);
    const { nonStrictStep } = this;
    // 需要处理非严格模式
    let newValue;
    const value =
      this.multiple || this.isFocused ? Number(this.text || this.getValue()) : this.getValue();
    const currentValue = getCurrentValidValue(String(value));
    newValue = currentValue;
    const nearStep = getNearStepValues(currentValue, step as number, min, max);
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
      const nextValue = plus(currentValue, (isPlus ? step : -step) as number);
      if (nextValue < min) {
        newValue = min;
      } else if (nextValue > max) {
        const nearMaxStep = getNearStepValues(max as number, step as number, min, max as number);

        if (nearMaxStep) {
          newValue = nearMaxStep[0];
        } else {
          newValue = max;
        }
      } else {
        newValue = nextValue;
      }
    }
    // 不要进行对比操作,在table中使用的时候,因为NumberField会作为editor使用,所以在 对第一个cell只点击一次的情况下(例如plus)
    // 此时切换到第二个cell进行编辑，无法进行上次操作(同上次的plus)
    // this.value !== newValue
    if (this.multiple || isKeeping) {
      this.setText(String(newValue));
    } else {
      this.prepareSetValue(newValue);
    }
  }

  prepareSetValue(value: any): void {
    super.prepareSetValue(isNaN(value) || isEmpty(value) ? null : parseNumber(value, this.getProp('precision')));
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

  processText(value: ReactNode): ReactNode {
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
}
