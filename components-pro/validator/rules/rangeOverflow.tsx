import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';
import formatReactTemplate from '../../_util/formatReactTemplate';

export default function rangeOverflow(value, { max, label }): methodReturn {
  if (!isEmpty(value) && max !== void 0 && Number(value) > max) {
    const injectionOptions = { max, label };
    return new ValidationResult({
      validationMessage: formatReactTemplate($l('Validator', 'range_overflow'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'rangeOverflow',
    });
  }
  return true;
}
