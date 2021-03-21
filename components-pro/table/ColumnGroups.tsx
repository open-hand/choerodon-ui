import { computed } from 'mobx';
import { ColumnProps } from './Column';
import ColumnGroup from './ColumnGroup';

export default class ColumnGroups {
  columns: ColumnGroup[];

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
  get lastLeaf(): ColumnProps {
    const avaliableColumns = this.columns.filter(column => !column.hidden);
    return avaliableColumns[avaliableColumns.length - 1].lastLeaf;
  }

  @computed
  get width(): number {
    return this.columns.reduce((sum, { width }) => sum + width, 0);
  }

  @computed
  get left(): number {
    const { parent } = this;
    if (parent) {
      return parent.left;
    }
    return 0;
  }

  @computed
  get right(): number {
    const { parent } = this;
    if (parent) {
      return parent.right;
    }
    return 0;
  }

  constructor(columns: ColumnProps[], parent?: ColumnGroup) {
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
