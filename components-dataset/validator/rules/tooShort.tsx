import { isEmpty } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

export default function tooShort(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const minLength = getProp('minLength');
    if (minLength !== undefined && minLength > 0) {
      const { length } = value.toString();
      if (length < minLength) {
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
