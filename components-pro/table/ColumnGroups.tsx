import { computed } from 'mobx';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroup from './ColumnGroup';
import { ColumnLock } from './enum';
import TableStore from './TableStore';
import { TableGroup } from './Table';

export default class ColumnGroups {
  columns: ColumnGroup[];

  store: TableStore;

  parent?: ColumnGroup;

  get aggregation(): boolean | undefined {
    return this.store.aggregation;
  }

  @computed
  get wide(): number {
    return this.columns.reduce((sum, { colSpan, hidden }) => (hidden ? sum : sum + colSpan), 0);
  }

  @computed
  get deep(): number {
    return Math.max(...this.columns.map(({ deep }) => deep));
  }

  @computed
  get hidden(): boolean {
    return this.columns.every(({ hidden }) => hidden);
  }

  @computed
  get width(): number {
    return this.columns.reduce((sum, { width }) => sum + width, 0);
  }

  get left(): number {
    const { parent } = this;
    if (parent) {
      return parent.left;
    }
    return 0;
  }

  get right(): number {
    const { parent } = this;
    if (parent) {
      return parent.right;
    }
    return 0;
  }

  get lastLeaf() {
    const { leafs } = this;
    const { length } = leafs;
    return length ? leafs[length - 1] : undefined;
  }

  @computed
  get allLeafs(): ColumnGroup[] {
    const { aggregation } = this;
    return this.columns.reduce<ColumnGroup[]>((leafs, group) => leafs.concat(aggregation && group.column.aggregation ? group : group.allLeafs), []);
  }

  @computed
  get inView(): boolean {
    return this.allLeafs.some(group => group.inView !== false);
  }

  @computed
  get leafs(): ColumnGroup[] {
    const { aggregation, hidden } = this;
    return hidden ? [] : this.columns.reduce<ColumnGroup[]>((leafs, group) => group.hidden ? leafs : leafs.concat(aggregation && group.column.aggregation ? group : group.leafs), []);
  }

  @computed
  get leftLeafs(): ColumnGroup[] {
    if (!this.parent) {
      const { aggregation } = this;
      return this.columns.reduce<ColumnGroup[]>(
        (leafs, group) => group.lock === ColumnLock.left && !group.hidden ? leafs.concat(aggregation && group.column.aggregation ? group : group.leafs) : leafs,
        [],
      );
    }
    return [];
  }

  @computed
  get rightLeafs(): ColumnGroup[] {
    if (!this.parent) {
      const { aggregation } = this;
      return this.columns.reduce<ColumnGroup[]>(
        (leafs, group) => group.lock === ColumnLock.right && !group.hidden ? leafs.concat(aggregation && group.column.aggregation ? group : group.leafs) : leafs,
        [],
      );
    }
    return [];
  }

  get leafColumnsWidth(): number {
    return this.allLeafs.reduce<number>((total, { column }) => total + columnWidth(column, this.store), 0);
  }

  get leftLeafColumnsWidth(): number {
    return this.leftLeafs.reduce<number>((total, { column }) => total + columnWidth(column, this.store), 0);
  }

  get rightLeafColumnsWidth(): number {
    return this.rightLeafs.reduce<number>((total, { column }) => total + columnWidth(column, this.store), 0);
  }

  get headerGroup(): Group | undefined {
    const { parent } = this;
    if (parent) {
      return parent.headerGroup;
    }
  }

  get headerGroups(): Group[] | undefined {
    const { parent } = this;
    if (parent) {
      return parent.headerGroups;
    }
  }

  get tableGroup(): TableGroup | undefined {
    const { parent } = this;
    if (parent) {
      return parent.tableGroup;
    }
  }

  constructor(columns: ColumnProps[], store: TableStore, parent?: ColumnGroup) {
    this.store = store;
    this.parent = parent;
    let prev: ColumnGroup | undefined;
    this.columns = columns.map(col => {
      const group = new ColumnGroup(col, this, store);
      if (prev) {
        prev.next = group;
        group.prev = prev;
      }
      prev = group;
      return group;
    });
  }
}
