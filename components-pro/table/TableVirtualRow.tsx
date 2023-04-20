import React, { FunctionComponent, ReactNode, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useInView } from 'react-intersection-observer';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import { VIRTUAL_ROOT_MARGIN } from './TableStore';
import ColumnGroups from './ColumnGroups';
import { Group } from '../data-set/DataSet';
import VirtualRowMetaData from './VirtualRowMetaData';
import TableRow from './TableRow';

export interface TableVirtualRowProps extends ElementProps {
  lock?: ColumnLock | boolean | undefined;
  isExpanded?: boolean | undefined;
  columnGroups: ColumnGroups;
  record: Record;
  index: number;
  isFixedRowHeight?: boolean | undefined;
  virtualCell?: boolean | undefined;
  virtualIndex?: number | undefined;
  headerGroupIndex?: number | undefined;
  expandIconColumnIndex?: number | undefined;
  snapshot?: DraggableStateSnapshot | undefined;
  provided?: DraggableProvided | undefined;
  isDragDisabled?: boolean | ((record?: Record) => boolean);
  groupPath?: [Group, boolean][] | undefined;
  metaData?: VirtualRowMetaData;
  children?: ReactNode;
}

const TableVirtualRow: FunctionComponent<TableVirtualRowProps> = function TableVirtualRow(props) {
  const { index } = props;
  const context = useContext(TableContext);
  const { tableStore } = context;
  const { node } = tableStore;
  const mounted = useRef<boolean>(false);
  const { ref: intersectionRef, inView, entry } = useInView({
    root: tableStore.overflowY ? node.tableBodyWrap || node.element : null,
    rootMargin: `${VIRTUAL_ROOT_MARGIN}px`,
    initialInView: mounted.current || tableStore.isRowInView(index),
    triggerOnce: true,
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const columnsInView = tableStore.columnGroups.inView;
  const height = (!inView || !columnsInView) ?
    entry && (entry.target as HTMLTableRowElement).offsetParent ?
      pxToRem(entry.boundingClientRect.height || (entry.target as HTMLTableRowElement).offsetHeight, true) :
      undefined : undefined;

  return <TableRow {...props} intersectionRef={intersectionRef} inView={inView} columnsInView={columnsInView} virtualHeight={height} />;
};

TableVirtualRow.displayName = 'TableVirtualRow';

export default observer(TableVirtualRow);
