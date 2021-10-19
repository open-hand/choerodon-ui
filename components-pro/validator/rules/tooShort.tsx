import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { ValidationMessages } from '../Validator';

export default function tooShort(value: any, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const minLength = getProp('minLength');
    if (minLength !== undefined && minLength > 0) {
      const { length } = value.toString();
      if (length < minLength) {
        const injectionOptions = { minLength, length };
        const ruleName = 'tooShort';
        const {
          [ruleName]: validationMessage = $l('Validator', 'too_short'),
        } = props.defaultValidationMessages;
        return new ValidationResult({
          validationProps: {
            minLength,
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
