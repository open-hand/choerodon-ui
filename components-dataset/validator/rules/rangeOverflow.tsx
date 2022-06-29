import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import math from '../../math';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isOverflow = (value, max, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) &&
      (isMoment(item) ? item.isAfter(max) : math.gt(item, max)));
  }
  if (isMoment(value)) {
    return value.isAfter(max);
  }
  return math.gt(value, max);
};

export default function rangeOverflow(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const max = getProp('max');
    if (!isNil(max)) {
      const range = getProp('range');
      if (isOverflow(value, max, range)) {
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
