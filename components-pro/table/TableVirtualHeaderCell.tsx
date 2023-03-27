import React, { FunctionComponent, ReactNode, useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { observer } from 'mobx-react-lite';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import ColumnGroup from './ColumnGroup';
import TableHeaderCell from './TableHeaderCell';

export interface TableVirtualHeaderCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  rowSpan?: number;
  colSpan?: number;
  rowIndex?: number;
  getHeaderNode?: () => HTMLTableSectionElement | null;
  scope?: string;
  children?: ReactNode;
  isSearchCell?: boolean;
  isRenderCell?: boolean;
}

const TableVirtualHeaderCell: FunctionComponent<TableVirtualHeaderCellProps> = function TableVirtualHeaderCell(props) {
  const { columnGroup } = props;
  const { tableStore } = useContext(TableContext);
  const { ref, inView } = useInView({
    root: tableStore.node.wrapper,
    rootMargin: '100px',
    initialInView: true,
  });
  useEffect(() => {
    columnGroup.setInView(inView);
    return () => {
      if (columnGroup.inView !== undefined) {
        columnGroup.setInView(undefined);
      }
    };
  }, [columnGroup, inView]);

  return (
    <TableHeaderCell {...props} intersectionRef={ref} />
  );
};

TableVirtualHeaderCell.displayName = 'TableVirtualHeaderCell';

export default observer(TableVirtualHeaderCell);
