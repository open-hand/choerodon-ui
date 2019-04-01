import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { inject } from '../utils';
import { methodReturn } from '.';

export default function tooShort(value, { minLength }): methodReturn {
  if (!isEmpty(value)) {
    const { length } = value.toString();
    if (!!minLength && minLength > 0 && length < minLength) {
      const injectionOptions = { minLength, length };
      return new ValidationResult({
        validationMessage: inject($l('Validator', 'too_short'), injectionOptions),
        injectionOptions,
        value,
        ruleName: 'tooShort',
      });
    }
  }
  return true;
}
