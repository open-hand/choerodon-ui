import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import formatReactTemplate from '../../formatter/formatReactTemplate';

export default function rangeOverflow(value: any, props: ValidatorProps): methodReturn {
  const { max, label, defaultValidationMessages } = props;
  if (!isEmpty(value) && max !== undefined && Number(value) > max) {
    const injectionOptions = { max, label };
    const ruleName = 'rangeOverflow';
    const {
      [ruleName]: validationMessage = $l('Validator', 'range_overflow'),
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
