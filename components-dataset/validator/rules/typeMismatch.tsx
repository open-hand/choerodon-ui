import { isMoment } from 'moment';
import { isEmpty, toRangeValue } from '../../utils';
import ValidationResult from '../ValidationResult';
import localeContext, { $l } from '../../locale-context';
import { FieldType } from '../../data-set/enum';
import { mobxGet } from '../../mobx-helper';
import { methodReturn, ValidatorBaseProps, ValidatorProps } from '.';

/* eslint-disable */
export const emailReg = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
export const urlReg = /^(?:(?:https?|HTTPS?|ftp|FTP):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]-*)*[a-zA-Z\u00a1-\uffff0-9]+)*)(?::\d{2,5})?(?:[\/?#]\S*)?$/;
export const colorRgbaReg = /^[rR][gG][Bb][Aa]?\((\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,){2}\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,?\s*(0?\.\d{1,2}|1|0)?\s*\){1}$/;
export const colorHexReg = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})$/;
/* eslint-enable */

const isNotDateIf = (value, range) => {
  if (range) {
    return toRangeValue(value, range).some(
      item => !isEmpty(item) && (isMoment(item) && !item.isValid()),
    );
  }
  return isMoment(value) && !value.isValid();
};

const isNotDate = (value, range) => {
  if (range) {
    return toRangeValue(value, range).some(
      item => !isEmpty(item) && (!isMoment(item) || !item.isValid()),
    );
  }
  return !isMoment(value) || !value.isValid();
};

const types: {
  [key: string]: [
    ((value: any, range?: boolean | [string, string]) => boolean),
    'EmailField' | 'UrlField' | 'DatePicker' | 'ColorPicker',
    'type_mismatch_email' | 'type_mismatch_url' | 'type_mismatch_color' | 'type_mismatch_date'
  ];
} = {
  [FieldType.email]: [value => !emailReg.test(value), 'EmailField', 'type_mismatch_email'],
  [FieldType.url]: [value => !urlReg.test(value), 'UrlField', 'type_mismatch_url'],
  [FieldType.color]: [
    value => !(colorRgbaReg.test(value) || colorHexReg.test(value)),
    'ColorPicker',
    'type_mismatch_color',
  ],
  [FieldType.date]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.dateTime]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.week]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.month]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.quarter]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.year]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.time]: [isNotDate, 'DatePicker', 'type_mismatch_date'],
  [FieldType.auto]: [isNotDateIf, 'DatePicker', 'type_mismatch_date'],
};

export default function typeMismatch(value: any, _: ValidatorBaseProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]): methodReturn {
  if (!isEmpty(value)) {
    const type = getProp('type');
    if (type) {
      const validateType = types[type];
      if (validateType) {
        const [validate, component, validatorKey] = validateType;
        const range = getProp('range');
        if (validate(value, range)) {
          const ruleName = 'typeMismatch';
          const locale = localeContext.getCmp(component);
          const {
            [ruleName]: validationMessage = locale ? mobxGet(locale, 'type_mismatch') : $l('Validator', validatorKey),
          } = getProp('defaultValidationMessages') || {};
          return new ValidationResult({
            validationProps: {
              type,
              range,
            },
            validationMessage,
            value,
            ruleName,
          });
        }
      }
    }
  }
  return true;
}
