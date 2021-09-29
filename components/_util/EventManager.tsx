import { action } from 'mobx';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';

type EventTarget = { addEventListener?: Function; removeEventListener?: Function; attachEvent?: Function; detachEvent?: Function };
type EventListenerOrEventListenerObject = Function | { handleEvent: Function };

export type Handler = [EventListenerOrEventListenerObject, EventListenerOptions | AddEventListenerOptions | boolean, Function];

function on(el: EventTarget, eventName: string, handle: Handler, handles: Handler[]): void {
  if (el.addEventListener) {
    const [fn, options] = handle;
    el.addEventListener(eventName, fn, options);
  } else {
    const delegates: Function[] = [];
    handles.forEach(([, , delegateFn]) => {
      if (el.detachEvent) {
        el.detachEvent(`on${eventName}`, delegateFn);
        delegates.unshift(delegateFn);
      }
    });
    delegates.forEach(delegateFn => {
      if (el.attachEvent) {
        el.attachEvent(`on${eventName}`, delegateFn);
      }
    });
  }
}

function off(el: EventTarget, eventName: string, handle: Handler): void {
  const [fn, options, delegateFn] = handle;
  if (el.removeEventListener) {
    el.removeEventListener(eventName, fn, options);
  } else if (el.detachEvent) {
    el.detachEvent(`on${eventName}`, delegateFn);
  }
}

function isEventListenerOptions(options?: EventListenerOptions | boolean): options is EventListenerOptions {
  return isObject(options);
}

function isAddEventListenerOptions(options?: EventListenerOptions | boolean): options is AddEventListenerOptions {
  return isEventListenerOptions(options) && ('once' in options || 'passive' in options);
}

function getCapture(options: EventListenerOptions | boolean): boolean {
  return isEventListenerOptions(options) ? options.capture || false : options;
}

function isSameHandler(handle: Handler, other: Handler): boolean {
  const [handleFn, handleOption] = handle;
  const [otherFn, otherOption] = other;
  return handleFn === otherFn && getCapture(handleOption) === getCapture(otherOption);
}

function callHandler(events: Handler[], handle: Handler, ...rest): any {
  const [, options, delegateFn] = handle;
  if (isAddEventListenerOptions(options) && options.once) {
    const index = events.indexOf(handle);
    if (index !== -1) {
      events.splice(index, 1);
    }
  }
  return delegateFn(...rest);
}

function delegate(fn: EventListenerOrEventListenerObject): Function {
  if ('handleEvent' in fn) {
    return (...rest) => fn.handleEvent(...rest);
  }
  return (...rest) => fn(...rest);
}

export default class EventManager {
  events: { [eventName: string]: Handler[] } = {};

  el?: EventTarget | undefined | null;

  constructor(el?: EventTarget | undefined | null) {
    this.setTarget(el);
  }

  setTarget(el?: EventTarget | undefined | null): EventManager {
    this.el = el;
    return this;
  }

  addEventListener(eventName: string, fn: EventListenerOrEventListenerObject, options: AddEventListenerOptions | boolean = false): EventManager {
    eventName = eventName.toLowerCase();
    const events: Handler[] = this.events[eventName] || [];
    const index = events.findIndex((handle) => isSameHandler(handle, [fn, options, noop]));
    if (index === -1) {
      const newHandle: Handler = [fn, options, delegate(fn)];
      if (getCapture(options)) {
        const captureIndex = events.findIndex(([, handleOptions]) => !getCapture(handleOptions));
        if (captureIndex === -1) {
          events.push(newHandle);
        } else {
          events.splice(captureIndex, 0, newHandle);
        }
      } else {
        events.push(newHandle);
      }
      this.events[eventName] = events;
      const { el } = this;
      if (el) {
        on(el, eventName, newHandle, events);
      }
    }
    return this;
  }

  removeEventListener(eventName: string, fn?: EventListenerOrEventListenerObject, options: EventListenerOptions | boolean = false): EventManager {
    eventName = eventName.toLowerCase();
    const events: Handler[] = this.events[eventName];
    if (events) {
      const { el } = this;
      if (fn) {
        const index = events.findIndex(handle => isSameHandler(handle, [fn, options, noop]));
        if (index !== -1) {
          if (el) {
            off(el, eventName, events[index]);
          }
          events.splice(index, 1);
        }
      } else {
        this.events[eventName] = el
          ? (this.events[eventName] || []).filter((handle) => {
            off(el, eventName, handle);
            return false;
          })
          : [];
      }
    }
    return this;
  }

  @action
  fireEventSync(eventName: string, ...rest: any[]): boolean {
    const events: Handler[] | undefined = this.events[eventName.toLowerCase()];
    return events ? [...events].every(handle => callHandler(events, handle, ...rest) !== false) : true;
  }

  @action
  fireEvent(eventName: string, ...rest: any[]): Promise<boolean> {
    const events: Handler[] | undefined = this.events[eventName.toLowerCase()];
    return events
      ? Promise.all([...events].map((handle) => callHandler(events, handle, ...rest))).then(all =>
        all.every(result => result !== false),
      )
      : Promise.resolve(true);
  }

  clear(): EventManager {
    if (this.el) {
      Object.keys(this.events).forEach(eventName => this.removeEventListener(eventName));
    }
    this.events = {};
    return this;
  }
}

export function preventDefault(e) {
  e.preventDefault();
}

export function stopPropagation(e) {
  e.stopPropagation();
}

export function stopEvent(e) {
  preventDefault(e);
  stopPropagation(e);
}
