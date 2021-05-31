import { isValidElement, ReactNode } from 'react';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { isArrayLike } from 'mobx';
import moment from 'moment';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FieldType } from '../data-set/enum';
import Field, { HighlightProps } from '../data-set/Field';

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
