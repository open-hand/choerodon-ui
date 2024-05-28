import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import math from '../../math';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isUnderflow = (value, minExcl, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) &&
      (isMoment(item) ? item.isSameOrBefore(minExcl) : math.lte(item, minExcl)));
  }
  if (isMoment(value)) {
    return value.isSameOrBefore(minExcl);
  }
  return math.lte(value, minExcl);
};

export default function rangeUnderflowExcl(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const minExcl = getProp('minExcl');
    if (!isNil(minExcl)) {
      const range = getProp('range');
      if (isUnderflow(value, minExcl, range)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { minExcl: isMoment(minExcl) ? minExcl.format(format) : minExcl, label };
        const ruleName = 'rangeUnderflowExcl';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_underflow_excl'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            minExcl,
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
