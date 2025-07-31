import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isTooShort = (value, range, minLength) => {
  if (range) {
    let errorLength = 0;
    const result = toRangeValue(value, range).some(item => {
      if (!isEmpty(item)) {
        const { length } = item.toString();
        errorLength = length;
        return length < minLength;
      }
      return false;
    });
    return [result, errorLength];
  }
  const { length } = value.toString();
  return [length < minLength, length];
};

export default function tooShort(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const minLength = getProp('minLength');
    if (minLength !== undefined && minLength > 0) {
      const range = getProp('range');
      const [result, length] = isTooShort(value, range, minLength);
      if (result) {
        const injectionOptions = { minLength, length };
        const ruleName = 'tooShort';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_short'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            minLength,
          },
          validationMessage,
          injectionOptions,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
