import { FieldType } from '../data-set/enum';
import normalizeLanguage from '../_util/normalizeLanguage';

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
  min: number = -MAX_SAFE_INTEGER,
  max: number = MAX_SAFE_INTEGER,
): number[] | undefined {
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

function getNumberFormatOptions(
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

function toLocaleStringPolyfill(
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

export function formatNumber(value, lang: string, options?: Intl.NumberFormatOptions) {
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

export function formatCurrency(value, lang: string, options?: Intl.NumberFormatOptions) {
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
