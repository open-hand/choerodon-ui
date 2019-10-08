import { action, observable, runInAction } from 'mobx';

export default class PromiseQueue {
  @observable queue: Promise<any>[];

  get length(): number {
    return this.queue.length;
  }

  constructor() {
    runInAction(() => {
      this.queue = [];
    });
  }

  @action
  add(promise: Promise<any>): Promise<any> {
    this.queue.push(promise);
    return promise;
  }

  @action
  async ready() {
    const { queue } = this;
    if (queue.length) {
      await queue.pop();
      return this.ready();
    }
    return Promise.resolve();
  }
}
