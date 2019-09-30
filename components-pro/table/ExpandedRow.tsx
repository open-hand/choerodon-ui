import { FunctionComponent, ReactNode } from 'react';
import isFunction from 'lodash/isFunction';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  columns: ColumnProps[];
  record: Record;
  lock?: ColumnLock | boolean;
  children?:
    | ReactNode
    | ((
        columns: ColumnProps[],
        record: Record,
        isExpanded?: boolean,
        lock?: ColumnLock | boolean,
      ) => ReactNode);
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = props => {
  const { isExpanded, children = null, columns, record, lock } = props;

  if (isFunction(children)) {
    const child = children(columns, record, isExpanded, lock);
    if (child) {
      return child;
    }
  }
  return children;
};

export default ExpandedRow;
