import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';
import formatReactTemplate from '../../_util/formatReactTemplate';

export default function rangeUnderflow(value, { min, label }): methodReturn {
  if (!isEmpty(value) && min !== void 0 && Number(value) < min) {
    const injectionOptions = { min, label };
    return new ValidationResult({
      validationMessage: formatReactTemplate($l('Validator', 'range_underflow'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeUnderflow',
    });
  }
  return true;
}
