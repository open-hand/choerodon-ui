import capitalize from 'lodash/capitalize';
import { FieldFormat, FieldTrim, FieldType } from '../data-set/enum';

let supportsLocales;

export function toLocaleStringSupportsLocales() {
  if (supportsLocales === undefined) {
    try {
      (0).toLocaleString('i');
      supportsLocales = false;
    } catch (e) {
      supportsLocales = e.name === 'RangeError';
    }
  }
  return supportsLocales;
}

export function getNumberFormatOptions(
  type: FieldType,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions {
  if (type === FieldType.number) {
    return { style: 'decimal' };
  }
  if (options && options.currency) {
    return { style: 'currency' };
  }
  return { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
}

export function toLocaleStringPolyfill(
  value: number,
  type: FieldType,
  options?: Intl.NumberFormatOptions,
) {
  if (type === FieldType.number) {
    const fraction = String(value).split('.')[1];
    return value.toLocaleString().split('.')[0] + (fraction ? `.${fraction}` : '');
  }
  const currency = options && options.currency;
  return `${currency ? `${currency} ` : ''}${value.toLocaleString()}`;
}

export function trimString(value: string, fieldTrim?: FieldTrim): string {
  if (fieldTrim) {
    switch (fieldTrim) {
      case FieldTrim.both:
        return value.trim();
      case FieldTrim.left:
        return value.trimLeft();
      case FieldTrim.right:
        return value.trimRight();
      default:
    }
  }
  return value;
}

export function transformString(value: string, format?: FieldFormat | string): string {
  if (format) {
    switch (format) {
      case FieldFormat.uppercase:
        return value.toUpperCase();
      case FieldFormat.lowercase:
        return value.toLowerCase();
      case FieldFormat.capitalize:
        return capitalize(value);
      default:
    }
  }
  return value;
}
