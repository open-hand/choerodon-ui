import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import { isArrayLike } from 'mobx';
import { FieldType } from '../data-set/enum';
import Constants from '../data-set/Constants';
import Field from '../data-set/Field';

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
  switch (type) {
    case FieldType.date:
      return Constants.DATE_FORMAT;
    case FieldType.dateTime:
      return Constants.DATE_TIME_FORMAT;
    case FieldType.week:
      return Constants.WEEK_FORMAT;
    case FieldType.month:
      return Constants.MONTH_FORMAT;
    case FieldType.year:
      return Constants.YEAR_FORMAT;
    case FieldType.time:
      return Constants.TIME_FORMAT;
    default:
      return Constants.DATE_FORMAT;
  }
}

export function getDateFormatByField(field?: Field, type?: FieldType): string {
  if (field) {
    return field.get('format') || getDateFormatByFieldType(type || field.type);
  }
  if (type) {
    return getDateFormatByFieldType(type);
  }
  return Constants.DATE_JSON_FORMAT;
}
