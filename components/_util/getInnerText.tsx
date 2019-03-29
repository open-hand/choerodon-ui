import { Children, isValidElement, ReactElement, ReactNode } from 'react';

function getInnerText(node: ReactNode): string {
  if (typeof node === 'number') {
    return node.toString();
  } else if (node) {
    let children;
    if (isValidElement(node)) {
      children = (node as ReactElement<any>).props.children;
    } else if (node instanceof Array) {
      children = node;
    }
    if (children) {
      return Children.map(children, (child) => getInnerText(child)).join('');
    } else {
      return node.toString();
    }
  } else {
    return '';
  }
}

export default getInnerText;
