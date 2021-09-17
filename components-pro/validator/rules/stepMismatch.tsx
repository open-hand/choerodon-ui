import { isMoment } from 'moment';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { getNearStepValues } from '../../number-field/utils';
import { methodReturn, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { toRangeValue } from '../../field/utils';

function isStepMismatch(value, step, min, max, range) {
  if (range) {
    let nearStepValues;
    toRangeValue(value, range).every(item => {
      if (!isEmpty(item)) {
        nearStepValues = getNearStepValues(isMoment(item) ? item : Number(item), step, min, max);
      }
      return !nearStepValues;
    });
    return nearStepValues;
  }
  if (!isEmpty(value)) {
    return getNearStepValues(isMoment(value) ? value : Number(value), step, min, max);
  }
}

export default function stepMismatch(value: any, props: ValidatorProps): methodReturn {
  const { step, min, max, defaultValidationMessages, range, format, nonStrictStep } = props;
  if (step !== undefined && nonStrictStep === false) {
    const nearStepValues = isStepMismatch(value, step, min, max, range);
    if (nearStepValues !== undefined) {
      const [before, after] = nearStepValues;
      const injectionOptions = {
        0: isMoment(before) ? before.format(format) : before,
        1: isMoment(after) ? after.format(format) : after,
      };
      const ruleName = nearStepValues.length === 2 ? 'stepMismatchBetween' : 'stepMismatch';
      const key = nearStepValues.length === 2 ? 'step_mismatch_between' : 'step_mismatch';
      const { [ruleName]: validationMessage = $l('Validator', key) } = defaultValidationMessages;
      return new ValidationResult({
        validationMessage: formatReactTemplate(validationMessage, injectionOptions),
        injectionOptions,
        value: isMoment(value) ? value.format(format) : value,
        ruleName,
      });
    }
  }
  return true;
}
