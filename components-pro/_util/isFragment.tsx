import { isValidElement, ReactElement } from 'react';
import { isFragment as isReactFragment } from 'react-is';

export default function isFragment(value: any): value is ReactElement {
  return isReactFragment(value) || (isValidElement(value) && value.type === 'fragment');
}
