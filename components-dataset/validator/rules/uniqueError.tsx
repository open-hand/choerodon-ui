import isString from 'lodash/isString';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { isEmpty } from '../../utils';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';
import { axiosConfigAdapter } from '../../data-set/utils';
import { FieldType } from '../../data-set/enum';
import { iteratorSome } from '../../iterator-helper';
import math from '../../math';

export default function uniqueError(
  value: any,
  props: ValidatorBaseProps,
  getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T],
): PromiseLike<methodReturn> | methodReturn {
  const { dataSet, record, name } = props;
  if (!isEmpty(value) && dataSet && record && name) {
    const unique = getProp('unique');
    if (unique) {
      const multiple = getProp('multiple');
      if (!multiple) {
        const range = getProp('range');
        if (!range) {
          const myField = dataSet.getField(name);
          if (myField && getProp('type') === FieldType.object) {
            value = value[myField.get('valueField', record)];
            if (isEmpty(value)) {
              return true;
            }
          }
          if (myField) {
            let dirty = myField.isDirty(record);
            const fields = { [name]: value };
            if (!dirty) {
              return true;
            }
            if (
              isString(unique) &&
              iteratorSome(dataSet.fields.entries(), ([fieldName, field]) => {
                if (
                  fieldName !== name &&
                  field &&
                  field.get('unique', record) === unique &&
                  !field.get('multiple', record) &&
                  !field.get('range', record)
                ) {
                  const otherValue = record.get(fieldName);
                  if (isEmpty(otherValue)) {
                    return true;
                  }
                  if (!dirty && field.isDirty(record)) {
                    dirty = true;
                  }
                  if (field && field.get('type', record) === FieldType.object) {
                    const otherObjectValue = otherValue[field.get('valueField', record)];
                    if (isEmpty(otherObjectValue)) {
                      return true;
                    }
                    fields[fieldName] = otherObjectValue;
                  } else {
                    fields[fieldName] = otherValue;
                  }
                }
                return false;
              })
            ) {
              return true;
            }
            const invalid = dataSet.some(
              item =>
                item !== record &&
                Object.keys(fields).every(field => {
                  const fieldValue = fields[field];
                  const dataSetField = dataSet.getField(name);
                  if (dataSetField && dataSetField.get('type', record) === FieldType.object) {
                    const valueField = dataSetField.get('valueField', record);
                    return fieldValue === item.get(field)[valueField];
                  }
                  if (math.isBigNumber(fieldValue)) {
                    return math.eq(fieldValue, item.get(field));
                  }
                  return fieldValue === item.get(field);
                }),
            );
            const call = ($invalid: boolean): methodReturn => {
              if ($invalid) {
                const ruleName = 'uniqueError';
                const {
                  [ruleName]: validationMessage = $l('Validator', 'unique'),
                } = getProp('defaultValidationMessages') || {};
                return new ValidationResult({
                  validationProps: {
                    unique,
                    multiple,
                    range,
                  },
                  validationMessage,
                  value,
                  ruleName,
                });
              }
              return true;
            };
            if (!invalid) {
              const newConfig = axiosConfigAdapter('validate', dataSet, { unique: [fields] });
              if (newConfig.url) {
                const resultsPromise: any = dataSet.axios(newConfig);
                return resultsPromise.then(results => {
                  return call([].concat(results).some(result => !result));
                });
              }
            }
            return call(invalid);
          }
        }
      }
    }
  }
  return true;
}
