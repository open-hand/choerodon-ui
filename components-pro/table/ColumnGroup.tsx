import { Key } from 'react';
import { action, computed, observable } from 'mobx';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroups from './ColumnGroups';
import { getColumnKey, getColumnLock } from './utils';
import { ColumnLock } from './enum';
import TableStore from './TableStore';
import { TableGroup } from './Table';

export default class ColumnGroup {
  store: TableStore;

  column: ColumnProps;

  children?: ColumnGroups;

  childrenInAggregation?: ColumnGroups;

  parent: ColumnGroups;

  prev?: ColumnGroup;

  next?: ColumnGroup;

  key: Key;

  @observable inView?: boolean | undefined;

  get lock(): ColumnLock | false {
    return getColumnLock(this.column.lock);
  }

  get rowSpan(): number {
    return this.parent.deep - this.deep + 1;
  }

  get colSpan(): number {
    const { children } = this;
    return children ? children.wide : 1;
  }

  get deep(): number {
    const { children } = this;
    return children ? children.deep + 1 : this.hidden ? 0 : 1;
  }

  get hidden(): boolean {
    const { children } = this;
    return children ? children.hidden : !!this.column.hidden;
  }

  get lastLeaf(): ColumnGroup | undefined {
    const { leafs } = this;
    const { length } = leafs;
    return length ? leafs[length - 1] : undefined;
  }

  get width(): number {
    const { children } = this;
    return children ? children.width : columnWidth(this.column, this.store);
  }

  @computed
  get left(): number {
    const { prev } = this;
    if (prev) {
      return prev.left + prev.width;
    }
    const { parent } = this;
    if (parent) {
      return parent.left;
    }
    return 0;
  }

  @computed
  get right(): number {
    const { next } = this;
    if (next) {
      return next.right + next.width;
    }
    const { parent } = this;
    if (parent) {
      return parent.right;
    }
    return 0;
  }

  @computed
  get allLeafs(): ColumnGroup[] {
    const { children } = this;
    if (children) {
      return children.leafs;
    }
    return [this];
  }

  @computed
  get leafs(): ColumnGroup[] {
    const { hidden } = this;
    if (!hidden) {
      return this.allLeafs;
    }
    return [];
  }

  get headerGroup(): Group | undefined {
    const { __group } = this.column;
    if (__group) {
      return __group;
    }
    return this.parent.headerGroup;
  }

  get headerGroups(): Group[] | undefined {
    const { __groups } = this.column;
    if (__groups) {
      return __groups;
    }
    return this.parent.headerGroups;
  }

  get tableGroup(): TableGroup | undefined {
    const { __tableGroup } = this.column;
    if (__tableGroup) {
      return __tableGroup;
    }
    return this.parent.tableGroup;
  }

  constructor(column: ColumnProps, parent: ColumnGroups, store: TableStore) {
    this.store = store;
    this.column = column;
    this.key = getColumnKey(column);
    this.parent = parent;
    const { children } = column;
    const { aggregation } = parent;
    if (children && children.length > 0) {
      if (!column.aggregation || !aggregation) {
        this.children = new ColumnGroups(children, store, this);
      } else {
        this.childrenInAggregation = new ColumnGroups(children, store, this);
      }
    }
  }

  @action
  setInView(inView?: boolean) {
    this.inView = inView;
  }
}
