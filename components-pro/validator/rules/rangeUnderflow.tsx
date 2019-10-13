import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import formatReactTemplate from '../../formatter/formatReactTemplate';

export default function rangeUnderflow(value: any, props: ValidatorProps): methodReturn {
  const { min, label, defaultValidationMessages } = props;
  if (!isEmpty(value) && min !== undefined && Number(value) < min) {
    const injectionOptions = { min, label };
    const ruleName = 'rangeUnderflow';
    const {
      [ruleName]: validationMessage = $l('Validator', 'range_underflow'),
    } = defaultValidationMessages;
    return new ValidationResult({
      validationMessage: formatReactTemplate(validationMessage, injectionOptions),
      injectionOptions,
      value,
      ruleName,
    });
  }
  return true;
}
