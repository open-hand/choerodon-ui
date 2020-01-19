import { isMoment } from 'moment';
import isNil from 'lodash/isNil';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorProps } from '.';
import formatReactTemplate from '../../formatter/formatReactTemplate';
import { toRangeValue } from '../../field/utils';

const isOverflow = (value, max, range) => {
  if (range) {
    return toRangeValue(value, range).some(item => !isEmpty(item) && Number(item) > Number(max));
  }
  return !isEmpty(value) && Number(value) > Number(max);
};

export default function rangeOverflow(value: any, props: ValidatorProps): methodReturn {
  const { max, label, format, defaultValidationMessages, range } = props;
  if (!isNil(max) && isOverflow(value, max, range)) {
    const injectionOptions = { max: isMoment(max) ? max.format(format) : max, label };
    const ruleName = 'rangeOverflow';
    const {
      [ruleName]: validationMessage = $l('Validator', 'range_overflow'),
    } = defaultValidationMessages;
    return new ValidationResult({
      validationMessage: formatReactTemplate(validationMessage, injectionOptions),
      injectionOptions,
      value,
      ruleName,
    });
  }
  return true;
}
