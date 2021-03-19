import { Key } from 'react';
import { computed } from 'mobx';
import { ColumnProps, columnWidth } from './Column';
import ColumnGroups from './ColumnGroups';
import { getColumnKey } from './utils';

export default class ColumnGroup {
  column: ColumnProps;

  children?: ColumnGroups;

  parent: ColumnGroups;

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
    return this.children ? this.children.wide : 1;
  }

  @computed
  get deep(): number {
    return this.children ? this.children.deep + 1 : this.hidden ? 0 : 1;
  }

  @computed
  get hidden(): boolean {
    return this.children ? this.children.hidden : !!this.column.hidden;
  }

  @computed
  get lastLeaf(): ColumnProps {
    return this.children ? this.children.lastLeaf : this.column;
  }

  @computed
  get width(): number {
    return this.children ? this.children.width : columnWidth(this.column);
  }

  constructor(column: ColumnProps, parent: ColumnGroups) {
    this.column = column;
    this.parent = parent;
    const { children } = column;
    if (children && children.length > 0) {
      this.children = new ColumnGroups(children);
    }
  }
}
