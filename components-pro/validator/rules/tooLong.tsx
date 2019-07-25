import format from 'string-template';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

export default function tooLong(value, { maxLength }): methodReturn {
  if (!isEmpty(value)) {
    const { length } = value.toString();
    if (!!maxLength && maxLength > 0 && length > maxLength) {
      const injectionOptions = { maxLength, length };
      return new ValidationResult({
        validationMessage: format($l('Validator', 'too_long'), injectionOptions),
        injectionOptions,
        value,
        ruleName: 'tooLong',
      });
    }
  }
  return true;
}
