import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import scrollIntoView from 'scroll-into-view-if-needed';
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed';
import Pagination from '../pagination';
import Icon from '../icon';
import Spin from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import warning from '../_util/warning';
import FilterDropdown from './filterDropdown';
import createStore from './createStore';
import SelectionBox from './SelectionBox';
import SelectionCheckboxAll from './SelectionCheckboxAll';
import Column from './Column';
import ColumnGroup from './ColumnGroup';
import { getConfig, getPrefixCls } from '../configure';
import createBodyRow from './createBodyRow';
import { findColumnByFilterValue, flatArray, flatFilter, getColumnKey, getLeafColumns, normalizeColumns, removeHiddenColumns, treeMap, } from './util';
import FilterBar from './FilterBar';
import { VALUE_OR } from './FilterSelect';
import RcTable from '../rc-components/table';
function findBodyDom(dom, reg) {
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
function stopPropagation(e) {
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
export default class Table extends Component {
    constructor(props) {
        super(props);
        this.saveRef = ref => {
            this.refTable = ref;
        };
        this.getCheckboxPropsByItem = (item, index) => {
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
        this.onRow = (record, index) => {
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
        this.handleFilterSelectClear = () => {
            const { filters } = this.state;
            Object.keys(filters).map(key => (filters[key] = []));
            this.setNewFilterState({
                barFilters: [],
                filters,
            });
        };
        this.handleFilterSelectChange = (barFilters) => {
            const { onFilterSelectChange } = this.props;
            if (onFilterSelectChange) {
                onFilterSelectChange(barFilters);
            }
            this.setNewFilterState({
                barFilters,
            });
        };
        this.handleColumnFilterChange = (e) => {
            const { onColumnFilterChange } = this.props;
            if (onColumnFilterChange) {
                onColumnFilterChange(e);
            }
            this.forceUpdate();
        };
        this.handleFilter = (column, nextFilters) => {
            const { filters: stateFilters } = this.state;
            const filters = {
                ...stateFilters,
                [this.getColumnKey(column)]: nextFilters,
            };
            // Remove filters not in current columns
            const currentColumnKeys = [];
            treeMap(this.columns, c => {
                if (!c.children) {
                    currentColumnKeys.push(this.getColumnKey(c));
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
        this.handleSelect = (record, rowIndex, e) => {
            const checked = e.target.checked;
            const nativeEvent = e.nativeEvent;
            const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
            let selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
            const key = this.getRecordKey(record, rowIndex);
            if (checked) {
                selectedRowKeys.push(this.getRecordKey(record, rowIndex));
            }
            else {
                selectedRowKeys = selectedRowKeys.filter((i) => key !== i);
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
        this.handleRadioSelect = (record, rowIndex, e) => {
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
        this.handleSelectRow = (selectionKey, index, onSelectFunc) => {
            const data = this.getFlatCurrentPageData();
            const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
            const selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
            const changeableRowKeys = data
                .filter((item, i) => !this.getCheckboxPropsByItem(item, i).disabled)
                .map((item, i) => this.getRecordKey(item, i));
            const changeRowKeys = [];
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
                        }
                        else {
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
        this.handlePageChange = (current, ...otherArguments) => {
            const { onChange, autoScroll, pagination: propsPagination } = this.props;
            const { pagination: statePagination } = this.state;
            const pagination = { ...statePagination };
            if (autoScroll) {
                const scrollIntoViewSmoothly = 'scrollBehavior' in document.documentElement.style
                    ? scrollIntoView
                    : smoothScrollIntoView;
                setTimeout(() => {
                    if (this.refTable && this.refTable.clientHeight > document.body.clientHeight) {
                        scrollIntoViewSmoothly(this.refTable, { block: 'start', behavior: 'smooth', scrollMode: 'if-needed' });
                    }
                    else if (this.refTable) {
                        // @ts-ignore
                        if (this.refTable.scrollIntoViewIfNeeded) {
                            // @ts-ignore
                            this.refTable.scrollIntoViewIfNeeded({
                                block: 'start',
                            });
                        }
                        else {
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
            }
            else {
                pagination.current = pagination.current || 1;
            }
            pagination.onChange(pagination.current, ...otherArguments);
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
                onChange(...this.prepareParamsArguments({
                    ...this.state,
                    selectionDirty: false,
                    pagination,
                }));
            }
        };
        this.renderSelectionBox = (type) => {
            return (_, record, index) => {
                const rowIndex = this.getRecordKey(record, index); // 从 1 开始
                const props = this.getCheckboxPropsByItem(record, index);
                const handleChange = (e) => {
                    if (type === 'radio') {
                        this.handleRadioSelect(record, rowIndex, e);
                    }
                    else {
                        this.handleSelect(record, rowIndex, e);
                    }
                };
                return (React.createElement("span", { onClick: stopPropagation },
                    React.createElement(SelectionBox, Object.assign({ type: type, store: this.store, rowIndex: rowIndex, onChange: handleChange, defaultSelection: this.getDefaultSelection() }, props))));
            };
        };
        this.getRecordKey = (record, index) => {
            const { rowKey } = this.props;
            const recordKey = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
            warning(recordKey !== undefined, 'Each record in dataSource of table should have a unique `key` prop, or set `rowKey` to an unique primary key');
            return recordKey === undefined ? index : recordKey;
        };
        this.getPopupContainer = () => {
            return findDOMNode(this);
        };
        this.handleShowSizeChange = (current, pageSize) => {
            const { pagination } = this.state;
            pagination.onShowSizeChange(current, pageSize);
            const nextPagination = {
                ...pagination,
                pageSize,
                current,
            };
            this.setState({ pagination: nextPagination });
            const { onChange } = this.props;
            if (onChange) {
                onChange(...this.prepareParamsArguments({
                    ...this.state,
                    pagination: nextPagination,
                }));
            }
        };
        this.renderTable = (contextLocale, loading) => {
            const { props } = this;
            const locale = { ...contextLocale, ...props.locale };
            const { filterBarMultiple, filterBarPlaceholder, showHeader, filterBar, dataSource, filters, empty, ...restProps } = props;
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
                expandIconColumnIndex = restProps.expandIconColumnIndex;
            }
            const table = (React.createElement(RcTable, Object.assign({ key: "table" }, restProps, { onRow: this.onRow, components: this.components, prefixCls: prefixCls, data: data, columns: columns, showHeader: showHeader, className: classString, expandIconColumnIndex: expandIconColumnIndex, expandIconAsCell: expandIconAsCell, emptyText: !loading.spinning && (empty || locale.emptyText) })));
            if (filterBar) {
                const bar = (React.createElement(FilterBar, { key: "filter-bar", prefixCls: prefixCls, placeholder: filterBarPlaceholder, columns: getLeafColumns(this.columns), onFilterSelectChange: this.handleFilterSelectChange, onFilterSelectClear: this.handleFilterSelectClear, onColumnFilterChange: this.handleColumnFilterChange, onFilter: this.handleFilter, dataSource: dataSource, filters: filters, columnFilters: columnFilters, multiple: filterBarMultiple, getPopupContainer: this.getPopupContainer }));
                return [bar, table];
            }
            return table;
        };
        warning(!('columnsPageRange' in props || 'columnsPageSize' in props), '`columnsPageRange` and `columnsPageSize` are removed, please use fixed columns instead');
        this.columns = props.columns || normalizeColumns(props.children);
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
            .filter((item, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked)
            .map((record, rowIndex) => this.getRecordKey(record, rowIndex));
    }
    getDefaultPagination(props) {
        const pagination = props.pagination || {};
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
    componentWillReceiveProps(nextProps) {
        this.columns = nextProps.columns || normalizeColumns(nextProps.children);
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
            if (rowSelection &&
                nextProps.rowSelection.getCheckboxProps !== rowSelection.getCheckboxProps) {
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
    setSelectedRowKeys(selectedRowKeys, { selectWay, record, checked, changeRowKeys, nativeEvent }) {
        const { rowSelection = {} } = this.props;
        if (rowSelection && !('selectedRowKeys' in rowSelection)) {
            this.store.setState({ selectedRowKeys });
        }
        const data = this.getFlatData();
        if (!rowSelection.onChange && !rowSelection[selectWay]) {
            return;
        }
        const selectedRows = data.filter((row, i) => selectedRowKeys.indexOf(this.getRecordKey(row, i)) >= 0);
        if (rowSelection.onChange) {
            rowSelection.onChange(selectedRowKeys, selectedRows);
        }
        if (selectWay === 'onSelect' && rowSelection.onSelect) {
            rowSelection.onSelect(record, checked, selectedRows, nativeEvent);
        }
        else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
            const changeRows = data.filter((row, i) => changeRowKeys.indexOf(this.getRecordKey(row, i)) >= 0);
            rowSelection.onSelectAll(checked, selectedRows, changeRows);
        }
        else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
            rowSelection.onSelectInvert(selectedRowKeys);
        }
    }
    hasPagination(props) {
        return (props || this.props).pagination !== false;
    }
    isFiltersChanged(filters) {
        let filtersChanged = false;
        const { filters: stateFilters } = this.state;
        if (Object.keys(filters).length !== Object.keys(stateFilters).length) {
            filtersChanged = true;
        }
        else {
            Object.keys(filters).forEach(columnKey => {
                if (filters[columnKey] !== stateFilters[columnKey]) {
                    filtersChanged = true;
                }
            });
        }
        return filtersChanged;
    }
    getSortOrderColumns(columns) {
        return flatFilter(columns || this.columns || [], (column) => 'sortOrder' in column);
    }
    getFilteredValueColumns(columns) {
        return flatFilter(columns || this.columns || [], (column) => typeof column.filteredValue !== 'undefined');
    }
    getFiltersFromColumns(columns) {
        const filters = {};
        this.getFilteredValueColumns(columns).forEach((col) => {
            const colKey = this.getColumnKey(col);
            filters[colKey] = col.filteredValue;
        });
        return filters;
    }
    getDefaultSortOrder(columns) {
        const definedSortState = this.getSortStateFromColumns(columns);
        const defaultSortedColumn = flatFilter(columns || [], (column) => column.defaultSortOrder != null)[0];
        if (defaultSortedColumn && !definedSortState.sortColumn) {
            return {
                sortColumn: defaultSortedColumn,
                sortOrder: defaultSortedColumn.defaultSortOrder,
            };
        }
        return definedSortState;
    }
    getSortStateFromColumns(columns) {
        // return first column which sortOrder is not falsy
        const sortedColumn = this.getSortOrderColumns(columns).filter((col) => col.sortOrder)[0];
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
        return (a, b) => {
            const result = sortColumn.sorter(a, b);
            if (result !== 0) {
                return sortOrder === 'descend' ? -result : result;
            }
            return 0;
        };
    }
    setSortOrder(order, column) {
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
            onChange(...this.prepareParamsArguments({
                ...this.state,
                ...newState,
            }));
        }
    }
    toggleSortOrder(order, column) {
        let { sortColumn, sortOrder } = this.state;
        // 只同时允许一列进行排序，否则会导致排序顺序的逻辑问题
        const isSortColumn = this.isSortColumn(column);
        if (!isSortColumn) {
            // 当前列未排序
            sortOrder = order;
            sortColumn = column;
        }
        else if (sortOrder === order) {
            // 切换为未排序状态
            sortOrder = '';
            sortColumn = null;
        }
        else {
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
            onChange(...this.prepareParamsArguments({
                ...this.state,
                ...newState,
            }));
        }
    }
    setNewFilterState(newState) {
        const { pagination: propsPagination, onChange } = this.props;
        const { pagination: statePagination } = this.state;
        const pagination = { ...statePagination };
        if (propsPagination) {
            // Reset current prop
            pagination.current = 1;
            pagination.onChange(pagination.current);
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
                onChange(...this.prepareParamsArguments({
                    ...this.state,
                    selectionDirty: false,
                    pagination,
                }));
            }
        });
    }
    renderRowSelection(locale) {
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
            const selectionColumn = {
                key: 'selection-column',
                render: this.renderSelectionBox(rowSelection.type),
                className: selectionColumnClass,
                fixed: rowSelection.fixed,
                width: rowSelection.columnWidth,
            };
            if (rowSelection.type !== 'radio') {
                const checkboxAllDisabled = data.every((item, index) => this.getCheckboxPropsByItem(item, index).disabled);
                selectionColumn.title = (React.createElement(SelectionCheckboxAll, { store: this.store, locale: locale, data: data, getCheckboxPropsByItem: this.getCheckboxPropsByItem, getRecordKey: this.getRecordKey, disabled: checkboxAllDisabled, prefixCls: prefixCls, onSelect: this.handleSelectRow, selections: rowSelection.selections, hideDefaultSelections: rowSelection.hideDefaultSelections, getPopupContainer: this.getPopupContainer }));
            }
            if ('fixed' in rowSelection) {
                selectionColumn.fixed = rowSelection.fixed;
            }
            else if (columns.some(column => column.fixed === 'left' || column.fixed === true)) {
                selectionColumn.fixed = 'left';
            }
            if (columns[0] && columns[0].key === 'selection-column') {
                columns[0] = selectionColumn;
            }
            else {
                columns.unshift(selectionColumn);
            }
        }
        return columns;
    }
    getColumnKey(column, index) {
        return getColumnKey(column, index);
    }
    getMaxCurrent(total) {
        const { pagination: { current, pageSize }, } = this.state;
        if ((current - 1) * pageSize >= total) {
            return Math.floor((total - 1) / pageSize) + 1;
        }
        return current;
    }
    isSortColumn(column) {
        const { sortColumn } = this.state;
        if (!column || !sortColumn) {
            return false;
        }
        return this.getColumnKey(sortColumn) === this.getColumnKey(column);
    }
    renderColumnsDropdown(columns, locale) {
        const { dropdownPrefixCls: customizeDropdownPrefixCls, filterBar } = this.props;
        const prefixCls = this.getPrefixCls();
        const dropdownPrefixCls = getPrefixCls('dropdown', customizeDropdownPrefixCls);
        const { sortOrder, filters } = this.state;
        return treeMap(columns, (originColumn, i) => {
            const column = { ...originColumn };
            const key = this.getColumnKey(column, i);
            let filterDropdown;
            let sortButton;
            if ((!filterBar && (column.filters && column.filters.length > 0)) || column.filterDropdown) {
                const colFilters = filters[key] || [];
                filterDropdown = (React.createElement(FilterDropdown, { locale: locale, column: column, selectedKeys: colFilters, confirmFilter: this.handleFilter, prefixCls: `${prefixCls}-filter`, dropdownPrefixCls: dropdownPrefixCls, getPopupContainer: this.getPopupContainer }));
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
                        onClick: (e) => {
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
                sortButton = React.createElement(Icon, { type: "arrow_upward", className: `${prefixCls}-sort-icon` });
            }
            column.title = (React.createElement("span", { key: key },
                column.title,
                sortButton,
                filterDropdown));
            if (sortButton || filterDropdown) {
                column.className = classNames(`${prefixCls}-column-has-filters`, column.className);
            }
            return column;
        });
    }
    renderPagination(paginationPosition) {
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
        return total > 0 && (position === paginationPosition || position === 'both') ? (React.createElement(Pagination, Object.assign({}, pagnationProps, { key: `pagination-${paginationPosition}` }, pagination, { className: classNames(pagination.className, `${prefixCls}-pagination`), onChange: this.handlePageChange, total: total, size: pagination.size || size, current: this.getMaxCurrent(total), onShowSizeChange: this.handleShowSizeChange }))) : null;
    }
    // Get pagination, filters, sorter
    prepareParamsArguments(state) {
        const pagination = { ...state.pagination };
        // remove useless handle function in Table.onChange
        delete pagination.onChange;
        delete pagination.onShowSizeChange;
        delete pagination.showTotal;
        delete pagination.sizeChangerOptionText;
        const filters = state.filters;
        const barFilters = state.barFilters;
        const sorter = {};
        if (state.sortColumn && state.sortOrder) {
            sorter.column = state.sortColumn;
            sorter.order = state.sortOrder;
            sorter.field = state.sortColumn.dataIndex;
            sorter.columnKey = this.getColumnKey(state.sortColumn);
        }
        return [pagination, filters, sorter, barFilters];
    }
    findColumn(myKey) {
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
        let current;
        let pageSize;
        const { state } = this;
        // 如果没有分页的话，默认全部展示
        if (!this.hasPagination()) {
            pageSize = Number.MAX_VALUE;
            current = 1;
        }
        else {
            pageSize = state.pagination.pageSize;
            current = this.getMaxCurrent(state.pagination.total || data.length);
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
    recursiveSort(data, sorterFn) {
        const { childrenColumnName = 'children' } = this.props;
        return data.sort(sorterFn).map((item) => item[childrenColumnName]
            ? {
                ...item,
                [childrenColumnName]: this.recursiveSort(item[childrenColumnName], sorterFn),
            }
            : item);
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
                    const col = this.findColumn(columnKey);
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
                    }
                    else {
                        filteredData = data.filter(record => isOr
                            ? filteredData.indexOf(record) !== -1 || this.doBarFilter(filter, record)
                            : filteredData.indexOf(record) !== -1 && this.doBarFilter(filter, record));
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
    doBarFilter(filter, record) {
        if (typeof filter === 'string') {
            return !!findColumnByFilterValue(record, getLeafColumns(this.columns), filter);
        }
        const columnKey = Object.keys(filter)[0];
        const col = this.findColumn(columnKey);
        if (!col) {
            return true;
        }
        const { onFilter, filters } = col;
        return !onFilter || onFilter(filter[columnKey], record, filters);
    }
    createComponents(components = {}, prevComponents) {
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
    render() {
        const { props } = this;
        const { style, className } = props;
        const prefixCls = this.getPrefixCls();
        const data = this.getCurrentPageData();
        let loading = props.loading;
        if (typeof loading === 'boolean') {
            loading = {
                spinning: loading,
            };
        }
        const table = (React.createElement(LocaleReceiver, { componentName: "Table", defaultLocale: defaultLocale.Table }, locale => this.renderTable(locale, loading)));
        // if there is no pagination or no data,
        // the height of spin should decrease by half of pagination
        const paginationPatchClass = this.hasPagination() && data && data.length !== 0
            ? `${prefixCls}-with-pagination`
            : `${prefixCls}-without-pagination`;
        return (React.createElement("div", { className: classNames(`${prefixCls}-wrapper`, className), style: style, ref: this.saveRef },
            React.createElement(Spin, Object.assign({}, loading, { className: loading.spinning ? `${paginationPatchClass} ${prefixCls}-spin-holder` : '' }),
                this.renderPagination('top'),
                table,
                this.renderPagination('bottom'))));
    }
}
Table.displayName = 'Table';
Table.Column = Column;
Table.ColumnGroup = ColumnGroup;
Table.propTypes = {
    dataSource: PropTypes.array,
    empty: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    onColumnFilterChange: PropTypes.func,
    columns: PropTypes.array,
    prefixCls: PropTypes.string,
    useFixedHeader: PropTypes.bool,
    rowSelection: PropTypes.object,
    className: PropTypes.string,
    size: PropTypes.oneOf(["large" /* large */, "default" /* default */, "small" /* small */]),
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
Table.defaultProps = {
    dataSource: [],
    empty: null,
    useFixedHeader: false,
    rowSelection: null,
    className: '',
    size: "default" /* default */,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvdGFibGUvVGFibGUudHN4IiwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUE0QyxNQUFNLE9BQU8sQ0FBQztBQUNuRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3hDLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sY0FBYyxNQUFNLDRCQUE0QixDQUFDO0FBQ3hELE9BQU8sb0JBQW9CLE1BQU0sbUNBQW1DLENBQUM7QUFDckUsT0FBTyxVQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLElBQW1CLE1BQU0sU0FBUyxDQUFDO0FBQzFDLE9BQU8sY0FBYyxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sT0FBTyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sV0FBc0IsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxvQkFBb0IsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFDOUIsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ3JELE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osY0FBYyxFQUNkLGdCQUFnQixFQUNoQixt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QVUsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUM1QixNQUFNLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9ELFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSTtDQUMzQixDQUFDO0FBRUssa0JBQVksR0FBRztJQUNwQixVQUFVLEVBQUUsRUFBRTtJQUNkLEtBQUssRUFBRSxJQUFJO0lBQ1gsY0FBYyxFQUFFLEtBQUs7SUFDckIsWUFBWSxFQUFFLElBQUk7SUFDbEIsU0FBUyxFQUFFLEVBQUU7SUFDYixJQUFJLHlCQUFjO0lBQ2xCLE9BQU8sRUFBRSxLQUFLO0lBQ2QsUUFBUSxFQUFFLEtBQUs7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLE1BQU0sRUFBRSxFQUFFO0lBQ1YsTUFBTSxFQUFFLEtBQUs7SUFDYixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsSUFBSTtJQUNmLFFBQVEsRUFBRSxLQUFLO0lBQ2YsVUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy90YWJsZS9UYWJsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCwgUmVhY3RDaGlsZHJlbiwgUmVhY3ROb2RlLCBTeW50aGV0aWNFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZpbmRET01Ob2RlIH0gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBub29wIGZyb20gJ2xvZGFzaC9ub29wJztcbmltcG9ydCBzY3JvbGxJbnRvVmlldyBmcm9tICdzY3JvbGwtaW50by12aWV3LWlmLW5lZWRlZCc7XG5pbXBvcnQgc21vb3RoU2Nyb2xsSW50b1ZpZXcgZnJvbSAnc21vb3RoLXNjcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkJztcbmltcG9ydCBQYWdpbmF0aW9uIGZyb20gJy4uL3BhZ2luYXRpb24nO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgU3BpbiwgeyBTcGluUHJvcHMgfSBmcm9tICcuLi9zcGluJztcbmltcG9ydCBMb2NhbGVSZWNlaXZlciBmcm9tICcuLi9sb2NhbGUtcHJvdmlkZXIvTG9jYWxlUmVjZWl2ZXInO1xuaW1wb3J0IGRlZmF1bHRMb2NhbGUgZnJvbSAnLi4vbG9jYWxlLXByb3ZpZGVyL2RlZmF1bHQnO1xuaW1wb3J0IHdhcm5pbmcgZnJvbSAnLi4vX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgRmlsdGVyRHJvcGRvd24gZnJvbSAnLi9maWx0ZXJEcm9wZG93bic7XG5pbXBvcnQgY3JlYXRlU3RvcmUsIHsgU3RvcmUgfSBmcm9tICcuL2NyZWF0ZVN0b3JlJztcbmltcG9ydCBTZWxlY3Rpb25Cb3ggZnJvbSAnLi9TZWxlY3Rpb25Cb3gnO1xuaW1wb3J0IFNlbGVjdGlvbkNoZWNrYm94QWxsIGZyb20gJy4vU2VsZWN0aW9uQ2hlY2tib3hBbGwnO1xuaW1wb3J0IENvbHVtbiBmcm9tICcuL0NvbHVtbic7XG5pbXBvcnQgQ29sdW1uR3JvdXAgZnJvbSAnLi9Db2x1bW5Hcm91cCc7XG5pbXBvcnQge2dldENvbmZpZywgZ2V0UHJlZml4Q2xzIH0gZnJvbSAnLi4vY29uZmlndXJlJ1xuaW1wb3J0IGNyZWF0ZUJvZHlSb3cgZnJvbSAnLi9jcmVhdGVCb2R5Um93JztcbmltcG9ydCB7XG4gIGZpbmRDb2x1bW5CeUZpbHRlclZhbHVlLFxuICBmbGF0QXJyYXksXG4gIGZsYXRGaWx0ZXIsXG4gIGdldENvbHVtbktleSxcbiAgZ2V0TGVhZkNvbHVtbnMsXG4gIG5vcm1hbGl6ZUNvbHVtbnMsXG4gIHJlbW92ZUhpZGRlbkNvbHVtbnMsXG4gIHRyZWVNYXAsXG59IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge1xuICBDb2x1bW5Qcm9wcyxcbiAgQ29tcGFyZUZuLFxuICBSb3dTZWxlY3Rpb25UeXBlLFxuICBTZWxlY3Rpb25JdGVtU2VsZWN0Rm4sXG4gIFRhYmxlQ29tcG9uZW50cyxcbiAgVGFibGVMb2NhbGUsXG4gIFRhYmxlUGFnaW5hdGlvbkNvbmZpZyxcbiAgVGFibGVQcm9wcyxcbiAgVGFibGVTdGF0ZSxcbiAgVGFibGVTdGF0ZUZpbHRlcnMsXG59IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCB7IFJhZGlvQ2hhbmdlRXZlbnQgfSBmcm9tICcuLi9yYWRpbyc7XG5pbXBvcnQgeyBDaGVja2JveENoYW5nZUV2ZW50IH0gZnJvbSAnLi4vY2hlY2tib3gnO1xuaW1wb3J0IEZpbHRlckJhciBmcm9tICcuL0ZpbHRlckJhcic7XG5pbXBvcnQgeyBWQUxVRV9PUiB9IGZyb20gJy4vRmlsdGVyU2VsZWN0JztcbmltcG9ydCBSY1RhYmxlIGZyb20gJy4uL3JjLWNvbXBvbmVudHMvdGFibGUnO1xuaW1wb3J0IHsgU2l6ZSB9IGZyb20gJy4uL191dGlsL2VudW0nO1xuXG5mdW5jdGlvbiBmaW5kQm9keURvbShkb206IEVsZW1lbnQgfCBIVE1MRGl2RWxlbWVudCwgcmVnOiBSZWdFeHApOiBhbnkge1xuICBpZiAoZG9tLmNoaWxkRWxlbWVudENvdW50ID4gMCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZG9tLmNoaWxkRWxlbWVudENvdW50OyBpICs9IDEpIHtcbiAgICAgIGlmIChyZWcudGVzdChkb20uY2hpbGRyZW5baV0uY2xhc3NOYW1lKSkge1xuICAgICAgICByZXR1cm4gZG9tLmNoaWxkcmVuW2ldO1xuICAgICAgfVxuICAgICAgaWYgKGRvbS5jaGlsZEVsZW1lbnRDb3VudCA+IDApIHtcbiAgICAgICAgY29uc3QgY2hpbGRGb3VuZCA9IGZpbmRCb2R5RG9tKGRvbS5jaGlsZHJlbltpXSwgcmVnKTtcbiAgICAgICAgaWYgKGNoaWxkRm91bmQgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2hpbGRGb3VuZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uKGU6IFN5bnRoZXRpY0V2ZW50PGFueT4pIHtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgaWYgKGUubmF0aXZlRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG4gICAgZS5uYXRpdmVFdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuXG5jb25zdCBkZWZhdWx0UGFnaW5hdGlvbiA9IHtcbiAgb25DaGFuZ2U6IG5vb3AsXG4gIG9uU2hvd1NpemVDaGFuZ2U6IG5vb3AsXG59O1xuXG4vKipcbiAqIEF2b2lkIGNyZWF0aW5nIG5ldyBvYmplY3QsIHNvIHRoYXQgcGFyZW50IGNvbXBvbmVudCdzIHNob3VsZENvbXBvbmVudFVwZGF0ZVxuICogY2FuIHdvcmtzIGFwcHJvcHJpYXRlbHnjgIJcbiAqL1xuY29uc3QgZW1wdHlPYmplY3QgPSB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGU8VD4gZXh0ZW5kcyBDb21wb25lbnQ8VGFibGVQcm9wczxUPiwgVGFibGVTdGF0ZTxUPj4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVGFibGUnO1xuXG4gIHN0YXRpYyBDb2x1bW4gPSBDb2x1bW47XG5cbiAgc3RhdGljIENvbHVtbkdyb3VwID0gQ29sdW1uR3JvdXA7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkYXRhU291cmNlOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgZW1wdHk6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ub2RlLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIG9uQ29sdW1uRmlsdGVyQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBjb2x1bW5zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgcHJlZml4Q2xzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHVzZUZpeGVkSGVhZGVyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICByb3dTZWxlY3Rpb246IFByb3BUeXBlcy5vYmplY3QsXG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbU2l6ZS5sYXJnZSwgU2l6ZS5kZWZhdWx0LCBTaXplLnNtYWxsXSksXG4gICAgbG9hZGluZzogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmJvb2wsIFByb3BUeXBlcy5vYmplY3RdKSxcbiAgICBib3JkZXJlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIGxvY2FsZTogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBkcm9wZG93blByZWZpeENsczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBmaWx0ZXJCYXI6IFByb3BUeXBlcy5ib29sLFxuICAgIGZpbHRlcnM6IFByb3BUeXBlcy5hcnJheSxcbiAgICBmaWx0ZXJCYXJQbGFjZWhvbGRlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvbkZpbHRlclNlbGVjdENoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbm9GaWx0ZXI6IFByb3BUeXBlcy5ib29sLFxuICAgIGF1dG9TY3JvbGw6IFByb3BUeXBlcy5ib29sLFxuICAgIGluZGVudFNpemU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcm93S2V5OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIHNob3dIZWFkZXI6IFByb3BUeXBlcy5ib29sLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGF0YVNvdXJjZTogW10sXG4gICAgZW1wdHk6IG51bGwsXG4gICAgdXNlRml4ZWRIZWFkZXI6IGZhbHNlLFxuICAgIHJvd1NlbGVjdGlvbjogbnVsbCxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIHNpemU6IFNpemUuZGVmYXVsdCxcbiAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICBib3JkZXJlZDogZmFsc2UsXG4gICAgaW5kZW50U2l6ZTogMjAsXG4gICAgbG9jYWxlOiB7fSxcbiAgICByb3dLZXk6ICdrZXknLFxuICAgIHNob3dIZWFkZXI6IHRydWUsXG4gICAgZmlsdGVyQmFyOiB0cnVlLFxuICAgIG5vRmlsdGVyOiBmYWxzZSxcbiAgICBhdXRvU2Nyb2xsOiB0cnVlLFxuICB9O1xuXG4gIENoZWNrYm94UHJvcHNDYWNoZToge1xuICAgIFtrZXk6IHN0cmluZ106IGFueTtcbiAgfTtcblxuICBzdG9yZTogU3RvcmU7XG5cbiAgY29sdW1uczogQ29sdW1uUHJvcHM8VD5bXTtcblxuICBjb21wb25lbnRzOiBUYWJsZUNvbXBvbmVudHM7XG5cbiAgcHJpdmF0ZSByZWZUYWJsZTogSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBUYWJsZVByb3BzPFQ+KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgd2FybmluZyhcbiAgICAgICEoJ2NvbHVtbnNQYWdlUmFuZ2UnIGluIHByb3BzIHx8ICdjb2x1bW5zUGFnZVNpemUnIGluIHByb3BzKSxcbiAgICAgICdgY29sdW1uc1BhZ2VSYW5nZWAgYW5kIGBjb2x1bW5zUGFnZVNpemVgIGFyZSByZW1vdmVkLCBwbGVhc2UgdXNlIGZpeGVkIGNvbHVtbnMgaW5zdGVhZCcsXG4gICAgKTtcblxuICAgIHRoaXMuY29sdW1ucyA9IHByb3BzLmNvbHVtbnMgfHwgbm9ybWFsaXplQ29sdW1ucyhwcm9wcy5jaGlsZHJlbiBhcyBSZWFjdENoaWxkcmVuKTtcblxuICAgIHRoaXMuY3JlYXRlQ29tcG9uZW50cyhwcm9wcy5jb21wb25lbnRzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAuLi50aGlzLmdldERlZmF1bHRTb3J0T3JkZXIodGhpcy5jb2x1bW5zKSxcbiAgICAgIC8vIOWHj+WwkeeKtuaAgVxuICAgICAgZmlsdGVyczogdGhpcy5nZXRGaWx0ZXJzRnJvbUNvbHVtbnMoKSxcbiAgICAgIGJhckZpbHRlcnM6IHByb3BzLmZpbHRlcnMgfHwgW10sXG4gICAgICBwYWdpbmF0aW9uOiB0aGlzLmdldERlZmF1bHRQYWdpbmF0aW9uKHByb3BzKSxcbiAgICB9O1xuXG4gICAgdGhpcy5DaGVja2JveFByb3BzQ2FjaGUgPSB7fTtcblxuICAgIHRoaXMuc3RvcmUgPSBjcmVhdGVTdG9yZSh7XG4gICAgICBzZWxlY3RlZFJvd0tleXM6IChwcm9wcy5yb3dTZWxlY3Rpb24gfHwge30pLnNlbGVjdGVkUm93S2V5cyB8fCBbXSxcbiAgICAgIHNlbGVjdGlvbkRpcnR5OiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIHNhdmVSZWYgPSByZWYgPT4ge1xuICAgIHRoaXMucmVmVGFibGUgPSByZWY7XG4gIH07XG5cbiAgZ2V0Q2hlY2tib3hQcm9wc0J5SXRlbSA9IChpdGVtOiBULCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgeyByb3dTZWxlY3Rpb24gPSB7fSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIXJvd1NlbGVjdGlvbi5nZXRDaGVja2JveFByb3BzKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0UmVjb3JkS2V5KGl0ZW0sIGluZGV4KTtcbiAgICAvLyBDYWNoZSBjaGVja2JveFByb3BzXG4gICAgaWYgKCF0aGlzLkNoZWNrYm94UHJvcHNDYWNoZVtrZXldKSB7XG4gICAgICB0aGlzLkNoZWNrYm94UHJvcHNDYWNoZVtrZXldID0gcm93U2VsZWN0aW9uLmdldENoZWNrYm94UHJvcHMoaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLkNoZWNrYm94UHJvcHNDYWNoZVtrZXldO1xuICB9O1xuXG4gIGdldFByZWZpeENscygpIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gZ2V0UHJlZml4Q2xzKCd0YWJsZScsIHByZWZpeENscyk7XG4gIH1cblxuICBnZXREZWZhdWx0U2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHsgcm93U2VsZWN0aW9uID0ge30gfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCFyb3dTZWxlY3Rpb24uZ2V0Q2hlY2tib3hQcm9wcykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRGbGF0RGF0YSgpXG4gICAgICAuZmlsdGVyKChpdGVtOiBULCByb3dJbmRleCkgPT4gdGhpcy5nZXRDaGVja2JveFByb3BzQnlJdGVtKGl0ZW0sIHJvd0luZGV4KS5kZWZhdWx0Q2hlY2tlZClcbiAgICAgIC5tYXAoKHJlY29yZCwgcm93SW5kZXgpID0+IHRoaXMuZ2V0UmVjb3JkS2V5KHJlY29yZCwgcm93SW5kZXgpKTtcbiAgfVxuXG4gIGdldERlZmF1bHRQYWdpbmF0aW9uKHByb3BzOiBUYWJsZVByb3BzPFQ+KSB7XG4gICAgY29uc3QgcGFnaW5hdGlvbjogVGFibGVQYWdpbmF0aW9uQ29uZmlnID0gcHJvcHMucGFnaW5hdGlvbiB8fCB7fTtcbiAgICByZXR1cm4gdGhpcy5oYXNQYWdpbmF0aW9uKHByb3BzKVxuICAgICAgPyB7XG4gICAgICAgICAgLi4uZGVmYXVsdFBhZ2luYXRpb24sXG4gICAgICAgICAgc2l6ZTogcHJvcHMuc2l6ZSxcbiAgICAgICAgICAuLi5wYWdpbmF0aW9uLFxuICAgICAgICAgIGN1cnJlbnQ6IHBhZ2luYXRpb24uZGVmYXVsdEN1cnJlbnQgfHwgcGFnaW5hdGlvbi5jdXJyZW50IHx8IDEsXG4gICAgICAgICAgcGFnZVNpemU6IHBhZ2luYXRpb24uZGVmYXVsdFBhZ2VTaXplIHx8IHBhZ2luYXRpb24ucGFnZVNpemUgfHwgMTAsXG4gICAgICAgIH1cbiAgICAgIDoge307XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogVGFibGVQcm9wczxUPikge1xuICAgIHRoaXMuY29sdW1ucyA9IG5leHRQcm9wcy5jb2x1bW5zIHx8IG5vcm1hbGl6ZUNvbHVtbnMobmV4dFByb3BzLmNoaWxkcmVuIGFzIFJlYWN0Q2hpbGRyZW4pO1xuICAgIGlmICgncGFnaW5hdGlvbicgaW4gbmV4dFByb3BzIHx8ICdwYWdpbmF0aW9uJyBpbiB0aGlzLnByb3BzKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHByZXZpb3VzU3RhdGUgPT4ge1xuICAgICAgICBjb25zdCBuZXdQYWdpbmF0aW9uID0ge1xuICAgICAgICAgIC4uLmRlZmF1bHRQYWdpbmF0aW9uLFxuICAgICAgICAgIHNpemU6IG5leHRQcm9wcy5zaXplLFxuICAgICAgICAgIC4uLnByZXZpb3VzU3RhdGUucGFnaW5hdGlvbixcbiAgICAgICAgICAuLi5uZXh0UHJvcHMucGFnaW5hdGlvbixcbiAgICAgICAgfTtcbiAgICAgICAgbmV3UGFnaW5hdGlvbi5jdXJyZW50ID0gbmV3UGFnaW5hdGlvbi5jdXJyZW50IHx8IDE7XG4gICAgICAgIG5ld1BhZ2luYXRpb24ucGFnZVNpemUgPSBuZXdQYWdpbmF0aW9uLnBhZ2VTaXplIHx8IDEwO1xuICAgICAgICByZXR1cm4geyBwYWdpbmF0aW9uOiBuZXh0UHJvcHMucGFnaW5hdGlvbiAhPT0gZmFsc2UgPyBuZXdQYWdpbmF0aW9uIDogZW1wdHlPYmplY3QgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCB7IHJvd1NlbGVjdGlvbiwgZGF0YVNvdXJjZSwgY29tcG9uZW50cyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IGZpbHRlcnMsIHNvcnRDb2x1bW4sIHNvcnRPcmRlciB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAobmV4dFByb3BzLnJvd1NlbGVjdGlvbiAmJiAnc2VsZWN0ZWRSb3dLZXlzJyBpbiBuZXh0UHJvcHMucm93U2VsZWN0aW9uKSB7XG4gICAgICB0aGlzLnN0b3JlLnNldFN0YXRlKHtcbiAgICAgICAgc2VsZWN0ZWRSb3dLZXlzOiBuZXh0UHJvcHMucm93U2VsZWN0aW9uLnNlbGVjdGVkUm93S2V5cyB8fCBbXSxcbiAgICAgIH0pO1xuICAgICAgaWYgKFxuICAgICAgICByb3dTZWxlY3Rpb24gJiZcbiAgICAgICAgbmV4dFByb3BzLnJvd1NlbGVjdGlvbi5nZXRDaGVja2JveFByb3BzICE9PSByb3dTZWxlY3Rpb24uZ2V0Q2hlY2tib3hQcm9wc1xuICAgICAgKSB7XG4gICAgICAgIHRoaXMuQ2hlY2tib3hQcm9wc0NhY2hlID0ge307XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgnZGF0YVNvdXJjZScgaW4gbmV4dFByb3BzICYmIG5leHRQcm9wcy5kYXRhU291cmNlICE9PSBkYXRhU291cmNlKSB7XG4gICAgICB0aGlzLnN0b3JlLnNldFN0YXRlKHtcbiAgICAgICAgc2VsZWN0aW9uRGlydHk6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLkNoZWNrYm94UHJvcHNDYWNoZSA9IHt9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldFNvcnRPcmRlckNvbHVtbnModGhpcy5jb2x1bW5zKS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBzb3J0U3RhdGUgPSB0aGlzLmdldFNvcnRTdGF0ZUZyb21Db2x1bW5zKHRoaXMuY29sdW1ucyk7XG4gICAgICBpZiAoc29ydFN0YXRlLnNvcnRDb2x1bW4gIT09IHNvcnRDb2x1bW4gfHwgc29ydFN0YXRlLnNvcnRPcmRlciAhPT0gc29ydE9yZGVyKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoc29ydFN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaWx0ZXJlZFZhbHVlQ29sdW1ucyA9IHRoaXMuZ2V0RmlsdGVyZWRWYWx1ZUNvbHVtbnModGhpcy5jb2x1bW5zKTtcbiAgICBpZiAoZmlsdGVyZWRWYWx1ZUNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmlsdGVyc0Zyb21Db2x1bW5zID0gdGhpcy5nZXRGaWx0ZXJzRnJvbUNvbHVtbnModGhpcy5jb2x1bW5zKTtcbiAgICAgIGNvbnN0IG5ld0ZpbHRlcnMgPSB7IC4uLmZpbHRlcnMgfTtcbiAgICAgIE9iamVjdC5rZXlzKGZpbHRlcnNGcm9tQ29sdW1ucykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBuZXdGaWx0ZXJzW2tleV0gPSBmaWx0ZXJzRnJvbUNvbHVtbnNba2V5XTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuaXNGaWx0ZXJzQ2hhbmdlZChuZXdGaWx0ZXJzKSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZmlsdGVyczogbmV3RmlsdGVycyB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJ2ZpbHRlcnMnIGluIG5leHRQcm9wcykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGJhckZpbHRlcnM6IG5leHRQcm9wcy5maWx0ZXJzIHx8IFtdLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jcmVhdGVDb21wb25lbnRzKG5leHRQcm9wcy5jb21wb25lbnRzLCBjb21wb25lbnRzKTtcbiAgfVxuXG4gIG9uUm93ID0gKHJlY29yZDogVCwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHsgb25Sb3cgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gdGhpcy5nZXRQcmVmaXhDbHMoKTtcbiAgICBjb25zdCBjdXN0b20gPSBvblJvdyA/IG9uUm93KHJlY29yZCwgaW5kZXgpIDoge307XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmN1c3RvbSxcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHN0b3JlOiB0aGlzLnN0b3JlLFxuICAgICAgcm93S2V5OiB0aGlzLmdldFJlY29yZEtleShyZWNvcmQsIGluZGV4KSxcbiAgICB9O1xuICB9O1xuXG4gIHNldFNlbGVjdGVkUm93S2V5cyhcbiAgICBzZWxlY3RlZFJvd0tleXM6IHN0cmluZ1tdLFxuICAgIHsgc2VsZWN0V2F5LCByZWNvcmQsIGNoZWNrZWQsIGNoYW5nZVJvd0tleXMsIG5hdGl2ZUV2ZW50IH06IGFueSxcbiAgKSB7XG4gICAgY29uc3QgeyByb3dTZWxlY3Rpb24gPSB7fSBhcyBhbnkgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHJvd1NlbGVjdGlvbiAmJiAhKCdzZWxlY3RlZFJvd0tleXMnIGluIHJvd1NlbGVjdGlvbikpIHtcbiAgICAgIHRoaXMuc3RvcmUuc2V0U3RhdGUoeyBzZWxlY3RlZFJvd0tleXMgfSk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldEZsYXREYXRhKCk7XG4gICAgaWYgKCFyb3dTZWxlY3Rpb24ub25DaGFuZ2UgJiYgIXJvd1NlbGVjdGlvbltzZWxlY3RXYXldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGRhdGEuZmlsdGVyKFxuICAgICAgKHJvdywgaSkgPT4gc2VsZWN0ZWRSb3dLZXlzLmluZGV4T2YodGhpcy5nZXRSZWNvcmRLZXkocm93LCBpKSkgPj0gMCxcbiAgICApO1xuICAgIGlmIChyb3dTZWxlY3Rpb24ub25DaGFuZ2UpIHtcbiAgICAgIHJvd1NlbGVjdGlvbi5vbkNoYW5nZShzZWxlY3RlZFJvd0tleXMsIHNlbGVjdGVkUm93cyk7XG4gICAgfVxuICAgIGlmIChzZWxlY3RXYXkgPT09ICdvblNlbGVjdCcgJiYgcm93U2VsZWN0aW9uLm9uU2VsZWN0KSB7XG4gICAgICByb3dTZWxlY3Rpb24ub25TZWxlY3QocmVjb3JkLCBjaGVja2VkLCBzZWxlY3RlZFJvd3MsIG5hdGl2ZUV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKHNlbGVjdFdheSA9PT0gJ29uU2VsZWN0QWxsJyAmJiByb3dTZWxlY3Rpb24ub25TZWxlY3RBbGwpIHtcbiAgICAgIGNvbnN0IGNoYW5nZVJvd3MgPSBkYXRhLmZpbHRlcihcbiAgICAgICAgKHJvdywgaSkgPT4gY2hhbmdlUm93S2V5cy5pbmRleE9mKHRoaXMuZ2V0UmVjb3JkS2V5KHJvdywgaSkpID49IDAsXG4gICAgICApO1xuICAgICAgcm93U2VsZWN0aW9uLm9uU2VsZWN0QWxsKGNoZWNrZWQsIHNlbGVjdGVkUm93cywgY2hhbmdlUm93cyk7XG4gICAgfSBlbHNlIGlmIChzZWxlY3RXYXkgPT09ICdvblNlbGVjdEludmVydCcgJiYgcm93U2VsZWN0aW9uLm9uU2VsZWN0SW52ZXJ0KSB7XG4gICAgICByb3dTZWxlY3Rpb24ub25TZWxlY3RJbnZlcnQoc2VsZWN0ZWRSb3dLZXlzKTtcbiAgICB9XG4gIH1cblxuICBoYXNQYWdpbmF0aW9uKHByb3BzPzogYW55KSB7XG4gICAgcmV0dXJuIChwcm9wcyB8fCB0aGlzLnByb3BzKS5wYWdpbmF0aW9uICE9PSBmYWxzZTtcbiAgfVxuXG4gIGlzRmlsdGVyc0NoYW5nZWQoZmlsdGVyczogVGFibGVTdGF0ZUZpbHRlcnMpIHtcbiAgICBsZXQgZmlsdGVyc0NoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCB7IGZpbHRlcnM6IHN0YXRlRmlsdGVycyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoT2JqZWN0LmtleXMoZmlsdGVycykubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhzdGF0ZUZpbHRlcnMpLmxlbmd0aCkge1xuICAgICAgZmlsdGVyc0NoYW5nZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBPYmplY3Qua2V5cyhmaWx0ZXJzKS5mb3JFYWNoKGNvbHVtbktleSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXJzW2NvbHVtbktleV0gIT09IHN0YXRlRmlsdGVyc1tjb2x1bW5LZXldKSB7XG4gICAgICAgICAgZmlsdGVyc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbHRlcnNDaGFuZ2VkO1xuICB9XG5cbiAgZ2V0U29ydE9yZGVyQ29sdW1ucyhjb2x1bW5zPzogQ29sdW1uUHJvcHM8VD5bXSkge1xuICAgIHJldHVybiBmbGF0RmlsdGVyKFxuICAgICAgY29sdW1ucyB8fCB0aGlzLmNvbHVtbnMgfHwgW10sXG4gICAgICAoY29sdW1uOiBDb2x1bW5Qcm9wczxUPikgPT4gJ3NvcnRPcmRlcicgaW4gY29sdW1uLFxuICAgICk7XG4gIH1cblxuICBnZXRGaWx0ZXJlZFZhbHVlQ29sdW1ucyhjb2x1bW5zPzogQ29sdW1uUHJvcHM8VD5bXSkge1xuICAgIHJldHVybiBmbGF0RmlsdGVyKFxuICAgICAgY29sdW1ucyB8fCB0aGlzLmNvbHVtbnMgfHwgW10sXG4gICAgICAoY29sdW1uOiBDb2x1bW5Qcm9wczxUPikgPT4gdHlwZW9mIGNvbHVtbi5maWx0ZXJlZFZhbHVlICE9PSAndW5kZWZpbmVkJyxcbiAgICApO1xuICB9XG5cbiAgZ2V0RmlsdGVyc0Zyb21Db2x1bW5zKGNvbHVtbnM/OiBDb2x1bW5Qcm9wczxUPltdKSB7XG4gICAgY29uc3QgZmlsdGVyczogYW55ID0ge307XG4gICAgdGhpcy5nZXRGaWx0ZXJlZFZhbHVlQ29sdW1ucyhjb2x1bW5zKS5mb3JFYWNoKChjb2w6IENvbHVtblByb3BzPFQ+KSA9PiB7XG4gICAgICBjb25zdCBjb2xLZXkgPSB0aGlzLmdldENvbHVtbktleShjb2wpIGFzIHN0cmluZztcbiAgICAgIGZpbHRlcnNbY29sS2V5XSA9IGNvbC5maWx0ZXJlZFZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBmaWx0ZXJzO1xuICB9XG5cbiAgZ2V0RGVmYXVsdFNvcnRPcmRlcihjb2x1bW5zPzogQ29sdW1uUHJvcHM8VD5bXSkge1xuICAgIGNvbnN0IGRlZmluZWRTb3J0U3RhdGUgPSB0aGlzLmdldFNvcnRTdGF0ZUZyb21Db2x1bW5zKGNvbHVtbnMpO1xuXG4gICAgY29uc3QgZGVmYXVsdFNvcnRlZENvbHVtbiA9IGZsYXRGaWx0ZXIoXG4gICAgICBjb2x1bW5zIHx8IFtdLFxuICAgICAgKGNvbHVtbjogQ29sdW1uUHJvcHM8VD4pID0+IGNvbHVtbi5kZWZhdWx0U29ydE9yZGVyICE9IG51bGwsXG4gICAgKVswXTtcblxuICAgIGlmIChkZWZhdWx0U29ydGVkQ29sdW1uICYmICFkZWZpbmVkU29ydFN0YXRlLnNvcnRDb2x1bW4pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvcnRDb2x1bW46IGRlZmF1bHRTb3J0ZWRDb2x1bW4sXG4gICAgICAgIHNvcnRPcmRlcjogZGVmYXVsdFNvcnRlZENvbHVtbi5kZWZhdWx0U29ydE9yZGVyLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmaW5lZFNvcnRTdGF0ZTtcbiAgfVxuXG4gIGdldFNvcnRTdGF0ZUZyb21Db2x1bW5zKGNvbHVtbnM/OiBDb2x1bW5Qcm9wczxUPltdKSB7XG4gICAgLy8gcmV0dXJuIGZpcnN0IGNvbHVtbiB3aGljaCBzb3J0T3JkZXIgaXMgbm90IGZhbHN5XG4gICAgY29uc3Qgc29ydGVkQ29sdW1uID0gdGhpcy5nZXRTb3J0T3JkZXJDb2x1bW5zKGNvbHVtbnMpLmZpbHRlcihcbiAgICAgIChjb2w6IENvbHVtblByb3BzPFQ+KSA9PiBjb2wuc29ydE9yZGVyLFxuICAgIClbMF07XG5cbiAgICBpZiAoc29ydGVkQ29sdW1uKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzb3J0Q29sdW1uOiBzb3J0ZWRDb2x1bW4sXG4gICAgICAgIHNvcnRPcmRlcjogc29ydGVkQ29sdW1uLnNvcnRPcmRlcixcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNvcnRDb2x1bW46IG51bGwsXG4gICAgICBzb3J0T3JkZXI6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGdldFNvcnRlckZuKCkge1xuICAgIGNvbnN0IHsgc29ydE9yZGVyLCBzb3J0Q29sdW1uIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghc29ydE9yZGVyIHx8ICFzb3J0Q29sdW1uIHx8IHR5cGVvZiBzb3J0Q29sdW1uLnNvcnRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiAoYTogVCwgYjogVCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gKHNvcnRDb2x1bW4hLnNvcnRlciBhcyBDb21wYXJlRm48VD4pKGEsIGIpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gc29ydE9yZGVyID09PSAnZGVzY2VuZCcgPyAtcmVzdWx0IDogcmVzdWx0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIDA7XG4gICAgfTtcbiAgfVxuXG4gIHNldFNvcnRPcmRlcihvcmRlcjogc3RyaW5nLCBjb2x1bW46IENvbHVtblByb3BzPFQ+KSB7XG4gICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICBzb3J0T3JkZXI6IG9yZGVyLFxuICAgICAgc29ydENvbHVtbjogY29sdW1uLFxuICAgIH07XG5cbiAgICAvLyBDb250cm9sbGVkXG4gICAgaWYgKHRoaXMuZ2V0U29ydE9yZGVyQ29sdW1ucygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBvbkNoYW5nZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIG9uQ2hhbmdlKFxuICAgICAgICAuLi50aGlzLnByZXBhcmVQYXJhbXNBcmd1bWVudHMoe1xuICAgICAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICAgICAgLi4ubmV3U3RhdGUsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVTb3J0T3JkZXIob3JkZXI6IHN0cmluZywgY29sdW1uOiBDb2x1bW5Qcm9wczxUPikge1xuICAgIGxldCB7IHNvcnRDb2x1bW4sIHNvcnRPcmRlciB9ID0gdGhpcy5zdGF0ZTtcbiAgICAvLyDlj6rlkIzml7blhYHorrjkuIDliJfov5vooYzmjpLluo/vvIzlkKbliJnkvJrlr7zoh7TmjpLluo/pobrluo/nmoTpgLvovpHpl67pophcbiAgICBjb25zdCBpc1NvcnRDb2x1bW4gPSB0aGlzLmlzU29ydENvbHVtbihjb2x1bW4pO1xuICAgIGlmICghaXNTb3J0Q29sdW1uKSB7XG4gICAgICAvLyDlvZPliY3liJfmnKrmjpLluo9cbiAgICAgIHNvcnRPcmRlciA9IG9yZGVyO1xuICAgICAgc29ydENvbHVtbiA9IGNvbHVtbjtcbiAgICB9IGVsc2UgaWYgKHNvcnRPcmRlciA9PT0gb3JkZXIpIHtcbiAgICAgIC8vIOWIh+aNouS4uuacquaOkuW6j+eKtuaAgVxuICAgICAgc29ydE9yZGVyID0gJyc7XG4gICAgICBzb3J0Q29sdW1uID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g5YiH5o2i5Li65o6S5bqP54q25oCBXG4gICAgICBzb3J0T3JkZXIgPSBvcmRlcjtcbiAgICB9XG4gICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICBzb3J0T3JkZXIsXG4gICAgICBzb3J0Q29sdW1uLFxuICAgIH07XG5cbiAgICAvLyBDb250cm9sbGVkXG4gICAgaWYgKHRoaXMuZ2V0U29ydE9yZGVyQ29sdW1ucygpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBvbkNoYW5nZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgIG9uQ2hhbmdlKFxuICAgICAgICAuLi50aGlzLnByZXBhcmVQYXJhbXNBcmd1bWVudHMoe1xuICAgICAgICAgIC4uLnRoaXMuc3RhdGUsXG4gICAgICAgICAgLi4ubmV3U3RhdGUsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBzZXROZXdGaWx0ZXJTdGF0ZShuZXdTdGF0ZTogYW55KSB7XG4gICAgY29uc3QgeyBwYWdpbmF0aW9uOiBwcm9wc1BhZ2luYXRpb24sIG9uQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgcGFnaW5hdGlvbjogc3RhdGVQYWdpbmF0aW9uIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHBhZ2luYXRpb24gPSB7IC4uLnN0YXRlUGFnaW5hdGlvbiB9O1xuXG4gICAgaWYgKHByb3BzUGFnaW5hdGlvbikge1xuICAgICAgLy8gUmVzZXQgY3VycmVudCBwcm9wXG4gICAgICBwYWdpbmF0aW9uLmN1cnJlbnQgPSAxO1xuICAgICAgcGFnaW5hdGlvbi5vbkNoYW5nZSEocGFnaW5hdGlvbi5jdXJyZW50KTtcbiAgICB9XG5cbiAgICAvLyBDb250cm9sbGVkIGN1cnJlbnQgcHJvcCB3aWxsIG5vdCByZXNwb25kIHVzZXIgaW50ZXJhY3Rpb25cbiAgICBpZiAocHJvcHNQYWdpbmF0aW9uICYmIHR5cGVvZiBwcm9wc1BhZ2luYXRpb24gPT09ICdvYmplY3QnICYmICdjdXJyZW50JyBpbiBwcm9wc1BhZ2luYXRpb24pIHtcbiAgICAgIG5ld1N0YXRlLnBhZ2luYXRpb24gPSB7XG4gICAgICAgIC4uLnBhZ2luYXRpb24sXG4gICAgICAgIGN1cnJlbnQ6IHN0YXRlUGFnaW5hdGlvbi5jdXJyZW50LFxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSwgKCkgPT4ge1xuICAgICAgdGhpcy5zdG9yZS5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGlvbkRpcnR5OiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgIG9uQ2hhbmdlKFxuICAgICAgICAgIC4uLnRoaXMucHJlcGFyZVBhcmFtc0FyZ3VtZW50cyh7XG4gICAgICAgICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgICAgICAgc2VsZWN0aW9uRGlydHk6IGZhbHNlLFxuICAgICAgICAgICAgcGFnaW5hdGlvbixcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZUZpbHRlclNlbGVjdENsZWFyID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZmlsdGVycyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBPYmplY3Qua2V5cyhmaWx0ZXJzKS5tYXAoa2V5ID0+IChmaWx0ZXJzW2tleV0gPSBbXSkpO1xuICAgIHRoaXMuc2V0TmV3RmlsdGVyU3RhdGUoe1xuICAgICAgYmFyRmlsdGVyczogW10sXG4gICAgICBmaWx0ZXJzLFxuICAgIH0pO1xuICB9O1xuXG4gIGhhbmRsZUZpbHRlclNlbGVjdENoYW5nZSA9IChiYXJGaWx0ZXJzOiBhbnlbXSkgPT4ge1xuICAgIGNvbnN0IHsgb25GaWx0ZXJTZWxlY3RDaGFuZ2UgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uRmlsdGVyU2VsZWN0Q2hhbmdlKSB7XG4gICAgICBvbkZpbHRlclNlbGVjdENoYW5nZShiYXJGaWx0ZXJzKTtcbiAgICB9XG4gICAgdGhpcy5zZXROZXdGaWx0ZXJTdGF0ZSh7XG4gICAgICBiYXJGaWx0ZXJzLFxuICAgIH0pO1xuICB9O1xuXG4gIGhhbmRsZUNvbHVtbkZpbHRlckNoYW5nZSA9IChlPzogYW55KSA9PiB7XG4gICAgY29uc3QgeyBvbkNvbHVtbkZpbHRlckNoYW5nZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAob25Db2x1bW5GaWx0ZXJDaGFuZ2UpIHtcbiAgICAgIG9uQ29sdW1uRmlsdGVyQ2hhbmdlKGUpO1xuICAgIH1cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH07XG5cbiAgaGFuZGxlRmlsdGVyID0gKGNvbHVtbjogQ29sdW1uUHJvcHM8VD4sIG5leHRGaWx0ZXJzOiBzdHJpbmdbXSkgPT4ge1xuICAgIGNvbnN0IHsgZmlsdGVyczogc3RhdGVGaWx0ZXJzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGZpbHRlcnMgPSB7XG4gICAgICAuLi5zdGF0ZUZpbHRlcnMsXG4gICAgICBbdGhpcy5nZXRDb2x1bW5LZXkoY29sdW1uKSBhcyBzdHJpbmddOiBuZXh0RmlsdGVycyxcbiAgICB9O1xuICAgIC8vIFJlbW92ZSBmaWx0ZXJzIG5vdCBpbiBjdXJyZW50IGNvbHVtbnNcbiAgICBjb25zdCBjdXJyZW50Q29sdW1uS2V5czogc3RyaW5nW10gPSBbXTtcbiAgICB0cmVlTWFwKHRoaXMuY29sdW1ucywgYyA9PiB7XG4gICAgICBpZiAoIWMuY2hpbGRyZW4pIHtcbiAgICAgICAgY3VycmVudENvbHVtbktleXMucHVzaCh0aGlzLmdldENvbHVtbktleShjKSBhcyBzdHJpbmcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5rZXlzKGZpbHRlcnMpLmZvckVhY2goY29sdW1uS2V5ID0+IHtcbiAgICAgIGlmIChjdXJyZW50Q29sdW1uS2V5cy5pbmRleE9mKGNvbHVtbktleSkgPCAwKSB7XG4gICAgICAgIGRlbGV0ZSBmaWx0ZXJzW2NvbHVtbktleV07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldE5ld0ZpbHRlclN0YXRlKHtcbiAgICAgIGZpbHRlcnMsXG4gICAgfSk7XG4gIH07XG5cbiAgaGFuZGxlU2VsZWN0ID0gKHJlY29yZDogVCwgcm93SW5kZXg6IG51bWJlciwgZTogQ2hlY2tib3hDaGFuZ2VFdmVudCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrZWQgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIGNvbnN0IG5hdGl2ZUV2ZW50ID0gZS5uYXRpdmVFdmVudDtcbiAgICBjb25zdCBkZWZhdWx0U2VsZWN0aW9uID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNlbGVjdGlvbkRpcnR5ID8gW10gOiB0aGlzLmdldERlZmF1bHRTZWxlY3Rpb24oKTtcbiAgICBsZXQgc2VsZWN0ZWRSb3dLZXlzID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNlbGVjdGVkUm93S2V5cy5jb25jYXQoZGVmYXVsdFNlbGVjdGlvbik7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5nZXRSZWNvcmRLZXkocmVjb3JkLCByb3dJbmRleCk7XG4gICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgIHNlbGVjdGVkUm93S2V5cy5wdXNoKHRoaXMuZ2V0UmVjb3JkS2V5KHJlY29yZCwgcm93SW5kZXgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRSb3dLZXlzID0gc2VsZWN0ZWRSb3dLZXlzLmZpbHRlcigoaTogc3RyaW5nKSA9PiBrZXkgIT09IGkpO1xuICAgIH1cbiAgICB0aGlzLnN0b3JlLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGlvbkRpcnR5OiB0cnVlLFxuICAgIH0pO1xuICAgIHRoaXMuc2V0U2VsZWN0ZWRSb3dLZXlzKHNlbGVjdGVkUm93S2V5cywge1xuICAgICAgc2VsZWN0V2F5OiAnb25TZWxlY3QnLFxuICAgICAgcmVjb3JkLFxuICAgICAgY2hlY2tlZCxcbiAgICAgIGNoYW5nZVJvd0tleXM6IHVuZGVmaW5lZCxcbiAgICAgIG5hdGl2ZUV2ZW50LFxuICAgIH0pO1xuICB9O1xuXG4gIGhhbmRsZVJhZGlvU2VsZWN0ID0gKHJlY29yZDogVCwgcm93SW5kZXg6IG51bWJlciwgZTogUmFkaW9DaGFuZ2VFdmVudCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrZWQgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgIGNvbnN0IG5hdGl2ZUV2ZW50ID0gZS5uYXRpdmVFdmVudDtcbiAgICBjb25zdCBkZWZhdWx0U2VsZWN0aW9uID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNlbGVjdGlvbkRpcnR5ID8gW10gOiB0aGlzLmdldERlZmF1bHRTZWxlY3Rpb24oKTtcbiAgICBsZXQgc2VsZWN0ZWRSb3dLZXlzID0gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNlbGVjdGVkUm93S2V5cy5jb25jYXQoZGVmYXVsdFNlbGVjdGlvbik7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5nZXRSZWNvcmRLZXkocmVjb3JkLCByb3dJbmRleCk7XG4gICAgc2VsZWN0ZWRSb3dLZXlzID0gW2tleV07XG4gICAgdGhpcy5zdG9yZS5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3Rpb25EaXJ0eTogdHJ1ZSxcbiAgICB9KTtcbiAgICB0aGlzLnNldFNlbGVjdGVkUm93S2V5cyhzZWxlY3RlZFJvd0tleXMsIHtcbiAgICAgIHNlbGVjdFdheTogJ29uU2VsZWN0JyxcbiAgICAgIHJlY29yZCxcbiAgICAgIGNoZWNrZWQsXG4gICAgICBjaGFuZ2VSb3dLZXlzOiB1bmRlZmluZWQsXG4gICAgICBuYXRpdmVFdmVudCxcbiAgICB9KTtcbiAgfTtcblxuICBoYW5kbGVTZWxlY3RSb3cgPSAoc2VsZWN0aW9uS2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIG9uU2VsZWN0RnVuYzogU2VsZWN0aW9uSXRlbVNlbGVjdEZuKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0RmxhdEN1cnJlbnRQYWdlRGF0YSgpO1xuICAgIGNvbnN0IGRlZmF1bHRTZWxlY3Rpb24gPSB0aGlzLnN0b3JlLmdldFN0YXRlKCkuc2VsZWN0aW9uRGlydHkgPyBbXSA6IHRoaXMuZ2V0RGVmYXVsdFNlbGVjdGlvbigpO1xuICAgIGNvbnN0IHNlbGVjdGVkUm93S2V5cyA9IHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5zZWxlY3RlZFJvd0tleXMuY29uY2F0KGRlZmF1bHRTZWxlY3Rpb24pO1xuICAgIGNvbnN0IGNoYW5nZWFibGVSb3dLZXlzID0gZGF0YVxuICAgICAgLmZpbHRlcigoaXRlbSwgaSkgPT4gIXRoaXMuZ2V0Q2hlY2tib3hQcm9wc0J5SXRlbShpdGVtLCBpKS5kaXNhYmxlZClcbiAgICAgIC5tYXAoKGl0ZW0sIGkpID0+IHRoaXMuZ2V0UmVjb3JkS2V5KGl0ZW0sIGkpKTtcblxuICAgIGNvbnN0IGNoYW5nZVJvd0tleXM6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHNlbGVjdFdheSA9ICcnO1xuICAgIGxldCBjaGVja2VkO1xuICAgIC8vIGhhbmRsZSBkZWZhdWx0IHNlbGVjdGlvblxuICAgIHN3aXRjaCAoc2VsZWN0aW9uS2V5KSB7XG4gICAgICBjYXNlICdhbGwnOlxuICAgICAgICBjaGFuZ2VhYmxlUm93S2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKHNlbGVjdGVkUm93S2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFJvd0tleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgY2hhbmdlUm93S2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0V2F5ID0gJ29uU2VsZWN0QWxsJztcbiAgICAgICAgY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVtb3ZlQWxsJzpcbiAgICAgICAgY2hhbmdlYWJsZVJvd0tleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIGlmIChzZWxlY3RlZFJvd0tleXMuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgICAgIHNlbGVjdGVkUm93S2V5cy5zcGxpY2Uoc2VsZWN0ZWRSb3dLZXlzLmluZGV4T2Yoa2V5KSwgMSk7XG4gICAgICAgICAgICBjaGFuZ2VSb3dLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzZWxlY3RXYXkgPSAnb25TZWxlY3RBbGwnO1xuICAgICAgICBjaGVja2VkID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW52ZXJ0JzpcbiAgICAgICAgY2hhbmdlYWJsZVJvd0tleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIGlmIChzZWxlY3RlZFJvd0tleXMuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgICAgICAgICAgc2VsZWN0ZWRSb3dLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0ZWRSb3dLZXlzLnNwbGljZShzZWxlY3RlZFJvd0tleXMuaW5kZXhPZihrZXkpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2hhbmdlUm93S2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgc2VsZWN0V2F5ID0gJ29uU2VsZWN0SW52ZXJ0JztcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5zdG9yZS5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3Rpb25EaXJ0eTogdHJ1ZSxcbiAgICB9KTtcbiAgICAvLyB3aGVuIHNlbGVjdCBjdXN0b20gc2VsZWN0aW9uLCBjYWxsYmFjayBzZWxlY3Rpb25zW25dLm9uU2VsZWN0XG4gICAgY29uc3QgeyByb3dTZWxlY3Rpb24gfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IGN1c3RvbVNlbGVjdGlvblN0YXJ0SW5kZXggPSAyO1xuICAgIGlmIChyb3dTZWxlY3Rpb24gJiYgcm93U2VsZWN0aW9uLmhpZGVEZWZhdWx0U2VsZWN0aW9ucykge1xuICAgICAgY3VzdG9tU2VsZWN0aW9uU3RhcnRJbmRleCA9IDA7XG4gICAgfVxuICAgIGlmIChpbmRleCA+PSBjdXN0b21TZWxlY3Rpb25TdGFydEluZGV4ICYmIHR5cGVvZiBvblNlbGVjdEZ1bmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvblNlbGVjdEZ1bmMoY2hhbmdlYWJsZVJvd0tleXMpO1xuICAgIH1cbiAgICB0aGlzLnNldFNlbGVjdGVkUm93S2V5cyhzZWxlY3RlZFJvd0tleXMsIHtcbiAgICAgIHNlbGVjdFdheSxcbiAgICAgIGNoZWNrZWQsXG4gICAgICBjaGFuZ2VSb3dLZXlzLFxuICAgIH0pO1xuICB9O1xuXG4gIGhhbmRsZVBhZ2VDaGFuZ2UgPSAoY3VycmVudDogbnVtYmVyLCAuLi5vdGhlckFyZ3VtZW50czogYW55W10pID0+IHtcbiAgICBjb25zdCB7IG9uQ2hhbmdlLCBhdXRvU2Nyb2xsLCBwYWdpbmF0aW9uOiBwcm9wc1BhZ2luYXRpb24gfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBwYWdpbmF0aW9uOiBzdGF0ZVBhZ2luYXRpb24gfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgcGFnaW5hdGlvbiA9IHsgLi4uc3RhdGVQYWdpbmF0aW9uIH07XG4gICAgaWYgKGF1dG9TY3JvbGwpIHtcbiAgICAgIGNvbnN0IHNjcm9sbEludG9WaWV3U21vb3RobHkgPVxuICAgICAgICAnc2Nyb2xsQmVoYXZpb3InIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZVxuICAgICAgICAgID8gc2Nyb2xsSW50b1ZpZXdcbiAgICAgICAgICA6IHNtb290aFNjcm9sbEludG9WaWV3O1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnJlZlRhYmxlICYmIHRoaXMucmVmVGFibGUuY2xpZW50SGVpZ2h0ID4gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICBzY3JvbGxJbnRvVmlld1Ntb290aGx5KHRoaXMucmVmVGFibGUsIHsgYmxvY2s6ICdzdGFydCcsIGJlaGF2aW9yOiAnc21vb3RoJywgc2Nyb2xsTW9kZTogJ2lmLW5lZWRlZCcgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yZWZUYWJsZSkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBpZiAodGhpcy5yZWZUYWJsZS5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICB0aGlzLnJlZlRhYmxlLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoe1xuICAgICAgICAgICAgICBibG9jazogJ3N0YXJ0JyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JvbGxJbnRvVmlld1Ntb290aGx5KHRoaXMucmVmVGFibGUsIHsgYmxvY2s6ICdzdGFydCcsIGJlaGF2aW9yOiAnc21vb3RoJywgc2Nyb2xsTW9kZTogJ2lmLW5lZWRlZCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCAxMCk7XG4gICAgICBpZiAodGhpcy5yZWZUYWJsZSkge1xuICAgICAgICBjb25zdCBkb20gPSBmaW5kQm9keURvbSh0aGlzLnJlZlRhYmxlLCBuZXcgUmVnRXhwKGAke3RoaXMuZ2V0UHJlZml4Q2xzKCl9LWJvZHlgKSk7XG4gICAgICAgIGlmIChkb20gIT09IG51bGwgJiYgZG9tLnNjcm9sbCkge1xuICAgICAgICAgIGRvbS5zY3JvbGxUb3AgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBwYWdpbmF0aW9uLmN1cnJlbnQgPSBjdXJyZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWdpbmF0aW9uLmN1cnJlbnQgPSBwYWdpbmF0aW9uLmN1cnJlbnQgfHwgMTtcbiAgICB9XG4gICAgcGFnaW5hdGlvbi5vbkNoYW5nZSEocGFnaW5hdGlvbi5jdXJyZW50LCAuLi5vdGhlckFyZ3VtZW50cyk7XG5cbiAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgIHBhZ2luYXRpb24sXG4gICAgfTtcbiAgICAvLyBDb250cm9sbGVkIGN1cnJlbnQgcHJvcCB3aWxsIG5vdCByZXNwb25kIHVzZXIgaW50ZXJhY3Rpb25cbiAgICBpZiAocHJvcHNQYWdpbmF0aW9uICYmIHR5cGVvZiBwcm9wc1BhZ2luYXRpb24gPT09ICdvYmplY3QnICYmICdjdXJyZW50JyBpbiBwcm9wc1BhZ2luYXRpb24pIHtcbiAgICAgIG5ld1N0YXRlLnBhZ2luYXRpb24gPSB7XG4gICAgICAgIC4uLnBhZ2luYXRpb24sXG4gICAgICAgIGN1cnJlbnQ6IHN0YXRlUGFnaW5hdGlvbi5jdXJyZW50LFxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cbiAgICB0aGlzLnN0b3JlLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGlvbkRpcnR5OiBmYWxzZSxcbiAgICB9KTtcblxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgb25DaGFuZ2UoXG4gICAgICAgIC4uLnRoaXMucHJlcGFyZVBhcmFtc0FyZ3VtZW50cyh7XG4gICAgICAgICAgLi4udGhpcy5zdGF0ZSxcbiAgICAgICAgICBzZWxlY3Rpb25EaXJ0eTogZmFsc2UsXG4gICAgICAgICAgcGFnaW5hdGlvbixcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICByZW5kZXJTZWxlY3Rpb25Cb3ggPSAodHlwZTogUm93U2VsZWN0aW9uVHlwZSB8IHVuZGVmaW5lZCkgPT4ge1xuICAgIHJldHVybiAoXzogYW55LCByZWNvcmQ6IFQsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHJvd0luZGV4ID0gdGhpcy5nZXRSZWNvcmRLZXkocmVjb3JkLCBpbmRleCk7IC8vIOS7jiAxIOW8gOWni1xuICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLmdldENoZWNrYm94UHJvcHNCeUl0ZW0ocmVjb3JkLCBpbmRleCk7XG4gICAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZTogUmFkaW9DaGFuZ2VFdmVudCB8IENoZWNrYm94Q2hhbmdlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZVJhZGlvU2VsZWN0KHJlY29yZCwgcm93SW5kZXgsIGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaGFuZGxlU2VsZWN0KHJlY29yZCwgcm93SW5kZXgsIGUpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8c3BhbiBvbkNsaWNrPXtzdG9wUHJvcGFnYXRpb259PlxuICAgICAgICAgIDxTZWxlY3Rpb25Cb3hcbiAgICAgICAgICAgIHR5cGU9e3R5cGV9XG4gICAgICAgICAgICBzdG9yZT17dGhpcy5zdG9yZX1cbiAgICAgICAgICAgIHJvd0luZGV4PXtyb3dJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVDaGFuZ2V9XG4gICAgICAgICAgICBkZWZhdWx0U2VsZWN0aW9uPXt0aGlzLmdldERlZmF1bHRTZWxlY3Rpb24oKX1cbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH07XG4gIH07XG5cbiAgZ2V0UmVjb3JkS2V5ID0gKHJlY29yZDogVCwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHsgcm93S2V5IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHJlY29yZEtleSA9XG4gICAgICB0eXBlb2Ygcm93S2V5ID09PSAnZnVuY3Rpb24nID8gcm93S2V5KHJlY29yZCwgaW5kZXgpIDogKHJlY29yZCBhcyBhbnkpW3Jvd0tleSBhcyBzdHJpbmddO1xuICAgIHdhcm5pbmcoXG4gICAgICByZWNvcmRLZXkgIT09IHVuZGVmaW5lZCxcbiAgICAgICdFYWNoIHJlY29yZCBpbiBkYXRhU291cmNlIG9mIHRhYmxlIHNob3VsZCBoYXZlIGEgdW5pcXVlIGBrZXlgIHByb3AsIG9yIHNldCBgcm93S2V5YCB0byBhbiB1bmlxdWUgcHJpbWFyeSBrZXknLFxuICAgICk7XG4gICAgcmV0dXJuIHJlY29yZEtleSA9PT0gdW5kZWZpbmVkID8gaW5kZXggOiByZWNvcmRLZXk7XG4gIH07XG5cbiAgZ2V0UG9wdXBDb250YWluZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGZpbmRET01Ob2RlKHRoaXMpIGFzIEhUTUxFbGVtZW50O1xuICB9O1xuXG4gIHJlbmRlclJvd1NlbGVjdGlvbihsb2NhbGU6IFRhYmxlTG9jYWxlKSB7XG4gICAgY29uc3QgeyByb3dTZWxlY3Rpb24gfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gdGhpcy5nZXRQcmVmaXhDbHMoKTtcbiAgICBjb25zdCBjb2x1bW5zID0gdGhpcy5jb2x1bW5zLmNvbmNhdCgpO1xuICAgIGlmIChyb3dTZWxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldEZsYXRDdXJyZW50UGFnZURhdGEoKS5maWx0ZXIoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChyb3dTZWxlY3Rpb24uZ2V0Q2hlY2tib3hQcm9wcykge1xuICAgICAgICAgIHJldHVybiAhdGhpcy5nZXRDaGVja2JveFByb3BzQnlJdGVtKGl0ZW0sIGluZGV4KS5kaXNhYmxlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VsZWN0aW9uQ29sdW1uQ2xhc3MgPSBjbGFzc05hbWVzKGAke3ByZWZpeENsc30tc2VsZWN0aW9uLWNvbHVtbmAsIHtcbiAgICAgICAgW2Ake3ByZWZpeENsc30tc2VsZWN0aW9uLWNvbHVtbi1jdXN0b21gXTogcm93U2VsZWN0aW9uLnNlbGVjdGlvbnMsXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbkNvbHVtbjogQ29sdW1uUHJvcHM8YW55PiA9IHtcbiAgICAgICAga2V5OiAnc2VsZWN0aW9uLWNvbHVtbicsXG4gICAgICAgIHJlbmRlcjogdGhpcy5yZW5kZXJTZWxlY3Rpb25Cb3gocm93U2VsZWN0aW9uLnR5cGUpLFxuICAgICAgICBjbGFzc05hbWU6IHNlbGVjdGlvbkNvbHVtbkNsYXNzLFxuICAgICAgICBmaXhlZDogcm93U2VsZWN0aW9uLmZpeGVkLFxuICAgICAgICB3aWR0aDogcm93U2VsZWN0aW9uLmNvbHVtbldpZHRoLFxuICAgICAgfTtcbiAgICAgIGlmIChyb3dTZWxlY3Rpb24udHlwZSAhPT0gJ3JhZGlvJykge1xuICAgICAgICBjb25zdCBjaGVja2JveEFsbERpc2FibGVkID0gZGF0YS5ldmVyeShcbiAgICAgICAgICAoaXRlbSwgaW5kZXgpID0+IHRoaXMuZ2V0Q2hlY2tib3hQcm9wc0J5SXRlbShpdGVtLCBpbmRleCkuZGlzYWJsZWQsXG4gICAgICAgICk7XG4gICAgICAgIHNlbGVjdGlvbkNvbHVtbi50aXRsZSA9IChcbiAgICAgICAgICA8U2VsZWN0aW9uQ2hlY2tib3hBbGxcbiAgICAgICAgICAgIHN0b3JlPXt0aGlzLnN0b3JlfVxuICAgICAgICAgICAgbG9jYWxlPXtsb2NhbGV9XG4gICAgICAgICAgICBkYXRhPXtkYXRhfVxuICAgICAgICAgICAgZ2V0Q2hlY2tib3hQcm9wc0J5SXRlbT17dGhpcy5nZXRDaGVja2JveFByb3BzQnlJdGVtfVxuICAgICAgICAgICAgZ2V0UmVjb3JkS2V5PXt0aGlzLmdldFJlY29yZEtleX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtjaGVja2JveEFsbERpc2FibGVkfVxuICAgICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgICBvblNlbGVjdD17dGhpcy5oYW5kbGVTZWxlY3RSb3d9XG4gICAgICAgICAgICBzZWxlY3Rpb25zPXtyb3dTZWxlY3Rpb24uc2VsZWN0aW9uc31cbiAgICAgICAgICAgIGhpZGVEZWZhdWx0U2VsZWN0aW9ucz17cm93U2VsZWN0aW9uLmhpZGVEZWZhdWx0U2VsZWN0aW9uc31cbiAgICAgICAgICAgIGdldFBvcHVwQ29udGFpbmVyPXt0aGlzLmdldFBvcHVwQ29udGFpbmVyfVxuICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoJ2ZpeGVkJyBpbiByb3dTZWxlY3Rpb24pIHtcbiAgICAgICAgc2VsZWN0aW9uQ29sdW1uLmZpeGVkID0gcm93U2VsZWN0aW9uLmZpeGVkO1xuICAgICAgfSBlbHNlIGlmIChjb2x1bW5zLnNvbWUoY29sdW1uID0+IGNvbHVtbi5maXhlZCA9PT0gJ2xlZnQnIHx8IGNvbHVtbi5maXhlZCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgc2VsZWN0aW9uQ29sdW1uLmZpeGVkID0gJ2xlZnQnO1xuICAgICAgfVxuICAgICAgaWYgKGNvbHVtbnNbMF0gJiYgY29sdW1uc1swXS5rZXkgPT09ICdzZWxlY3Rpb24tY29sdW1uJykge1xuICAgICAgICBjb2x1bW5zWzBdID0gc2VsZWN0aW9uQ29sdW1uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sdW1ucy51bnNoaWZ0KHNlbGVjdGlvbkNvbHVtbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2x1bW5zO1xuICB9XG5cbiAgZ2V0Q29sdW1uS2V5KGNvbHVtbjogQ29sdW1uUHJvcHM8VD4sIGluZGV4PzogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGdldENvbHVtbktleShjb2x1bW4sIGluZGV4KTtcbiAgfVxuXG4gIGdldE1heEN1cnJlbnQodG90YWw6IG51bWJlcikge1xuICAgIGNvbnN0IHtcbiAgICAgIHBhZ2luYXRpb246IHsgY3VycmVudCwgcGFnZVNpemUgfSxcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoKGN1cnJlbnQhIC0gMSkgKiBwYWdlU2l6ZSEgPj0gdG90YWwpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCh0b3RhbCAtIDEpIC8gcGFnZVNpemUhKSArIDE7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50O1xuICB9XG5cbiAgaXNTb3J0Q29sdW1uKGNvbHVtbjogQ29sdW1uUHJvcHM8VD4pIHtcbiAgICBjb25zdCB7IHNvcnRDb2x1bW4gfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFjb2x1bW4gfHwgIXNvcnRDb2x1bW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uS2V5KHNvcnRDb2x1bW4pID09PSB0aGlzLmdldENvbHVtbktleShjb2x1bW4pO1xuICB9XG5cbiAgcmVuZGVyQ29sdW1uc0Ryb3Bkb3duKGNvbHVtbnM6IENvbHVtblByb3BzPFQ+W10sIGxvY2FsZTogVGFibGVMb2NhbGUpIHtcbiAgICBjb25zdCB7IGRyb3Bkb3duUHJlZml4Q2xzOiBjdXN0b21pemVEcm9wZG93blByZWZpeENscywgZmlsdGVyQmFyIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHByZWZpeENscyA9IHRoaXMuZ2V0UHJlZml4Q2xzKCk7XG4gICAgY29uc3QgZHJvcGRvd25QcmVmaXhDbHMgPSBnZXRQcmVmaXhDbHMoJ2Ryb3Bkb3duJywgY3VzdG9taXplRHJvcGRvd25QcmVmaXhDbHMpO1xuICAgIGNvbnN0IHsgc29ydE9yZGVyLCBmaWx0ZXJzIH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiB0cmVlTWFwKGNvbHVtbnMsIChvcmlnaW5Db2x1bW4sIGkpID0+IHtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IHsgLi4ub3JpZ2luQ29sdW1uIH07XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmdldENvbHVtbktleShjb2x1bW4sIGkpIGFzIHN0cmluZztcbiAgICAgIGxldCBmaWx0ZXJEcm9wZG93bjtcbiAgICAgIGxldCBzb3J0QnV0dG9uO1xuICAgICAgaWYgKCghZmlsdGVyQmFyICYmIChjb2x1bW4uZmlsdGVycyAmJiBjb2x1bW4uZmlsdGVycy5sZW5ndGggPiAwKSkgfHwgY29sdW1uLmZpbHRlckRyb3Bkb3duKSB7XG4gICAgICAgIGNvbnN0IGNvbEZpbHRlcnMgPSBmaWx0ZXJzW2tleV0gfHwgW107XG4gICAgICAgIGZpbHRlckRyb3Bkb3duID0gKFxuICAgICAgICAgIDxGaWx0ZXJEcm9wZG93blxuICAgICAgICAgICAgbG9jYWxlPXtsb2NhbGV9XG4gICAgICAgICAgICBjb2x1bW49e2NvbHVtbn1cbiAgICAgICAgICAgIHNlbGVjdGVkS2V5cz17Y29sRmlsdGVyc31cbiAgICAgICAgICAgIGNvbmZpcm1GaWx0ZXI9e3RoaXMuaGFuZGxlRmlsdGVyfVxuICAgICAgICAgICAgcHJlZml4Q2xzPXtgJHtwcmVmaXhDbHN9LWZpbHRlcmB9XG4gICAgICAgICAgICBkcm9wZG93blByZWZpeENscz17ZHJvcGRvd25QcmVmaXhDbHN9XG4gICAgICAgICAgICBnZXRQb3B1cENvbnRhaW5lcj17dGhpcy5nZXRQb3B1cENvbnRhaW5lcn1cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGNvbHVtbi5zb3J0ZXIpIHtcbiAgICAgICAgY29uc3QgaXNTb3J0Q29sdW1uID0gdGhpcy5pc1NvcnRDb2x1bW4oY29sdW1uKTtcbiAgICAgICAgY29uc3QgaXNBc2NlbmQgPSBpc1NvcnRDb2x1bW4gJiYgc29ydE9yZGVyID09PSAnYXNjZW5kJztcbiAgICAgICAgLy8gY29uc3QgaXNEZXNjZW5kID0gaXNTb3J0Q29sdW1uICYmIHNvcnRPcmRlciA9PT0gJ2Rlc2NlbmQnO1xuICAgICAgICBjb2x1bW4uY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhjb2x1bW4uY2xhc3NOYW1lLCB7XG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tc29ydC0ke3NvcnRPcmRlcn1gXTogaXNTb3J0Q29sdW1uLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgeyBvbkhlYWRlckNlbGwgfSA9IGNvbHVtbjtcbiAgICAgICAgY29sdW1uLm9uSGVhZGVyQ2VsbCA9IGNvbCA9PiB7XG4gICAgICAgICAgY29uc3QgY3VzdG9tUHJvcHMgPSAob25IZWFkZXJDZWxsICYmIG9uSGVhZGVyQ2VsbChjb2wpKSB8fCB7fTtcbiAgICAgICAgICBjb25zdCB7IG9uQ2xpY2sgfSA9IGN1c3RvbVByb3BzO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5jdXN0b21Qcm9wcyxcbiAgICAgICAgICAgIG9uQ2xpY2s6IChlOiBTeW50aGV0aWNFdmVudDxhbnk+KSA9PiB7XG4gICAgICAgICAgICAgIGlmICghZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25DbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgb25DbGljayhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnNldFNvcnRPcmRlcihpc0FzY2VuZCA/ICdkZXNjZW5kJyA6ICdhc2NlbmQnLCBjb2x1bW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBzb3J0QnV0dG9uID0gPEljb24gdHlwZT1cImFycm93X3Vwd2FyZFwiIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1zb3J0LWljb25gfSAvPjtcbiAgICAgIH1cbiAgICAgIGNvbHVtbi50aXRsZSA9IChcbiAgICAgICAgPHNwYW4ga2V5PXtrZXl9PlxuICAgICAgICAgIHtjb2x1bW4udGl0bGV9XG4gICAgICAgICAge3NvcnRCdXR0b259XG4gICAgICAgICAge2ZpbHRlckRyb3Bkb3dufVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuXG4gICAgICBpZiAoc29ydEJ1dHRvbiB8fCBmaWx0ZXJEcm9wZG93bikge1xuICAgICAgICBjb2x1bW4uY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LWNvbHVtbi1oYXMtZmlsdGVyc2AsIGNvbHVtbi5jbGFzc05hbWUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29sdW1uO1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlU2hvd1NpemVDaGFuZ2UgPSAoY3VycmVudDogbnVtYmVyLCBwYWdlU2l6ZTogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgeyBwYWdpbmF0aW9uIH0gPSB0aGlzLnN0YXRlO1xuICAgIHBhZ2luYXRpb24ub25TaG93U2l6ZUNoYW5nZSEoY3VycmVudCwgcGFnZVNpemUpO1xuICAgIGNvbnN0IG5leHRQYWdpbmF0aW9uID0ge1xuICAgICAgLi4ucGFnaW5hdGlvbixcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgY3VycmVudCxcbiAgICB9O1xuICAgIHRoaXMuc2V0U3RhdGUoeyBwYWdpbmF0aW9uOiBuZXh0UGFnaW5hdGlvbiB9KTtcblxuICAgIGNvbnN0IHsgb25DaGFuZ2UgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICBvbkNoYW5nZShcbiAgICAgICAgLi4udGhpcy5wcmVwYXJlUGFyYW1zQXJndW1lbnRzKHtcbiAgICAgICAgICAuLi50aGlzLnN0YXRlLFxuICAgICAgICAgIHBhZ2luYXRpb246IG5leHRQYWdpbmF0aW9uLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlclBhZ2luYXRpb24ocGFnaW5hdGlvblBvc2l0aW9uOiBzdHJpbmcpIHtcbiAgICAvLyDlvLrliLbkuI3pnIDopoHliIbpobVcbiAgICBpZiAoIXRoaXMuaGFzUGFnaW5hdGlvbigpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeyBwYWdpbmF0aW9uIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgc2l6ZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBwcmVmaXhDbHMgPSB0aGlzLmdldFByZWZpeENscygpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcGFnaW5hdGlvbi5wb3NpdGlvbiB8fCAnYm90dG9tJztcbiAgICBjb25zdCB0b3RhbCA9IHBhZ2luYXRpb24udG90YWwgfHwgdGhpcy5nZXRMb2NhbERhdGEoKS5sZW5ndGg7XG4gICAgY29uc3QgcGFnbmF0aW9uUHJvcHMgPSBnZXRDb25maWcoJ3BhZ2luYXRpb24nKTtcbiAgICByZXR1cm4gdG90YWwgPiAwICYmIChwb3NpdGlvbiA9PT0gcGFnaW5hdGlvblBvc2l0aW9uIHx8IHBvc2l0aW9uID09PSAnYm90aCcpID8gKFxuICAgICAgPFBhZ2luYXRpb25cbiAgICAgICAgey4uLnBhZ25hdGlvblByb3BzfVxuICAgICAgICBrZXk9e2BwYWdpbmF0aW9uLSR7cGFnaW5hdGlvblBvc2l0aW9ufWB9XG4gICAgICAgIHsuLi5wYWdpbmF0aW9ufVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMocGFnaW5hdGlvbi5jbGFzc05hbWUsIGAke3ByZWZpeENsc30tcGFnaW5hdGlvbmApfVxuICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVQYWdlQ2hhbmdlfVxuICAgICAgICB0b3RhbD17dG90YWx9XG4gICAgICAgIHNpemU9e3BhZ2luYXRpb24uc2l6ZSB8fCBzaXplfVxuICAgICAgICBjdXJyZW50PXt0aGlzLmdldE1heEN1cnJlbnQodG90YWwpfVxuICAgICAgICBvblNob3dTaXplQ2hhbmdlPXt0aGlzLmhhbmRsZVNob3dTaXplQ2hhbmdlfVxuICAgICAgLz5cbiAgICApIDogbnVsbDtcbiAgfVxuXG4gIC8vIEdldCBwYWdpbmF0aW9uLCBmaWx0ZXJzLCBzb3J0ZXJcbiAgcHJlcGFyZVBhcmFtc0FyZ3VtZW50cyhzdGF0ZTogYW55KTogW1RhYmxlUGFnaW5hdGlvbkNvbmZpZyB8IGJvb2xlYW4sIHN0cmluZ1tdLCBPYmplY3QsIGFueVtdXSB7XG4gICAgY29uc3QgcGFnaW5hdGlvbiA9IHsgLi4uc3RhdGUucGFnaW5hdGlvbiB9O1xuICAgIC8vIHJlbW92ZSB1c2VsZXNzIGhhbmRsZSBmdW5jdGlvbiBpbiBUYWJsZS5vbkNoYW5nZVxuICAgIGRlbGV0ZSBwYWdpbmF0aW9uLm9uQ2hhbmdlO1xuICAgIGRlbGV0ZSBwYWdpbmF0aW9uLm9uU2hvd1NpemVDaGFuZ2U7XG4gICAgZGVsZXRlIHBhZ2luYXRpb24uc2hvd1RvdGFsO1xuICAgIGRlbGV0ZSBwYWdpbmF0aW9uLnNpemVDaGFuZ2VyT3B0aW9uVGV4dDtcbiAgICBjb25zdCBmaWx0ZXJzID0gc3RhdGUuZmlsdGVycztcbiAgICBjb25zdCBiYXJGaWx0ZXJzID0gc3RhdGUuYmFyRmlsdGVycztcbiAgICBjb25zdCBzb3J0ZXI6IGFueSA9IHt9O1xuICAgIGlmIChzdGF0ZS5zb3J0Q29sdW1uICYmIHN0YXRlLnNvcnRPcmRlcikge1xuICAgICAgc29ydGVyLmNvbHVtbiA9IHN0YXRlLnNvcnRDb2x1bW47XG4gICAgICBzb3J0ZXIub3JkZXIgPSBzdGF0ZS5zb3J0T3JkZXI7XG4gICAgICBzb3J0ZXIuZmllbGQgPSBzdGF0ZS5zb3J0Q29sdW1uLmRhdGFJbmRleDtcbiAgICAgIHNvcnRlci5jb2x1bW5LZXkgPSB0aGlzLmdldENvbHVtbktleShzdGF0ZS5zb3J0Q29sdW1uKTtcbiAgICB9XG4gICAgcmV0dXJuIFtwYWdpbmF0aW9uLCBmaWx0ZXJzLCBzb3J0ZXIsIGJhckZpbHRlcnNdO1xuICB9XG5cbiAgZmluZENvbHVtbihteUtleTogc3RyaW5nIHwgbnVtYmVyKTogQ29sdW1uUHJvcHM8VD4gfCB1bmRlZmluZWQge1xuICAgIGxldCBjb2x1bW47XG4gICAgdHJlZU1hcCh0aGlzLmNvbHVtbnMsIGMgPT4ge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29sdW1uS2V5KGMpID09PSBteUtleSkge1xuICAgICAgICBjb2x1bW4gPSBjO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb2x1bW47XG4gIH1cblxuICBnZXRDdXJyZW50UGFnZURhdGEoKSB7XG4gICAgbGV0IGRhdGEgPSB0aGlzLmdldExvY2FsRGF0YSgpO1xuICAgIGxldCBjdXJyZW50OiBudW1iZXI7XG4gICAgbGV0IHBhZ2VTaXplOiBudW1iZXI7XG4gICAgY29uc3QgeyBzdGF0ZSB9ID0gdGhpcztcbiAgICAvLyDlpoLmnpzmsqHmnInliIbpobXnmoTor53vvIzpu5jorqTlhajpg6jlsZXnpLpcbiAgICBpZiAoIXRoaXMuaGFzUGFnaW5hdGlvbigpKSB7XG4gICAgICBwYWdlU2l6ZSA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgICBjdXJyZW50ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZVNpemUgPSBzdGF0ZS5wYWdpbmF0aW9uLnBhZ2VTaXplIGFzIG51bWJlcjtcbiAgICAgIGN1cnJlbnQgPSB0aGlzLmdldE1heEN1cnJlbnQoc3RhdGUucGFnaW5hdGlvbi50b3RhbCB8fCBkYXRhLmxlbmd0aCkgYXMgbnVtYmVyO1xuICAgIH1cblxuICAgIC8vIOWIhumhtVxuICAgIC8vIC0tLVxuICAgIC8vIOW9k+aVsOaNrumHj+WwkeS6juetieS6juavj+mhteaVsOmHj+aXtu+8jOebtOaOpeiuvue9ruaVsOaNrlxuICAgIC8vIOWQpuWImei/m+ihjOivu+WPluWIhumhteaVsOaNrlxuICAgIGlmIChkYXRhLmxlbmd0aCA+IHBhZ2VTaXplIHx8IHBhZ2VTaXplID09PSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgICBkYXRhID0gZGF0YS5maWx0ZXIoKF8sIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIGkgPj0gKGN1cnJlbnQgLSAxKSAqIHBhZ2VTaXplICYmIGkgPCBjdXJyZW50ICogcGFnZVNpemU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBnZXRGbGF0RGF0YSgpIHtcbiAgICBjb25zdCB7IGNoaWxkcmVuQ29sdW1uTmFtZSB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gZmxhdEFycmF5KHRoaXMuZ2V0TG9jYWxEYXRhKCksIGNoaWxkcmVuQ29sdW1uTmFtZSk7XG4gIH1cblxuICBnZXRGbGF0Q3VycmVudFBhZ2VEYXRhKCkge1xuICAgIGNvbnN0IHsgY2hpbGRyZW5Db2x1bW5OYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBmbGF0QXJyYXkodGhpcy5nZXRDdXJyZW50UGFnZURhdGEoKSwgY2hpbGRyZW5Db2x1bW5OYW1lKTtcbiAgfVxuXG4gIHJlY3Vyc2l2ZVNvcnQoZGF0YTogVFtdLCBzb3J0ZXJGbjogKGE6IGFueSwgYjogYW55KSA9PiBudW1iZXIpOiBUW10ge1xuICAgIGNvbnN0IHsgY2hpbGRyZW5Db2x1bW5OYW1lID0gJ2NoaWxkcmVuJyB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gZGF0YS5zb3J0KHNvcnRlckZuKS5tYXAoKGl0ZW06IGFueSkgPT5cbiAgICAgIGl0ZW1bY2hpbGRyZW5Db2x1bW5OYW1lXVxuICAgICAgICA/IHtcbiAgICAgICAgICAgIC4uLml0ZW0sXG4gICAgICAgICAgICBbY2hpbGRyZW5Db2x1bW5OYW1lXTogdGhpcy5yZWN1cnNpdmVTb3J0KGl0ZW1bY2hpbGRyZW5Db2x1bW5OYW1lXSwgc29ydGVyRm4pLFxuICAgICAgICAgIH1cbiAgICAgICAgOiBpdGVtLFxuICAgICk7XG4gIH1cblxuICBnZXRMb2NhbERhdGEoKSB7XG4gICAgY29uc3QgeyBkYXRhU291cmNlLCBub0ZpbHRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoZGF0YVNvdXJjZSkge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgY29uc3QgeyBmaWx0ZXJzLCBiYXJGaWx0ZXJzIH0gPSBzdGF0ZTtcbiAgICAgIGxldCBkYXRhID0gZGF0YVNvdXJjZTtcbiAgICAgIC8vIOS8mOWMluacrOWcsOaOkuW6j1xuICAgICAgZGF0YSA9IGRhdGEuc2xpY2UoMCk7XG4gICAgICBjb25zdCBzb3J0ZXJGbiA9IHRoaXMuZ2V0U29ydGVyRm4oKTtcbiAgICAgIGlmIChzb3J0ZXJGbikge1xuICAgICAgICBkYXRhID0gdGhpcy5yZWN1cnNpdmVTb3J0KGRhdGEsIHNvcnRlckZuKTtcbiAgICAgIH1cbiAgICAgIGxldCBmaWx0ZXJlZERhdGEgPSBkYXRhO1xuICAgICAgLy8g562b6YCJXG4gICAgICBpZiAoZmlsdGVycykge1xuICAgICAgICBPYmplY3Qua2V5cyhmaWx0ZXJzKS5mb3JFYWNoKGNvbHVtbktleSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sID0gdGhpcy5maW5kQ29sdW1uKGNvbHVtbktleSkgYXMgYW55O1xuICAgICAgICAgIGlmICghY29sKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IGZpbHRlcnNbY29sdW1uS2V5XSB8fCBbXTtcbiAgICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB7IG9uRmlsdGVyLCBmaWx0ZXJzOiBjb2x1bW5GaWx0ZXJzIH0gPSBjb2w7XG4gICAgICAgICAgZmlsdGVyZWREYXRhID0gb25GaWx0ZXJcbiAgICAgICAgICAgID8gZmlsdGVyZWREYXRhLmZpbHRlcihyZWNvcmQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuc29tZSh2ID0+IG9uRmlsdGVyKHYsIHJlY29yZCwgY29sdW1uRmlsdGVycykpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiBmaWx0ZXJlZERhdGE7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJhckZpbHRlcnMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBpc09yID0gZmFsc2U7XG4gICAgICAgIGJhckZpbHRlcnMuZm9yRWFjaChmaWx0ZXIgPT4ge1xuICAgICAgICAgIGlmIChmaWx0ZXIgPT09IFZBTFVFX09SKSB7XG4gICAgICAgICAgICBpc09yID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIocmVjb3JkID0+XG4gICAgICAgICAgICAgIGlzT3JcbiAgICAgICAgICAgICAgICA/IGZpbHRlcmVkRGF0YS5pbmRleE9mKHJlY29yZCkgIT09IC0xIHx8IHRoaXMuZG9CYXJGaWx0ZXIoZmlsdGVyLCByZWNvcmQpXG4gICAgICAgICAgICAgICAgOiBmaWx0ZXJlZERhdGEuaW5kZXhPZihyZWNvcmQpICE9PSAtMSAmJiB0aGlzLmRvQmFyRmlsdGVyKGZpbHRlciwgcmVjb3JkKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpc09yID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChub0ZpbHRlcikge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWx0ZXJlZERhdGE7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGRvQmFyRmlsdGVyKGZpbHRlcjogYW55LCByZWNvcmQ6IFQpOiBib29sZWFuIHtcbiAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAhIWZpbmRDb2x1bW5CeUZpbHRlclZhbHVlPFQ+KHJlY29yZCwgZ2V0TGVhZkNvbHVtbnM8VD4odGhpcy5jb2x1bW5zKSwgZmlsdGVyKTtcbiAgICB9XG4gICAgY29uc3QgY29sdW1uS2V5ID0gT2JqZWN0LmtleXMoZmlsdGVyKVswXTtcbiAgICBjb25zdCBjb2wgPSB0aGlzLmZpbmRDb2x1bW4oY29sdW1uS2V5KTtcbiAgICBpZiAoIWNvbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IHsgb25GaWx0ZXIsIGZpbHRlcnMgfSA9IGNvbDtcbiAgICByZXR1cm4gIW9uRmlsdGVyIHx8IG9uRmlsdGVyKGZpbHRlcltjb2x1bW5LZXldLCByZWNvcmQsIGZpbHRlcnMpO1xuICB9XG5cbiAgY3JlYXRlQ29tcG9uZW50cyhjb21wb25lbnRzOiBUYWJsZUNvbXBvbmVudHMgPSB7fSwgcHJldkNvbXBvbmVudHM/OiBUYWJsZUNvbXBvbmVudHMpIHtcbiAgICBjb25zdCBib2R5Um93ID0gY29tcG9uZW50cyAmJiBjb21wb25lbnRzLmJvZHkgJiYgY29tcG9uZW50cy5ib2R5LnJvdztcbiAgICBjb25zdCBwcmVCb2R5Um93ID0gcHJldkNvbXBvbmVudHMgJiYgcHJldkNvbXBvbmVudHMuYm9keSAmJiBwcmV2Q29tcG9uZW50cy5ib2R5LnJvdztcbiAgICBpZiAoIXRoaXMuY29tcG9uZW50cyB8fCBib2R5Um93ICE9PSBwcmVCb2R5Um93KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudHMgPSB7IC4uLmNvbXBvbmVudHMgfTtcbiAgICAgIHRoaXMuY29tcG9uZW50cy5ib2R5ID0ge1xuICAgICAgICAuLi5jb21wb25lbnRzLmJvZHksXG4gICAgICAgIHJvdzogY3JlYXRlQm9keVJvdyhib2R5Um93KSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyVGFibGUgPSAoY29udGV4dExvY2FsZTogVGFibGVMb2NhbGUsIGxvYWRpbmc6IFNwaW5Qcm9wcyk6IFJlYWN0Tm9kZSA9PiB7XG4gICAgY29uc3QgeyBwcm9wcyB9ID0gdGhpcztcbiAgICBjb25zdCBsb2NhbGUgPSB7IC4uLmNvbnRleHRMb2NhbGUsIC4uLnByb3BzLmxvY2FsZSB9O1xuICAgIGNvbnN0IHtcbiAgICAgIGZpbHRlckJhck11bHRpcGxlLFxuICAgICAgZmlsdGVyQmFyUGxhY2Vob2xkZXIsXG4gICAgICBzaG93SGVhZGVyLFxuICAgICAgZmlsdGVyQmFyLFxuICAgICAgZGF0YVNvdXJjZSxcbiAgICAgIGZpbHRlcnMsXG4gICAgICBlbXB0eSxcbiAgICAgIC4uLnJlc3RQcm9wc1xuICAgIH0gPSBwcm9wcztcbiAgICBjb25zdCB7IGZpbHRlcnM6IGNvbHVtbkZpbHRlcnMgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gdGhpcy5nZXRQcmVmaXhDbHMoKTtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRDdXJyZW50UGFnZURhdGEoKTtcbiAgICBjb25zdCBleHBhbmRJY29uQXNDZWxsID0gcHJvcHMuZXhwYW5kZWRSb3dSZW5kZXIgJiYgcHJvcHMuZXhwYW5kSWNvbkFzQ2VsbCAhPT0gZmFsc2U7XG5cbiAgICBjb25zdCBjbGFzc1N0cmluZyA9IGNsYXNzTmFtZXMoe1xuICAgICAgW2Ake3ByZWZpeENsc30tJHtwcm9wcy5zaXplfWBdOiB0cnVlLFxuICAgICAgW2Ake3ByZWZpeENsc30tYm9yZGVyZWRgXTogcHJvcHMuYm9yZGVyZWQsXG4gICAgICBbYCR7cHJlZml4Q2xzfS1lbXB0eWBdOiAhZGF0YS5sZW5ndGgsXG4gICAgICBbYCR7cHJlZml4Q2xzfS13aXRob3V0LWNvbHVtbi1oZWFkZXJgXTogIXNob3dIZWFkZXIsXG4gICAgfSk7XG5cbiAgICBsZXQgY29sdW1ucyA9IHRoaXMucmVuZGVyUm93U2VsZWN0aW9uKGxvY2FsZSk7XG4gICAgY29sdW1ucyA9IHRoaXMucmVuZGVyQ29sdW1uc0Ryb3Bkb3duKGNvbHVtbnMsIGxvY2FsZSk7XG4gICAgY29sdW1ucyA9IGNvbHVtbnMubWFwKChjb2x1bW4sIGkpID0+IHtcbiAgICAgIGNvbnN0IG5ld0NvbHVtbiA9IHsgLi4uY29sdW1uIH07XG4gICAgICBuZXdDb2x1bW4ua2V5ID0gdGhpcy5nZXRDb2x1bW5LZXkobmV3Q29sdW1uLCBpKTtcbiAgICAgIHJldHVybiBuZXdDb2x1bW47XG4gICAgfSk7XG4gICAgY29sdW1ucyA9IHJlbW92ZUhpZGRlbkNvbHVtbnMoY29sdW1ucyk7XG5cbiAgICBsZXQgZXhwYW5kSWNvbkNvbHVtbkluZGV4ID0gY29sdW1uc1swXSAmJiBjb2x1bW5zWzBdLmtleSA9PT0gJ3NlbGVjdGlvbi1jb2x1bW4nID8gMSA6IDA7XG4gICAgaWYgKCdleHBhbmRJY29uQ29sdW1uSW5kZXgnIGluIHJlc3RQcm9wcykge1xuICAgICAgZXhwYW5kSWNvbkNvbHVtbkluZGV4ID0gcmVzdFByb3BzLmV4cGFuZEljb25Db2x1bW5JbmRleCBhcyBudW1iZXI7XG4gICAgfVxuXG4gICAgY29uc3QgdGFibGUgPSAoXG4gICAgICA8UmNUYWJsZVxuICAgICAgICBrZXk9XCJ0YWJsZVwiXG4gICAgICAgIHsuLi5yZXN0UHJvcHN9XG4gICAgICAgIG9uUm93PXt0aGlzLm9uUm93fVxuICAgICAgICBjb21wb25lbnRzPXt0aGlzLmNvbXBvbmVudHN9XG4gICAgICAgIHByZWZpeENscz17cHJlZml4Q2xzfVxuICAgICAgICBkYXRhPXtkYXRhfVxuICAgICAgICBjb2x1bW5zPXtjb2x1bW5zfVxuICAgICAgICBzaG93SGVhZGVyPXtzaG93SGVhZGVyfVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzU3RyaW5nfVxuICAgICAgICBleHBhbmRJY29uQ29sdW1uSW5kZXg9e2V4cGFuZEljb25Db2x1bW5JbmRleH1cbiAgICAgICAgZXhwYW5kSWNvbkFzQ2VsbD17ZXhwYW5kSWNvbkFzQ2VsbH1cbiAgICAgICAgZW1wdHlUZXh0PXshbG9hZGluZy5zcGlubmluZyAmJiAoZW1wdHkgfHwgbG9jYWxlLmVtcHR5VGV4dCl9XG4gICAgICAvPlxuICAgICk7XG4gICAgaWYgKGZpbHRlckJhcikge1xuICAgICAgY29uc3QgYmFyID0gKFxuICAgICAgICA8RmlsdGVyQmFyXG4gICAgICAgICAga2V5PVwiZmlsdGVyLWJhclwiXG4gICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e2ZpbHRlckJhclBsYWNlaG9sZGVyfVxuICAgICAgICAgIGNvbHVtbnM9e2dldExlYWZDb2x1bW5zKHRoaXMuY29sdW1ucyl9XG4gICAgICAgICAgb25GaWx0ZXJTZWxlY3RDaGFuZ2U9e3RoaXMuaGFuZGxlRmlsdGVyU2VsZWN0Q2hhbmdlfVxuICAgICAgICAgIG9uRmlsdGVyU2VsZWN0Q2xlYXI9e3RoaXMuaGFuZGxlRmlsdGVyU2VsZWN0Q2xlYXJ9XG4gICAgICAgICAgb25Db2x1bW5GaWx0ZXJDaGFuZ2U9e3RoaXMuaGFuZGxlQ29sdW1uRmlsdGVyQ2hhbmdlfVxuICAgICAgICAgIG9uRmlsdGVyPXt0aGlzLmhhbmRsZUZpbHRlcn1cbiAgICAgICAgICBkYXRhU291cmNlPXtkYXRhU291cmNlfVxuICAgICAgICAgIGZpbHRlcnM9e2ZpbHRlcnN9XG4gICAgICAgICAgY29sdW1uRmlsdGVycz17Y29sdW1uRmlsdGVyc31cbiAgICAgICAgICBtdWx0aXBsZT17ZmlsdGVyQmFyTXVsdGlwbGV9XG4gICAgICAgICAgZ2V0UG9wdXBDb250YWluZXI9e3RoaXMuZ2V0UG9wdXBDb250YWluZXJ9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgcmV0dXJuIFtiYXIsIHRhYmxlXTtcbiAgICB9XG4gICAgcmV0dXJuIHRhYmxlO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByb3BzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgc3R5bGUsIGNsYXNzTmFtZSB9ID0gcHJvcHM7XG4gICAgY29uc3QgcHJlZml4Q2xzID0gdGhpcy5nZXRQcmVmaXhDbHMoKTtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRDdXJyZW50UGFnZURhdGEoKTtcblxuICAgIGxldCBsb2FkaW5nID0gcHJvcHMubG9hZGluZyBhcyBTcGluUHJvcHM7XG4gICAgaWYgKHR5cGVvZiBsb2FkaW5nID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGxvYWRpbmcgPSB7XG4gICAgICAgIHNwaW5uaW5nOiBsb2FkaW5nLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZSA9IChcbiAgICAgIDxMb2NhbGVSZWNlaXZlciBjb21wb25lbnROYW1lPVwiVGFibGVcIiBkZWZhdWx0TG9jYWxlPXtkZWZhdWx0TG9jYWxlLlRhYmxlfT5cbiAgICAgICAge2xvY2FsZSA9PiB0aGlzLnJlbmRlclRhYmxlKGxvY2FsZSwgbG9hZGluZyl9XG4gICAgICA8L0xvY2FsZVJlY2VpdmVyPlxuICAgICk7XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBubyBwYWdpbmF0aW9uIG9yIG5vIGRhdGEsXG4gICAgLy8gdGhlIGhlaWdodCBvZiBzcGluIHNob3VsZCBkZWNyZWFzZSBieSBoYWxmIG9mIHBhZ2luYXRpb25cbiAgICBjb25zdCBwYWdpbmF0aW9uUGF0Y2hDbGFzcyA9XG4gICAgICB0aGlzLmhhc1BhZ2luYXRpb24oKSAmJiBkYXRhICYmIGRhdGEubGVuZ3RoICE9PSAwXG4gICAgICAgID8gYCR7cHJlZml4Q2xzfS13aXRoLXBhZ2luYXRpb25gXG4gICAgICAgIDogYCR7cHJlZml4Q2xzfS13aXRob3V0LXBhZ2luYXRpb25gO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKGAke3ByZWZpeENsc30td3JhcHBlcmAsIGNsYXNzTmFtZSl9XG4gICAgICAgIHN0eWxlPXtzdHlsZX1cbiAgICAgICAgcmVmPXt0aGlzLnNhdmVSZWZ9XG4gICAgICA+XG4gICAgICAgIDxTcGluXG4gICAgICAgICAgey4uLmxvYWRpbmd9XG4gICAgICAgICAgY2xhc3NOYW1lPXtsb2FkaW5nLnNwaW5uaW5nID8gYCR7cGFnaW5hdGlvblBhdGNoQ2xhc3N9ICR7cHJlZml4Q2xzfS1zcGluLWhvbGRlcmAgOiAnJ31cbiAgICAgICAgPlxuICAgICAgICAgIHt0aGlzLnJlbmRlclBhZ2luYXRpb24oJ3RvcCcpfVxuICAgICAgICAgIHt0YWJsZX1cbiAgICAgICAgICB7dGhpcy5yZW5kZXJQYWdpbmF0aW9uKCdib3R0b20nKX1cbiAgICAgICAgPC9TcGluPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9