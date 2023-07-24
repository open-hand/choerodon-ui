import measureTextWidth from '../_util/measureTextWidth';

function getContentWidth(element: HTMLElement, computedStyle: CSSStyleDeclaration): number {
  const { width, boxSizing } = computedStyle;
  if (boxSizing === 'content-box' && width && width !== 'auto') {
    return parseFloat(width);
  }
  const contentWidth = width && width !== 'auto' ? parseFloat(width) : element.offsetWidth;
  const { paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } = computedStyle;
  const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
  const pr = paddingRight ? parseFloat(paddingRight) : 0;
  const bl = borderLeftWidth ? parseFloat(borderLeftWidth) : 0;
  const br = borderRightWidth ? parseFloat(borderRightWidth) : 0;
  return contentWidth - pl - pr - bl - br;
}

export default function isOverflow(element: HTMLElement | HTMLInputElement) {
  const { textContent, ownerDocument } = element;
  const { value } = element as HTMLInputElement;
  if ((value || textContent) && ownerDocument) {
    const { clientWidth, scrollWidth } = element;
    if (scrollWidth > clientWidth) {
      return true;
    }
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const computedStyle = defaultView.getComputedStyle(element);
      const contentWidth = Math.round(getContentWidth(element, computedStyle));
      const textWidth = Math.round(measureTextWidth(textContent || value, computedStyle));
      return (textWidth > contentWidth);
    }
  }
  return false;
}
