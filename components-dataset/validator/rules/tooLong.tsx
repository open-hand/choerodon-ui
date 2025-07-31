import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

const isTooLong = (value, range, maxLength) => {
  if (range) {
    let errorLength = 0;
    const result = toRangeValue(value, range).some(item => {
      if (!isEmpty(item)) {
        const { length } = item.toString();
        errorLength = length;
        return length > maxLength;
      }
      return false;
    });
    return [result, errorLength];
  }
  const { length } = value.toString();
  return [length > maxLength, length];
};

export default function tooLong(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const maxLength = getProp('maxLength');
    if (maxLength !== undefined && maxLength > 0) {
      const range = getProp('range');
      const [result, length] = isTooLong(value, range, maxLength);
      if (result) {
        const injectionOptions = { maxLength, length };
        const ruleName = 'tooLong';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_long'),
        } =getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            ...validatorBaseProps,
            maxLength,
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
