import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import formatReactTemplate from '../../formatter/formatReactTemplate';

export default function tooShort(value: any, props: ValidatorProps): methodReturn {
  const { minLength, defaultValidationMessages } = props;
  if (!isEmpty(value)) {
    const { length } = value.toString();
    if (!!minLength && minLength > 0 && length < minLength) {
      const injectionOptions = { minLength, length };
      const ruleName = 'tooShort';
      const {
        [ruleName]: validationMessage = $l('Validator', 'too_short'),
      } = defaultValidationMessages;
      return new ValidationResult({
        validationMessage: formatReactTemplate(validationMessage, injectionOptions),
        injectionOptions,
        value,
        ruleName,
      });
    }
  }
  return true;
}
