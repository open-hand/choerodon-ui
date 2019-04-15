import { ColumnProps } from './Column';
import { computed } from 'mobx';

export class ColumnGroup {
  column: ColumnProps;
  children?: ColumnGroups;
  parent: ColumnGroups;

  @computed
  get rowSpan(): number {
    return this.parent.deep - this.deep + 1;
  };

  @computed
  get colSpan(): number {
    return this.children ? this.children.wide : 1;
  }

  @computed
  get deep(): number {
    return this.children ? this.children.deep + 1 : this.hidden ? 0 : 1;
  };

  @computed
  get hidden(): boolean {
    return this.children ? this.children.hidden : !!this.column.hidden;
  }

  @computed
  get lastLeaf(): ColumnProps {
    return this.children ? this.children.lastLeaf : this.column;
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

export default class ColumnGroups {
  columns: ColumnGroup[];

  @computed
  get wide(): number {
    return this.columns.reduce((sum, { colSpan, hidden }) => hidden ? sum : sum + colSpan, 0);
  }

  @computed
  get deep(): number {
    return Math.max(...this.columns.map(({ deep }) => deep));
  };

  @computed
  get hidden(): boolean {
    return this.columns.every(({ hidden }) => hidden);
  }

  @computed
  get lastLeaf(): ColumnProps {
    return this.columns[this.columns.length - 1].lastLeaf;
  }

  constructor(columns: ColumnProps[]) {
    this.columns = columns.map(col => new ColumnGroup(col, this));
  }
}
