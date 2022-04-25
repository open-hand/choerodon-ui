import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import math from '../../math';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isBadInput = (value, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && math.isNaN(item));
  }
  return math.isNaN(value);
};

export default function badInput(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const type = getProp('type');
    if (type === FieldType.number || type === FieldType.currency) {
      const range = getProp('range');
      if (isBadInput(value, range)) {
        const ruleName = 'badInput';
        const {
          [ruleName]: validationMessage = $l('Validator', 'bad_input'),
        } = getProp('defaultValidationMessages') || {};
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
