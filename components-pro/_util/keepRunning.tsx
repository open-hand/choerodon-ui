import createDefaultSetter from './createDefaultSetter';
import EventManager from './EventManager';
import TaskRunner from './TaskRunner';

function keep(fn, e) {
  if (e && e.target) {
    e.persist();
    const delayer = new TaskRunner();
    const keeper = new TaskRunner();
    const event = new EventManager(e.target);
    const delayFn = () => {
      keeper.run(40, fn.bind(this, e));
    };
    const stopFn = () => {
      delayer.cancel();
      keeper.cancel();
      event.clear();
    };
    delayer.delay(500, delayFn);
    event.addEventListener('mouseleave', stopFn);
    event.addEventListener('mouseup', stopFn);
  }
  fn.call(this, e);
}

export default function keepRunning(target, key, descriptor) {
  const { constructor } = target;
  const { value: fn } = descriptor;
  return {
    configurable: true,
    get() {
      if (this === target) {
        return fn;
      }

      if (this.constructor !== constructor && Object.getPrototypeOf(this).constructor === constructor) {
        return fn;
      }

      const boundFn = keep.bind(this, fn);
      Object.defineProperty(this, key, {
        value: boundFn,
        configurable: true,
        writable: true,
      });
      return boundFn;
    },
    set: createDefaultSetter(key),
  };
}
