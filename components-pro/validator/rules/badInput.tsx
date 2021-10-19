import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { toRangeValue } from '../../field/utils';
import { methodReturn, ValidatorProps } from '.';
import { ValidationMessages } from '../Validator';

const isBadInput = (value, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && isNaN(item));
  }
  return isNaN(value);
};

export default function badInput(value: any, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const type = getProp('type');
    if (type === FieldType.number || type === FieldType.currency) {
      const range = getProp('range');
      if (isBadInput(value, range)) {
        const ruleName = 'badInput';
        const {
          [ruleName]: validationMessage = $l('Validator', 'bad_input'),
        } = props.defaultValidationMessages;
        return new ValidationResult({
          validationProps: {
            type,
            range,
          },
          validationMessage,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
