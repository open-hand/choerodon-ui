import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { BigNumber } from 'bignumber.js';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isUnderflow = (value, min, range, isBigNumber) => {
  if (isBigNumber) {
    if (range) {
      return toRangeValue(value, range).some(item => !isEmpty(item) && new BigNumber(item).isLessThan(min));
    }
    return new BigNumber(value).isLessThan(min);
  }
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && Number(item) < Number(min));
  }
  return Number(value) < Number(min);
};

export default function rangeUnderflow(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const min = getProp('min');
    if (!isNil(min)) {
      const range = getProp('range');
      const stringMode = getProp('stringMode');
      if (isUnderflow(value, min, range, stringMode)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { min: isMoment(min) ? min.format(format) : min, label };
        const ruleName = 'rangeUnderflow';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_underflow'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            min,
            range,
          },
          validationMessage,
          injectionOptions,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
