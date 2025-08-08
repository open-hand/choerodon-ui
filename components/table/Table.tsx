import React, { Component, ComponentType, Key, ReactChildren, ReactNode, SyntheticEvent } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import omit from 'lodash/omit';
import defaultTo from 'lodash/defaultTo';
import noop from 'lodash/noop';
import scrollIntoView from 'scroll-into-view-if-needed';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import isEqual from 'lodash/isEqual';
import classes from 'component-classes';
import Pagination, { PaginationProps } from '../pagination';
import Icon from '../icon';
import Spin, { SpinProps } from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import warning from '../_util/warning';
import FilterDropdown from './filterDropdown';
import createStore, { Store } from './createStore';
import SelectionBox from './SelectionBox';
import SelectionCheckboxAll from './SelectionCheckboxAll';
import Column from './Column';
import Button from '../button';
import ColumnGroup from './ColumnGroup';
import createBodyRow from './createBodyRow';
import {
  findColumnByFilterValue,
  flatArray,
  flatFilter,
  getColumnKey,
  getHeight,
  getLeafColumns,
  isNumber,
  normalizeColumns,
  removeHiddenColumns,
  TableRowContext,
  treeMap,
} from './util';
import {
  ColumnProps,
  CompareFn,
  CustomColumn,
  ExportProps,
  handleProps,
  RowSelectionType,
  SelectionInfo,
  SelectionItemSelectFn,
  SorterRenderProps,
  SorterResult,
  TableAutoHeightType,
  TableComponents,
  TableLocale,
  TablePaginationConfig,
  TableProps,
  TableRowSelection,
  TableSelectWay,
  TableState,
  TableStateFilters,
} from './interface';
import { RadioChangeEvent } from '../radio';
import { CheckboxChangeEvent } from '../checkbox';
import FilterBar from './FilterBar';
import { VALUE_OR } from './FilterSelect';
import RcTable from '../rc-components/table';
import { Size } from '../_util/enum';
import Resizable from './Resizable';
import ColumnFilterMenu from './ColumnFilterMenu';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

const ResizeableTitle = (props: any) => {
  const { onResize, onDrag, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable onResize={onResize} onDrag={onDrag}>
      <th {...restProps} />
    </Resizable>
  );
};

function findBodyDom(dom: Element | HTMLDivElement, reg: RegExp): any {
  if (dom.childElementCount > 0) {
    for (let i = 0; i < dom.childElementCount; i += 1) {
      if (reg.test(dom.children[i].className)) {
        return dom.children[i];
      }
      if (dom.childElementCount > 0) {
        const childFound = findBodyDom(dom.children[i], reg);
        if (childFound !== null) {
          return childFound;
        }
      }
    }
  }
  return null;
}

function stopPropagation(e: SyntheticEvent<any>) {
  e.stopPropagation();
  if (e.nativeEvent.stopImmediatePropagation) {
    e.nativeEvent.stopImmediatePropagation();
  }
}

function getRowSelection<T>(props: TableProps<T>): TableRowSelection<T> {
  return props.rowSelection || {};
}

function defaultRenderSorter<T>(props: SorterRenderProps<T>): ReactNode {
  const { column, isSortColumn, sortOrder, prefixCls, changeOrder } = props;
  const isAscend = isSortColumn && sortOrder === 'ascend';
  column.className = classNames(column.className, {
    [`${prefixCls}-sort-${sortOrder}`]: isSortColumn,
  });
  const { onHeaderCell } = column;
  column.onHeaderCell = col => {
    const customProps = (onHeaderCell && onHeaderCell(col)) || {};
    const { onClick } = customProps;
    return {
      ...customProps,
      onClick: (e: SyntheticEvent<any>) => {
        if (!e.isDefaultPrevented()) {
          if (typeof onClick === 'function') {
            onClick(e);
          }
          if (!e.isDefaultPrevented()) {
            changeOrder(isAscend ? 'descend' : 'ascend');
          }
        }
      },
    };
  };
  return <Icon type="arrow_upward" className={`${prefixCls}-sort-icon`} />;
}

const defaultPagination = {
  onChange: noop,
  onShowSizeChange: noop,
};

/**
 * Avoid creating new object, so that parent component's shouldComponentUpdate
 * can works appropriately。
 */
const emptyObject = {};

export default class Table<T> extends Component<TableProps<T>, TableState<T>> {
  static displayName = 'Table';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static TableRowContext = TableRowContext;

  static Column = Column;

  static ColumnGroup = ColumnGroup;

  static defaultProps = {
    dataSource: [],
    empty: null,
    useFixedHeader: false,
    rowSelection: null,
    className: '',
    size: Size.default,
    loading: false,
    bordered: false,
    resizable: false,
    indentSize: 20,
    locale: {},
    rowKey: 'key',
    showHeader: true,
    autoHeight: false,
    filterBar: true,
    noFilter: false,
    autoScroll: true,
    renderSorter: defaultRenderSorter,
  };

  context: ConfigContextValue;

  CheckboxPropsCache: {
    [key: string]: any;
  };

  store: Store;

  columns: ColumnProps<T>[];

  components: TableComponents;

  row: ComponentType<any>;

  iframe: HTMLIFrameElement; // 判断存在iframe没有这样修复跳转页面问题

  element: HTMLDivElement;

  refTable: HTMLDivElement;

  wrapper: HTMLDivElement;

  constructor(props: TableProps<T>) {
    super(props);

    warning(
      !('columnsPageRange' in props || 'columnsPageSize' in props),
      '`columnsPageRange` and `columnsPageSize` are removed, please use fixed columns instead',
    );

    this.columns = props.columns || normalizeColumns(props.children as ReactChildren);

    this.createComponents(props.components);
    const customColumns = this.getCustomColumns() || [];
    this.state = {
      ...this.getDefaultSortOrder(this.columns),
      // 减少状态
      filters: this.getFiltersFromColumns(),
      barFilters: props.filters || [],
      pagination: this.getDefaultPagination(props),
      columnAdjust: {},
      customColumns,
      tableAutoHeight: 0,
    };

    this.CheckboxPropsCache = {};

    this.store = createStore({
      selectedRowKeys: getRowSelection(props).selectedRowKeys || [],
      selectionDirty: false,
      customColumns,
      exported: false,
      exportStoreProps: undefined,
      scroll: props.scroll,
    });
  }

  setElementRef = (node: RcTable) => {
    if (node && node.tableContent) {
      this.element = node.tableContent;
    }
  };

  saveRef = ref => {
    this.refTable = ref;
    this.wrapper = ref;
  };

  getCheckboxPropsByItem = (item: T, index: number) => {
    const rowSelection = getRowSelection(this.props);
    if (!rowSelection.getCheckboxProps) {
      return {};
    }
    const key = this.getRecordKey(item, index);
    // Cache checkboxProps
    if (!this.CheckboxPropsCache[key]) {
      this.CheckboxPropsCache[key] = rowSelection.getCheckboxProps(item);
    }
    return this.CheckboxPropsCache[key];
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { context } = this;
    return context.getPrefixCls('table', prefixCls);
  }

  getDefaultSelection() {
    const rowSelection = getRowSelection(this.props);
    if (!rowSelection.getCheckboxProps) {
      return [];
    }
    return this.getFlatData()
      .filter((item: T, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked)
      .map((record, rowIndex) => this.getRecordKey(record, rowIndex));
  }

  getDefaultPagination(props: TableProps<T>) {
    const pagination: TablePaginationConfig = props.pagination || {};
    return this.hasPagination(props) ?
      {
        ...defaultPagination,
        size: props.size,
        ...pagination,
        current: pagination.defaultCurrent || pagination.current || 1,
        pageSize: pagination.defaultPageSize || pagination.pageSize || 10,
      } : {};
  }

  componentWillReceiveProps(nextProps: TableProps<T>) {
    this.columns = nextProps.columns || normalizeColumns(nextProps.children as ReactChildren);
    if ('pagination' in nextProps || 'pagination' in this.props) {
      this.setState(previousState => {
        const newPagination = {
          ...defaultPagination,
          size: nextProps.size,
          ...previousState.pagination,
          ...nextProps.pagination,
        };
        newPagination.current = newPagination.current || 1;
        newPagination.pageSize = newPagination.pageSize || 10;
        return { pagination: nextProps.pagination !== false ? newPagination : emptyObject };
      });
    }
    const { dataSource, scroll, components } = this.props;
    const { filters, sortColumn, sortOrder } = this.state;
    if (nextProps.rowSelection && 'selectedRowKeys' in nextProps.rowSelection) {
      this.store.setState({
        selectedRowKeys: nextProps.rowSelection.selectedRowKeys || [],
      });
    }
    if ('dataSource' in nextProps && nextProps.dataSource !== dataSource) {
      this.store.setState({
        selectionDirty: false,
      });
    }
    if ('scroll' in nextProps && !isEqual(nextProps.scroll, scroll)) {
      const tableScroll = this.store.getState().scroll;
      this.store.setState({
        scroll: { ...tableScroll, ...nextProps.scroll },
      });
    }

    // https://github.com/ant-design/ant-design/issues/10133
    this.CheckboxPropsCache = {};

    if (this.getSortOrderColumns(this.columns).length > 0) {
      const sortState = this.getSortStateFromColumns(this.columns);
      if (sortState.sortColumn !== sortColumn || sortState.sortOrder !== sortOrder) {
        this.setState(sortState);
      }
    }

    const filteredValueColumns = this.getFilteredValueColumns(this.columns);
    if (filteredValueColumns.length > 0) {
      const filtersFromColumns = this.getFiltersFromColumns(this.columns);
      const newFilters = { ...filters };
      Object.keys(filtersFromColumns).forEach(key => {
        newFilters[key] = filtersFromColumns[key];
      });
      if (this.isFiltersChanged(newFilters)) {
        this.setState({ filters: newFilters });
      }
    }

    if ('filters' in nextProps) {
      this.setState({
        barFilters: nextProps.filters || [],
      });
    }

    this.createComponents(nextProps.components, components);
  }

  onRow = (record: T, index: number) => {
    const { onRow } = this.props;
    const prefixCls = this.getPrefixCls();
    const custom = onRow ? onRow(record, index) : {};
    return {
      ...custom,
      prefixCls,
      store: this.store,
      rowKey: this.getRecordKey(record, index),
    };
  };

  setSelectedRowKeys(
    selectedRowKeys: string[],
    selectionInfo: SelectionInfo<T>,
    selectedRows?: T[],
  ) {
    const { selectWay, record, checked, changeRowKeys, nativeEvent } = selectionInfo;
    const rowSelection = getRowSelection(this.props);
    if (rowSelection && !('selectedRowKeys' in rowSelection)) {
      this.store.setState({ selectedRowKeys });
    }
    if (!rowSelection.onChange && !rowSelection[selectWay]) {
      return;
    }
    const data = this.getFlatData();
    selectedRows = selectedRows || data.filter(
      (row, i) => selectedRowKeys.indexOf(this.getRecordKey(row, i)) >= 0,
    );
    if (rowSelection.onChange) {
      rowSelection.onChange(selectedRowKeys, selectedRows);
    }
    if (selectWay === 'onSelect' && rowSelection.onSelect) {
      rowSelection.onSelect(record!, checked!, selectedRows, nativeEvent!);
    } else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
      const changeRows = data.filter(
        (row, i) => changeRowKeys!.indexOf(this.getRecordKey(row, i)) >= 0,
      );
      rowSelection.onSelectAll(checked!, selectedRows, changeRows);
    } else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
      rowSelection.onSelectInvert(selectedRowKeys);
    }
  }

  hasPagination(props?: any) {
    return (props || this.props).pagination !== false;
  }

  isFiltersChanged(filters: TableStateFilters<T>) {
    let filtersChanged = false;
    const { filters: stateFilters } = this.state;
    if (Object.keys(filters).length !== Object.keys(stateFilters).length) {
      filtersChanged = true;
    } else {
      Object.keys(filters).forEach(columnKey => {
        if (filters[columnKey] !== stateFilters[columnKey]) {
          filtersChanged = true;
        }
      });
    }
    return filtersChanged;
  }

  getSortOrderColumns(columns?: ColumnProps<T>[]) {
    return flatFilter(
      columns || this.columns || [],
      (column: ColumnProps<T>) => 'sortOrder' in column,
    );
  }

  getFilteredValueColumns(columns?: ColumnProps<T>[]) {
    return flatFilter(
      columns || this.columns || [],
      (column: ColumnProps<T>) => typeof column.filteredValue !== 'undefined',
    );
  }

  getFiltersFromColumns(columns?: ColumnProps<T>[]): TableStateFilters<T> {
    const filters: TableStateFilters<T> = {} as TableStateFilters<T>;
    this.getFilteredValueColumns(columns).forEach((col: ColumnProps<T>) => {
      const colKey = this.getColumnKey(col) as string;
      filters[colKey] = col.filteredValue as any;
    });
    return filters;
  }

  getDefaultSortOrder(columns?: ColumnProps<T>[]) {
    const definedSortState = this.getSortStateFromColumns(columns);

    const defaultSortedColumn = flatFilter(
      columns || [],
      (column: ColumnProps<T>) => column.defaultSortOrder != null,
    )[0];

    if (defaultSortedColumn && !definedSortState.sortColumn) {
      return {
        sortColumn: defaultSortedColumn,
        sortOrder: defaultSortedColumn.defaultSortOrder,
      };
    }

    return definedSortState;
  }

  getSortStateFromColumns(columns?: ColumnProps<T>[]) {
    // return first column which sortOrder is not falsy
    const sortedColumn = this.getSortOrderColumns(columns).find(
      (col: ColumnProps<T>) => col.sortOrder,
    );

    if (sortedColumn) {
      return {
        sortColumn: sortedColumn,
        sortOrder: sortedColumn.sortOrder,
      };
    }

    return {
      sortColumn: null,
      sortOrder: null,
    };
  }

  getSorterFn() {
    const { sortOrder, sortColumn } = this.state;
    if (!sortOrder || !sortColumn || typeof sortColumn.sorter !== 'function') {
      return;
    }

    return (a: T, b: T) => {
      const result = (sortColumn!.sorter as CompareFn<T>)(a, b, sortOrder);
      if (result !== 0) {
        return sortOrder === 'descend' ? -result : result;
      }
      return 0;
    };
  }

  toggleSortOrder(order: 'ascend' | 'descend' | null, column: ColumnProps<T>) {
    let { sortColumn, sortOrder } = this.state;
    // 只同时允许一列进行排序，否则会导致排序顺序的逻辑问题
    const isSortColumn = this.isSortColumn(column);
    if (!isSortColumn) {
      // 当前列未排序
      sortOrder = order;
      sortColumn = column;
    } else if (sortOrder === order) {
      // 切换为未排序状态
      sortOrder = undefined;
      sortColumn = null;
    } else {
      // 切换为排序状态
      sortOrder = order;
    }
    const newState: Pick<TableState<T>, 'sortOrder' | 'sortColumn'> = {
      sortOrder,
      sortColumn,
    };

    // Controlled
    if (this.getSortOrderColumns().length === 0) {
      this.setState(newState);
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange(
        ...this.prepareParamsArguments({
          ...this.state,
          ...newState,
        }),
      );
    }
  }

  handleFilter = (column: ColumnProps<T>, nextFilters: string[]) => {
    const { filters: stateFilters } = this.state;
    const filters: TableStateFilters<T> = {
      ...stateFilters,
      [this.getColumnKey(column) as string]: nextFilters,
    };
    // Remove filters not in current columns
    const currentColumnKeys: string[] = [];
    treeMap(this.columns, c => {
      if (!c.children) {
        currentColumnKeys.push(this.getColumnKey(c) as string);
      }
    });
    Object.keys(filters).forEach(columnKey => {
      if (currentColumnKeys.indexOf(columnKey) < 0) {
        delete filters[columnKey];
      }
    });

    this.setNewFilterState({
      filters,
    });
  };

  setNewFilterState(newState: any) {
    const { pagination: propsPagination, onChange } = this.props;
    const { pagination: statePagination } = this.state;
    const pagination: TablePaginationConfig = { ...statePagination };

    if (propsPagination) {
      // Reset current prop
      pagination.current = 1;
      pagination.onChange!(pagination.current);
    }
    const filtersToSetState = { ...newState.filters };
    // Remove filters which is controlled
    this.getFilteredValueColumns().forEach((col: ColumnProps<T>) => {
      const columnKey = this.getColumnKey(col);
      if (columnKey) {
        delete filtersToSetState[columnKey];
      }
    });
    if (Object.keys(filtersToSetState).length > 0) {
      newState.filters = filtersToSetState;
    }

    // Controlled current prop will not respond user interaction
    if (typeof propsPagination === 'object' && 'current' in propsPagination) {
      newState.pagination = {
        ...pagination,
        current: statePagination.current,
      };
    }
    this.setState(newState, () => {
      this.store.setState({
        selectionDirty: false,
      });
      if (onChange) {
        onChange(
          ...this.prepareParamsArguments({
            ...this.state,
            pagination,
          }),
        );
      }
    });
  }

  handleFilterSelectClear = () => {
    const { filters } = this.state;
    Object.keys(filters).map(key => (filters[key] = []));
    this.setNewFilterState({
      barFilters: [],
      filters,
    });
  };

  handleFilterSelectChange = (barFilters: any[]) => {
    const { onFilterSelectChange } = this.props;
    if (onFilterSelectChange) {
      onFilterSelectChange(barFilters);
    }
    this.setNewFilterState({
      barFilters,
    });
  };

  handleColumnFilterChange = (e?: any) => {
    const { onColumnFilterChange } = this.props;
    if (onColumnFilterChange) {
      onColumnFilterChange(e);
    }
    this.forceUpdate();
  };

  getSelectedRows(_: { e?: CheckboxChangeEvent; selectionKey?: string; record?: T; rowIndex?: number }) {
    return undefined;
  }

  handleSelect = (record: T, rowIndex: number, e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    const nativeEvent = e.nativeEvent;
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    let selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const key = this.getRecordKey(record, rowIndex);
    if (checked) {
      selectedRowKeys.push(this.getRecordKey(record, rowIndex));
    } else {
      selectedRowKeys = selectedRowKeys.filter((i: string) => key !== i);
    }
    this.store.setState({
      selectionDirty: true,
    });
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay: 'onSelect',
      record,
      checked,
      changeRowKeys: undefined,
      nativeEvent,
    }, this.getSelectedRows({ e, record, rowIndex }));
  };

  handleRadioSelect = (record: T, rowIndex: number, e: RadioChangeEvent) => {
    const checked = e.target.checked;
    const nativeEvent = e.nativeEvent;
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    let selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const key = this.getRecordKey(record, rowIndex);
    selectedRowKeys = [key];
    this.store.setState({
      selectionDirty: true,
    });
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay: 'onSelect',
      record,
      checked,
      changeRowKeys: undefined,
      nativeEvent,
    }, this.getSelectedRows({ record, rowIndex }));
  };

  handleSelectRow = (selectionKey: string, index: number, onSelectFunc: SelectionItemSelectFn) => {
    const data = this.getFlatCurrentPageData();
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    const selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const changeableRowKeys = data
      .filter((item, i) => !this.getCheckboxPropsByItem(item, i).disabled)
      .map((item, i) => this.getRecordKey(item, i));

    const changeRowKeys: string[] = [];
    let selectWay: TableSelectWay = 'onSelectAll';
    let checked;
    // handle default selection
    switch (selectionKey) {
      case 'all':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = true;
        break;
      case 'removeAll':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = false;
        break;
      case 'invert':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
          } else {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
          }
          changeRowKeys.push(key);
          selectWay = 'onSelectInvert';
        });
        break;
      default:
        break;
    }

    this.store.setState({
      selectionDirty: true,
    });
    // when select custom selection, callback selections[n].onSelect
    const { rowSelection } = this.props;
    let customSelectionStartIndex = 2;
    if (rowSelection && rowSelection.hideDefaultSelections) {
      customSelectionStartIndex = 0;
    }
    if (index >= customSelectionStartIndex && typeof onSelectFunc === 'function') {
      return onSelectFunc(changeableRowKeys);
    }
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay,
      checked,
      changeRowKeys,
    }, this.getSelectedRows({ selectionKey }));
  };

  handlePageChange = (current: number, ...otherArguments: any[]) => {
    const { onChange, autoScroll, pagination: propsPagination } = this.props;
    const { pagination: statePagination } = this.state;
    const pagination = { ...statePagination };
    if (autoScroll) {
      const { refTable } = this;
      setTimeout(() => {
        const scrollIntoViewSmoothly =
          'scrollBehavior' in document.documentElement.style
            ? scrollIntoView
            : smoothScrollIntoView;
        if (refTable) {
          if (refTable.clientHeight > document.body.clientHeight) {
            scrollIntoViewSmoothly(refTable, { block: 'start', behavior: 'smooth', scrollMode: 'if-needed' });
          } else if ('scrollIntoViewIfNeeded' in refTable) {
            (refTable as any).scrollIntoViewIfNeeded({
              block: 'start',
            });
          } else {
            scrollIntoViewSmoothly(refTable, { block: 'start', behavior: 'smooth', scrollMode: 'if-needed' });
          }
        }
      }, 10);
      if (refTable) {
        const dom = findBodyDom(refTable, new RegExp(`${this.getPrefixCls()}-body`));
        if (dom !== null && dom.scroll) {
          dom.scrollTop = 0;
        }
      }
    }
    if (current) {
      pagination.current = current;
    } else {
      pagination.current = pagination.current || 1;
    }
    pagination.onChange!(pagination.current, ...otherArguments);

    const newState = {
      pagination,
    };
    // Controlled current prop will not respond user interaction
    if (propsPagination && typeof propsPagination === 'object' && 'current' in propsPagination) {
      newState.pagination = {
        ...pagination,
        current: statePagination.current,
      };
    }
    this.setState(newState);

    this.store.setState({
      selectionDirty: false,
    });

    if (onChange) {
      onChange(
        ...this.prepareParamsArguments({
          ...this.state,
          pagination,
        }),
      );
    }
  };

  renderSelectionBox = (type: RowSelectionType | undefined) => {
    return (_: any, record: T, index: number) => {
      const rowIndex = this.getRecordKey(record, index); // 从 1 开始
      const props = this.getCheckboxPropsByItem(record, index);
      const handleChange = (e: RadioChangeEvent | CheckboxChangeEvent) => {
        if (type === 'radio') {
          this.handleRadioSelect(record, rowIndex, e);
        } else {
          this.handleSelect(record, rowIndex, e);
        }
      };
      const { radioPrefixCls, checkboxPrefixCls } = this.props;
      return (
        <span onClick={stopPropagation}>
          <SelectionBox
            radioPrefixCls={radioPrefixCls}
            checkboxPrefixCls={checkboxPrefixCls}
            type={type}
            store={this.store}
            rowIndex={rowIndex}
            onChange={handleChange}
            defaultSelection={this.getDefaultSelection()}
            {...props}
          />
        </span>
      );
    };
  };

  getRecordKey = (record: T, index: number) => {
    const { rowKey } = this.props;
    const recordKey =
      typeof rowKey === 'function' ? rowKey(record, index) : (record as any)[rowKey as string];
    warning(
      recordKey !== undefined,
      'Each record in dataSource of table should have a unique `key` prop, or set `rowKey` to an unique primary key',
    );
    return recordKey === undefined ? index : recordKey;
  };

  getPopupContainer = () => {
    return findDOMNode(this) as HTMLElement;
  };

  renderRowSelection(columns: ColumnProps<T>[], locale: TableLocale) {
    const { rowSelection, dropdownProps, menuProps, checkboxPrefixCls } = this.props;
    const prefixCls = this.getPrefixCls();
    if (rowSelection) {
      const data = this.getFlatCurrentPageData().filter((item, index) => {
        if (rowSelection.getCheckboxProps) {
          return !this.getCheckboxPropsByItem(item, index).disabled;
        }
        return true;
      });
      const selectionColumnClass = classNames(`${prefixCls}-selection-column`, {
        [`${prefixCls}-selection-column-custom`]: rowSelection.selections,
      });
      const selectionColumn: ColumnProps<any> = {
        key: 'selection-column',
        render: this.renderSelectionBox(rowSelection.type),
        className: selectionColumnClass,
        fixed: rowSelection.fixed,
        width: defaultTo(rowSelection.columnWidth, 50),
      };
      if (rowSelection.type !== 'radio') {
        const checkboxAllDisabled = data.every(
          (item, index) => this.getCheckboxPropsByItem(item, index).disabled,
        );
        selectionColumn.title = (
          <SelectionCheckboxAll
            checkboxPrefixCls={checkboxPrefixCls}
            dropdownProps={dropdownProps}
            menuProps={menuProps}
            store={this.store}
            locale={locale}
            data={data}
            getCheckboxPropsByItem={this.getCheckboxPropsByItem}
            getRecordKey={this.getRecordKey}
            disabled={checkboxAllDisabled}
            prefixCls={prefixCls}
            onSelect={this.handleSelectRow}
            selections={rowSelection.selections}
            hideDefaultSelections={rowSelection.hideDefaultSelections}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      if ('fixed' in rowSelection) {
        selectionColumn.fixed = rowSelection.fixed;
      } else if (columns.some(column => column.fixed === 'left' || column.fixed === true)) {
        selectionColumn.fixed = 'left';
      }
      if (columns[0] && columns[0].key === 'selection-column') {
        columns[0] = selectionColumn;
      } else {
        columns.unshift(selectionColumn);
      }
    }
    return columns;
  }

  getColumnKey(column: ColumnProps<T>, index?: number): Key | undefined {
    return getColumnKey(column, index);
  }

  getMaxCurrent(total: number) {
    const {
      pagination: { current, pageSize },
    } = this.state;
    if ((current! - 1) * pageSize! >= total) {
      return Math.floor((total - 1) / pageSize!) + 1;
    }
    return current;
  }

  isSortColumn(column: ColumnProps<T>) {
    const { sortColumn } = this.state;
    if (!column || !sortColumn) {
      return false;
    }
    return this.getColumnKey(sortColumn) === this.getColumnKey(column);
  }

  renderColumnsDropdown(columns: ColumnProps<T>[], locale: TableLocale) {
    const {
      dropdownPrefixCls: customizeDropdownPrefixCls,
      radioPrefixCls,
      checkboxPrefixCls,
      rippleDisabled,
      filterBar,
      customCode,
      filterBarLocale,
      renderSorter,
      dropdownProps: $dropdownProps,
      inputNumberProps,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = this.getPrefixCls();
    const dropdownProps = {
      prefixCls: getPrefixCls('dropdown', customizeDropdownPrefixCls),
      ...$dropdownProps,
    };
    const { sortOrder, filters } = this.state;
    return treeMap(columns, (originColumn, i) => {
      const column = { ...originColumn };
      const key = this.getColumnKey(column, i) as string;
      let filterDropdown;
      let sortButton;
      if ((!filterBar && (column.filters && column.filters.length > 0)) || column.filterDropdown) {
        const colFilters = filters[key] || [];
        filterDropdown = (
          <FilterDropdown
            locale={locale}
            column={column}
            selectedKeys={colFilters}
            confirmFilter={this.handleFilter}
            prefixCls={`${prefixCls}-filter`}
            dropdownProps={dropdownProps}
            radioPrefixCls={radioPrefixCls}
            checkboxPrefixCls={checkboxPrefixCls}
            rippleDisabled={rippleDisabled}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      if (column.sorter) {
        const isSortColumn = this.isSortColumn(column);
        sortButton = renderSorter!<T>({
          prefixCls,
          column,
          sortOrder,
          isSortColumn,
          changeOrder: (order) => this.toggleSortOrder(order, column),
        });
      }

      let customButton;
      if (column.filterBar === true && customCode) {
        const filterColumns = columns.filter(c => c.filterField === true);
        customButton = (
          <ColumnFilterMenu
            customCode={customCode}
            locale={locale}
            filterBarLocale={filterBarLocale!}
            customColumns={this.getCustomColumns()}
            store={this.store}
            columns={filterColumns}
            prefixCls={`${prefixCls}-filter`}
            dropdownProps={dropdownProps}
            checkboxPrefixCls={checkboxPrefixCls}
            inputNumberProps={inputNumberProps}
            confirmFilter={this.handleCustomColumnFilter}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      column.title = (
        <span key={key}>
          {column.title}
          {sortButton}
          {customButton}
          {filterDropdown}
        </span>
      );

      if (sortButton || filterDropdown || customButton) {
        column.className = classNames(`${prefixCls}-column-has-filters`, column.className);
      }

      return column;
    });
  }

  setCustomState(customColumns: any[]) {
    this.setState({
      customColumns,
    });
  }

  // 根据 customColumns 返回新的 columns
  renderCustomColumns = (columns: ColumnProps<T>[]) => {
    const customColumns = this.getCustomColumns() || [];
    if (customColumns.length === 0) {
      return columns.map((column, colIndex) => {
        return {
          ...column,
          orderSeq: colIndex,
        };
      });
    }
    const newColumns: ColumnProps<T>[] = [];
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      const customColumn = customColumns.find((fCustomColumn) => {
        return fCustomColumn.fieldKey === this.getColumnKey(column);
      });
      if (!customColumn) {
        // 该字段没有自定义, 将排序设置为默认的顺序, 继续
        newColumns.push({ ...column, orderSeq: colIndex });
        continue;
      }
      if (customColumn.hidden === 1) {
        // 该字段隐藏了 不需要显示, 继续
        continue;
      }
      const newColumn: ColumnProps<T> = { ...column };
      if (customColumn.fixedLeft === 1) {
        newColumn.fixed = 'left';
      }
      // else if (customColumn.fixedRight) {
      //   newColumn.fixed = 'right';
      // }
      newColumn.orderSeq = customColumn.orderSeq === undefined ? colIndex : customColumn.orderSeq;
      newColumns.push(newColumn);
    }
    const noFixedColumns: ColumnProps<T>[] = [];
    const fixedLeftColumns: ColumnProps<T>[] = [];
    const fixedRightColumns: ColumnProps<T>[] = [];
    const actionColumns: ColumnProps<T>[] = newColumns.length === 0 ? [] : [newColumns[newColumns.length - 1]];
    for (let colIndex = 0; colIndex < newColumns.length - 1; colIndex += 1) {
      const column: ColumnProps<T> = newColumns[colIndex];
      if (column.fixed) {
        if (column.fixed === 'left') {
          fixedLeftColumns.push(column);
        } else if (column.fixed === 'right') {
          fixedRightColumns.push(column);
        } else {
          noFixedColumns.push(column);
        }
      } else {
        noFixedColumns.push(column);
      }
    }
    fixedLeftColumns.sort((a: ColumnProps<T>, b: ColumnProps<T>) => {
      return (a.orderSeq as number) - (b.orderSeq as number);
    });
    noFixedColumns.sort((a: ColumnProps<T>, b: ColumnProps<T>) => {
      return (a.orderSeq as number) - (b.orderSeq as number);
    });
    return [...fixedLeftColumns, ...noFixedColumns, ...fixedRightColumns, ...actionColumns];
  };

  /**
   * 获取用户个性化的 Table 的 头设置
   * table's columns
   */
  getCustomColumns(): CustomColumn[] | undefined {
    const { customColumns, defaultCustomColumns, onCustomColumnFilter } = this.props;
    if (customColumns) {
      if (defaultCustomColumns) {
        throw new Error('Table Can\'t set customColumns and defaultCustomColumns together');
      }
      if (!onCustomColumnFilter) {
        throw new Error('Table must set customColumns and onCustomColumnFilter together');
      }
    }
    if (customColumns) {
      return customColumns;
    }

    if (defaultCustomColumns) {
      const { customColumns: stateCustomColumns = defaultCustomColumns } = this.state;
      return stateCustomColumns;
    }
  }

  /**
   * 用户个性化 Table 编辑
   */
  handleCustomColumnFilter = () => {
    const { onCustomColumnFilter } = this.props;
    const { customColumns = [] } = this.store.getState();
    this.setCustomState(customColumns);
    if (onCustomColumnFilter) {
      onCustomColumnFilter(customColumns);
    }
  };

  handleShowSizeChange = (current: number, pageSize: number) => {
    const { pagination } = this.state;
    pagination.onShowSizeChange!(current, pageSize);
    const nextPagination = {
      ...pagination,
      pageSize,
      current,
    };
    this.setState({ pagination: nextPagination });

    const { onChange } = this.props;
    if (onChange) {
      onChange(
        ...this.prepareParamsArguments({
          ...this.state,
          pagination: nextPagination,
        }),
      );
    }
  };

  renderPagination(paginationPosition: string) {
    // 强制不需要分页
    if (!this.hasPagination()) {
      return null;
    }
    const { pagination } = this.state;
    const { size, paginationProps } = this.props;
    const { getConfig } = this.context;
    const prefixCls = this.getPrefixCls();
    const position = pagination.position || 'bottom';
    const total = pagination.total || this.getLocalData().length;
    const configPaginationProps = getConfig('pagination') as PaginationProps;
    return total > 0 && (position === paginationPosition || position === 'both') ? (
      <Pagination
        {...configPaginationProps}
        {...paginationProps}
        key={`pagination-${paginationPosition}`}
        {...pagination}
        className={classNames(pagination.className, `${prefixCls}-pagination`)}
        onChange={this.handlePageChange}
        total={total}
        size={pagination.size || (size === 'middle' ? Size.small : size)}
        current={this.getMaxCurrent(total)}
        onShowSizeChange={this.handleShowSizeChange}
      />
    ) : null;
  }

  // Get pagination, filters, sorter
  prepareParamsArguments(state: TableState<T>): [TablePaginationConfig | boolean, TableStateFilters<T>, SorterResult<T>, any[]] {
    const pagination = { ...state.pagination };
    // remove useless handle function in Table.onChange
    delete pagination.onChange;
    delete pagination.onShowSizeChange;
    delete pagination.showTotal;
    delete pagination.sizeChangerOptionText;
    const filters = state.filters;
    const barFilters = state.barFilters;
    const sorter: SorterResult<T> = {};
    const { sortColumn, sortOrder } = state;
    if (sortColumn && sortOrder) {
      sorter.column = sortColumn;
      sorter.order = sortOrder;
      sorter.field = sortColumn.dataIndex;
      sorter.columnKey = this.getColumnKey(sortColumn);
    }
    return [pagination, filters, sorter, barFilters];
  }

  findColumn(myKey: string | number): ColumnProps<T> | undefined {
    let column;
    treeMap(this.columns, c => {
      if (this.getColumnKey(c) === myKey) {
        column = c;
      }
    });
    return column;
  }

  componentDidMount() {
    const { autoHeight } = this.props;
    if (autoHeight) {
      const tableAutoHeight = this.syncSize();
      const { tableAutoHeight: stateTableAutoHeight } = this.state;
      if (stateTableAutoHeight !== tableAutoHeight) {
        const tableScroll = this.store.getState().scroll;
        this.store.setState({ scroll: { ...tableScroll, y: tableAutoHeight } });
        this.setState({ tableAutoHeight });
      }
    }
    if (this.element) {
      const prefixCls = this.getPrefixCls();
      const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
      if (isMac) {
        classes(this.element).add(`${prefixCls}-os-mac`);
      } else {
        classes(this.element).add(`${prefixCls}-os-win`);
      }
    }
  }

  getCurrentPageData() {
    let data = this.getLocalData();
    let current: number;
    let pageSize: number;
    const { state } = this;
    // 如果没有分页的话，默认全部展示
    if (!this.hasPagination()) {
      pageSize = Number.MAX_VALUE;
      current = 1;
    } else {
      pageSize = state.pagination.pageSize as number;
      current = this.getMaxCurrent(state.pagination.total || data.length) as number;
    }

    // 分页
    // ---
    // 当数据量少于等于每页数量时，直接设置数据
    // 否则进行读取分页数据
    if (data.length > pageSize || pageSize === Number.MAX_VALUE) {
      data = data.filter((_, i) => {
        return i >= (current - 1) * pageSize && i < current * pageSize;
      });
    }
    return data;
  }

  getFlatData() {
    const { childrenColumnName } = this.props;
    return flatArray(this.getLocalData(), childrenColumnName);
  }

  getFlatCurrentPageData() {
    const { childrenColumnName } = this.props;
    return flatArray(this.getCurrentPageData(), childrenColumnName);
  }

  recursiveSort(data: T[], sorterFn: (a: any, b: any) => number): T[] {
    const { childrenColumnName = 'children' } = this.props;
    return data.sort(sorterFn).map((item: any) =>
      item[childrenColumnName]
        ? {
          ...item,
          [childrenColumnName]: this.recursiveSort(item[childrenColumnName], sorterFn),
        }
        : item,
    );
  }

  getLocalData() {
    const { dataSource, noFilter } = this.props;
    if (dataSource) {
      const state = this.state;
      const { filters, barFilters } = state;
      let data = dataSource;
      // 优化本地排序
      data = data.slice(0);
      const sorterFn = this.getSorterFn();
      if (sorterFn) {
        data = this.recursiveSort(data, sorterFn);
      }
      if (noFilter) {
        return data;
      }
      let filteredData = data;
      // 筛选
      if (filters) {
        Object.keys(filters).forEach(columnKey => {
          const col = this.findColumn(columnKey) as any;
          if (!col) {
            return;
          }
          const values = filters[columnKey] || [];
          if (values.length === 0) {
            return;
          }
          const { onFilter, filters: columnFilters } = col;
          filteredData = onFilter
            ? filteredData.filter(record => {
              return values.some(v => onFilter(v, record, columnFilters));
            })
            : filteredData;
        });
      }
      if (barFilters.length) {
        let isOr = false;
        barFilters.forEach(filter => {
          if (filter === VALUE_OR) {
            isOr = true;
          } else {
            filteredData = data.filter(record =>
              isOr
                ? filteredData.indexOf(record) !== -1 || this.doBarFilter(filter, record)
                : filteredData.indexOf(record) !== -1 && this.doBarFilter(filter, record),
            );
            isOr = false;
          }
        });
      }
      return filteredData;
    }
    return [];
  }

  doBarFilter(filter: any, record: T): boolean {
    if (typeof filter === 'string') {
      return !!findColumnByFilterValue<T>(record, getLeafColumns<T>(this.columns), filter);
    }
    const columnKey = Object.keys(filter)[0];
    const col = this.findColumn(columnKey);
    if (!col) {
      return true;
    }
    const { onFilter, filters } = col;
    return !onFilter || onFilter(filter[columnKey], record, filters);
  }

  createComponents(components: TableComponents = {}, prevComponents?: TableComponents) {
    const bodyRow = components && components.body && components.body.row;
    const preBodyRow = prevComponents && prevComponents.body && prevComponents.body.row;
    if (!this.row || bodyRow !== preBodyRow) {
      this.row = createBodyRow(bodyRow);
    }
    const headerProps: any = {};
    const { resizable } = this.props;
    if (resizable) {
      headerProps.header = {
        cell: ResizeableTitle,
      };
    }

    this.components = {
      ...headerProps,
      ...components,
      body: {
        ...components.body,
        row: this.row,
      },
    };
  }

  handleResize = (col: ColumnProps<T>) => (_: any, dragCallbackData: any) => {
    const { columnAdjust } = this.state;
    const { scroll } = this.store.getState();
    const c = this.columns.find(column => column.key === col.key || column.dataIndex === col.dataIndex);
    if (c) {
      let width = c.width + dragCallbackData.x;
      const key = c.dataIndex;
      /**
       * 使用以前存储的拖动的宽度值
       */
      if (columnAdjust
        && key
        && columnAdjust[key]
        && typeof columnAdjust[key] === 'number'
        && columnAdjust[key] >= 50) {
        width = columnAdjust[key] + dragCallbackData.x;
      }

      if (width <= 50) {
        width = 50;
      }

      if (key) {
        columnAdjust[key] = width;
        if (scroll && scroll.x) {
          this.store.setState({
            scroll: { ...scroll, x: scroll.x + dragCallbackData.x },
          });
        }
      }
      this.setState({
        columnAdjust,
      });
    }
  };

  getContentHeight = () => {
    const { refTable, element, props: { autoHeight } } = this;
    if (autoHeight && refTable && refTable.parentNode) {
      const { top: parentTop, height: parentHeight } = (refTable.parentNode as HTMLElement).getBoundingClientRect();
      const { top: tableTop } = element.getBoundingClientRect();
      let diff = 80;
      if (autoHeight && autoHeight !== true && isNumber(autoHeight.diff)) {
        diff = autoHeight.diff || 80;
      }
      if (refTable) {
        return parentHeight - (tableTop - parentTop) - diff || 0;
      }
    }
    return 0;
  };

  syncSize = () => {
    const { element } = this;
    if (element) {
      const prefixCls = this.getPrefixCls();
      let height = this.getContentHeight();
      if (element && isNumber(height)) {
        const tableTitle: HTMLDivElement | null = element.querySelector(`.${prefixCls}-title`);
        const tableHeader: HTMLTableSectionElement | null = element.querySelector(
          `.${prefixCls}-thead`,
        );
        const tableFooter: HTMLTableSectionElement | null = element.querySelector(
          `.${prefixCls}-footer`,
        );
        const tableFootWrap: HTMLDivElement | null = element.querySelector(`.${prefixCls}-foot`);
        if (tableTitle) {
          height -= getHeight(tableTitle);
        }
        if (tableHeader) {
          height -= getHeight(tableHeader);
        }
        if (tableFooter) {
          height -= getHeight(tableFooter);
        }
        if (tableFootWrap) {
          height -= getHeight(tableFootWrap);
        }
        return height;
      }
    }
    return 0;
  };

  renderTable = (contextLocale: TableLocale, loading: SpinProps): ReactNode => {
    const { props } = this;
    const locale = { ...contextLocale, ...props.locale };
    const {
      autoHeight,
      bodyStyle: tableBodyStyle,
      showHeader,
      empty,
      scroll,
      resizable,
      ...restProps
    } = props;
    const prefixCls = this.getPrefixCls();
    const data = this.getCurrentPageData();
    const expandIconAsCell = props.expandedRowRender && props.expandIconAsCell !== false;
    const { tableAutoHeight } = this.state;
    const tableScroll = this.store.getState().scroll;
    let bodyStyle = { ...tableBodyStyle };
    if (tableAutoHeight && tableAutoHeight > 0 && autoHeight) {
      if (autoHeight !== true && autoHeight.type === TableAutoHeightType.maxHeight) {
        bodyStyle = { ...bodyStyle, maxHeight: tableAutoHeight };
      } else {
        bodyStyle = { ...bodyStyle, height: tableAutoHeight };
      }
    }

    const classString = classNames({
      [`${prefixCls}-${props.size}`]: true,
      [`${prefixCls}-bordered`]: props.bordered,
      [`${prefixCls}-empty`]: !data.length,
      [`${prefixCls}-without-column-header`]: !showHeader,
      'resizable-table': resizable,
    });
    let columns = this.columns.concat(); // 为了不更改原先的 columns
    columns = this.renderColumnsDropdown(columns, locale);
    // 先执行: renderColumnsDropDown, 可能会更改 columns 的 fixed 或者 数量
    columns = this.renderCustomColumns(columns);
    // 改变了 columns, 依赖于 columns 的 fixed: left;
    columns = this.renderRowSelection(columns, locale);
    columns = columns.map((column, i) => {
      const newColumn = { ...column };
      newColumn.key = this.getColumnKey(newColumn, i);
      return newColumn;
    });
    columns = removeHiddenColumns(columns);

    const expandIconColumnIndex =
      'expandIconColumnIndex' in restProps ? restProps.expandIconColumnIndex : columns[0] && columns[0].key === 'selection-column' ? 1 : 0;

    if (resizable) {
      const { columnAdjust = {} } = this.state;
      const keys = Object.keys(columnAdjust);
      columns = columns.map((col) => {

        const otherProp: any = {};
        const colWidth = col.width;

        if (typeof colWidth === 'number') {
          const key = col.dataIndex;
          if (key && keys.indexOf(key) !== -1) {
            otherProp.width = columnAdjust[key];
          }
        }
        return {
          ...col,
          ...otherProp,
          onCell: (record: T, _col?: ColumnProps<T>) => {
            const _mCol = _col || col;
            let cellProps = {};
            if (col.onCell) {
              cellProps = col.onCell(record) || {};
            }
            cellProps = {
              ...cellProps,
              style: {
                ...((cellProps as any).style || {}),
                maxWidth: _mCol.width,
                minWidth: _mCol.width,
              },
            };
            return cellProps;
          },
          onHeaderCell: (column: any) => {
            let headerCellProps = {};
            if (col.onHeaderCell) {
              headerCellProps = col.onHeaderCell(column) || {};
            }
            headerCellProps = {
              ...headerCellProps,
              width: column.width,
              style: {
                ...((headerCellProps as any).style || {}),
                maxWidth: col.width,
                minWidth: col.width,
              },
              onResize: this.handleResize(col),
            };
            return headerCellProps;
          },
        };
      });
    }
    const omits = [
      'style',
      'filterBarMultiple',
      'filterBarPlaceholder',
      'filterBar',
      'dataSource',
      'filters',
    ];
    return (
      <RcTable
        key="table"
        {...omit(restProps, omits)}
        ref={this.setElementRef}
        scroll={tableScroll || scroll}
        resizable={resizable}
        onRow={this.onRow}
        components={this.components}
        prefixCls={prefixCls}
        data={data}
        bodyStyle={bodyStyle}
        columns={columns}
        showHeader={showHeader}
        className={classString}
        expandIconColumnIndex={expandIconColumnIndex}
        expandIconAsCell={expandIconAsCell}
        emptyText={!loading.spinning && (empty || locale.emptyText)}
      />
    );
  };

  renderConfigConsumer() {
    const { exported } = this.props;
    if (exported) {
      return this.renderExportButton(exported);
    }
  }

  renderExportButton = (props: ExportProps) => {
    let { dataParam, method, action } = props;
    this.store.setState({ exportStoreProps: props });
    if (!dataParam) {
      dataParam = {};
    }

    if (!method) {
      method = 'get';
    }

    if (!action) {
      action = '';
    }

    const exportProps: handleProps = {
      dataParam,
      method,
      action,
    };
    const onClick = () => {
      this.handleExport(exportProps);
    };
    const { buttonProps } = this.props;
    return (
      <Button
        {...buttonProps}
        type="primary"
        disabled={this.store.getState().exported}
        loading={this.store.getState().exported}
        {...props}
        onClick={onClick}
      />
    );
  };

  handleExport = (exportedProps: handleProps) => {
    const { dataParam, method, action } = exportedProps;
    let { iframe } = this;
    const exportStoreProps = this.store.getState().exportStoreProps;
    if (exportStoreProps && exportStoreProps.onClick && typeof exportStoreProps.onClick === 'function') {
      exportStoreProps.onClick(exportedProps);
    } else {
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = '_export_window';
        iframe.name = '_export_window';
        iframe.style.cssText =
          'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;display:none';
        document.body.appendChild(iframe);
      }
      this.store.setState({ exported: true });
      const form = document.createElement('form');
      form.target = '_export_window';
      form.method = method;
      form.action = action;
      const s = document.createElement('input');
      s.id = '_request_data';
      s.type = 'hidden';
      s.name = '_request_data';
      s.value = JSON.stringify(dataParam);
      form.appendChild(s);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      this.store.setState({ exported: false });
    }

  };

  render() {
    const { props } = this;
    const {
      style,
      className,
      spinPrefixCls,
      filterBarMultiple,
      filterBarPlaceholder,
      filterBar,
      dataSource,
      filters,
    } = props;
    const { filters: columnFilters } = this.state;
    const prefixCls = this.getPrefixCls();
    const data = this.getCurrentPageData();

    let loading = props.loading as SpinProps;
    if (typeof loading === 'boolean') {
      loading = {
        spinning: loading,
      };
    }

    const table = (
      <LocaleReceiver componentName="Table" defaultLocale={getRuntimeLocale().Table || {}}>
        {locale => this.renderTable(locale, loading)}
      </LocaleReceiver>
    );

    // if there is no pagination or no data,
    // the height of spin should decrease by half of pagination
    const paginationPatchClass =
      this.hasPagination() && data && data.length !== 0
        ? `${prefixCls}-with-pagination`
        : `${prefixCls}-without-pagination`;

    const bar = filterBar && (
      <FilterBar
        key="filter-bar"
        prefixCls={prefixCls}
        placeholder={filterBarPlaceholder}
        columns={getLeafColumns(this.columns)}
        onFilterSelectChange={this.handleFilterSelectChange}
        onFilterSelectClear={this.handleFilterSelectClear}
        onColumnFilterChange={this.handleColumnFilterChange}
        onFilter={this.handleFilter}
        dataSource={dataSource}
        filters={filters}
        columnFilters={columnFilters}
        multiple={filterBarMultiple}
        getPopupContainer={this.getPopupContainer}
      />
    );

    return (
      <div
        className={classNames(`${prefixCls}-wrapper`, className)}
        style={style}
        ref={this.saveRef}
      >
        <Spin
          prefixCls={spinPrefixCls}
          {...loading}
          className={loading.spinning ? `${paginationPatchClass} ${prefixCls}-spin-holder` : ''}
        >
          {this.renderPagination('top')}
          {this.renderConfigConsumer()}
          {bar}
          {table}
          {this.renderPagination('bottom')}
        </Spin>
      </div>
    );
  }
}
