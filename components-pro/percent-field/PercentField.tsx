import { ReactNode } from 'react';
import { observer } from 'mobx-react';
import defer from 'lodash/defer';
import isNil from 'lodash/isNil';
import { BigNumber } from 'bignumber.js';
import math from 'choerodon-ui/dataset/math';
import autobind from '../_util/autobind';
import { NumberField, NumberFieldProps } from '../number-field/NumberField';
import { FieldType } from '../data-set/enum';
import defaultFormatNumber from '../formatter/formatNumber';
import { ProcessValueOptions } from '../field/utils';

export type PercentFieldProps<V = number> = NumberFieldProps<V>;

@observer
export default class PercentField extends NumberField<PercentFieldProps> {
  static displayName = 'PercentField';

  static defaultProps = {
    ...NumberField.defaultProps,
    suffix: '%',
  };

  static format = defaultFormatNumber;
  
  /**
   * @deprecated
   */
  static bigNumberFormat = defaultFormatNumber;

  getFieldType(): FieldType {
    return FieldType.percentage;
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-percentage`]: true,
    }, ...args);
  }

  processValue(value: any): ReactNode {
    if (!isNil(value) && (value as any) !== '') {
      const realValue = math.fix(new BigNumber(String(value)));
      return super.processValue(math.multipliedBy(realValue, 100));
    }
    return value;
  }

  @autobind
  doRun(value: number) {
    const { element } = this;
    if (element && !isNil(value) && (value as any) !== '') {
      const realValue = math.fix(new BigNumber(String(value)));
      const value100 = math.multipliedBy(realValue, 100);
      element.value = String(value100);
    }
  }

  @autobind
  afterStep(newValue: any) {
    if (!isNil(newValue) && (newValue as any) !== '') {
      const realValue = math.fix(new BigNumber(String(newValue)));
      this.setText(String(math.multipliedBy(realValue, 100)));
    } else {
      this.setText(String(newValue));
    }
    if (!this.multiple) {
      this.handleChangeWait(newValue);
    }
  }

  processPercentValue(value: any) {
    if (!isNil(value) && (value as any) !== '') {
      const decimalSeparator = this.inputDecimalSeparatorFollowLang ? this.getDecimalSeparator() : '.';
      const precision = value.toString().split(decimalSeparator)?.[1]?.length || 0;
      value = value.replace(decimalSeparator, '.');
      const result = math.div(value, 100).toFixed(precision + 2);
      return result;
    }
    return value;
  }

  setRangeTarget(target: any) {
    if (this.text !== undefined) {
      // 增加range时的特殊处理，prepareSet之前走一次processValue
      if (this.range) {
        this.prepareSetValue(this.processPercentValue(this.text || this.emptyValue));
      } else {
        this.prepareSetValue(this.text || this.emptyValue);
      }
      this.setText();
    }
    super.setRangeTarget(target);
    defer(() => this.isFocused && this.select());
  }

  getProcessValueOptions(): ProcessValueOptions {
    const options = super.getProcessValueOptions();
    options.isPercentage = true;
    return options;
  }

  @autobind
  getPropToFormatOptions(name: string) {
    if (name === 'type') {
      return FieldType.percentage;
    }
    return this.getProp(name);
  }

  processText(value: ReactNode): ReactNode {
    const fixedValue = math.fix(new BigNumber(String(value)));
    // @ts-ignore
    if (isNaN(fixedValue)) return value;
    return super.processText(value);
  }

  @autobind
  syncValueOnBlur(value: any, _?: any) {
    this.prepareSetValue(this.processPercentValue(value));
  }
}
