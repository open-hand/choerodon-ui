import isString from 'lodash/isString';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

export default async function customError(value, { customValidator, name, record, form }): Promise<methodReturn> {
  if (typeof customValidator === 'function') {
    const result = await customValidator(value, name, record || form);
    if (isString(result) || result === false) {
      return new ValidationResult({
        validationMessage: result || $l('Validator', 'unknown'),
        value,
        ruleName: 'customError',
      });
    }
  }
  return true;
}
