import isNil from 'lodash/isNil';

export default function isEmpty(value: any, allowBlank = false): boolean {
  return isNil(value) || (allowBlank ? false : value === '');
}
