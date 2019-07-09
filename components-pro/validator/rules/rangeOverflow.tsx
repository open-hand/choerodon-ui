import format from 'string-template';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

export default function rangeOverflow(value, { max, label }): methodReturn {
  if (!isEmpty(value) && max !== void 0 && Number(value) > max) {
    const injectionOptions = { max, label };
    return new ValidationResult({
      validationMessage: format($l('Validator', 'range_overflow'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeOverflow',
    });
  }
  return true;
}
