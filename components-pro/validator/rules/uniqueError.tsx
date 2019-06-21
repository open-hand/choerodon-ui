import isString from 'lodash/isString';
import { action } from 'mobx';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import isEmpty from '../../_util/isEmpty';
import Field from '../../data-set/Field';
import { methodReturn } from '.';
import { axiosAdapter } from '../../data-set/utils';

const reportOtherField = action(({ validator, validator: { validity } }: Field, invalid: boolean) => {
  if (invalid) {
    if (validity.valid) {
      validator.validationMessage = $l('Validator', 'unique');
    }
    validity.uniqueError = true;
  } else {
    validity.uniqueError = false;
    if (validity.valid) {
      validator.validationMessage = '';
    }
  }
});

export default async function uniqueError(value, { dataSet, record, unique, name }): Promise<methodReturn> {
  if (!isEmpty(value) && record && dataSet && unique) {
    const fields = { [name]: value };
    const otherFields: Field[] = [];
    if (isString(unique)) {
      for (const [fieldName, field] of record.fields.entries()) {
        if (fieldName !== name) {
          if (field && field.get('unique') === unique) {
            const otherValue = record.get(fieldName);
            if (isEmpty(otherValue)) {
              return true;
            }
            fields[fieldName] = otherValue;
            otherFields.push(field);
          }
        }
      }
    }
    let invalid = dataSet.data.some(item => item !== record && Object.keys(fields).every(field => fields[field] === item.get(field)));
    if (!invalid) {
      const { totalPage, axios, transport: { validate = {}, adapter } } = dataSet;
      const newConfig = axiosAdapter(validate, this, { unique: [fields] });
      const adapterConfig = adapter(newConfig, 'validate') || newConfig;
      if (adapterConfig.url && totalPage > 1) {
        const results: any = await axios(adapterConfig);
        invalid = [].concat(results).some(result => !result);
      }
    }
    otherFields.forEach(otherField => reportOtherField(otherField, invalid));
    if (invalid) {
      return new ValidationResult({
        validationMessage: $l('Validator', 'unique'),
        value,
        ruleName: 'uniqueError',
      });
    }
  }
  return true;
}
