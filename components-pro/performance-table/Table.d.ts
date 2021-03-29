import * as React from 'react';
import { StandardProps, SortType, RowDataType } from './common';
import { ColumnProps } from './Column.d';

export interface TableLocale {
  emptyMessage?: string;
  loading?: string;
}


export interface TableScrollLength {
  horizontal?: number;
  vertical?: number;
}

export interface TableProps extends StandardProps {
  columns?: ColumnProps[];
  autoHeight?: boolean;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  bodyRef?: (ref: HTMLElement) => void;
  bordered?: boolean;
  className?: string;
  classPrefix?: string;
  children: React.ReactNode;
  cellBordered?: boolean;
  defaultSortType?: SortType;
  disabledScroll?: boolean;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: string[] | number[];
  data: object[];
  expandedRowKeys?: string[] | number[];
  height: number;
  hover: boolean;
  headerHeight: number;
  locale: TableLocale;
  clickScrollLength: TableScrollLength,
  loading?: boolean;
  loadAnimation?: boolean;
  minHeight: number;
  rowHeight: number | ((rowData: object) => number);
  rowKey: string | number;
  isTree?: boolean;
  rowExpandedHeight?: number;
  rowClassName?: string | ((rowData: object) => string);
  showHeader?: boolean;
  showScrollArrow?: boolean;
  style?: React.CSSProperties;
  sortColumn?: string;
  sortType?: SortType;
  shouldUpdateScroll?: boolean;
  translate3d?: boolean;
  rtl?: boolean;
  width?: number;
  wordWrap?: boolean;
  virtualized?: boolean;
  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean
  ) => React.ReactNode;
  renderRowExpanded?: (rowDate?: object) => React.ReactNode;
  renderEmpty?: (info: React.ReactNode) => React.ReactNode;
  renderLoading?: (loading: React.ReactNode) => React.ReactNode;
  onRowClick?: (rowData: object, event: React.MouseEvent) => void;
  onRowContextMenu?: (rowData: object, event: React.MouseEvent) => void;
  onScroll?: (scrollX: number, scrollY: number) => void;
  onSortColumn?: (dataKey: string, sortType?: SortType) => void;
  onExpandChange?: (expanded: boolean, rowData: object) => void;
  onTouchStart?: (event: React.TouchEvent) => void; // for tests
  onTouchMove?: (event: React.TouchEvent) => void; // for tests
  onDataUpdated?: (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void;
}

// Fix the type definition error of typescript
declare const Table: React.ComponentType<TableProps>;

export default Table;
