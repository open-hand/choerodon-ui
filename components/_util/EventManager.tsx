function on(eventName: string, fn: Function, el?: any): void {
  if (el) {
    if (el.addEventListener) {
      el.addEventListener(eventName, fn, false);
    } else if (el.attachEvent) {
      el.attachEvent(`on${eventName}`, fn);
    }
  }
}

function off(eventName: string, fn: Function, el?: any): void {
  if (el) {
    if (el.removeEventListener) {
      el.removeEventListener(eventName, fn, false);
    } else if (el.attachEvent) {
      el.detachEvent(`on${eventName}`, fn);
    }
  }
}

export default class EventManager {
  events: { [eventName: string]: Function[] } = {};

  el?: any;

  constructor(el?: any) {
    this.el = el;
  }

  addEventListener(eventName: string, fn: Function): EventManager {
    eventName = eventName.toLowerCase();
    const events: Function[] = this.events[eventName] || [];
    events.push(fn);
    this.events[eventName] = events;
    on(eventName, fn, this.el);
    return this;
  }

  removeEventListener(eventName: string, fn?: Function): EventManager {
    eventName = eventName.toLowerCase();
    const events: Function[] = this.events[eventName];
    if (events) {
      if (fn) {
        const index = events.findIndex((event) => event === fn);
        if (index !== -1) {
          events.splice(index, 1);
        }
        off(eventName, fn, this.el);
      } else {
        this.events[eventName] = this.el ?
          (this.events[eventName] || []).filter((event) => (
            off(eventName, event, this.el), false
          )) : [];
      }
    }
    return this;
  }

  async fireEvent(eventName: string, ...rest: any[]): Promise<boolean> {
    const events: Function[] = this.events[eventName.toLowerCase()];
    return events
      ? await Promise.all(events.map(fn => fn.apply(void 0, rest))).then(all => all.every(result => result !== false))
      : true;
  }

  clear(): EventManager {
    if (this.el) {
      Object.keys(this.events).forEach((eventName) => this.removeEventListener(eventName));
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
