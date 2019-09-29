import { ReactNode } from 'react';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  columns: ColumnProps[];
  record: Record;
  lock?: ColumnLock | boolean;
  children?: (
    columns: ColumnProps[],
    record: Record,
    isExpanded?: boolean,
    lock?: ColumnLock | boolean,
  ) => ReactNode;
}

export default function ExpandedRow(props: ExpandedRowProps) {
  const { isExpanded, children, columns, record, lock } = props;

  if (typeof children === 'function') {
    return children(columns, record, isExpanded, lock);
  }
  return null;
}
