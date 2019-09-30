import isString from 'lodash/isString';
import { FieldFormat, FieldTrim } from '../data-set/enum';
import { transformString, trimString } from './utils';

export interface FormatOptions {
  trim?: FieldTrim;
  format?: FieldFormat | string;
}

export default function formatString(value: any, { trim, format }: FormatOptions) {
  if (isString(value)) {
    return transformString(trimString(value, trim), format);
  }
  return value;
}
