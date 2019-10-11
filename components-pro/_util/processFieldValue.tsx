import Field from '../data-set/Field';
import { FieldType } from '../data-set/enum';
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
  if (type === FieldType.number) {
    return formatNumber(value, lang);
  }
  if (type === FieldType.currency) {
    return formatCurrency(value, lang, {
      currency: field.get('currency'),
    });
  }
  return field.getText(value, showValueIfNotFound);
}
