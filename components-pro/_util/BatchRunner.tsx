import { Key } from 'react';
import { action } from 'mobx';
import debounce from 'lodash/debounce';
import { getIf } from '../data-set/utils';

export default class BatchRunner {
  tasks?: Map<Key, Function>;

  run: (tasks: Map<Key, Function>) => void;

  constructor(batchInterval = 100) {
    this.run = debounce(action((tasks: Map<Key, Function>) => {
      tasks.forEach(task => task());
      tasks.clear();
    }), batchInterval);
  }

  addTask(key: Key, callback: Function) {
    this.run(getIf<BatchRunner, Map<Key, Function>>(this, 'task', () => new Map()).set(key, callback));
  }
}
