import isEqual from 'lodash/isEqual';
import isEmpty from './isEmpty';

export default function isSame(newValue, oldValue) {
  return (isEmpty(newValue) && isEmpty(oldValue)) || isEqual(newValue, oldValue);
}
