import { isArrayLike } from 'mobx';
import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { formatReactTemplate } from '../../formatter/formatReactTemplate';
import { FieldType } from '../../data-set/enum';
import { toRangeValue } from '../../field/utils';

function isEmptyArray(value: any): boolean {
  return isEmpty(value) || (isArrayLike(value) && (value.length === 0 || value.every(item => isEmptyArray(item))));
}

export default function valueMissing(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  const required = getProp('required');
  const call = (validationProps) => {
    const label = getProp('label');
    const injectionOptions = { label };
    const key = label ? 'value_missing' : 'value_missing_no_label';
    const ruleName = label ? 'valueMissing' : 'valueMissingNoLabel';
    const { [ruleName]: validationMessage = $l('Validator', key) } = getProp('defaultValidationMessages') || {};
    return new ValidationResult({
      validationProps,
      validationMessage: formatReactTemplate(validationMessage, injectionOptions),
      injectionOptions,
      value,
      ruleName,
    });
  };
  if (required) {
    if (isEmptyArray(value)) {
      return call({ required });
    }
    const type = getProp('type');
    if (type === FieldType.attachment) {
      const attachmentCount = getProp('attachmentCount');
      if (!attachmentCount) {
        return call({
          required,
          type,
          attachmentCount,
        });
      }
    }
    const range = getProp('range');
    if (range) {
      const multiple = getProp('multiple');
      if ((multiple ? value.every(item => isEmptyArray(toRangeValue(item, range))) : isEmptyArray(toRangeValue(value, range)))) {
        return call({
          required,
          range,
          multiple,
        });
      }
    }
  }
  return true;
}
