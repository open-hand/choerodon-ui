import moment, { isMoment, Moment, unitOfTime } from 'moment';
import { get, isArrayLike, isObservableObject } from 'mobx';
import warn from 'warning';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import { TimeStep } from '../interface';
import { TimeUnit } from '../enum';
import Field from '../data-set/Field';
import { FieldType } from '../data-set/enum';
import Record from '../data-set/Record';
import { Config, ConfigKeys, DefaultConfig, getConfig } from '../configure';
import { formatNumber } from '../formatter';

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 2 ** 53 - 1;
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || 1 - 2 ** 53;

const warned: { [msg: string]: boolean } = {};

export function warning(valid: boolean, message: string): void {
  if (!valid && !warned[message]) {
    warn(false, message);
    warned[message] = true;
  }
}

export function isEmpty(value: any, allowBlank = false): boolean {
  return isNil(value) || (allowBlank ? false : value === '');
}

export function isSame(newValue, oldValue) {
  return (isEmpty(newValue) && isEmpty(oldValue)) || isEqual(newValue, oldValue);
}

export function isSameLike(newValue, oldValue) {
  /* eslint-disable-next-line */
  return isSame(newValue, oldValue) || newValue == oldValue;
}


export function parseNumber(value: any, precision?: number): number {
  if (isNil(precision)) {
    return Number(value);
  }
  return Number(formatNumber(value, undefined, {
    maximumFractionDigits: precision!,
    useGrouping: false,
  }));
}

export function getPrecision(value: number): number {
  const valueString = value.toString();
  if (valueString.indexOf('e-') >= 0) {
    return parseInt(valueString.slice(valueString.indexOf('e-') + 2), 10);
  }
  if (valueString.indexOf('.') >= 0) {
    return valueString.length - valueString.indexOf('.') - 1;
  }
  return 0;
}

function getMaxPrecision(value: number, step: number): number {
  const stepPrecision = getPrecision(step);
  const currentValuePrecision = getPrecision(value);
  if (!value) {
    return stepPrecision;
  }
  return Math.max(currentValuePrecision, stepPrecision);
}

function getPrecisionFactor(value: number, step: number): number {
  return 10 ** getMaxPrecision(value, step);
}

function precisionFix(value: number, precisionFactor: number): number {
  return Math.round(value * precisionFactor);
}

export function plus(...values: number[]) {
  if (values.length > 2) {
    return plus(values.shift() as number, plus(...values));
  }
  if (values.length < 2) {
    return values[0];
  }
  const v1 = values[0];
  const v2 = values[1];
  const precisionFactor = getPrecisionFactor(v1, v2);
  return (precisionFix(v1, precisionFactor) + precisionFix(v2, precisionFactor)) / precisionFactor;
}

function getBeforeStepValue(value: number, minFactor: number, stepFactor: number): number {
  return value - ((value - minFactor) % stepFactor);
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

export function getNearStepValues<T extends Moment | number>(
  value: T,
  step: number | TimeStep,
  min?: number | Moment | null,
  max?: number | Moment | null,
): T[] | undefined {
  if (isNumber(step)) {
    if (isNumber(value)) {
      min = defaultTo(Number(min), -MAX_SAFE_INTEGER);
      max = defaultTo(Number(max), MAX_SAFE_INTEGER);
      const precisionFactor = getPrecisionFactor(value, step);
      const valueFactor = precisionFix(value, precisionFactor);
      const minFactor = precisionFix(min, precisionFactor);
      const minFactorBase = min === -MAX_SAFE_INTEGER ? 0 : minFactor;
      const maxFactor = precisionFix(max, precisionFactor);
      const stepFactor = precisionFix(step, precisionFactor);
      let beforeStepFactor = getBeforeStepValue(valueFactor, minFactorBase, stepFactor);
      if (beforeStepFactor === valueFactor) {
        return undefined;
      }
      if (beforeStepFactor > maxFactor) {
        beforeStepFactor = getBeforeStepValue(maxFactor, minFactorBase, stepFactor);
      } else if (beforeStepFactor < minFactor) {
        beforeStepFactor = minFactor;
      }
      const afterStepFactor = beforeStepFactor + stepFactor;
      const values: number[] = [beforeStepFactor / precisionFactor];
      if (afterStepFactor <= maxFactor) {
        values.push(afterStepFactor / precisionFactor);
      }
      return values as T[];
    }
  } else if (isMoment(value)) {
    const { hour, minute, second } = step;
    if (second) {
      return getNearStepMoments(value, second, TimeUnit.second) as T[];
    }
    if (minute) {
      return getNearStepMoments(value, minute, TimeUnit.minute) as T[];
    }
    if (hour) {
      return getNearStepMoments(value, hour, TimeUnit.hour) as T[];
    }
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
  getPrecision,
  plus,
  getNearStepValues,
  getDateFormatByFieldType,
  getDateFormatByField,
  toLocaleStringSupportsLocales,
  getNumberFormatOptions,
  toLocaleStringPolyfill,
  toRangeValue,
  normalizeLanguage,
};
