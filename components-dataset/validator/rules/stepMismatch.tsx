import { isMoment } from 'moment';
import { isEmpty, toRangeValue, getNearStepValues } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

function isStepMismatch(value, step, min, max, range, isBigNumber) {
  if (range) {
    let nearStepValues;
    toRangeValue(value, range).every(item => {
      if (!isEmpty(item)) {
        nearStepValues = getNearStepValues(isMoment(item) ? item : Number(item), step, min, max, isBigNumber);
      }
      return !nearStepValues;
    });
    return nearStepValues;
  }
  return getNearStepValues(isMoment(value) ? value : Number(value), step, min, max, isBigNumber);
}

export default function stepMismatch(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const step = getProp('step');
    if (step !== undefined) {
      const nonStrictStep = getProp('nonStrictStep');
      if (nonStrictStep === false) {
        const min = getProp('min');
        const max = getProp('max');
        const range = getProp('range');
        const stringMode = getProp('stringMode');
        const nearStepValues = isStepMismatch(value, step, min, max, range, stringMode);
        if (nearStepValues !== undefined) {
          const format = getProp('format');
          const [before, after] = nearStepValues;
          const injectionOptions = {
            0: isMoment(before) ? before.format(format) : before,
            1: isMoment(after) ? after.format(format) : after,
          };
          const ruleName = nearStepValues.length === 2 ? 'stepMismatchBetween' : 'stepMismatch';
          const key = nearStepValues.length === 2 ? 'step_mismatch_between' : 'step_mismatch';
          const { [ruleName]: validationMessage = $l('Validator', key) } = getProp('defaultValidationMessages') || {};
          return new ValidationResult({
            validationProps: {
              ...validatorBaseProps,
              step,
              min,
              max,
              range,
            },
            validationMessage,
            injectionOptions,
            value: isMoment(value) ? value.format(format) : value,
            ruleName,
          });
        }
      }
    }
  }
  return true;
}
