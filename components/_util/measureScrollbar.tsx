import { global } from 'choerodon-ui/shared';

export default function measureScrollbar(direction = 'vertical'): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  if (direction === 'vertical') {
    const { SCROLL_BAR_WIDTH_VERTICAL } = global;
    if (SCROLL_BAR_WIDTH_VERTICAL !== undefined) {
      return SCROLL_BAR_WIDTH_VERTICAL;
    }
  } else {
    const { SCROLL_BAR_WIDTH_HORIZONTAL } = global;
    if (SCROLL_BAR_WIDTH_HORIZONTAL !== undefined) {
      return SCROLL_BAR_WIDTH_HORIZONTAL;
    }
  }
  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = 'position: absolute;width: 50px;height: 50px;top: -9999px; overflow: scroll';
  document.body.appendChild(scrollDiv);
  let size = 0;
  if (direction === 'vertical') {
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    global.SCROLL_BAR_WIDTH_VERTICAL = size;
  } else {
    size = scrollDiv.offsetHeight - scrollDiv.clientHeight;
    global.SCROLL_BAR_WIDTH_HORIZONTAL = size;
  }
  document.body.removeChild(scrollDiv);
  return size;
}
