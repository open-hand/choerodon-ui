import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { inject } from '../utils';
import { methodReturn } from '.';

export default function rangeOverflow(value, { max }): methodReturn {
  if (!isEmpty(value) && max !== void 0 && Number(value) > max) {
    const injectionOptions = { max };
    return new ValidationResult({
      validationMessage: inject($l('Validator', 'range_overflow'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeOverflow',
    });
  }
  return true;
}
