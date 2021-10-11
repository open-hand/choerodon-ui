import isString from 'lodash/isString';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import isEmpty from '../../_util/isEmpty';
import { methodReturn, ValidatorProps } from '.';
import { axiosConfigAdapter } from '../../data-set/utils';
import { FieldType } from '../../data-set/enum';
import { iteratorSome } from '../../_util/iteratorUtils';

export default async function uniqueError(
  value: any,
  props: ValidatorProps,
): Promise<methodReturn> {
  const { dataSet, record, unique, name, multiple, range, defaultValidationMessages } = props;
  if (!isEmpty(value) && dataSet && record && unique && name && !multiple && !range) {
    const myField = dataSet.getField(name);
    if (myField && myField.get('type', record) === FieldType.object) {
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
      let invalid = dataSet.some(
        item =>
          item !== record &&
          Object.keys(fields).every(field => {
            const dataSetField = dataSet.getField(name);
            if (dataSetField && dataSetField.get('type', record) === FieldType.object) {
              const valueField = dataSetField.get('valueField', record);
              return fields[field] === item.get(field)[valueField];
            }
            return fields[field] === item.get(field);
          }),
      );
      if (!invalid) {
        const newConfig = axiosConfigAdapter('validate', dataSet, { unique: [fields] });
        if (newConfig.url) {
          const results: any = await dataSet.axios(newConfig);
          invalid = [].concat(results).some(result => !result);
        }
      }
      if (invalid) {
        const ruleName = 'uniqueError';
        const {
          [ruleName]: validationMessage = $l('Validator', 'unique'),
        } = defaultValidationMessages;
        return new ValidationResult({
          validationMessage,
          value,
          ruleName,
        });
      }
    }
  }
  return true;
}
