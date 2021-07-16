import { Key } from 'react';
import { computed } from 'mobx';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroups from './ColumnGroups';
import { getColumnKey } from './utils';

export default class ColumnGroup {
  column: ColumnProps;

  children?: ColumnGroups;

  parent: ColumnGroups;

  prev?: ColumnGroup;

  next?: ColumnGroup;

  @computed
  get key(): Key {
    return getColumnKey(this.column);
  }

  @computed
  get rowSpan(): number {
    return this.parent.deep - this.deep + 1;
  }

  @computed
  get colSpan(): number {
    const { children } = this;
    return children ? children.wide : 1;
  }

  @computed
  get deep(): number {
    const { children } = this;
    return children ? children.deep + 1 : this.hidden ? 0 : 1;
  }

  @computed
  get hidden(): boolean {
    const { children } = this;
    return children ? children.hidden : !!this.column.hidden;
  }

  @computed
  get lastLeaf(): ColumnProps {
    const { children } = this;
    return children ? children.lastLeaf : this.column;
  }

  @computed
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

  constructor(column: ColumnProps, parent: ColumnGroups) {
    this.column = column;
    column._group = this;
    this.parent = parent;
    const { children } = column;
    const { aggregation } = parent;
    if ((!column.aggregation || !aggregation) && children && children.length > 0) {
      this.children = new ColumnGroups(children, aggregation, this);
    }
  }
}
