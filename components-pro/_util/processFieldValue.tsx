import React from 'react';
import Field from '../data-set/Field';
import { BooleanValue, FieldType } from '../data-set/enum';
import ObserverCheckBox from '../check-box/CheckBox';
import { Lang } from '../locale-context/enum';
import formatNumber from '../formatter/formatNumber';
import formatCurrency from '../formatter/formatCurrency';

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
