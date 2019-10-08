import { isArrayLike } from 'mobx';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';

function isEmptyArray(value: any): boolean {
  return isEmpty(value) || (isArrayLike(value) && value.length === 0);
}

export default function valueMissing(
  value,
  { required, label, multiple, range }: ValidatorProps,
): methodReturn {
  if (
    required &&
    (isEmptyArray(value) || (multiple && range && value.every(item => isEmptyArray(item))))
  ) {
    const injectionOptions = { label };
    return new ValidationResult({
      validationMessage: $l(
        'Validator',
        label ? 'value_missing_with_label' : 'value_missing',
        injectionOptions,
      ),
      injectionOptions,
      value,
      ruleName: 'valueMissing',
    });
  }
  return true;
}
