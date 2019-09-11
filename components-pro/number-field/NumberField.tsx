import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import keepRunning from '../_util/keepRunning';
import Icon from '../icon';
import { formatNumber, getNearStepValues, MAX_SAFE_INTEGER, plus } from './utils';
import { ValidationMessages } from '../validator/Validator';
import isEmpty from '../_util/isEmpty';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';
import { ValidatorProps } from '../validator/rules';

function getCurrentValidValue(value: string): number {
  return Number(value.replace(/\.$/, '')) || 0;
}

export interface NumberFieldProps extends TextFieldProps {
  /**
   * 最小值
   */
  min?: number;
  /**
   * 最大值
   */
  max?: number;
  /**
   * 步距
   */
  step?: number;
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
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'input-number',
  };

  static format = formatNumber;

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    const label = this.getProp('label');
    return {
      valueMissing: $l('NumberField', label ? 'value_missing_with_label' : 'value_missing', {
        label,
      }),
    };
  }

  @computed
  get allowDecimal(): boolean {
    const { min } = this;
    const step = this.getProp('step');
    return !step || (step as number) % 1 !== 0 || (!!min && (min as number) % 1 !== 0);
  }

  @computed
  get allowNegative(): boolean {
    const { min } = this;
    return min === undefined || min < 0;
  }

  get min(): number | undefined {
    return this.getLimit('min');
  }

  get max(): number | undefined {
    return this.getLimit('max');
  }

  getFieldType(): FieldType {
    return FieldType.number;
  }

  getLimit(type: string): number | undefined {
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
    return {
      ...super.getValidatorProps(),
      min,
      max,
      step,
    };
  }

  getInnerSpanButton(): ReactNode {
    const { prefixCls } = this;
    const step = this.getProp('step');
    if (step && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(
        <div>
          <Icon
            key="plus"
            type="keyboard_arrow_up"
            className={`${prefixCls}-plus`}
            onMouseDown={this.handlePlus}
          />
          <Icon
            key="minus"
            type="keyboard_arrow_down"
            className={`${prefixCls}-minus`}
            onMouseDown={this.handleMinus}
          />
        </div>,
      );
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

  step(isPlus: boolean) {
    const min = defaultTo(this.min, -MAX_SAFE_INTEGER);
    const max = defaultTo(this.max, MAX_SAFE_INTEGER);
    const step = defaultTo(this.getProp('step'), 1);
    let newValue;
    if (!isNumber(this.value)) {
      newValue = defaultTo(this.min, 0);
    } else {
      const currentValue = getCurrentValidValue(String(this.value));
      newValue = currentValue;
      const nearStep = getNearStepValues(currentValue, step as number, min, max);
      if (nearStep) {
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
    if (this.value !== newValue) {
      if (this.multiple) {
        this.setText(String(newValue));
      } else {
        this.prepareSetValue(newValue);
      }
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

  getFormatOptions(): Intl.NumberFormatOptions | undefined {
    return undefined;
  }

  getFormatter() {
    return formatNumber;
  }

  processValue(value) {
    return this.getFormatter()(super.processValue(value), this.lang, this.getFormatOptions());
  }
}

@observer
export default class ObserverNumberField extends NumberField<NumberFieldProps> {
  static defaultProps = NumberField.defaultProps;

  static format = formatNumber;
}
