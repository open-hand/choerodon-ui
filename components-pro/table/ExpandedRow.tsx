import { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import isFunction from 'lodash/isFunction';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  columns: ColumnProps[];
  record: Record;
  children?:
    | ReactNode
    | ((
    record: Record,
    isExpanded?: boolean,
  ) => ReactNode);
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = observer(function ExpandedRow(props) {
  const { isExpanded, children = null, columns, record } = props;

  if (isFunction(children)) {
    const child = children(columns, record, isExpanded);
    if (child) {
      return child;
    }
  }
  return children;
});

ExpandedRow.displayName = 'ExpandedRow';

export default ExpandedRow;
