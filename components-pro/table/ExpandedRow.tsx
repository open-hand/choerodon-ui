import { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import isFunction from 'lodash/isFunction';
import Record from '../data-set/Record';
import ColumnGroups from './ColumnGroups';
import TableStore from './TableStore';

export interface ExpandedRowProps {
  isExpanded?: boolean;
  tableStore: TableStore;
  columnGroups: ColumnGroups;
  record: Record;
  children?:
    | ReactNode
    | ((
    tableStore: TableStore,
    columnGroups: ColumnGroups,
    record: Record,
    isExpanded?: boolean,
  ) => ReactNode);
}

const ExpandedRow: FunctionComponent<ExpandedRowProps> = function ExpandedRow(props) {
  const { tableStore, isExpanded, children = null, columnGroups, record } = props;

  if (isFunction(children)) {
    const child = children(tableStore, columnGroups, record, isExpanded);
    if (child) {
      return child;
    }
  }
  return children;
};

ExpandedRow.displayName = 'ExpandedRow';

export default observer(ExpandedRow);
