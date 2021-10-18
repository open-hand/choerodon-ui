import raf from 'raf';
import getScroll from './getScroll';
import { easeInOutCubic } from './easings';

interface ScrollToOptions {
  /** Scroll container, default as window */
  getContainer?: () => HTMLElement | Window;
  /** Scroll end callback */
  callback?: () => any;
  /** Animation duration, default as 450 */
  duration?: number;
  top?: boolean
}

export default function scrollTo(to: number, options: ScrollToOptions = {}) {
  const { getContainer = () => window, callback, duration = 450, top = true } = options;

  const container = getContainer();
  const scroll = getScroll(container, top);
  const startTime = Date.now();

  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScroll = easeInOutCubic(time > duration ? duration : time, scroll, to, duration);
    if (top) {
      if (container === window) {
        window.scrollTo(window.pageXOffset, nextScroll);
      } else {
        (container as HTMLElement).scrollTop = nextScroll;
      }
    } else if (container === window) {
      window.scrollTo(nextScroll, window.pageYOffset);
    } else {
      (container as HTMLElement).scrollLeft = nextScroll;
    }
    if (time < duration) {
      raf(frameFunc);
    } else if (typeof callback === 'function') {
      callback();
    }
  };
  raf(frameFunc);
}
