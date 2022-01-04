import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { BigNumber } from 'bignumber.js';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isOverflow = (value, max, range, isBigNumber) => {
  if (isBigNumber) {
    if (range) {
      return toRangeValue(value, range).some(item => !isEmpty(item) && new BigNumber(item).isGreaterThan(max));
    }
    return new BigNumber(value).isGreaterThan(max);
  }
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && Number(item) > Number(max));
  }
  return Number(value) > Number(max);
};

export default function rangeOverflow(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const max = getProp('max');
    if (!isNil(max)) {
      const range = getProp('range');
      const stringMode = getProp('stringMode');
      if (isOverflow(value, max, range, stringMode)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { max: isMoment(max) ? max.format(format) : max, label };
        const ruleName = 'rangeOverflow';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_overflow'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            max,
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
