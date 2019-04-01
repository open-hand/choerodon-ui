import { isArrayLike } from 'mobx';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';

export default function valueMissing(value, { required }: ValidatorProps): methodReturn {
  if (required && (isEmpty(value) || (isArrayLike(value) && value.length === 0))) {
    return new ValidationResult({
      validationMessage: $l('Validator', 'value_missing'),
      value,
      ruleName: 'valueMissing',
    });
  }
  return true;
}
