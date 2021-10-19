import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { ValidationMessages } from '../Validator';

export default function tooLong(value: any, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const maxLength = getProp('maxLength');
    if (maxLength !== undefined && maxLength > 0) {
      const { length } = value.toString();
      if (length > maxLength) {
        const injectionOptions = { maxLength, length };
        const ruleName = 'tooLong';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_long'),
        } = props.defaultValidationMessages;
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
