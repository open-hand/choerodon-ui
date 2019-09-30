import {
  getNumberFormatOptions,
  toLocaleStringPolyfill,
  toLocaleStringSupportsLocales,
} from './utils';
import normalizeLanguage from '../_util/normalizeLanguage';
import { FieldType } from '../data-set/enum';

export default function formatCurrency(value, lang: string, options?: Intl.NumberFormatOptions) {
  const v = parseFloat(value);
  if (!isNaN(v)) {
    if (toLocaleStringSupportsLocales()) {
      return v.toLocaleString(normalizeLanguage(lang), {
        ...getNumberFormatOptions(FieldType.currency, options),
        ...options,
      });
    }
    return toLocaleStringPolyfill(v, FieldType.currency, options);
  }
  return value;
}
