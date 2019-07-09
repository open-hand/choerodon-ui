import format from 'string-template';
import { isArrayLike } from 'mobx';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';

export default function valueMissing(value, { required, label }: ValidatorProps): methodReturn {
  if (required && (isEmpty(value) || (isArrayLike(value) && value.length === 0))) {
    const injectionOptions = { label };
    return new ValidationResult({
      validationMessage: format($l('Validator', label ? 'value_missing_with_label' : 'value_missing'), injectionOptions),
      injectionOptions,
      value,
      ruleName: 'valueMissing',
    });
  }
  return true;
}
