import React, { Component, ReactChildren, ReactNode, SyntheticEvent } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import scrollIntoView from 'scroll-into-view-if-needed';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import Pagination from '../pagination';
import Icon from '../icon';
import Spin, { SpinProps } from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import warning from '../_util/warning';
import FilterDropdown from './filterDropdown';
import createStore, { Store } from './createStore';
import SelectionBox from './SelectionBox';
import SelectionCheckboxAll from './SelectionCheckboxAll';
import Column from './Column';
import ColumnGroup from './ColumnGroup';
import {getConfig, getPrefixCls } from '../configure'
import createBodyRow from './createBodyRow';
import {
  findColumnByFilterValue,
  flatArray,
  flatFilter,
  getColumnKey,
  getLeafColumns,
  normalizeColumns,
  removeHiddenColumns,
  treeMap,
} from './util';
import {
  ColumnProps,
  CompareFn,
  RowSelectionType,
  SelectionItemSelectFn,
  TableComponents,
  TableLocale,
  TablePaginationConfig,
  TableProps,
  TableState,
  TableStateFilters,
} from './interface';
import { RadioChangeEvent } from '../radio';
import { CheckboxChangeEvent } from '../checkbox';
import FilterBar from './FilterBar';
import { VALUE_OR } from './FilterSelect';
import RcTable from '../rc-components/table';
import { Size } from '../_util/enum';

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

  static Column = Column;

  static ColumnGroup = ColumnGroup;

  static propTypes = {
    dataSource: PropTypes.array,
    empty: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    onColumnFilterChange: PropTypes.func,
    columns: PropTypes.array,
    prefixCls: PropTypes.string,
    useFixedHeader: PropTypes.bool,
    rowSelection: PropTypes.object,
    className: PropTypes.string,
    size: PropTypes.oneOf([Size.large, Size.default, Size.small]),
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    bordered: PropTypes.bool,
    onChange: PropTypes.func,
    locale: PropTypes.object,
    dropdownPrefixCls: PropTypes.string,
    filterBar: PropTypes.bool,
    filters: PropTypes.array,
    filterBarPlaceholder: PropTypes.string,
    onFilterSelectChange: PropTypes.func,
    noFilter: PropTypes.bool,
    autoScroll: PropTypes.bool,
    indentSize: PropTypes.number,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    showHeader: PropTypes.bool,
  };

  static defaultProps = {
    dataSource: [],
    empty: null,
    useFixedHeader: false,
    rowSelection: null,
    className: '',
    size: Size.default,
    loading: false,
    bordered: false,
    indentSize: 20,
    locale: {},
    rowKey: 'key',
    showHeader: true,
    filterBar: true,
    noFilter: false,
    autoScroll: true,
  };

  CheckboxPropsCache: {
    [key: string]: any;
  };

  store: Store;

  columns: ColumnProps<T>[];

  components: TableComponents;

  private refTable: HTMLDivElement | null;

  constructor(props: TableProps<T>) {
    super(props);

    warning(
      !('columnsPageRange' in props || 'columnsPageSize' in props),
      '`columnsPageRange` and `columnsPageSize` are removed, please use fixed columns instead',
    );

    this.columns = props.columns || normalizeColumns(props.children as ReactChildren);

    this.createComponents(props.components);

    this.state = {
      ...this.getDefaultSortOrder(this.columns),
      // 减少状态
      filters: this.getFiltersFromColumns(),
      barFilters: props.filters || [],
      pagination: this.getDefaultPagination(props),
    };

    this.CheckboxPropsCache = {};

    this.store = createStore({
      selectedRowKeys: (props.rowSelection || {}).selectedRowKeys || [],
      selectionDirty: false,
    });
  }

  saveRef = ref => {
    this.refTable = ref;
  };

  getCheckboxPropsByItem = (item: T, index: number) => {
    const { rowSelection = {} } = this.props;
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
    return getPrefixCls('table', prefixCls);
  }

  getDefaultSelection() {
    const { rowSelection = {} } = this.props;
    if (!rowSelection.getCheckboxProps) {
      return [];
    }
    return this.getFlatData()
      .filter((item: T, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked)
      .map((record, rowIndex) => this.getRecordKey(record, rowIndex));
  }

  getDefaultPagination(props: TableProps<T>) {
    const pagination: TablePaginationConfig = props.pagination || {};
    return this.hasPagination(props)
      ? {
          ...defaultPagination,
          size: props.size,
          ...pagination,
          current: pagination.defaultCurrent || pagination.current || 1,
          pageSize: pagination.defaultPageSize || pagination.pageSize || 10,
        }
      : {};
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
    const { rowSelection, dataSource, components } = this.props;
    const { filters, sortColumn, sortOrder } = this.state;
    if (nextProps.rowSelection && 'selectedRowKeys' in nextProps.rowSelection) {
      this.store.setState({
        selectedRowKeys: nextProps.rowSelection.selectedRowKeys || [],
      });
      if (
        rowSelection &&
        nextProps.rowSelection.getCheckboxProps !== rowSelection.getCheckboxProps
      ) {
        this.CheckboxPropsCache = {};
      }
    }
    if ('dataSource' in nextProps && nextProps.dataSource !== dataSource) {
      this.store.setState({
        selectionDirty: false,
      });
      this.CheckboxPropsCache = {};
    }

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
    { selectWay, record, checked, changeRowKeys, nativeEvent }: any,
  ) {
    const { rowSelection = {} as any } = this.props;
    if (rowSelection && !('selectedRowKeys' in rowSelection)) {
      this.store.setState({ selectedRowKeys });
    }
    const data = this.getFlatData();
    if (!rowSelection.onChange && !rowSelection[selectWay]) {
      return;
    }
    const selectedRows = data.filter(
      (row, i) => selectedRowKeys.indexOf(this.getRecordKey(row, i)) >= 0,
    );
    if (rowSelection.onChange) {
      rowSelection.onChange(selectedRowKeys, selectedRows);
    }
    if (selectWay === 'onSelect' && rowSelection.onSelect) {
      rowSelection.onSelect(record, checked, selectedRows, nativeEvent);
    } else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
      const changeRows = data.filter(
        (row, i) => changeRowKeys.indexOf(this.getRecordKey(row, i)) >= 0,
      );
      rowSelection.onSelectAll(checked, selectedRows, changeRows);
    } else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
      rowSelection.onSelectInvert(selectedRowKeys);
    }
  }

  hasPagination(props?: any) {
    return (props || this.props).pagination !== false;
  }

  isFiltersChanged(filters: TableStateFilters) {
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

  getFiltersFromColumns(columns?: ColumnProps<T>[]) {
    const filters: any = {};
    this.getFilteredValueColumns(columns).forEach((col: ColumnProps<T>) => {
      const colKey = this.getColumnKey(col) as string;
      filters[colKey] = col.filteredValue;
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
    const sortedColumn = this.getSortOrderColumns(columns).filter(
      (col: ColumnProps<T>) => col.sortOrder,
    )[0];

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
      const result = (sortColumn!.sorter as CompareFn<T>)(a, b);
      if (result !== 0) {
        return sortOrder === 'descend' ? -result : result;
      }
      return 0;
    };
  }

  setSortOrder(order: string, column: ColumnProps<T>) {
    const newState = {
      sortOrder: order,
      sortColumn: column,
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

  toggleSortOrder(order: string, column: ColumnProps<T>) {
    let { sortColumn, sortOrder } = this.state;
    // 只同时允许一列进行排序，否则会导致排序顺序的逻辑问题
    const isSortColumn = this.isSortColumn(column);
    if (!isSortColumn) {
      // 当前列未排序
      sortOrder = order;
      sortColumn = column;
    } else if (sortOrder === order) {
      // 切换为未排序状态
      sortOrder = '';
      sortColumn = null;
    } else {
      // 切换为排序状态
      sortOrder = order;
    }
    const newState = {
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

  setNewFilterState(newState: any) {
    const { pagination: propsPagination, onChange } = this.props;
    const { pagination: statePagination } = this.state;
    const pagination = { ...statePagination };

    if (propsPagination) {
      // Reset current prop
      pagination.current = 1;
      pagination.onChange!(pagination.current);
    }

    // Controlled current prop will not respond user interaction
    if (propsPagination && typeof propsPagination === 'object' && 'current' in propsPagination) {
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
            selectionDirty: false,
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

  handleFilter = (column: ColumnProps<T>, nextFilters: string[]) => {
    const { filters: stateFilters } = this.state;
    const filters = {
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
    });
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
    });
  };

  handleSelectRow = (selectionKey: string, index: number, onSelectFunc: SelectionItemSelectFn) => {
    const data = this.getFlatCurrentPageData();
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    const selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const changeableRowKeys = data
      .filter((item, i) => !this.getCheckboxPropsByItem(item, i).disabled)
      .map((item, i) => this.getRecordKey(item, i));

    const changeRowKeys: string[] = [];
    let selectWay = '';
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
    });
  };

  handlePageChange = (current: number, ...otherArguments: any[]) => {
    const { onChange, autoScroll, pagination: propsPagination } = this.props;
    const { pagination: statePagination } = this.state;
    const pagination = { ...statePagination };
    if (autoScroll) {
      const scrollIntoViewSmoothly =
        'scrollBehavior' in document.documentElement.style
          ? scrollIntoView
          : smoothScrollIntoView;
      setTimeout(() => {
        if (this.refTable && this.refTable.clientHeight > document.body.clientHeight) {
          scrollIntoViewSmoothly(this.refTable, { block: 'start', behavior: 'smooth', scrollMode: 'if-needed' });
        } else if (this.refTable) {
          // @ts-ignore
          if (this.refTable.scrollIntoViewIfNeeded) {
            // @ts-ignore
            this.refTable.scrollIntoViewIfNeeded({
              block: 'start',
            });
          } else {
            scrollIntoViewSmoothly(this.refTable, { block: 'start', behavior: 'smooth', scrollMode: 'if-needed' });
          }
        }
      }, 10);
      if (this.refTable) {
        const dom = findBodyDom(this.refTable, new RegExp(`${this.getPrefixCls()}-body`));
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
          selectionDirty: false,
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

      return (
        <span onClick={stopPropagation}>
          <SelectionBox
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

  renderRowSelection(locale: TableLocale) {
    const { rowSelection } = this.props;
    const prefixCls = this.getPrefixCls();
    const columns = this.columns.concat();
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
        width: rowSelection.columnWidth,
      };
      if (rowSelection.type !== 'radio') {
        const checkboxAllDisabled = data.every(
          (item, index) => this.getCheckboxPropsByItem(item, index).disabled,
        );
        selectionColumn.title = (
          <SelectionCheckboxAll
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

  getColumnKey(column: ColumnProps<T>, index?: number) {
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
    const { dropdownPrefixCls: customizeDropdownPrefixCls, filterBar } = this.props;
    const prefixCls = this.getPrefixCls();
    const dropdownPrefixCls = getPrefixCls('dropdown', customizeDropdownPrefixCls);
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
            dropdownPrefixCls={dropdownPrefixCls}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      if (column.sorter) {
        const isSortColumn = this.isSortColumn(column);
        const isAscend = isSortColumn && sortOrder === 'ascend';
        // const isDescend = isSortColumn && sortOrder === 'descend';
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
                  this.setSortOrder(isAscend ? 'descend' : 'ascend', column);
                }
              }
            },
          };
        };
        sortButton = <Icon type="arrow_upward" className={`${prefixCls}-sort-icon`} />;
      }
      column.title = (
        <span key={key}>
          {column.title}
          {sortButton}
          {filterDropdown}
        </span>
      );

      if (sortButton || filterDropdown) {
        column.className = classNames(`${prefixCls}-column-has-filters`, column.className);
      }

      return column;
    });
  }

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
    const { size } = this.props;
    const prefixCls = this.getPrefixCls();
    const position = pagination.position || 'bottom';
    const total = pagination.total || this.getLocalData().length;
    const pagnationProps = getConfig('pagination');
    return total > 0 && (position === paginationPosition || position === 'both') ? (
      <Pagination
        {...pagnationProps}
        key={`pagination-${paginationPosition}`}
        {...pagination}
        className={classNames(pagination.className, `${prefixCls}-pagination`)}
        onChange={this.handlePageChange}
        total={total}
        size={pagination.size || size}
        current={this.getMaxCurrent(total)}
        onShowSizeChange={this.handleShowSizeChange}
      />
    ) : null;
  }

  // Get pagination, filters, sorter
  prepareParamsArguments(state: any): [TablePaginationConfig | boolean, string[], Object, any[]] {
    const pagination = { ...state.pagination };
    // remove useless handle function in Table.onChange
    delete pagination.onChange;
    delete pagination.onShowSizeChange;
    delete pagination.showTotal;
    delete pagination.sizeChangerOptionText;
    const filters = state.filters;
    const barFilters = state.barFilters;
    const sorter: any = {};
    if (state.sortColumn && state.sortOrder) {
      sorter.column = state.sortColumn;
      sorter.order = state.sortOrder;
      sorter.field = state.sortColumn.dataIndex;
      sorter.columnKey = this.getColumnKey(state.sortColumn);
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
      if (noFilter) {
        return data;
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
    if (!this.components || bodyRow !== preBodyRow) {
      this.components = { ...components };
      this.components.body = {
        ...components.body,
        row: createBodyRow(bodyRow),
      };
    }
  }

  renderTable = (contextLocale: TableLocale, loading: SpinProps): ReactNode => {
    const { props } = this;
    const locale = { ...contextLocale, ...props.locale };
    const {
      filterBarMultiple,
      filterBarPlaceholder,
      showHeader,
      filterBar,
      dataSource,
      filters,
      empty,
      ...restProps
    } = props;
    const { filters: columnFilters } = this.state;
    const prefixCls = this.getPrefixCls();
    const data = this.getCurrentPageData();
    const expandIconAsCell = props.expandedRowRender && props.expandIconAsCell !== false;

    const classString = classNames({
      [`${prefixCls}-${props.size}`]: true,
      [`${prefixCls}-bordered`]: props.bordered,
      [`${prefixCls}-empty`]: !data.length,
      [`${prefixCls}-without-column-header`]: !showHeader,
    });

    let columns = this.renderRowSelection(locale);
    columns = this.renderColumnsDropdown(columns, locale);
    columns = columns.map((column, i) => {
      const newColumn = { ...column };
      newColumn.key = this.getColumnKey(newColumn, i);
      return newColumn;
    });
    columns = removeHiddenColumns(columns);

    let expandIconColumnIndex = columns[0] && columns[0].key === 'selection-column' ? 1 : 0;
    if ('expandIconColumnIndex' in restProps) {
      expandIconColumnIndex = restProps.expandIconColumnIndex as number;
    }

    const table = (
      <RcTable
        key="table"
        {...restProps}
        onRow={this.onRow}
        components={this.components}
        prefixCls={prefixCls}
        data={data}
        columns={columns}
        showHeader={showHeader}
        className={classString}
        expandIconColumnIndex={expandIconColumnIndex}
        expandIconAsCell={expandIconAsCell}
        emptyText={!loading.spinning && (empty || locale.emptyText)}
      />
    );
    if (filterBar) {
      const bar = (
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
      return [bar, table];
    }
    return table;
  };

  render() {
    const { props } = this;
    const { style, className } = props;
    const prefixCls = this.getPrefixCls();
    const data = this.getCurrentPageData();

    let loading = props.loading as SpinProps;
    if (typeof loading === 'boolean') {
      loading = {
        spinning: loading,
      };
    }

    const table = (
      <LocaleReceiver componentName="Table" defaultLocale={defaultLocale.Table}>
        {locale => this.renderTable(locale, loading)}
      </LocaleReceiver>
    );

    // if there is no pagination or no data,
    // the height of spin should decrease by half of pagination
    const paginationPatchClass =
      this.hasPagination() && data && data.length !== 0
        ? `${prefixCls}-with-pagination`
        : `${prefixCls}-without-pagination`;

    return (
      <div
        className={classNames(`${prefixCls}-wrapper`, className)}
        style={style}
        ref={this.saveRef}
      >
        <Spin
          {...loading}
          className={loading.spinning ? `${paginationPatchClass} ${prefixCls}-spin-holder` : ''}
        >
          {this.renderPagination('top')}
          {table}
          {this.renderPagination('bottom')}
        </Spin>
      </div>
    );
  }
}
