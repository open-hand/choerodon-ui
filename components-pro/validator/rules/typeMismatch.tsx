import isEmpty from '../../_util/isEmpty';
import ValidationResult from '../ValidationResult';
import { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { methodReturn, ValidatorProps } from '.';
import { isMoment } from 'moment';

/* eslint-disable */
const emailReg = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
const urlReg = /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?$/;
const colorRgbaReg = /^[rR][gG][Bb][Aa]?\((\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,){2}\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,?\s*(0?\.\d{1,2}|1|0)?\s*\){1}$/;
const colorHexReg = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
/* eslint-enable */

const isDate = value => !isMoment(value) || !value.isValid();

const types: { [key: string]: [((value: any) => boolean), string] } = {
  [FieldType.email]: [value => !emailReg.test(value), 'EmailField'],
  [FieldType.url]: [value => !urlReg.test(value), 'UrlField'],
  [FieldType.color]: [
    value => !(colorRgbaReg.test(value) || colorHexReg.test(value)),
    'ColorPicker',
  ],
  [FieldType.date]: [isDate, 'DatePicker'],
  [FieldType.dateTime]: [isDate, 'DatePicker'],
  [FieldType.week]: [isDate, 'DatePicker'],
  [FieldType.month]: [isDate, 'DatePicker'],
  [FieldType.year]: [isDate, 'DatePicker'],
  [FieldType.time]: [isDate, 'DatePicker'],
};

export default function typeMismatch(value: any, props: ValidatorProps): methodReturn {
  const { type, defaultValidationMessages } = props;
  if (!isEmpty(value) && type) {
    const validateType = types[type];
    if (validateType) {
      const [validate, component] = validateType;
      if (validate(value)) {
        const ruleName = 'typeMismatch';
        const {
          [ruleName]: validationMessage = $l(component, 'type_mismatch'),
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
