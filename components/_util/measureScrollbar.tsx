let scrollbarWidth: number;

export default function measureScrollbar(direction = 'vertical'): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  if (scrollbarWidth) {
    return scrollbarWidth;
  }
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
  scrollbarWidth = size;
  return scrollbarWidth;
}
