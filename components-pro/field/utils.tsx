import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import { isArrayLike } from 'mobx';

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
