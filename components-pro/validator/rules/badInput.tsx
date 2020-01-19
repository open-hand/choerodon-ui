import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { toRangeValue } from '../../field/utils';
import { methodReturn, ValidatorProps } from '.';

const isNumber = (value, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && !isNaN(item));
  }
  return !isEmpty(value) && !isNaN(value);
};

export default function badInput(value: any, props: ValidatorProps): methodReturn {
  const { type, defaultValidationMessages, range } = props;
  if (type === FieldType.number && !isNumber(value, range)) {
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
