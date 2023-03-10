import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import cssUnitConverter from 'css-unit-converter';

export function pxToRem(num?: number | string | null): string | undefined {
  let rootFontSize = 100;
  if (window && window.document && window.getComputedStyle) {
    const rootFontSizePx = window.getComputedStyle(document.documentElement).fontSize;
    if (typeof rootFontSizePx === 'string' && rootFontSizePx.endsWith('px')) {
      rootFontSize = parseFloat(rootFontSizePx.replace('px', ''));
      rootFontSize = isNaN(rootFontSize) ? 100 : rootFontSize;
    }
  }
  if (num !== undefined && num !== null) {
    if (num === 0) {
      return '0';
    }
    if (isNumber(num)) {
      return `${num / rootFontSize}rem`;
    }
    return num;
  }
}

const builtInHeight = [
  'auto',
  'fit-content',
  'max-content',
  'min-content',
  'inherit',
  'initial',
  'unset',
  'revert',
  'available',
  '-webkit-fit-content',
  '-moz-max-content',
  '-moz-min-content',
  '-moz-initial',
];

const calcReg = /^calc\(([^()]*)\)$/;
const unitReg = /^(-?[\d.]+)([^\d.-]+)$/;

export function isCalcSize(num: string) {
  return num.match(calcReg);
}

export function toPx(num?: number | string | null): number | undefined {
  if (num !== undefined && num !== null) {
    if (isNumber(num)) {
      return num;
    }
    if (isString(num) && !builtInHeight.includes(num) && !num.endsWith('%')) {
      const calcMatches = isCalcSize(num);
      if (calcMatches) {
        try {
          const list = calcMatches[1].split(' ');
          return list.slice(1).reduce<number | undefined>((result, calc, index, array) => {
            if (index % 2 === 1) {
              /* eslint-disable-next-line no-eval */
              return eval(`${result}${array[index - 1]}${toPx(calc)}`);
            }
            return result;
          }, toPx(list[0]));
        } catch (e) {
          console.error(`Invalid property value in "${num}".`);
          return undefined;
        }
      }
      const unitMatches = num.match(unitReg);
      if (unitMatches) {
        const [, n, u] = unitMatches;
        if (n) {
          const number = Number(n);
          if (u && u !== 'px') {
            if (u === 'vh') {
              return document.documentElement.clientHeight * number / 100;
            }
            if (u === 'vw') {
              return document.documentElement.clientWidth * number / 100;
            }
            if (['rem', 'em'].includes(u)) {
              return number * 100;
            }
            try {
              return cssUnitConverter(number, u, 'px');
            } catch (e) {
              return undefined;
            }
          }
          return number;
        }
      }
    }
  }
}
