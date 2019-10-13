import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { getNearStepValues } from '../../number-field/utils';
import { methodReturn, ValidatorProps } from '.';
import formatReactTemplate from '../../formatter/formatReactTemplate';

export default function stepMismatch(value: any, props: ValidatorProps): methodReturn {
  const { step, min, max, defaultValidationMessages } = props;
  if (!isEmpty(value) && step !== undefined) {
    const nearStepValues = getNearStepValues(Number(value), step, min, max);
    if (nearStepValues !== undefined) {
      const injectionOptions = {
        0: nearStepValues[0],
        1: nearStepValues[1],
      };
      const ruleName = nearStepValues.length === 2 ? 'stepMismatchBetween' : 'stepMismatch';
      const key = nearStepValues.length === 2 ? 'step_mismatch_between' : 'step_mismatch';
      const { [ruleName]: validationMessage = $l('Validator', key) } = defaultValidationMessages;
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
