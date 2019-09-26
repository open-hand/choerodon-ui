import isString from 'lodash/isString';
import { FieldTrim } from '../data-set/enum';

export default function trim(value: any, fieldTrim?: FieldTrim): any {
  if (fieldTrim && isString(value)) {
    switch (fieldTrim) {
      case FieldTrim.both:
        return value.trim();
      case FieldTrim.left:
        return value.trimLeft();
      case FieldTrim.right:
        return value.trimRight();
      default:
    }
  }
  return value;
}
