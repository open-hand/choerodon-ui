import { action } from 'mobx';

export default class MobxBatchAction {
  timeOutId: number | undefined;

  duraction: number;

  actions: Function[];

  constructor(duraction: number = 10) {
    this.duraction = duraction;
    this.actions = [];
  }

  add(one: Function) {
    if (this.timeOutId) {
      window.clearTimeout(this.timeOutId);
    }
    this.actions.push(one);
    this.timeOutId = window.setTimeout(() => this.flush(), this.duraction);
  }

  @action
  flush() {
    this.actions.forEach(one => one());
    this.actions = [];
  }
}
