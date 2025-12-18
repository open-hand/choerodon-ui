import isPromise from 'is-promise';
import { getIf } from '../data-set/utils';

function isPromiseCallback<T>(task: Promise<T> | (() => Promise<T>)): task is () => Promise<T> {
  return typeof task === 'function';
}

class PromiseTask<T = any> {
  private task: Promise<T> | (() => Promise<T>);

  private promise: Promise<T> | undefined;

  private resolveCallbacks?: ((value: any) => void)[];

  private rejectCallbacks?: ((reason: any) => void)[];

  constructor(task: Promise<T> | (() => Promise<T>)) {
    this.task = task;
    if (isPromise(task)) {
      this.promise = task;
    }
  }

  run(): Promise<T> {
    const { promise } = this;
    if (promise) {
      return promise;
    }
    const { task } = this;
    if (isPromiseCallback(task)) {
      const newPromise = task();
      this.promise = newPromise;
      const { resolveCallbacks, rejectCallbacks } = this;
      if (resolveCallbacks && resolveCallbacks.length) {
        newPromise.then(v => {
          resolveCallbacks.forEach(cb => cb(v));
          delete this.resolveCallbacks;
          return v;
        });
      }
      if (rejectCallbacks && rejectCallbacks.length) {
        newPromise.catch(v => {
          rejectCallbacks.forEach(cb => cb(v));
          delete this.rejectCallbacks;
          throw v;
        });
      }
      return newPromise;
    }
    return task;
  }

  readonly [Symbol.toStringTag]: string = 'Promise';

  catch<TResult = never>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult)) | undefined | null): Promise<T | TResult> {
    const { promise } = this;
    if (promise) {
      return promise.catch(onrejected && (error => onrejected(error)));
    }
    return new Promise<T | TResult>((_, reject) => {
      const rejectCallbacks = getIf<PromiseTask, ((reason: any) => void)[]>(this, 'rejectCallbacks', []);
      rejectCallbacks.push((v) => reject(onrejected ? onrejected(v) : v));
    });
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => (PromiseLike<TResult1> | TResult1)) | undefined | null, onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | undefined | null): Promise<TResult1 | TResult2> {
    const { promise } = this;
    if (promise) {
      return promise.then(onfulfilled && (value => onfulfilled(value)), onrejected && (error => onrejected(error)));
    }
    return new Promise<TResult1 | TResult2>((resolve, reject) => {
      const resolveCallbacks = getIf<PromiseTask, ((value: any) => void)[]>(this, 'resolveCallbacks', []);
      const rejectCallbacks = getIf<PromiseTask, ((reason: any) => void)[]>(this, 'rejectCallbacks', []);
      resolveCallbacks.push((v) => resolve(onfulfilled ? onfulfilled(v) : v));
      rejectCallbacks.push((v) => reject(onrejected ? onrejected(v) : v));
    });
  }
}

export default class PromiseQueue {
  private threads: number;

  private queue: PromiseTask[] = [];

  private queueing = false;

  private aborted = false;

  constructor(threads = 1) {
    if (threads < 1) {
      throw new Error('The first argument of PromiseQueue constructor must be greater than 0.');
    }
    this.threads = threads;
  }

  private $clear(promise: PromiseTask) {
    if (!this.queueing) {
      const { queue } = this;
      const index = queue.indexOf(promise);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  add<T>(promise: Promise<T> | (() => Promise<T>)): Promise<T> {
    const { queue } = this;
    const task = new PromiseTask<T>(promise);
    queue.push(task);
    return task
      .then(value => {
        this.$clear(task);
        return value;
      })
      .catch(error => {
        this.$clear(task);
        throw error;
      });
  }

  stop() {
    this.queueing = false;
  }

  abort() {
    this.aborted = true;
    this.queueing = false;
    // 清空队列，防止新任务被处理
    this.queue = [];
  }

  private $nextTask = (): Promise<any> => {
    if (this.aborted) {
      return Promise.resolve();
    }
    const task = this.queue.shift();
    if (task) {
      return task.run().then(() => {
        if (this.queueing && !this.aborted) {
          return this.$nextTask();
        }
      }).catch(error => {
        this.stop();
        throw error;
      });
    }
    return Promise.resolve();
  };

  async ready(): Promise<void> {
    const { queue, threads } = this;
    if (queue.length) {
      this.queueing = true;
      try {
        await Promise.all(new Array(threads).fill(0).map(() => this.$nextTask()));
      } finally {
        this.queueing = false;
      }
    }
  }
}
