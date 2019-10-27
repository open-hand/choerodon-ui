import { action, observable, runInAction } from 'mobx';

export default class PromiseQueue {
  @observable queue: Promise<any>[];

  queueing: boolean = false;

  get length(): number {
    return this.queue.length;
  }

  constructor() {
    runInAction(() => {
      this.queue = [];
    });
  }

  @action
  clear(promise) {
    if (!this.queueing) {
      const { queue } = this;
      const index = queue.indexOf(promise);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  @action
  add<T>(promise: Promise<T>): Promise<T> {
    const { queue } = this;
    queue.push(promise);
    return promise
      .then(value => {
        this.clear(promise);
        return value;
      })
      .catch(error => {
        this.clear(promise);
        throw error;
      });
  }

  @action
  async ready() {
    this.queueing = true;
    const { queue } = this;
    if (queue.length) {
      await queue.pop();
      return this.ready();
    }
    this.queueing = false;
    return Promise.resolve();
  }
}
