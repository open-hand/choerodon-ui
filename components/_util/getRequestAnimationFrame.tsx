import noop from 'lodash/noop';

const availablePrefixes = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill() {
  let lastTime = 0;
  return function(callback: (n: number) => void) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

export default function getRequestAnimationFrame() {
  if (typeof window === 'undefined') {
    return noop;
  }
  if (window.requestAnimationFrame) {
    return requestAnimationFrame;
  }

  const prefix = availablePrefixes.filter(key => `${key}RequestAnimationFrame` in window)[0];

  return prefix
    ? window[`${prefix}RequestAnimationFrame`]
    : requestAnimationFramePolyfill();
}

export function cancelRequestAnimationFrame(id: number) {
  if (typeof window === 'undefined') {
    return null;
  }
  if (window.cancelAnimationFrame) {
    return cancelAnimationFrame(id);
  }
  const prefix = availablePrefixes.filter(key =>
    `${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window,
  )[0];

  return prefix ?
    (
      (window as any)[`${prefix}CancelAnimationFrame`] ||
      (window as any)[`${prefix}CancelRequestAnimationFrame`]
    ).call(this, id) : clearTimeout(id);
}
