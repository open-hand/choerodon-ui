import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

export default function rangeUnderflow(value, { min, label }): methodReturn {
  if (!isEmpty(value) && min !== void 0 && Number(value) < min) {
    const injectionOptions = { min, label };
    return new ValidationResult({
      validationMessage: $l('Validator', 'range_underflow', injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeUnderflow',
    });
  }
  return true;
}
