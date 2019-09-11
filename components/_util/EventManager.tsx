function on(eventName: string, fn: Function, el?: any, useCapture?: boolean): void {
  if (el) {
    if (el.addEventListener) {
      el.addEventListener(eventName, fn, useCapture);
    } else if (el.attachEvent) {
      el.attachEvent(`on${eventName}`, fn);
    }
  }
}

function off(eventName: string, fn: Function, el?: any, useCapture?: boolean): void {
  if (el) {
    if (el.removeEventListener) {
      el.removeEventListener(eventName, fn, useCapture);
    } else if (el.attachEvent) {
      el.detachEvent(`on${eventName}`, fn);
    }
  }
}

type handler = [Function, boolean];

export default class EventManager {
  events: { [eventName: string]: handler[] } = {};

  el?: any;

  constructor(el?: any) {
    this.el = el;
  }

  addEventListener(eventName: string, fn: Function, useCapture: boolean = false): EventManager {
    eventName = eventName.toLowerCase();
    const events: handler[] = this.events[eventName] || [];
    const index = events.findIndex(([event]) => event === fn);
    if (index === -1) {
      events.push([fn, useCapture]);
      this.events[eventName] = events;
      on(eventName, fn, this.el, useCapture);
    }
    return this;
  }

  removeEventListener(eventName: string, fn?: Function, useCapture: boolean = false): EventManager {
    eventName = eventName.toLowerCase();
    const events: handler[] = this.events[eventName];
    if (events) {
      if (fn) {
        const index = events.findIndex(([event]) => event === fn);
        if (index !== -1) {
          events.splice(index, 1);
        }
        off(eventName, fn, this.el, useCapture);
      } else {
        this.events[eventName] = this.el
          ? (this.events[eventName] || []).filter(([event, capture]) => {
              off(eventName, event, this.el, capture);
              return false;
            })
          : [];
      }
    }
    return this;
  }

  fireEvent(eventName: string, ...rest: any[]): Promise<boolean> {
    const events: handler[] = this.events[eventName.toLowerCase()];
    return events
      ? Promise.all(events.map(([fn]) => fn(...rest))).then(all =>
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
