import { action, computed, observable } from 'mobx';
import TableStore from './TableStore';
import Record from '../data-set/Record';

export default class VirtualRowMetaData {
  store: TableStore;

  prev?: VirtualRowMetaData | undefined;

  @observable actualHeight?: number;

  @observable actualRecord: Record;

  get height(): number {
    const { actualHeight } = this;
    if (actualHeight === undefined) {
      return this.store.virtualRowHeight;
    }
    return actualHeight;
  }

  get record(): Record {
    const { actualRecord } = this;
    return actualRecord;
  }

  @computed
  get offset(): number {
    const { prev } = this;
    if (prev) {
      return prev.offset + prev.height;
    }
    return 0;
  }

  constructor(store: TableStore, prev?: VirtualRowMetaData, actualHeight?: number, record?: Record) {
    this.store = store;
    this.prev = prev;
    if (actualHeight !== undefined) {
      this.setHeight(actualHeight);
    }
    if (record !== undefined) {
      this.setRecord(record);
    }
  }

  @action
  setHeight(height: number) {
    this.actualHeight = height;
  }

  @action
  setRecord(record: Record) {
    this.actualRecord = record;
  }
}
