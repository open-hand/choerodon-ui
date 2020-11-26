import React, { ReactInstance, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import keepRunning from '../_util/keepRunning';
import Icon from '../icon';
import { getNearStepValues, getPrecision, MAX_SAFE_INTEGER, plus } from './utils';
import { ValidationMessages } from '../validator/Validator';
import isEmpty from '../_util/isEmpty';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import { ValidatorProps } from '../validator/rules';
import defaultFormatNumber from '../formatter/formatNumber';

function getCurrentValidValue(value: string): number {
  return Number(value.replace(/\.$/, '')) || 0;
}

export type FormatNumberFunc = (value: string, lang: string, options: Intl.NumberFormatOptions) => string;

export type FormatNumberFuncOptions = {
  lang?: string,
  options?: Intl.NumberFormatOptions;
};


export interface NumberFieldProps extends TextFieldProps {
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
   * 值变化回调
   */
  onChange?: (value: number, oldValue: number, form?: ReactInstance) => void;
  /**
   *是否长按按钮按步距增加 
  */
  longPressPuls: boolean;
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
    longPressPuls: PropTypes.bool,
    /**
     * 是否开启长按步距增加
    */
    formatterOptions: PropTypes.object,
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'input-number',
    longPressPuls: true,
  };

  static format = defaultFormatNumber;

  @computed
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

  getValidatorProps(): ValidatorProps {
    const { min, max } = this;
    const step = this.getProp('step');
    const nonStrictStep = this.nonStrictStep;

    return {
      ...super.getValidatorProps(),
      min,
      max,
      step,
      nonStrictStep,
    };
  }

  getInnerSpanButton(): ReactNode {
    const { prefixCls, range } = this;
    const { longPressPuls } = this.props;
    const step = this.getProp('step');
    if (step && !range && !this.isReadOnly()) {
      const plusIconProps = {
        key:"plus",
        type:"keyboard_arrow_up",
        className:`${prefixCls}-plus`,
        onMouseDown: longPressPuls ? this.handlePlus : this.handleOncePlus,
      }
      const minIconProps = {
        key:"minus",
        type:"keyboard_arrow_down",
        className:`${prefixCls}-minus`,
        onMouseDown: longPressPuls ? this.handleMinus : this.handleOnceMinus,
      }
      return this.wrapperInnerSpanButton(
        <div>
          <Icon
           {...plusIconProps}
          />
          <Icon
          {...minIconProps}
          />
        </div>,
      );
    }
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
    if (!this.props.disabled && !this.isReadOnly()) {
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

  @keepRunning
  handlePlus() {
    this.step(true);
  }

  @keepRunning
  handleMinus() {
    this.step(false);
  }

  @autobind
  handleOncePlus() {
    this.step(true);
  }

  @autobind
  handleOnceMinus() {
    this.step(false);
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'nonStrictStep',
      'formatter',
      'formatterOptions',
      'longPressPuls',
    ]);
    return otherProps;
  }

  step(isPlus: boolean) {
    const min = defaultTo(this.min, -MAX_SAFE_INTEGER);
    const max = defaultTo(this.max, MAX_SAFE_INTEGER);
    const step = defaultTo(this.getProp('step'), 1);
    const nonStrictStep = this.nonStrictStep;
    // 需要处理非严格模式
    let newValue;
    const value =
      this.multiple || this.isFocused ? Number(this.text || this.getValue()) : this.getValue();
    if (!isNumber(value)) {
      newValue = defaultTo(this.min, 0);
    } else {
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
    }
    // 不要进行对比操作,在table中使用的时候,因为NumberField会作为editor使用,所以在 对第一个cell只点击一次的情况下(例如plus)
    // 此时切换到第二个cell进行编辑，无法进行上次操作(同上次的plus)
    // this.value !== newValue
    if (this.multiple) {
      this.setText(String(newValue));
    } else {
      this.prepareSetValue(newValue);
    }

  }

  prepareSetValue(value: any): void {
    super.prepareSetValue(isNaN(value) || isEmpty(value) ? null : Number(value));
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
    const precision = getPrecision(isNil(value) ? this.getValue() || 0 : value);
    const defaultOptions = {
      lang: this.lang,
      options: {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      },
    };

    const formatterOptions: FormatNumberFuncOptions = this.getProp('formatterOptions') || {};
    const numberFieldFormatterOptions: FormatNumberFuncOptions = getConfig('numberFieldFormatterOptions') || {};
    if (formatterOptions) {
      return {
        lang: formatterOptions.lang || numberFieldFormatterOptions.lang || defaultOptions.lang,
        options: {
          ...defaultOptions.options,
          ...numberFieldFormatterOptions.options,
          ...formatterOptions.options,
        },
      };
    }
    return defaultOptions;
  }

  getFormatter() {
    const formatter = this.getProp('formatter');
    if (formatter !== undefined) {
      return formatter;
    }
    const numberFieldFormatter = getConfig('numberFieldFormatter');
    if (numberFieldFormatter !== undefined) {
      return numberFieldFormatter;
    }
    return defaultFormatNumber;
  }

  processText(value: string): string {
    const formatOptions = this.getFormatOptions(Number(value));
    return this.getFormatter()(value, formatOptions.lang, formatOptions.options);
  }
}

@observer
export default class ObserverNumberField extends NumberField<NumberFieldProps> {
  static defaultProps = NumberField.defaultProps;

  static format = defaultFormatNumber;
}
