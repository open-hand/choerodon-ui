import { isValidElement, ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import toString from 'lodash/toString';

export default async function getReactNodeText(node: ReactNode): Promise<string> {
  if (node) {
    if (isString(node) || isNumber(node)) {
      return String(node);
    }
    if (typeof window !== 'undefined' && isValidElement(node)) {
      const textDiv = document.createElement('div');
      document.body.appendChild(textDiv);
      await new Promise(resolve => render(node, textDiv, resolve));
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
