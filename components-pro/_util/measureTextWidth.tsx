import { CSSProperties } from 'react';

export default function measureTextWidth(text: string, style?: CSSProperties | CSSStyleDeclaration) {
  if (typeof window !== 'undefined') {
    const span = document.createElement('span');
    span.style.cssText = 'position: absolute;top: -9999px;display: inline-block';
    span.innerHTML = text.replace(/\s/g, '&nbsp;');
    if (style) {
      ['font', 'letterSpacing', 'wordSpacing', 'textTransform'].forEach((property) => {
        if (property in style) {
          span.style[property] = style[property];
        }
      });
    }
    document.body.appendChild(span);
    const { width } = getComputedStyle(span);
    const contentWidth = width && width !== 'auto' ? parseFloat(width) : span.offsetWidth;
    document.body.removeChild(span);
    return contentWidth;
  }
  return 0;
}
