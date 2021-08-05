import { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import isFunction from 'lodash/isFunction';
import Record from '../data-set/Record';
import ColumnGroups from './ColumnGroups';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  columnGroups: ColumnGroups;
  record: Record;
  children?:
    | ReactNode
    | ((
    columnGroups: ColumnGroups,
    record: Record,
    isExpanded?: boolean,
  ) => ReactNode);
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = observer(function ExpandedRow(props) {
  const { isExpanded, children = null, columnGroups, record } = props;

  if (isFunction(children)) {
    const child = children(columnGroups, record, isExpanded);
    if (child) {
      return child;
    }
  }
  return children;
});

ExpandedRow.displayName = 'ExpandedRow';

export default ExpandedRow;
