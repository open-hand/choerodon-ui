import { PureComponent, ReactNode } from 'react';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  columns: ColumnProps[],
  record: Record,
  lock?: ColumnLock | boolean,
  children?: (columns: ColumnProps[], record: Record, isExpanded?: boolean, lock?: ColumnLock | boolean) => ReactNode;
}

export default class ExpandedRow extends PureComponent<ExpandedRowProps> {
  render() {
    const { isExpanded, children, columns, record, lock } = this.props;

    if (typeof children === 'function') {
      return children(columns, record, isExpanded, lock);
    }
    return null;
  }
}
