import { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import isFunction from 'lodash/isFunction';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  record: Record;
  lock?: ColumnLock | boolean;
  children?:
    | ReactNode
    | ((
    record: Record,
    isExpanded?: boolean,
  ) => ReactNode);
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = observer(function ExpandedRow(props) {
  const { isExpanded, children = null, record } = props;

  if (isFunction(children)) {
    const child = children(record, isExpanded);
    if (child) {
      return child;
    }
  }
  return children;
});

ExpandedRow.displayName = 'ExpandedRow';

export default ExpandedRow;
