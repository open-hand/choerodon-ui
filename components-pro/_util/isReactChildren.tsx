import { isValidElement, ReactNode } from 'react';
import { isArrayLike } from 'mobx';

export default function isReactChildren(element: ReactNode) {
  if (element) {
    if (isArrayLike(element)) {
      return element.some(isReactChildren);
    }
    return isValidElement(element);
  }
  return false;
}
