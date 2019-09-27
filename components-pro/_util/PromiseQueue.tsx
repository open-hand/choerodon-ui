export default class PromiseQueue {
  queue: Promise<any>[] = [];

  add(promise: Promise<any>): Promise<any> {
    this.queue.push(promise);
    return promise;
  }

  async ready() {
    const { queue } = this;
    if (queue.length) {
      await queue.pop();
      return this.ready();
    }
    return Promise.resolve();
  }
}
