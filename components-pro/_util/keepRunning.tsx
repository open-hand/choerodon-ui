import { KeyboardEvent, MouseEvent, SyntheticEvent } from 'react';
import EventManager from './EventManager';
import TaskRunner from './TaskRunner';


export interface KeepRunningProps {
  getStepGenerator(): IterableIterator<number>;

  run?(value: number): void;

  validator(target?: EventTarget): boolean | undefined;

  enabled?(): boolean;

  delay?: number;

  interval?: number;
}

function isEvent(event?: SyntheticEvent): event is SyntheticEvent {
  return Boolean(event && event.target);
}

function isKeyboardEvent(event?: MouseEvent | KeyboardEvent): event is KeyboardEvent {
  if (event && event.type === 'keydown') {
    event.preventDefault();
    return true;
  }
  return false;
}

function keep(fn, props: KeepRunningProps, e?: MouseEvent | KeyboardEvent) {
  const { getStepGenerator, run = fn, validator, enabled, delay = 200, interval = 40 } = props;
  if (!enabled || enabled.call(this) && ((!isKeyboardEvent(e) || !e.repeat))) {
    const generator = getStepGenerator.call(this);
    const firstValue = generator.next().value;
    let currentValue = firstValue;
    if (isEvent(e)) {
      const { currentTarget, type } = e;
      const delayer = new TaskRunner();
      const keeper = new TaskRunner();
      const event = new EventManager(currentTarget);
      const stopFn = () => {
        if (delayer.isRunning) {
          delayer.cancel();
          fn.call(this, firstValue);
        }
        if (keeper.isRunning) {
          keeper.cancel();
          fn.call(this, currentValue);
        }
        event.clear();
      };
      const delayFn = () => {
        keeper.run(interval, () => {
          if (validator.call(this, currentTarget) === false) {
            stopFn();
          } else {
            currentValue = generator.next().value;
            run.call(this, currentValue);
          }
        });
      };
      delayer.delay(delay, delayFn);
      if (type === 'keydown') {
        event
          .addEventListener('keyup', stopFn)
          .addEventListener('blur', stopFn);
      } else {
        event
          .addEventListener('mouseleave', stopFn)
          .addEventListener('mouseup', stopFn);
      }
      run.call(this, firstValue);
    } else {
      fn.call(this, firstValue);
    }
  }
}

export default function keepRunning(props: KeepRunningProps) {
  return (target, _key, descriptor) => {
    const { constructor } = target;
    const { value: fn } = descriptor;
    return {
      enumerable: false,
      configurable: true,
      get() {
        if (this === target) {
          return fn;
        }

        if (this.constructor !== constructor && Object.getPrototypeOf(this).constructor === constructor) {
          return fn;
        }

        return keep.bind(this, fn, props);
      },
    };
  };
}
