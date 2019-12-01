import { Moment } from 'moment';
import defaultTo from 'lodash/defaultTo';

export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 2 ** 53 - 1;

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

export function getNearStepValues(
  value: number,
  step: number,
  min?: number | Moment | null,
  max?: number | Moment | null,
): number[] | undefined {
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
  return values;
}
