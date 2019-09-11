import React from 'react';
import Field from '../data-set/Field';
import { BooleanValue, FieldType } from '../data-set/enum';
import ObserverCheckBox from '../check-box/CheckBox';
import { formatCurrency, formatNumber } from '../number-field/utils';
import { Lang } from '../locale-context/enum';

export default function processFieldValue(
  value,
  field: Field,
  lang: Lang,
  showValueIfNotFound?: boolean,
) {
  const { type } = field;
  if (type === FieldType.boolean) {
    return <ObserverCheckBox disabled checked={value === field.get(BooleanValue.trueValue)} />;
  }
  if (type === FieldType.number) {
    return formatNumber(value, lang);
  }
  if (type === FieldType.currency) {
    return formatCurrency(value, lang, {
      currency: this.getProp('currency'),
    });
  }
  return field.getText(value, showValueIfNotFound);
}
