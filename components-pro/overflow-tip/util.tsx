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

export default function isOverflow(element: HTMLElement | HTMLInputElement, textOverflowThreshold?: number, measurePlaceholder?: boolean) {
  const { textContent, ownerDocument } = element;
  const { value, placeholder } = element as HTMLInputElement;
  if (((!measurePlaceholder && (value || textContent)) || (measurePlaceholder && placeholder)) && ownerDocument) {
    const { clientWidth, scrollWidth } = element;
    if (scrollWidth > clientWidth) {
      if (textOverflowThreshold !== undefined) {
        return scrollWidth - clientWidth > textOverflowThreshold;
      }
      return true;
    }
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const computedStyle = defaultView.getComputedStyle(element);
      const contentWidth = getContentWidth(element, computedStyle);
      const measureText = measurePlaceholder ? placeholder : (textContent || value);
      const textWidth = measureTextWidth(measureText || '', computedStyle);
      if (textOverflowThreshold !== undefined) {
        return textWidth - contentWidth > textOverflowThreshold;
      }
      return (textWidth > contentWidth);
    }
  }
  return false;
}
