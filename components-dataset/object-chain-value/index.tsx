import isObject from 'lodash/isObject';
import { isArrayLike, observable } from 'mobx';
import { mobxGet, mobxRemove, mobxSet } from '../mobx-helper';
import Field, { Fields } from '../data-set/Field';
import Record from '../data-set/Record';

export function get(obj: object | undefined | null, prop: string): any {
  if (obj === null) {
    return null;
  }
  if (obj !== undefined) {
    const index = prop.indexOf('.');
    if (index !== -1) {
      const key = prop.slice(0, index);
      const restKey = prop.slice(index + 1);
      const value = mobxGet(obj, key);
      if (value === null) {
        return null;
      }
      if (isArrayLike(value)) {
        return value.map(item => get(item, restKey)).filter(item => !!item || item === false || item === 0);
      }
      if (isObject(value)) {
        return get(value, restKey);
      }
    } else {
      return mobxGet(obj, prop);
    }
  }
}

export function set(
  data: object,
  prop: string,
  value: any,
  fields: Fields = observable.map<string, Field>(),
  record?: Record,
): any {
  const index = prop.indexOf('.');
  if (index !== -1) {
    const key = prop.slice(0, index);
    if (!data[key] && value !== undefined) {
      const field = fields.get(key);
      if (field && field.get('multiple', record)) {
        mobxSet(data, key, []);
      } else {
        mobxSet(data, key, {});
      }
    }
    const obj = mobxGet(data, key);
    if (isArrayLike(obj)) {
      if (isArrayLike(value)) {
        value.forEach((item, i) => {
          if (obj.length === i) {
            obj.push({});
          } else if (!obj[i]) {
            obj[i] = {};
          }
          set(obj[i], prop.slice(index + 1), item);
        });
      }
    } else if (isObject(obj)) {
      set(obj, prop.slice(index + 1), value);
    }
  } else {
    mobxSet(data, prop, value);
  }
}

export function remove(obj: object, prop: string) {
  const index = prop.indexOf('.');
  if (index !== -1) {
    const value = mobxGet(obj, prop.slice(0, index));
    if (value) {
      const restKey = prop.slice(index + 1);
      if (isArrayLike(value)) {
        value.forEach(item => remove(item, restKey));
      } else if (isObject(value)) {
        remove(value, restKey);
      }
    }
  } else {
    mobxRemove(obj, prop);
  }
}

export default {
  get,
  set,
  remove,
};
