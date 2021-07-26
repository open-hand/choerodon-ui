import measureTextWidth from '../_util/measureTextWidth';

export default function isOverflow(element: Element) {
  const { textContent, ownerDocument } = element;
  if (textContent && ownerDocument) {
    const { clientWidth, scrollWidth } = element;
    if (scrollWidth > clientWidth) {
      return true;
    }
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const computedStyle = defaultView.getComputedStyle(element);
      const { paddingLeft, paddingRight } = computedStyle;
      const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
      const pr = paddingRight ? parseFloat(paddingRight) : 0;
      if (pl || pr) {
        const textWidth = measureTextWidth(textContent, computedStyle);
        const contentWidth = clientWidth - pl - pr;
        return textWidth > contentWidth;
      }
    }
  }
  return false;
}
