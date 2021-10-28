import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { toRangeValue } from '../../field/utils';

const isUnderflow = (value, min, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && Number(item) < Number(min));
  }
  return Number(value) < Number(min);
};

export default function rangeUnderflow(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const min = getProp('min');
    if (!isNil(min)) {
      const range = getProp('range');
      if (isUnderflow(value, min, range)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { min: isMoment(min) ? min.format(format) : min, label };
        const ruleName = 'rangeUnderflow';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_underflow'),
        } = getProp('defaultValidationMessages') || {};
        return new ValidationResult({
          validationProps: {
            min,
            range,
          },
          validationMessage: formatReactTemplate(validationMessage, injectionOptions),
          injectionOptions,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
