import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import math from '../../math';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isOverflow = (value, maxExcl, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) &&
      (isMoment(item) ? item.isSameOrAfter(maxExcl) : math.gte(item, maxExcl)));
  }
  if (isMoment(value)) {
    return value.isSameOrAfter(maxExcl);
  }
  return math.gte(value, maxExcl);
};

export default function rangeOverflowExcl(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const maxExcl = getProp('maxExcl');
    if (!isNil(maxExcl)) {
      const range = getProp('range');
      if (isOverflow(value, maxExcl, range)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { maxExcl: isMoment(maxExcl) ? maxExcl.format(format) : maxExcl, label };
        const ruleName = 'rangeOverflowExcl';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_overflow_excl'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            maxExcl,
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
