import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { toRangeValue } from '../../field/utils';
import { ValidationMessages } from '../Validator';

const isOverflow = (value, max, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && Number(item) > Number(max));
  }
  return Number(value) > Number(max);
};

export default function rangeOverflow(value: any, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const max = getProp('max');
    if (!isNil(max)) {
      const range = getProp('range');
      if (isOverflow(value, max, range)) {
        const format = getProp('format');
        const label = getProp('label');
        const injectionOptions = { max: isMoment(max) ? max.format(format) : max, label };
        const ruleName = 'rangeOverflow';
        const {
          [ruleName]: validationMessage = $l('Validator', 'range_overflow'),
        } = props.defaultValidationMessages;
        return new ValidationResult({
          validationProps: {
            max,
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
