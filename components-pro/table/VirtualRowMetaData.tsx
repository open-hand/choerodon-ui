import { ReactNode } from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import TableStore from './TableStore';
import Record from '../data-set/Record';
import { ROW_GROUP_HEIGHT } from './TableRowGroup';

export default class VirtualRowMetaData {
  store: TableStore;

  prev?: VirtualRowMetaData | undefined;

  next?: VirtualRowMetaData | undefined;

  @observable actualHeight?: number;

  @observable record?: Record;

  type: 'row' | 'group';

  groupLevel?: number;

  aggregation?: boolean;

  node?: ReactNode;

  get height(): number {
    if (this.type === 'group') {
      return ROW_GROUP_HEIGHT;
    }
    const { actualHeight } = this;
    if (actualHeight === undefined) {
      return this.store.virtualRowHeight;
    }
    return actualHeight;
  }

  @computed
  get offset(): number {
    const { prev } = this;
    let result = 0;
    if (prev) {
      let current = prev as VirtualRowMetaData;
      while (current) {
        result += current.height;
        current = current.prev!;
      }
    }
    return result;
  }

  constructor(store: TableStore, type: 'row' | 'group', prev?: VirtualRowMetaData, record?: Record) {
    this.store = store;
    this.type = type;
    this.prev = prev;
    if (record !== undefined) {
      runInAction(() => {
        this.record = record;
      });
    }
  }

  @action
  setHeight(height: number) {
    this.actualHeight = height;
    this.aggregation = this.store.aggregation;
  }
}
