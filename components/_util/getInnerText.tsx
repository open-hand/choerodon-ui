import * as React from 'react';

function getInnerText(node: React.ReactNode): string {
  if (typeof node === 'number') {
    return node.toString();
  } else if (node) {
    let children;
    if (React.isValidElement(node)) {
      children = (node as React.ReactElement<any>).props.children;
    } else if (node instanceof Array) {
      children = node;
    }
    if (children) {
      return React.Children.map(children, (child) => getInnerText(child)).join('');
    } else {
      return node.toString();
    }
  } else {
    return '';
  }
}

export default getInnerText;
