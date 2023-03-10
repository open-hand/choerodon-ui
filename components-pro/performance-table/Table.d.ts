import * as React from 'react';
import { DragStart, DragUpdate, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { CheckboxChangeEvent } from 'choerodon-ui/lib/checkbox';
import { RadioChangeEvent } from 'choerodon-ui/lib/radio';
import { StandardProps, SortType, RowDataType } from './common';
import { ColumnProps } from './Column.d';
import { ToolBarProps } from './tool-bar';
import DataSet from '../data-set';
import { TransportProps } from '../data-set/Transport';
import { TableQueryBarType } from './Table';
import { FormProps } from '../form/Form';
import { TableHeightType } from '../table/enum';

export interface TableLocale {
  emptyMessage?: string;
  loading?: string;
}


export interface TableScrollLength {
  horizontal?: number;
  vertical?: number;
}

export interface TableQueryBarProps {
  type?: TableQueryBarType;
  renderer?: (props: TableQueryBarHookProps) => React.ReactNode;
  dataSet?: DataSet;
  queryFormProps?: FormProps;
  defaultExpanded?: Boolean;
  queryDataSet?: DataSet;
  queryFields?: React.ReactElement<any>[];
  queryFieldsLimit?: number;
  onQuery?: (props: object) => void;
  onReset?: () => void;
}

export interface TableQueryBarHookProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: React.ReactElement<any>[];
  queryFieldsLimit?: number;
  onQuery?: (props: object) => void;
  onReset?: () => void;
}

export interface DynamicFilterBarConfig {
  searchCode: string;
  searchText?: string;
  quickSearch?: boolean;
  suffixes?: React.ReactElement<any>[];
  prefixes?: React.ReactElement<any>[];
  tableFilterAdapter?: TransportProps;
}

export interface PerformanceTableCustomized {
  columns: object;
  heightType?: TableHeightType;
  height?: number;
  heightDiff?: number;
}

export type RowSelectionType = 'checkbox' | 'radio';
export type SelectionSelectFn = (
  record: object,
  selected: boolean,
  selectedRows: Object[],
  nativeEvent: Event,
) => void;

export type TableSelectWay = 'onSelect' | 'onSelectMultiple' | 'onSelectAll' | 'onSelectInvert';
export type SelectionItemSelectFn = (key: string[]) => void;

export interface SelectionItem {
  key: string;
  text: React.ReactNode;
  onSelect?: SelectionItemSelectFn;
}

export interface TableRowSelection {
  type?: RowSelectionType;
  selectedRowKeys?: string[] | number[];
  onChange?: (selectedRowKeys: string[] | number[], selectedRows: object[]) => void;
  getCheckboxProps?: (record: object) => Object;
  onSelect?: SelectionSelectFn;
  onSelectMultiple?: (selected: boolean, selectedRows: object[], changeRows: object[]) => void;
  onSelectAll?: (selected: boolean, selectedRows: object[], changeRows: object[]) => void;
  onSelectInvert?: (selectedRowKeys: string[] | number[]) => void;
  selections?: SelectionItem[] | boolean;
  hideDefaultSelections?: boolean;
  fixed?: boolean | string;
  columnWidth?: number;
  selectWay?: TableSelectWay;
  columnTitle?: string | React.ReactNode;
  columnIndex?: number;
}

export interface SelectionCheckboxAllProps {
  store: any;
  disabled: boolean;
  getCheckboxPropsByItem: (item: object, index: number) => { defaultChecked: boolean };
  getRecordKey: (record: object, index?: number) => string;
  data: object[];
  prefixCls: string | undefined;
  onSelect: (key: string, index: number, selectFunc: any) => void;
  hideDefaultSelections?: boolean;
  selections?: SelectionItem[] | boolean;
}

export interface SelectionCheckboxAllState {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface SelectionBoxProps {
  store: any;
  type?: RowSelectionType;
  defaultSelection: string[];
  rowIndex: string;
  name?: string;
  disabled?: boolean;
  onChange: (e: RadioChangeEvent | CheckboxChangeEvent) => void;
}

export interface SelectionBoxState {
  checked?: boolean;
}

export interface SelectionInfo {
  selectWay: TableSelectWay;
  record?: object;
  checked?: boolean;
  changeRowKeys?: React.Key[];
  nativeEvent?: Event;
}

export interface TableProps extends StandardProps {
  /** 左上角的 title */
  headerTitle?: React.ReactNode;
  rowSelection?: TableRowSelection;
  queryBar?: false | TableQueryBarProps;
  toolbar?: ToolBarProps,
  /** 渲染操作栏 */
  toolBarRender?: ToolBarProps['toolBarRender'] | false,
  columns?: ColumnProps[];
  autoHeight?: boolean;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  bodyRef?: (ref: HTMLElement) => void;
  bordered?: boolean;
  className?: string;
  classPrefix: string;
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
  rowKey: string;
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
    expanded?: boolean,
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
  customizedCode?: string;
  customizable?: boolean;
  columnDraggable?: boolean;
  columnTitleEditable?: boolean;
  columnsDragRender?: object;
  rowDraggable?: boolean;
  onDragStart?: (initial: DragStart, provided: ResponderProvided) => void;
  onDragEnd?: (result: DropResult, provided: ResponderProvided, data: object) => void;
  onDragEndBefore?: (result: DropResult, provided: ResponderProvided) => boolean;
}

// Fix the type definition error of typescript
declare const Table: React.ComponentType<TableProps>;

export default Table;
