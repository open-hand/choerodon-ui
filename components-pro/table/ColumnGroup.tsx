import { Key } from 'react';
import { action, computed, observable } from 'mobx';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroups from './ColumnGroups';
import { getColumnKey, getColumnLock } from './utils';
import { ColumnLock } from './enum';

export default class ColumnGroup {
  column: ColumnProps;

  children?: ColumnGroups;

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
    return children ? children.width : columnWidth(this.column);
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

  constructor(column: ColumnProps, parent: ColumnGroups) {
    this.column = column;
    this.key = getColumnKey(column);
    this.parent = parent;
    const { children } = column;
    const { aggregation } = parent;
    if ((!column.aggregation || !aggregation) && children && children.length > 0) {
      this.children = new ColumnGroups(children, aggregation, this);
    }
  }

  @action
  setInView(inView?: boolean) {
    this.inView = inView;
  }
}
