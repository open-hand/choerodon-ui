import { computed } from 'mobx';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroup from './ColumnGroup';
import { ColumnLock } from './enum';

export default class ColumnGroups {
  columns: ColumnGroup[];

  aggregation?: boolean | undefined;

  parent?: ColumnGroup;

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
    return hidden ? [] : this.columns.reduce<ColumnGroup[]>((leafs, group) => leafs.concat(aggregation && group.column.aggregation ? group : group.leafs), []);
  }

  @computed
  get leftLeafs(): ColumnGroup[] {
    if (!this.parent) {
      const { aggregation } = this;
      return this.columns.reduce<ColumnGroup[]>(
        (leafs, group) => group.lock === ColumnLock.left ? leafs.concat(aggregation && group.column.aggregation ? group : group.leafs) : leafs,
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
        (leafs, group) => group.lock === ColumnLock.right ? leafs.concat(aggregation && group.column.aggregation ? group : group.leafs) : leafs,
        [],
      );
    }
    return [];
  }

  get leftLeafColumnsWidth(): number {
    return this.leftLeafs.reduce<number>((total, { column }) => total + columnWidth(column), 0);
  }

  get rightLeafColumnsWidth(): number {
    return this.rightLeafs.reduce<number>((total, { column }) => total + columnWidth(column), 0);
  }

  constructor(columns: ColumnProps[], aggregation?: boolean | undefined, parent?: ColumnGroup) {
    this.aggregation = aggregation;
    this.parent = parent;
    let prev: ColumnGroup | undefined;
    this.columns = columns.map(col => {
      const group = new ColumnGroup(col, this);
      if (prev) {
        prev.next = group;
        group.prev = prev;
      }
      prev = group;
      return group;
    });
  }
}
