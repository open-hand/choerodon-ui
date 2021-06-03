import { ReactElement } from 'react';
import { isFragment as isReactFragment } from 'react-is';

export default function isFragment(value: ReactElement): boolean {
  return value.type === 'fragment' || isReactFragment(value);
}
