import isRegExp from 'lodash/isRegExp';
import { isEmpty } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

function generatePattern(pattern: string | RegExp): RegExp {
  if (isRegExp(pattern)) {
    pattern.lastIndex = 0;
    return pattern;
  }
  const begin = pattern.startsWith('^') ? '' : '^';
  const end = pattern.endsWith('$') ? '' : '$';
  return new RegExp(`${begin}${pattern}${end}`);
}

export default function patternMismatch(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const pattern = getProp('pattern');
    if (pattern && !generatePattern(pattern).test(value)) {
      const ruleName = 'patternMismatch';
      const {
        [ruleName]: validationMessage = $l('Validator', 'pattern_mismatch'),
      } = getProp('defaultValidationMessages') || {};
      return new ValidationResult({
        validationProps: {
          pattern,
        },
        validationMessage,
        value,
        ruleName,
      });
    }
  }
  return true;
}
