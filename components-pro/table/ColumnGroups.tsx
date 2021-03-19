import { computed } from 'mobx';
import { ColumnProps } from './Column';
import ColumnGroup from './ColumnGroup';

export default class ColumnGroups {
  columns: ColumnGroup[];

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

  constructor(columns: ColumnProps[]) {
    this.columns = columns.map(col => new ColumnGroup(col, this));
  }
}
