import { isValidElement, ReactNode } from 'react';
import { isArrayLike } from 'mobx';
import isNil from 'lodash/isNil';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { ModalProps } from './Modal';
import { MousePosition } from '../modal-manager';

export const suffixCls = 'modal';

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

export function getDocument(self: Window): Document {
  try {
    const { parent, top } = self;
    if (parent !== top) {
      return getDocument(parent);
    }
    return parent.document;
  } catch (e) {
    return self.document;
  }
}

function findIFrame(self: Window): HTMLIFrameElement | undefined {
  return [...self.parent.document.querySelectorAll('iframe')].find(frame => frame.contentWindow === self);
}

function getPageMousePosition(x, y, self: Window): MousePosition {
  const { scrollTop, scrollLeft } = self.document.documentElement;
  return { x: x + scrollLeft, y: y + scrollTop };
}

export function getMousePosition(x: number, y: number, self: Window): MousePosition {
  try {
    if (self.top === self) {
      return getPageMousePosition(x, y, self);
    }
    const { parent } = self;
    const iframe = findIFrame(self);
    const { top, left } = iframe ? iframe.getBoundingClientRect() : { top: 0, left: 0 };
    const newX = x + left;
    const newY = y + top;
    if (parent === self.top) {
      return getPageMousePosition(newX, newY, parent);
    }
    return getMousePosition(newX, newY, parent);
  } catch (e) {
    return getPageMousePosition(x, y, self);
  }
}

