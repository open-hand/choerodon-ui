import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useInView } from 'react-intersection-observer';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import ColumnGroup from './ColumnGroup';
import { VIRTUAL_ROOT_MARGIN } from './TableStore';
import TableCell from './TableCell';

export interface TableVirtualCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  record: Record | undefined;
  rowIndex: number;
  colSpan?: number | undefined;
  isDragging: boolean;
  isDragDisabled?: boolean | ((record?: Record) => boolean);
  isFixedRowHeight?: boolean | undefined;
  provided?: DraggableProvided | undefined;
  disabled?: boolean | undefined;
  groupPath?: [Group, boolean][] | undefined;
  children?: ReactNode | undefined;
  needRender?: boolean;
}

const TableVirtualCell: FunctionComponent<TableVirtualCellProps> = function TableVirtualCell(props) {
  const { tableStore: { node } } = useContext(TableContext);
  const { ref: intersectionRef, inView, entry } = useInView({
    root: node.tableBodyWrap || node.element,
    rootMargin: `${VIRTUAL_ROOT_MARGIN}px`,
    initialInView: true,
  });
  const height = !inView && entry && (entry.target as HTMLTableRowElement).offsetParent ?
    pxToRem(entry.boundingClientRect.height || (entry.target as HTMLTableRowElement).offsetHeight, true)
    : undefined;

  return (
    <TableCell {...props} intersectionRef={intersectionRef} inView={inView} virtualHeight={height} />
  );
};

TableVirtualCell.displayName = 'TableVirtualCell';

export default observer(TableVirtualCell);
