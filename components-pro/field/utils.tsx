import React from 'react';
import Field from '../data-set/Field';
import { BooleanValue, FieldType } from '../data-set/enum';
import CheckBox from '../check-box/CheckBox';
import { formatCurrency, formatNumber } from '../number-field/utils';
import { Lang } from '../locale-context/enum';

export default function processFieldValue(value, field: Field, lang: Lang) {
  const { type } = field;
  if (type === FieldType.boolean) {
    return <CheckBox disabled checked={value === field.get(BooleanValue.trueValue)} />;
  } else if (type === FieldType.number) {
    return formatNumber(value, lang);
  } else if (type === FieldType.currency) {
    return formatCurrency(value, lang, {
      currency: this.getProp('currency'),
    });
  }
  return field.getText(value);
}
