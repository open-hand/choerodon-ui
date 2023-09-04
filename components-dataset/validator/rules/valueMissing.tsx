import { isArrayLike } from 'mobx';
import isNil from 'lodash/isNil';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { FieldType } from '../../data-set/enum';

function isEmptyArray(value: any): boolean {
  return isEmpty(value) || (isArrayLike(value) && (value.length === 0 || value.every(item => isEmptyArray(item))));
}

export default function valueMissing(value: any, validatorBaseProps: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  const required = getProp('required');
  const call = (validationProps) => {
    const label = getProp('label');
    const injectionOptions = { label };
    const key = label ? 'value_missing' : 'value_missing_no_label';
    const ruleName = label ? 'valueMissing' : 'valueMissingNoLabel';
    const originMessages = getProp('defaultValidationMessages') || {};
    const { [ruleName]: validationMessage = $l('Validator', key) } = !isNil(originMessages.label) && originMessages.label !== label ? {} : originMessages;
    return new ValidationResult({
      validationProps: {
        ...validatorBaseProps,
        ...validationProps,
      },
      validationMessage,
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
