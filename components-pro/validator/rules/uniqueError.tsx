import isString from 'lodash/isString';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import isEmpty from '../../_util/isEmpty';
import { methodReturn, ValidatorProps } from '.';
import axiosAdapter from '../../_util/axiosAdapter';

export default async function uniqueError(
  value: any,
  props: ValidatorProps,
): Promise<methodReturn> {
  const { dataSet, record, unique, name, multiple, range, defaultValidationMessages } = props;
  if (!isEmpty(value) && dataSet && record && unique && name && !multiple && !range) {
    const myField = record.getField(name);
    if (myField) {
      let { dirty } = myField;
      const fields = { [name]: value };
      if (
        isString(unique) &&
        [...record.fields.entries()].some(([fieldName, field]) => {
          if (
            fieldName !== name &&
            field &&
            field.get('unique') === unique &&
            !field.get('multiple') &&
            !field.get('range')
          ) {
            const otherValue = record.get(fieldName);
            if (isEmpty(otherValue)) {
              return true;
            }
            if (!dirty && field.dirty) {
              dirty = true;
            }
            fields[fieldName] = otherValue;
          }
          return false;
        })
      ) {
        return true;
      }
      if (!dirty) {
        return true;
      }
      let invalid = dataSet.data.some(
        item =>
          item !== record && Object.keys(fields).every(field => fields[field] === item.get(field)),
      );
      if (!invalid) {
        const {
          axios,
          transport: { validate = {}, adapter },
        } = dataSet;
        const newConfig = axiosAdapter(validate, this, { unique: [fields] });
        const adapterConfig = adapter(newConfig, 'validate') || newConfig;
        if (adapterConfig.url) {
          const results: any = await axios(adapterConfig);
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
