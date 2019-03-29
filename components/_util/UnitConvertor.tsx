import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

export function pxToRem(num?: number | string | null): string | undefined {
  if (num !== void 0 && num !== null) {
    if (num === 0) {
      return '0';
    }
    if (isNumber(num)) {
      return num / 100 + 'rem';
    }
    return num;
  }
}

export function toPx(num?: number | string | null): number | undefined {
  if (num !== void 0 && num !== null) {
    if (isNumber(num)) {
      return num;
    }
    if (isString(num) && num !== 'auto' && !num.endsWith('%')) {
      return parseFloat(num) * (num.endsWith('rem') ? 100 : 1);
    }
  }
}
