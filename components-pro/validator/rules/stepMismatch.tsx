import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { getNearStepValues } from '../../number-field/utils';
import { inject } from '../utils';
import { methodReturn } from '.';

export default function stepMismatch(value, { step, min, max }): methodReturn {
  if (!isEmpty(value) && step !== void 0) {
    const nearStepValues = getNearStepValues(Number(value), step, min, max);
    if (nearStepValues !== void 0) {
      const injectionOptions = {
        near: nearStepValues.length === 2 ?
          `两个最接近的有效值分别为${nearStepValues[0]}和${nearStepValues[1]}。` :
          `最接近的有效值为${nearStepValues[0]}。`,
      };
      return new ValidationResult({
        validationMessage: inject($l('Validator', 'step_mismatch'), injectionOptions),
        injectionOptions,
        value,
        ruleName: 'stepMismatch',
      });
    }
  }
  return true;
}
