import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { inject } from '../utils';
import { methodReturn } from '.';

export default function rangeUnderflow(value, { min }): methodReturn {
  if (!isEmpty(value) && min !== void 0 && Number(value) < min) {
    const injectionOptions = { min };
    return new ValidationResult({
      validationMessage: inject($l('Validator', 'range_underflow'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeUnderflow',
    });
  }
  return true;
}
