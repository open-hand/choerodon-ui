import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import { ValidationMessages } from '../Validator';

function generatePattern(pattern: string | RegExp): RegExp {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  const begin = pattern.startsWith('^') ? '' : '^';
  const end = pattern.endsWith('$') ? '' : '$';
  return new RegExp(`${begin}${pattern}${end}`);
}

export default function patternMismatch(value: any, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const pattern = getProp('pattern');
    if (pattern && !generatePattern(pattern).test(value)) {
      const ruleName = 'patternMismatch';
      const {
        [ruleName]: validationMessage = $l('Validator', 'pattern_mismatch'),
      } = props.defaultValidationMessages;
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
