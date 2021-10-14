import { isMoment, Moment, unitOfTime } from 'moment';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import { TimeStep } from '../date-picker/DatePicker';
import { TimeUnit } from '../date-picker/enum';
import defaultFormatNumber from '../formatter/formatNumber';

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 2 ** 53 - 1;
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -(2 ** 53 - 1);

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

export function parseNumber(value: any, precision?: number): number {
  if (isNil(precision)) {
    return Number(value);
  }
  return Number(defaultFormatNumber(value, undefined, {
    maximumFractionDigits: precision!,
    useGrouping: false,
  }));
}
