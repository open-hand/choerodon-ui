let scrollbarWidth: number;
let rootFontSize: number = 100;

function getRootFontSize(): number {
  if (typeof window !== 'undefined') {
    const { fontSize } = document.defaultView.getComputedStyle(document.documentElement);
    if (fontSize !== null) {
      return parseFloat(fontSize);
    }
  }
  return 100;
}

export default function measureScrollbar(direction = 'vertical'): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const fontSize = getRootFontSize();
  if (scrollbarWidth && fontSize === rootFontSize) {
    return scrollbarWidth;
  }
  rootFontSize = fontSize;
  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = 'position: absolute;width: 50px;height: 50px;top: -9999px; overflow: scroll';
  document.body.appendChild(scrollDiv);
  let size = 0;
  if (direction === 'vertical') {
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  } else if (direction === 'horizontal') {
    size = scrollDiv.offsetHeight - scrollDiv.clientHeight;
  }
  document.body.removeChild(scrollDiv);
  scrollbarWidth = size / fontSize * 100;
  return scrollbarWidth;
}
