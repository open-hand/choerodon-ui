import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import raf from 'raf';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import debounce from 'lodash/debounce';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import classes from 'component-classes';
import { action, toJS } from 'mobx';
import { DragDropContext, } from 'react-beautiful-dnd';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import Column, { defaultMinWidth } from './Column';
import TableRow from './TableRow';
import TableHeaderCell from './TableHeaderCell';
import TableStore, { DRAG_KEY } from './TableStore';
import TableHeader from './TableHeader';
import autobind from '../_util/autobind';
import Pagination from '../pagination/Pagination';
import Spin from '../spin';
import DataSetComponent from '../data-set/DataSetComponent';
import TableContext from './TableContext';
import TableWrapper from './TableWrapper';
import TableTBody from './TableTBody';
import TableFooter from './TableFooter';
import { TableButtonType, } from './enum';
import Switch from '../switch/Switch';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';
import TableQueryBar from './query-bar';
import FilterBar from './query-bar/TableFilterBar';
import AdvancedQueryBar from './query-bar/TableAdvancedQueryBar';
import ProfessionalBar from './query-bar/TableProfessionalBar';
import ToolBar from './query-bar/TableToolBar';
import { findIndexedSibling, getHeight, getPaginationPosition } from './utils';
import TableBody from './TableBody';
export const buttonsEnumType = PropTypes.oneOf([
    TableButtonType.add,
    TableButtonType.save,
    TableButtonType.remove,
    TableButtonType.delete,
    TableButtonType.reset,
    TableButtonType.query,
    TableButtonType.export,
    TableButtonType.expandAll,
    TableButtonType.collapseAll,
]);
let _instance;
// 构造一个单例table来防止body下不能有table元素的报错
export const instance = () => {
    // Using a table as the portal so that we do not get react
    // warnings when mounting a tr element
    const _tableContain = () => {
        const table = document.createElement('table');
        table.classList.add(`${getProPrefixCls('table')}-drag-container`);
        const thead = document.createElement('thead');
        thead.classList.add(`${getProPrefixCls('table')}-thead`);
        table.appendChild(thead);
        const headtr = document.createElement('tr');
        thead.appendChild(headtr);
        const tbody = document.createElement('tbody');
        tbody.classList.add(`${getProPrefixCls('table')}-tbody`);
        table.appendChild(tbody);
        if (!document.body) {
            throw new Error('document.body required a body to append');
        }
        document.body.appendChild(table);
        return {
            // @ts-ignore
            tbody,
            // @ts-ignore
            headtr,
        };
    };
    if (_instance) {
        return _instance;
    }
    return _instance = _tableContain();
};
let Table = class Table extends DataSetComponent {
    constructor() {
        super(...arguments);
        this.tableStore = new TableStore(this);
        this.refUpperPlaceholder = [];
        this.refUnderPlaceholder = [];
        this.refSpin = null;
        this.refScroll = null;
        /**
         * 滚动结束隐藏spin
         */
        this.setSpin = debounce(() => {
            this.refSpin.style.display = 'none';
        }, 300);
    }
    get currentRow() {
        return this.element.querySelector(`.${this.prefixCls}-row-current`);
    }
    get firstRow() {
        return this.element.querySelector(`.${this.prefixCls}-row:first-child`);
    }
    get lastRow() {
        return this.element.querySelector(`.${this.prefixCls}-row:last-child`);
    }
    saveResizeRef(node) {
        this.resizeLine = node;
    }
    handleSwitchChange(value) {
        this.tableStore.showCachedSeletion = !!value;
    }
    handleResize(width) {
        const { element, tableStore } = this;
        if (!element.offsetParent) {
            tableStore.styledHidden = true;
        }
        else if (!tableStore.hidden) {
            this.syncSizeInFrame(width);
        }
        else {
            tableStore.styledHidden = false;
        }
    }
    handleDataSetLoad() {
        this.initDefaultExpandedRows();
    }
    handleDataSetCreate({ record, dataSet }) {
        const { tableStore } = this;
        if (tableStore.inlineEdit) {
            if (tableStore.currentEditRecord) {
                tableStore.currentEditRecord.reset();
                dataSet.remove(record);
            }
            else {
                tableStore.currentEditRecord = record;
            }
        }
    }
    handleKeyDown(e) {
        const { tableStore } = this;
        if (!tableStore.editing) {
            try {
                const { dataSet } = this.props;
                switch (e.keyCode) {
                    case KeyCode.UP:
                        this.handleKeyDownUp(e);
                        break;
                    case KeyCode.DOWN:
                        this.handleKeyDownDown(e);
                        break;
                    case KeyCode.RIGHT:
                        this.handleKeyDownRight(e);
                        break;
                    case KeyCode.LEFT:
                        this.handleKeyDownLeft(e);
                        break;
                    case KeyCode.PAGE_UP:
                        e.preventDefault();
                        dataSet.prePage();
                        break;
                    case KeyCode.PAGE_DOWN:
                        e.preventDefault();
                        dataSet.nextPage();
                        break;
                    case KeyCode.HOME:
                        this.handleKeyDownHome(e);
                        break;
                    case KeyCode.END:
                        this.handleKeyDownEnd(e);
                        break;
                    default:
                }
            }
            catch (error) {
                warning(false, error.message);
            }
        }
        const { onKeyDown = noop } = this.props;
        onKeyDown(e);
    }
    focusRow(row) {
        if (row) {
            const { index } = row.dataset;
            if (index) {
                const { dataSet } = this.props;
                const record = dataSet.findRecordById(index);
                if (record) {
                    dataSet.current = record;
                }
            }
        }
    }
    async handleKeyDownHome(e) {
        e.preventDefault();
        const { dataSet } = this.props;
        if (!this.tableStore.isTree) {
            await dataSet.first();
        }
        this.focusRow(this.firstRow);
    }
    async handleKeyDownEnd(e) {
        e.preventDefault();
        const { dataSet } = this.props;
        if (!this.tableStore.isTree) {
            await dataSet.last();
        }
        this.focusRow(this.lastRow);
    }
    async handleKeyDownUp(e) {
        e.preventDefault();
        const { currentRow } = this;
        if (currentRow) {
            const previousElementSibling = findIndexedSibling(currentRow, -1);
            if (previousElementSibling) {
                this.focusRow(previousElementSibling);
            }
            else {
                const { dataSet } = this.props;
                await dataSet.prePage();
                this.focusRow(this.lastRow);
            }
        }
    }
    async handleKeyDownDown(e) {
        e.preventDefault();
        const { currentRow } = this;
        if (currentRow) {
            const nextElementSibling = findIndexedSibling(currentRow, 1);
            if (nextElementSibling) {
                this.focusRow(nextElementSibling);
            }
            else {
                const { dataSet } = this.props;
                await dataSet.nextPage();
                this.focusRow(this.firstRow);
            }
        }
    }
    handleKeyDownRight(e) {
        const { tableStore, props: { expandedRowRenderer, dataSet }, } = this;
        if (tableStore.isTree || expandedRowRenderer) {
            const { current } = dataSet;
            if (current) {
                e.preventDefault();
                tableStore.setRowExpanded(current, true);
            }
        }
    }
    handleKeyDownLeft(e) {
        const { tableStore, props: { expandedRowRenderer, dataSet }, } = this;
        if (tableStore.isTree || expandedRowRenderer) {
            const { current } = dataSet;
            if (current) {
                e.preventDefault();
                tableStore.setRowExpanded(current, false);
            }
        }
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'columns',
            'header',
            'footer',
            'border',
            'style',
            'selectionMode',
            'alwaysShowRowBox',
            'onRow',
            'rowRenderer',
            'buttons',
            'rowHeight',
            'queryFields',
            'queryFieldsLimit',
            'queryBar',
            'defaultRowExpanded',
            'expandRowByClick',
            'expandedRowRenderer',
            'expandIconColumnIndex',
            'indentSize',
            'filter',
            'mode',
            'editMode',
            'filterBarFieldName',
            'filterBarPlaceholder',
            'pagination',
            'highLightRow',
            'selectedHighLightRow',
            'columnResizable',
            'pristine',
            'expandIcon',
            'spin',
            'virtual',
            'virtualSpin',
            'autoHeight',
            'useMouseBatchChoose',
            'autoMaxWidth',
            'dragColumnAlign',
            'dragColumn',
            'dragRow',
            'onDragEnd',
            'columnsOnChange',
            'columnsMergeCoverage',
            'columnsEditType',
            'rowDragRender',
            'columnsDragRender',
            'onDragEndBefore',
        ]);
        otherProps.onKeyDown = this.handleKeyDown;
        const { rowHeight } = this.tableStore;
        if (rowHeight !== 'auto') {
            otherProps.style = { lineHeight: pxToRem(rowHeight) };
        }
        return otherProps;
    }
    getClassName() {
        const { prefixCls, tableStore: { border, rowHeight }, } = this;
        return super.getClassName(`${prefixCls}-scroll-position-left`, {
            [`${prefixCls}-bordered`]: border,
            [`${prefixCls}-row-height-fixed`]: isNumber(rowHeight),
        });
    }
    getWrapperProps(props = {}) {
        const { style } = this.props;
        const { tableStore } = this;
        const newStyle = omit(style, ['width', 'height']);
        if (style && style.width !== undefined && style.width !== 'auto') {
            newStyle.width = Math.max(style.width, tableStore.leftLeafColumnsWidth + tableStore.rightLeafColumnsWidth + defaultMinWidth);
        }
        return super.getWrapperProps({
            style: newStyle,
            ...props,
        });
    }
    /**
     * 获取传入的 Spin props
     */
    getSpinProps() {
        const { spin, dataSet } = this.props;
        if (spin && !isUndefined(spin.spinning))
            return { ...spin };
        return {
            ...spin,
            dataSet,
        };
    }
    handleDragMouseUp() {
        const { dataSet, mouseBatchChooseIdList } = this.tableStore;
        if (this.tableStore.mouseBatchChooseState) {
            this.tableStore.mouseBatchChooseState = false;
            const { mouseBatchChooseStartId, mouseBatchChooseEndId } = this.tableStore;
            if (mouseBatchChooseStartId === mouseBatchChooseEndId) {
                return;
            }
            (mouseBatchChooseIdList || []).forEach((id) => {
                const record = dataSet.find((innerRecord) => innerRecord.id === id);
                if (record) {
                    dataSet.select(record);
                }
            });
        }
    }
    ;
    componentWillMount() {
        super.componentWillMount();
        this.initDefaultExpandedRows();
        this.processDataSetListener(true);
    }
    componentDidMount() {
        this.syncSize();
        this.syncSizeInFrame();
        // 为什么使用 pointerup
        // 因为需要对disabled的元素进行特殊处理
        // 因为状态的改变依赖 mouseup 而在disabled的元素上 无法触发mouseup事件
        // 导致状态无法进行修正
        // 以下两种方案通过 pointer-events:none 进行处理
        // https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
        // https://stackoverflow.com/questions/62081666/the-event-of-the-document-is-not-triggered-when-it-is-on-a-disabled-element
        // 而使用指针事件可以突破disabled的限制
        // https://stackoverflow.com/questions/62126515/how-to-get-the-state-of-the-mouse-through-javascript/62127845#62127845
        document.addEventListener('pointerup', this.handleDragMouseUp);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        super.componentWillReceiveProps(nextProps, nextContext);
        this.processDataSetListener(false);
        this.tableStore.setProps(nextProps);
        this.processDataSetListener(true);
    }
    componentWillUnmount() {
        this.processDataSetListener(false);
        document.removeEventListener('pointerup', this.handleDragMouseUp);
    }
    processDataSetListener(flag) {
        const { isTree, dataSet, inlineEdit } = this.tableStore;
        if (dataSet) {
            const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
            if (isTree) {
                handler.call(dataSet, 'load', this.handleDataSetLoad);
            }
            if (inlineEdit) {
                handler.call(dataSet, 'create', this.handleDataSetCreate);
            }
        }
    }
    render() {
        const { prefixCls, tableStore, tableStore: { overflowX, isAnyColumnsLeftLock, isAnyColumnsRightLock, dragRow, dragColumnAlign }, props: { style, spin, virtual, virtualSpin, buttons, queryFields, queryFieldsLimit, filterBarFieldName, filterBarPlaceholder, }, } = this;
        const content = this.getTable();
        const context = { tableStore };
        const pagination = this.getPagination("top" /* top */);
        const tableSpinProps = getConfig('tableSpinProps');
        const styleHeight = style ? toPx(style.height) : 0;
        return (React.createElement(ReactResizeObserver, { resizeProp: "width", onResize: this.handleResize },
            React.createElement("div", Object.assign({}, this.getWrapperProps()),
                React.createElement(TableContext.Provider, { value: context },
                    this.getHeader(),
                    React.createElement(TableQueryBar, { prefixCls: prefixCls, buttons: buttons, pagination: pagination, queryFields: queryFields, queryFieldsLimit: queryFieldsLimit, filterBarFieldName: filterBarFieldName, filterBarPlaceholder: filterBarPlaceholder }),
                    React.createElement(Spin, Object.assign({}, tableSpinProps, this.getSpinProps(), { key: "content" }),
                        virtual && React.createElement("div", { ref: (node) => this.refSpin = node, style: {
                                display: 'none',
                            } }, virtualSpin && React.createElement(Spin, Object.assign({ key: "virtual", spinning: true, style: {
                                height: pxToRem(styleHeight),
                                lineHeight: pxToRem(styleHeight),
                                position: 'absolute',
                                width: '100%',
                                zIndex: 4,
                            } }, tableSpinProps, spin))),
                        React.createElement("div", Object.assign({}, this.getOtherProps()),
                            React.createElement("div", { className: `${prefixCls}-content` },
                                content,
                                isAnyColumnsLeftLock && overflowX && this.getLeftFixedTable(),
                                isAnyColumnsRightLock && overflowX && this.getRightFixedTable(),
                                dragRow && dragColumnAlign === "left" /* left */ && isAnyColumnsLeftLock && this.getLeftFixedTable("left" /* left */),
                                dragRow && dragColumnAlign === "right" /* right */ && isAnyColumnsRightLock && this.getRightFixedTable("right" /* right */),
                                React.createElement("div", { ref: this.saveResizeRef, className: `${prefixCls}-split-line` })),
                            this.getFooter())),
                    this.getPagination("bottom" /* bottom */)))));
    }
    reorderDataSet(dataset, startIndex, endIndex) {
        dataset.move(startIndex, endIndex);
    }
    ;
    reorderColumns(columns, startIndex, endIndex) {
        const { columnsOnChange } = this.props;
        if (startIndex !== endIndex) {
            const cloneColumns = columns.slice();
            const [dropItem] = cloneColumns.slice(endIndex, endIndex + 1);
            const [dragItem] = cloneColumns.slice(startIndex, startIndex + 1);
            const normalColumnLock = (lock) => {
                if (lock === true) {
                    return "left" /* left */;
                }
                if (!lock) {
                    return false;
                }
                return lock;
            };
            if (dropItem &&
                dragItem &&
                dropItem.key !== DRAG_KEY &&
                dragItem.key !== DRAG_KEY &&
                normalColumnLock(dragItem.lock) === normalColumnLock(dropItem.lock)) {
                const [removed] = columns.splice(startIndex, 1);
                if (columns.length) {
                    columns.splice(endIndex, 0, removed);
                    if (columnsOnChange) {
                        columnsOnChange({ column: toJS(removed), columns: toJS(columns), type: "order" /* order */ });
                    }
                }
            }
        }
    }
    ;
    onDragEnd(resultDrag, provided) {
        const { onDragEnd, onDragEndBefore } = this.props;
        // @ts-ignore ts 中判断是否属于目标类型的方法
        const isDropresult = (dropResult) => {
            if (dropResult && dropResult.destination) {
                return ((typeof dropResult.source.index === 'number')
                    && (typeof dropResult.destination === 'object')
                    && (typeof dropResult.destination.index === 'number'));
            }
        };
        let resultBefore;
        if (onDragEndBefore) {
            const result = onDragEndBefore(this.tableStore.dataSet, toJS(this.tableStore.columns), resultDrag, provided);
            if (result === false) {
                return;
            }
            if (result && isDropresult(result)) {
                resultBefore = result;
            }
        }
        resultBefore = resultDrag;
        if (resultBefore && resultBefore.destination) {
            if (resultBefore.destination.droppableId === 'table') {
                this.reorderDataSet(this.tableStore.dataSet, resultBefore.source.index, resultBefore.destination.index);
            }
            if (resultBefore.destination.droppableId === 'tableHeader') {
                this.reorderColumns(this.tableStore.columns, resultBefore.source.index, resultBefore.destination.index);
            }
        }
        /**
         * 相应变化后的数据
         */
        if (onDragEnd) {
            onDragEnd(this.tableStore.dataSet, toJS(this.tableStore.columns), resultDrag, provided);
        }
    }
    handleBodyScroll(e) {
        if (this.scrollId !== undefined) {
            raf.cancel(this.scrollId);
        }
        const { currentTarget } = e;
        e.persist();
        this.scrollId = raf(() => {
            this.handleBodyScrollTop(e, currentTarget);
            this.handleBodyScrollLeft(e, currentTarget);
        });
    }
    handleBodyScrollTop(e, currentTarget) {
        const { target } = e;
        const { tableStore: { rowHeight, height }, observableProps: { dataSet }, props: { virtual, autoHeight }, } = this;
        if ((this.tableStore.height === undefined && !autoHeight) ||
            currentTarget !== target ||
            target === this.tableFootWrap) {
            return;
        }
        const fixedColumnsBodyLeft = this.fixedColumnsBodyLeft;
        const dragColumnsBodyLeft = this.dragColumnsBodyLeft;
        const bodyTable = this.tableBodyWrap;
        const fixedColumnsBodyRight = this.fixedColumnsBodyRight;
        const dragColumnsBodyRight = this.dragColumnsBodyRight;
        const { scrollTop } = target;
        if (scrollTop !== this.lastScrollTop) {
            if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
                fixedColumnsBodyLeft.scrollTop = scrollTop;
            }
            if (bodyTable && target !== bodyTable) {
                bodyTable.scrollTop = scrollTop;
            }
            if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
                fixedColumnsBodyRight.scrollTop = scrollTop;
            }
            if (dragColumnsBodyLeft && target !== dragColumnsBodyLeft) {
                dragColumnsBodyLeft.scrollTop = scrollTop;
            }
            if (dragColumnsBodyRight && target !== dragColumnsBodyRight) {
                dragColumnsBodyRight.scrollTop = scrollTop;
            }
            if (virtual) {
                this.refSpin.style.display = 'block';
                this.setSpin();
            }
        }
        if (virtual) {
            const startIndex = Math.max(Math.round((scrollTop / Number(rowHeight)) - 3), 0);
            const endIndex = Math.min(Math.round((scrollTop + height) / Number(rowHeight) + 2), dataSet.length);
            this.refUpperPlaceholder.map(upperNode => {
                if (upperNode) {
                    upperNode.style.height = `${startIndex * Number(rowHeight)}px`;
                    upperNode.style.display = startIndex === 0 ? 'none' : 'block';
                }
                return null;
            });
            this.refUnderPlaceholder.map(underNode => {
                if (underNode) {
                    underNode.style.display = endIndex === dataSet.length ? 'none' : 'block';
                }
                return null;
            });
            this.tableStore.setLastScrollTop(scrollTop);
        }
        this.lastScrollTop = scrollTop;
    }
    handleBodyScrollLeft(e, currentTarget) {
        const { target } = e;
        const headTable = this.tableHeadWrap;
        const bodyTable = this.tableBodyWrap;
        const footTable = this.tableFootWrap;
        if (this.tableStore.overflowX === undefined ||
            currentTarget !== target ||
            target === this.fixedColumnsBodyRight ||
            target === this.fixedColumnsBodyLeft) {
            return;
        }
        const { scrollLeft } = target;
        if (scrollLeft !== this.lastScrollLeft) {
            if (headTable && target !== headTable) {
                headTable.scrollLeft = scrollLeft;
            }
            if (bodyTable && target !== bodyTable) {
                bodyTable.scrollLeft = scrollLeft;
            }
            if (footTable && target !== footTable) {
                footTable.scrollLeft = scrollLeft;
            }
            this.setScrollPositionClassName(target);
        }
        this.lastScrollLeft = scrollLeft;
    }
    setScrollPositionClassName(target) {
        if (this.tableStore.isAnyColumnsLock) {
            const node = target || this.tableBodyWrap;
            if (node) {
                const scrollToLeft = node.scrollLeft === 0;
                const table = node.querySelector('table');
                const scrollToRight = table && node.scrollLeft >= table.offsetWidth - node.offsetWidth;
                if (scrollToLeft && scrollToRight) {
                    this.setScrollPosition("both" /* both */);
                }
                else if (scrollToLeft) {
                    this.setScrollPosition("left" /* left */);
                }
                else if (scrollToRight) {
                    this.setScrollPosition("right" /* right */);
                }
                else {
                    this.setScrollPosition("middle" /* middle */);
                }
            }
        }
    }
    setScrollPosition(position) {
        if (this.scrollPosition !== position) {
            this.scrollPosition = position;
            const { prefixCls } = this;
            const cls = classes(this.element).remove(new RegExp(`^${prefixCls}-scroll-position-.+$`));
            if (position === "both" /* both */) {
                cls.add(`${prefixCls}-scroll-position-left`).add(`${prefixCls}-scroll-position-right`);
            }
            else {
                cls.add(`${prefixCls}-scroll-position-${position}`);
            }
        }
    }
    saveRef(node) {
        this.refScroll = node;
    }
    renderTable(hasHeader, hasBody, hasFooter, lock, dragColumnAlign) {
        const { prefixCls, tableStore: { rowHeight, height }, observableProps: { dataSet }, props: { virtual }, } = this;
        const virtualH = Math.round(dataSet.length * Number(rowHeight));
        return virtual && height ?
            (React.createElement(React.Fragment, null,
                React.createElement(TableWrapper, { prefixCls: prefixCls, key: "tableWrapper-header", lock: lock, hasBody: false, hasHeader: hasHeader, hasFooter: false, dragColumnAlign: dragColumnAlign }, hasHeader && this.getTableHeader(lock, dragColumnAlign)),
                hasBody &&
                    React.createElement("div", { className: `${prefixCls}-tbody-wrapper`, style: { height: virtualH }, ref: this.saveRef },
                        React.createElement("div", { className: 'refUpperPlaceholder', style: { display: 'none' }, ref: (node) => this.refUpperPlaceholder.push(node) }),
                        React.createElement(TableWrapper, { prefixCls: prefixCls, key: "tableWrapper-body", lock: lock, hasBody: hasBody, hasHeader: false, hasFooter: false, dragColumnAlign: dragColumnAlign }, hasBody && this.getTableBody(lock, dragColumnAlign)),
                        React.createElement("div", { className: 'refUnderPlaceholder', style: { display: 'none' }, ref: (node) => this.refUnderPlaceholder.push(node) })),
                React.createElement(TableWrapper, { prefixCls: prefixCls, key: "tableWrapper-footer", lock: lock, hasBody: false, hasHeader: false, hasFooter: hasFooter, dragColumnAlign: dragColumnAlign }, hasFooter && this.getTableFooter(lock, dragColumnAlign)))) : (React.createElement(TableWrapper, { prefixCls: prefixCls, key: "tableWrapper", lock: lock, hasBody: hasBody, hasHeader: hasHeader, hasFooter: hasFooter, dragColumnAlign: dragColumnAlign },
            hasHeader && this.getTableHeader(lock, dragColumnAlign),
            hasBody && this.getTableBody(lock, dragColumnAlign),
            hasFooter && this.getTableFooter(lock, dragColumnAlign)));
    }
    getHeader() {
        const { prefixCls, props: { header, dataSet }, } = this;
        if (header) {
            const data = dataSet ? dataSet.records : [];
            return (React.createElement("div", { key: "header", className: `${prefixCls}-header` }, typeof header === 'function' ? header(data) : header));
        }
    }
    getFooter() {
        const { prefixCls, props: { footer, dataSet }, } = this;
        if (footer) {
            const data = dataSet ? dataSet.records : [];
            return (React.createElement("div", { key: "footer", className: `${prefixCls}-footer` }, typeof footer === 'function' ? footer(data) : footer));
        }
    }
    getPagination(position) {
        const { prefixCls, props: { dataSet }, tableStore: { pagination }, } = this;
        if (pagination !== false && dataSet && dataSet.paging) {
            const paginationPosition = getPaginationPosition(pagination);
            if (paginationPosition === "both" /* both */ || paginationPosition === position) {
                const paginationProps = omit(pagination, 'position');
                return (React.createElement(Pagination, Object.assign({ key: `pagination-${position}` }, paginationProps, { className: classNames(`${prefixCls}-pagination`, paginationProps.className), dataSet: dataSet }), this.getCacheSelectionSwitch()));
            }
        }
    }
    getCacheSelectionSwitch() {
        const { props: { dataSet }, prefixCls, } = this;
        if (dataSet && dataSet.cacheSelectionKeys && dataSet.cachedSelected.length) {
            const { showCachedSeletion } = this.tableStore;
            return (React.createElement(Tooltip, { title: $l('Table', showCachedSeletion ? 'hide_cached_seletion' : 'show_cached_seletion') },
                React.createElement(Switch, { className: `${prefixCls}-switch`, checked: showCachedSeletion, onChange: this.handleSwitchChange })));
        }
    }
    getTable(lock, dragColumnAlign) {
        const { prefixCls, props: { autoHeight } } = this;
        const { overflowX, height, hasFooter: footer } = this.tableStore;
        let tableHead;
        let tableBody;
        let tableFooter;
        if ((!dragColumnAlign && overflowX) || height !== undefined || autoHeight) {
            if (autoHeight)
                this.syncSize();
            const { lockColumnsBodyRowsHeight, rowHeight } = this.tableStore;
            let bodyHeight = height;
            let tableHeadRef;
            let tableBodyRef;
            let tableFootRef;
            if (!lock) {
                tableHeadRef = node => (this.tableHeadWrap = node);
                tableFootRef = node => (this.tableFootWrap = node);
                tableBodyRef = node => (this.tableBodyWrap = node);
            }
            else if (lock === 'right') {
                if (dragColumnAlign === "right" /* right */) {
                    tableBodyRef = node => (this.dragColumnsBodyRight = node);
                }
                tableBodyRef = node => (this.fixedColumnsBodyRight = node);
            }
            else {
                if (dragColumnAlign === "left" /* left */) {
                    tableBodyRef = node => (this.dragColumnsBodyLeft = node);
                }
                tableBodyRef = node => (this.fixedColumnsBodyLeft = node);
            }
            if (bodyHeight !== undefined) {
                bodyHeight = Math.max(bodyHeight, isNumber(rowHeight) ? rowHeight : lockColumnsBodyRowsHeight[0] || 0);
                if (lock && !footer) {
                    bodyHeight -= measureScrollbar();
                }
            }
            tableHead = (React.createElement("div", { key: "tableHead", ref: tableHeadRef, className: `${prefixCls}-head` }, this.renderTable(true, false, false, lock, dragColumnAlign)));
            tableBody = (React.createElement(TableBody, { key: "tableBody", getRef: tableBodyRef, prefixCls: prefixCls, lock: lock, height: bodyHeight, onScroll: this.handleBodyScroll }, this.renderTable(false, true, false, lock, dragColumnAlign)));
            if (footer) {
                tableFooter = (React.createElement("div", { key: "tableFooter", ref: tableFootRef, className: `${prefixCls}-foot`, onScroll: this.handleBodyScroll }, this.renderTable(false, false, true, lock, dragColumnAlign)));
            }
        }
        else {
            tableBody = this.renderTable(true, true, footer, lock, dragColumnAlign);
        }
        return [tableHead, tableBody, tableFooter];
    }
    getLeftFixedTable(dragColumnAlign) {
        const { overflowX, height } = this.tableStore;
        if ((!dragColumnAlign && !overflowX) && height === undefined) {
            return;
        }
        const { prefixCls } = this;
        const table = this.getTable("left" /* left */, dragColumnAlign);
        const isDragLeft = dragColumnAlign === "left" /* left */;
        const FixedTableClassName = classNames(`${prefixCls}-fixed-left`, {
            [`${prefixCls}-drag-left`]: isDragLeft,
        });
        let styleNOShadow = {};
        if (isDragLeft) {
            if (this.tableStore.leftLeafColumns.length !== 1) {
                styleNOShadow = { boxShadow: 'none' };
            }
        }
        return React.createElement("div", { style: styleNOShadow, className: FixedTableClassName }, table);
    }
    getRightFixedTable(dragColumnAlign) {
        const { overflowX, height } = this.tableStore;
        if ((!dragColumnAlign && !overflowX) && height === undefined) {
            return;
        }
        const { prefixCls } = this;
        const table = this.getTable("right" /* right */, dragColumnAlign);
        return React.createElement("div", { className: `${prefixCls}-fixed-right` }, table);
    }
    getTableBody(lock, dragColumnAlign) {
        const { prefixCls, props: { indentSize }, } = this;
        return (React.createElement(DragDropContext, { onDragEnd: this.onDragEnd },
            React.createElement(TableTBody, { key: "tbody", prefixCls: prefixCls, lock: lock, indentSize: indentSize, dragColumnAlign: dragColumnAlign })));
    }
    getTableHeader(lock, dragColumnAlign) {
        const { prefixCls, props: { dataSet }, } = this;
        return (React.createElement(DragDropContext, { onDragEnd: this.onDragEnd },
            React.createElement(TableHeader, { key: "thead", prefixCls: prefixCls, lock: lock, dataSet: dataSet, dragColumnAlign: dragColumnAlign })));
    }
    getTableFooter(lock, dragColumnAlign) {
        const { prefixCls, props: { dataSet }, } = this;
        return React.createElement(TableFooter, { key: "tfoot", prefixCls: prefixCls, lock: lock, dataSet: dataSet, dragColumnAlign: dragColumnAlign });
    }
    getStyleHeight() {
        const { style } = this.props;
        if (style) {
            return toPx(style.height);
        }
    }
    syncSizeInFrame(width = this.getWidth()) {
        if (this.nextFrameActionId !== undefined) {
            raf.cancel(this.nextFrameActionId);
        }
        this.nextFrameActionId = raf(this.syncSize.bind(this, width));
    }
    getContentHeight() {
        const { wrapper, element, prefixCls, props: { autoHeight } } = this;
        if (autoHeight) {
            const { top: parentTop, height: parentHeight } = wrapper.parentNode.getBoundingClientRect();
            const { top: tableTop } = element.getBoundingClientRect();
            let type = "minHeight" /* minHeight */;
            let diff = 80;
            if (isObject(autoHeight)) {
                type = autoHeight.type || "minHeight" /* minHeight */;
                diff = autoHeight.diff || 80;
            }
            if (wrapper) {
                if (type === "minHeight" /* minHeight */) {
                    return parentHeight - (tableTop - parentTop) - diff;
                }
                const tableBody = element.querySelectorAll(`.${prefixCls}-body`);
                if (tableBody) {
                    tableBody.forEach(tbody => {
                        tbody.style.maxHeight = pxToRem(parentHeight - (tableTop - parentTop) - diff) || '';
                        tbody.style.overflow = 'auto';
                    });
                }
            }
        }
        return this.getStyleHeight();
    }
    ;
    syncSize(width = this.getWidth()) {
        const { element, tableStore } = this;
        if (element) {
            tableStore.width = Math.floor(width);
            const { prefixCls } = this;
            let height = this.getContentHeight();
            if (element && isNumber(height)) {
                const tableTitle = element.querySelector(`.${prefixCls}-title`);
                const tableHeader = element.querySelector(`.${prefixCls}-thead`);
                const tableFooter = element.querySelector(`.${prefixCls}-footer`);
                const tableFootWrap = element.querySelector(`.${prefixCls}-foot`);
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
                this.tableStore.height = height;
            }
        }
        this.setScrollPositionClassName();
    }
    initDefaultExpandedRows() {
        const { tableStore, props: { dataSet, defaultRowExpanded }, } = this;
        if (tableStore.isTree && defaultRowExpanded && !dataSet.props.expandField) {
            tableStore.expandedRows = dataSet.reduce((array, record) => {
                if (record.children) {
                    array.push(record.key);
                }
                return array;
            }, []);
        }
    }
    getWidth() {
        const { wrapper } = this;
        if (wrapper) {
            return Math.floor(wrapper.getBoundingClientRect().width);
        }
        return 0;
    }
};
Table.displayName = 'Table';
Table.Column = Column;
Table.FilterBar = FilterBar;
Table.AdvancedQueryBar = AdvancedQueryBar;
Table.ProfessionalBar = ProfessionalBar;
Table.ToolBar = ToolBar;
Table.TableRow = TableRow;
Table.TableHeaderCell = TableHeaderCell;
Table.propTypes = {
    columns: PropTypes.array,
    /**
     * 表头
     */
    header: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 表脚
     */
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 是否显示边框
     * @default true
     */
    border: PropTypes.bool,
    /**
     * 功能按钮
     * 可选值：`add` `delete` `remove` `save` `query` `expandAll` `collapseAll` 或 自定义按钮
     */
    buttons: PropTypes.arrayOf(PropTypes.oneOfType([
        buttonsEnumType,
        PropTypes.arrayOf(PropTypes.oneOfType([buttonsEnumType, PropTypes.object])),
        PropTypes.node,
    ])),
    /**
     * 自定义查询字段组件
     * 默认会根据queryDataSet中定义的field类型自动匹配组件， 匹配类型如下
     * lovCode => Lov
     * lookupCode => Select
     * type:number => NumberField
     * type:date => DatePicker
     * type:dateTime => DatePicker[mode=dateTime]
     * type:week => DatePicker[mode=week]
     * default => TextField
     */
    queryFields: PropTypes.object,
    /**
     * 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口
     * @default 1
     */
    queryFieldsLimit: PropTypes.number,
    /**
     * 显示查询条
     * @default true
     */
    queryBar: PropTypes.oneOfType([
        PropTypes.oneOf([
            "advancedBar" /* advancedBar */,
            "normal" /* normal */,
            "bar" /* bar */,
            "none" /* none */,
            "professionalBar" /* professionalBar */,
        ]),
        PropTypes.func,
    ]),
    useMouseBatchChoose: PropTypes.bool,
    /**
     * 行高
     * @default 30
     */
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    alwaysShowRowBox: PropTypes.bool,
    defaultRowExpanded: PropTypes.bool,
    expandRowByClick: PropTypes.bool,
    indentSize: PropTypes.number,
    filter: PropTypes.func,
    mode: PropTypes.oneOf(["list" /* list */, "tree" /* tree */]),
    editMode: PropTypes.oneOf(["inline" /* inline */, "cell" /* cell */]),
    filterBarFieldName: PropTypes.string,
    filterBarPlaceholder: PropTypes.string,
    highLightRow: PropTypes.bool,
    selectedHighLightRow: PropTypes.bool,
    autoMaxWidth: PropTypes.bool,
    /**
     * 设置drag框体位置
     */
    dragColumnAlign: PropTypes.oneOf(["left" /* left */, "right" /* right */]),
    /**
     * 开启列拖拽，但是无法使用宽度拖拽
     */
    dragColumn: PropTypes.bool,
    /**
     * 开启行拖拽
     */
    dragRow: PropTypes.bool,
    columnsMergeCoverage: PropTypes.array,
    columnsDragRender: PropTypes.object,
    expandIcon: PropTypes.func,
    rowDragRender: PropTypes.object,
    columnsEditType: PropTypes.oneOf(["all" /* all */, "header" /* header */, "order" /* order */]),
    onDragEndBefore: PropTypes.func,
    ...DataSetComponent.propTypes,
};
Table.defaultProps = {
    suffixCls: 'table',
    tabIndex: 0,
    selectionMode: "rowbox" /* rowbox */,
    queryFields: {},
    defaultRowExpanded: false,
    expandRowByClick: false,
    indentSize: 15,
    filterBarFieldName: 'params',
    virtual: false,
    virtualSpin: false,
    autoHeight: false,
    autoMaxWidth: false,
    columnsMergeCoverage: [],
};
__decorate([
    autobind
], Table.prototype, "saveResizeRef", null);
__decorate([
    autobind,
    action
], Table.prototype, "handleSwitchChange", null);
__decorate([
    autobind
], Table.prototype, "handleResize", null);
__decorate([
    autobind
], Table.prototype, "handleDataSetLoad", null);
__decorate([
    autobind
], Table.prototype, "handleDataSetCreate", null);
__decorate([
    autobind
], Table.prototype, "handleKeyDown", null);
__decorate([
    autobind
], Table.prototype, "handleDragMouseUp", null);
__decorate([
    action
], Table.prototype, "reorderDataSet", null);
__decorate([
    action
], Table.prototype, "reorderColumns", null);
__decorate([
    autobind
], Table.prototype, "onDragEnd", null);
__decorate([
    autobind
], Table.prototype, "handleBodyScroll", null);
__decorate([
    autobind
], Table.prototype, "saveRef", null);
__decorate([
    autobind,
    action
], Table.prototype, "syncSize", null);
__decorate([
    action
], Table.prototype, "initDefaultExpandedRows", null);
Table = __decorate([
    observer
], Table);
export default Table;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFxRCxNQUFNLE9BQU8sQ0FBQztBQUMxRSxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQztBQUN0QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxPQUFPLE1BQU0sbUJBQW1CLENBQUM7QUFDeEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUNMLGVBQWUsR0FPaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3hFLE9BQU8sT0FBTyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckUsT0FBTyxnQkFBZ0IsTUFBTSx5Q0FBeUMsQ0FBQztBQUN2RSxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLG1CQUFtQixNQUFNLHVDQUF1QyxDQUFDO0FBQ3hFLE9BQU8sTUFBTSxFQUFFLEVBQWUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2hFLE9BQU8sUUFBMkIsTUFBTSxZ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O0lBREMsTUFBTTsyQ0FHTjtBQUdEO0lBREMsTUFBTTsyQ0ErQk47QUFHRDtJQURDLFFBQVE7c0NBNkNSO0FBR0Q7SUFEQyxRQUFROzZDQVdSO0FBeUlEO0lBREMsUUFBUTtvQ0FHUjtBQWdWRDtJQUZDLFFBQVE7SUFDUixNQUFNO3FDQWdDTjtBQUdEO0lBREMsTUFBTTtvREFjTjtBQTVyQ2tCLEtBQUs7SUFEekIsUUFBUTtHQUNZLEtBQUssQ0Fxc0N6QjtlQXJzQ29CLEtBQUsiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgTW91c2VFdmVudEhhbmRsZXIsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHJhZiBmcm9tICdyYWYnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBpc051bWJlciBmcm9tICdsb2Rhc2gvaXNOdW1iZXInO1xuaW1wb3J0IGlzVW5kZWZpbmVkIGZyb20gJ2xvZGFzaC9pc1VuZGVmaW5lZCc7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2gvaXNPYmplY3QnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IGNsYXNzZXMgZnJvbSAnY29tcG9uZW50LWNsYXNzZXMnO1xuaW1wb3J0IHsgYWN0aW9uLCB0b0pTIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBEcmFnRHJvcENvbnRleHQsXG4gIERyb3BSZXN1bHQsXG4gIFJlc3BvbmRlclByb3ZpZGVkLFxuICBEcm9wcGFibGVQcm9wcyxcbiAgRHJhZ2dhYmxlUHJvcHMsXG4gIERyYWdnYWJsZVJ1YnJpYyxcbiAgRHJhZ2dhYmxlU3RhdGVTbmFwc2hvdCxcbn0gZnJvbSAncmVhY3QtYmVhdXRpZnVsLWRuZCc7XG5pbXBvcnQgeyBnZXRDb25maWcsIGdldFByb1ByZWZpeENscyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgeyBweFRvUmVtLCB0b1B4IH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCBtZWFzdXJlU2Nyb2xsYmFyIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvbWVhc3VyZVNjcm9sbGJhcic7XG5pbXBvcnQgS2V5Q29kZSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL0tleUNvZGUnO1xuaW1wb3J0IFJlYWN0UmVzaXplT2JzZXJ2ZXIgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9yZXNpemVPYnNlcnZlcic7XG5pbXBvcnQgQ29sdW1uLCB7IENvbHVtblByb3BzLCBkZWZhdWx0TWluV2lkdGggfSBmcm9tICcuL0NvbHVtbic7XG5pbXBvcnQgVGFibGVSb3csIHsgVGFibGVSb3dQcm9wcyB9IGZyb20gJy4vVGFibGVSb3cnO1xuaW1wb3J0IFRhYmxlSGVhZGVyQ2VsbCwgeyBUYWJsZUhlYWRlckNlbGxQcm9wcyB9IGZyb20gJy4vVGFibGVIZWFkZXJDZWxsJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXQnO1xuaW1wb3J0IFJlY29yZCBmcm9tICcuLi9kYXRhLXNldC9SZWNvcmQnO1xuaW1wb3J0IFRhYmxlU3RvcmUsIHsgRFJBR19LRVkgfSBmcm9tICcuL1RhYmxlU3RvcmUnO1xuaW1wb3J0IFRhYmxlSGVhZGVyIGZyb20gJy4vVGFibGVIZWFkZXInO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCBQYWdpbmF0aW9uLCB7IFBhZ2luYXRpb25Qcm9wcyB9IGZyb20gJy4uL3BhZ2luYXRpb24vUGFnaW5hdGlvbic7XG5pbXBvcnQgU3BpbiwgeyBTcGluUHJvcHMgfSBmcm9tICcuLi9zcGluJztcbmltcG9ydCBEYXRhU2V0Q29tcG9uZW50LCB7IERhdGFTZXRDb21wb25lbnRQcm9wcyB9IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXRDb21wb25lbnQnO1xuaW1wb3J0IFRhYmxlQ29udGV4dCBmcm9tICcuL1RhYmxlQ29udGV4dCc7XG5pbXBvcnQgVGFibGVXcmFwcGVyIGZyb20gJy4vVGFibGVXcmFwcGVyJztcbmltcG9ydCBUYWJsZVRCb2R5IGZyb20gJy4vVGFibGVUQm9keSc7XG5pbXBvcnQgVGFibGVGb290ZXIgZnJvbSAnLi9UYWJsZUZvb3Rlcic7XG5pbXBvcnQge1xuICBDb2x1bW5Mb2NrLFxuICBTY3JvbGxQb3NpdGlvbixcbiAgU2VsZWN0aW9uTW9kZSxcbiAgVGFibGVCdXR0b25UeXBlLFxuICBUYWJsZUNvbW1hbmRUeXBlLFxuICBUYWJsZUVkaXRNb2RlLFxuICBUYWJsZU1vZGUsXG4gIFRhYmxlUGFnaW5hdGlvblBvc2l0aW9uLFxuICBUYWJsZVF1ZXJ5QmFyVHlwZSxcbiAgVGFibGVBdXRvSGVpZ2h0VHlwZSxcbiAgRHJhZ0NvbHVtbkFsaWduLFxuICBDb2x1bW5zRWRpdFR5cGUsXG59IGZyb20gJy4vZW51bSc7XG5pbXBvcnQgU3dpdGNoIGZyb20gJy4uL3N3aXRjaC9Td2l0Y2gnO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcC9Ub29sdGlwJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IFRhYmxlUXVlcnlCYXIgZnJvbSAnLi9xdWVyeS1iYXInO1xuaW1wb3J0IEZpbHRlckJhciBmcm9tICcuL3F1ZXJ5LWJhci9UYWJsZUZpbHRlckJhcic7XG5pbXBvcnQgQWR2YW5jZWRRdWVyeUJhciBmcm9tICcuL3F1ZXJ5LWJhci9UYWJsZUFkdmFuY2VkUXVlcnlCYXInO1xuaW1wb3J0IFByb2Zlc3Npb25hbEJhciBmcm9tICcuL3F1ZXJ5LWJhci9UYWJsZVByb2Zlc3Npb25hbEJhcic7XG5pbXBvcnQgVG9vbEJhciBmcm9tICcuL3F1ZXJ5LWJhci9UYWJsZVRvb2xCYXInO1xuaW1wb3J0IHsgZmluZEluZGV4ZWRTaWJsaW5nLCBnZXRIZWlnaHQsIGdldFBhZ2luYXRpb25Qb3NpdGlvbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgQnV0dG9uUHJvcHMgfSBmcm9tICcuLi9idXR0b24vQnV0dG9uJztcbmltcG9ydCBUYWJsZUJvZHkgZnJvbSAnLi9UYWJsZUJvZHknO1xuXG5leHBvcnQgdHlwZSBUYWJsZUJ1dHRvblByb3BzID0gQnV0dG9uUHJvcHMgJiB7IGFmdGVyQ2xpY2s/OiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+OyBjaGlsZHJlbj86IFJlYWN0Tm9kZTsgfTtcblxuZXhwb3J0IHR5cGUgQnV0dG9ucyA9XG4gIHwgVGFibGVCdXR0b25UeXBlXG4gIHwgW1RhYmxlQnV0dG9uVHlwZSwgVGFibGVCdXR0b25Qcm9wc11cbiAgfCBSZWFjdEVsZW1lbnQ8VGFibGVCdXR0b25Qcm9wcz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFibGVRdWVyeUJhckhvb2tQcm9wcyB7XG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIHF1ZXJ5RGF0YVNldD86IERhdGFTZXQ7XG4gIGJ1dHRvbnM6IFJlYWN0RWxlbWVudDxCdXR0b25Qcm9wcz5bXTtcbiAgcXVlcnlGaWVsZHM6IFJlYWN0RWxlbWVudDxhbnk+W107XG4gIHF1ZXJ5RmllbGRzTGltaXQ6IG51bWJlcjtcbiAgcGFnaW5hdGlvbj86IFJlYWN0RWxlbWVudDxQYWdpbmF0aW9uUHJvcHM+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGV4cGFuZGVkUm93UmVuZGVyZXJQcm9wcyB7XG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIHJlY29yZDogUmVjb3JkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGV4cGFuZEljb25Qcm9wcyB7XG4gIHByZWZpeENscz86IHN0cmluZztcbiAgZXhwYW5kZWQ6IGJvb2xlYW47XG4gIG9uRXhwYW5kOiBGdW5jdGlvbjtcbiAgcmVjb3JkOiBSZWNvcmQ7XG4gIGV4cGFuZGFibGU6IGJvb2xlYW47XG4gIG5lZWRJbmRlbnRTcGFjZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2Ugb25Sb3dQcm9wcyB7XG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIHJlY29yZDogUmVjb3JkO1xuICBpbmRleDogbnVtYmVyO1xuICBleHBhbmRlZFJvdzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgVGFibGVRdWVyeUJhckhvb2sgPSAocHJvcHM6IFRhYmxlUXVlcnlCYXJIb29rUHJvcHMpID0+IFJlYWN0Tm9kZTtcbmV4cG9ydCB0eXBlIENvbW1hbmRzID1cbiAgfCBUYWJsZUNvbW1hbmRUeXBlXG4gIHwgW1RhYmxlQ29tbWFuZFR5cGUsIFRhYmxlQnV0dG9uUHJvcHNdXG4gIHwgUmVhY3RFbGVtZW50PFRhYmxlQnV0dG9uUHJvcHM+O1xuXG5leHBvcnQgY29uc3QgYnV0dG9uc0VudW1UeXBlID0gUHJvcFR5cGVzLm9uZU9mKFtcbiAgVGFibGVCdXR0b25UeXBlLmFkZCxcbiAgVGFibGVCdXR0b25UeXBlLnNhdmUsXG4gIFRhYmxlQnV0dG9uVHlwZS5yZW1vdmUsXG4gIFRhYmxlQnV0dG9uVHlwZS5kZWxldGUsXG4gIFRhYmxlQnV0dG9uVHlwZS5yZXNldCxcbiAgVGFibGVCdXR0b25UeXBlLnF1ZXJ5LFxuICBUYWJsZUJ1dHRvblR5cGUuZXhwb3J0LFxuICBUYWJsZUJ1dHRvblR5cGUuZXhwYW5kQWxsLFxuICBUYWJsZUJ1dHRvblR5cGUuY29sbGFwc2VBbGwsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBUYWJsZVBhZ2luYXRpb25Db25maWcgZXh0ZW5kcyBQYWdpbmF0aW9uUHJvcHMge1xuICBwb3NpdGlvbj86IFRhYmxlUGFnaW5hdGlvblBvc2l0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBTcGluSW5kaWNhdG9yID0gUmVhY3RFbGVtZW50PGFueT47XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFibGVTcGluQ29uZmlnIGV4dGVuZHMgU3BpblByb3BzIHtcbiAgc3Bpbm5pbmc/OiBib29sZWFuO1xuICBpbmRpY2F0b3I/OiBTcGluSW5kaWNhdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluc3RhbmNlIHtcbiAgdGJvZHk6IFJlYWN0LlJlYWN0RWxlbWVudDtcbiAgaGVhZHRyOiBSZWFjdC5SZWFjdEVsZW1lbnQ7XG59XG5cbi8qKlxuICogRHJhZ2dhYmxlUnVicmljIOWPr+S7peiOt+WPluaLluWKqOi1t+adpWl0ZW3nmoRpbmRleOWSjGlk5LuO5YiX6KGo6I635Y+W5L+h5oGvXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1RhYmxlSGVhZGVyQ2VsbFByb3BzIGV4dGVuZHMgVGFibGVIZWFkZXJDZWxsUHJvcHMge1xuICBydWJyaWM6IERyYWdnYWJsZVJ1YnJpY1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdUYWJsZVJvd1Byb3BzIGV4dGVuZHMgVGFibGVSb3dQcm9wcyB7XG4gIHJ1YnJpYzogRHJhZ2dhYmxlUnVicmljXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm93UmVuZGVySWNvbiB7XG4gIGNvbHVtbjogQ29sdW1uUHJvcHM7XG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIHNuYXBzaG90OiBEcmFnZ2FibGVTdGF0ZVNuYXBzaG90O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbHVtblJlbmRlckljb24ge1xuICByZWNvcmQ6IFJlY29yZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmVuZGVyIHtcbiAgZHJvcHBhYmxlUHJvcHM/OiBEcm9wcGFibGVQcm9wcztcbiAgZHJhZ2dhYmxlUHJvcHM/OiBEcmFnZ2FibGVQcm9wcztcbiAgcmVuZGVyQ2xvbmU/OiAoKGRyYWdSZW5kZXJQcm9wczogRHJhZ1RhYmxlUm93UHJvcHMpID0+IFJlYWN0RWxlbWVudDxhbnk+KSB8ICgoZHJhZ1JlbmRlclByb3BzOiBEcmFnVGFibGVIZWFkZXJDZWxsUHJvcHMpID0+IFJlYWN0RWxlbWVudDxhbnk+KTtcbiAgcmVuZGVySWNvbj86ICgocm93UmVuZGVySWNvbjpSb3dSZW5kZXJJY29uKSA9PiBSZWFjdEVsZW1lbnQ8YW55PikgfCAoKGNvbHVtblJlbmRlckljb246Q29sdW1uUmVuZGVySWNvbikgPT4gUmVhY3RFbGVtZW50PGFueT4pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENoYW5nZUNvbHVtbnMge1xuICBjb2x1bW46Q29sdW1uUHJvcHM7XG4gIGNvbHVtbnM6Q29sdW1uUHJvcHNbXTtcbiAgdHlwZTpDb2x1bW5zRWRpdFR5cGU7XG59XG5cbmxldCBfaW5zdGFuY2U7XG4vLyDmnoTpgKDkuIDkuKrljZXkvot0YWJsZeadpemYsuatomJvZHnkuIvkuI3og73mnIl0YWJsZeWFg+e0oOeahOaKpemUmVxuZXhwb3J0IGNvbnN0IGluc3RhbmNlID0gKCk6IEluc3RhbmNlID0+IHtcbiAgLy8gVXNpbmcgYSB0YWJsZSBhcyB0aGUgcG9ydGFsIHNvIHRoYXQgd2UgZG8gbm90IGdldCByZWFjdFxuICAvLyB3YXJuaW5ncyB3aGVuIG1vdW50aW5nIGEgdHIgZWxlbWVudFxuICBjb25zdCBfdGFibGVDb250YWluID0gKCk6IEluc3RhbmNlID0+IHtcbiAgICBjb25zdCB0YWJsZTogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgIHRhYmxlLmNsYXNzTGlzdC5hZGQoYCR7Z2V0UHJvUHJlZml4Q2xzKCd0YWJsZScpfS1kcmFnLWNvbnRhaW5lcmApO1xuXG4gICAgY29uc3QgdGhlYWQ6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGhlYWQnKTtcbiAgICB0aGVhZC5jbGFzc0xpc3QuYWRkKGAke2dldFByb1ByZWZpeENscygndGFibGUnKX0tdGhlYWRgKTtcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0aGVhZCk7XG5cbiAgICBjb25zdCBoZWFkdHI6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICB0aGVhZC5hcHBlbmRDaGlsZChoZWFkdHIpO1xuICAgIGNvbnN0IHRib2R5OiBIVE1MRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Rib2R5Jyk7XG5cbiAgICB0Ym9keS5jbGFzc0xpc3QuYWRkKGAke2dldFByb1ByZWZpeENscygndGFibGUnKX0tdGJvZHlgKTtcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0Ym9keSk7XG4gICAgaWYgKCFkb2N1bWVudC5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RvY3VtZW50LmJvZHkgcmVxdWlyZWQgYSBib2R5IHRvIGFwcGVuZCcpO1xuICAgIH1cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGJvZHksXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBoZWFkdHIsXG4gICAgfTtcbiAgfTtcbiAgaWYgKF9pbnN0YW5jZSkge1xuICAgIHJldHVybiBfaW5zdGFuY2U7XG4gIH1cbiAgcmV0dXJuIF9pbnN0YW5jZSA9IF90YWJsZUNvbnRhaW4oKTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFibGVQcm9wcyBleHRlbmRzIERhdGFTZXRDb21wb25lbnRQcm9wcyB7XG4gIGNvbHVtbnM/OiBDb2x1bW5Qcm9wc1tdO1xuICAvKipcbiAgICog6KGo5aS0XG4gICAqL1xuICBoZWFkZXI/OiBSZWFjdE5vZGUgfCAoKHJlY29yZHM6IFJlY29yZFtdKSA9PiBSZWFjdE5vZGUpO1xuICAvKipcbiAgICog6KGo6ISaXG4gICAqL1xuICBmb290ZXI/OiBSZWFjdE5vZGUgfCAoKHJlY29yZHM6IFJlY29yZFtdKSA9PiBSZWFjdE5vZGUpO1xuICAvKipcbiAgICog5piv5ZCm5pi+56S66L655qGGXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGJvcmRlcj86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmlbDmja7mupBcbiAgICovXG4gIGRhdGFTZXQ6IERhdGFTZXQ7XG4gIC8qKlxuICAgKiDpgInmi6norrDlvZXnmoTmqKHlvI9cbiAgICovXG4gIHNlbGVjdGlvbk1vZGU/OiBTZWxlY3Rpb25Nb2RlO1xuICAvKipcbiAgICog5Zyo5YW25LuW5qih5byP5LiL5piv5LiN5piv6KaB5piv6KaBcm93Ym94XG4gICAqL1xuICBhbHdheXNTaG93Um93Qm94PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOiuvue9ruihjOWxnuaAp1xuICAgKiBAcGFyYW0ge29uUm93UHJvcHN9IHByb3BzXG4gICAqIEByZXR1cm4ge09iamVjdH0g6KGM5bGe5oCnXG4gICAqL1xuICBvblJvdz86IChwcm9wczogb25Sb3dQcm9wcykgPT4gb2JqZWN0O1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICog6K+35L2/55SoIG9uUm93XG4gICAqL1xuICByb3dSZW5kZXJlcj86IChyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlcikgPT4gb2JqZWN0O1xuICAvKipcbiAgICog5Yqf6IO95oyJ6ZKuXG4gICAqIOWPr+mAieWAvO+8mmBhZGRgIGBkZWxldGVgIGByZW1vdmVgIGBzYXZlYCBgcXVlcnlgIGByZXNldGAgYGV4cGFuZEFsbGAgYGNvbGxhcHNlQWxsYCBgZXhwb3J0YCDmiJYg6Ieq5a6a5LmJ5oyJ6ZKuXG4gICAqIOe7meWGhee9ruaMiemSruWKoOWxnuaAp++8mmJ1dHRvbnM9e1tbJ2FkZCcsIHsgY29sb3I6ICdyZWQnIH1dLCAuLi5dfVxuICAgKi9cbiAgYnV0dG9ucz86IEJ1dHRvbnNbXTtcbiAgLyoqXG4gICAqIOiHquWumuS5ieafpeivouWtl+autee7hOS7tlxuICAgKiBAZXhhbXBsZVxuICAgKiB7IGFnZTogPE51bWJlckZpZWxkIC8+IH1cbiAgICpcbiAgICog6buY6K6k5Lya5qC55o2ucXVlcnlEYXRhU2V05Lit5a6a5LmJ55qEZmllbGTnsbvlnovoh6rliqjljLnphY3nu4Tku7bvvIwg5Yy56YWN57G75Z6L5aaC5LiLXG4gICAqIGxvdkNvZGUgPT4gTG92XG4gICAqIGxvb2t1cENvZGUgPT4gU2VsZWN0XG4gICAqIHR5cGU6bnVtYmVyID0+IE51bWJlckZpZWxkXG4gICAqIHR5cGU6ZGF0ZSA9PiBEYXRlUGlja2VyXG4gICAqIHR5cGU6ZGF0ZVRpbWUgPT4gRGF0ZVBpY2tlclttb2RlPWRhdGVUaW1lXVxuICAgKiB0eXBlOndlZWsgPT4gRGF0ZVBpY2tlclttb2RlPXdlZWtdXG4gICAqIGRlZmF1bHQgPT4gVGV4dEZpZWxkXG4gICAqL1xuICBxdWVyeUZpZWxkcz86IHsgW2tleTogc3RyaW5nXTogUmVhY3RFbGVtZW50PGFueT47IH07XG4gIC8qKlxuICAgKiDlpLTpg6jmmL7npLrnmoTmn6Xor6LlrZfmrrXnmoTmlbDph4/vvIzotoXlh7rpmZDliLbnmoTmn6Xor6LlrZfmrrXmlL7lhaXlvLnlh7rnqpflj6NcbiAgICogQGRlZmF1bHQgMVxuICAgKi9cbiAgcXVlcnlGaWVsZHNMaW1pdD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOaYvuekuuafpeivouadoVxuICAgKiDlj6/pgInlgLw6IGBhZHZhbmNlZEJhcmAgYG5vcm1hbGAgYGJhcmAgYG5vbmVgIGBwcm9mZXNzaW9uYWxCYXJgXG4gICAqIEBkZWZhdWx0ICdub3JtYWwnXG4gICAqL1xuICBxdWVyeUJhcj86IFRhYmxlUXVlcnlCYXJUeXBlIHwgVGFibGVRdWVyeUJhckhvb2s7XG4gIC8qKlxuICAgKiDmmK/lkKbkvb/nlKjmi5bmi73pgInmi6lcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVzZU1vdXNlQmF0Y2hDaG9vc2U/OiBib29sZWFuO1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICog6K+35L2/55SoIHF1ZXJ5QmFyPVwibm9uZVwiXG4gICAqL1xuICBzaG93UXVlcnlCYXI/OiBib29sZWFuO1xuICAvKipcbiAgICog6KGM6auYXG4gICAqIEBkZWZhdWx0IDMxXG4gICAqL1xuICByb3dIZWlnaHQ/OiBudW1iZXIgfCAnYXV0byc7XG4gIC8qKlxuICAgKiDpu5jorqTooYzmmK/lkKblsZXlvIDvvIzlvZNkYXRhU2V05rKh5pyJ6K6+572uZXhwYW5kRmllbGTml7bmiY3mnInmlYhcbiAgICogQGRlZmF1bHQgZmFsc2U7XG4gICAqL1xuICBkZWZhdWx0Um93RXhwYW5kZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICog6YCa6L+H54K55Ye76KGM5p2l5bGV5byA5a2Q6KGMXG4gICAqL1xuICBleHBhbmRSb3dCeUNsaWNrPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOWxleW8gOihjOa4suafk+WZqFxuICAgKi9cbiAgZXhwYW5kZWRSb3dSZW5kZXJlcj86IChwcm9wczogZXhwYW5kZWRSb3dSZW5kZXJlclByb3BzKSA9PiBSZWFjdE5vZGU7XG4gIC8qKlxuICAgKiDoh6rlrprkuYnlsZXlvIDlm77moIdcbiAgICovXG4gIGV4cGFuZEljb24/OiAocHJvcHM6IGV4cGFuZEljb25Qcm9wcykgPT4gUmVhY3ROb2RlO1xuICAvKipcbiAgICog5bGV5byA5Zu+5qCH5omA5Zyo5YiX57Si5byVXG4gICAqL1xuICBleHBhbmRJY29uQ29sdW1uSW5kZXg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDlsZXnpLrmoJHlvaLmlbDmja7ml7bvvIzmr4/lsYLnvKnov5vnmoTlrr3luqZcbiAgICovXG4gIGluZGVudFNpemU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDmlbDmja7ov4fmu6RcbiAgICog6L+U5Zue5YC8IHRydWUgLSDmmL7npLogZmFsc2UgLSDkuI3mmL7npLpcbiAgICogQHBhcmFtIHtSZWNvcmR9IHJlY29yZCDorrDlvZVcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGZpbHRlcj86IChyZWNvcmQ6IFJlY29yZCkgPT4gYm9vbGVhbjtcbiAgLyoqXG4gICAqIOihqOagvOWxleekuueahOaooeW8j1xuICAgKiB0cmVl6ZyA6KaB6YWN5ZCIZGF0YVNldOeahGBpZEZpZWxkYOWSjGBwYXJlbnRGaWVsZGDmnaXlsZXnpLpcbiAgICog5Y+v6YCJ5YC8OiBgbGlzdGAgYHRyZWVgXG4gICAqL1xuICBtb2RlPzogVGFibGVNb2RlO1xuICAvKipcbiAgICog6KGo5qC857yW6L6R55qE5qih5byPXG4gICAqIOWPr+mAieWAvDogYGNlbGxgIGBpbmxpbmVgXG4gICAqIEBkZWZhdWx0IGNlbGxcbiAgICovXG4gIGVkaXRNb2RlPzogVGFibGVFZGl0TW9kZTtcbiAgLyoqXG4gICAqIHF1ZXJ5QmFy5Li6YmFy5pe277yM55u05o6l6L6T5YWl55qE6L+H5ruk5p2h5Lu255qE5a2X5q615ZCNXG4gICAqL1xuICBmaWx0ZXJCYXJGaWVsZE5hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBxdWVyeUJhcuS4umJhcuaXtui+k+WFpeahhueahOWNoOS9jeesplxuICAgKi9cbiAgZmlsdGVyQmFyUGxhY2Vob2xkZXI/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDliIbpobXlr7zoiKrmnaHlsZ7mgKdcbiAgICovXG4gIHBhZ2luYXRpb24/OiBUYWJsZVBhZ2luYXRpb25Db25maWcgfCBmYWxzZTtcbiAgLyoqXG4gICAqIOmrmOS6ruihjFxuICAgKi9cbiAgaGlnaExpZ2h0Um93PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOWLvumAiemrmOS6ruihjFxuICAgKi9cbiAgc2VsZWN0ZWRIaWdoTGlnaHRSb3c/OiBib29sZWFuO1xuICAvKipcbiAgICog5Y+v6LCD5pW05YiX5a69XG4gICAqL1xuICBjb2x1bW5SZXNpemFibGU/OiBib29sZWFuO1xuICAvKipcbiAgICog5pi+56S65Y6f5aeL5YC8XG4gICAqL1xuICBwcmlzdGluZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDngrnlh7vlsZXlvIDlm77moIfml7bop6blj5FcbiAgICovXG4gIG9uRXhwYW5kPzogKGV4cGFuZGVkOiBib29sZWFuLCByZWNvcmQ6IFJlY29yZCkgPT4gdm9pZDtcbiAgLyoqXG4gICAqIOWKoOi9veadoeWxnuaAp1xuICAgKi9cbiAgc3Bpbj86IFRhYmxlU3BpbkNvbmZpZyB8IGZhbHNlO1xuICAvKipcbiAgICog6Jma5ouf5rua5YqoXG4gICAqL1xuICB2aXJ0dWFsPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOiZmuaLn+a7muWKqOaYr+WQpuaYvuekuuWKoOi9vVxuICAgKi9cbiAgdmlydHVhbFNwaW4/OiBib29sZWFuO1xuICAvKipcbiAgICog5piv5ZCm5byA5ZCv6Ieq6YCC5bqU6auY5bqmXG4gICAqL1xuICBhdXRvSGVpZ2h0PzogYm9vbGVhbiB8IHsgdHlwZTogVGFibGVBdXRvSGVpZ2h0VHlwZSwgZGlmZjogbnVtYmVyIH07XG4gIC8qKlxuICAgKiDmmK/lkKblvIDlkK/lrr3luqblj4zlh7vmnIDlpKflgLxcbiAgICovXG4gIGF1dG9NYXhXaWR0aD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDorr7nva5kcmFn5qGG5L2T5L2N572uXG4gICAqL1xuICBkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ247XG4gIC8qKlxuICAgKiDlvIDlkK/liJfmi5bmi73vvIzkvYbmmK/ml6Dms5Xkvb/nlKjlrr3luqbmi5bmi71cbiAgICovXG4gIGRyYWdDb2x1bW4/OiBib29sZWFuO1xuICAvKipcbiAgICog5byA5ZCv6KGM5ouW5ou9XG4gICAqL1xuICBkcmFnUm93PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaLluaLveinpuWPkeS6i+S7tlxuICAgKi9cbiAgb25EcmFnRW5kPzogKGRhdGFTZXQ6IERhdGFTZXQsIGNvbHVtbnM6IENvbHVtblByb3BzW10sIHJlc3VsdERyYWc6IERyb3BSZXN1bHQsIHByb3ZpZGVkOiBSZXNwb25kZXJQcm92aWRlZCkgPT4gdm9pZFxuICAvKipcbiAgICog5riy5p+T5YiX5ouW5ou9XG4gICAqL1xuICBjb2x1bW5zRHJhZ1JlbmRlcj86IERyYWdSZW5kZXI7XG4gIC8qKlxuICAgKiDmuLLmn5PooYzmi5bmi71cbiAgICovXG4gIHJvd0RyYWdSZW5kZXI/OiBEcmFnUmVuZGVyO1xuICAvKipcbiAgICog5piv5ZCm5byA5ZCv5Zue6L2m6Lez6L2s5LiL5LiA6KGM57yW6L6RXG4gICAqL1xuICBlZGl0b3JOZXh0S2V5RW50ZXJEb3duPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOS8mOWFiOe6p+mrmOS6jmNvbHVtc++8jOWPr+S7peWunueOsOihqOWktOaWh+Wtl+S/ruaUueWSjOWIl+eahOS9jee9ruS/ruaUuVxuICAgKi9cbiAgY29sdW1uc01lcmdlQ292ZXJhZ2U/OkNvbHVtblByb3BzW107XG4gIC8qKlxuICAgKiDmi5bmi73liJflkozkv67mlLnooajlpLTop6blj5Hkuovku7ZcbiAgICovXG4gIGNvbHVtbnNPbkNoYW5nZT86KGNoYW5nZTpDaGFuZ2VDb2x1bW5zKSA9PiB2b2lkO1xuICAvKipcbiAgICog5ZCI5bm25YiX5L+h5oGv6YCJ5oup77yM55uu5YmN5Y+v5Lul6YCJ5oup6KGo5aS05paH5a2X5oiW6ICF6KGo55qE5L2N572u6L+b6KGM5ZCI5bm244CCXG4gICovXG4gIGNvbHVtbnNFZGl0VHlwZT86Q29sdW1uc0VkaXRUeXBlLFxuICAvKipcbiAgICog5ouW5ou96Kem5Y+R5LqL5Lu25L2N572u5YiH5o2i5YmN5Zue6LCDXG4gICAqL1xuICBvbkRyYWdFbmRCZWZvcmU/OihkYXRhU2V0OiBEYXRhU2V0LCBjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdLCByZXN1bHREcmFnOiBEcm9wUmVzdWx0LCBwcm92aWRlZDogUmVzcG9uZGVyUHJvdmlkZWQpID0+IERyb3BSZXN1bHQgfCBib29sZWFuIHwgdm9pZCxcbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZSBleHRlbmRzIERhdGFTZXRDb21wb25lbnQ8VGFibGVQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVGFibGUnO1xuXG4gIHN0YXRpYyBDb2x1bW4gPSBDb2x1bW47XG5cbiAgc3RhdGljIEZpbHRlckJhciA9IEZpbHRlckJhcjtcblxuICBzdGF0aWMgQWR2YW5jZWRRdWVyeUJhciA9IEFkdmFuY2VkUXVlcnlCYXI7XG5cbiAgc3RhdGljIFByb2Zlc3Npb25hbEJhciA9IFByb2Zlc3Npb25hbEJhcjtcblxuICBzdGF0aWMgVG9vbEJhciA9IFRvb2xCYXI7XG5cbiAgc3RhdGljIFRhYmxlUm93ID0gVGFibGVSb3c7XG5cbiAgc3RhdGljIFRhYmxlSGVhZGVyQ2VsbCA9IFRhYmxlSGVhZGVyQ2VsbDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNvbHVtbnM6IFByb3BUeXBlcy5hcnJheSxcbiAgICAvKipcbiAgICAgKiDooajlpLRcbiAgICAgKi9cbiAgICBoZWFkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ub2RlLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIC8qKlxuICAgICAqIOihqOiEmlxuICAgICAqL1xuICAgIGZvb3RlcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm5vZGUsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgLyoqXG4gICAgICog5piv5ZCm5pi+56S66L655qGGXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGJvcmRlcjogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog5Yqf6IO95oyJ6ZKuXG4gICAgICog5Y+v6YCJ5YC877yaYGFkZGAgYGRlbGV0ZWAgYHJlbW92ZWAgYHNhdmVgIGBxdWVyeWAgYGV4cGFuZEFsbGAgYGNvbGxhcHNlQWxsYCDmiJYg6Ieq5a6a5LmJ5oyJ6ZKuXG4gICAgICovXG4gICAgYnV0dG9uczogUHJvcFR5cGVzLmFycmF5T2YoXG4gICAgICBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgICAgYnV0dG9uc0VudW1UeXBlLFxuICAgICAgICBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub25lT2ZUeXBlKFtidXR0b25zRW51bVR5cGUsIFByb3BUeXBlcy5vYmplY3RdKSksXG4gICAgICAgIFByb3BUeXBlcy5ub2RlLFxuICAgICAgXSksXG4gICAgKSxcbiAgICAvKipcbiAgICAgKiDoh6rlrprkuYnmn6Xor6LlrZfmrrXnu4Tku7ZcbiAgICAgKiDpu5jorqTkvJrmoLnmja5xdWVyeURhdGFTZXTkuK3lrprkuYnnmoRmaWVsZOexu+Wei+iHquWKqOWMuemFjee7hOS7tu+8jCDljLnphY3nsbvlnovlpoLkuItcbiAgICAgKiBsb3ZDb2RlID0+IExvdlxuICAgICAqIGxvb2t1cENvZGUgPT4gU2VsZWN0XG4gICAgICogdHlwZTpudW1iZXIgPT4gTnVtYmVyRmllbGRcbiAgICAgKiB0eXBlOmRhdGUgPT4gRGF0ZVBpY2tlclxuICAgICAqIHR5cGU6ZGF0ZVRpbWUgPT4gRGF0ZVBpY2tlclttb2RlPWRhdGVUaW1lXVxuICAgICAqIHR5cGU6d2VlayA9PiBEYXRlUGlja2VyW21vZGU9d2Vla11cbiAgICAgKiBkZWZhdWx0ID0+IFRleHRGaWVsZFxuICAgICAqL1xuICAgIHF1ZXJ5RmllbGRzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIC8qKlxuICAgICAqIOWktOmDqOaYvuekuueahOafpeivouWtl+auteeahOaVsOmHj++8jOi2heWHuumZkOWItueahOafpeivouWtl+auteaUvuWFpeW8ueWHuueql+WPo1xuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKi9cbiAgICBxdWVyeUZpZWxkc0xpbWl0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIOaYvuekuuafpeivouadoVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBxdWVyeUJhcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMub25lT2YoW1xuICAgICAgICBUYWJsZVF1ZXJ5QmFyVHlwZS5hZHZhbmNlZEJhcixcbiAgICAgICAgVGFibGVRdWVyeUJhclR5cGUubm9ybWFsLFxuICAgICAgICBUYWJsZVF1ZXJ5QmFyVHlwZS5iYXIsXG4gICAgICAgIFRhYmxlUXVlcnlCYXJUeXBlLm5vbmUsXG4gICAgICAgIFRhYmxlUXVlcnlCYXJUeXBlLnByb2Zlc3Npb25hbEJhcixcbiAgICAgIF0pLFxuICAgICAgUHJvcFR5cGVzLmZ1bmMsXG4gICAgXSksXG4gICAgdXNlTW91c2VCYXRjaENob29zZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog6KGM6auYXG4gICAgICogQGRlZmF1bHQgMzBcbiAgICAgKi9cbiAgICByb3dIZWlnaHQ6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5udW1iZXIsIFByb3BUeXBlcy5vbmVPZihbJ2F1dG8nXSldKSxcbiAgICBhbHdheXNTaG93Um93Qm94OiBQcm9wVHlwZXMuYm9vbCxcbiAgICBkZWZhdWx0Um93RXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIGV4cGFuZFJvd0J5Q2xpY2s6IFByb3BUeXBlcy5ib29sLFxuICAgIGluZGVudFNpemU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZmlsdGVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBtb2RlOiBQcm9wVHlwZXMub25lT2YoW1RhYmxlTW9kZS5saXN0LCBUYWJsZU1vZGUudHJlZV0pLFxuICAgIGVkaXRNb2RlOiBQcm9wVHlwZXMub25lT2YoW1RhYmxlRWRpdE1vZGUuaW5saW5lLCBUYWJsZUVkaXRNb2RlLmNlbGxdKSxcbiAgICBmaWx0ZXJCYXJGaWVsZE5hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZmlsdGVyQmFyUGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaGlnaExpZ2h0Um93OiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzZWxlY3RlZEhpZ2hMaWdodFJvdzogUHJvcFR5cGVzLmJvb2wsXG4gICAgYXV0b01heFdpZHRoOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDorr7nva5kcmFn5qGG5L2T5L2N572uXG4gICAgICovXG4gICAgZHJhZ0NvbHVtbkFsaWduOiBQcm9wVHlwZXMub25lT2YoW0RyYWdDb2x1bW5BbGlnbi5sZWZ0LCBEcmFnQ29sdW1uQWxpZ24ucmlnaHRdKSxcbiAgICAvKipcbiAgICAgKiDlvIDlkK/liJfmi5bmi73vvIzkvYbmmK/ml6Dms5Xkvb/nlKjlrr3luqbmi5bmi71cbiAgICAgKi9cbiAgICBkcmFnQ29sdW1uOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDlvIDlkK/ooYzmi5bmi71cbiAgICAgKi9cbiAgICBkcmFnUm93OiBQcm9wVHlwZXMuYm9vbCxcbiAgICBjb2x1bW5zTWVyZ2VDb3ZlcmFnZTogUHJvcFR5cGVzLmFycmF5LFxuICAgIGNvbHVtbnNEcmFnUmVuZGVyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGV4cGFuZEljb246IFByb3BUeXBlcy5mdW5jLFxuICAgIHJvd0RyYWdSZW5kZXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgY29sdW1uc0VkaXRUeXBlOiBQcm9wVHlwZXMub25lT2YoW0NvbHVtbnNFZGl0VHlwZS5hbGwsIENvbHVtbnNFZGl0VHlwZS5oZWFkZXIsIENvbHVtbnNFZGl0VHlwZS5vcmRlcl0pLFxuICAgIG9uRHJhZ0VuZEJlZm9yZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLi4uRGF0YVNldENvbXBvbmVudC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBzdWZmaXhDbHM6ICd0YWJsZScsXG4gICAgdGFiSW5kZXg6IDAsXG4gICAgc2VsZWN0aW9uTW9kZTogU2VsZWN0aW9uTW9kZS5yb3dib3gsXG4gICAgcXVlcnlGaWVsZHM6IHt9LFxuICAgIGRlZmF1bHRSb3dFeHBhbmRlZDogZmFsc2UsXG4gICAgZXhwYW5kUm93QnlDbGljazogZmFsc2UsXG4gICAgaW5kZW50U2l6ZTogMTUsXG4gICAgZmlsdGVyQmFyRmllbGROYW1lOiAncGFyYW1zJyxcbiAgICB2aXJ0dWFsOiBmYWxzZSxcbiAgICB2aXJ0dWFsU3BpbjogZmFsc2UsXG4gICAgYXV0b0hlaWdodDogZmFsc2UsXG4gICAgYXV0b01heFdpZHRoOiBmYWxzZSxcbiAgICBjb2x1bW5zTWVyZ2VDb3ZlcmFnZTpbXSxcbiAgfTtcblxuICB0YWJsZVN0b3JlOiBUYWJsZVN0b3JlID0gbmV3IFRhYmxlU3RvcmUodGhpcyk7XG5cbiAgbmV4dEZyYW1lQWN0aW9uSWQ/OiBudW1iZXI7XG5cbiAgc2Nyb2xsSWQ/OiBudW1iZXI7XG5cbiAgcmVzaXplTGluZTogSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gIHRhYmxlSGVhZFdyYXA6IEhUTUxEaXZFbGVtZW50IHwgbnVsbDtcblxuICB0YWJsZUJvZHlXcmFwOiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG5cbiAgdGFibGVGb290V3JhcDogSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gIGZpeGVkQ29sdW1uc0JvZHlMZWZ0OiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG5cbiAgZml4ZWRDb2x1bW5zQm9keVJpZ2h0OiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG5cbiAgZHJhZ0NvbHVtbnNCb2R5TGVmdDogSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuXG4gIGRyYWdDb2x1bW5zQm9keVJpZ2h0OiBIVE1MRGl2RWxlbWVudCB8IG51bGw7XG5cbiAgbGFzdFNjcm9sbExlZnQ6IG51bWJlcjtcblxuICBsYXN0U2Nyb2xsVG9wOiBudW1iZXI7XG5cbiAgc2Nyb2xsUG9zaXRpb246IFNjcm9sbFBvc2l0aW9uO1xuXG4gIHJlZlVwcGVyUGxhY2Vob2xkZXI6IEFycmF5PEhUTUxEaXZFbGVtZW50IHwgbnVsbD4gPSBbXTtcblxuICByZWZVbmRlclBsYWNlaG9sZGVyOiBBcnJheTxIVE1MRGl2RWxlbWVudCB8IG51bGw+ID0gW107XG5cbiAgcmVmU3BpbjogSFRNTERpdkVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICByZWZTY3JvbGw6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgZ2V0IGN1cnJlbnRSb3coKTogSFRNTFRhYmxlUm93RWxlbWVudCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHt0aGlzLnByZWZpeENsc30tcm93LWN1cnJlbnRgLFxuICAgICkgYXMgSFRNTFRhYmxlUm93RWxlbWVudCB8IG51bGw7XG4gIH1cblxuICBnZXQgZmlyc3RSb3coKTogSFRNTFRhYmxlUm93RWxlbWVudCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHt0aGlzLnByZWZpeENsc30tcm93OmZpcnN0LWNoaWxkYCxcbiAgICApIGFzIEhUTUxUYWJsZVJvd0VsZW1lbnQgfCBudWxsO1xuICB9XG5cbiAgZ2V0IGxhc3RSb3coKTogSFRNTFRhYmxlUm93RWxlbWVudCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGAuJHt0aGlzLnByZWZpeENsc30tcm93Omxhc3QtY2hpbGRgLFxuICAgICkgYXMgSFRNTFRhYmxlUm93RWxlbWVudCB8IG51bGw7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgc2F2ZVJlc2l6ZVJlZihub2RlOiBIVE1MRGl2RWxlbWVudCB8IG51bGwpIHtcbiAgICB0aGlzLnJlc2l6ZUxpbmUgPSBub2RlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgaGFuZGxlU3dpdGNoQ2hhbmdlKHZhbHVlKSB7XG4gICAgdGhpcy50YWJsZVN0b3JlLnNob3dDYWNoZWRTZWxldGlvbiA9ICEhdmFsdWU7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUmVzaXplKHdpZHRoOiBudW1iZXIpIHtcbiAgICBjb25zdCB7IGVsZW1lbnQsIHRhYmxlU3RvcmUgfSA9IHRoaXM7XG4gICAgaWYgKCFlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgICAgdGFibGVTdG9yZS5zdHlsZWRIaWRkZW4gPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIXRhYmxlU3RvcmUuaGlkZGVuKSB7XG4gICAgICB0aGlzLnN5bmNTaXplSW5GcmFtZSh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYmxlU3RvcmUuc3R5bGVkSGlkZGVuID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZURhdGFTZXRMb2FkKCkge1xuICAgIHRoaXMuaW5pdERlZmF1bHRFeHBhbmRlZFJvd3MoKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVEYXRhU2V0Q3JlYXRlKHsgcmVjb3JkLCBkYXRhU2V0IH0pIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXM7XG4gICAgaWYgKHRhYmxlU3RvcmUuaW5saW5lRWRpdCkge1xuICAgICAgaWYgKHRhYmxlU3RvcmUuY3VycmVudEVkaXRSZWNvcmQpIHtcbiAgICAgICAgdGFibGVTdG9yZS5jdXJyZW50RWRpdFJlY29yZC5yZXNldCgpO1xuICAgICAgICBkYXRhU2V0LnJlbW92ZShyZWNvcmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFibGVTdG9yZS5jdXJyZW50RWRpdFJlY29yZCA9IHJlY29yZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzO1xuICAgIGlmICghdGFibGVTdG9yZS5lZGl0aW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLlVQOlxuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duVXAoZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEtleUNvZGUuRE9XTjpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkRvd24oZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEtleUNvZGUuUklHSFQ6XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25SaWdodChlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5MRUZUOlxuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duTGVmdChlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5QQUdFX1VQOlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZGF0YVNldC5wcmVQYWdlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEtleUNvZGUuUEFHRV9ET1dOOlxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZGF0YVNldC5uZXh0UGFnZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLkhPTUU6XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25Ib21lKGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLkVORDpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkVuZChlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHdhcm5pbmcoZmFsc2UsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB7IG9uS2V5RG93biA9IG5vb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgb25LZXlEb3duKGUpO1xuICB9XG5cbiAgZm9jdXNSb3cocm93OiBIVE1MVGFibGVSb3dFbGVtZW50IHwgbnVsbCkge1xuICAgIGlmIChyb3cpIHtcbiAgICAgIGNvbnN0IHsgaW5kZXggfSA9IHJvdy5kYXRhc2V0O1xuICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgcmVjb3JkID0gZGF0YVNldC5maW5kUmVjb3JkQnlJZChpbmRleCk7XG4gICAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgICBkYXRhU2V0LmN1cnJlbnQgPSByZWNvcmQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBoYW5kbGVLZXlEb3duSG9tZShlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIXRoaXMudGFibGVTdG9yZS5pc1RyZWUpIHtcbiAgICAgIGF3YWl0IGRhdGFTZXQuZmlyc3QoKTtcbiAgICB9XG4gICAgdGhpcy5mb2N1c1Jvdyh0aGlzLmZpcnN0Um93KTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZUtleURvd25FbmQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCF0aGlzLnRhYmxlU3RvcmUuaXNUcmVlKSB7XG4gICAgICBhd2FpdCBkYXRhU2V0Lmxhc3QoKTtcbiAgICB9XG4gICAgdGhpcy5mb2N1c1Jvdyh0aGlzLmxhc3RSb3cpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlS2V5RG93blVwKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgeyBjdXJyZW50Um93IH0gPSB0aGlzO1xuICAgIGlmIChjdXJyZW50Um93KSB7XG4gICAgICBjb25zdCBwcmV2aW91c0VsZW1lbnRTaWJsaW5nID0gZmluZEluZGV4ZWRTaWJsaW5nKGN1cnJlbnRSb3csIC0xKTtcbiAgICAgIGlmIChwcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgIHRoaXMuZm9jdXNSb3cocHJldmlvdXNFbGVtZW50U2libGluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGF3YWl0IGRhdGFTZXQucHJlUGFnZSgpO1xuICAgICAgICB0aGlzLmZvY3VzUm93KHRoaXMubGFzdFJvdyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGFuZGxlS2V5RG93bkRvd24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCB7IGN1cnJlbnRSb3cgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnRSb3cpIHtcbiAgICAgIGNvbnN0IG5leHRFbGVtZW50U2libGluZyA9IGZpbmRJbmRleGVkU2libGluZyhjdXJyZW50Um93LCAxKTtcbiAgICAgIGlmIChuZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgdGhpcy5mb2N1c1JvdyhuZXh0RWxlbWVudFNpYmxpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBkYXRhU2V0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBhd2FpdCBkYXRhU2V0Lm5leHRQYWdlKCk7XG4gICAgICAgIHRoaXMuZm9jdXNSb3codGhpcy5maXJzdFJvdyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93blJpZ2h0KGUpIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlLFxuICAgICAgcHJvcHM6IHsgZXhwYW5kZWRSb3dSZW5kZXJlciwgZGF0YVNldCB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGlmICh0YWJsZVN0b3JlLmlzVHJlZSB8fCBleHBhbmRlZFJvd1JlbmRlcmVyKSB7XG4gICAgICBjb25zdCB7IGN1cnJlbnQgfSA9IGRhdGFTZXQ7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRhYmxlU3RvcmUuc2V0Um93RXhwYW5kZWQoY3VycmVudCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93bkxlZnQoZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmUsXG4gICAgICBwcm9wczogeyBleHBhbmRlZFJvd1JlbmRlcmVyLCBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKHRhYmxlU3RvcmUuaXNUcmVlIHx8IGV4cGFuZGVkUm93UmVuZGVyZXIpIHtcbiAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gZGF0YVNldDtcbiAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGFibGVTdG9yZS5zZXRSb3dFeHBhbmRlZChjdXJyZW50LCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICdjb2x1bW5zJyxcbiAgICAgICdoZWFkZXInLFxuICAgICAgJ2Zvb3RlcicsXG4gICAgICAnYm9yZGVyJyxcbiAgICAgICdzdHlsZScsXG4gICAgICAnc2VsZWN0aW9uTW9kZScsXG4gICAgICAnYWx3YXlzU2hvd1Jvd0JveCcsXG4gICAgICAnb25Sb3cnLFxuICAgICAgJ3Jvd1JlbmRlcmVyJyxcbiAgICAgICdidXR0b25zJyxcbiAgICAgICdyb3dIZWlnaHQnLFxuICAgICAgJ3F1ZXJ5RmllbGRzJyxcbiAgICAgICdxdWVyeUZpZWxkc0xpbWl0JyxcbiAgICAgICdxdWVyeUJhcicsXG4gICAgICAnZGVmYXVsdFJvd0V4cGFuZGVkJyxcbiAgICAgICdleHBhbmRSb3dCeUNsaWNrJyxcbiAgICAgICdleHBhbmRlZFJvd1JlbmRlcmVyJyxcbiAgICAgICdleHBhbmRJY29uQ29sdW1uSW5kZXgnLFxuICAgICAgJ2luZGVudFNpemUnLFxuICAgICAgJ2ZpbHRlcicsXG4gICAgICAnbW9kZScsXG4gICAgICAnZWRpdE1vZGUnLFxuICAgICAgJ2ZpbHRlckJhckZpZWxkTmFtZScsXG4gICAgICAnZmlsdGVyQmFyUGxhY2Vob2xkZXInLFxuICAgICAgJ3BhZ2luYXRpb24nLFxuICAgICAgJ2hpZ2hMaWdodFJvdycsXG4gICAgICAnc2VsZWN0ZWRIaWdoTGlnaHRSb3cnLFxuICAgICAgJ2NvbHVtblJlc2l6YWJsZScsXG4gICAgICAncHJpc3RpbmUnLFxuICAgICAgJ2V4cGFuZEljb24nLFxuICAgICAgJ3NwaW4nLFxuICAgICAgJ3ZpcnR1YWwnLFxuICAgICAgJ3ZpcnR1YWxTcGluJyxcbiAgICAgICdhdXRvSGVpZ2h0JyxcbiAgICAgICd1c2VNb3VzZUJhdGNoQ2hvb3NlJyxcbiAgICAgICdhdXRvTWF4V2lkdGgnLFxuICAgICAgJ2RyYWdDb2x1bW5BbGlnbicsXG4gICAgICAnZHJhZ0NvbHVtbicsXG4gICAgICAnZHJhZ1JvdycsXG4gICAgICAnb25EcmFnRW5kJyxcbiAgICAgICdjb2x1bW5zT25DaGFuZ2UnLFxuICAgICAgJ2NvbHVtbnNNZXJnZUNvdmVyYWdlJyxcbiAgICAgICdjb2x1bW5zRWRpdFR5cGUnLFxuICAgICAgJ3Jvd0RyYWdSZW5kZXInLFxuICAgICAgJ2NvbHVtbnNEcmFnUmVuZGVyJyxcbiAgICAgICdvbkRyYWdFbmRCZWZvcmUnLFxuICAgIF0pO1xuICAgIG90aGVyUHJvcHMub25LZXlEb3duID0gdGhpcy5oYW5kbGVLZXlEb3duO1xuICAgIGNvbnN0IHsgcm93SGVpZ2h0IH0gPSB0aGlzLnRhYmxlU3RvcmU7XG4gICAgaWYgKHJvd0hlaWdodCAhPT0gJ2F1dG8nKSB7XG4gICAgICBvdGhlclByb3BzLnN0eWxlID0geyBsaW5lSGVpZ2h0OiBweFRvUmVtKHJvd0hlaWdodCkgfTtcbiAgICB9XG4gICAgcmV0dXJuIG90aGVyUHJvcHM7XG4gIH1cblxuICBnZXRDbGFzc05hbWUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICB0YWJsZVN0b3JlOiB7IGJvcmRlciwgcm93SGVpZ2h0IH0sXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIHN1cGVyLmdldENsYXNzTmFtZShgJHtwcmVmaXhDbHN9LXNjcm9sbC1wb3NpdGlvbi1sZWZ0YCwge1xuICAgICAgW2Ake3ByZWZpeENsc30tYm9yZGVyZWRgXTogYm9yZGVyLFxuICAgICAgW2Ake3ByZWZpeENsc30tcm93LWhlaWdodC1maXhlZGBdOiBpc051bWJlcihyb3dIZWlnaHQpLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0V3JhcHBlclByb3BzKHByb3BzID0ge30pIHtcbiAgICBjb25zdCB7IHN0eWxlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcztcbiAgICBjb25zdCBuZXdTdHlsZTogYW55ID0gb21pdChzdHlsZSwgWyd3aWR0aCcsICdoZWlnaHQnXSk7XG4gICAgaWYgKHN0eWxlICYmIHN0eWxlLndpZHRoICE9PSB1bmRlZmluZWQgJiYgc3R5bGUud2lkdGggIT09ICdhdXRvJykge1xuICAgICAgbmV3U3R5bGUud2lkdGggPSBNYXRoLm1heChcbiAgICAgICAgc3R5bGUud2lkdGggYXMgbnVtYmVyLFxuICAgICAgICB0YWJsZVN0b3JlLmxlZnRMZWFmQ29sdW1uc1dpZHRoICsgdGFibGVTdG9yZS5yaWdodExlYWZDb2x1bW5zV2lkdGggKyBkZWZhdWx0TWluV2lkdGgsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZ2V0V3JhcHBlclByb3BzKHtcbiAgICAgIHN0eWxlOiBuZXdTdHlsZSxcbiAgICAgIC4uLnByb3BzLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluS8oOWFpeeahCBTcGluIHByb3BzXG4gICAqL1xuICBnZXRTcGluUHJvcHMoKSB7XG4gICAgY29uc3QgeyBzcGluLCBkYXRhU2V0IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChzcGluICYmICFpc1VuZGVmaW5lZChzcGluLnNwaW5uaW5nKSkgcmV0dXJuIHsgLi4uc3BpbiB9O1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zcGluLFxuICAgICAgZGF0YVNldCxcbiAgICB9O1xuICB9XG5cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRHJhZ01vdXNlVXAoKSB7XG4gICAgY29uc3QgeyBkYXRhU2V0LCBtb3VzZUJhdGNoQ2hvb3NlSWRMaXN0IH0gPSB0aGlzLnRhYmxlU3RvcmU7XG4gICAgaWYgKHRoaXMudGFibGVTdG9yZS5tb3VzZUJhdGNoQ2hvb3NlU3RhdGUpIHtcbiAgICAgIHRoaXMudGFibGVTdG9yZS5tb3VzZUJhdGNoQ2hvb3NlU3RhdGUgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHsgbW91c2VCYXRjaENob29zZVN0YXJ0SWQsIG1vdXNlQmF0Y2hDaG9vc2VFbmRJZCB9ID0gdGhpcy50YWJsZVN0b3JlO1xuICAgICAgaWYgKG1vdXNlQmF0Y2hDaG9vc2VTdGFydElkID09PSBtb3VzZUJhdGNoQ2hvb3NlRW5kSWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgKG1vdXNlQmF0Y2hDaG9vc2VJZExpc3QgfHwgW10pLmZvckVhY2goKGlkOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gZGF0YVNldC5maW5kKChpbm5lclJlY29yZCkgPT4gaW5uZXJSZWNvcmQuaWQgPT09IGlkKTtcbiAgICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICAgIGRhdGFTZXQuc2VsZWN0KHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgc3VwZXIuY29tcG9uZW50V2lsbE1vdW50KCk7XG4gICAgdGhpcy5pbml0RGVmYXVsdEV4cGFuZGVkUm93cygpO1xuICAgIHRoaXMucHJvY2Vzc0RhdGFTZXRMaXN0ZW5lcih0cnVlKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc3luY1NpemUoKTtcbiAgICB0aGlzLnN5bmNTaXplSW5GcmFtZSgpO1xuICAgIC8vIOS4uuS7gOS5iOS9v+eUqCBwb2ludGVydXBcbiAgICAvLyDlm6DkuLrpnIDopoHlr7lkaXNhYmxlZOeahOWFg+e0oOi/m+ihjOeJueauiuWkhOeQhlxuICAgIC8vIOWboOS4uueKtuaAgeeahOaUueWPmOS+nei1liBtb3VzZXVwIOiAjOWcqGRpc2FibGVk55qE5YWD57Sg5LiKIOaXoOazleinpuWPkW1vdXNldXDkuovku7ZcbiAgICAvLyDlr7zoh7TnirbmgIHml6Dms5Xov5vooYzkv67mraNcbiAgICAvLyDku6XkuIvkuKTnp43mlrnmoYjpgJrov4cgcG9pbnRlci1ldmVudHM6bm9uZSDov5vooYzlpITnkIZcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMjIzNzgvamF2YXNjcmlwdC1jaGVjay1pZi1tb3VzZS1idXR0b24tZG93blxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzYyMDgxNjY2L3RoZS1ldmVudC1vZi10aGUtZG9jdW1lbnQtaXMtbm90LXRyaWdnZXJlZC13aGVuLWl0LWlzLW9uLWEtZGlzYWJsZWQtZWxlbWVudFxuICAgIC8vIOiAjOS9v+eUqOaMh+mSiOS6i+S7tuWPr+S7peeqgeegtGRpc2FibGVk55qE6ZmQ5Yi2XG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjIxMjY1MTUvaG93LXRvLWdldC10aGUtc3RhdGUtb2YtdGhlLW1vdXNlLXRocm91Z2gtamF2YXNjcmlwdC82MjEyNzg0NSM2MjEyNzg0NVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIHRoaXMuaGFuZGxlRHJhZ01vdXNlVXApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMsIG5leHRDb250ZXh0KSB7XG4gICAgc3VwZXIuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMsIG5leHRDb250ZXh0KTtcbiAgICB0aGlzLnByb2Nlc3NEYXRhU2V0TGlzdGVuZXIoZmFsc2UpO1xuICAgIHRoaXMudGFibGVTdG9yZS5zZXRQcm9wcyhuZXh0UHJvcHMpO1xuICAgIHRoaXMucHJvY2Vzc0RhdGFTZXRMaXN0ZW5lcih0cnVlKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucHJvY2Vzc0RhdGFTZXRMaXN0ZW5lcihmYWxzZSk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgdGhpcy5oYW5kbGVEcmFnTW91c2VVcCk7XG4gIH1cblxuICBwcm9jZXNzRGF0YVNldExpc3RlbmVyKGZsYWc6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7IGlzVHJlZSwgZGF0YVNldCwgaW5saW5lRWRpdCB9ID0gdGhpcy50YWJsZVN0b3JlO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gZmxhZyA/IGRhdGFTZXQuYWRkRXZlbnRMaXN0ZW5lciA6IGRhdGFTZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgICAgIGlmIChpc1RyZWUpIHtcbiAgICAgICAgaGFuZGxlci5jYWxsKGRhdGFTZXQsICdsb2FkJywgdGhpcy5oYW5kbGVEYXRhU2V0TG9hZCk7XG4gICAgICB9XG4gICAgICBpZiAoaW5saW5lRWRpdCkge1xuICAgICAgICBoYW5kbGVyLmNhbGwoZGF0YVNldCwgJ2NyZWF0ZScsIHRoaXMuaGFuZGxlRGF0YVNldENyZWF0ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHRhYmxlU3RvcmUsXG4gICAgICB0YWJsZVN0b3JlOiB7IG92ZXJmbG93WCwgaXNBbnlDb2x1bW5zTGVmdExvY2ssIGlzQW55Q29sdW1uc1JpZ2h0TG9jaywgZHJhZ1JvdywgZHJhZ0NvbHVtbkFsaWduIH0sXG4gICAgICBwcm9wczoge1xuICAgICAgICBzdHlsZSxcbiAgICAgICAgc3BpbixcbiAgICAgICAgdmlydHVhbCxcbiAgICAgICAgdmlydHVhbFNwaW4sXG4gICAgICAgIGJ1dHRvbnMsXG4gICAgICAgIHF1ZXJ5RmllbGRzLFxuICAgICAgICBxdWVyeUZpZWxkc0xpbWl0LFxuICAgICAgICBmaWx0ZXJCYXJGaWVsZE5hbWUsXG4gICAgICAgIGZpbHRlckJhclBsYWNlaG9sZGVyLFxuICAgICAgfSxcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5nZXRUYWJsZSgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSB7IHRhYmxlU3RvcmUgfTtcbiAgICBjb25zdCBwYWdpbmF0aW9uID0gdGhpcy5nZXRQYWdpbmF0aW9uKFRhYmxlUGFnaW5hdGlvblBvc2l0aW9uLnRvcCk7XG4gICAgY29uc3QgdGFibGVTcGluUHJvcHMgPSBnZXRDb25maWcoJ3RhYmxlU3BpblByb3BzJyk7XG4gICAgY29uc3Qgc3R5bGVIZWlnaHQgPSBzdHlsZSA/IHRvUHgoc3R5bGUuaGVpZ2h0KSA6IDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFJlYWN0UmVzaXplT2JzZXJ2ZXIgcmVzaXplUHJvcD1cIndpZHRoXCIgb25SZXNpemU9e3RoaXMuaGFuZGxlUmVzaXplfT5cbiAgICAgICAgPGRpdiB7Li4udGhpcy5nZXRXcmFwcGVyUHJvcHMoKX0+XG4gICAgICAgICAgPFRhYmxlQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17Y29udGV4dH0+XG4gICAgICAgICAgICB7dGhpcy5nZXRIZWFkZXIoKX1cbiAgICAgICAgICAgIDxUYWJsZVF1ZXJ5QmFyXG4gICAgICAgICAgICAgIHByZWZpeENscz17cHJlZml4Q2xzfVxuICAgICAgICAgICAgICBidXR0b25zPXtidXR0b25zfVxuICAgICAgICAgICAgICBwYWdpbmF0aW9uPXtwYWdpbmF0aW9ufVxuICAgICAgICAgICAgICBxdWVyeUZpZWxkcz17cXVlcnlGaWVsZHN9XG4gICAgICAgICAgICAgIHF1ZXJ5RmllbGRzTGltaXQ9e3F1ZXJ5RmllbGRzTGltaXR9XG4gICAgICAgICAgICAgIGZpbHRlckJhckZpZWxkTmFtZT17ZmlsdGVyQmFyRmllbGROYW1lfVxuICAgICAgICAgICAgICBmaWx0ZXJCYXJQbGFjZWhvbGRlcj17ZmlsdGVyQmFyUGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFNwaW4gey4uLnRhYmxlU3BpblByb3BzfSB7Li4udGhpcy5nZXRTcGluUHJvcHMoKX0ga2V5PVwiY29udGVudFwiPlxuICAgICAgICAgICAgICB7dmlydHVhbCAmJiA8ZGl2XG4gICAgICAgICAgICAgICAgcmVmPXsobm9kZSkgPT4gdGhpcy5yZWZTcGluID0gbm9kZX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dmlydHVhbFNwaW4gJiYgPFNwaW5cbiAgICAgICAgICAgICAgICAgIGtleT1cInZpcnR1YWxcIlxuICAgICAgICAgICAgICAgICAgc3Bpbm5pbmdcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogcHhUb1JlbShzdHlsZUhlaWdodCksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IHB4VG9SZW0oc3R5bGVIZWlnaHQpLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiA0LFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHsuLi50YWJsZVNwaW5Qcm9wc31cbiAgICAgICAgICAgICAgICAgIHsuLi5zcGlufVxuICAgICAgICAgICAgICAgIC8+fVxuICAgICAgICAgICAgICA8L2Rpdj59XG4gICAgICAgICAgICAgIDxkaXYgey4uLnRoaXMuZ2V0T3RoZXJQcm9wcygpfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1jb250ZW50YH0+XG4gICAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgICAgICAgIHtpc0FueUNvbHVtbnNMZWZ0TG9jayAmJiBvdmVyZmxvd1ggJiYgdGhpcy5nZXRMZWZ0Rml4ZWRUYWJsZSgpfVxuICAgICAgICAgICAgICAgICAge2lzQW55Q29sdW1uc1JpZ2h0TG9jayAmJiBvdmVyZmxvd1ggJiYgdGhpcy5nZXRSaWdodEZpeGVkVGFibGUoKX1cbiAgICAgICAgICAgICAgICAgIHtkcmFnUm93ICYmIGRyYWdDb2x1bW5BbGlnbiA9PT0gRHJhZ0NvbHVtbkFsaWduLmxlZnQgJiYgaXNBbnlDb2x1bW5zTGVmdExvY2sgJiYgdGhpcy5nZXRMZWZ0Rml4ZWRUYWJsZShEcmFnQ29sdW1uQWxpZ24ubGVmdCl9XG4gICAgICAgICAgICAgICAgICB7ZHJhZ1JvdyAmJiBkcmFnQ29sdW1uQWxpZ24gPT09IERyYWdDb2x1bW5BbGlnbi5yaWdodCAmJiBpc0FueUNvbHVtbnNSaWdodExvY2sgJiYgdGhpcy5nZXRSaWdodEZpeGVkVGFibGUoRHJhZ0NvbHVtbkFsaWduLnJpZ2h0KX1cbiAgICAgICAgICAgICAgICAgIDxkaXYgcmVmPXt0aGlzLnNhdmVSZXNpemVSZWZ9IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1zcGxpdC1saW5lYH0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7dGhpcy5nZXRGb290ZXIoKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1NwaW4+XG4gICAgICAgICAgICB7dGhpcy5nZXRQYWdpbmF0aW9uKFRhYmxlUGFnaW5hdGlvblBvc2l0aW9uLmJvdHRvbSl9XG4gICAgICAgICAgPC9UYWJsZUNvbnRleHQuUHJvdmlkZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9SZWFjdFJlc2l6ZU9ic2VydmVyPlxuICAgICk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHJlb3JkZXJEYXRhU2V0KGRhdGFzZXQ6IERhdGFTZXQsIHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlcikge1xuICAgIGRhdGFzZXQubW92ZShzdGFydEluZGV4LCBlbmRJbmRleCk7XG4gIH07XG5cbiAgQGFjdGlvblxuICByZW9yZGVyQ29sdW1ucyhjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdLCBzdGFydEluZGV4OiBudW1iZXIsIGVuZEluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCB7IGNvbHVtbnNPbkNoYW5nZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZihzdGFydEluZGV4ICE9PSBlbmRJbmRleCl7XG4gICAgICBjb25zdCBjbG9uZUNvbHVtbnMgPSBjb2x1bW5zLnNsaWNlKCk7XG4gICAgICBjb25zdCBbZHJvcEl0ZW1dID0gY2xvbmVDb2x1bW5zLnNsaWNlKGVuZEluZGV4LCBlbmRJbmRleCArIDEpO1xuICAgICAgY29uc3QgW2RyYWdJdGVtXSA9IGNsb25lQ29sdW1ucy5zbGljZShzdGFydEluZGV4LCBzdGFydEluZGV4ICsgMSk7XG4gICAgICBjb25zdCBub3JtYWxDb2x1bW5Mb2NrID0gKGxvY2spID0+IHtcbiAgICAgICAgaWYgKGxvY2sgPT09IHRydWUpIHtcbiAgICAgICAgICByZXR1cm4gQ29sdW1uTG9jay5sZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghbG9jaykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9jaztcbiAgICAgIH07XG4gICAgICBpZiAoXG4gICAgICAgIGRyb3BJdGVtICYmXG4gICAgICAgIGRyYWdJdGVtICYmXG4gICAgICAgIGRyb3BJdGVtLmtleSAhPT0gRFJBR19LRVkgJiZcbiAgICAgICAgZHJhZ0l0ZW0ua2V5ICE9PSBEUkFHX0tFWSAmJlxuICAgICAgICBub3JtYWxDb2x1bW5Mb2NrKGRyYWdJdGVtLmxvY2spID09PSBub3JtYWxDb2x1bW5Mb2NrKGRyb3BJdGVtLmxvY2spKSB7XG4gICAgICAgIGNvbnN0IFtyZW1vdmVkXSA9IGNvbHVtbnMuc3BsaWNlKHN0YXJ0SW5kZXgsIDEpO1xuICAgICAgICBpZiAoY29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICBjb2x1bW5zLnNwbGljZShlbmRJbmRleCwgMCwgcmVtb3ZlZCk7XG4gICAgICAgICAgaWYoY29sdW1uc09uQ2hhbmdlKXtcbiAgICAgICAgICAgIGNvbHVtbnNPbkNoYW5nZSh7Y29sdW1uOnRvSlMocmVtb3ZlZCksY29sdW1uczp0b0pTKGNvbHVtbnMpLHR5cGU6Q29sdW1uc0VkaXRUeXBlLm9yZGVyfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgQGF1dG9iaW5kXG4gIG9uRHJhZ0VuZChyZXN1bHREcmFnOiBEcm9wUmVzdWx0LCBwcm92aWRlZDogUmVzcG9uZGVyUHJvdmlkZWQpIHtcbiAgICBjb25zdCB7IG9uRHJhZ0VuZCwgb25EcmFnRW5kQmVmb3JlIH0gPSB0aGlzLnByb3BzO1xuICAgIC8vIEB0cy1pZ25vcmUgdHMg5Lit5Yik5pat5piv5ZCm5bGe5LqO55uu5qCH57G75Z6L55qE5pa55rOVXG4gICAgY29uc3QgaXNEcm9wcmVzdWx0ID0gKGRyb3BSZXN1bHQ6IGFueSk6IGRyb3BSZXN1bHQgaXMgRHJvcFJlc3VsdCA9PiB7XG4gICAgICBpZiAoZHJvcFJlc3VsdCAmJiBkcm9wUmVzdWx0LmRlc3RpbmF0aW9uKSB7XG4gICAgICAgIHJldHVybiAoKHR5cGVvZiAoZHJvcFJlc3VsdCBhcyBEcm9wUmVzdWx0KS5zb3VyY2UuaW5kZXggPT09ICdudW1iZXInKVxuICAgICAgICAgICYmICh0eXBlb2YgKGRyb3BSZXN1bHQgYXMgRHJvcFJlc3VsdCkuZGVzdGluYXRpb24gPT09ICdvYmplY3QnKVxuICAgICAgICAgICYmICh0eXBlb2YgKGRyb3BSZXN1bHQgYXMgRHJvcFJlc3VsdCkuZGVzdGluYXRpb24hLmluZGV4ID09PSAnbnVtYmVyJykpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdEJlZm9yZVxuICAgIGlmIChvbkRyYWdFbmRCZWZvcmUpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IG9uRHJhZ0VuZEJlZm9yZSh0aGlzLnRhYmxlU3RvcmUuZGF0YVNldCwgdG9KUyh0aGlzLnRhYmxlU3RvcmUuY29sdW1ucyksIHJlc3VsdERyYWcsIHByb3ZpZGVkKVxuICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0ICYmIGlzRHJvcHJlc3VsdChyZXN1bHQpKSB7XG4gICAgICAgIHJlc3VsdEJlZm9yZSA9IHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0QmVmb3JlID0gcmVzdWx0RHJhZ1xuICAgIGlmIChyZXN1bHRCZWZvcmUgJiYgcmVzdWx0QmVmb3JlLmRlc3RpbmF0aW9uKSB7XG4gICAgICBpZiAocmVzdWx0QmVmb3JlLmRlc3RpbmF0aW9uLmRyb3BwYWJsZUlkID09PSAndGFibGUnKSB7XG4gICAgICAgIHRoaXMucmVvcmRlckRhdGFTZXQoXG4gICAgICAgICAgdGhpcy50YWJsZVN0b3JlLmRhdGFTZXQsXG4gICAgICAgICAgcmVzdWx0QmVmb3JlLnNvdXJjZS5pbmRleCxcbiAgICAgICAgICByZXN1bHRCZWZvcmUuZGVzdGluYXRpb24uaW5kZXgsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0QmVmb3JlLmRlc3RpbmF0aW9uLmRyb3BwYWJsZUlkID09PSAndGFibGVIZWFkZXInKSB7XG4gICAgICAgIHRoaXMucmVvcmRlckNvbHVtbnMoXG4gICAgICAgICAgdGhpcy50YWJsZVN0b3JlLmNvbHVtbnMsXG4gICAgICAgICAgcmVzdWx0QmVmb3JlLnNvdXJjZS5pbmRleCxcbiAgICAgICAgICByZXN1bHRCZWZvcmUuZGVzdGluYXRpb24uaW5kZXgsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIOebuOW6lOWPmOWMluWQjueahOaVsOaNrlxuICAgICAqL1xuICAgIGlmIChvbkRyYWdFbmQpIHtcbiAgICAgIG9uRHJhZ0VuZCh0aGlzLnRhYmxlU3RvcmUuZGF0YVNldCwgdG9KUyh0aGlzLnRhYmxlU3RvcmUuY29sdW1ucyksIHJlc3VsdERyYWcsIHByb3ZpZGVkKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQm9keVNjcm9sbChlOiBSZWFjdC5TeW50aGV0aWNFdmVudCkge1xuICAgIGlmICh0aGlzLnNjcm9sbElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJhZi5jYW5jZWwodGhpcy5zY3JvbGxJZCk7XG4gICAgfVxuICAgIGNvbnN0IHsgY3VycmVudFRhcmdldCB9ID0gZTtcbiAgICBlLnBlcnNpc3QoKTtcbiAgICB0aGlzLnNjcm9sbElkID0gcmFmKCgpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlQm9keVNjcm9sbFRvcChlLCBjdXJyZW50VGFyZ2V0KTtcbiAgICAgIHRoaXMuaGFuZGxlQm9keVNjcm9sbExlZnQoZSwgY3VycmVudFRhcmdldCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5rua5Yqo57uT5p2f6ZqQ6JePc3BpblxuICAgKi9cbiAgc2V0U3BpbiA9IGRlYm91bmNlKCgpID0+IHtcbiAgICB0aGlzLnJlZlNwaW4hLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH0sIDMwMCk7XG5cbiAgaGFuZGxlQm9keVNjcm9sbFRvcChlLCBjdXJyZW50VGFyZ2V0KSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IGU7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyByb3dIZWlnaHQsIGhlaWdodCB9LFxuICAgICAgb2JzZXJ2YWJsZVByb3BzOiB7IGRhdGFTZXQgfSxcbiAgICAgIHByb3BzOiB7IHZpcnR1YWwsIGF1dG9IZWlnaHQgfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoXG4gICAgICAodGhpcy50YWJsZVN0b3JlLmhlaWdodCA9PT0gdW5kZWZpbmVkICYmICFhdXRvSGVpZ2h0KSB8fFxuICAgICAgY3VycmVudFRhcmdldCAhPT0gdGFyZ2V0IHx8XG4gICAgICB0YXJnZXQgPT09IHRoaXMudGFibGVGb290V3JhcFxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaXhlZENvbHVtbnNCb2R5TGVmdCA9IHRoaXMuZml4ZWRDb2x1bW5zQm9keUxlZnQ7XG4gICAgY29uc3QgZHJhZ0NvbHVtbnNCb2R5TGVmdCA9IHRoaXMuZHJhZ0NvbHVtbnNCb2R5TGVmdDtcbiAgICBjb25zdCBib2R5VGFibGUgPSB0aGlzLnRhYmxlQm9keVdyYXA7XG4gICAgY29uc3QgZml4ZWRDb2x1bW5zQm9keVJpZ2h0ID0gdGhpcy5maXhlZENvbHVtbnNCb2R5UmlnaHQ7XG4gICAgY29uc3QgZHJhZ0NvbHVtbnNCb2R5UmlnaHQgPSB0aGlzLmRyYWdDb2x1bW5zQm9keVJpZ2h0O1xuICAgIGNvbnN0IHsgc2Nyb2xsVG9wIH0gPSB0YXJnZXQ7XG4gICAgaWYgKHNjcm9sbFRvcCAhPT0gdGhpcy5sYXN0U2Nyb2xsVG9wKSB7XG4gICAgICBpZiAoZml4ZWRDb2x1bW5zQm9keUxlZnQgJiYgdGFyZ2V0ICE9PSBmaXhlZENvbHVtbnNCb2R5TGVmdCkge1xuICAgICAgICBmaXhlZENvbHVtbnNCb2R5TGVmdC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICB9XG4gICAgICBpZiAoYm9keVRhYmxlICYmIHRhcmdldCAhPT0gYm9keVRhYmxlKSB7XG4gICAgICAgIGJvZHlUYWJsZS5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICB9XG4gICAgICBpZiAoZml4ZWRDb2x1bW5zQm9keVJpZ2h0ICYmIHRhcmdldCAhPT0gZml4ZWRDb2x1bW5zQm9keVJpZ2h0KSB7XG4gICAgICAgIGZpeGVkQ29sdW1uc0JvZHlSaWdodC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICB9XG5cbiAgICAgIGlmIChkcmFnQ29sdW1uc0JvZHlMZWZ0ICYmIHRhcmdldCAhPT0gZHJhZ0NvbHVtbnNCb2R5TGVmdCkge1xuICAgICAgICBkcmFnQ29sdW1uc0JvZHlMZWZ0LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICAgIH1cblxuICAgICAgaWYgKGRyYWdDb2x1bW5zQm9keVJpZ2h0ICYmIHRhcmdldCAhPT0gZHJhZ0NvbHVtbnNCb2R5UmlnaHQpIHtcbiAgICAgICAgZHJhZ0NvbHVtbnNCb2R5UmlnaHQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICAgICAgfVxuXG4gICAgICBpZiAodmlydHVhbCkge1xuICAgICAgICB0aGlzLnJlZlNwaW4hLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB0aGlzLnNldFNwaW4oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZpcnR1YWwpIHtcbiAgICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBNYXRoLm1heChNYXRoLnJvdW5kKChzY3JvbGxUb3AgLyBOdW1iZXIocm93SGVpZ2h0KSkgLSAzKSwgMCk7XG4gICAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWluKE1hdGgucm91bmQoKHNjcm9sbFRvcCArIGhlaWdodCkgLyBOdW1iZXIocm93SGVpZ2h0KSArIDIpLCBkYXRhU2V0Lmxlbmd0aCk7XG4gICAgICB0aGlzLnJlZlVwcGVyUGxhY2Vob2xkZXIubWFwKHVwcGVyTm9kZSA9PiB7XG4gICAgICAgIGlmICh1cHBlck5vZGUpIHtcbiAgICAgICAgICB1cHBlck5vZGUuc3R5bGUuaGVpZ2h0ID0gYCR7c3RhcnRJbmRleCAqIE51bWJlcihyb3dIZWlnaHQpfXB4YDtcbiAgICAgICAgICB1cHBlck5vZGUuc3R5bGUuZGlzcGxheSA9IHN0YXJ0SW5kZXggPT09IDAgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnJlZlVuZGVyUGxhY2Vob2xkZXIubWFwKHVuZGVyTm9kZSA9PiB7XG4gICAgICAgIGlmICh1bmRlck5vZGUpIHtcbiAgICAgICAgICB1bmRlck5vZGUuc3R5bGUuZGlzcGxheSA9IGVuZEluZGV4ID09PSBkYXRhU2V0Lmxlbmd0aCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KTtcbiAgICAgIHRoaXMudGFibGVTdG9yZS5zZXRMYXN0U2Nyb2xsVG9wKHNjcm9sbFRvcCk7XG4gICAgfVxuICAgIHRoaXMubGFzdFNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgfVxuXG4gIGhhbmRsZUJvZHlTY3JvbGxMZWZ0KGUsIGN1cnJlbnRUYXJnZXQpIHtcbiAgICBjb25zdCB7IHRhcmdldCB9ID0gZTtcbiAgICBjb25zdCBoZWFkVGFibGUgPSB0aGlzLnRhYmxlSGVhZFdyYXA7XG4gICAgY29uc3QgYm9keVRhYmxlID0gdGhpcy50YWJsZUJvZHlXcmFwO1xuICAgIGNvbnN0IGZvb3RUYWJsZSA9IHRoaXMudGFibGVGb290V3JhcDtcbiAgICBpZiAoXG4gICAgICB0aGlzLnRhYmxlU3RvcmUub3ZlcmZsb3dYID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGN1cnJlbnRUYXJnZXQgIT09IHRhcmdldCB8fFxuICAgICAgdGFyZ2V0ID09PSB0aGlzLmZpeGVkQ29sdW1uc0JvZHlSaWdodCB8fFxuICAgICAgdGFyZ2V0ID09PSB0aGlzLmZpeGVkQ29sdW1uc0JvZHlMZWZ0XG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHsgc2Nyb2xsTGVmdCB9ID0gdGFyZ2V0O1xuICAgIGlmIChzY3JvbGxMZWZ0ICE9PSB0aGlzLmxhc3RTY3JvbGxMZWZ0KSB7XG4gICAgICBpZiAoaGVhZFRhYmxlICYmIHRhcmdldCAhPT0gaGVhZFRhYmxlKSB7XG4gICAgICAgIGhlYWRUYWJsZS5zY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcbiAgICAgIH1cbiAgICAgIGlmIChib2R5VGFibGUgJiYgdGFyZ2V0ICE9PSBib2R5VGFibGUpIHtcbiAgICAgICAgYm9keVRhYmxlLnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgICAgfVxuICAgICAgaWYgKGZvb3RUYWJsZSAmJiB0YXJnZXQgIT09IGZvb3RUYWJsZSkge1xuICAgICAgICBmb290VGFibGUuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFNjcm9sbFBvc2l0aW9uQ2xhc3NOYW1lKHRhcmdldCk7XG4gICAgfVxuICAgIHRoaXMubGFzdFNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICB9XG5cbiAgc2V0U2Nyb2xsUG9zaXRpb25DbGFzc05hbWUodGFyZ2V0PzogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGFibGVTdG9yZS5pc0FueUNvbHVtbnNMb2NrKSB7XG4gICAgICBjb25zdCBub2RlID0gdGFyZ2V0IHx8IHRoaXMudGFibGVCb2R5V3JhcDtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFRvTGVmdCA9IG5vZGUuc2Nyb2xsTGVmdCA9PT0gMDtcbiAgICAgICAgY29uc3QgdGFibGUgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoJ3RhYmxlJyk7XG4gICAgICAgIGNvbnN0IHNjcm9sbFRvUmlnaHQgPSB0YWJsZSAmJiBub2RlLnNjcm9sbExlZnQgPj0gdGFibGUub2Zmc2V0V2lkdGggLSBub2RlLm9mZnNldFdpZHRoO1xuICAgICAgICBpZiAoc2Nyb2xsVG9MZWZ0ICYmIHNjcm9sbFRvUmlnaHQpIHtcbiAgICAgICAgICB0aGlzLnNldFNjcm9sbFBvc2l0aW9uKFNjcm9sbFBvc2l0aW9uLmJvdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbFRvTGVmdCkge1xuICAgICAgICAgIHRoaXMuc2V0U2Nyb2xsUG9zaXRpb24oU2Nyb2xsUG9zaXRpb24ubGVmdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsVG9SaWdodCkge1xuICAgICAgICAgIHRoaXMuc2V0U2Nyb2xsUG9zaXRpb24oU2Nyb2xsUG9zaXRpb24ucmlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0U2Nyb2xsUG9zaXRpb24oU2Nyb2xsUG9zaXRpb24ubWlkZGxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFNjcm9sbFBvc2l0aW9uKHBvc2l0aW9uOiBTY3JvbGxQb3NpdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNjcm9sbFBvc2l0aW9uICE9PSBwb3NpdGlvbikge1xuICAgICAgdGhpcy5zY3JvbGxQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCBjbHMgPSBjbGFzc2VzKHRoaXMuZWxlbWVudCkucmVtb3ZlKG5ldyBSZWdFeHAoYF4ke3ByZWZpeENsc30tc2Nyb2xsLXBvc2l0aW9uLS4rJGApKTtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gU2Nyb2xsUG9zaXRpb24uYm90aCkge1xuICAgICAgICBjbHMuYWRkKGAke3ByZWZpeENsc30tc2Nyb2xsLXBvc2l0aW9uLWxlZnRgKS5hZGQoYCR7cHJlZml4Q2xzfS1zY3JvbGwtcG9zaXRpb24tcmlnaHRgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNscy5hZGQoYCR7cHJlZml4Q2xzfS1zY3JvbGwtcG9zaXRpb24tJHtwb3NpdGlvbn1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgc2F2ZVJlZihub2RlKSB7XG4gICAgdGhpcy5yZWZTY3JvbGwgPSBub2RlO1xuICB9XG5cbiAgcmVuZGVyVGFibGUoXG4gICAgaGFzSGVhZGVyOiBib29sZWFuLFxuICAgIGhhc0JvZHk6IGJvb2xlYW4sXG4gICAgaGFzRm9vdGVyOiBib29sZWFuLFxuICAgIGxvY2s/OiBDb2x1bW5Mb2NrIHwgYm9vbGVhbixcbiAgICBkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ24sXG4gICk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgdGFibGVTdG9yZTogeyByb3dIZWlnaHQsIGhlaWdodCB9LFxuICAgICAgb2JzZXJ2YWJsZVByb3BzOiB7IGRhdGFTZXQgfSxcbiAgICAgIHByb3BzOiB7IHZpcnR1YWwgfSxcbiAgICB9ID0gdGhpcztcblxuICAgIGNvbnN0IHZpcnR1YWxIID0gTWF0aC5yb3VuZChkYXRhU2V0Lmxlbmd0aCAqIE51bWJlcihyb3dIZWlnaHQpKTtcblxuICAgIHJldHVybiB2aXJ0dWFsICYmIGhlaWdodCA/XG4gICAgICAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPFRhYmxlV3JhcHBlclxuICAgICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgICBrZXk9XCJ0YWJsZVdyYXBwZXItaGVhZGVyXCJcbiAgICAgICAgICAgIGxvY2s9e2xvY2t9XG4gICAgICAgICAgICBoYXNCb2R5PXtmYWxzZX1cbiAgICAgICAgICAgIGhhc0hlYWRlcj17aGFzSGVhZGVyfVxuICAgICAgICAgICAgaGFzRm9vdGVyPXtmYWxzZX1cbiAgICAgICAgICAgIGRyYWdDb2x1bW5BbGlnbj17ZHJhZ0NvbHVtbkFsaWdufVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtoYXNIZWFkZXIgJiYgdGhpcy5nZXRUYWJsZUhlYWRlcihsb2NrLCBkcmFnQ29sdW1uQWxpZ24pfVxuICAgICAgICAgIDwvVGFibGVXcmFwcGVyPlxuICAgICAgICAgIHtoYXNCb2R5ICYmXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXRib2R5LXdyYXBwZXJgfVxuICAgICAgICAgICAgc3R5bGU9e3sgaGVpZ2h0OiB2aXJ0dWFsSCB9fVxuICAgICAgICAgICAgcmVmPXt0aGlzLnNhdmVSZWZ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3JlZlVwcGVyUGxhY2Vob2xkZXInIHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fSByZWY9eyhub2RlKSA9PiB0aGlzLnJlZlVwcGVyUGxhY2Vob2xkZXIucHVzaChub2RlKX0gLz5cbiAgICAgICAgICAgIDxUYWJsZVdyYXBwZXJcbiAgICAgICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgICAgIGtleT1cInRhYmxlV3JhcHBlci1ib2R5XCJcbiAgICAgICAgICAgICAgbG9jaz17bG9ja31cbiAgICAgICAgICAgICAgaGFzQm9keT17aGFzQm9keX1cbiAgICAgICAgICAgICAgaGFzSGVhZGVyPXtmYWxzZX1cbiAgICAgICAgICAgICAgaGFzRm9vdGVyPXtmYWxzZX1cbiAgICAgICAgICAgICAgZHJhZ0NvbHVtbkFsaWduPXtkcmFnQ29sdW1uQWxpZ259XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtoYXNCb2R5ICYmIHRoaXMuZ2V0VGFibGVCb2R5KGxvY2ssIGRyYWdDb2x1bW5BbGlnbil9XG4gICAgICAgICAgICA8L1RhYmxlV3JhcHBlcj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdyZWZVbmRlclBsYWNlaG9sZGVyJyBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX0gcmVmPXsobm9kZSkgPT4gdGhpcy5yZWZVbmRlclBsYWNlaG9sZGVyLnB1c2gobm9kZSl9IC8+XG4gICAgICAgICAgPC9kaXY+fVxuICAgICAgICAgIDxUYWJsZVdyYXBwZXJcbiAgICAgICAgICAgIHByZWZpeENscz17cHJlZml4Q2xzfVxuICAgICAgICAgICAga2V5PVwidGFibGVXcmFwcGVyLWZvb3RlclwiXG4gICAgICAgICAgICBsb2NrPXtsb2NrfVxuICAgICAgICAgICAgaGFzQm9keT17ZmFsc2V9XG4gICAgICAgICAgICBoYXNIZWFkZXI9e2ZhbHNlfVxuICAgICAgICAgICAgaGFzRm9vdGVyPXtoYXNGb290ZXJ9XG4gICAgICAgICAgICBkcmFnQ29sdW1uQWxpZ249e2RyYWdDb2x1bW5BbGlnbn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7aGFzRm9vdGVyICYmIHRoaXMuZ2V0VGFibGVGb290ZXIobG9jaywgZHJhZ0NvbHVtbkFsaWduKX1cbiAgICAgICAgICA8L1RhYmxlV3JhcHBlcj5cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8VGFibGVXcmFwcGVyXG4gICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAga2V5PVwidGFibGVXcmFwcGVyXCJcbiAgICAgICAgICBsb2NrPXtsb2NrfVxuICAgICAgICAgIGhhc0JvZHk9e2hhc0JvZHl9XG4gICAgICAgICAgaGFzSGVhZGVyPXtoYXNIZWFkZXJ9XG4gICAgICAgICAgaGFzRm9vdGVyPXtoYXNGb290ZXJ9XG4gICAgICAgICAgZHJhZ0NvbHVtbkFsaWduPXtkcmFnQ29sdW1uQWxpZ259XG4gICAgICAgID5cbiAgICAgICAgICB7aGFzSGVhZGVyICYmIHRoaXMuZ2V0VGFibGVIZWFkZXIobG9jaywgZHJhZ0NvbHVtbkFsaWduKX1cbiAgICAgICAgICB7aGFzQm9keSAmJiB0aGlzLmdldFRhYmxlQm9keShsb2NrLCBkcmFnQ29sdW1uQWxpZ24pfVxuICAgICAgICAgIHtoYXNGb290ZXIgJiYgdGhpcy5nZXRUYWJsZUZvb3Rlcihsb2NrLCBkcmFnQ29sdW1uQWxpZ24pfVxuICAgICAgICA8L1RhYmxlV3JhcHBlcj5cbiAgICAgICk7XG4gIH1cblxuICBnZXRIZWFkZXIoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBwcm9wczogeyBoZWFkZXIsIGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoaGVhZGVyKSB7XG4gICAgICBjb25zdCBkYXRhID0gZGF0YVNldCA/IGRhdGFTZXQucmVjb3JkcyA6IFtdO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9XCJoZWFkZXJcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30taGVhZGVyYH0+XG4gICAgICAgICAge3R5cGVvZiBoZWFkZXIgPT09ICdmdW5jdGlvbicgPyBoZWFkZXIoZGF0YSkgOiBoZWFkZXJ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRGb290ZXIoKTogUmVhY3ROb2RlIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBwcm9wczogeyBmb290ZXIsIGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoZm9vdGVyKSB7XG4gICAgICBjb25zdCBkYXRhID0gZGF0YVNldCA/IGRhdGFTZXQucmVjb3JkcyA6IFtdO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9XCJmb290ZXJcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tZm9vdGVyYH0+XG4gICAgICAgICAge3R5cGVvZiBmb290ZXIgPT09ICdmdW5jdGlvbicgPyBmb290ZXIoZGF0YSkgOiBmb290ZXJ9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRQYWdpbmF0aW9uKHBvc2l0aW9uOiBUYWJsZVBhZ2luYXRpb25Qb3NpdGlvbik6IFJlYWN0RWxlbWVudDxQYWdpbmF0aW9uUHJvcHM+IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBwcm9wczogeyBkYXRhU2V0IH0sXG4gICAgICB0YWJsZVN0b3JlOiB7IHBhZ2luYXRpb24gfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAocGFnaW5hdGlvbiAhPT0gZmFsc2UgJiYgZGF0YVNldCAmJiBkYXRhU2V0LnBhZ2luZykge1xuICAgICAgY29uc3QgcGFnaW5hdGlvblBvc2l0aW9uID0gZ2V0UGFnaW5hdGlvblBvc2l0aW9uKHBhZ2luYXRpb24pO1xuICAgICAgaWYgKHBhZ2luYXRpb25Qb3NpdGlvbiA9PT0gVGFibGVQYWdpbmF0aW9uUG9zaXRpb24uYm90aCB8fCBwYWdpbmF0aW9uUG9zaXRpb24gPT09IHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHBhZ2luYXRpb25Qcm9wcyA9IG9taXQocGFnaW5hdGlvbiwgJ3Bvc2l0aW9uJyk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPFBhZ2luYXRpb25cbiAgICAgICAgICAgIGtleT17YHBhZ2luYXRpb24tJHtwb3NpdGlvbn1gfVxuICAgICAgICAgICAgey4uLnBhZ2luYXRpb25Qcm9wc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LXBhZ2luYXRpb25gLCBwYWdpbmF0aW9uUHJvcHMuY2xhc3NOYW1lKX1cbiAgICAgICAgICAgIGRhdGFTZXQ9e2RhdGFTZXR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RoaXMuZ2V0Q2FjaGVTZWxlY3Rpb25Td2l0Y2goKX1cbiAgICAgICAgICA8L1BhZ2luYXRpb24+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2FjaGVTZWxlY3Rpb25Td2l0Y2goKSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHM6IHsgZGF0YVNldCB9LFxuICAgICAgcHJlZml4Q2xzLFxuICAgIH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0ICYmIGRhdGFTZXQuY2FjaGVTZWxlY3Rpb25LZXlzICYmIGRhdGFTZXQuY2FjaGVkU2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7IHNob3dDYWNoZWRTZWxldGlvbiB9ID0gdGhpcy50YWJsZVN0b3JlO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICB0aXRsZT17JGwoJ1RhYmxlJywgc2hvd0NhY2hlZFNlbGV0aW9uID8gJ2hpZGVfY2FjaGVkX3NlbGV0aW9uJyA6ICdzaG93X2NhY2hlZF9zZWxldGlvbicpfVxuICAgICAgICA+XG4gICAgICAgICAgPFN3aXRjaFxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXN3aXRjaGB9XG4gICAgICAgICAgICBjaGVja2VkPXtzaG93Q2FjaGVkU2VsZXRpb259XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVTd2l0Y2hDaGFuZ2V9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRUYWJsZShsb2NrPzogQ29sdW1uTG9jayB8IGJvb2xlYW4sIGRyYWdDb2x1bW5BbGlnbj86IERyYWdDb2x1bW5BbGlnbik6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMsIHByb3BzOiB7IGF1dG9IZWlnaHQgfSB9ID0gdGhpcztcbiAgICBjb25zdCB7IG92ZXJmbG93WCwgaGVpZ2h0LCBoYXNGb290ZXI6IGZvb3RlciB9ID0gdGhpcy50YWJsZVN0b3JlO1xuICAgIGxldCB0YWJsZUhlYWQ6IFJlYWN0Tm9kZTtcbiAgICBsZXQgdGFibGVCb2R5OiBSZWFjdE5vZGU7XG4gICAgbGV0IHRhYmxlRm9vdGVyOiBSZWFjdE5vZGU7XG4gICAgaWYgKCghZHJhZ0NvbHVtbkFsaWduICYmIG92ZXJmbG93WCkgfHwgaGVpZ2h0ICE9PSB1bmRlZmluZWQgfHwgYXV0b0hlaWdodCkge1xuICAgICAgaWYgKGF1dG9IZWlnaHQpIHRoaXMuc3luY1NpemUoKTtcbiAgICAgIGNvbnN0IHsgbG9ja0NvbHVtbnNCb2R5Um93c0hlaWdodCwgcm93SGVpZ2h0IH0gPSB0aGlzLnRhYmxlU3RvcmU7XG4gICAgICBsZXQgYm9keUhlaWdodCA9IGhlaWdodDtcbiAgICAgIGxldCB0YWJsZUhlYWRSZWY7XG4gICAgICBsZXQgdGFibGVCb2R5UmVmO1xuICAgICAgbGV0IHRhYmxlRm9vdFJlZjtcbiAgICAgIGlmICghbG9jaykge1xuICAgICAgICB0YWJsZUhlYWRSZWYgPSBub2RlID0+ICh0aGlzLnRhYmxlSGVhZFdyYXAgPSBub2RlKTtcbiAgICAgICAgdGFibGVGb290UmVmID0gbm9kZSA9PiAodGhpcy50YWJsZUZvb3RXcmFwID0gbm9kZSk7XG4gICAgICAgIHRhYmxlQm9keVJlZiA9IG5vZGUgPT4gKHRoaXMudGFibGVCb2R5V3JhcCA9IG5vZGUpO1xuICAgICAgfSBlbHNlIGlmIChsb2NrID09PSAncmlnaHQnKSB7XG4gICAgICAgIGlmIChkcmFnQ29sdW1uQWxpZ24gPT09IERyYWdDb2x1bW5BbGlnbi5yaWdodCkge1xuICAgICAgICAgIHRhYmxlQm9keVJlZiA9IG5vZGUgPT4gKHRoaXMuZHJhZ0NvbHVtbnNCb2R5UmlnaHQgPSBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZUJvZHlSZWYgPSBub2RlID0+ICh0aGlzLmZpeGVkQ29sdW1uc0JvZHlSaWdodCA9IG5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGRyYWdDb2x1bW5BbGlnbiA9PT0gRHJhZ0NvbHVtbkFsaWduLmxlZnQpIHtcbiAgICAgICAgICB0YWJsZUJvZHlSZWYgPSBub2RlID0+ICh0aGlzLmRyYWdDb2x1bW5zQm9keUxlZnQgPSBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB0YWJsZUJvZHlSZWYgPSBub2RlID0+ICh0aGlzLmZpeGVkQ29sdW1uc0JvZHlMZWZ0ID0gbm9kZSk7XG4gICAgICB9XG4gICAgICBpZiAoYm9keUhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGJvZHlIZWlnaHQgPSBNYXRoLm1heChcbiAgICAgICAgICBib2R5SGVpZ2h0LFxuICAgICAgICAgIGlzTnVtYmVyKHJvd0hlaWdodCkgPyByb3dIZWlnaHQgOiBsb2NrQ29sdW1uc0JvZHlSb3dzSGVpZ2h0WzBdIHx8IDAsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChsb2NrICYmICFmb290ZXIpIHtcbiAgICAgICAgICBib2R5SGVpZ2h0IC09IG1lYXN1cmVTY3JvbGxiYXIoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0YWJsZUhlYWQgPSAoXG4gICAgICAgIDxkaXYga2V5PVwidGFibGVIZWFkXCIgcmVmPXt0YWJsZUhlYWRSZWZ9IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1oZWFkYH0+XG4gICAgICAgICAge3RoaXMucmVuZGVyVGFibGUodHJ1ZSwgZmFsc2UsIGZhbHNlLCBsb2NrLCBkcmFnQ29sdW1uQWxpZ24pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG5cbiAgICAgIHRhYmxlQm9keSA9IChcbiAgICAgICAgPFRhYmxlQm9keVxuICAgICAgICAgIGtleT1cInRhYmxlQm9keVwiXG4gICAgICAgICAgZ2V0UmVmPXt0YWJsZUJvZHlSZWZ9XG4gICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgbG9jaz17bG9ja31cbiAgICAgICAgICBoZWlnaHQ9e2JvZHlIZWlnaHR9XG4gICAgICAgICAgb25TY3JvbGw9e3RoaXMuaGFuZGxlQm9keVNjcm9sbH1cbiAgICAgICAgPlxuICAgICAgICAgIHt0aGlzLnJlbmRlclRhYmxlKGZhbHNlLCB0cnVlLCBmYWxzZSwgbG9jaywgZHJhZ0NvbHVtbkFsaWduKX1cbiAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICApO1xuXG4gICAgICBpZiAoZm9vdGVyKSB7XG4gICAgICAgIHRhYmxlRm9vdGVyID0gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGtleT1cInRhYmxlRm9vdGVyXCJcbiAgICAgICAgICAgIHJlZj17dGFibGVGb290UmVmfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWZvb3RgfVxuICAgICAgICAgICAgb25TY3JvbGw9e3RoaXMuaGFuZGxlQm9keVNjcm9sbH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGhpcy5yZW5kZXJUYWJsZShmYWxzZSwgZmFsc2UsIHRydWUsIGxvY2ssIGRyYWdDb2x1bW5BbGlnbil9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYmxlQm9keSA9IHRoaXMucmVuZGVyVGFibGUodHJ1ZSwgdHJ1ZSwgZm9vdGVyLCBsb2NrLCBkcmFnQ29sdW1uQWxpZ24pO1xuICAgIH1cbiAgICByZXR1cm4gW3RhYmxlSGVhZCwgdGFibGVCb2R5LCB0YWJsZUZvb3Rlcl07XG4gIH1cblxuICBnZXRMZWZ0Rml4ZWRUYWJsZShkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ24pOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgb3ZlcmZsb3dYLCBoZWlnaHQgfSA9IHRoaXMudGFibGVTdG9yZTtcbiAgICBpZiAoKCFkcmFnQ29sdW1uQWxpZ24gJiYgIW92ZXJmbG93WCkgJiYgaGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgY29uc3QgdGFibGUgPSB0aGlzLmdldFRhYmxlKENvbHVtbkxvY2subGVmdCwgZHJhZ0NvbHVtbkFsaWduKTtcbiAgICBjb25zdCBpc0RyYWdMZWZ0ID0gZHJhZ0NvbHVtbkFsaWduID09PSBEcmFnQ29sdW1uQWxpZ24ubGVmdDtcbiAgICBjb25zdCBGaXhlZFRhYmxlQ2xhc3NOYW1lID0gY2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LWZpeGVkLWxlZnRgLCB7XG4gICAgICBbYCR7cHJlZml4Q2xzfS1kcmFnLWxlZnRgXTogaXNEcmFnTGVmdCxcbiAgICB9KTtcbiAgICBsZXQgc3R5bGVOT1NoYWRvdyA9IHt9O1xuICAgIGlmIChpc0RyYWdMZWZ0KSB7XG4gICAgICBpZiAodGhpcy50YWJsZVN0b3JlLmxlZnRMZWFmQ29sdW1ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgc3R5bGVOT1NoYWRvdyA9IHsgYm94U2hhZG93OiAnbm9uZScgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDxkaXYgc3R5bGU9e3N0eWxlTk9TaGFkb3d9IGNsYXNzTmFtZT17Rml4ZWRUYWJsZUNsYXNzTmFtZX0+e3RhYmxlfTwvZGl2PjtcbiAgfVxuXG4gIGdldFJpZ2h0Rml4ZWRUYWJsZShkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ24pOiBSZWFjdE5vZGUgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgb3ZlcmZsb3dYLCBoZWlnaHQgfSA9IHRoaXMudGFibGVTdG9yZTtcbiAgICBpZiAoKCFkcmFnQ29sdW1uQWxpZ24gJiYgIW92ZXJmbG93WCkgJiYgaGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgY29uc3QgdGFibGUgPSB0aGlzLmdldFRhYmxlKENvbHVtbkxvY2sucmlnaHQsIGRyYWdDb2x1bW5BbGlnbik7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWZpeGVkLXJpZ2h0YH0+e3RhYmxlfTwvZGl2PjtcbiAgfVxuXG4gIGdldFRhYmxlQm9keShsb2NrPzogQ29sdW1uTG9jayB8IGJvb2xlYW4sIGRyYWdDb2x1bW5BbGlnbj86IERyYWdDb2x1bW5BbGlnbik6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHsgaW5kZW50U2l6ZSB9LFxuICAgIH0gPSB0aGlzO1xuICAgIHJldHVybiAoXG4gICAgICA8RHJhZ0Ryb3BDb250ZXh0IG9uRHJhZ0VuZD17dGhpcy5vbkRyYWdFbmR9PlxuICAgICAgICA8VGFibGVUQm9keSBrZXk9XCJ0Ym9keVwiIHByZWZpeENscz17cHJlZml4Q2xzfSBsb2NrPXtsb2NrfSBpbmRlbnRTaXplPXtpbmRlbnRTaXplIX0gZHJhZ0NvbHVtbkFsaWduPXtkcmFnQ29sdW1uQWxpZ259IC8+XG4gICAgICA8L0RyYWdEcm9wQ29udGV4dD5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGFibGVIZWFkZXIobG9jaz86IENvbHVtbkxvY2sgfCBib29sZWFuLCBkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ24pOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHByb3BzOiB7IGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcztcbiAgICByZXR1cm4gKFxuICAgICAgPERyYWdEcm9wQ29udGV4dCBvbkRyYWdFbmQ9e3RoaXMub25EcmFnRW5kfT5cbiAgICAgICAgPFRhYmxlSGVhZGVyIGtleT1cInRoZWFkXCIgcHJlZml4Q2xzPXtwcmVmaXhDbHN9IGxvY2s9e2xvY2t9IGRhdGFTZXQ9e2RhdGFTZXR9IGRyYWdDb2x1bW5BbGlnbj17ZHJhZ0NvbHVtbkFsaWdufSAvPlxuICAgICAgPC9EcmFnRHJvcENvbnRleHQ+XG4gICAgKTtcbiAgfVxuXG4gIGdldFRhYmxlRm9vdGVyKGxvY2s/OiBDb2x1bW5Mb2NrIHwgYm9vbGVhbiwgZHJhZ0NvbHVtbkFsaWduPzogRHJhZ0NvbHVtbkFsaWduKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBwcm9wczogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIDxUYWJsZUZvb3RlciBrZXk9XCJ0Zm9vdFwiIHByZWZpeENscz17cHJlZml4Q2xzfSBsb2NrPXtsb2NrfSBkYXRhU2V0PXtkYXRhU2V0fSBkcmFnQ29sdW1uQWxpZ249e2RyYWdDb2x1bW5BbGlnbn0gLz47XG4gIH1cblxuICBnZXRTdHlsZUhlaWdodCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgc3R5bGUgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICByZXR1cm4gdG9QeChzdHlsZS5oZWlnaHQpO1xuICAgIH1cbiAgfVxuXG4gIHN5bmNTaXplSW5GcmFtZSh3aWR0aDogbnVtYmVyID0gdGhpcy5nZXRXaWR0aCgpKSB7XG4gICAgaWYgKHRoaXMubmV4dEZyYW1lQWN0aW9uSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmFmLmNhbmNlbCh0aGlzLm5leHRGcmFtZUFjdGlvbklkKTtcbiAgICB9XG4gICAgdGhpcy5uZXh0RnJhbWVBY3Rpb25JZCA9IHJhZih0aGlzLnN5bmNTaXplLmJpbmQodGhpcywgd2lkdGgpKTtcbiAgfVxuXG4gIGdldENvbnRlbnRIZWlnaHQoKSB7XG4gICAgY29uc3QgeyB3cmFwcGVyLCBlbGVtZW50LCBwcmVmaXhDbHMsIHByb3BzOiB7IGF1dG9IZWlnaHQgfSB9ID0gdGhpcztcbiAgICBpZiAoYXV0b0hlaWdodCkge1xuICAgICAgY29uc3QgeyB0b3A6IHBhcmVudFRvcCwgaGVpZ2h0OiBwYXJlbnRIZWlnaHQgfSA9IHdyYXBwZXIucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IHsgdG9wOiB0YWJsZVRvcCB9ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCB0eXBlID0gVGFibGVBdXRvSGVpZ2h0VHlwZS5taW5IZWlnaHQ7XG4gICAgICBsZXQgZGlmZiA9IDgwO1xuICAgICAgaWYgKGlzT2JqZWN0KGF1dG9IZWlnaHQpKSB7XG4gICAgICAgIHR5cGUgPSBhdXRvSGVpZ2h0LnR5cGUgfHwgVGFibGVBdXRvSGVpZ2h0VHlwZS5taW5IZWlnaHQ7XG4gICAgICAgIGRpZmYgPSBhdXRvSGVpZ2h0LmRpZmYgfHwgODA7XG4gICAgICB9XG4gICAgICBpZiAod3JhcHBlcikge1xuICAgICAgICBpZiAodHlwZSA9PT0gVGFibGVBdXRvSGVpZ2h0VHlwZS5taW5IZWlnaHQpIHtcbiAgICAgICAgICByZXR1cm4gcGFyZW50SGVpZ2h0IC0gKHRhYmxlVG9wIC0gcGFyZW50VG9wKSAtIGRpZmY7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFibGVCb2R5OiBIVE1MRGl2RWxlbWVudFtdIHwgbnVsbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7cHJlZml4Q2xzfS1ib2R5YCk7XG4gICAgICAgIGlmICh0YWJsZUJvZHkpIHtcbiAgICAgICAgICB0YWJsZUJvZHkuZm9yRWFjaCh0Ym9keSA9PiB7XG4gICAgICAgICAgICB0Ym9keS5zdHlsZS5tYXhIZWlnaHQgPSBweFRvUmVtKHBhcmVudEhlaWdodCAtICh0YWJsZVRvcCAtIHBhcmVudFRvcCkgLSBkaWZmKSB8fCAnJztcbiAgICAgICAgICAgIHRib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2F1dG8nO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFN0eWxlSGVpZ2h0KCk7XG4gIH07XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgc3luY1NpemUod2lkdGg6IG51bWJlciA9IHRoaXMuZ2V0V2lkdGgoKSkge1xuICAgIGNvbnN0IHsgZWxlbWVudCwgdGFibGVTdG9yZSB9ID0gdGhpcztcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgdGFibGVTdG9yZS53aWR0aCA9IE1hdGguZmxvb3Iod2lkdGgpO1xuICAgICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5nZXRDb250ZW50SGVpZ2h0KCk7XG4gICAgICBpZiAoZWxlbWVudCAmJiBpc051bWJlcihoZWlnaHQpKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlVGl0bGU6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihgLiR7cHJlZml4Q2xzfS10aXRsZWApO1xuICAgICAgICBjb25zdCB0YWJsZUhlYWRlcjogSFRNTFRhYmxlU2VjdGlvbkVsZW1lbnQgfCBudWxsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIGAuJHtwcmVmaXhDbHN9LXRoZWFkYCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgdGFibGVGb290ZXI6IEhUTUxUYWJsZVNlY3Rpb25FbGVtZW50IHwgbnVsbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICBgLiR7cHJlZml4Q2xzfS1mb290ZXJgLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0YWJsZUZvb3RXcmFwOiBIVE1MRGl2RWxlbWVudCB8IG51bGwgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3ByZWZpeENsc30tZm9vdGApO1xuICAgICAgICBpZiAodGFibGVUaXRsZSkge1xuICAgICAgICAgIGhlaWdodCAtPSBnZXRIZWlnaHQodGFibGVUaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYmxlSGVhZGVyKSB7XG4gICAgICAgICAgaGVpZ2h0IC09IGdldEhlaWdodCh0YWJsZUhlYWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYmxlRm9vdGVyKSB7XG4gICAgICAgICAgaGVpZ2h0IC09IGdldEhlaWdodCh0YWJsZUZvb3Rlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhYmxlRm9vdFdyYXApIHtcbiAgICAgICAgICBoZWlnaHQgLT0gZ2V0SGVpZ2h0KHRhYmxlRm9vdFdyYXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFibGVTdG9yZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0U2Nyb2xsUG9zaXRpb25DbGFzc05hbWUoKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgaW5pdERlZmF1bHRFeHBhbmRlZFJvd3MoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZSxcbiAgICAgIHByb3BzOiB7IGRhdGFTZXQsIGRlZmF1bHRSb3dFeHBhbmRlZCB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGlmICh0YWJsZVN0b3JlLmlzVHJlZSAmJiBkZWZhdWx0Um93RXhwYW5kZWQgJiYgIWRhdGFTZXQucHJvcHMuZXhwYW5kRmllbGQpIHtcbiAgICAgIHRhYmxlU3RvcmUuZXhwYW5kZWRSb3dzID0gZGF0YVNldC5yZWR1Y2U8KHN0cmluZyB8IG51bWJlcilbXT4oKGFycmF5LCByZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKHJlY29yZC5jaGlsZHJlbikge1xuICAgICAgICAgIGFycmF5LnB1c2gocmVjb3JkLmtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgfSwgW10pO1xuICAgIH1cbiAgfVxuXG4gIGdldFdpZHRoKCk6IG51bWJlciB7XG4gICAgY29uc3QgeyB3cmFwcGVyIH0gPSB0aGlzO1xuICAgIGlmICh3cmFwcGVyKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcih3cmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==