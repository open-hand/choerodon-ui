import { action, computed, observable } from 'mobx';
import TableStore from './TableStore';

export default class VirtualRowMetaData {
  store: TableStore;

  prev?: VirtualRowMetaData | undefined;

  @observable actualHeight?: number;

  get height(): number {
    const { actualHeight } = this;
    if (actualHeight === undefined) {
      return this.store.virtualEstimatedRowHeight;
    }
    return actualHeight;
  }

  @computed
  get offset(): number {
    const { prev } = this;
    if (prev) {
      return prev.offset + prev.height;
    }
    return 0;
  }

  constructor(store: TableStore, prev?: VirtualRowMetaData, actualHeight?: number) {
    this.store = store;
    this.prev = prev;
    if (actualHeight !== undefined) {
      this.setHeight(actualHeight);
    }
  }

  @action
  setHeight(height: number) {
    this.actualHeight = height;
  }
}
