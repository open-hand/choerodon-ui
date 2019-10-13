import isString from 'lodash/isString';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';

export default async function customError(
  value: any,
  props: ValidatorProps,
): Promise<methodReturn> {
  const { customValidator, name, record, form } = props;
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
