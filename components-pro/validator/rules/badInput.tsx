import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { methodReturn } from '.';

export default function badInput(value, { type }): methodReturn {
  if (!isEmpty(value) && type === FieldType.number && isNaN(value)) {
    return new ValidationResult({
      validationMessage: $l('Validator', 'bad_input'),
      value,
      ruleName: 'badInput',
    });
  }
  return true;
}
