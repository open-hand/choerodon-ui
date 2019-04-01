import { isValidElement } from 'react';
import isString from 'lodash/isString';
import { ModalProps } from './Modal';

export function normalizeProps(props: ModalProps & { children } | string): ModalProps & { children } {
  if (isString(props) || isValidElement(props)) {
    return {
      children: props,
    };
  }
  return props;
}
