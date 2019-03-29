import { isValidElement, ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import toString from 'lodash/toString';

export default function getReactNodeText(node: ReactNode): string {
  if (node) {
    if (isString(node) || isNumber(node)) {
      return String(node);
    }
    if (typeof window !== 'undefined' && isValidElement(node)) {
      const textDiv = document.createElement('div');
      document.body.appendChild(textDiv);
      render(node, textDiv);
      const { textContent } = textDiv;
      unmountComponentAtNode(textDiv);
      if (textDiv.parentNode) {
        textDiv.parentNode.removeChild(textDiv);
      }
      return textContent || '';
    }
    return toString(node);
  }
  return '';
}
