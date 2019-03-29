import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

export default function patternMismatch(value, { pattern }): methodReturn {
  if (!isEmpty(value) && !!pattern && !new RegExp(`^${pattern}$`).test(value)) {
    return new ValidationResult({
      validationMessage: $l('Validator', 'pattern_mismatch'),
      value,
      ruleName: 'patternMismatch',
    });
  }
  return true;
}
