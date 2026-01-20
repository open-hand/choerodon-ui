import { action, computed, observable, ObservableMap } from 'mobx';
import Record, { EXPANDED_KEY } from './Record';
import { getIf } from './utils';

export default class Group {

  readonly name: string | symbol;

  parentName?: string | symbol;

  readonly value: any;

  parentValue?: any;

  @observable records: Record[];

  readonly totalRecords: Record[];

  // 子分组， 非同组
  subGroups: Group[];

  subHGroups?: Set<Group>;

  // 父分组， 非同组
  readonly parentGroup?: Group | undefined;

  readonly index: number;

  @observable state?: ObservableMap<string, any>;

  // 同组下的树形子分组
  children?: Group[] | undefined;

  // 同组下的父分组
  parent?: Group | undefined;

  get isExpanded(): boolean {
    return this.getState(EXPANDED_KEY) !== false;
  }

  set isExpanded(isExpanded: boolean) {
    this.setState(EXPANDED_KEY, isExpanded);
  }

  get level(): number {
    const { parent } = this;
    if (parent) {
      return parent.level + 1;
    }
    return 0;
  }

  @computed
  get expandedRecords(): Record[] {
    const { subGroups } = this;
    if (subGroups.length) {
      return subGroups.reduce<Record[]>((list, group) => {
        const newList = list.concat(group.expandedRecords);
        const { children } = group;
        if (children && group.isExpanded) {
          return children.reduce((childList, childGroup) => childList.concat(childGroup.expandedRecords), newList);
        }
        return newList;
      }, []);
    }
    return this.records.filter(record => !record.isRemoved);
  }

  constructor(name: string | symbol, index: number, value?: any, parentGroup?: Group) {
    this.index = index;
    this.name = name;
    this.value = value;
    this.parentGroup = parentGroup;
    this.records = observable.array([]);
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

  mergeState(newState: ObservableMap<string, any>) {
    const state = getIf<Group, ObservableMap>(this, 'state', () => observable.map());
    state.merge(newState);
  }
}
