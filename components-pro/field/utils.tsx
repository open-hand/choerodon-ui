import { isValidElement, ReactNode } from 'react';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import { isArrayLike } from 'mobx';
import moment from 'moment';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FieldType } from '../data-set/enum';
import Field, { HighlightProps } from '../data-set/Field';
import { FormField, FormFieldProps } from './FormField';
import formatCurrency from '../formatter/formatCurrency';
import formatNumber from '../formatter/formatNumber';
import { FormatNumberFuncOptions } from '../number-field/NumberField';
import { getPrecision } from '../number-field/utils';

export function toRangeValue(value: any, range?: boolean | [string, string]): [any, any] {
  if (isArrayLike(range)) {
    if (isObject(value)) {
      const [start, end] = range;
      return [value[start], value[end]];
    }
  } else if (isArrayLike(value)) {
    return value.slice(0, 2) as [any, any];
  }
  return [undefined, undefined];
}

export function fromRangeValue(value: any[], range?: boolean | [string, string]): any {
  if (isArrayLike(range)) {
    const [start, end] = range;
    return {
      [start]: value[0],
      [end]: value[1],
    };
  }
  return value;
}

export function toMultipleValue(value: any, range?: boolean | [string, string]) {
  if (!isNil(value)) {
    const multipleValue = isArrayLike(value) ? value.slice() : [value];
    if (range) {
      return multipleValue.map(item => toRangeValue(item, range));
    }
    return multipleValue;
  }
  return [];
}

export function getDateFormatByFieldType(type: FieldType) {
  const formatter = getConfig('formatter');
  switch (type) {
    case FieldType.date:
      return formatter.date;
    case FieldType.dateTime:
      return formatter.dateTime;
    case FieldType.week:
      return formatter.week;
    case FieldType.month:
      return formatter.month;
    case FieldType.year:
      return formatter.year;
    case FieldType.time:
      return formatter.time;
    default:
      return formatter.date;
  }
}

export function getDateFormatByField(field?: Field, type?: FieldType): string {
  if (field) {
    return field.get('format') || getDateFormatByFieldType(type || field.type);
  }
  if (type) {
    return getDateFormatByFieldType(type);
  }
  return getConfig('formatter').jsonDate || moment.defaultFormat;
}

export function transformHighlightProps(highlight: true | ReactNode | HighlightProps, props: HighlightProps): HighlightProps {
  if (isValidElement(highlight) || isString(highlight)) {
    return {
      ...props,
      content: highlight,
    };
  }
  if (isObject(highlight)) {
    return {
      ...props,
      ...highlight,
    };
  }
  return props;
}

export function getCurrencyFormatter(control: FormField) {
  const formatter = control.getProp('formatter');
  if (formatter !== undefined) {
    return formatter;
  }
  const currencyFormatter = getConfig('currencyFormatter');
  if (currencyFormatter !== undefined) {
    return currencyFormatter;
  }
  return formatCurrency;
}

export function getNumberFormatter(control: FormField) {
  const formatter = control.getProp('formatter');
  if (formatter !== undefined) {
    return formatter;
  }
  const numberFieldFormatter = getConfig('numberFieldFormatter');
  if (numberFieldFormatter !== undefined) {
    return numberFieldFormatter;
  }
  return formatNumber;
}

export function getCurrencyFormatOptions(control: FormField): FormatNumberFuncOptions {
  const precision = control.getProp('precision');
  const formatterOptions: FormatNumberFuncOptions = control.getProp('formatterOptions') || {};
  const currencyFormatterOptions: FormatNumberFuncOptions = getConfig('currencyFormatterOptions') || {};
  const lang = formatterOptions.lang || currencyFormatterOptions.lang || control.lang;
  const options: Intl.NumberFormatOptions = {};
  if (isNumber(precision)) {
    options.minimumFractionDigits = precision;
    options.maximumFractionDigits = precision;
  }
  Object.assign(options, currencyFormatterOptions.options, formatterOptions.options);

  const numberGrouping = control.getProp('numberGrouping');
  const currency = control.getProp('currency');
  if (currency) {
    options.currency = currency;
  }
  if (numberGrouping === false) {
    options.useGrouping = false;
  }
  return {
    lang,
    options,
  };
}

export function getNumberFormatOptions(control: FormField, value?: number): FormatNumberFuncOptions {
  const precision = control.getProp('precision');
  const precisionInValue = isNumber(precision) ? precision : getPrecision(isNil(value) ? control.getValue() || 0 : value);
  const formatterOptions: FormatNumberFuncOptions = control.getProp('formatterOptions') || {};
  const numberFieldFormatterOptions: FormatNumberFuncOptions = getConfig('numberFieldFormatterOptions') || {};
  const lang = formatterOptions.lang || numberFieldFormatterOptions.lang || control.lang;
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: precisionInValue,
    ...numberFieldFormatterOptions.options,
    ...formatterOptions.options,
  };
  const numberGrouping = control.getProp('numberGrouping');
  if (numberGrouping === false) {
    options.useGrouping = false;
  }
  return {
    lang,
    options,
  };
}

export function processFieldValue<T extends FormFieldProps>(value, field: Field | undefined, control: FormField<T>, showValueIfNotFound?: boolean) {
  const type = field && field.type;
  const currency = control.getProp('currency');
  if (currency || type === FieldType.currency) {
    const formatOptions = getCurrencyFormatOptions(control);
    return getCurrencyFormatter(control)(value, formatOptions.lang, formatOptions.options);
  }
  if (type === FieldType.number) {
    const formatOptions = getNumberFormatOptions(control, value);
    return getNumberFormatter(control)(value, formatOptions.lang, formatOptions.options);
  }
  if (field) {
    return field.getText(value, showValueIfNotFound);
  }
  return value;
}
