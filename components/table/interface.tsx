import { CSSProperties, Key, ReactNode } from 'react';
import { PaginationProps } from '../pagination';
import { SpinProps } from '../spin';
import { Store } from './createStore';
import { RadioChangeEvent } from '../radio';
import { CheckboxChangeEvent } from '../checkbox';
import { Size } from '../_util/enum';

export type CompareFn<T> = ((a: T, b: T) => number);
export type ColumnFilterItem = { text: string; value: string, children?: ColumnFilterItem[] };

export interface ColumnProps<T> {
  title?: ReactNode;
  filterTitle?: ReactNode;
  empty?: ReactNode;
  key?: Key;
  dataIndex?: string;
  render?: (text: any, record: T, index: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  filters?: ColumnFilterItem[];
  onFilter?: (value: any, record: T, filters?: ColumnFilterItem[]) => boolean;
  onColumnFilterChange?: (item: any) => void;
  filterMultiple?: boolean;
  filterDropdown?: ReactNode;
  filterDropdownVisible?: boolean;
  onFilterDropdownVisibleChange?: (visible: boolean) => void;
  sorter?: boolean | CompareFn<T>;
  defaultSortOrder?: 'ascend' | 'descend';
  colSpan?: number;
  width?: string | number;
  className?: string;
  fixed?: boolean | ('left' | 'right');
  filterIcon?: ReactNode;
  filteredValue?: any[];
  sortOrder?: boolean | ('ascend' | 'descend');
  children?: ColumnProps<T>[];
  onCellClick?: (record: T, event: any) => void;
  onCell?: (record: T) => any;
  onHeaderCell?: (props: ColumnProps<T>) => any;
  hidden?: boolean;
  notDisplay?: boolean;
  disableClick?: boolean;
}

export interface TableComponents {
  table?: any;
  header?: {
    wrapper?: any;
    row?: any;
    cell?: any;
  };
  body?: {
    wrapper?: any;
    row?: any;
    cell?: any;
  };
}

export interface TableLocale {
  filterTitle?: string;
  filterConfirm?: ReactNode;
  filterReset?: ReactNode;
  emptyText?: ReactNode | (() => ReactNode);
  selectAll?: ReactNode;
  selectInvert?: ReactNode;
}

export type RowSelectionType = 'checkbox' | 'radio';
export type SelectionSelectFn<T> = (record: T, selected: boolean, selectedRows: Object[]) => any;

export interface TablePaginationConfig extends PaginationProps {
  position?: 'top' | 'bottom' | 'both';
  size?: Size;
}

export interface TableRowSelection<T> {
  type?: RowSelectionType;
  selectedRowKeys?: string[] | number[];
  onChange?: (selectedRowKeys: string[] | number[], selectedRows: Object[]) => any;
  getCheckboxProps?: (record: T) => Object;
  onSelect?: SelectionSelectFn<T>;
  onSelectAll?: (selected: boolean, selectedRows: Object[], changeRows: Object[]) => any;
  onSelectInvert?: (selectedRows: Object[]) => any;
  selections?: SelectionItem[] | boolean;
  hideDefaultSelections?: boolean;
  fixed?: boolean;
  columnWidth?: string | number;
}

export interface TableProps<T> {
  prefixCls?: string;
  dropdownPrefixCls?: string;
  noFilter?: boolean;
  autoScroll?: boolean;
  rowSelection?: TableRowSelection<T>;
  pagination?: TablePaginationConfig | false;
  size?: Size;
  dataSource?: T[];
  components?: TableComponents;
  columns?: ColumnProps<T>[];
  rowKey?: string | ((record: T, index: number) => string);
  rowClassName?: (record: T, index: number) => string;
  expandedRowRender?: any;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  expandIconAsCell?: boolean;
  expandIconColumnIndex?: number;
  expandRowByClick?: boolean;
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: T) => void;
  onChange?: (pagination: TablePaginationConfig | boolean, filters: string[], sorter: Object) => any;
  onFilterSelectChange?: (item: any) => void;
  onColumnFilterChange?: (item: any) => void;
  loading?: boolean | SpinProps;
  locale?: Object;
  indentSize?: number;
  onRowClick?: (record: T, index: number, event: Event) => any;
  onRow?: (record: T, index: number) => any;
  useFixedHeader?: boolean;
  bordered?: boolean;
  showHeader?: boolean;
  footer?: (currentPageData: Object[]) => ReactNode;
  title?: (currentPageData: Object[]) => ReactNode;
  empty?: (currentPageData: Object[]) => ReactNode;
  scroll?: { x?: boolean | number | string, y?: boolean | number | string };
  childrenColumnName?: string;
  bodyStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  filterBar?: boolean;
  filters?: string[];
  filterBarPlaceholder?: string;
  filterBarMultiple?: boolean;
}

export interface TableStateFilters {
  [key: string]: string[];
}

export interface TableState<T> {
  pagination: TablePaginationConfig;
  filters: TableStateFilters;
  barFilters: any[];
  sortColumn: ColumnProps<T> | null;
  sortOrder?: boolean | string | null;
}

export type SelectionItemSelectFn = (key: string[]) => any;

export interface SelectionItem {
  key: string;
  text: ReactNode;
  onSelect: SelectionItemSelectFn;
}

export interface SelectionCheckboxAllProps<T> {
  store: Store;
  locale: any;
  disabled: boolean;
  getCheckboxPropsByItem: (item: any, index: number) => any;
  getRecordKey: (record: any, index?: number) => string;
  data: T[];
  prefixCls: string | undefined;
  onSelect: (key: string, index: number, selectFunc: any) => void;
  hideDefaultSelections?: boolean;
  selections?: SelectionItem[] | boolean;
  getPopupContainer: (triggerNode?: Element) => HTMLElement;
}

export interface SelectionCheckboxAllState {
  checked: boolean;
  indeterminate: boolean;
}

export interface SelectionBoxProps {
  store: Store;
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

export interface FilterMenuProps<T> {
  locale: TableLocale;
  selectedKeys: string[];
  column: ColumnProps<T>;
  confirmFilter: (column: ColumnProps<T>, selectedKeys: string[]) => any;
  prefixCls: string;
  dropdownPrefixCls: string;
  getPopupContainer: (triggerNode?: Element) => HTMLElement;
}

export interface FilterMenuState {
  selectedKeys: string[];
  keyPathOfSelectedItem: { [key: string]: string };
  visible?: boolean;
}
