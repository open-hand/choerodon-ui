import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import eq from 'lodash/eq';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import { getTranslateDOMPositionXY } from 'dom-lib/lib/transition/translateDOMPositionXY';
import { addStyle, getWidth, getHeight, WheelHandler, scrollLeft, scrollTop, on, getOffset, } from 'dom-lib';
import { toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import LocaleReceiver from 'choerodon-ui/lib/locale-provider/LocaleReceiver';
import defaultLocale from 'choerodon-ui/lib/locale-provider/default';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import TableContext from './TableContext';
import { SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT } from './constants';
import { getTotalByColumns, mergeCells, getUnhandledProps, defaultClassPrefix, toggleClass, flattenData, prefix, requestAnimationTimeout, cancelAnimationTimeout, isRTL, isNumberOrTrue, findRowKeys, findAllParents, shouldShowRowByExpanded, resetLeftForCells, } from './utils';
import ColumnGroup from './ColumnGroup';
import Column from './Column';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
const SORT_TYPE = {
    DESC: 'desc',
    ASC: 'asc',
};
export default class PerformanceTable extends React.Component {
    constructor(props) {
        super(props);
        this.translateDOMPositionXY = null;
        this.scrollListener = null;
        this.tableRows = {};
        this.mounted = false;
        this.disableEventsTimeoutId = null;
        this.scrollY = 0;
        this.scrollX = 0;
        this._cacheCells = null;
        this._cacheChildrenSize = 0;
        this._visibleRows = [];
        this.listenWheel = (deltaX, deltaY) => {
            this.handleWheel(deltaX, deltaY);
            this.scrollbarXRef.current?.onWheelScroll?.(deltaX);
            this.scrollbarYRef.current?.onWheelScroll?.(deltaY);
        };
        this.setOffsetByAffix = () => {
            const { affixHeader, affixHorizontalScrollbar } = this.props;
            const headerNode = this.headerWrapperRef?.current;
            if (isNumberOrTrue(affixHeader) && headerNode) {
                this.setState(() => ({ headerOffset: getOffset(headerNode) }));
            }
            const tableNode = this.tableRef?.current;
            if (isNumberOrTrue(affixHorizontalScrollbar) && tableNode) {
                this.setState(() => ({ tableOffset: getOffset(tableNode) }));
            }
        };
        this.handleWindowScroll = () => {
            const { affixHeader, affixHorizontalScrollbar } = this.props;
            if (isNumberOrTrue(affixHeader)) {
                this.affixTableHeader();
            }
            if (isNumberOrTrue(affixHorizontalScrollbar)) {
                this.affixHorizontalScrollbar();
            }
        };
        this.affixHorizontalScrollbar = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const windowHeight = getHeight(window);
            const height = this.getTableHeight();
            const { tableOffset, fixedHorizontalScrollbar } = this.state;
            const { affixHorizontalScrollbar } = this.props;
            const headerHeight = this.getTableHeaderHeight();
            const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
            const fixedScrollbar = 
            // @ts-ignore
            scrollY + windowHeight < height + (tableOffset.top + bottom) &&
                // @ts-ignore
                scrollY + windowHeight - headerHeight > tableOffset?.top + bottom;
            if (this.scrollbarXRef?.current?.barRef?.current &&
                fixedHorizontalScrollbar !== fixedScrollbar) {
                this.setState({ fixedHorizontalScrollbar: fixedScrollbar });
            }
        };
        this.affixTableHeader = () => {
            const { affixHeader } = this.props;
            const top = typeof affixHeader === 'number' ? affixHeader : 0;
            const { headerOffset, contentHeight } = this.state;
            const scrollY = window.scrollY || window.pageYOffset;
            const fixedHeader = 
            // @ts-ignore
            scrollY - (headerOffset.top - top) >= 0 && scrollY < headerOffset.top - top + contentHeight;
            if (this.affixHeaderWrapperRef.current) {
                toggleClass(this.affixHeaderWrapperRef.current, 'fixed', fixedHeader);
            }
        };
        this.handleSortColumn = (dataKey) => {
            let sortType = this.getSortType();
            if (this.props.sortColumn === dataKey) {
                sortType =
                    sortType === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC;
                this.setState({ sortType });
            }
            this.props.onSortColumn?.(dataKey, sortType);
        };
        this.handleColumnResizeEnd = (columnWidth, _cursorDelta, dataKey, index) => {
            this._cacheCells = null;
            this.setState({ isColumnResizing: false, [`${dataKey}_${index}_width`]: columnWidth });
            addStyle(this.mouseAreaRef.current, { display: 'none' });
        };
        this.handleColumnResizeStart = (width, left, fixed) => {
            this.setState({ isColumnResizing: true });
            this.handleColumnResizeMove(width, left, fixed);
        };
        this.handleColumnResizeMove = (width, left, fixed) => {
            let mouseAreaLeft = width + left;
            let x = mouseAreaLeft;
            let dir = 'left';
            if (this.isRTL()) {
                mouseAreaLeft += this.minScrollX + SCROLLBAR_WIDTH;
                dir = 'right';
            }
            if (!fixed) {
                x = mouseAreaLeft + (this.isRTL() ? -this.scrollX : this.scrollX);
            }
            addStyle(this.mouseAreaRef.current, { display: 'block', [dir]: `${x}px` });
        };
        this.handleTreeToggle = (rowKey, _rowIndex, rowData) => {
            const expandedRowKeys = this.getExpandedRowKeys();
            let open = false;
            const nextExpandedRowKeys = [];
            for (let i = 0; i < expandedRowKeys.length; i++) {
                const key = expandedRowKeys[i];
                if (key === rowKey) {
                    open = true;
                }
                else {
                    // @ts-ignore
                    nextExpandedRowKeys.push(key);
                }
            }
            if (!open) {
                // @ts-ignore
                nextExpandedRowKeys.push(rowKey);
            }
            this.setState({ expandedRowKeys: nextExpandedRowKeys });
            this.props.onExpandChange?.(!open, rowData);
        };
        this.handleScrollX = (delta) => {
            this.handleWheel(delta, 0);
        };
        this.handleScrollY = (delta) => {
            this.handleWheel(0, delta);
        };
        this.handleWheel = (deltaX, deltaY) => {
            const { onScroll, virtualized } = this.props;
            const { contentWidth, width } = this.state;
            if (!this.tableRef.current) {
                return;
            }
            const nextScrollX = contentWidth <= width ? 0 : this.scrollX - deltaX;
            const nextScrollY = this.scrollY - deltaY;
            this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
            this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
            this.updatePosition();
            onScroll?.(this.scrollX, this.scrollY);
            if (virtualized) {
                this.setState({
                    isScrolling: true,
                    scrollY: this.scrollY,
                });
                if (this.disableEventsTimeoutId) {
                    // @ts-ignore
                    cancelAnimationTimeout(this.disableEventsTimeoutId);
                }
                // @ts-ignore
                this.disableEventsTimeoutId = requestAnimationTimeout(this.debounceScrollEndedCallback, 150);
            }
        };
        this.debounceScrollEndedCallback = () => {
            this.disableEventsTimeoutId = null;
            this.setState({
                isScrolling: false,
            });
        };
        // 处理移动端 Touch 事件,  Start 的时候初始化 x,y
        this.handleTouchStart = (event) => {
            if (event.touches) {
                const { pageX, pageY } = event.touches[0];
                this.touchX = pageX;
                this.touchY = pageY;
            }
            this.props.onTouchStart?.(event);
        };
        // 处理移动端 Touch 事件, Move 的时候初始化，更新 scroll
        this.handleTouchMove = (event) => {
            const { autoHeight } = this.props;
            if (event.touches) {
                const { pageX, pageY } = event.touches[0];
                const deltaX = this.touchX - pageX;
                const deltaY = autoHeight ? 0 : this.touchY - pageY;
                if (!this.shouldHandleWheelY(deltaY) && !this.shouldHandleWheelX(deltaX)) {
                    return;
                }
                event.preventDefault?.();
                this.handleWheel(deltaX, deltaY);
                this.scrollbarXRef.current?.onWheelScroll?.(deltaX);
                this.scrollbarYRef.current?.onWheelScroll?.(deltaY);
                this.touchX = pageX;
                this.touchY = pageY;
            }
            this.props.onTouchMove?.(event);
        };
        /**
         * 当用户在 Table 内使用 tab 键，触发了 onScroll 事件，这个时候应该更新滚动条位置
         * https://github.com/rsuite/rsuite/issues/234
         */
        this.handleBodyScroll = (event) => {
            if (event.target !== this.tableBodyRef.current) {
                return;
            }
            const left = scrollLeft(event.target);
            const top = scrollTop(event.target);
            if (top === 0 && left === 0) {
                return;
            }
            this.listenWheel(left, top);
            scrollLeft(event.target, 0);
            scrollTop(event.target, 0);
        };
        this.shouldHandleWheelX = (delta) => {
            const { disabledScroll, loading } = this.props;
            if (delta === 0 || disabledScroll || loading) {
                return false;
            }
            return true;
        };
        this.shouldHandleWheelY = (delta) => {
            const { disabledScroll, loading } = this.props;
            if (delta === 0 || disabledScroll || loading) {
                return false;
            }
            return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
        };
        // @ts-ignore
        this.addPrefix = (name) => prefix(this.props.classPrefix)(name);
        this.calculateTableWidth = () => {
            const table = this.tableRef?.current;
            const { width } = this.state;
            if (table) {
                const nextWidth = getWidth(table);
                if (width !== nextWidth) {
                    this.scrollX = 0;
                    this.scrollbarXRef?.current?.resetScrollBarPosition();
                }
                this._cacheCells = null;
                this.setState({ width: nextWidth });
            }
            this.setOffsetByAffix();
        };
        /**
         * public method
         */
        this.scrollTop = (top = 0) => {
            const [scrollY, handleScrollY] = this.getControlledScrollTopValue(top);
            this.scrollY = scrollY;
            this.scrollbarYRef?.current?.resetScrollBarPosition?.(handleScrollY);
            this.updatePosition();
            /**
             * 当开启 virtualized，调用 scrollTop 后会出现白屏现象，
             * 原因是直接操作 DOM 的坐标，但是组件没有重新渲染，需要调用 forceUpdate 重新进入 render。
             * Fix: rsuite#1044
             */
            if (this.props.virtualized && this.state.contentHeight > this.props.height) {
                this.forceUpdate();
            }
        };
        // public method
        this.scrollLeft = (left = 0) => {
            const [scrollX, handleScrollX] = this.getControlledScrollLeftValue(left);
            this.scrollX = scrollX;
            this.scrollbarXRef?.current?.resetScrollBarPosition?.(handleScrollX);
            this.updatePosition();
        };
        this.scrollTo = (coord) => {
            const { x, y } = coord || {};
            if (typeof x === 'number') {
                this.scrollLeft(x);
            }
            if (typeof y === 'number') {
                this.scrollTop(y);
            }
        };
        this.bindTableRowsRef = (index, rowData) => (ref) => {
            if (ref) {
                this.tableRows[index] = [ref, rowData];
            }
        };
        this.bindRowClick = (rowData) => {
            return (event) => {
                this.props.onRowClick?.(rowData, event);
            };
        };
        this.bindRowContextMenu = (rowData) => {
            return (event) => {
                this.props.onRowContextMenu?.(rowData, event);
            };
        };
        const { width, data, rowKey, defaultExpandAllRows, renderRowExpanded, defaultExpandedRowKeys, children = [], columns = [], isTree, defaultSortType, } = props;
        const expandedRowKeys = defaultExpandAllRows
            ? findRowKeys(data, rowKey, isFunction(renderRowExpanded))
            : defaultExpandedRowKeys || [];
        let shouldFixedColumn = Array.from(children).some((child) => child && child.props && child.props.fixed);
        if (columns && columns.length) {
            shouldFixedColumn = Array.from(columns).some((child) => child && child.fixed);
        }
        if (isTree && !rowKey) {
            throw new Error('The `rowKey` is required when set isTree');
        }
        this.state = {
            expandedRowKeys,
            shouldFixedColumn,
            cacheData: data,
            data: isTree ? flattenData(data) : data,
            width: width || 0,
            columnWidth: 0,
            dataKey: 0,
            contentHeight: 0,
            contentWidth: 0,
            tableRowsMaxHeight: [],
            sortType: defaultSortType,
            scrollY: 0,
            isScrolling: false,
            fixedHeader: false,
        };
        this.scrollY = 0;
        this.scrollX = 0;
        this.wheelHandler = new WheelHandler(this.listenWheel, this.shouldHandleWheelX, this.shouldHandleWheelY, false);
        this._cacheChildrenSize = flatten(children || columns).length;
        this.translateDOMPositionXY = getTranslateDOMPositionXY({
            enable3DTransform: props.translate3d,
        });
        this.tableRef = React.createRef();
        this.scrollbarYRef = React.createRef();
        this.scrollbarXRef = React.createRef();
        this.tableBodyRef = React.createRef();
        this.affixHeaderWrapperRef = React.createRef();
        this.mouseAreaRef = React.createRef();
        this.headerWrapperRef = React.createRef();
        this.wheelWrapperRef = React.createRef();
        this.tableHeaderRef = React.createRef();
    }
    static getDerivedStateFromProps(props, state) {
        if (props.data !== state.cacheData) {
            return {
                cacheData: props.data,
                data: props.isTree ? flattenData(props.data) : props.data,
            };
        }
        return null;
    }
    componentDidMount() {
        this.calculateTableWidth();
        this.calculateTableContextHeight();
        this.calculateRowMaxHeight();
        this.setOffsetByAffix();
        this.initPosition();
        bindElementResize(this.tableRef.current, debounce(this.calculateTableWidth, 400));
        const options = { passive: false };
        const tableBody = this.tableBodyRef.current;
        if (tableBody) {
            this.wheelListener = on(tableBody, 'wheel', this.wheelHandler.onWheel, options);
            this.touchStartListener = on(tableBody, 'touchstart', this.handleTouchStart, options);
            this.touchMoveListener = on(tableBody, 'touchmove', this.handleTouchMove, options);
        }
        const { affixHeader, affixHorizontalScrollbar } = this.props;
        if (isNumberOrTrue(affixHeader) || isNumberOrTrue(affixHorizontalScrollbar)) {
            this.scrollListener = on(window, 'scroll', this.handleWindowScroll);
        }
        this.props?.bodyRef?.(this.wheelWrapperRef.current);
    }
    shouldComponentUpdate(nextProps, nextState) {
        const _cacheChildrenSize = flatten((nextProps.children || nextProps.columns) || []).length;
        /**
         * 单元格列的信息在初始化后会被缓存，在某些属性被更新以后，需要清除缓存。
         */
        if (_cacheChildrenSize !== this._cacheChildrenSize) {
            this._cacheChildrenSize = _cacheChildrenSize;
            this._cacheCells = null;
        }
        else if (this.props.children !== nextProps.children ||
            this.props.columns !== nextProps.columns ||
            this.props.sortColumn !== nextProps.sortColumn ||
            this.props.sortType !== nextProps.sortType) {
            this._cacheCells = null;
        }
        return !eq(this.props, nextProps) || !isEqual(this.state, nextState);
    }
    componentDidUpdate(prevProps) {
        this.calculateTableContextHeight(prevProps);
        this.calculateTableContentWidth(prevProps);
        this.calculateRowMaxHeight();
        if (prevProps.data !== this.props.data) {
            this.props.onDataUpdated?.(this.props.data, this.scrollTo);
            if (this.props.shouldUpdateScroll) {
                this.scrollTo({ x: 0, y: 0 });
            }
        }
        else {
            this.updatePosition();
        }
    }
    componentWillUnmount() {
        this.wheelHandler = null;
        if (this.tableRef.current) {
            unbindElementResize(this.tableRef.current);
        }
        this.wheelListener?.off();
        this.touchStartListener?.off();
        this.touchMoveListener?.off();
        this.scrollListener?.off();
    }
    getExpandedRowKeys() {
        const { expandedRowKeys } = this.props;
        return typeof expandedRowKeys === 'undefined' ? this.state.expandedRowKeys : expandedRowKeys;
    }
    getSortType() {
        const { sortType } = this.props;
        return typeof sortType === 'undefined' ? this.state.sortType : sortType;
    }
    getScrollCellGroups() {
        return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
    }
    getFixedLeftCellGroups() {
        return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
    }
    getFixedRightCellGroups() {
        return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
    }
    isRTL() {
        return this.props.rtl || isRTL();
    }
    getRowHeight(rowData = {}) {
        const { rowHeight } = this.props;
        return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
    }
    /**
     * 获取表头高度
     */
    getTableHeaderHeight() {
        const { headerHeight, showHeader } = this.props;
        return showHeader ? headerHeight : 0;
    }
    /**
     * 获取 Table 需要渲染的高度
     */
    getTableHeight() {
        const { contentHeight } = this.state;
        const { minHeight, height, autoHeight, data } = this.props;
        const headerHeight = this.getTableHeaderHeight();
        if (data.length === 0 && autoHeight) {
            return height;
        }
        return autoHeight ? Math.max(headerHeight + contentHeight, minHeight) : height;
    }
    /**
     * 处理 column props
     * @param column
     */
    getColumnProps(column) {
        return omit(column, ['title', 'dataIndex', 'key', 'render']);
    }
    /**
     * 处理columns json -> reactNode
     * @param columns
     */
    processTableColumns(columns) {
        return columns && columns.map((column) => {
            const dataKey = column.dataIndex;
            if (column.type === 'ColumnGroup') {
                return React.createElement(ColumnGroup, Object.assign({}, this.getColumnProps(column)), this.processTableColumns(column.children));
            }
            return (
            // @ts-ignore
            React.createElement(Column, Object.assign({}, this.getColumnProps(column), { dataKey: dataKey }),
                // @ts-ignore
                React.createElement(HeaderCell, null, isFunction(column.title) ? column.title() : column.title),
                typeof column.render === 'function' ? (
                // @ts-ignore
                React.createElement(Cell, { dataKey: dataKey }, (rowData, rowIndex) => column.render({ rowData, rowIndex, dataIndex: dataKey }))
                // @ts-ignore
                ) : React.createElement(Cell, { dataKey: dataKey })));
        });
    }
    /**
     * 获取 columns ReactElement 数组
     * - 处理 children 中存在 <Column> 数组的情况
     * - 过滤 children 中的空项
     */
    getTableColumns() {
        const { columns } = this.props;
        let children = this.props.children;
        if (columns && columns.length) {
            children = this.processTableColumns(columns);
        }
        if (!Array.isArray(children)) {
            return children;
        }
        const flattenColumns = children.map((column) => {
            if (column?.type === ColumnGroup) {
                const { header, children: childColumns, align, fixed, verticalAlign } = column?.props;
                return childColumns.map((childColumn, index) => {
                    // 把 ColumnGroup 设置的属性覆盖到 Column
                    const groupCellProps = {
                        align,
                        fixed,
                        verticalAlign,
                    };
                    /**
                     * 为分组中的第一列设置属性:
                     * groupCount: 分组子项个数
                     * groupHeader: 分组标题
                     * resizable: 设置为不可自定义列宽
                     */
                    if (index === 0) {
                        groupCellProps.groupCount = childColumns.length;
                        groupCellProps.groupHeader = header;
                        groupCellProps.resizable = false;
                    }
                    return React.cloneElement(childColumn, groupCellProps);
                });
            }
            return column;
        });
        // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。
        return flatten(flattenColumns).filter(col => col);
    }
    getCellDescriptor() {
        if (this._cacheCells) {
            return this._cacheCells;
        }
        let hasCustomTreeCol = false;
        let left = 0; // Cell left margin
        const headerCells = []; // Table header cell
        const bodyCells = []; // Table body cell
        const { children, columns: columnsJson } = this.props;
        let columnHack = children;
        if (columnsJson && columnsJson.length) {
            columnHack = columnsJson;
        }
        if (!columnHack) {
            this._cacheCells = {
                headerCells,
                bodyCells,
                hasCustomTreeCol,
                allColumnsWidth: left,
            };
            return this._cacheCells;
        }
        const columns = this.getTableColumns();
        const { width: tableWidth } = this.state;
        const { sortColumn, rowHeight, showHeader } = this.props;
        const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);
        const headerHeight = this.getTableHeaderHeight();
        React.Children.forEach(columns, (column, index) => {
            if (React.isValidElement(column)) {
                const columnChildren = column.props.children;
                const { width, resizable, flexGrow, minWidth, onResize, treeCol } = column.props;
                if (treeCol) {
                    hasCustomTreeCol = true;
                }
                if (resizable && flexGrow) {
                    console.warn(`Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`);
                }
                if (columnChildren.length !== 2) {
                    throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
                }
                let nextWidth = this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;
                if (tableWidth && flexGrow && totalFlexGrow) {
                    nextWidth = Math.max(((tableWidth - totalWidth) / totalFlexGrow) * flexGrow, minWidth || 60);
                }
                const cellProps = {
                    ...omit(column.props, ['children']),
                    left,
                    index,
                    headerHeight,
                    key: index,
                    width: nextWidth,
                    height: rowHeight,
                    firstColumn: index === 0,
                    lastColumn: index === columns.length - 1,
                };
                if (showHeader && headerHeight) {
                    const headerCellProps = {
                        dataKey: columnChildren[1].props.dataKey,
                        isHeaderCell: true,
                        sortable: column.props.sortable,
                        onSortColumn: this.handleSortColumn,
                        sortType: this.getSortType(),
                        sortColumn,
                        flexGrow,
                    };
                    if (resizable) {
                        merge(headerCellProps, {
                            onResize,
                            onColumnResizeEnd: this.handleColumnResizeEnd,
                            onColumnResizeStart: this.handleColumnResizeStart,
                            onColumnResizeMove: this.handleColumnResizeMove,
                        });
                    }
                    headerCells.push(
                    // @ts-ignore
                    React.cloneElement(columnChildren[0], { ...cellProps, ...headerCellProps }));
                }
                // @ts-ignore
                bodyCells.push(React.cloneElement(columnChildren[1], cellProps));
                left += nextWidth;
            }
        });
        return (this._cacheCells = {
            headerCells,
            bodyCells,
            allColumnsWidth: left,
            hasCustomTreeCol,
        });
    }
    initPosition() {
        if (this.isRTL()) {
            setTimeout(() => {
                const { contentWidth, width } = this.state;
                this.scrollX = width - contentWidth - SCROLLBAR_WIDTH;
                this.updatePosition();
                this.scrollbarXRef?.current?.resetScrollBarPosition?.(-this.scrollX);
            }, 0);
        }
    }
    updatePosition() {
        /**
         * 当存在锁定列情况处理
         */
        if (this.state.shouldFixedColumn) {
            this.updatePositionByFixedCell();
        }
        else {
            const wheelStyle = {};
            const headerStyle = {};
            // @ts-ignore
            this.translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
            // @ts-ignore
            this.translateDOMPositionXY(headerStyle, this.scrollX, 0);
            const wheelElement = this.wheelWrapperRef?.current;
            const headerElement = this.headerWrapperRef?.current;
            const affixHeaderElement = this.affixHeaderWrapperRef?.current;
            wheelElement && addStyle(wheelElement, wheelStyle);
            headerElement && addStyle(headerElement, headerStyle);
            if (affixHeaderElement?.hasChildNodes?.()) {
                addStyle(affixHeaderElement.firstChild, headerStyle);
            }
        }
        if (this.tableHeaderRef?.current) {
            toggleClass(this.tableHeaderRef.current, this.addPrefix('cell-group-shadow'), this.scrollY < 0);
        }
    }
    updatePositionByFixedCell() {
        const wheelGroupStyle = {};
        const wheelStyle = {};
        const scrollGroups = this.getScrollCellGroups();
        const fixedLeftGroups = this.getFixedLeftCellGroups();
        const fixedRightGroups = this.getFixedRightCellGroups();
        const { contentWidth, width } = this.state;
        // @ts-ignore
        this.translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
        // @ts-ignore
        this.translateDOMPositionXY(wheelStyle, 0, this.scrollY);
        const scrollArrayGroups = Array.from(scrollGroups);
        for (let i = 0; i < scrollArrayGroups.length; i++) {
            const group = scrollArrayGroups[i];
            addStyle(group, wheelGroupStyle);
        }
        if (this.wheelWrapperRef?.current) {
            addStyle(this.wheelWrapperRef.current, wheelStyle);
        }
        const leftShadowClassName = this.addPrefix('cell-group-left-shadow');
        const rightShadowClassName = this.addPrefix('cell-group-right-shadow');
        const showLeftShadow = this.scrollX < 0;
        const showRightShadow = width - contentWidth - SCROLLBAR_WIDTH !== this.scrollX;
        toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
        toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
    }
    shouldRenderExpandedRow(rowData) {
        const { rowKey, renderRowExpanded, isTree } = this.props;
        const expandedRowKeys = this.getExpandedRowKeys() || [];
        return (isFunction(renderRowExpanded) &&
            !isTree &&
            expandedRowKeys.some(key => key === rowData[rowKey]));
    }
    calculateRowMaxHeight() {
        const { wordWrap } = this.props;
        if (wordWrap) {
            const tableRowsMaxHeight = [];
            const tableRows = Object.values(this.tableRows);
            for (let i = 0; i < tableRows.length; i++) {
                const [row] = tableRows[i];
                if (row) {
                    const cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
                    const cellArray = Array.from(cells);
                    let maxHeight = 0;
                    for (let j = 0; j < cellArray.length; j++) {
                        const cell = cellArray[j];
                        const h = getHeight(cell);
                        maxHeight = Math.max(maxHeight, h);
                    }
                    // @ts-ignore
                    tableRowsMaxHeight.push(maxHeight);
                }
            }
            this.setState({ tableRowsMaxHeight });
        }
    }
    calculateTableContentWidth(prevProps) {
        const table = this.tableRef?.current;
        const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
        const contentWidth = row ? getWidth(row) : 0;
        this.setState({ contentWidth });
        // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
        this.minScrollX = -(contentWidth - this.state.width) - SCROLLBAR_WIDTH;
        /**
         * 1.判断 Table 列数是否发生变化
         * 2.判断 Table 内容区域是否宽度有变化
         *
         * 满足 1 和 2 则更新横向滚动条位置
         */
        if (flatten(this.props.children).length !==
            flatten(prevProps.children).length &&
            this.state.contentWidth !== contentWidth) {
            this.scrollLeft(0);
        }
    }
    calculateTableContextHeight(prevProps) {
        const table = this.tableRef.current;
        const rows = table.querySelectorAll(`.${this.addPrefix('row')}`) || [];
        const { height, autoHeight, rowHeight } = this.props;
        const headerHeight = this.getTableHeaderHeight();
        const contentHeight = rows.length
            ? Array.from(rows)
                .map(row => getHeight(row) || rowHeight)
                .reduce((x, y) => x + y)
            : 0;
        const nextContentHeight = contentHeight - headerHeight;
        if (nextContentHeight !== this.state.contentHeight) {
            this.setState({ contentHeight: nextContentHeight });
        }
        if (prevProps &&
            // 当 data 更新，或者表格高度更新，则更新滚动条
            (prevProps.height !== height || prevProps.data !== this.props.data) &&
            this.scrollY !== 0) {
            this.scrollTop(Math.abs(this.scrollY));
            this.updatePosition();
        }
        if (!autoHeight) {
            // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
            this.minScrollY = -(contentHeight - height) - SCROLLBAR_WIDTH;
        }
        // 如果内容区域的高度小于表格的高度，则重置 Y 坐标滚动条
        if (contentHeight < height) {
            this.scrollTop(0);
        }
        // 如果 scrollTop 的值大于可以滚动的范围 ，则重置 Y 坐标滚动条
        // 当 Table 为 virtualized 时， wheel 事件触发每次都会进入该逻辑， 避免在滚动到底部后滚动条重置, +SCROLLBAR_WIDTH
        if (Math.abs(this.scrollY) + height - headerHeight > nextContentHeight + SCROLLBAR_WIDTH) {
            this.scrollTop(this.scrollY);
        }
    }
    getControlledScrollTopValue(value) {
        if (this.props.autoHeight) {
            return [0, 0];
        }
        const { contentHeight } = this.state;
        const headerHeight = this.getTableHeaderHeight();
        const height = this.getTableHeight();
        // 滚动值的最大范围判断
        value = Math.min(value, Math.max(0, contentHeight - (height - headerHeight)));
        // value 值是表格理论滚动位置的一个值，通过 value 计算出 scrollY 坐标值与滚动条位置的值
        return [-value, (value / contentHeight) * (height - headerHeight)];
    }
    getControlledScrollLeftValue(value) {
        const { contentWidth, width } = this.state;
        // 滚动值的最大范围判断
        value = Math.min(value, Math.max(0, contentWidth - width));
        return [-value, (value / contentWidth) * width];
    }
    renderRowData(bodyCells, rowData, props, shouldRenderExpandedRow) {
        const { renderTreeToggle, rowKey, wordWrap, isTree } = this.props;
        const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
        const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;
        const rowProps = {
            ...props,
            // @ts-ignore
            rowRef: this.bindTableRowsRef(props.key, rowData),
            onClick: this.bindRowClick(rowData),
            onContextMenu: this.bindRowContextMenu(rowData),
        };
        const expandedRowKeys = this.getExpandedRowKeys() || [];
        const expanded = expandedRowKeys.some(key => key === rowData[rowKey]);
        const cells = [];
        for (let i = 0; i < bodyCells.length; i++) {
            const cell = bodyCells[i];
            cells.push(
            // @ts-ignore
            React.cloneElement(cell, {
                hasChildren,
                rowData,
                wordWrap,
                renderTreeToggle,
                height: props.height,
                rowIndex: props.key,
                depth: props.depth,
                onTreeToggle: this.handleTreeToggle,
                rowKey: nextRowKey,
                expanded,
            }));
        }
        return this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
    }
    renderRow(props, cells, shouldRenderExpandedRow, rowData) {
        const { rowClassName } = this.props;
        const { shouldFixedColumn, width, contentWidth } = this.state;
        if (typeof rowClassName === 'function') {
            props.className = rowClassName(rowData);
        }
        else {
            props.className = rowClassName;
        }
        const rowStyles = {};
        let rowRight = 0;
        if (this.isRTL() && contentWidth > width) {
            rowRight = width - contentWidth;
            rowStyles.right = rowRight;
        }
        // IF there are fixed columns, add a fixed group
        if (shouldFixedColumn && contentWidth > width) {
            const fixedLeftCells = [];
            const fixedRightCells = [];
            const scrollCells = [];
            let fixedLeftCellGroupWidth = 0;
            let fixedRightCellGroupWidth = 0;
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                const { fixed, width } = cell.props;
                let isFixedStart = fixed === 'left' || fixed === true;
                let isFixedEnd = fixed === 'right';
                if (this.isRTL()) {
                    isFixedStart = fixed === 'right';
                    isFixedEnd = fixed === 'left' || fixed === true;
                }
                if (isFixedStart) {
                    // @ts-ignore
                    fixedLeftCells.push(cell);
                    fixedLeftCellGroupWidth += width;
                }
                else if (isFixedEnd) {
                    // @ts-ignore
                    fixedRightCells.push(cell);
                    fixedRightCellGroupWidth += width;
                }
                else {
                    // @ts-ignore
                    scrollCells.push(cell);
                }
            }
            return (React.createElement(Row, Object.assign({}, props, { style: rowStyles }),
                fixedLeftCellGroupWidth ? (React.createElement(CellGroup, { fixed: "left", height: props.isHeaderRow ? props.headerHeight : props.height, width: fixedLeftCellGroupWidth, 
                    // @ts-ignore
                    style: this.isRTL() ? { right: width - fixedLeftCellGroupWidth - rowRight } : null }, mergeCells(resetLeftForCells(fixedLeftCells)))) : null,
                React.createElement(CellGroup, null, mergeCells(scrollCells)),
                fixedRightCellGroupWidth ? (React.createElement(CellGroup, { fixed: "right", style: this.isRTL()
                        ? { right: 0 - rowRight - SCROLLBAR_WIDTH }
                        : { left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }, height: props.isHeaderRow ? props.headerHeight : props.height, width: fixedRightCellGroupWidth }, mergeCells(resetLeftForCells(fixedRightCells)))) : null,
                shouldRenderExpandedRow && this.renderRowExpanded(rowData)));
        }
        return (React.createElement(Row, Object.assign({}, props, { style: rowStyles }),
            React.createElement(CellGroup, null, mergeCells(cells)),
            shouldRenderExpandedRow && this.renderRowExpanded(rowData)));
    }
    renderRowExpanded(rowData) {
        const { renderRowExpanded, rowExpandedHeight } = this.props;
        const styles = { height: rowExpandedHeight };
        if (typeof renderRowExpanded === 'function') {
            return (React.createElement("div", { className: this.addPrefix('row-expanded'), style: styles }, renderRowExpanded(rowData)));
        }
        return null;
    }
    renderMouseArea() {
        const headerHeight = this.getTableHeaderHeight();
        const styles = { height: this.getTableHeight() };
        const spanStyles = { height: headerHeight - 1 };
        return (React.createElement("div", { ref: this.mouseAreaRef, className: this.addPrefix('mouse-area'), style: styles },
            React.createElement("span", { style: spanStyles })));
    }
    renderTableHeader(headerCells, rowWidth) {
        const { affixHeader } = this.props;
        const { width: tableWidth } = this.state;
        const top = typeof affixHeader === 'number' ? affixHeader : 0;
        const headerHeight = this.getTableHeaderHeight();
        const rowProps = {
            rowRef: this.tableHeaderRef,
            width: rowWidth,
            height: this.getRowHeight(),
            headerHeight,
            isHeaderRow: true,
            top: 0,
        };
        const fixedStyle = {
            position: 'fixed',
            overflow: 'hidden',
            height: this.getTableHeaderHeight(),
            width: tableWidth,
            top,
        };
        // Affix header
        const header = (React.createElement("div", { className: classNames(this.addPrefix('affix-header')), style: fixedStyle, ref: this.affixHeaderWrapperRef }, this.renderRow(rowProps, headerCells)));
        return (React.createElement(React.Fragment, null,
            (affixHeader === 0 || affixHeader) && header,
            React.createElement("div", { className: this.addPrefix('header-row-wrapper'), ref: this.headerWrapperRef }, this.renderRow(rowProps, headerCells))));
    }
    renderTableBody(bodyCells, rowWidth) {
        const { rowExpandedHeight, renderRowExpanded, isTree, rowKey, wordWrap, virtualized, rowHeight, } = this.props;
        const headerHeight = this.getTableHeaderHeight();
        const { tableRowsMaxHeight, isScrolling, data } = this.state;
        const height = this.getTableHeight();
        const bodyHeight = height - headerHeight;
        const bodyStyles = {
            top: headerHeight,
            height: bodyHeight,
        };
        let contentHeight = 0;
        let topHideHeight = 0;
        let bottomHideHeight = 0;
        this._visibleRows = [];
        if (data) {
            let top = 0; // Row position
            const minTop = Math.abs(this.scrollY);
            // @ts-ignore
            const maxTop = minTop + height + rowExpandedHeight;
            const isCustomRowHeight = typeof rowHeight === 'function';
            const isUncertainHeight = !!(renderRowExpanded || isCustomRowHeight || isTree);
            /**
             如果开启了 virtualized  同时 Table 中的的行高是可变的，
             则需要循环遍历 data, 获取每一行的高度。
             */
            if ((isUncertainHeight && virtualized) || !virtualized) {
                for (let index = 0; index < data.length; index++) {
                    const rowData = data[index];
                    const maxHeight = tableRowsMaxHeight[index];
                    const shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);
                    let nextRowHeight = 0;
                    let depth = 0;
                    if (typeof rowHeight === 'function') {
                        nextRowHeight = rowHeight(rowData);
                    }
                    else {
                        nextRowHeight = maxHeight
                            ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight)
                            : rowHeight;
                        if (shouldRenderExpandedRow) {
                            // @ts-ignore
                            nextRowHeight += rowExpandedHeight;
                        }
                    }
                    if (isTree) {
                        const parents = findAllParents(rowData, rowKey);
                        const expandedRowKeys = this.getExpandedRowKeys();
                        depth = parents.length;
                        // 树节点如果被关闭，则不渲染
                        // @ts-ignore
                        if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
                            continue;
                        }
                    }
                    contentHeight += nextRowHeight;
                    const rowProps = {
                        key: index,
                        top,
                        width: rowWidth,
                        depth,
                        height: nextRowHeight,
                    };
                    top += nextRowHeight;
                    if (virtualized && !wordWrap) {
                        if (top + nextRowHeight < minTop) {
                            topHideHeight += nextRowHeight;
                            continue;
                        }
                        else if (top > maxTop) {
                            bottomHideHeight += nextRowHeight;
                            continue;
                        }
                    }
                    this._visibleRows.push(
                    // @ts-ignore
                    this.renderRowData(bodyCells, rowData, rowProps, shouldRenderExpandedRow));
                }
            }
            else {
                /**
                 如果 Table 的行高是固定的，则直接通过行高与行数进行计算，
                 减少遍历所有 data 带来的性能消耗
                 */
                const nextRowHeight = this.getRowHeight();
                const startIndex = Math.max(Math.floor(minTop / nextRowHeight), 0);
                const endIndex = Math.min(startIndex + Math.ceil(bodyHeight / nextRowHeight), data.length);
                contentHeight = data.length * nextRowHeight;
                topHideHeight = startIndex * nextRowHeight;
                bottomHideHeight = (data.length - endIndex) * nextRowHeight;
                for (let index = startIndex; index < endIndex; index++) {
                    const rowData = data[index];
                    const rowProps = {
                        key: index,
                        top: index * nextRowHeight,
                        width: rowWidth,
                        height: nextRowHeight,
                    };
                    // @ts-ignore
                    this._visibleRows.push(this.renderRowData(bodyCells, rowData, rowProps, false));
                }
            }
        }
        const wheelStyles = {
            position: 'absolute',
            height: contentHeight,
            minHeight: height,
            pointerEvents: isScrolling ? 'none' : undefined,
        };
        const topRowStyles = { height: topHideHeight };
        const bottomRowStyles = { height: bottomHideHeight };
        return (React.createElement(LocaleReceiver, { componentName: "PerformanceTable", defaultLocale: defaultLocale.PerformanceTable }, (locale) => {
            return (React.createElement("div", { ref: this.tableBodyRef, className: this.addPrefix('body-row-wrapper'), style: bodyStyles, onScroll: this.handleBodyScroll },
                React.createElement("div", { style: wheelStyles, className: this.addPrefix('body-wheel-area'), ref: this.wheelWrapperRef },
                    topHideHeight ? React.createElement(Row, { style: topRowStyles, className: "virtualized" }) : null,
                    this._visibleRows,
                    bottomHideHeight ? React.createElement(Row, { style: bottomRowStyles, className: "virtualized" }) : null),
                this.renderInfo(locale),
                this.renderScrollbar(),
                this.renderLoading(locale)));
        }));
    }
    renderInfo(locale) {
        const { renderEmpty, loading } = this.props;
        if (this._visibleRows.length || loading) {
            return null;
        }
        const emptyMessage = React.createElement("div", { className: this.addPrefix('body-info') }, locale.emptyMessage);
        return renderEmpty ? renderEmpty(emptyMessage) : emptyMessage;
    }
    renderScrollbar() {
        const { disabledScroll, affixHorizontalScrollbar } = this.props;
        const { contentWidth, contentHeight, width, fixedHorizontalScrollbar } = this.state;
        const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
        const headerHeight = this.getTableHeaderHeight();
        const height = this.getTableHeight();
        if (disabledScroll) {
            return null;
        }
        return (React.createElement("div", null,
            React.createElement(Scrollbar, { className: classNames({ fixed: fixedHorizontalScrollbar }), style: { width, bottom: fixedHorizontalScrollbar ? bottom : undefined }, length: this.state.width, onScroll: this.handleScrollX, scrollLength: contentWidth, ref: this.scrollbarXRef }),
            React.createElement(Scrollbar, { vertical: true, length: height - headerHeight, scrollLength: contentHeight, onScroll: this.handleScrollY, ref: this.scrollbarYRef })));
    }
    /**
     *  show loading
     */
    renderLoading(locale) {
        const { loading, loadAnimation, renderLoading } = this.props;
        if (!loadAnimation && !loading) {
            return null;
        }
        const loadingElement = (React.createElement("div", { className: this.addPrefix('loader-wrapper') },
            React.createElement("div", { className: this.addPrefix('loader') },
                React.createElement("i", { className: this.addPrefix('loader-icon') }),
                React.createElement("span", { className: this.addPrefix('loader-text') }, locale.loading))));
        return renderLoading ? renderLoading(loadingElement) : loadingElement;
    }
    render() {
        const { children, columns, className, width = 0, style, isTree, hover, bordered, cellBordered, wordWrap, classPrefix, loading, showHeader, ...rest } = this.props;
        const { isColumnResizing } = this.state;
        const { headerCells, bodyCells, allColumnsWidth, hasCustomTreeCol } = this.getCellDescriptor();
        const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
        const clesses = classNames(classPrefix, className, {
            [this.addPrefix('word-wrap')]: wordWrap,
            [this.addPrefix('treetable')]: isTree,
            [this.addPrefix('bordered')]: bordered,
            [this.addPrefix('cell-bordered')]: cellBordered,
            [this.addPrefix('column-resizing')]: isColumnResizing,
            [this.addPrefix('hover')]: hover,
            [this.addPrefix('loading')]: loading,
        });
        const styles = {
            width: width || 'auto',
            height: this.getTableHeight(),
            lineHeight: `${toPx(this.getRowHeight())}px`,
            ...style,
        };
        const unhandled = getUnhandledProps(PerformanceTable, rest);
        return (React.createElement(TableContext.Provider, { value: {
                // @ts-ignore
                translateDOMPositionXY: this.translateDOMPositionXY,
                rtl: this.isRTL(),
                hasCustomTreeCol,
            } },
            React.createElement("div", Object.assign({}, unhandled, { className: clesses, style: styles, ref: this.tableRef }),
                showHeader && this.renderTableHeader(headerCells, rowWidth),
                columns && columns.length ? this.renderTableBody(bodyCells, rowWidth) : children && this.renderTableBody(bodyCells, rowWidth),
                showHeader && this.renderMouseArea())));
    }
}
PerformanceTable.displayName = 'performance';
PerformanceTable.Column = Column;
PerformanceTable.Cell = Cell;
PerformanceTable.HeaderCell = HeaderCell;
PerformanceTable.propTypes = {
    columns: PropTypes.array,
    width: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.object),
    height: PropTypes.number,
    autoHeight: PropTypes.bool,
    minHeight: PropTypes.number,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    headerHeight: PropTypes.number,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isTree: PropTypes.bool,
    defaultExpandAllRows: PropTypes.bool,
    defaultExpandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    expandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    renderTreeToggle: PropTypes.func,
    renderRowExpanded: PropTypes.func,
    rowExpandedHeight: PropTypes.number,
    locale: PropTypes.object,
    style: PropTypes.object,
    sortColumn: PropTypes.string,
    sortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    defaultSortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    disabledScroll: PropTypes.bool,
    hover: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.any,
    bordered: PropTypes.bool,
    cellBordered: PropTypes.bool,
    wordWrap: PropTypes.bool,
    onRowClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onScroll: PropTypes.func,
    onSortColumn: PropTypes.func,
    onExpandChange: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchMove: PropTypes.func,
    bodyRef: PropTypes.func,
    loadAnimation: PropTypes.bool,
    showHeader: PropTypes.bool,
    rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    virtualized: PropTypes.bool,
    renderEmpty: PropTypes.func,
    renderLoading: PropTypes.func,
    translate3d: PropTypes.bool,
    affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    rtl: PropTypes.bool,
    onDataUpdated: PropTypes.func,
    shouldUpdateScroll: PropTypes.bool,
};
PerformanceTable.defaultProps = {
    classPrefix: defaultClassPrefix('performance-table'),
    data: [],
    defaultSortType: SORT_TYPE.DESC,
    height: 200,
    rowHeight: 30,
    headerHeight: 30,
    minHeight: 0,
    rowExpandedHeight: 100,
    hover: true,
    showHeader: true,
    bordered: true,
    rowKey: 'key',
    translate3d: true,
    shouldUpdateScroll: true,
    locale: {
        emptyMessage: 'No data found',
        loading: 'Loading...',
    },
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3BlcmZvcm1hbmNlLXRhYmxlL1RhYmxlLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUMzQixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8saUJBQWlCLEVBQUUsRUFBRSxNQUFNLElBQUksbUJBQW1CLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUMxRixPQUFPLEVBQ0wsUUFBUSxFQUNSLFFBQVEsRUFDUixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixTQUFTLEVBQ1QsRUFBRSxFQUNGLFNBQVMsR0FDVixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDNUQsT0FBTyxjQUFjLE1BQU0saURBQWlELENBQUM7QUFFN0UsT0FBTyxhQUFhLE1BQU0sMENBQTBDLENBQUM7QUFDckUsT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDO0FBQ3hCLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxF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RUFBRSxHQUFHO0lBQ1gsU0FBUyxFQUFFLEVBQUU7SUFDYixZQUFZLEVBQUUsRUFBRTtJQUNoQixTQUFTLEVBQUUsQ0FBQztJQUNaLGlCQUFpQixFQUFFLEdBQUc7SUFDdEIsS0FBSyxFQUFFLElBQUk7SUFDWCxVQUFVLEVBQUUsSUFBSTtJQUNoQixRQUFRLEVBQUUsSUFBSTtJQUNkLE1BQU0sRUFBRSxLQUFLO0lBQ2IsV0FBVyxFQUFFLElBQUk7SUFDakIsa0JBQWtCLEVBQUUsSUFBSTtJQUN4QixNQUFNLEVBQUU7UUFDTixZQUFZLEVBQUUsZUFBZTtRQUM3QixPQUFPLEVBQUUsWUFBWTtLQUN0QjtDQUNGLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3BlcmZvcm1hbmNlLXRhYmxlL1RhYmxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgaXNGdW5jdGlvbiBmcm9tICdsb2Rhc2gvaXNGdW5jdGlvbic7XG5pbXBvcnQgZmxhdHRlbiBmcm9tICdsb2Rhc2gvZmxhdHRlbic7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcbmltcG9ydCBlcSBmcm9tICdsb2Rhc2gvZXEnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZSc7XG5pbXBvcnQgYmluZEVsZW1lbnRSZXNpemUsIHsgdW5iaW5kIGFzIHVuYmluZEVsZW1lbnRSZXNpemUgfSBmcm9tICdlbGVtZW50LXJlc2l6ZS1ldmVudCc7XG5pbXBvcnQgeyBnZXRUcmFuc2xhdGVET01Qb3NpdGlvblhZIH0gZnJvbSAnZG9tLWxpYi9saWIvdHJhbnNpdGlvbi90cmFuc2xhdGVET01Qb3NpdGlvblhZJztcbmltcG9ydCB7XG4gIGFkZFN0eWxlLFxuICBnZXRXaWR0aCxcbiAgZ2V0SGVpZ2h0LFxuICBXaGVlbEhhbmRsZXIsXG4gIHNjcm9sbExlZnQsXG4gIHNjcm9sbFRvcCxcbiAgb24sXG4gIGdldE9mZnNldCxcbn0gZnJvbSAnZG9tLWxpYic7XG5pbXBvcnQgeyB0b1B4IH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCBMb2NhbGVSZWNlaXZlciBmcm9tICdjaG9lcm9kb24tdWkvbGliL2xvY2FsZS1wcm92aWRlci9Mb2NhbGVSZWNlaXZlcic7XG5pbXBvcnQgeyBQZXJmb3JtYW5jZVRhYmxlIGFzIFBlcmZvcm1hbmNlVGFibGVMb2NhbCB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvbG9jYWxlLXByb3ZpZGVyJ1xuaW1wb3J0IGRlZmF1bHRMb2NhbGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9sb2NhbGUtcHJvdmlkZXIvZGVmYXVsdCc7XG5pbXBvcnQgUm93IGZyb20gJy4vUm93JztcbmltcG9ydCBDZWxsR3JvdXAgZnJvbSAnLi9DZWxsR3JvdXAnO1xuaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuL1Njcm9sbGJhcic7XG5pbXBvcnQgVGFibGVDb250ZXh0IGZyb20gJy4vVGFibGVDb250ZXh0JztcbmltcG9ydCB7IFNDUk9MTEJBUl9XSURUSCwgQ0VMTF9QQURESU5HX0hFSUdIVCB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7XG4gIGdldFRvdGFsQnlDb2x1bW5zLFxuICBtZXJnZUNlbGxzLFxuICBnZXRVbmhhbmRsZWRQcm9wcyxcbiAgZGVmYXVsdENsYXNzUHJlZml4LFxuICB0b2dnbGVDbGFzcyxcbiAgZmxhdHRlbkRhdGEsXG4gIHByZWZpeCxcbiAgcmVxdWVzdEFuaW1hdGlvblRpbWVvdXQsXG4gIGNhbmNlbEFuaW1hdGlvblRpbWVvdXQsXG4gIGlzUlRMLFxuICBpc051bWJlck9yVHJ1ZSxcbiAgZmluZFJvd0tleXMsXG4gIGZpbmRBbGxQYXJlbnRzLFxuICBzaG91bGRTaG93Um93QnlFeHBhbmRlZCxcbiAgcmVzZXRMZWZ0Rm9yQ2VsbHMsXG59IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQgeyBUYWJsZVByb3BzIH0gZnJvbSAnLi9UYWJsZS5kJztcbmltcG9ydCB7IFJvd1Byb3BzIH0gZnJvbSAnLi9Sb3cuZCc7XG5pbXBvcnQgeyBTb3J0VHlwZSB9IGZyb20gJy4vY29tbW9uLmQnO1xuaW1wb3J0IENvbHVtbkdyb3VwIGZyb20gJy4vQ29sdW1uR3JvdXAnO1xuaW1wb3J0IENvbHVtbiBmcm9tICcuL0NvbHVtbic7XG5pbXBvcnQgQ2VsbCBmcm9tICcuL0NlbGwnO1xuaW1wb3J0IEhlYWRlckNlbGwgZnJvbSAnLi9IZWFkZXJDZWxsJztcblxuaW50ZXJmYWNlIFRhYmxlUm93UHJvcHMgZXh0ZW5kcyBSb3dQcm9wcyB7XG4gIGtleT86IHN0cmluZyB8IG51bWJlcjtcbiAgZGVwdGg/OiBudW1iZXI7XG59XG5cbmNvbnN0IFNPUlRfVFlQRSA9IHtcbiAgREVTQzogJ2Rlc2MnLFxuICBBU0M6ICdhc2MnLFxufTtcblxudHlwZSBPZmZzZXQgPSB7XG4gIHRvcD86IG51bWJlcjtcbiAgbGVmdD86IG51bWJlcjtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbn07XG5cbmludGVyZmFjZSBUYWJsZVN0YXRlIHtcbiAgaGVhZGVyT2Zmc2V0PzogT2Zmc2V0O1xuICB0YWJsZU9mZnNldD86IE9mZnNldDtcbiAgd2lkdGg6IG51bWJlcjtcbiAgY29sdW1uV2lkdGg6IG51bWJlcjtcbiAgZGF0YUtleTogbnVtYmVyO1xuICBzaG91bGRGaXhlZENvbHVtbjogYm9vbGVhbjtcbiAgY29udGVudEhlaWdodDogbnVtYmVyO1xuICBjb250ZW50V2lkdGg6IG51bWJlcjtcbiAgdGFibGVSb3dzTWF4SGVpZ2h0OiBudW1iZXJbXTtcbiAgaXNDb2x1bW5SZXNpemluZz86IGJvb2xlYW47XG4gIGV4cGFuZGVkUm93S2V5czogc3RyaW5nW10gfCBudW1iZXJbXTtcbiAgc29ydFR5cGU/OiBTb3J0VHlwZTtcbiAgc2Nyb2xsWTogbnVtYmVyO1xuICBpc1Njcm9sbGluZz86IGJvb2xlYW47XG4gIGRhdGE6IG9iamVjdFtdO1xuICBjYWNoZURhdGE6IG9iamVjdFtdO1xuICBmaXhlZEhlYWRlcjogYm9vbGVhbjtcbiAgZml4ZWRIb3Jpem9udGFsU2Nyb2xsYmFyPzogYm9vbGVhbjtcblxuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZvcm1hbmNlVGFibGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8VGFibGVQcm9wcywgVGFibGVTdGF0ZT4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAncGVyZm9ybWFuY2UnO1xuXG4gIHN0YXRpYyBDb2x1bW4gPSBDb2x1bW47XG5cbiAgc3RhdGljIENlbGwgPSBDZWxsO1xuXG4gIHN0YXRpYyBIZWFkZXJDZWxsID0gSGVhZGVyQ2VsbDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5hcnJheSxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBkYXRhOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0KSxcbiAgICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgYXV0b0hlaWdodDogUHJvcFR5cGVzLmJvb2wsXG4gICAgbWluSGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHJvd0hlaWdodDogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm51bWJlciwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBoZWFkZXJIZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcm93S2V5OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyXSksXG4gICAgaXNUcmVlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBkZWZhdWx0RXhwYW5kQWxsUm93czogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGVmYXVsdEV4cGFuZGVkUm93S2V5czogUHJvcFR5cGVzLmFycmF5T2YoXG4gICAgICBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyXSksXG4gICAgKSxcbiAgICBleHBhbmRlZFJvd0tleXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXJdKSksXG4gICAgcmVuZGVyVHJlZVRvZ2dsZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyUm93RXhwYW5kZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJvd0V4cGFuZGVkSGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGxvY2FsZTogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBzdHlsZTogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBzb3J0Q29sdW1uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHNvcnRUeXBlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuYm9vbCwgUHJvcFR5cGVzLnN0cmluZ10pLFxuICAgIGRlZmF1bHRTb3J0VHlwZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmJvb2wsIFByb3BUeXBlcy5zdHJpbmddKSxcbiAgICBkaXNhYmxlZFNjcm9sbDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaG92ZXI6IFByb3BUeXBlcy5ib29sLFxuICAgIGxvYWRpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjbGFzc1ByZWZpeDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLmFueSxcbiAgICBib3JkZXJlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgY2VsbEJvcmRlcmVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB3b3JkV3JhcDogUHJvcFR5cGVzLmJvb2wsXG4gICAgb25Sb3dDbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Sb3dDb250ZXh0TWVudTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25TY3JvbGw6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uU29ydENvbHVtbjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25FeHBhbmRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uVG91Y2hTdGFydDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub3VjaE1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIGJvZHlSZWY6IFByb3BUeXBlcy5mdW5jLFxuICAgIGxvYWRBbmltYXRpb246IFByb3BUeXBlcy5ib29sLFxuICAgIHNob3dIZWFkZXI6IFByb3BUeXBlcy5ib29sLFxuICAgIHJvd0NsYXNzTmFtZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmZ1bmMsIFByb3BUeXBlcy5zdHJpbmddKSxcbiAgICB2aXJ0dWFsaXplZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgcmVuZGVyRW1wdHk6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckxvYWRpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAgIHRyYW5zbGF0ZTNkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBhZmZpeEhlYWRlcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmJvb2wsIFByb3BUeXBlcy5udW1iZXJdKSxcbiAgICBhZmZpeEhvcml6b250YWxTY3JvbGxiYXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ib29sLCBQcm9wVHlwZXMubnVtYmVyXSksXG4gICAgcnRsOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBvbkRhdGFVcGRhdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzaG91bGRVcGRhdGVTY3JvbGw6IFByb3BUeXBlcy5ib29sLFxuICB9O1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzUHJlZml4OiBkZWZhdWx0Q2xhc3NQcmVmaXgoJ3BlcmZvcm1hbmNlLXRhYmxlJyksXG4gICAgZGF0YTogW10sXG4gICAgZGVmYXVsdFNvcnRUeXBlOiBTT1JUX1RZUEUuREVTQyxcbiAgICBoZWlnaHQ6IDIwMCxcbiAgICByb3dIZWlnaHQ6IDMwLFxuICAgIGhlYWRlckhlaWdodDogMzAsXG4gICAgbWluSGVpZ2h0OiAwLFxuICAgIHJvd0V4cGFuZGVkSGVpZ2h0OiAxMDAsXG4gICAgaG92ZXI6IHRydWUsXG4gICAgc2hvd0hlYWRlcjogdHJ1ZSxcbiAgICBib3JkZXJlZDogdHJ1ZSxcbiAgICByb3dLZXk6ICdrZXknLFxuICAgIHRyYW5zbGF0ZTNkOiB0cnVlLFxuICAgIHNob3VsZFVwZGF0ZVNjcm9sbDogdHJ1ZSxcbiAgICBsb2NhbGU6IHtcbiAgICAgIGVtcHR5TWVzc2FnZTogJ05vIGRhdGEgZm91bmQnLFxuICAgICAgbG9hZGluZzogJ0xvYWRpbmcuLi4nLFxuICAgIH0sXG4gIH07XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhwcm9wczogVGFibGVQcm9wcywgc3RhdGU6IFRhYmxlU3RhdGUpIHtcbiAgICBpZiAocHJvcHMuZGF0YSAhPT0gc3RhdGUuY2FjaGVEYXRhKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjYWNoZURhdGE6IHByb3BzLmRhdGEsXG4gICAgICAgIGRhdGE6IHByb3BzLmlzVHJlZSA/IGZsYXR0ZW5EYXRhKHByb3BzLmRhdGEpIDogcHJvcHMuZGF0YSxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdHJhbnNsYXRlRE9NUG9zaXRpb25YWSA9IG51bGw7XG4gIHNjcm9sbExpc3RlbmVyOiBhbnkgPSBudWxsO1xuXG4gIHRhYmxlUmVmOiBSZWFjdC5SZWZPYmplY3Q8YW55PjtcbiAgc2Nyb2xsYmFyWVJlZjogUmVhY3QuUmVmT2JqZWN0PGFueT47XG4gIHNjcm9sbGJhclhSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuICB0YWJsZUJvZHlSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuICBhZmZpeEhlYWRlcldyYXBwZXJSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuICBtb3VzZUFyZWFSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuICBoZWFkZXJXcmFwcGVyUmVmOiBSZWFjdC5SZWZPYmplY3Q8YW55PjtcbiAgdGFibGVIZWFkZXJSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuICB3aGVlbFdyYXBwZXJSZWY6IFJlYWN0LlJlZk9iamVjdDxhbnk+O1xuXG4gIHRhYmxlUm93czogeyBba2V5OiBzdHJpbmddOiBbSFRNTEVsZW1lbnQsIGFueV0gfSA9IHt9O1xuICBtb3VudGVkID0gZmFsc2U7XG4gIGRpc2FibGVFdmVudHNUaW1lb3V0SWQgPSBudWxsO1xuICBzY3JvbGxZID0gMDtcbiAgc2Nyb2xsWCA9IDA7XG4gIHdoZWVsSGFuZGxlcjogYW55O1xuICBtaW5TY3JvbGxZOiBhbnk7XG4gIG1pblNjcm9sbFg6IGFueTtcbiAgbW91c2VBcmVhOiBhbnk7XG4gIHRvdWNoWDogYW55O1xuICB0b3VjaFk6IGFueTtcbiAgd2hlZWxMaXN0ZW5lcjogYW55O1xuICB0b3VjaFN0YXJ0TGlzdGVuZXI6IGFueTtcbiAgdG91Y2hNb3ZlTGlzdGVuZXI6IGFueTtcblxuICBfY2FjaGVDZWxsczogYW55ID0gbnVsbDtcbiAgX2NhY2hlQ2hpbGRyZW5TaXplID0gMDtcbiAgX3Zpc2libGVSb3dzID0gW107XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFRhYmxlUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3Qge1xuICAgICAgd2lkdGgsXG4gICAgICBkYXRhLFxuICAgICAgcm93S2V5LFxuICAgICAgZGVmYXVsdEV4cGFuZEFsbFJvd3MsXG4gICAgICByZW5kZXJSb3dFeHBhbmRlZCxcbiAgICAgIGRlZmF1bHRFeHBhbmRlZFJvd0tleXMsXG4gICAgICBjaGlsZHJlbiA9IFtdLFxuICAgICAgY29sdW1ucyA9IFtdLFxuICAgICAgaXNUcmVlLFxuICAgICAgZGVmYXVsdFNvcnRUeXBlLFxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IGV4cGFuZGVkUm93S2V5cyA9IGRlZmF1bHRFeHBhbmRBbGxSb3dzXG4gICAgICA/IGZpbmRSb3dLZXlzKGRhdGEsIHJvd0tleSwgaXNGdW5jdGlvbihyZW5kZXJSb3dFeHBhbmRlZCkpXG4gICAgICA6IGRlZmF1bHRFeHBhbmRlZFJvd0tleXMgfHwgW107XG5cbiAgICBsZXQgc2hvdWxkRml4ZWRDb2x1bW4gPSBBcnJheS5mcm9tKGNoaWxkcmVuIGFzIEl0ZXJhYmxlPGFueT4pLnNvbWUoXG4gICAgICAoY2hpbGQ6IGFueSkgPT4gY2hpbGQgJiYgY2hpbGQucHJvcHMgJiYgY2hpbGQucHJvcHMuZml4ZWQsXG4gICAgKTtcblxuICAgIGlmIChjb2x1bW5zICYmIGNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICBzaG91bGRGaXhlZENvbHVtbiA9IEFycmF5LmZyb20oY29sdW1ucyBhcyBJdGVyYWJsZTxhbnk+KS5zb21lKFxuICAgICAgICAoY2hpbGQ6IGFueSkgPT4gY2hpbGQgJiYgY2hpbGQuZml4ZWQsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpc1RyZWUgJiYgIXJvd0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgYHJvd0tleWAgaXMgcmVxdWlyZWQgd2hlbiBzZXQgaXNUcmVlJyk7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBleHBhbmRlZFJvd0tleXMsXG4gICAgICBzaG91bGRGaXhlZENvbHVtbixcbiAgICAgIGNhY2hlRGF0YTogZGF0YSxcbiAgICAgIGRhdGE6IGlzVHJlZSA/IGZsYXR0ZW5EYXRhKGRhdGEpIDogZGF0YSxcbiAgICAgIHdpZHRoOiB3aWR0aCB8fCAwLFxuICAgICAgY29sdW1uV2lkdGg6IDAsXG4gICAgICBkYXRhS2V5OiAwLFxuICAgICAgY29udGVudEhlaWdodDogMCxcbiAgICAgIGNvbnRlbnRXaWR0aDogMCxcbiAgICAgIHRhYmxlUm93c01heEhlaWdodDogW10sXG4gICAgICBzb3J0VHlwZTogZGVmYXVsdFNvcnRUeXBlLFxuICAgICAgc2Nyb2xsWTogMCxcbiAgICAgIGlzU2Nyb2xsaW5nOiBmYWxzZSxcbiAgICAgIGZpeGVkSGVhZGVyOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgdGhpcy5zY3JvbGxZID0gMDtcbiAgICB0aGlzLnNjcm9sbFggPSAwO1xuICAgIHRoaXMud2hlZWxIYW5kbGVyID0gbmV3IFdoZWVsSGFuZGxlcihcbiAgICAgIHRoaXMubGlzdGVuV2hlZWwsXG4gICAgICB0aGlzLnNob3VsZEhhbmRsZVdoZWVsWCxcbiAgICAgIHRoaXMuc2hvdWxkSGFuZGxlV2hlZWxZLFxuICAgICAgZmFsc2UsXG4gICAgKTtcblxuICAgIHRoaXMuX2NhY2hlQ2hpbGRyZW5TaXplID0gZmxhdHRlbihjaGlsZHJlbiBhcyBhbnlbXSB8fCBjb2x1bW5zKS5sZW5ndGg7XG5cbiAgICB0aGlzLnRyYW5zbGF0ZURPTVBvc2l0aW9uWFkgPSBnZXRUcmFuc2xhdGVET01Qb3NpdGlvblhZKHtcbiAgICAgIGVuYWJsZTNEVHJhbnNmb3JtOiBwcm9wcy50cmFuc2xhdGUzZCxcbiAgICB9KTtcbiAgICB0aGlzLnRhYmxlUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgdGhpcy5zY3JvbGxiYXJZUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgdGhpcy5zY3JvbGxiYXJYUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgdGhpcy50YWJsZUJvZHlSZWYgPSBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICB0aGlzLmFmZml4SGVhZGVyV3JhcHBlclJlZiA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgIHRoaXMubW91c2VBcmVhUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgdGhpcy5oZWFkZXJXcmFwcGVyUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgdGhpcy53aGVlbFdyYXBwZXJSZWYgPSBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICB0aGlzLnRhYmxlSGVhZGVyUmVmID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gIH1cblxuICBsaXN0ZW5XaGVlbCA9IChkZWx0YVg6IG51bWJlciwgZGVsdGFZOiBudW1iZXIpID0+IHtcbiAgICB0aGlzLmhhbmRsZVdoZWVsKGRlbHRhWCwgZGVsdGFZKTtcbiAgICB0aGlzLnNjcm9sbGJhclhSZWYuY3VycmVudD8ub25XaGVlbFNjcm9sbD8uKGRlbHRhWCk7XG4gICAgdGhpcy5zY3JvbGxiYXJZUmVmLmN1cnJlbnQ/Lm9uV2hlZWxTY3JvbGw/LihkZWx0YVkpO1xuICB9O1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuY2FsY3VsYXRlVGFibGVXaWR0aCgpO1xuICAgIHRoaXMuY2FsY3VsYXRlVGFibGVDb250ZXh0SGVpZ2h0KCk7XG4gICAgdGhpcy5jYWxjdWxhdGVSb3dNYXhIZWlnaHQoKTtcbiAgICB0aGlzLnNldE9mZnNldEJ5QWZmaXgoKTtcbiAgICB0aGlzLmluaXRQb3NpdGlvbigpO1xuICAgIGJpbmRFbGVtZW50UmVzaXplKHRoaXMudGFibGVSZWYuY3VycmVudCwgZGVib3VuY2UodGhpcy5jYWxjdWxhdGVUYWJsZVdpZHRoLCA0MDApKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7IHBhc3NpdmU6IGZhbHNlIH07XG4gICAgY29uc3QgdGFibGVCb2R5ID0gdGhpcy50YWJsZUJvZHlSZWYuY3VycmVudDtcbiAgICBpZiAodGFibGVCb2R5KSB7XG4gICAgICB0aGlzLndoZWVsTGlzdGVuZXIgPSBvbih0YWJsZUJvZHksICd3aGVlbCcsIHRoaXMud2hlZWxIYW5kbGVyLm9uV2hlZWwsIG9wdGlvbnMpO1xuICAgICAgdGhpcy50b3VjaFN0YXJ0TGlzdGVuZXIgPSBvbih0YWJsZUJvZHksICd0b3VjaHN0YXJ0JywgdGhpcy5oYW5kbGVUb3VjaFN0YXJ0LCBvcHRpb25zKTtcbiAgICAgIHRoaXMudG91Y2hNb3ZlTGlzdGVuZXIgPSBvbih0YWJsZUJvZHksICd0b3VjaG1vdmUnLCB0aGlzLmhhbmRsZVRvdWNoTW92ZSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBhZmZpeEhlYWRlciwgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChpc051bWJlck9yVHJ1ZShhZmZpeEhlYWRlcikgfHwgaXNOdW1iZXJPclRydWUoYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyKSkge1xuICAgICAgdGhpcy5zY3JvbGxMaXN0ZW5lciA9IG9uKHdpbmRvdywgJ3Njcm9sbCcsIHRoaXMuaGFuZGxlV2luZG93U2Nyb2xsKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzPy5ib2R5UmVmPy4odGhpcy53aGVlbFdyYXBwZXJSZWYuY3VycmVudCk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBUYWJsZVByb3BzLCBuZXh0U3RhdGU6IFRhYmxlU3RhdGUpIHtcbiAgICBjb25zdCBfY2FjaGVDaGlsZHJlblNpemUgPSBmbGF0dGVuKChuZXh0UHJvcHMuY2hpbGRyZW4gYXMgYW55W10gfHwgbmV4dFByb3BzLmNvbHVtbnMpIHx8IFtdKS5sZW5ndGg7XG5cbiAgICAvKipcbiAgICAgKiDljZXlhYPmoLzliJfnmoTkv6Hmga/lnKjliJ3lp4vljJblkI7kvJrooqvnvJPlrZjvvIzlnKjmn5DkupvlsZ7mgKfooqvmm7TmlrDku6XlkI7vvIzpnIDopoHmuIXpmaTnvJPlrZjjgIJcbiAgICAgKi9cbiAgICBpZiAoX2NhY2hlQ2hpbGRyZW5TaXplICE9PSB0aGlzLl9jYWNoZUNoaWxkcmVuU2l6ZSkge1xuICAgICAgdGhpcy5fY2FjaGVDaGlsZHJlblNpemUgPSBfY2FjaGVDaGlsZHJlblNpemU7XG4gICAgICB0aGlzLl9jYWNoZUNlbGxzID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbiAhPT0gbmV4dFByb3BzLmNoaWxkcmVuIHx8XG4gICAgICB0aGlzLnByb3BzLmNvbHVtbnMgIT09IG5leHRQcm9wcy5jb2x1bW5zIHx8XG4gICAgICB0aGlzLnByb3BzLnNvcnRDb2x1bW4gIT09IG5leHRQcm9wcy5zb3J0Q29sdW1uIHx8XG4gICAgICB0aGlzLnByb3BzLnNvcnRUeXBlICE9PSBuZXh0UHJvcHMuc29ydFR5cGVcbiAgICApIHtcbiAgICAgIHRoaXMuX2NhY2hlQ2VsbHMgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAhZXEodGhpcy5wcm9wcywgbmV4dFByb3BzKSB8fCAhaXNFcXVhbCh0aGlzLnN0YXRlLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogVGFibGVQcm9wcykge1xuICAgIHRoaXMuY2FsY3VsYXRlVGFibGVDb250ZXh0SGVpZ2h0KHByZXZQcm9wcyk7XG4gICAgdGhpcy5jYWxjdWxhdGVUYWJsZUNvbnRlbnRXaWR0aChwcmV2UHJvcHMpO1xuICAgIHRoaXMuY2FsY3VsYXRlUm93TWF4SGVpZ2h0KCk7XG4gICAgaWYgKHByZXZQcm9wcy5kYXRhICE9PSB0aGlzLnByb3BzLmRhdGEpIHtcbiAgICAgIHRoaXMucHJvcHMub25EYXRhVXBkYXRlZD8uKHRoaXMucHJvcHMuZGF0YSwgdGhpcy5zY3JvbGxUbyk7XG4gICAgICBpZiAodGhpcy5wcm9wcy5zaG91bGRVcGRhdGVTY3JvbGwpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUbyh7IHg6IDAsIHk6IDAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLndoZWVsSGFuZGxlciA9IG51bGw7XG4gICAgaWYgKHRoaXMudGFibGVSZWYuY3VycmVudCkge1xuICAgICAgdW5iaW5kRWxlbWVudFJlc2l6ZSh0aGlzLnRhYmxlUmVmLmN1cnJlbnQpO1xuICAgIH1cbiAgICB0aGlzLndoZWVsTGlzdGVuZXI/Lm9mZigpO1xuICAgIHRoaXMudG91Y2hTdGFydExpc3RlbmVyPy5vZmYoKTtcbiAgICB0aGlzLnRvdWNoTW92ZUxpc3RlbmVyPy5vZmYoKTtcbiAgICB0aGlzLnNjcm9sbExpc3RlbmVyPy5vZmYoKTtcbiAgfVxuXG4gIGdldEV4cGFuZGVkUm93S2V5cygpIHtcbiAgICBjb25zdCB7IGV4cGFuZGVkUm93S2V5cyB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gdHlwZW9mIGV4cGFuZGVkUm93S2V5cyA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnN0YXRlLmV4cGFuZGVkUm93S2V5cyA6IGV4cGFuZGVkUm93S2V5cztcbiAgfVxuXG4gIGdldFNvcnRUeXBlKCkge1xuICAgIGNvbnN0IHsgc29ydFR5cGUgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIHR5cGVvZiBzb3J0VHlwZSA9PT0gJ3VuZGVmaW5lZCcgPyB0aGlzLnN0YXRlLnNvcnRUeXBlIDogc29ydFR5cGU7XG4gIH1cblxuICBnZXRTY3JvbGxDZWxsR3JvdXBzKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlUmVmLmN1cnJlbnQ/LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke3RoaXMuYWRkUHJlZml4KCdjZWxsLWdyb3VwLXNjcm9sbCcpfWApO1xuICB9XG5cbiAgZ2V0Rml4ZWRMZWZ0Q2VsbEdyb3VwcygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZVJlZi5jdXJyZW50Py5xdWVyeVNlbGVjdG9yQWxsKGAuJHt0aGlzLmFkZFByZWZpeCgnY2VsbC1ncm91cC1maXhlZC1sZWZ0Jyl9YCk7XG4gIH1cblxuICBnZXRGaXhlZFJpZ2h0Q2VsbEdyb3VwcygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZVJlZi5jdXJyZW50Py5xdWVyeVNlbGVjdG9yQWxsKGAuJHt0aGlzLmFkZFByZWZpeCgnY2VsbC1ncm91cC1maXhlZC1yaWdodCcpfWApO1xuICB9XG5cbiAgaXNSVEwoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMucnRsIHx8IGlzUlRMKCk7XG4gIH1cblxuICBnZXRSb3dIZWlnaHQocm93RGF0YSA9IHt9KSB7XG4gICAgY29uc3QgeyByb3dIZWlnaHQgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIHR5cGVvZiByb3dIZWlnaHQgPT09ICdmdW5jdGlvbicgPyByb3dIZWlnaHQocm93RGF0YSkgOiByb3dIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6KGo5aS06auY5bqmXG4gICAqL1xuICBnZXRUYWJsZUhlYWRlckhlaWdodCgpIHtcbiAgICBjb25zdCB7IGhlYWRlckhlaWdodCwgc2hvd0hlYWRlciB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gc2hvd0hlYWRlciA/IGhlYWRlckhlaWdodCA6IDA7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+WIFRhYmxlIOmcgOimgea4suafk+eahOmrmOW6plxuICAgKi9cbiAgZ2V0VGFibGVIZWlnaHQoKSB7XG4gICAgY29uc3QgeyBjb250ZW50SGVpZ2h0IH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgbWluSGVpZ2h0LCBoZWlnaHQsIGF1dG9IZWlnaHQsIGRhdGEgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaGVhZGVySGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlYWRlckhlaWdodCgpO1xuXG4gICAgaWYgKGRhdGEubGVuZ3RoID09PSAwICYmIGF1dG9IZWlnaHQpIHtcbiAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF1dG9IZWlnaHQgPyBNYXRoLm1heChoZWFkZXJIZWlnaHQgKyBjb250ZW50SGVpZ2h0LCBtaW5IZWlnaHQpIDogaGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIOWkhOeQhiBjb2x1bW4gcHJvcHNcbiAgICogQHBhcmFtIGNvbHVtblxuICAgKi9cbiAgZ2V0Q29sdW1uUHJvcHMoY29sdW1uKSB7XG4gICAgcmV0dXJuIG9taXQoY29sdW1uLCBbJ3RpdGxlJywgJ2RhdGFJbmRleCcsICdrZXknLCAncmVuZGVyJ10pO1xuICB9XG5cbiAgLyoqXG4gICAqIOWkhOeQhmNvbHVtbnMganNvbiAtPiByZWFjdE5vZGVcbiAgICogQHBhcmFtIGNvbHVtbnNcbiAgICovXG4gIHByb2Nlc3NUYWJsZUNvbHVtbnMoY29sdW1ucykge1xuICAgIHJldHVybiBjb2x1bW5zICYmIGNvbHVtbnMubWFwKChjb2x1bW4pID0+IHtcbiAgICAgIGNvbnN0IGRhdGFLZXkgPSBjb2x1bW4uZGF0YUluZGV4O1xuICAgICAgaWYgKGNvbHVtbi50eXBlID09PSAnQ29sdW1uR3JvdXAnKSB7XG4gICAgICAgIHJldHVybiA8Q29sdW1uR3JvdXAgey4uLnRoaXMuZ2V0Q29sdW1uUHJvcHMoY29sdW1uKX0+e3RoaXMucHJvY2Vzc1RhYmxlQ29sdW1ucyhjb2x1bW4uY2hpbGRyZW4pfTwvQ29sdW1uR3JvdXA+O1xuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICA8Q29sdW1uIHsuLi50aGlzLmdldENvbHVtblByb3BzKGNvbHVtbil9IGRhdGFLZXk9e2RhdGFLZXl9PlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIDxIZWFkZXJDZWxsPlxuICAgICAgICAgICAgICB7aXNGdW5jdGlvbihjb2x1bW4udGl0bGUpID8gY29sdW1uLnRpdGxlKCkgOiBjb2x1bW4udGl0bGV9XG4gICAgICAgICAgICA8L0hlYWRlckNlbGw+XG4gICAgICAgICAgfVxuICAgICAgICAgIHt0eXBlb2YgY29sdW1uLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJyA/IChcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIDxDZWxsIGRhdGFLZXk9e2RhdGFLZXl9PlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgKHJvd0RhdGEsIHJvd0luZGV4KSA9PiBjb2x1bW4ucmVuZGVyKHsgcm93RGF0YSwgcm93SW5kZXgsIGRhdGFJbmRleDogZGF0YUtleSB9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L0NlbGw+XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgKSA6IDxDZWxsIGRhdGFLZXk9e2RhdGFLZXl9IC8+fVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+WIGNvbHVtbnMgUmVhY3RFbGVtZW50IOaVsOe7hFxuICAgKiAtIOWkhOeQhiBjaGlsZHJlbiDkuK3lrZjlnKggPENvbHVtbj4g5pWw57uE55qE5oOF5Ya1XG4gICAqIC0g6L+H5rukIGNoaWxkcmVuIOS4reeahOepuumhuVxuICAgKi9cbiAgZ2V0VGFibGVDb2x1bW5zKCk6IFJlYWN0LlJlYWN0Tm9kZUFycmF5IHtcbiAgICBjb25zdCB7IGNvbHVtbnMgfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IGNoaWxkcmVuID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICBpZiAoY29sdW1ucyAmJiBjb2x1bW5zLmxlbmd0aCkge1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLnByb2Nlc3NUYWJsZUNvbHVtbnMoY29sdW1ucyk7XG4gICAgfVxuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuIGFzIFJlYWN0LlJlYWN0Tm9kZUFycmF5O1xuICAgIH1cblxuICAgIGNvbnN0IGZsYXR0ZW5Db2x1bW5zID0gY2hpbGRyZW4ubWFwKChjb2x1bW46IFJlYWN0LlJlYWN0RWxlbWVudCkgPT4ge1xuICAgICAgaWYgKGNvbHVtbj8udHlwZSA9PT0gQ29sdW1uR3JvdXApIHtcbiAgICAgICAgY29uc3QgeyBoZWFkZXIsIGNoaWxkcmVuOiBjaGlsZENvbHVtbnMsIGFsaWduLCBmaXhlZCwgdmVydGljYWxBbGlnbiB9ID0gY29sdW1uPy5wcm9wcztcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1ucy5tYXAoKGNoaWxkQ29sdW1uLCBpbmRleCkgPT4ge1xuICAgICAgICAgIC8vIOaKiiBDb2x1bW5Hcm91cCDorr7nva7nmoTlsZ7mgKfopobnm5bliLAgQ29sdW1uXG4gICAgICAgICAgY29uc3QgZ3JvdXBDZWxsUHJvcHM6IGFueSA9IHtcbiAgICAgICAgICAgIGFsaWduLFxuICAgICAgICAgICAgZml4ZWQsXG4gICAgICAgICAgICB2ZXJ0aWNhbEFsaWduLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiDkuLrliIbnu4TkuK3nmoTnrKzkuIDliJforr7nva7lsZ7mgKc6XG4gICAgICAgICAgICogZ3JvdXBDb3VudDog5YiG57uE5a2Q6aG55Liq5pWwXG4gICAgICAgICAgICogZ3JvdXBIZWFkZXI6IOWIhue7hOagh+mimFxuICAgICAgICAgICAqIHJlc2l6YWJsZTog6K6+572u5Li65LiN5Y+v6Ieq5a6a5LmJ5YiX5a69XG4gICAgICAgICAgICovXG4gICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBncm91cENlbGxQcm9wcy5ncm91cENvdW50ID0gY2hpbGRDb2x1bW5zLmxlbmd0aDtcbiAgICAgICAgICAgIGdyb3VwQ2VsbFByb3BzLmdyb3VwSGVhZGVyID0gaGVhZGVyO1xuICAgICAgICAgICAgZ3JvdXBDZWxsUHJvcHMucmVzaXphYmxlID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZENvbHVtbiwgZ3JvdXBDZWxsUHJvcHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb2x1bW47XG4gICAgfSk7XG5cbiAgICAvLyDmioogQ29sdW1ucyDkuK3nmoTmlbDnu4TvvIzlsZXlubPkuLrkuIDnu7TmlbDnu4TvvIzorqHnrpcgbGFzdENvbHVtbiDkuI4gZmlyc3RDb2x1bW7jgIJcbiAgICByZXR1cm4gZmxhdHRlbihmbGF0dGVuQ29sdW1ucykuZmlsdGVyKGNvbCA9PiBjb2wpO1xuICB9XG5cbiAgZ2V0Q2VsbERlc2NyaXB0b3IoKSB7XG4gICAgaWYgKHRoaXMuX2NhY2hlQ2VsbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZUNlbGxzO1xuICAgIH1cbiAgICBsZXQgaGFzQ3VzdG9tVHJlZUNvbCA9IGZhbHNlO1xuICAgIGxldCBsZWZ0ID0gMDsgLy8gQ2VsbCBsZWZ0IG1hcmdpblxuICAgIGNvbnN0IGhlYWRlckNlbGxzID0gW107IC8vIFRhYmxlIGhlYWRlciBjZWxsXG4gICAgY29uc3QgYm9keUNlbGxzID0gW107IC8vIFRhYmxlIGJvZHkgY2VsbFxuICAgIGNvbnN0IHsgY2hpbGRyZW4sIGNvbHVtbnM6IGNvbHVtbnNKc29uIH0gPSB0aGlzLnByb3BzO1xuICAgIGxldCBjb2x1bW5IYWNrID0gY2hpbGRyZW47XG4gICAgaWYgKGNvbHVtbnNKc29uICYmIGNvbHVtbnNKc29uLmxlbmd0aCkge1xuICAgICAgY29sdW1uSGFjayA9IGNvbHVtbnNKc29uO1xuICAgIH1cblxuICAgIGlmICghY29sdW1uSGFjaykge1xuICAgICAgdGhpcy5fY2FjaGVDZWxscyA9IHtcbiAgICAgICAgaGVhZGVyQ2VsbHMsXG4gICAgICAgIGJvZHlDZWxscyxcbiAgICAgICAgaGFzQ3VzdG9tVHJlZUNvbCxcbiAgICAgICAgYWxsQ29sdW1uc1dpZHRoOiBsZWZ0LFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZUNlbGxzO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbHVtbnMgPSB0aGlzLmdldFRhYmxlQ29sdW1ucygpO1xuXG4gICAgY29uc3QgeyB3aWR0aDogdGFibGVXaWR0aCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IHNvcnRDb2x1bW4sIHJvd0hlaWdodCwgc2hvd0hlYWRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHRvdGFsRmxleEdyb3csIHRvdGFsV2lkdGggfSA9IGdldFRvdGFsQnlDb2x1bW5zKGNvbHVtbnMpO1xuICAgIGNvbnN0IGhlYWRlckhlaWdodCA9IHRoaXMuZ2V0VGFibGVIZWFkZXJIZWlnaHQoKTtcblxuICAgIFJlYWN0LkNoaWxkcmVuLmZvckVhY2goY29sdW1ucywgKGNvbHVtbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChSZWFjdC5pc1ZhbGlkRWxlbWVudChjb2x1bW4pKSB7XG4gICAgICAgIGNvbnN0IGNvbHVtbkNoaWxkcmVuID0gY29sdW1uLnByb3BzLmNoaWxkcmVuO1xuICAgICAgICBjb25zdCB7IHdpZHRoLCByZXNpemFibGUsIGZsZXhHcm93LCBtaW5XaWR0aCwgb25SZXNpemUsIHRyZWVDb2wgfSA9IGNvbHVtbi5wcm9wcztcblxuICAgICAgICBpZiAodHJlZUNvbCkge1xuICAgICAgICAgIGhhc0N1c3RvbVRyZWVDb2wgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc2l6YWJsZSAmJiBmbGV4R3Jvdykge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgIGBDYW5ub3Qgc2V0ICdyZXNpemFibGUnIGFuZCAnZmxleEdyb3cnIHRvZ2V0aGVyIGluIDxDb2x1bW4+LCBjb2x1bW4gaW5kZXg6ICR7aW5kZXh9YCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbHVtbkNoaWxkcmVuLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcG9uZW50IDxIZWFkZXJDZWxsPiBhbmQgPENlbGw+IGlzIHJlcXVpcmVkLCBjb2x1bW4gaW5kZXg6ICR7aW5kZXh9IGApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5leHRXaWR0aCA9XG4gICAgICAgICAgdGhpcy5zdGF0ZVtgJHtjb2x1bW5DaGlsZHJlblsxXS5wcm9wcy5kYXRhS2V5fV8ke2luZGV4fV93aWR0aGBdIHx8IHdpZHRoIHx8IDA7XG5cbiAgICAgICAgaWYgKHRhYmxlV2lkdGggJiYgZmxleEdyb3cgJiYgdG90YWxGbGV4R3Jvdykge1xuICAgICAgICAgIG5leHRXaWR0aCA9IE1hdGgubWF4KFxuICAgICAgICAgICAgKCh0YWJsZVdpZHRoIC0gdG90YWxXaWR0aCkgLyB0b3RhbEZsZXhHcm93KSAqIGZsZXhHcm93LFxuICAgICAgICAgICAgbWluV2lkdGggfHwgNjAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNlbGxQcm9wcyA9IHtcbiAgICAgICAgICAuLi5vbWl0KGNvbHVtbi5wcm9wcywgWydjaGlsZHJlbiddKSxcbiAgICAgICAgICBsZWZ0LFxuICAgICAgICAgIGluZGV4LFxuICAgICAgICAgIGhlYWRlckhlaWdodCxcbiAgICAgICAgICBrZXk6IGluZGV4LFxuICAgICAgICAgIHdpZHRoOiBuZXh0V2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiByb3dIZWlnaHQsXG4gICAgICAgICAgZmlyc3RDb2x1bW46IGluZGV4ID09PSAwLFxuICAgICAgICAgIGxhc3RDb2x1bW46IGluZGV4ID09PSBjb2x1bW5zLmxlbmd0aCAtIDEsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHNob3dIZWFkZXIgJiYgaGVhZGVySGVpZ2h0KSB7XG4gICAgICAgICAgY29uc3QgaGVhZGVyQ2VsbFByb3BzID0ge1xuICAgICAgICAgICAgZGF0YUtleTogY29sdW1uQ2hpbGRyZW5bMV0ucHJvcHMuZGF0YUtleSxcbiAgICAgICAgICAgIGlzSGVhZGVyQ2VsbDogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBjb2x1bW4ucHJvcHMuc29ydGFibGUsXG4gICAgICAgICAgICBvblNvcnRDb2x1bW46IHRoaXMuaGFuZGxlU29ydENvbHVtbixcbiAgICAgICAgICAgIHNvcnRUeXBlOiB0aGlzLmdldFNvcnRUeXBlKCksXG4gICAgICAgICAgICBzb3J0Q29sdW1uLFxuICAgICAgICAgICAgZmxleEdyb3csXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZXNpemFibGUpIHtcbiAgICAgICAgICAgIG1lcmdlKGhlYWRlckNlbGxQcm9wcywge1xuICAgICAgICAgICAgICBvblJlc2l6ZSxcbiAgICAgICAgICAgICAgb25Db2x1bW5SZXNpemVFbmQ6IHRoaXMuaGFuZGxlQ29sdW1uUmVzaXplRW5kLFxuICAgICAgICAgICAgICBvbkNvbHVtblJlc2l6ZVN0YXJ0OiB0aGlzLmhhbmRsZUNvbHVtblJlc2l6ZVN0YXJ0LFxuICAgICAgICAgICAgICBvbkNvbHVtblJlc2l6ZU1vdmU6IHRoaXMuaGFuZGxlQ29sdW1uUmVzaXplTW92ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGhlYWRlckNlbGxzLnB1c2goXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBSZWFjdC5jbG9uZUVsZW1lbnQoY29sdW1uQ2hpbGRyZW5bMF0sIHsgLi4uY2VsbFByb3BzLCAuLi5oZWFkZXJDZWxsUHJvcHMgfSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgYm9keUNlbGxzLnB1c2goUmVhY3QuY2xvbmVFbGVtZW50KGNvbHVtbkNoaWxkcmVuWzFdLCBjZWxsUHJvcHMpKTtcblxuICAgICAgICBsZWZ0ICs9IG5leHRXaWR0aDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiAodGhpcy5fY2FjaGVDZWxscyA9IHtcbiAgICAgIGhlYWRlckNlbGxzLFxuICAgICAgYm9keUNlbGxzLFxuICAgICAgYWxsQ29sdW1uc1dpZHRoOiBsZWZ0LFxuICAgICAgaGFzQ3VzdG9tVHJlZUNvbCxcbiAgICB9KTtcbiAgfVxuXG4gIHNldE9mZnNldEJ5QWZmaXggPSAoKSA9PiB7XG4gICAgY29uc3QgeyBhZmZpeEhlYWRlciwgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGhlYWRlck5vZGUgPSB0aGlzLmhlYWRlcldyYXBwZXJSZWY/LmN1cnJlbnQ7XG4gICAgaWYgKGlzTnVtYmVyT3JUcnVlKGFmZml4SGVhZGVyKSAmJiBoZWFkZXJOb2RlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKCgpID0+ICh7IGhlYWRlck9mZnNldDogZ2V0T2Zmc2V0KGhlYWRlck5vZGUpIH0pKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YWJsZU5vZGUgPSB0aGlzLnRhYmxlUmVmPy5jdXJyZW50O1xuICAgIGlmIChpc051bWJlck9yVHJ1ZShhZmZpeEhvcml6b250YWxTY3JvbGxiYXIpICYmIHRhYmxlTm9kZSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSgoKSA9PiAoeyB0YWJsZU9mZnNldDogZ2V0T2Zmc2V0KHRhYmxlTm9kZSkgfSkpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVXaW5kb3dTY3JvbGwgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBhZmZpeEhlYWRlciwgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChpc051bWJlck9yVHJ1ZShhZmZpeEhlYWRlcikpIHtcbiAgICAgIHRoaXMuYWZmaXhUYWJsZUhlYWRlcigpO1xuICAgIH1cbiAgICBpZiAoaXNOdW1iZXJPclRydWUoYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyKSkge1xuICAgICAgdGhpcy5hZmZpeEhvcml6b250YWxTY3JvbGxiYXIoKTtcbiAgICB9XG4gIH07XG5cbiAgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyID0gKCkgPT4ge1xuICAgIGNvbnN0IHNjcm9sbFkgPSB3aW5kb3cuc2Nyb2xsWSB8fCB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gZ2V0SGVpZ2h0KHdpbmRvdyk7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlaWdodCgpO1xuXG4gICAgY29uc3QgeyB0YWJsZU9mZnNldCwgZml4ZWRIb3Jpem9udGFsU2Nyb2xsYmFyIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGhlYWRlckhlaWdodCA9IHRoaXMuZ2V0VGFibGVIZWFkZXJIZWlnaHQoKTtcbiAgICBjb25zdCBib3R0b20gPSB0eXBlb2YgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyID09PSAnbnVtYmVyJyA/IGFmZml4SG9yaXpvbnRhbFNjcm9sbGJhciA6IDA7XG5cbiAgICBjb25zdCBmaXhlZFNjcm9sbGJhciA9XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBzY3JvbGxZICsgd2luZG93SGVpZ2h0IDwgaGVpZ2h0ICsgKHRhYmxlT2Zmc2V0LnRvcCArIGJvdHRvbSkgJiZcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHNjcm9sbFkgKyB3aW5kb3dIZWlnaHQgLSBoZWFkZXJIZWlnaHQgPiB0YWJsZU9mZnNldD8udG9wICsgYm90dG9tO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zY3JvbGxiYXJYUmVmPy5jdXJyZW50Py5iYXJSZWY/LmN1cnJlbnQgJiZcbiAgICAgIGZpeGVkSG9yaXpvbnRhbFNjcm9sbGJhciAhPT0gZml4ZWRTY3JvbGxiYXJcbiAgICApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaXhlZEhvcml6b250YWxTY3JvbGxiYXI6IGZpeGVkU2Nyb2xsYmFyIH0pO1xuICAgIH1cbiAgfTtcblxuICBhZmZpeFRhYmxlSGVhZGVyID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgYWZmaXhIZWFkZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdG9wID0gdHlwZW9mIGFmZml4SGVhZGVyID09PSAnbnVtYmVyJyA/IGFmZml4SGVhZGVyIDogMDtcbiAgICBjb25zdCB7IGhlYWRlck9mZnNldCwgY29udGVudEhlaWdodCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBzY3JvbGxZID0gd2luZG93LnNjcm9sbFkgfHwgd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IGZpeGVkSGVhZGVyID1cbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHNjcm9sbFkgLSAoaGVhZGVyT2Zmc2V0LnRvcCAtIHRvcCkgPj0gMCAmJiBzY3JvbGxZIDwgaGVhZGVyT2Zmc2V0LnRvcCAtIHRvcCArIGNvbnRlbnRIZWlnaHQ7XG5cbiAgICBpZiAodGhpcy5hZmZpeEhlYWRlcldyYXBwZXJSZWYuY3VycmVudCkge1xuICAgICAgdG9nZ2xlQ2xhc3ModGhpcy5hZmZpeEhlYWRlcldyYXBwZXJSZWYuY3VycmVudCwgJ2ZpeGVkJywgZml4ZWRIZWFkZXIpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVTb3J0Q29sdW1uID0gKGRhdGFLZXk6IHN0cmluZykgPT4ge1xuICAgIGxldCBzb3J0VHlwZSA9IHRoaXMuZ2V0U29ydFR5cGUoKTtcblxuICAgIGlmICh0aGlzLnByb3BzLnNvcnRDb2x1bW4gPT09IGRhdGFLZXkpIHtcbiAgICAgIHNvcnRUeXBlID1cbiAgICAgICAgc29ydFR5cGUgPT09IFNPUlRfVFlQRS5BU0MgPyAoU09SVF9UWVBFLkRFU0MgYXMgU29ydFR5cGUpIDogKFNPUlRfVFlQRS5BU0MgYXMgU29ydFR5cGUpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNvcnRUeXBlIH0pO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uU29ydENvbHVtbj8uKGRhdGFLZXksIHNvcnRUeXBlKTtcbiAgfTtcblxuICBoYW5kbGVDb2x1bW5SZXNpemVFbmQgPSAoXG4gICAgY29sdW1uV2lkdGg6IG51bWJlcixcbiAgICBfY3Vyc29yRGVsdGE6IG51bWJlcixcbiAgICBkYXRhS2V5OiBhbnksXG4gICAgaW5kZXg6IG51bWJlcixcbiAgKSA9PiB7XG4gICAgdGhpcy5fY2FjaGVDZWxscyA9IG51bGw7XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDb2x1bW5SZXNpemluZzogZmFsc2UsIFtgJHtkYXRhS2V5fV8ke2luZGV4fV93aWR0aGBdOiBjb2x1bW5XaWR0aCB9KTtcblxuICAgIGFkZFN0eWxlKHRoaXMubW91c2VBcmVhUmVmLmN1cnJlbnQsIHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICB9O1xuXG4gIGhhbmRsZUNvbHVtblJlc2l6ZVN0YXJ0ID0gKHdpZHRoOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgZml4ZWQ6IGJvb2xlYW4pID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDb2x1bW5SZXNpemluZzogdHJ1ZSB9KTtcbiAgICB0aGlzLmhhbmRsZUNvbHVtblJlc2l6ZU1vdmUod2lkdGgsIGxlZnQsIGZpeGVkKTtcbiAgfTtcblxuICBoYW5kbGVDb2x1bW5SZXNpemVNb3ZlID0gKHdpZHRoOiBudW1iZXIsIGxlZnQ6IG51bWJlciwgZml4ZWQ6IGJvb2xlYW4pID0+IHtcbiAgICBsZXQgbW91c2VBcmVhTGVmdCA9IHdpZHRoICsgbGVmdDtcbiAgICBsZXQgeCA9IG1vdXNlQXJlYUxlZnQ7XG4gICAgbGV0IGRpciA9ICdsZWZ0JztcblxuICAgIGlmICh0aGlzLmlzUlRMKCkpIHtcbiAgICAgIG1vdXNlQXJlYUxlZnQgKz0gdGhpcy5taW5TY3JvbGxYICsgU0NST0xMQkFSX1dJRFRIO1xuICAgICAgZGlyID0gJ3JpZ2h0JztcbiAgICB9XG5cbiAgICBpZiAoIWZpeGVkKSB7XG4gICAgICB4ID0gbW91c2VBcmVhTGVmdCArICh0aGlzLmlzUlRMKCkgPyAtdGhpcy5zY3JvbGxYIDogdGhpcy5zY3JvbGxYKTtcbiAgICB9XG5cbiAgICBhZGRTdHlsZSh0aGlzLm1vdXNlQXJlYVJlZi5jdXJyZW50LCB7IGRpc3BsYXk6ICdibG9jaycsIFtkaXJdOiBgJHt4fXB4YCB9KTtcbiAgfTtcblxuICBoYW5kbGVUcmVlVG9nZ2xlID0gKHJvd0tleTogYW55LCBfcm93SW5kZXg6IG51bWJlciwgcm93RGF0YTogYW55KSA9PiB7XG4gICAgY29uc3QgZXhwYW5kZWRSb3dLZXlzID0gdGhpcy5nZXRFeHBhbmRlZFJvd0tleXMoKTtcblxuICAgIGxldCBvcGVuID0gZmFsc2U7XG4gICAgY29uc3QgbmV4dEV4cGFuZGVkUm93S2V5cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBhbmRlZFJvd0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGtleSA9IGV4cGFuZGVkUm93S2V5c1tpXTtcbiAgICAgIGlmIChrZXkgPT09IHJvd0tleSkge1xuICAgICAgICBvcGVuID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgbmV4dEV4cGFuZGVkUm93S2V5cy5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFvcGVuKSB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBuZXh0RXhwYW5kZWRSb3dLZXlzLnB1c2gocm93S2V5KTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGV4cGFuZGVkUm93S2V5czogbmV4dEV4cGFuZGVkUm93S2V5cyB9KTtcbiAgICB0aGlzLnByb3BzLm9uRXhwYW5kQ2hhbmdlPy4oIW9wZW4sIHJvd0RhdGEpO1xuICB9O1xuXG4gIGhhbmRsZVNjcm9sbFggPSAoZGVsdGE6IG51bWJlcikgPT4ge1xuICAgIHRoaXMuaGFuZGxlV2hlZWwoZGVsdGEsIDApO1xuICB9O1xuICBoYW5kbGVTY3JvbGxZID0gKGRlbHRhOiBudW1iZXIpID0+IHtcbiAgICB0aGlzLmhhbmRsZVdoZWVsKDAsIGRlbHRhKTtcbiAgfTtcblxuICBoYW5kbGVXaGVlbCA9IChkZWx0YVg6IG51bWJlciwgZGVsdGFZOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB7IG9uU2Nyb2xsLCB2aXJ0dWFsaXplZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IGNvbnRlbnRXaWR0aCwgd2lkdGggfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAoIXRoaXMudGFibGVSZWYuY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHRTY3JvbGxYID0gY29udGVudFdpZHRoIDw9IHdpZHRoID8gMCA6IHRoaXMuc2Nyb2xsWCAtIGRlbHRhWDtcbiAgICBjb25zdCBuZXh0U2Nyb2xsWSA9IHRoaXMuc2Nyb2xsWSAtIGRlbHRhWTtcblxuICAgIHRoaXMuc2Nyb2xsWSA9IE1hdGgubWluKDAsIG5leHRTY3JvbGxZIDwgdGhpcy5taW5TY3JvbGxZID8gdGhpcy5taW5TY3JvbGxZIDogbmV4dFNjcm9sbFkpO1xuICAgIHRoaXMuc2Nyb2xsWCA9IE1hdGgubWluKDAsIG5leHRTY3JvbGxYIDwgdGhpcy5taW5TY3JvbGxYID8gdGhpcy5taW5TY3JvbGxYIDogbmV4dFNjcm9sbFgpO1xuICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcblxuICAgIG9uU2Nyb2xsPy4odGhpcy5zY3JvbGxYLCB0aGlzLnNjcm9sbFkpO1xuXG4gICAgaWYgKHZpcnR1YWxpemVkKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNTY3JvbGxpbmc6IHRydWUsXG4gICAgICAgIHNjcm9sbFk6IHRoaXMuc2Nyb2xsWSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5kaXNhYmxlRXZlbnRzVGltZW91dElkKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uVGltZW91dCh0aGlzLmRpc2FibGVFdmVudHNUaW1lb3V0SWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLmRpc2FibGVFdmVudHNUaW1lb3V0SWQgPSByZXF1ZXN0QW5pbWF0aW9uVGltZW91dCh0aGlzLmRlYm91bmNlU2Nyb2xsRW5kZWRDYWxsYmFjaywgMTUwKTtcbiAgICB9XG4gIH07XG5cbiAgZGVib3VuY2VTY3JvbGxFbmRlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgIHRoaXMuZGlzYWJsZUV2ZW50c1RpbWVvdXRJZCA9IG51bGw7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1Njcm9sbGluZzogZmFsc2UsXG4gICAgfSk7XG4gIH07XG5cbiAgLy8g5aSE55CG56e75Yqo56uvIFRvdWNoIOS6i+S7tiwgIFN0YXJ0IOeahOaXtuWAmeWIneWni+WMliB4LHlcbiAgaGFuZGxlVG91Y2hTdGFydCA9IChldmVudDogUmVhY3QuVG91Y2hFdmVudCkgPT4ge1xuICAgIGlmIChldmVudC50b3VjaGVzKSB7XG4gICAgICBjb25zdCB7IHBhZ2VYLCBwYWdlWSB9ID0gZXZlbnQudG91Y2hlc1swXTtcbiAgICAgIHRoaXMudG91Y2hYID0gcGFnZVg7XG4gICAgICB0aGlzLnRvdWNoWSA9IHBhZ2VZO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMub25Ub3VjaFN0YXJ0Py4oZXZlbnQpO1xuICB9O1xuXG4gIC8vIOWkhOeQhuenu+WKqOerryBUb3VjaCDkuovku7YsIE1vdmUg55qE5pe25YCZ5Yid5aeL5YyW77yM5pu05pawIHNjcm9sbFxuICBoYW5kbGVUb3VjaE1vdmUgPSAoZXZlbnQ6IFJlYWN0LlRvdWNoRXZlbnQpID0+IHtcbiAgICBjb25zdCB7IGF1dG9IZWlnaHQgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAoZXZlbnQudG91Y2hlcykge1xuICAgICAgY29uc3QgeyBwYWdlWCwgcGFnZVkgfSA9IGV2ZW50LnRvdWNoZXNbMF07XG4gICAgICBjb25zdCBkZWx0YVggPSB0aGlzLnRvdWNoWCAtIHBhZ2VYO1xuICAgICAgY29uc3QgZGVsdGFZID0gYXV0b0hlaWdodCA/IDAgOiB0aGlzLnRvdWNoWSAtIHBhZ2VZO1xuXG4gICAgICBpZiAoIXRoaXMuc2hvdWxkSGFuZGxlV2hlZWxZKGRlbHRhWSkgJiYgIXRoaXMuc2hvdWxkSGFuZGxlV2hlZWxYKGRlbHRhWCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdD8uKCk7XG5cbiAgICAgIHRoaXMuaGFuZGxlV2hlZWwoZGVsdGFYLCBkZWx0YVkpO1xuICAgICAgdGhpcy5zY3JvbGxiYXJYUmVmLmN1cnJlbnQ/Lm9uV2hlZWxTY3JvbGw/LihkZWx0YVgpO1xuICAgICAgdGhpcy5zY3JvbGxiYXJZUmVmLmN1cnJlbnQ/Lm9uV2hlZWxTY3JvbGw/LihkZWx0YVkpO1xuXG4gICAgICB0aGlzLnRvdWNoWCA9IHBhZ2VYO1xuICAgICAgdGhpcy50b3VjaFkgPSBwYWdlWTtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzLm9uVG91Y2hNb3ZlPy4oZXZlbnQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiDlvZPnlKjmiLflnKggVGFibGUg5YaF5L2/55SoIHRhYiDplK7vvIzop6blj5HkuoYgb25TY3JvbGwg5LqL5Lu277yM6L+Z5Liq5pe25YCZ5bqU6K+l5pu05paw5rua5Yqo5p2h5L2N572uXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yc3VpdGUvcnN1aXRlL2lzc3Vlcy8yMzRcbiAgICovXG4gIGhhbmRsZUJvZHlTY3JvbGwgPSAoZXZlbnQ6IFJlYWN0LlVJRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KSA9PiB7XG4gICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gdGhpcy50YWJsZUJvZHlSZWYuY3VycmVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxlZnQgPSBzY3JvbGxMZWZ0KGV2ZW50LnRhcmdldCk7XG4gICAgY29uc3QgdG9wID0gc2Nyb2xsVG9wKGV2ZW50LnRhcmdldCk7XG5cbiAgICBpZiAodG9wID09PSAwICYmIGxlZnQgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbldoZWVsKGxlZnQsIHRvcCk7XG5cbiAgICBzY3JvbGxMZWZ0KGV2ZW50LnRhcmdldCwgMCk7XG4gICAgc2Nyb2xsVG9wKGV2ZW50LnRhcmdldCwgMCk7XG4gIH07XG5cbiAgaW5pdFBvc2l0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzUlRMKCkpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGNvbnRlbnRXaWR0aCwgd2lkdGggfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgdGhpcy5zY3JvbGxYID0gd2lkdGggLSBjb250ZW50V2lkdGggLSBTQ1JPTExCQVJfV0lEVEg7XG4gICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJYUmVmPy5jdXJyZW50Py5yZXNldFNjcm9sbEJhclBvc2l0aW9uPy4oLXRoaXMuc2Nyb2xsWCk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVQb3NpdGlvbigpIHtcbiAgICAvKipcbiAgICAgKiDlvZPlrZjlnKjplIHlrprliJfmg4XlhrXlpITnkIZcbiAgICAgKi9cbiAgICBpZiAodGhpcy5zdGF0ZS5zaG91bGRGaXhlZENvbHVtbikge1xuICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbkJ5Rml4ZWRDZWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHdoZWVsU3R5bGUgPSB7fTtcbiAgICAgIGNvbnN0IGhlYWRlclN0eWxlID0ge307XG5cbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMudHJhbnNsYXRlRE9NUG9zaXRpb25YWSh3aGVlbFN0eWxlLCB0aGlzLnNjcm9sbFgsIHRoaXMuc2Nyb2xsWSk7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnRyYW5zbGF0ZURPTVBvc2l0aW9uWFkoaGVhZGVyU3R5bGUsIHRoaXMuc2Nyb2xsWCwgMCk7XG5cbiAgICAgIGNvbnN0IHdoZWVsRWxlbWVudCA9IHRoaXMud2hlZWxXcmFwcGVyUmVmPy5jdXJyZW50O1xuICAgICAgY29uc3QgaGVhZGVyRWxlbWVudCA9IHRoaXMuaGVhZGVyV3JhcHBlclJlZj8uY3VycmVudDtcbiAgICAgIGNvbnN0IGFmZml4SGVhZGVyRWxlbWVudCA9IHRoaXMuYWZmaXhIZWFkZXJXcmFwcGVyUmVmPy5jdXJyZW50O1xuXG4gICAgICB3aGVlbEVsZW1lbnQgJiYgYWRkU3R5bGUod2hlZWxFbGVtZW50LCB3aGVlbFN0eWxlKTtcbiAgICAgIGhlYWRlckVsZW1lbnQgJiYgYWRkU3R5bGUoaGVhZGVyRWxlbWVudCwgaGVhZGVyU3R5bGUpO1xuXG4gICAgICBpZiAoYWZmaXhIZWFkZXJFbGVtZW50Py5oYXNDaGlsZE5vZGVzPy4oKSkge1xuICAgICAgICBhZGRTdHlsZShhZmZpeEhlYWRlckVsZW1lbnQuZmlyc3RDaGlsZCwgaGVhZGVyU3R5bGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnRhYmxlSGVhZGVyUmVmPy5jdXJyZW50KSB7XG4gICAgICB0b2dnbGVDbGFzcyhcbiAgICAgICAgdGhpcy50YWJsZUhlYWRlclJlZi5jdXJyZW50LFxuICAgICAgICB0aGlzLmFkZFByZWZpeCgnY2VsbC1ncm91cC1zaGFkb3cnKSxcbiAgICAgICAgdGhpcy5zY3JvbGxZIDwgMCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlUG9zaXRpb25CeUZpeGVkQ2VsbCgpIHtcbiAgICBjb25zdCB3aGVlbEdyb3VwU3R5bGUgPSB7fTtcbiAgICBjb25zdCB3aGVlbFN0eWxlID0ge307XG4gICAgY29uc3Qgc2Nyb2xsR3JvdXBzID0gdGhpcy5nZXRTY3JvbGxDZWxsR3JvdXBzKCk7XG4gICAgY29uc3QgZml4ZWRMZWZ0R3JvdXBzID0gdGhpcy5nZXRGaXhlZExlZnRDZWxsR3JvdXBzKCk7XG4gICAgY29uc3QgZml4ZWRSaWdodEdyb3VwcyA9IHRoaXMuZ2V0Rml4ZWRSaWdodENlbGxHcm91cHMoKTtcbiAgICBjb25zdCB7IGNvbnRlbnRXaWR0aCwgd2lkdGggfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy50cmFuc2xhdGVET01Qb3NpdGlvblhZKHdoZWVsR3JvdXBTdHlsZSwgdGhpcy5zY3JvbGxYLCAwKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy50cmFuc2xhdGVET01Qb3NpdGlvblhZKHdoZWVsU3R5bGUsIDAsIHRoaXMuc2Nyb2xsWSk7XG5cbiAgICBjb25zdCBzY3JvbGxBcnJheUdyb3VwcyA9IEFycmF5LmZyb20oc2Nyb2xsR3JvdXBzKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2Nyb2xsQXJyYXlHcm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGdyb3VwID0gc2Nyb2xsQXJyYXlHcm91cHNbaV07XG4gICAgICBhZGRTdHlsZShncm91cCwgd2hlZWxHcm91cFN0eWxlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy53aGVlbFdyYXBwZXJSZWY/LmN1cnJlbnQpIHtcbiAgICAgIGFkZFN0eWxlKHRoaXMud2hlZWxXcmFwcGVyUmVmLmN1cnJlbnQsIHdoZWVsU3R5bGUpO1xuICAgIH1cblxuICAgIGNvbnN0IGxlZnRTaGFkb3dDbGFzc05hbWUgPSB0aGlzLmFkZFByZWZpeCgnY2VsbC1ncm91cC1sZWZ0LXNoYWRvdycpO1xuICAgIGNvbnN0IHJpZ2h0U2hhZG93Q2xhc3NOYW1lID0gdGhpcy5hZGRQcmVmaXgoJ2NlbGwtZ3JvdXAtcmlnaHQtc2hhZG93Jyk7XG4gICAgY29uc3Qgc2hvd0xlZnRTaGFkb3cgPSB0aGlzLnNjcm9sbFggPCAwO1xuICAgIGNvbnN0IHNob3dSaWdodFNoYWRvdyA9IHdpZHRoIC0gY29udGVudFdpZHRoIC0gU0NST0xMQkFSX1dJRFRIICE9PSB0aGlzLnNjcm9sbFg7XG5cbiAgICB0b2dnbGVDbGFzcyhmaXhlZExlZnRHcm91cHMsIGxlZnRTaGFkb3dDbGFzc05hbWUsIHNob3dMZWZ0U2hhZG93KTtcbiAgICB0b2dnbGVDbGFzcyhmaXhlZFJpZ2h0R3JvdXBzLCByaWdodFNoYWRvd0NsYXNzTmFtZSwgc2hvd1JpZ2h0U2hhZG93KTtcbiAgfVxuXG4gIHNob3VsZEhhbmRsZVdoZWVsWCA9IChkZWx0YTogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgeyBkaXNhYmxlZFNjcm9sbCwgbG9hZGluZyB9ID0gdGhpcy5wcm9wcztcblxuICAgIGlmIChkZWx0YSA9PT0gMCB8fCBkaXNhYmxlZFNjcm9sbCB8fCBsb2FkaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIHNob3VsZEhhbmRsZVdoZWVsWSA9IChkZWx0YTogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgeyBkaXNhYmxlZFNjcm9sbCwgbG9hZGluZyB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoZGVsdGEgPT09IDAgfHwgZGlzYWJsZWRTY3JvbGwgfHwgbG9hZGluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gKGRlbHRhID49IDAgJiYgdGhpcy5zY3JvbGxZID4gdGhpcy5taW5TY3JvbGxZKSB8fCAoZGVsdGEgPCAwICYmIHRoaXMuc2Nyb2xsWSA8IDApO1xuICB9O1xuXG4gIHNob3VsZFJlbmRlckV4cGFuZGVkUm93KHJvd0RhdGE6IG9iamVjdCkge1xuICAgIGNvbnN0IHsgcm93S2V5LCByZW5kZXJSb3dFeHBhbmRlZCwgaXNUcmVlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGV4cGFuZGVkUm93S2V5cyA9IHRoaXMuZ2V0RXhwYW5kZWRSb3dLZXlzKCkgfHwgW107XG5cbiAgICByZXR1cm4gKFxuICAgICAgaXNGdW5jdGlvbihyZW5kZXJSb3dFeHBhbmRlZCkgJiZcbiAgICAgICFpc1RyZWUgJiZcbiAgICAgIGV4cGFuZGVkUm93S2V5cy5zb21lKGtleSA9PiBrZXkgPT09IHJvd0RhdGFbcm93S2V5XSlcbiAgICApO1xuICB9XG5cbiAgLy8gQHRzLWlnbm9yZVxuICBhZGRQcmVmaXggPSAobmFtZTogc3RyaW5nKTpzdHJpbmcgPT4gcHJlZml4KHRoaXMucHJvcHMuY2xhc3NQcmVmaXgpKG5hbWUpO1xuXG4gIGNhbGN1bGF0ZVJvd01heEhlaWdodCgpIHtcbiAgICBjb25zdCB7IHdvcmRXcmFwIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh3b3JkV3JhcCkge1xuICAgICAgY29uc3QgdGFibGVSb3dzTWF4SGVpZ2h0ID0gW107XG4gICAgICBjb25zdCB0YWJsZVJvd3MgPSBPYmplY3QudmFsdWVzKHRoaXMudGFibGVSb3dzKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YWJsZVJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgW3Jvd10gPSB0YWJsZVJvd3NbaV07XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICBjb25zdCBjZWxscyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKGAuJHt0aGlzLmFkZFByZWZpeCgnY2VsbC13cmFwJyl9YCkgfHwgW107XG4gICAgICAgICAgY29uc3QgY2VsbEFycmF5ID0gQXJyYXkuZnJvbShjZWxscyk7XG4gICAgICAgICAgbGV0IG1heEhlaWdodCA9IDA7XG5cbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNlbGxBcnJheS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IGNlbGxBcnJheVtqXTtcbiAgICAgICAgICAgIGNvbnN0IGggPSBnZXRIZWlnaHQoY2VsbCk7XG4gICAgICAgICAgICBtYXhIZWlnaHQgPSBNYXRoLm1heChtYXhIZWlnaHQsIGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0YWJsZVJvd3NNYXhIZWlnaHQucHVzaChtYXhIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0YWJsZVJvd3NNYXhIZWlnaHQgfSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlVGFibGVXaWR0aCA9ICgpID0+IHtcbiAgICBjb25zdCB0YWJsZSA9IHRoaXMudGFibGVSZWY/LmN1cnJlbnQ7XG4gICAgY29uc3QgeyB3aWR0aCB9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmICh0YWJsZSkge1xuICAgICAgY29uc3QgbmV4dFdpZHRoID0gZ2V0V2lkdGgodGFibGUpO1xuICAgICAgaWYgKHdpZHRoICE9PSBuZXh0V2lkdGgpIHtcbiAgICAgICAgdGhpcy5zY3JvbGxYID0gMDtcbiAgICAgICAgdGhpcy5zY3JvbGxiYXJYUmVmPy5jdXJyZW50Py5yZXNldFNjcm9sbEJhclBvc2l0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NhY2hlQ2VsbHMgPSBudWxsO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHdpZHRoOiBuZXh0V2lkdGggfSk7XG4gICAgfVxuICAgIHRoaXMuc2V0T2Zmc2V0QnlBZmZpeCgpO1xuICB9O1xuXG4gIGNhbGN1bGF0ZVRhYmxlQ29udGVudFdpZHRoKHByZXZQcm9wczogVGFibGVQcm9wcykge1xuICAgIGNvbnN0IHRhYmxlID0gdGhpcy50YWJsZVJlZj8uY3VycmVudDtcbiAgICBjb25zdCByb3cgPSB0YWJsZS5xdWVyeVNlbGVjdG9yKGAuJHt0aGlzLmFkZFByZWZpeCgncm93Jyl9Om5vdCgudmlydHVhbGl6ZWQpYCk7XG4gICAgY29uc3QgY29udGVudFdpZHRoID0gcm93ID8gZ2V0V2lkdGgocm93KSA6IDA7XG5cbiAgICB0aGlzLnNldFN0YXRlKHsgY29udGVudFdpZHRoIH0pO1xuICAgIC8vIOi/memHjCAtU0NST0xMQkFSX1dJRFRIIOaYr+S4uuS6huiuqea7muWKqOadoeS4jeaMoeS9j+WGheWuuemDqOWIhlxuICAgIHRoaXMubWluU2Nyb2xsWCA9IC0oY29udGVudFdpZHRoIC0gdGhpcy5zdGF0ZS53aWR0aCkgLSBTQ1JPTExCQVJfV0lEVEg7XG5cbiAgICAvKipcbiAgICAgKiAxLuWIpOaWrSBUYWJsZSDliJfmlbDmmK/lkKblj5HnlJ/lj5jljJZcbiAgICAgKiAyLuWIpOaWrSBUYWJsZSDlhoXlrrnljLrln5/mmK/lkKblrr3luqbmnInlj5jljJZcbiAgICAgKlxuICAgICAqIOa7oei2syAxIOWSjCAyIOWImeabtOaWsOaoquWQkea7muWKqOadoeS9jee9rlxuICAgICAqL1xuXG4gICAgaWYgKFxuICAgICAgZmxhdHRlbih0aGlzLnByb3BzLmNoaWxkcmVuIGFzIGFueVtdKS5sZW5ndGggIT09XG4gICAgICBmbGF0dGVuKHByZXZQcm9wcy5jaGlsZHJlbiBhcyBhbnlbXSkubGVuZ3RoICYmXG4gICAgICB0aGlzLnN0YXRlLmNvbnRlbnRXaWR0aCAhPT0gY29udGVudFdpZHRoXG4gICAgKSB7XG4gICAgICB0aGlzLnNjcm9sbExlZnQoMCk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlVGFibGVDb250ZXh0SGVpZ2h0KHByZXZQcm9wcz86IFRhYmxlUHJvcHMpIHtcbiAgICBjb25zdCB0YWJsZSA9IHRoaXMudGFibGVSZWYuY3VycmVudDtcbiAgICBjb25zdCByb3dzID0gdGFibGUucXVlcnlTZWxlY3RvckFsbChgLiR7dGhpcy5hZGRQcmVmaXgoJ3JvdycpfWApIHx8IFtdO1xuICAgIGNvbnN0IHsgaGVpZ2h0LCBhdXRvSGVpZ2h0LCByb3dIZWlnaHQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaGVhZGVySGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlYWRlckhlaWdodCgpO1xuICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSByb3dzLmxlbmd0aFxuICAgICAgPyBBcnJheS5mcm9tKHJvd3MpXG4gICAgICAgIC5tYXAocm93ID0+IGdldEhlaWdodChyb3cpIHx8IHJvd0hlaWdodClcbiAgICAgICAgLnJlZHVjZSgoeCwgeSkgPT4geCArIHkpXG4gICAgICA6IDA7XG5cbiAgICBjb25zdCBuZXh0Q29udGVudEhlaWdodCA9IGNvbnRlbnRIZWlnaHQgLSBoZWFkZXJIZWlnaHQ7XG5cbiAgICBpZiAobmV4dENvbnRlbnRIZWlnaHQgIT09IHRoaXMuc3RhdGUuY29udGVudEhlaWdodCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRlbnRIZWlnaHQ6IG5leHRDb250ZW50SGVpZ2h0IH0pO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHByZXZQcm9wcyAmJlxuICAgICAgLy8g5b2TIGRhdGEg5pu05paw77yM5oiW6ICF6KGo5qC86auY5bqm5pu05paw77yM5YiZ5pu05paw5rua5Yqo5p2hXG4gICAgICAocHJldlByb3BzLmhlaWdodCAhPT0gaGVpZ2h0IHx8IHByZXZQcm9wcy5kYXRhICE9PSB0aGlzLnByb3BzLmRhdGEpICYmXG4gICAgICB0aGlzLnNjcm9sbFkgIT09IDBcbiAgICApIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wKE1hdGguYWJzKHRoaXMuc2Nyb2xsWSkpO1xuICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIGlmICghYXV0b0hlaWdodCkge1xuICAgICAgLy8g6L+Z6YeMIC1TQ1JPTExCQVJfV0lEVEgg5piv5Li65LqG6K6p5rua5Yqo5p2h5LiN5oyh5L2P5YaF5a656YOo5YiGXG4gICAgICB0aGlzLm1pblNjcm9sbFkgPSAtKGNvbnRlbnRIZWlnaHQgLSBoZWlnaHQpIC0gU0NST0xMQkFSX1dJRFRIO1xuICAgIH1cblxuICAgIC8vIOWmguaenOWGheWuueWMuuWfn+eahOmrmOW6puWwj+S6juihqOagvOeahOmrmOW6pu+8jOWImemHjee9riBZIOWdkOagh+a7muWKqOadoVxuICAgIGlmIChjb250ZW50SGVpZ2h0IDwgaGVpZ2h0KSB7XG4gICAgICB0aGlzLnNjcm9sbFRvcCgwKTtcbiAgICB9XG5cbiAgICAvLyDlpoLmnpwgc2Nyb2xsVG9wIOeahOWAvOWkp+S6juWPr+S7pea7muWKqOeahOiMg+WbtCDvvIzliJnph43nva4gWSDlnZDmoIfmu5rliqjmnaFcbiAgICAvLyDlvZMgVGFibGUg5Li6IHZpcnR1YWxpemVkIOaXtu+8jCB3aGVlbCDkuovku7bop6blj5Hmr4/mrKHpg73kvJrov5vlhaXor6XpgLvovpHvvIwg6YG/5YWN5Zyo5rua5Yqo5Yiw5bqV6YOo5ZCO5rua5Yqo5p2h6YeN572uLCArU0NST0xMQkFSX1dJRFRIXG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2Nyb2xsWSkgKyBoZWlnaHQgLSBoZWFkZXJIZWlnaHQgPiBuZXh0Q29udGVudEhlaWdodCArIFNDUk9MTEJBUl9XSURUSCkge1xuICAgICAgdGhpcy5zY3JvbGxUb3AodGhpcy5zY3JvbGxZKTtcbiAgICB9XG4gIH1cblxuICBnZXRDb250cm9sbGVkU2Nyb2xsVG9wVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5hdXRvSGVpZ2h0KSB7XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIH1cbiAgICBjb25zdCB7IGNvbnRlbnRIZWlnaHQgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaGVhZGVySGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlYWRlckhlaWdodCgpO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZ2V0VGFibGVIZWlnaHQoKTtcblxuICAgIC8vIOa7muWKqOWAvOeahOacgOWkp+iMg+WbtOWIpOaWrVxuICAgIHZhbHVlID0gTWF0aC5taW4odmFsdWUsIE1hdGgubWF4KDAsIGNvbnRlbnRIZWlnaHQgLSAoaGVpZ2h0IC0gaGVhZGVySGVpZ2h0KSkpO1xuXG4gICAgLy8gdmFsdWUg5YC85piv6KGo5qC855CG6K665rua5Yqo5L2N572u55qE5LiA5Liq5YC877yM6YCa6L+HIHZhbHVlIOiuoeeul+WHuiBzY3JvbGxZIOWdkOagh+WAvOS4jua7muWKqOadoeS9jee9rueahOWAvFxuICAgIHJldHVybiBbLXZhbHVlLCAodmFsdWUgLyBjb250ZW50SGVpZ2h0KSAqIChoZWlnaHQgLSBoZWFkZXJIZWlnaHQpXTtcbiAgfVxuXG4gIGdldENvbnRyb2xsZWRTY3JvbGxMZWZ0VmFsdWUodmFsdWUpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRXaWR0aCwgd2lkdGggfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAvLyDmu5rliqjlgLznmoTmnIDlpKfojIPlm7TliKTmlq1cbiAgICB2YWx1ZSA9IE1hdGgubWluKHZhbHVlLCBNYXRoLm1heCgwLCBjb250ZW50V2lkdGggLSB3aWR0aCkpO1xuXG4gICAgcmV0dXJuIFstdmFsdWUsICh2YWx1ZSAvIGNvbnRlbnRXaWR0aCkgKiB3aWR0aF07XG4gIH1cblxuICAvKipcbiAgICogcHVibGljIG1ldGhvZFxuICAgKi9cbiAgc2Nyb2xsVG9wID0gKHRvcCA9IDApID0+IHtcbiAgICBjb25zdCBbc2Nyb2xsWSwgaGFuZGxlU2Nyb2xsWV0gPSB0aGlzLmdldENvbnRyb2xsZWRTY3JvbGxUb3BWYWx1ZSh0b3ApO1xuXG4gICAgdGhpcy5zY3JvbGxZID0gc2Nyb2xsWTtcbiAgICB0aGlzLnNjcm9sbGJhcllSZWY/LmN1cnJlbnQ/LnJlc2V0U2Nyb2xsQmFyUG9zaXRpb24/LihoYW5kbGVTY3JvbGxZKTtcbiAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICAvKipcbiAgICAgKiDlvZPlvIDlkK8gdmlydHVhbGl6ZWTvvIzosIPnlKggc2Nyb2xsVG9wIOWQjuS8muWHuueOsOeZveWxj+eOsOixoe+8jFxuICAgICAqIOWOn+WboOaYr+ebtOaOpeaTjeS9nCBET00g55qE5Z2Q5qCH77yM5L2G5piv57uE5Lu25rKh5pyJ6YeN5paw5riy5p+T77yM6ZyA6KaB6LCD55SoIGZvcmNlVXBkYXRlIOmHjeaWsOi/m+WFpSByZW5kZXLjgIJcbiAgICAgKiBGaXg6IHJzdWl0ZSMxMDQ0XG4gICAgICovXG4gICAgaWYgKHRoaXMucHJvcHMudmlydHVhbGl6ZWQgJiYgdGhpcy5zdGF0ZS5jb250ZW50SGVpZ2h0ID4gdGhpcy5wcm9wcy5oZWlnaHQpIHtcbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gcHVibGljIG1ldGhvZFxuICBzY3JvbGxMZWZ0ID0gKGxlZnQgPSAwKSA9PiB7XG4gICAgY29uc3QgW3Njcm9sbFgsIGhhbmRsZVNjcm9sbFhdID0gdGhpcy5nZXRDb250cm9sbGVkU2Nyb2xsTGVmdFZhbHVlKGxlZnQpO1xuICAgIHRoaXMuc2Nyb2xsWCA9IHNjcm9sbFg7XG4gICAgdGhpcy5zY3JvbGxiYXJYUmVmPy5jdXJyZW50Py5yZXNldFNjcm9sbEJhclBvc2l0aW9uPy4oaGFuZGxlU2Nyb2xsWCk7XG4gICAgdGhpcy51cGRhdGVQb3NpdGlvbigpO1xuICB9O1xuXG4gIHNjcm9sbFRvID0gKGNvb3JkOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0pID0+IHtcbiAgICBjb25zdCB7IHgsIHkgfSA9IGNvb3JkIHx8IHt9O1xuICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdCh4KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB5ID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5zY3JvbGxUb3AoeSk7XG4gICAgfVxuICB9O1xuXG4gIGJpbmRUYWJsZVJvd3NSZWYgPSAoaW5kZXg6IG51bWJlciB8IHN0cmluZywgcm93RGF0YTogYW55KSA9PiAocmVmOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgIGlmIChyZWYpIHtcbiAgICAgIHRoaXMudGFibGVSb3dzW2luZGV4XSA9IFtyZWYsIHJvd0RhdGFdO1xuICAgIH1cbiAgfTtcblxuICBiaW5kUm93Q2xpY2sgPSAocm93RGF0YTogb2JqZWN0KSA9PiB7XG4gICAgcmV0dXJuIChldmVudDogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy5vblJvd0NsaWNrPy4ocm93RGF0YSwgZXZlbnQpO1xuICAgIH07XG4gIH07XG5cbiAgYmluZFJvd0NvbnRleHRNZW51ID0gKHJvd0RhdGE6IG9iamVjdCkgPT4ge1xuICAgIHJldHVybiAoZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJvcHMub25Sb3dDb250ZXh0TWVudT8uKHJvd0RhdGEsIGV2ZW50KTtcbiAgICB9O1xuICB9O1xuXG4gIHJlbmRlclJvd0RhdGEoXG4gICAgYm9keUNlbGxzOiBhbnlbXSxcbiAgICByb3dEYXRhOiBhbnksXG4gICAgcHJvcHM6IFRhYmxlUm93UHJvcHMsXG4gICAgc2hvdWxkUmVuZGVyRXhwYW5kZWRSb3c/OiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCB7IHJlbmRlclRyZWVUb2dnbGUsIHJvd0tleSwgd29yZFdyYXAsIGlzVHJlZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBoYXNDaGlsZHJlbiA9IGlzVHJlZSAmJiByb3dEYXRhLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkocm93RGF0YS5jaGlsZHJlbik7XG4gICAgY29uc3QgbmV4dFJvd0tleSA9IHR5cGVvZiByb3dEYXRhW3Jvd0tleV0gIT09ICd1bmRlZmluZWQnID8gcm93RGF0YVtyb3dLZXldIDogcHJvcHMua2V5O1xuXG4gICAgY29uc3Qgcm93UHJvcHM6IFRhYmxlUm93UHJvcHMgPSB7XG4gICAgICAuLi5wcm9wcyxcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJvd1JlZjogdGhpcy5iaW5kVGFibGVSb3dzUmVmKHByb3BzLmtleSwgcm93RGF0YSksXG4gICAgICBvbkNsaWNrOiB0aGlzLmJpbmRSb3dDbGljayhyb3dEYXRhKSxcbiAgICAgIG9uQ29udGV4dE1lbnU6IHRoaXMuYmluZFJvd0NvbnRleHRNZW51KHJvd0RhdGEpLFxuICAgIH07XG5cbiAgICBjb25zdCBleHBhbmRlZFJvd0tleXMgPSB0aGlzLmdldEV4cGFuZGVkUm93S2V5cygpIHx8IFtdO1xuICAgIGNvbnN0IGV4cGFuZGVkID0gZXhwYW5kZWRSb3dLZXlzLnNvbWUoa2V5ID0+IGtleSA9PT0gcm93RGF0YVtyb3dLZXldKTtcbiAgICBjb25zdCBjZWxscyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2R5Q2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNlbGwgPSBib2R5Q2VsbHNbaV07XG4gICAgICBjZWxscy5wdXNoKFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIFJlYWN0LmNsb25lRWxlbWVudChjZWxsLCB7XG4gICAgICAgICAgaGFzQ2hpbGRyZW4sXG4gICAgICAgICAgcm93RGF0YSxcbiAgICAgICAgICB3b3JkV3JhcCxcbiAgICAgICAgICByZW5kZXJUcmVlVG9nZ2xlLFxuICAgICAgICAgIGhlaWdodDogcHJvcHMuaGVpZ2h0LFxuICAgICAgICAgIHJvd0luZGV4OiBwcm9wcy5rZXksXG4gICAgICAgICAgZGVwdGg6IHByb3BzLmRlcHRoLFxuICAgICAgICAgIG9uVHJlZVRvZ2dsZTogdGhpcy5oYW5kbGVUcmVlVG9nZ2xlLFxuICAgICAgICAgIHJvd0tleTogbmV4dFJvd0tleSxcbiAgICAgICAgICBleHBhbmRlZCxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlbmRlclJvdyhyb3dQcm9wcywgY2VsbHMsIHNob3VsZFJlbmRlckV4cGFuZGVkUm93LCByb3dEYXRhKTtcbiAgfVxuXG4gIHJlbmRlclJvdyhwcm9wczogVGFibGVSb3dQcm9wcywgY2VsbHM6IGFueVtdLCBzaG91bGRSZW5kZXJFeHBhbmRlZFJvdz86IGJvb2xlYW4sIHJvd0RhdGE/OiBhbnkpIHtcbiAgICBjb25zdCB7IHJvd0NsYXNzTmFtZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHNob3VsZEZpeGVkQ29sdW1uLCB3aWR0aCwgY29udGVudFdpZHRoIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgaWYgKHR5cGVvZiByb3dDbGFzc05hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb3BzLmNsYXNzTmFtZSA9IHJvd0NsYXNzTmFtZShyb3dEYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcHMuY2xhc3NOYW1lID0gcm93Q2xhc3NOYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IHJvd1N0eWxlczogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgIGxldCByb3dSaWdodCA9IDA7XG5cbiAgICBpZiAodGhpcy5pc1JUTCgpICYmIGNvbnRlbnRXaWR0aCA+IHdpZHRoKSB7XG4gICAgICByb3dSaWdodCA9IHdpZHRoIC0gY29udGVudFdpZHRoO1xuICAgICAgcm93U3R5bGVzLnJpZ2h0ID0gcm93UmlnaHQ7XG4gICAgfVxuXG4gICAgLy8gSUYgdGhlcmUgYXJlIGZpeGVkIGNvbHVtbnMsIGFkZCBhIGZpeGVkIGdyb3VwXG4gICAgaWYgKHNob3VsZEZpeGVkQ29sdW1uICYmIGNvbnRlbnRXaWR0aCA+IHdpZHRoKSB7XG4gICAgICBjb25zdCBmaXhlZExlZnRDZWxscyA9IFtdO1xuICAgICAgY29uc3QgZml4ZWRSaWdodENlbGxzID0gW107XG4gICAgICBjb25zdCBzY3JvbGxDZWxscyA9IFtdO1xuICAgICAgbGV0IGZpeGVkTGVmdENlbGxHcm91cFdpZHRoID0gMDtcbiAgICAgIGxldCBmaXhlZFJpZ2h0Q2VsbEdyb3VwV2lkdGggPSAwO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNlbGwgPSBjZWxsc1tpXTtcbiAgICAgICAgY29uc3QgeyBmaXhlZCwgd2lkdGggfSA9IGNlbGwucHJvcHM7XG5cbiAgICAgICAgbGV0IGlzRml4ZWRTdGFydCA9IGZpeGVkID09PSAnbGVmdCcgfHwgZml4ZWQgPT09IHRydWU7XG4gICAgICAgIGxldCBpc0ZpeGVkRW5kID0gZml4ZWQgPT09ICdyaWdodCc7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNSVEwoKSkge1xuICAgICAgICAgIGlzRml4ZWRTdGFydCA9IGZpeGVkID09PSAncmlnaHQnO1xuICAgICAgICAgIGlzRml4ZWRFbmQgPSBmaXhlZCA9PT0gJ2xlZnQnIHx8IGZpeGVkID09PSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRml4ZWRTdGFydCkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBmaXhlZExlZnRDZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICAgIGZpeGVkTGVmdENlbGxHcm91cFdpZHRoICs9IHdpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRml4ZWRFbmQpIHtcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgZml4ZWRSaWdodENlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgICAgZml4ZWRSaWdodENlbGxHcm91cFdpZHRoICs9IHdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBzY3JvbGxDZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxSb3cgey4uLnByb3BzfSBzdHlsZT17cm93U3R5bGVzfT5cbiAgICAgICAgICB7Zml4ZWRMZWZ0Q2VsbEdyb3VwV2lkdGggPyAoXG4gICAgICAgICAgICA8Q2VsbEdyb3VwXG4gICAgICAgICAgICAgIGZpeGVkPVwibGVmdFwiXG4gICAgICAgICAgICAgIGhlaWdodD17cHJvcHMuaXNIZWFkZXJSb3cgPyBwcm9wcy5oZWFkZXJIZWlnaHQgOiBwcm9wcy5oZWlnaHR9XG4gICAgICAgICAgICAgIHdpZHRoPXtmaXhlZExlZnRDZWxsR3JvdXBXaWR0aH1cbiAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICBzdHlsZT17dGhpcy5pc1JUTCgpID8geyByaWdodDogd2lkdGggLSBmaXhlZExlZnRDZWxsR3JvdXBXaWR0aCAtIHJvd1JpZ2h0IH0gOiBudWxsfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bWVyZ2VDZWxscyhyZXNldExlZnRGb3JDZWxscyhmaXhlZExlZnRDZWxscykpfVxuICAgICAgICAgICAgPC9DZWxsR3JvdXA+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICA8Q2VsbEdyb3VwPnttZXJnZUNlbGxzKHNjcm9sbENlbGxzKX08L0NlbGxHcm91cD5cblxuICAgICAgICAgIHtmaXhlZFJpZ2h0Q2VsbEdyb3VwV2lkdGggPyAoXG4gICAgICAgICAgICA8Q2VsbEdyb3VwXG4gICAgICAgICAgICAgIGZpeGVkPVwicmlnaHRcIlxuICAgICAgICAgICAgICBzdHlsZT17XG4gICAgICAgICAgICAgICAgdGhpcy5pc1JUTCgpXG4gICAgICAgICAgICAgICAgICA/IHsgcmlnaHQ6IDAgLSByb3dSaWdodCAtIFNDUk9MTEJBUl9XSURUSCB9XG4gICAgICAgICAgICAgICAgICA6IHsgbGVmdDogd2lkdGggLSBmaXhlZFJpZ2h0Q2VsbEdyb3VwV2lkdGggLSBTQ1JPTExCQVJfV0lEVEggfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGhlaWdodD17cHJvcHMuaXNIZWFkZXJSb3cgPyBwcm9wcy5oZWFkZXJIZWlnaHQgOiBwcm9wcy5oZWlnaHR9XG4gICAgICAgICAgICAgIHdpZHRoPXtmaXhlZFJpZ2h0Q2VsbEdyb3VwV2lkdGh9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHttZXJnZUNlbGxzKHJlc2V0TGVmdEZvckNlbGxzKGZpeGVkUmlnaHRDZWxscykpfVxuICAgICAgICAgICAgPC9DZWxsR3JvdXA+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7c2hvdWxkUmVuZGVyRXhwYW5kZWRSb3cgJiYgdGhpcy5yZW5kZXJSb3dFeHBhbmRlZChyb3dEYXRhKX1cbiAgICAgICAgPC9Sb3c+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8Um93IHsuLi5wcm9wc30gc3R5bGU9e3Jvd1N0eWxlc30+XG4gICAgICAgIDxDZWxsR3JvdXA+e21lcmdlQ2VsbHMoY2VsbHMpfTwvQ2VsbEdyb3VwPlxuICAgICAgICB7c2hvdWxkUmVuZGVyRXhwYW5kZWRSb3cgJiYgdGhpcy5yZW5kZXJSb3dFeHBhbmRlZChyb3dEYXRhKX1cbiAgICAgIDwvUm93PlxuICAgICk7XG4gIH1cblxuICByZW5kZXJSb3dFeHBhbmRlZChyb3dEYXRhPzogb2JqZWN0KSB7XG4gICAgY29uc3QgeyByZW5kZXJSb3dFeHBhbmRlZCwgcm93RXhwYW5kZWRIZWlnaHQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc3R5bGVzID0geyBoZWlnaHQ6IHJvd0V4cGFuZGVkSGVpZ2h0IH07XG5cbiAgICBpZiAodHlwZW9mIHJlbmRlclJvd0V4cGFuZGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGhpcy5hZGRQcmVmaXgoJ3Jvdy1leHBhbmRlZCcpfSBzdHlsZT17c3R5bGVzfT5cbiAgICAgICAgICB7cmVuZGVyUm93RXhwYW5kZWQocm93RGF0YSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZW5kZXJNb3VzZUFyZWEoKSB7XG4gICAgY29uc3QgaGVhZGVySGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlYWRlckhlaWdodCgpO1xuICAgIGNvbnN0IHN0eWxlcyA9IHsgaGVpZ2h0OiB0aGlzLmdldFRhYmxlSGVpZ2h0KCkgfTtcbiAgICBjb25zdCBzcGFuU3R5bGVzID0geyBoZWlnaHQ6IGhlYWRlckhlaWdodCAtIDEgfTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHJlZj17dGhpcy5tb3VzZUFyZWFSZWZ9IGNsYXNzTmFtZT17dGhpcy5hZGRQcmVmaXgoJ21vdXNlLWFyZWEnKX0gc3R5bGU9e3N0eWxlc30+XG4gICAgICAgIDxzcGFuIHN0eWxlPXtzcGFuU3R5bGVzfSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclRhYmxlSGVhZGVyKGhlYWRlckNlbGxzOiBhbnlbXSwgcm93V2lkdGg6IG51bWJlcikge1xuICAgIGNvbnN0IHsgYWZmaXhIZWFkZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyB3aWR0aDogdGFibGVXaWR0aCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB0b3AgPSB0eXBlb2YgYWZmaXhIZWFkZXIgPT09ICdudW1iZXInID8gYWZmaXhIZWFkZXIgOiAwO1xuICAgIGNvbnN0IGhlYWRlckhlaWdodCA9IHRoaXMuZ2V0VGFibGVIZWFkZXJIZWlnaHQoKTtcbiAgICBjb25zdCByb3dQcm9wczogVGFibGVSb3dQcm9wcyA9IHtcbiAgICAgIHJvd1JlZjogdGhpcy50YWJsZUhlYWRlclJlZixcbiAgICAgIHdpZHRoOiByb3dXaWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5nZXRSb3dIZWlnaHQoKSxcbiAgICAgIGhlYWRlckhlaWdodCxcbiAgICAgIGlzSGVhZGVyUm93OiB0cnVlLFxuICAgICAgdG9wOiAwLFxuICAgIH07XG5cbiAgICBjb25zdCBmaXhlZFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICBoZWlnaHQ6IHRoaXMuZ2V0VGFibGVIZWFkZXJIZWlnaHQoKSxcbiAgICAgIHdpZHRoOiB0YWJsZVdpZHRoLFxuICAgICAgdG9wLFxuICAgIH07XG5cbiAgICAvLyBBZmZpeCBoZWFkZXJcbiAgICBjb25zdCBoZWFkZXIgPSAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyh0aGlzLmFkZFByZWZpeCgnYWZmaXgtaGVhZGVyJykpfVxuICAgICAgICBzdHlsZT17Zml4ZWRTdHlsZX1cbiAgICAgICAgcmVmPXt0aGlzLmFmZml4SGVhZGVyV3JhcHBlclJlZn1cbiAgICAgID5cbiAgICAgICAge3RoaXMucmVuZGVyUm93KHJvd1Byb3BzLCBoZWFkZXJDZWxscyl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgeyhhZmZpeEhlYWRlciA9PT0gMCB8fCBhZmZpeEhlYWRlcikgJiYgaGVhZGVyfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17dGhpcy5hZGRQcmVmaXgoJ2hlYWRlci1yb3ctd3JhcHBlcicpfSByZWY9e3RoaXMuaGVhZGVyV3JhcHBlclJlZn0+XG4gICAgICAgICAge3RoaXMucmVuZGVyUm93KHJvd1Byb3BzLCBoZWFkZXJDZWxscyl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyVGFibGVCb2R5KGJvZHlDZWxsczogYW55W10sIHJvd1dpZHRoOiBudW1iZXIpIHtcbiAgICBjb25zdCB7XG4gICAgICByb3dFeHBhbmRlZEhlaWdodCxcbiAgICAgIHJlbmRlclJvd0V4cGFuZGVkLFxuICAgICAgaXNUcmVlLFxuICAgICAgcm93S2V5LFxuICAgICAgd29yZFdyYXAsXG4gICAgICB2aXJ0dWFsaXplZCxcbiAgICAgIHJvd0hlaWdodCxcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IGhlYWRlckhlaWdodCA9IHRoaXMuZ2V0VGFibGVIZWFkZXJIZWlnaHQoKTtcbiAgICBjb25zdCB7IHRhYmxlUm93c01heEhlaWdodCwgaXNTY3JvbGxpbmcsIGRhdGEgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlaWdodCgpO1xuICAgIGNvbnN0IGJvZHlIZWlnaHQgPSBoZWlnaHQgLSBoZWFkZXJIZWlnaHQ7XG4gICAgY29uc3QgYm9keVN0eWxlcyA9IHtcbiAgICAgIHRvcDogaGVhZGVySGVpZ2h0LFxuICAgICAgaGVpZ2h0OiBib2R5SGVpZ2h0LFxuICAgIH07XG5cbiAgICBsZXQgY29udGVudEhlaWdodCA9IDA7XG4gICAgbGV0IHRvcEhpZGVIZWlnaHQgPSAwO1xuICAgIGxldCBib3R0b21IaWRlSGVpZ2h0ID0gMDtcblxuICAgIHRoaXMuX3Zpc2libGVSb3dzID0gW107XG5cbiAgICBpZiAoZGF0YSkge1xuICAgICAgbGV0IHRvcCA9IDA7IC8vIFJvdyBwb3NpdGlvblxuICAgICAgY29uc3QgbWluVG9wID0gTWF0aC5hYnModGhpcy5zY3JvbGxZKTtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGNvbnN0IG1heFRvcCA9IG1pblRvcCArIGhlaWdodCArIHJvd0V4cGFuZGVkSGVpZ2h0O1xuICAgICAgY29uc3QgaXNDdXN0b21Sb3dIZWlnaHQgPSB0eXBlb2Ygcm93SGVpZ2h0ID09PSAnZnVuY3Rpb24nO1xuICAgICAgY29uc3QgaXNVbmNlcnRhaW5IZWlnaHQgPSAhIShyZW5kZXJSb3dFeHBhbmRlZCB8fCBpc0N1c3RvbVJvd0hlaWdodCB8fCBpc1RyZWUpO1xuXG4gICAgICAvKipcbiAgICAgICDlpoLmnpzlvIDlkK/kuoYgdmlydHVhbGl6ZWQgIOWQjOaXtiBUYWJsZSDkuK3nmoTnmoTooYzpq5jmmK/lj6/lj5jnmoTvvIxcbiAgICAgICDliJnpnIDopoHlvqrnjq/pgY3ljoYgZGF0YSwg6I635Y+W5q+P5LiA6KGM55qE6auY5bqm44CCXG4gICAgICAgKi9cbiAgICAgIGlmICgoaXNVbmNlcnRhaW5IZWlnaHQgJiYgdmlydHVhbGl6ZWQpIHx8ICF2aXJ0dWFsaXplZCkge1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZGF0YS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCByb3dEYXRhID0gZGF0YVtpbmRleF07XG4gICAgICAgICAgY29uc3QgbWF4SGVpZ2h0ID0gdGFibGVSb3dzTWF4SGVpZ2h0W2luZGV4XTtcbiAgICAgICAgICBjb25zdCBzaG91bGRSZW5kZXJFeHBhbmRlZFJvdyA9IHRoaXMuc2hvdWxkUmVuZGVyRXhwYW5kZWRSb3cocm93RGF0YSk7XG5cbiAgICAgICAgICBsZXQgbmV4dFJvd0hlaWdodCA9IDA7XG4gICAgICAgICAgbGV0IGRlcHRoID0gMDtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygcm93SGVpZ2h0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBuZXh0Um93SGVpZ2h0ID0gcm93SGVpZ2h0KHJvd0RhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXh0Um93SGVpZ2h0ID0gbWF4SGVpZ2h0XG4gICAgICAgICAgICAgID8gTWF0aC5tYXgobWF4SGVpZ2h0ICsgQ0VMTF9QQURESU5HX0hFSUdIVCwgcm93SGVpZ2h0KVxuICAgICAgICAgICAgICA6IHJvd0hlaWdodDtcbiAgICAgICAgICAgIGlmIChzaG91bGRSZW5kZXJFeHBhbmRlZFJvdykge1xuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIG5leHRSb3dIZWlnaHQgKz0gcm93RXhwYW5kZWRIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGlzVHJlZSkge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50cyA9IGZpbmRBbGxQYXJlbnRzKHJvd0RhdGEsIHJvd0tleSk7XG4gICAgICAgICAgICBjb25zdCBleHBhbmRlZFJvd0tleXMgPSB0aGlzLmdldEV4cGFuZGVkUm93S2V5cygpO1xuICAgICAgICAgICAgZGVwdGggPSBwYXJlbnRzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8g5qCR6IqC54K55aaC5p6c6KKr5YWz6Zet77yM5YiZ5LiN5riy5p+TXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBpZiAoIXNob3VsZFNob3dSb3dCeUV4cGFuZGVkKGV4cGFuZGVkUm93S2V5cywgcGFyZW50cykpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGVudEhlaWdodCArPSBuZXh0Um93SGVpZ2h0O1xuXG4gICAgICAgICAgY29uc3Qgcm93UHJvcHMgPSB7XG4gICAgICAgICAgICBrZXk6IGluZGV4LFxuICAgICAgICAgICAgdG9wLFxuICAgICAgICAgICAgd2lkdGg6IHJvd1dpZHRoLFxuICAgICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IG5leHRSb3dIZWlnaHQsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHRvcCArPSBuZXh0Um93SGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKHZpcnR1YWxpemVkICYmICF3b3JkV3JhcCkge1xuICAgICAgICAgICAgaWYgKHRvcCArIG5leHRSb3dIZWlnaHQgPCBtaW5Ub3ApIHtcbiAgICAgICAgICAgICAgdG9wSGlkZUhlaWdodCArPSBuZXh0Um93SGVpZ2h0O1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9wID4gbWF4VG9wKSB7XG4gICAgICAgICAgICAgIGJvdHRvbUhpZGVIZWlnaHQgKz0gbmV4dFJvd0hlaWdodDtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fdmlzaWJsZVJvd3MucHVzaChcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRoaXMucmVuZGVyUm93RGF0YShib2R5Q2VsbHMsIHJvd0RhdGEsIHJvd1Byb3BzLCBzaG91bGRSZW5kZXJFeHBhbmRlZFJvdyksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyoqXG4gICAgICAgICDlpoLmnpwgVGFibGUg55qE6KGM6auY5piv5Zu65a6a55qE77yM5YiZ55u05o6l6YCa6L+H6KGM6auY5LiO6KGM5pWw6L+b6KGM6K6h566X77yMXG4gICAgICAgICDlh4/lsJHpgY3ljobmiYDmnIkgZGF0YSDluKbmnaXnmoTmgKfog73mtojogJdcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IG5leHRSb3dIZWlnaHQgPSB0aGlzLmdldFJvd0hlaWdodCgpO1xuICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gTWF0aC5tYXgoTWF0aC5mbG9vcihtaW5Ub3AgLyBuZXh0Um93SGVpZ2h0KSwgMCk7XG4gICAgICAgIGNvbnN0IGVuZEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCArIE1hdGguY2VpbChib2R5SGVpZ2h0IC8gbmV4dFJvd0hlaWdodCksIGRhdGEubGVuZ3RoKTtcblxuICAgICAgICBjb250ZW50SGVpZ2h0ID0gZGF0YS5sZW5ndGggKiBuZXh0Um93SGVpZ2h0O1xuICAgICAgICB0b3BIaWRlSGVpZ2h0ID0gc3RhcnRJbmRleCAqIG5leHRSb3dIZWlnaHQ7XG4gICAgICAgIGJvdHRvbUhpZGVIZWlnaHQgPSAoZGF0YS5sZW5ndGggLSBlbmRJbmRleCkgKiBuZXh0Um93SGVpZ2h0O1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gc3RhcnRJbmRleDsgaW5kZXggPCBlbmRJbmRleDsgaW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSBkYXRhW2luZGV4XTtcbiAgICAgICAgICBjb25zdCByb3dQcm9wcyA9IHtcbiAgICAgICAgICAgIGtleTogaW5kZXgsXG4gICAgICAgICAgICB0b3A6IGluZGV4ICogbmV4dFJvd0hlaWdodCxcbiAgICAgICAgICAgIHdpZHRoOiByb3dXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogbmV4dFJvd0hlaWdodCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzLl92aXNpYmxlUm93cy5wdXNoKHRoaXMucmVuZGVyUm93RGF0YShib2R5Q2VsbHMsIHJvd0RhdGEsIHJvd1Byb3BzLCBmYWxzZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgd2hlZWxTdHlsZXM6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGhlaWdodDogY29udGVudEhlaWdodCxcbiAgICAgIG1pbkhlaWdodDogaGVpZ2h0LFxuICAgICAgcG9pbnRlckV2ZW50czogaXNTY3JvbGxpbmcgPyAnbm9uZScgOiB1bmRlZmluZWQsXG4gICAgfTtcbiAgICBjb25zdCB0b3BSb3dTdHlsZXMgPSB7IGhlaWdodDogdG9wSGlkZUhlaWdodCB9O1xuICAgIGNvbnN0IGJvdHRvbVJvd1N0eWxlcyA9IHsgaGVpZ2h0OiBib3R0b21IaWRlSGVpZ2h0IH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPExvY2FsZVJlY2VpdmVyIGNvbXBvbmVudE5hbWU9XCJQZXJmb3JtYW5jZVRhYmxlXCIgZGVmYXVsdExvY2FsZT17ZGVmYXVsdExvY2FsZS5QZXJmb3JtYW5jZVRhYmxlfT5cbiAgICAgICAgeyhsb2NhbGU6IFBlcmZvcm1hbmNlVGFibGVMb2NhbCkgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXt0aGlzLnRhYmxlQm9keVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuYWRkUHJlZml4KCdib2R5LXJvdy13cmFwcGVyJyl9XG4gICAgICAgICAgc3R5bGU9e2JvZHlTdHlsZXN9XG4gICAgICAgICAgb25TY3JvbGw9e3RoaXMuaGFuZGxlQm9keVNjcm9sbH1cbiAgICAgICAgPlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIHN0eWxlPXt3aGVlbFN0eWxlc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5hZGRQcmVmaXgoJ2JvZHktd2hlZWwtYXJlYScpfVxuICAgICAgICAgICAgcmVmPXt0aGlzLndoZWVsV3JhcHBlclJlZn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dG9wSGlkZUhlaWdodCA/IDxSb3cgc3R5bGU9e3RvcFJvd1N0eWxlc30gY2xhc3NOYW1lPVwidmlydHVhbGl6ZWRcIiAvPiA6IG51bGx9XG4gICAgICAgICAgICB7dGhpcy5fdmlzaWJsZVJvd3N9XG4gICAgICAgICAgICB7Ym90dG9tSGlkZUhlaWdodCA/IDxSb3cgc3R5bGU9e2JvdHRvbVJvd1N0eWxlc30gY2xhc3NOYW1lPVwidmlydHVhbGl6ZWRcIiAvPiA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7dGhpcy5yZW5kZXJJbmZvKGxvY2FsZSl9XG4gICAgICAgICAge3RoaXMucmVuZGVyU2Nyb2xsYmFyKCl9XG4gICAgICAgICAge3RoaXMucmVuZGVyTG9hZGluZyhsb2NhbGUpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgIH19XG4gICAgICA8L0xvY2FsZVJlY2VpdmVyPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJJbmZvKGxvY2FsZTogUGVyZm9ybWFuY2VUYWJsZUxvY2FsKSB7XG4gICAgY29uc3QgeyByZW5kZXJFbXB0eSwgbG9hZGluZyB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodGhpcy5fdmlzaWJsZVJvd3MubGVuZ3RoIHx8IGxvYWRpbmcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBlbXB0eU1lc3NhZ2UgPSA8ZGl2IGNsYXNzTmFtZT17dGhpcy5hZGRQcmVmaXgoJ2JvZHktaW5mbycpfT57bG9jYWxlLmVtcHR5TWVzc2FnZX08L2Rpdj47XG5cbiAgICByZXR1cm4gcmVuZGVyRW1wdHkgPyByZW5kZXJFbXB0eShlbXB0eU1lc3NhZ2UpIDogZW1wdHlNZXNzYWdlO1xuICB9XG5cbiAgcmVuZGVyU2Nyb2xsYmFyKCkge1xuICAgIGNvbnN0IHsgZGlzYWJsZWRTY3JvbGwsIGFmZml4SG9yaXpvbnRhbFNjcm9sbGJhciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCwgd2lkdGgsIGZpeGVkSG9yaXpvbnRhbFNjcm9sbGJhciB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBib3R0b20gPSB0eXBlb2YgYWZmaXhIb3Jpem9udGFsU2Nyb2xsYmFyID09PSAnbnVtYmVyJyA/IGFmZml4SG9yaXpvbnRhbFNjcm9sbGJhciA6IDA7XG5cbiAgICBjb25zdCBoZWFkZXJIZWlnaHQgPSB0aGlzLmdldFRhYmxlSGVhZGVySGVpZ2h0KCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRUYWJsZUhlaWdodCgpO1xuXG4gICAgaWYgKGRpc2FibGVkU2Nyb2xsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPFNjcm9sbGJhclxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyh7IGZpeGVkOiBmaXhlZEhvcml6b250YWxTY3JvbGxiYXIgfSl9XG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGgsIGJvdHRvbTogZml4ZWRIb3Jpem9udGFsU2Nyb2xsYmFyID8gYm90dG9tIDogdW5kZWZpbmVkIH19XG4gICAgICAgICAgbGVuZ3RoPXt0aGlzLnN0YXRlLndpZHRofVxuICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLmhhbmRsZVNjcm9sbFh9XG4gICAgICAgICAgc2Nyb2xsTGVuZ3RoPXtjb250ZW50V2lkdGh9XG4gICAgICAgICAgcmVmPXt0aGlzLnNjcm9sbGJhclhSZWZ9XG4gICAgICAgIC8+XG4gICAgICAgIDxTY3JvbGxiYXJcbiAgICAgICAgICB2ZXJ0aWNhbFxuICAgICAgICAgIGxlbmd0aD17aGVpZ2h0IC0gaGVhZGVySGVpZ2h0fVxuICAgICAgICAgIHNjcm9sbExlbmd0aD17Y29udGVudEhlaWdodH1cbiAgICAgICAgICBvblNjcm9sbD17dGhpcy5oYW5kbGVTY3JvbGxZfVxuICAgICAgICAgIHJlZj17dGhpcy5zY3JvbGxiYXJZUmVmfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgc2hvdyBsb2FkaW5nXG4gICAqL1xuICByZW5kZXJMb2FkaW5nKGxvY2FsZTogUGVyZm9ybWFuY2VUYWJsZUxvY2FsKSB7XG4gICAgY29uc3Qge2xvYWRpbmcsIGxvYWRBbmltYXRpb24sIHJlbmRlckxvYWRpbmcgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAoIWxvYWRBbmltYXRpb24gJiYgIWxvYWRpbmcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRpbmdFbGVtZW50ID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3RoaXMuYWRkUHJlZml4KCdsb2FkZXItd3JhcHBlcicpfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RoaXMuYWRkUHJlZml4KCdsb2FkZXInKX0+XG4gICAgICAgICAgPGkgY2xhc3NOYW1lPXt0aGlzLmFkZFByZWZpeCgnbG9hZGVyLWljb24nKX0gLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3RoaXMuYWRkUHJlZml4KCdsb2FkZXItdGV4dCcpfT57bG9jYWxlLmxvYWRpbmd9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gcmVuZGVyTG9hZGluZyA/IHJlbmRlckxvYWRpbmcobG9hZGluZ0VsZW1lbnQpIDogbG9hZGluZ0VsZW1lbnQ7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2hpbGRyZW4sXG4gICAgICBjb2x1bW5zLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgd2lkdGggPSAwLFxuICAgICAgc3R5bGUsXG4gICAgICBpc1RyZWUsXG4gICAgICBob3ZlcixcbiAgICAgIGJvcmRlcmVkLFxuICAgICAgY2VsbEJvcmRlcmVkLFxuICAgICAgd29yZFdyYXAsXG4gICAgICBjbGFzc1ByZWZpeCxcbiAgICAgIGxvYWRpbmcsXG4gICAgICBzaG93SGVhZGVyLFxuICAgICAgLi4ucmVzdFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgeyBpc0NvbHVtblJlc2l6aW5nIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgaGVhZGVyQ2VsbHMsIGJvZHlDZWxscywgYWxsQ29sdW1uc1dpZHRoLCBoYXNDdXN0b21UcmVlQ29sIH0gPSB0aGlzLmdldENlbGxEZXNjcmlwdG9yKCk7XG4gICAgY29uc3Qgcm93V2lkdGggPSBhbGxDb2x1bW5zV2lkdGggPiB3aWR0aCA/IGFsbENvbHVtbnNXaWR0aCA6IHdpZHRoO1xuICAgIGNvbnN0IGNsZXNzZXMgPSBjbGFzc05hbWVzKGNsYXNzUHJlZml4LCBjbGFzc05hbWUsIHtcbiAgICAgIFt0aGlzLmFkZFByZWZpeCgnd29yZC13cmFwJyldOiB3b3JkV3JhcCxcbiAgICAgIFt0aGlzLmFkZFByZWZpeCgndHJlZXRhYmxlJyldOiBpc1RyZWUsXG4gICAgICBbdGhpcy5hZGRQcmVmaXgoJ2JvcmRlcmVkJyldOiBib3JkZXJlZCxcbiAgICAgIFt0aGlzLmFkZFByZWZpeCgnY2VsbC1ib3JkZXJlZCcpXTogY2VsbEJvcmRlcmVkLFxuICAgICAgW3RoaXMuYWRkUHJlZml4KCdjb2x1bW4tcmVzaXppbmcnKV06IGlzQ29sdW1uUmVzaXppbmcsXG4gICAgICBbdGhpcy5hZGRQcmVmaXgoJ2hvdmVyJyldOiBob3ZlcixcbiAgICAgIFt0aGlzLmFkZFByZWZpeCgnbG9hZGluZycpXTogbG9hZGluZyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHN0eWxlcyA9IHtcbiAgICAgIHdpZHRoOiB3aWR0aCB8fCAnYXV0bycsXG4gICAgICBoZWlnaHQ6IHRoaXMuZ2V0VGFibGVIZWlnaHQoKSxcbiAgICAgIGxpbmVIZWlnaHQ6IGAke3RvUHgodGhpcy5nZXRSb3dIZWlnaHQoKSl9cHhgLFxuICAgICAgLi4uc3R5bGUsXG4gICAgfTtcblxuICAgIGNvbnN0IHVuaGFuZGxlZCA9IGdldFVuaGFuZGxlZFByb3BzKFBlcmZvcm1hbmNlVGFibGUsIHJlc3QpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxUYWJsZUNvbnRleHQuUHJvdmlkZXJcbiAgICAgICAgdmFsdWU9e3tcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgdHJhbnNsYXRlRE9NUG9zaXRpb25YWTogdGhpcy50cmFuc2xhdGVET01Qb3NpdGlvblhZLFxuICAgICAgICAgIHJ0bDogdGhpcy5pc1JUTCgpLFxuICAgICAgICAgIGhhc0N1c3RvbVRyZWVDb2wsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxkaXYgey4uLnVuaGFuZGxlZH0gY2xhc3NOYW1lPXtjbGVzc2VzfSBzdHlsZT17c3R5bGVzfSByZWY9e3RoaXMudGFibGVSZWZ9PlxuICAgICAgICAgIHtzaG93SGVhZGVyICYmIHRoaXMucmVuZGVyVGFibGVIZWFkZXIoaGVhZGVyQ2VsbHMsIHJvd1dpZHRoKX1cbiAgICAgICAgICB7Y29sdW1ucyAmJiBjb2x1bW5zLmxlbmd0aCA/IHRoaXMucmVuZGVyVGFibGVCb2R5KGJvZHlDZWxscywgcm93V2lkdGgpIDogY2hpbGRyZW4gJiYgdGhpcy5yZW5kZXJUYWJsZUJvZHkoYm9keUNlbGxzLCByb3dXaWR0aCl9XG4gICAgICAgICAge3Nob3dIZWFkZXIgJiYgdGhpcy5yZW5kZXJNb3VzZUFyZWEoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1RhYmxlQ29udGV4dC5Qcm92aWRlcj5cbiAgICApO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=