import moment, { Moment, unitOfTime } from 'moment';
import { get, isArrayLike, isObservableObject } from 'mobx';
import warn from 'warning';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import { BigNumber } from 'bignumber.js';
import { TimeStep } from '../interface';
import { TimeUnit } from '../enum';
import Field from '../data-set/Field';
import { FieldType } from '../data-set/enum';
import Record from '../data-set/Record';
import { Config, ConfigKeys, DefaultConfig, getConfig } from '../configure';
import { formatFileSize } from '../formatter';
import math, { BigNumberOptions } from '../math';

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 2 ** 53 - 1;
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || 1 - 2 ** 53;

const warned: { [msg: string]: boolean } = {};

export function warning(valid: boolean, message: string): void {
  if (!valid && !warned[message]) {
    warn(false, message);
    warned[message] = true;
  }
}

export function isEmpty(value: any): value is '' | null | undefined {
  return isNil(value) || value === '';
}

export function isSame(newValue, oldValue) {
  if (newValue === oldValue || (isEmpty(newValue) && isEmpty(oldValue))) {
    return true;
  }
  if (math.isBigNumber(newValue) || math.isBigNumber(oldValue)) {
    return math.eq(newValue, oldValue);
  }
  return isEqual(newValue, oldValue);
}

export function isSameLike(newValue, oldValue) {
  /* eslint-disable-next-line */
  return isSame(newValue, oldValue) || newValue == oldValue;
}

export function parseNumber(value: BigNumber.Value | boolean, precision?: number, strict?: boolean): number | BigNumber {
  if (isBoolean(value)) {
    const result = Number(value);
    return strict ? new BigNumber(result) : result;
  }
  const result = new BigNumber(isNumber(precision) ? math.toFixed(value, precision) : value);
  return strict ? result : math.fix(result);
}

export function parseBigNumber(value: BigNumber.Value, precision?: number): BigNumber {
  return new BigNumber(isNumber(precision) ? math.toFixed(value, precision) : value);
}

function getBeforeStepValue(value: BigNumber.Value, min: BigNumber.Value, step: BigNumber.Value, options?: BigNumberOptions): BigNumber | number {
  return math.minus(value, math.mod(math.minus(value, min, options), step, options), options);
}

function getNearStepMoments(
  value: Moment,
  step: number,
  unit: unitOfTime.Base,
): Moment[] | undefined {
  const unitValue = value.get(unit);
  const mod = unitValue % step;
  if (mod !== 0) {
    const before = unitValue - mod;
    const after = before + step;
    return [value.clone().set(unit, before), value.clone().set(unit, after)];
  }
}

export function getNearStepMomentValues(
  value: Moment,
  step: BigNumber.Value | TimeStep,
): Moment[] | undefined {
  if (!isNumber(step) && !isString(step) && !math.isBigNumber(step)) {
    const { hour, minute, second } = step;
    if (second) {
      return getNearStepMoments(value, second, TimeUnit.second);
    }
    if (minute) {
      return getNearStepMoments(value, minute, TimeUnit.minute);
    }
    if (hour) {
      return getNearStepMoments(value, hour, TimeUnit.hour);
    }
  }
}

export function getNearStepValues(
  value: BigNumber.Value,
  step: BigNumber.Value | TimeStep,
  min?: BigNumber.Value | null,
  max?: BigNumber.Value | null,
  options?: BigNumberOptions,
): BigNumber.Value[] | undefined {
  if (!isEmpty(value) && !!step && (math.isBigNumber(step) || typeof step !== 'object')) {
    min = defaultTo(min, -Infinity);
    max = defaultTo(max, Infinity);
    // min 等于最小安全数时, 且 max 小于 0, 设置 step 计算起点为: Math.floor(max / step) * step
    const actualMin = math.isFinite(min) ? min : math.lt(max, 0) ? math.multipliedBy(math.floor(math.div(max, step, options), options), step, options) : 0;
    let beforeStep: BigNumber.Value = getBeforeStepValue(value, actualMin, step, options);
    if (math.eq(beforeStep, value)) {
      return undefined;
    }
    if (math.gt(beforeStep, max)) {
      beforeStep = getBeforeStepValue(max, actualMin, step, options);
    } else if (math.lt(beforeStep, min)) {
      beforeStep = min;
    }
    const afterStep = math.plus(beforeStep, step, options);
    const values: BigNumber.Value[] = [beforeStep];
    if (math.lte(afterStep, max)) {
      values.push(afterStep);
    }
    return values;
  }
}

export function getGlobalConfig<T extends ConfigKeys>(key: T, field?: Field): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
  if (field) {
    return field.dataSet.getConfig(key);
  }
  return getConfig(key);
}

export function getDateFormatByFieldType(type: FieldType, field?: Field) {
  const formatter = getGlobalConfig('formatter', field);
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
    case FieldType.quarter:
      return formatter.quarter || 'YYYY-[Q]Q';
    default:
      return formatter.date;
  }
}

export function getDateFormatByField(field?: Field, type?: FieldType, record?: Record): string {
  if (field) {
    return field.get('format', record) || getDateFormatByFieldType(type || field.get('type', record), field);
  }
  if (type) {
    return getDateFormatByFieldType(type, field);
  }
  return getGlobalConfig('formatter', field).jsonDate || moment.defaultFormat;
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

export function toRangeValue(value: any, range?: boolean | [string, string]): [any, any] {
  if (isArrayLike(range)) {
    if (isObservableObject(value)) {
      return [get(value, range[0]), get(value, range[1])];
    }
    if (isObject(value)) {
      return [value[range[0]], value[range[1]]];
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

export function normalizeLanguage(language?: string): string | undefined {
  return language && language.replace('_', '-').toLowerCase();
}

export default {
  MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER,
  warning,
  isEmpty,
  isSame,
  isSameLike,
  parseNumber,
  getNearStepValues,
  getDateFormatByFieldType,
  getDateFormatByField,
  getNumberFormatOptions,
  toRangeValue,
  toMultipleValue,
  normalizeLanguage,
  parseBigNumber,
  formatFileSize,
};
