import isString from 'lodash/isString';
import capitalize from 'lodash/capitalize';
import { FieldType, FieldFormat, FieldTrim } from '../data-set/enum';
import {
  getNumberFormatOptions,
  toLocaleStringPolyfill,
  toLocaleStringSupportsLocales,
  normalizeLanguage,
} from '../utils';

export interface FormatOptions {
  trim?: FieldTrim;
  format?: FieldFormat | string;
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

export function formatString(value: any, { trim, format }: FormatOptions) {
  if (isString(value)) {
    return transformString(trimString(value, trim), format);
  }
  return value;
}

export function formatCurrency(value, lang: string | undefined, options?: Intl.NumberFormatOptions) {
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

export function formatNumber(value, lang: string | undefined, options?: Intl.NumberFormatOptions) {
  const v = parseFloat(value);
  if (!isNaN(v)) {
    if (toLocaleStringSupportsLocales()) {
      return v.toLocaleString(normalizeLanguage(lang), {
        ...getNumberFormatOptions(FieldType.number, options),
        ...options,
      });
    }
    return toLocaleStringPolyfill(v, FieldType.number, options);
  }
  return value;
}
const nargs = /\{([0-9a-zA-Z_]+)\}/g;

export function formatTemplate(string: string, args: object | any[], lazy?: boolean) {
  return string.replace(nargs, (match, i, index) => {
    if (string[index - 1] === '{' &&
      string[index + match.length] === '}') {
      return i;
    }
    const has = Object.hasOwnProperty.call(args, i);
    if (has) {
      const result = has ? args[i] : null;
      if (result === null || result === undefined) {
        return '';
      }

      return result;
    }
    return lazy ? `{${i}}` : '';
  });
}
