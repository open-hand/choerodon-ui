import { CSSProperties } from 'react';

export default function measureTextWidth(text: string, style?: CSSProperties | CSSStyleDeclaration) {
  if (typeof window !== 'undefined') {
    const span = document.createElement('span');
    span.style.cssText = 'position: absolute;top: -9999px;';
    span.innerHTML = text.replace(/\s/g, '&nbsp;');
    if (style) {
      ['fontSize', 'fontFamily', 'fontWeight', 'letterSpacing', 'wordSpacing'].forEach((property) => {
        if (property in style) {
          span.style[property] = style[property];
        }
      });
    }
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  }
  return 0;
}
