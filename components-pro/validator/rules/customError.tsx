import isString from 'lodash/isString';
import isPromise from 'is-promise';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

export default function customError(
  value: any,
  props: ValidatorBaseProps,
  getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T],
): methodReturn | PromiseLike<methodReturn> {
  const customValidator = getProp('customValidator');
  if (typeof customValidator === 'function') {
    const { name, record, form } = props;
    const resultIfPromise: PromiseLike<boolean | string | undefined> | boolean | string | undefined = customValidator(value, name, record || form);
    const call = (result: boolean | string | undefined): ValidationResult | true => {
      if (isString(result) || result === false) {
        return new ValidationResult({
          validationProps: {
            customValidator,
          },
          validationMessage: result || $l('Validator', 'unknown'),
          value,
          ruleName: 'customError',
        });
      }
      return true;
    };
    if (isPromise(resultIfPromise)) {
      return resultIfPromise.then(call);
    }
    return call(resultIfPromise);
  }
  return true;
}
