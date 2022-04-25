import BigNumber from 'bignumber.js';

export interface BigNumberOptions {
  /**
   * 强制返回BigNumber, 否则根据结果是否是大数字返回BigNumber还是number
   */
  strict?: boolean;
}

function fix(number: BigNumber): BigNumber | number {
  return number.toString().length > 15 ? number : number.toNumber();
}

/**
 * 大数字加
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function plus(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).plus(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字减
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function minus(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).minus(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字乘以
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function multipliedBy(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).multipliedBy(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字除以
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function div(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).div(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字模
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function mod(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).mod(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字幂
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function pow(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).pow(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字平方根
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function sqrt(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).sqrt();
  return options.strict ? result : fix(result);
}

function toFixed(n1: BigNumber.Value, decimalPlaces: number): string {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).toFixed(decimalPlaces);
}

/**
 * 大数字小于
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function lt(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).lt(n2);
}

/**
 * 大数字小于等于
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function lte(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).lte(n2);
}

/**
 * 大数字大于
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function gt(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).gt(n2);
}

/**
 * 大数字大于等于
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function gte(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).gte(n2);
}

/**
 * 大数字等于
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber
 */
function eq(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).eq(n2);
}


/**
 * 类似 Math.round
 * @param n1 string | number | BigNumber
 * @param options Options
 */
function round(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0);
  return options.strict ? result : fix(result);
}

/**
 * 类似 Math.floor
 * @param n1 string | number | BigNumber
 * @param options Options
 */

function floor(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0, BigNumber.ROUND_FLOOR);
  return options.strict ? result : fix(result);
}

/**
 * 类似 Math.ceil
 * @param n1 string | number | BigNumber
 * @param options Options
 */
function ceil(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0, BigNumber.ROUND_CEIL);
  return options.strict ? result : fix(result);
}

/**
 * 大数字小数位
 * @param n1
 */
function dp(n1: BigNumber.Value): number {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp();
}

function isBigNumber(v1: any): v1 is BigNumber {
  return BigNumber.isBigNumber(v1);
}

function isValidBigNumber(n1: BigNumber): boolean {
  return !n1.isNaN() && n1.isFinite();
}

function isFinite(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isFinite();
}

function isNaN(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isNaN();
}

export default {
  fix,
  plus,
  minus,
  multipliedBy,
  div,
  mod,
  pow,
  sqrt,
  toFixed,
  lt,
  lte,
  gt,
  gte,
  eq,
  round,
  floor,
  ceil,
  dp,
  isFinite,
  isNaN,
  isBigNumber,
  isValidBigNumber,
};

