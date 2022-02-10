import isString from 'lodash/isString';
import defaultTo from 'lodash/defaultTo';
import capitalize from 'lodash/capitalize';
import isNil from 'lodash/isNil';
import BigNumber from 'bignumber.js';
import { BigNumberTarget } from '../configure';
import { FieldType, FieldFormat, FieldTrim } from '../data-set/enum';
import {
  getNumberFormatOptions,
  toLocaleStringPolyfill,
  toLocaleStringSupportsLocales,
  normalizeLanguage,
  isValidBigNumber,
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

export function formatBigNumber(value, lang: string | undefined, options?: Intl.NumberFormatOptions, bigNumberTarget?: BigNumberTarget) {
  const valueBig = new BigNumber(value);
  if (!isValidBigNumber(valueBig)) {
    return value;
  }

  let formatOne = '1';
  if (toLocaleStringSupportsLocales()) {
    if (lang && options && options.currency) {
      formatOne = (1).toLocaleString(normalizeLanguage(lang), {
        style: defaultTo(options.style, bigNumberTarget === 'currency' ? 'currency' : 'decimal'),
        currency: options.currency,
        currencyDisplay: options.currencyDisplay,
        maximumFractionDigits: 0,
      });
    }
  } else if (options && options.currency) {
    formatOne = `${options.currency} ${formatOne}`;
  }

  let decimalPlaces = 0;
  const valuePrecision = valueBig.decimalPlaces();
  if (options) {
    const minimumFractionDigits = options.minimumFractionDigits;
    const maximumFractionDigits = options.maximumFractionDigits;
    decimalPlaces = (
      !isNil(minimumFractionDigits)
        ? minimumFractionDigits === maximumFractionDigits
          ? minimumFractionDigits
          : (!isNil(maximumFractionDigits)
            ? (valuePrecision > maximumFractionDigits
              ? maximumFractionDigits : (valuePrecision < minimumFractionDigits ? minimumFractionDigits : valuePrecision))
            : (valuePrecision < minimumFractionDigits
              ? minimumFractionDigits : valuePrecision))
        : (!isNil(maximumFractionDigits) && maximumFractionDigits < valuePrecision ? maximumFractionDigits : valuePrecision)
    );
  }
  const fmt = {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: options && options.useGrouping === false ? '' : ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: '',
  };
  let valueFormat = valueBig.toFormat(decimalPlaces, fmt);
  valueFormat = formatOne.replace(/1|一|١/g, valueFormat);
  return valueFormat;
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

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatFileSize(size: number, unitIndex = 0) {
  if (size < 1024) {
    return `${size}${units[unitIndex]}`;
  }
  return formatFileSize(Math.round(size / 1024), unitIndex + 1);
}
