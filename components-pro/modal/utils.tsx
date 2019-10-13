import { isValidElement, ReactNode } from 'react';
import { isArrayLike } from 'mobx';
import isNil from 'lodash/isNil';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { ModalProps } from './Modal';

export type confirmProps = { iconType?: string; type?: string; children?: any };

export function normalizeProps(
  props: ModalProps & confirmProps | ReactNode,
): ModalProps & confirmProps {
  if (
    isString(props) ||
    isValidElement(props) ||
    isBoolean(props) ||
    isNil(props) ||
    isNumber(props) ||
    isArrayLike(props)
  ) {
    return {
      children: props,
    };
  }
  return props;
}
