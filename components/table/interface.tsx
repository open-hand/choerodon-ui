import { CSSProperties, Key, ReactNode } from 'react';
import { PaginationConfig, PaginationProps } from '../pagination';
import { SpinProps } from '../spin';
import { Store } from './createStore';
import { RadioChangeEvent } from '../radio';
import { CheckboxChangeEvent } from '../checkbox';
import { ButtonProps } from '../button';
import { Size } from '../_util/enum';
import { DropDownProps } from '../dropdown';
import { MenuProps } from '../menu';
import { InputNumberProps } from '../input-number';
import { TableAutoHeightType } from './enum';

export type CompareFn<T> = (a: T, b: T, sortOrder?: 'ascend' | 'descend') => number;
export type ColumnFilterItem = { text: string; value: string; children?: ColumnFilterItem[] };

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
  filterDropdown?: ReactNode | ((props: Record<string, any>) => ReactNode);
  filterDropdownVisible?: boolean;
  onFilterDropdownVisibleChange?: (visible: boolean) => void;
  sorter?: boolean | CompareFn<T>;
  defaultSortOrder?: SortOrder;
  colSpan?: number;
  width?: string | number;
  className?: string;
  fixed?: boolean | ('left' | 'right');
  filterIcon?: ReactNode;
  filteredValue?: any[];
  sortOrder?: SortOrder;
  children?: ColumnProps<T>[];
  filterBar?: boolean;
  filterField?: boolean;
  onCellClick?: (record: T, event: any) => void;
  onCell?: (record: T) => any;
  onHeaderCell?: (props: ColumnProps<T>) => any;
  orderSeq?: number;
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

export { TableAutoHeightType };

export type RowSelectionType = 'checkbox' | 'radio';
export type SelectionSelectFn<T> = (record: T, selected: boolean, selectedRows: Record<string, any>[], nativeEvent: Event) => any;

export type TableSelectWay = 'onSelect' | 'onSelectAll' | 'onSelectInvert';

export interface TablePaginationConfig extends PaginationConfig {
  size?: Size;
}

export interface TableRowSelection<T> {
  type?: RowSelectionType;
  selectedRowKeys?: string[] | number[];
  onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => any;
  getCheckboxProps?: (record: T) => Record<string, any>;
  onSelect?: SelectionSelectFn<T>;
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => any;
  onSelectInvert?: (selectedRowKeys: Key[]) => any;
  selections?: SelectionItem[] | boolean;
  hideDefaultSelections?: boolean;
  fixed?: boolean;
  columnWidth?: string | number;
}

export type SortOrder = 'descend' | 'ascend' | null;

export interface SorterResult<T> {
  column?: ColumnProps<T> | undefined;
  order?: SortOrder | undefined;
  field?: string | undefined;
  columnKey?: Key | undefined;
}

export interface SorterRenderProps<T> {
  column: ColumnProps<T>;
  sortOrder?: SortOrder;
  isSortColumn?: boolean;
  changeOrder: (order: SortOrder) => void;
  prefixCls?: string;
}

export type TableSize = Size | 'middle';

export type TableFilterValue = (Key | boolean)[];

export type TableStateFilters<T> = Record<keyof T, TableFilterValue | null>;

export interface TableProps<T> {
  prefixCls?: string;
  dropdownPrefixCls?: string;
  radioPrefixCls?: string;
  checkboxPrefixCls?: string;
  spinPrefixCls?: string;
  dropdownProps?: Partial<DropDownProps>;
  menuProps?: MenuProps;
  buttonProps?: ButtonProps;
  inputNumberProps?: InputNumberProps;
  rippleDisabled?: boolean;
  noFilter?: boolean;
  autoScroll?: boolean;
  rowSelection?: TableRowSelection<T>;
  paginationProps?: PaginationProps;
  pagination?: TablePaginationConfig | false;
  size?: TableSize;
  dataSource?: T[];
  components?: TableComponents;
  columns?: ColumnProps<T>[];
  rowKey?: string | ((record: T, index: number) => string);
  rowClassName?: (record: T, index: number) => string;
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: string[] | number[];
  expandedRowKeys?: string[] | number[];
  expandIconAsCell?: boolean;
  resizable?: boolean;
  customCode?: string;
  filterBarLocale?: ColumnFilterMenuLocale;
  customColumns?: any[];
  defaultCustomColumns?: any[];
  onCustomColumnFilter?: (customColumns: any[]) => void;
  expandIconColumnIndex?: number;
  expandRowByClick?: boolean;
  onExpandedRowsChange?: (expandedRowKeys: string[] | number[]) => void;
  onExpand?: (expanded: boolean, record: T) => void;
  onChange?: (
    pagination: TablePaginationConfig | boolean,
    filters: TableStateFilters<T>,
    sorter: SorterResult<T>,
    params: any[],
  ) => any;
  onFilterSelectChange?: (item: any) => void;
  onColumnFilterChange?: (item: any) => void;
  loading?: boolean | SpinProps;
  locale?: Record<string, any>;
  indentSize?: number;
  onRowClick?: (record: T, index: number, event: Event) => any;
  onRow?: (record: T, index: number) => any;
  onHeaderRow?: (columns: ColumnProps<T>[], index: number) => any;
  useFixedHeader?: boolean;
  bordered?: boolean;
  showHeader?: boolean;
  footer?: (currentPageData: Record<string, any>[]) => ReactNode;
  title?: (currentPageData: Record<string, any>[]) => ReactNode;
  empty?: (currentPageData: Record<string, any>[]) => ReactNode;
  scroll?: { x?: boolean | number | string; y?: boolean | number | string };
  childrenColumnName?: string;
  bodyStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  exported?: ExportProps;
  autoHeight?: boolean | { type: TableAutoHeightType, diff: number };
  filterBar?: boolean;
  filters?: string[];
  filterBarPlaceholder?: string;
  filterBarMultiple?: boolean;
  renderSorter?: <F>(props: SorterRenderProps<T | F>) => ReactNode;
}

export interface TableState<T> {
  columnAdjust: any;
  pagination: TablePaginationConfig;
  filters: TableStateFilters<T>;
  barFilters: any[];
  sortColumn: ColumnProps<T> | null;
  sortOrder?: SortOrder;
  customColumns: any[];
  tableAutoHeight?: number; // 增加自适应高度
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
  checkboxPrefixCls?: string;
  dropdownProps?: Partial<DropDownProps>;
  menuProps?: MenuProps;
}

export interface SelectionCheckboxAllState {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface SelectionBoxProps {
  store: Store;
  type?: RowSelectionType;
  defaultSelection: string[];
  rowIndex: string;
  name?: string;
  radioPrefixCls?: string;
  checkboxPrefixCls?: string;
  disabled?: boolean;
  onChange: (e: RadioChangeEvent | CheckboxChangeEvent) => void;
}

export interface SelectionBoxState {
  checked?: boolean;
}

export interface SelectionInfo<T> {
  selectWay: TableSelectWay;
  record?: T;
  checked?: boolean;
  changeRowKeys?: Key[];
  nativeEvent?: Event;
}

export interface FilterMenuProps<T> {
  locale: TableLocale;
  selectedKeys: string[];
  column: ColumnProps<T>;
  confirmFilter: (column: ColumnProps<T>, selectedKeys: string[]) => any;
  prefixCls: string;
  dropdownProps: Partial<DropDownProps>;
  radioPrefixCls?: string;
  checkboxPrefixCls?: string;
  rippleDisabled?: boolean;
  getPopupContainer: (triggerNode?: Element) => HTMLElement;
}

export interface FilterMenuState {
  selectedKeys: string[];
  keyPathOfSelectedItem: { [key: string]: string };
  visible?: boolean;
}

export interface CustomColumn {
  fieldKey: string; // 对应 column 的 key 或者 dataIndex 或者 index
  hidden: 0 | 1; // 是否隐藏
  fixedLeft: 0 | 1; // 固定在左边
  fixedRight: 0 | 1; // 固定在右边
  orderSeq: number; // 排序号
}

export interface ColumnFilterMenuLocale {
  display: string;
  fixedLeft: string;
  orderSeq: string;
  field: string;
}

export interface ColumnFilterMenuProps<T> {
  customCode: string;
  locale: TableLocale;
  filterBarLocale: ColumnFilterMenuLocale;
  customColumns?: CustomColumn[];
  store: any;
  columns: ColumnProps<T>[];
  prefixCls: string;
  dropdownProps: Partial<DropDownProps>;
  checkboxPrefixCls?: string;
  inputNumberProps?: InputNumberProps;
  confirmFilter: (customColumns: CustomColumn[]) => void;
  getPopupContainer: (trigger: HTMLElement) => HTMLElement;
}

export interface ColumnFilterMenuState {
  prevCustomColumns: CustomColumn[]; // 用来比较上次的 customColumns 是否相同
  customColumns: CustomColumn[]; // 存储 实际使用的 customColumns
  editing: boolean; // 编辑状态
}

// 每个 column 编辑的属性
export interface ColumnFilterMenuItemProps<T> {
  column: ColumnProps<T>;
  customColumn?: CustomColumn;
  index: number;
  checkboxPrefixCls?: string;
  inputNumberProps?: InputNumberProps;
  // 本身的方法: 获取合法的 编辑数据
  // getValidateCustomColumn: () => Promise<CustomColumn>;
}

export interface ColumnFilterMenuItemState {
  customColumn: CustomColumn;
  prevCustomColumn: CustomColumn;
}

export type handleProps = { dataParam?: Object, method: 'get' | 'post', action: string };

export type ExportProps = ButtonProps & handleProps & { onClick: (props: handleProps) => void } ;
