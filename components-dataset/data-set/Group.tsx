import { action, observable, ObservableMap } from 'mobx';
import Record from './Record';
import { getIf } from './utils';

export default class Group {

  readonly name: string | symbol;

  readonly value: any;

  records: Record[];

  readonly totalRecords: Record[];

  subGroups: Group[];

  subHGroups?: Set<Group>;

  readonly parent?: Group | undefined;

  readonly index: number;

  @observable state?: ObservableMap<string, any>;

  constructor(name: string | symbol, index: number, value?: any, parent?: Group) {
    this.index = index;
    this.name = name;
    this.value = value;
    this.parent = parent;
    this.records = [];
    this.totalRecords = [];
    this.subGroups = [];
  }

  getState(key: string): any {
    const { state } = this;
    return state && state.get(key);
  }

  @action
  setState(key: string, value: any) {
    if (value !== undefined || this.state) {
      const state = getIf<Group, ObservableMap>(this, 'state', () => observable.map());
      return state.set(key, value);
    }
  }
}
