export default function getOffset(element, container) {
  const rect = element.getBoundingClientRect();
  if (rect.width || rect.height) {
    const elementContainer = container || element.parentElement;
    return {
      top: rect.top - elementContainer.clientTop,
      left: rect.left - elementContainer.clientLeft,
    };
  }
  return rect;
}
