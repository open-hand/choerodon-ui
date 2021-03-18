import createDefaultSetter from './createDefaultSetter';
import EventManager from './EventManager';
import TaskRunner from './TaskRunner';

function keep(fn, findEl, e) {
  if (e && e.target) {
    const { currentTarget } = e;
    e.persist();
    const delayer = new TaskRunner();
    const keeper = new TaskRunner();
    const event = new EventManager(currentTarget);
    const stopFn = () => {
      if (delayer.isRunning) {
        delayer.cancel();
      }
      if (keeper.isRunning) {
        keeper.cancel();
        fn.call(this, e);
      }
      event.clear();
    };
    const delayFn = () => {
      keeper.run(40, () => {
        if (findEl() !== currentTarget) {
          stopFn();
        } else {
          fn.call(this, e, true);
        }
      });
    };
    delayer.delay(500, delayFn);
    event.addEventListener('mouseleave', stopFn);
    event.addEventListener('mouseup', stopFn);
  }
  fn.call(this, e);
}

export default function keepRunning(findEl) {
  return (target, key, descriptor) => {
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

        const boundFn = keep.bind(this, fn, findEl.bind(this));
        Object.defineProperty(this, key, {
          value: boundFn,
          configurable: true,
          writable: true,
        });
        return boundFn;
      },
      set: createDefaultSetter(key),
    };
  };
}
