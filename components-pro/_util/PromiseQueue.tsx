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
  add(promise: Promise<any>): Promise<any> {
    const { queue } = this;
    queue.push(promise);
    return promise.then(
      action(value => {
        if (!this.queueing) {
          const index = queue.indexOf(promise);
          if (index !== -1) {
            queue.splice(index, 1);
          }
        }
        return value;
      }),
    );
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
