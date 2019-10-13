import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';

function generatePattern(pattern: string | RegExp): RegExp {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  const begin = pattern.startsWith('^') ? '' : '^';
  const end = pattern.endsWith('$') ? '' : '$';
  return new RegExp(`${begin}${pattern}${end}`);
}

export default function patternMismatch(value: any, props: ValidatorProps): methodReturn {
  const { pattern, defaultValidationMessages } = props;
  if (!isEmpty(value) && !!pattern && !generatePattern(pattern).test(value)) {
    const ruleName = 'patternMismatch';
    const {
      [ruleName]: validationMessage = $l('Validator', 'pattern_mismatch'),
    } = defaultValidationMessages;
    return new ValidationResult({
      validationMessage,
      value,
      ruleName,
    });
  }
  return true;
}
