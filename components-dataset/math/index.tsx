import BigNumber from 'bignumber.js';

export interface BigNumberOptions {
  /**
   * 强制返回BigNumber, 否则根据结果是否是大数字返回BigNumber还是number
   */
  strict?: boolean;
}

export enum NumberRoundMode {
  round = 'round',
  floor = 'floor',
  ceil = 'ceil',
}

/**
 * 当 BigNumber 能转换为普通数字则返回普通数字
 * @param n1 BigNumber
 * @return BigNumber | number
 */
function fix(number: BigNumber): BigNumber | number {
  return number.toString().length > 15 ? number : number.toNumber();
}

/**
 * 大数字加
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
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
 * @return BigNumber | number
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
 * @return BigNumber | number
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
 * @return BigNumber | number
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
 * @return BigNumber | number
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
 * @return BigNumber | number
 */
function pow(n1: BigNumber.Value, n2: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).pow(n2);
  return options.strict ? result : fix(result);
}

/**
 * 大数字平方根
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
 */
function sqrt(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).sqrt();
  return options.strict ? result : fix(result);
}

/**
 * 格式化小数精度
 * @param n1 string | number | BigNumber
 * @param decimalPlaces number
 * @param numberRoundMode NumberRoundMode
 * @return string
 */
function toFixed(n1: BigNumber.Value, decimalPlaces: number, numberRoundMode?: NumberRoundMode): string {
  const roundMode = numberRoundMode === NumberRoundMode.ceil
    ? BigNumber.ROUND_CEIL
    : numberRoundMode === NumberRoundMode.floor ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_HALF_UP;
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).toFixed(decimalPlaces, roundMode);
}

/**
 * 大数字小于
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @return boolean
 */
function lt(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).lt(n2);
}

/**
 * 大数字小于等于
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @return BigNumber
 */
function lte(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).lte(n2);
}

/**
 * 大数字大于
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @return boolean
 */
function gt(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).gt(n2);
}

/**
 * 大数字大于等于
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @return boolean
 */
function gte(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).gte(n2);
}

/**
 * 大数字等于
 * @param n1 string | number | BigNumber
 * @param n2 string | number | BigNumber
 * @return boolean
 */
function eq(n1: BigNumber.Value, n2: BigNumber.Value): boolean {
  return n1 === n2 || (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).eq(n2);
}

/**
 * 最大值
 * @param n1 A numeric value.
 * @return BigNumber | number
 */
function max(...n1: BigNumber.Value[]): BigNumber | number {
  return fix(BigNumber.max(...n1));
}

/**
 * 最小值
 * @param n1 A numeric value.
 * @return BigNumber | number
 */
function min(...n1: BigNumber.Value[]): BigNumber | number {
  return fix(BigNumber.min(...n1));
}

/**
 * 总和
 * @param n1 A numeric value.
 * @return BigNumber | number
 */
function sum(...n1: BigNumber.Value[]): BigNumber | number {
  return fix(BigNumber.sum(...n1));
}

/**
 * 随机数
 * @param decimalPlaces A numeric value.
 * @param options Options
 * @return BigNumber | number
 */
function random(decimalPlaces?: number, options: BigNumberOptions = {}): BigNumber | number {
  const result = BigNumber.random(decimalPlaces);
  return options.strict ? result : fix(result);
}

/**
 * 类似 Math.round
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
 */
function round(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0);
  return options.strict ? result : fix(result);
}

/**
 * 类似 Math.floor
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
 */

function floor(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0, BigNumber.ROUND_FLOOR);
  return options.strict ? result : fix(result);
}

/**
 * 类似 Math.ceil
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
 */
function ceil(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp(0, BigNumber.ROUND_CEIL);
  return options.strict ? result : fix(result);
}

/**
 * 取负
 * @param n1 string | number | BigNumber
 * @param options Options
 * @return BigNumber | number
 */
function negated(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).negated();
  return options.strict ? result : fix(result);
}

/**
 * 大数字小数位
 * @param n1
 * @return number
 */
function dp(n1: BigNumber.Value): number {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).dp();
}

/**
 * 绝对值
 * @param n1
 * @param options Options
 * @return BigNumber | number
 */
function abs(n1: BigNumber.Value, options: BigNumberOptions = {}): BigNumber | number {
  const result = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).abs();
  return options.strict ? result : fix(result);
}

/**
 * 判断是不是 BigNumber
 * @param n1 any
 * @return boolean
 */
function isBigNumber(v1: any): v1 is BigNumber {
  return BigNumber.isBigNumber(v1);
}

/**
 * 判断 BigNumber 是不是有限可用数
 * @param n1 BigNumber
 * @return boolean
 */
function isValidBigNumber(n1: BigNumber): boolean {
  return !n1.isNaN() && n1.isFinite();
}

/**
 * 判断数字是不是有限可用数
 * @param n1 BigNumber.Value
 * @return boolean
 */
function isValidNumber(n1: BigNumber.Value): boolean {
  return !isNaN(n1) && isFinite(n1);
}

/**
 * 判断是不是有限数
 * @param n1 string | number | BigNumber
 * @return boolean
 */
function isFinite(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isFinite();
}

/**
 * 判断是不是 NaN
 * @param n1 string | number | BigNumber
 * @return boolean
 */
function isNaN(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isNaN();
}

/**
 * 判断是不是负数
 * @param n1 string | number | BigNumber
 * @return boolean
 */
function isNegative(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isNegative();
}

/**
 * 判断是不是0
 * @param n1 string | number | BigNumber
 * @return boolean
 */
function isZero(n1: BigNumber.Value): boolean {
  return (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1)).isZero();
}

/**
 * 判断是不是-0
 * @param n1 string | number | BigNumber
 * @return boolean
 */
function isNegativeZero(n1: BigNumber.Value): boolean {
  const value = BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1);
  return value.isZero() && value.isNegative();
}

/**
 * 转换成字符串， 永远不会转换成科学计数法
 * @param n1 string | number | BigNumber
 * @return string
 */
function toString(n1: BigNumber.Value): string {
  BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
  const value = (BigNumber.isBigNumber(n1) ? n1 : new BigNumber(n1));
  if (isNaN(value)) {
    return '';
  }
  return value.toString();
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
  lt,
  lte,
  gt,
  gte,
  eq,
  round,
  floor,
  ceil,
  dp,
  max,
  min,
  abs,
  negated,
  random,
  sum,
  isFinite,
  isNaN,
  isNegative,
  isZero,
  isNegativeZero,
  isBigNumber,
  isValidNumber,
  isValidBigNumber,
  toFixed,
  toString,
};

