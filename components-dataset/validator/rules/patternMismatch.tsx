import isRegExp from 'lodash/isRegExp';
import { isEmpty, toRangeValue } from '../../utils';
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

const isNotMatch = (value, range, pattern) => {
  const patternRegExp = generatePattern(pattern);
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && !patternRegExp.test(item));
  }
  return !patternRegExp.test(value);
};

export default function patternMismatch(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const pattern = getProp('pattern');
    const range = getProp('range');
    if (pattern && isNotMatch(value, range, pattern)) {
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
