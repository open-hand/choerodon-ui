import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { methodReturn, ValidatorProps } from '.';

export default function badInput(value: any, props: ValidatorProps): methodReturn {
  const { type, defaultValidationMessages } = props;
  if (!isEmpty(value) && type === FieldType.number && isNaN(value)) {
    const ruleName = 'badInput';
    const {
      [ruleName]: validationMessage = $l('Validator', 'bad_input'),
    } = defaultValidationMessages;
    return new ValidationResult({
      validationMessage,
      value,
      ruleName,
    });
  }
  return true;
}
