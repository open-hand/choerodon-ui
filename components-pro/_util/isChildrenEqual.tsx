import { Children, isValidElement, ReactNode } from 'react';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

function isElementEqual(el: ReactNode, other: ReactNode) {
  if (el === other) {
    return true;
  }
  return isValidElement(el) && isValidElement(other)
    && el.type === other.type
    && isEqual(omit(el.props, 'children'), omit(other.props, 'children'))
    && isChildrenEqual(el.props.children, other.props.children);
}

export default function isChildrenEqual(value: ReactNode, other: ReactNode) {
  if (!value && !other) {
    return true;
  }
  const valueArray = Children.toArray(value);
  const otherArray = Children.toArray(other);
  if (valueArray.length !== otherArray.length) {
    return false;
  }
  return valueArray.every((child, index) => isElementEqual(child, otherArray[index]));
}
