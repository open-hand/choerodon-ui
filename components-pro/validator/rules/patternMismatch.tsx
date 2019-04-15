import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn } from '.';

function generatePattern(pattern: string | RegExp): RegExp {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  const begin = pattern.startsWith('^') ? '' : '^';
  const end = pattern.endsWith('$') ? '' : '$';
  return new RegExp(`${begin}${pattern}${end}`);
}

export default function patternMismatch(value, { pattern }): methodReturn {
  if (!isEmpty(value) && !!pattern && !generatePattern(pattern).test(value)) {
    return new ValidationResult({
      validationMessage: $l('Validator', 'pattern_mismatch'),
      value,
      ruleName: 'patternMismatch',
    });
  }
  return true;
}
