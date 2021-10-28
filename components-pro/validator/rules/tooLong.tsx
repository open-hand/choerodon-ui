import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';

export default function tooLong(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const maxLength = getProp('maxLength');
    if (maxLength !== undefined && maxLength > 0) {
      const { length } = value.toString();
      if (length > maxLength) {
        const injectionOptions = { maxLength, length };
        const ruleName = 'tooLong';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_long'),
        } =getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            maxLength,
          },
          validationMessage: formatReactTemplate(validationMessage, injectionOptions),
          injectionOptions,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
