import isNil from 'lodash/isNil';

export default function isEmpty(value: any, allowBlank: boolean = false): boolean {
  return isNil(value) || (allowBlank ? false : value === '');
}
