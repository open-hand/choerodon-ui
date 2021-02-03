import { __decorate } from "tslib";
import React, { Children, isValidElement } from 'react';
import { action, set, computed, observable, runInAction } from 'mobx';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import defer from 'lodash/defer';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import Icon from 'choerodon-ui/lib/icon';
import { isFunction } from 'lodash';
import Column, { columnWidth } from './Column';
import ObserverCheckBox from '../check-box';
import ObserverRadio from '../radio';
import { stopPropagation } from '../_util/EventManager';
import { getColumnKey, getHeader, reorderingColumns, mergeObject } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import ColumnGroups from './ColumnGroups';
import autobind from '../_util/autobind';
export const SELECTION_KEY = '__selection-column__';
export const DRAG_KEY = '__drag-column__';
export const EXPAND_KEY = '__expand-column__';
export const getIdList = (startId, endId) => {
    const idList = [];
    const min = Math.min(startId, endId);
    const max = Math.max(startId, endId);
    for (let i = min; i <= max; i++) {
        idList.push(i);
    }
    return idList;
};
function renderSelectionBox({ record, store }) {
    const { dataSet } = record;
    if (dataSet) {
        const { selection } = dataSet;
        const handleChange = value => {
            if (store.props.selectionMode === "mousedown" /* mousedown */) {
                // 将处理逻辑交给 mousedown 的处理逻辑 不然会两次触发导致不被勾选上
                return;
            }
            if (value) {
                dataSet.select(record);
            }
            else {
                dataSet.unSelect(record);
            }
        };
        const handleClick = e => {
            stopPropagation(e);
            if (record.isSelected) {
                dataSet.unSelect(record);
            }
        };
        const handleMouseDown = () => {
            if (store.useMouseBatchChoose) {
                store.mouseBatchChooseStartId = record.id;
                store.mouseBatchChooseEndId = record.id;
                store.mouseBatchChooseState = true;
            }
        };
        const handleMouseEnter = () => {
            if (store.useMouseBatchChoose && store.mouseBatchChooseState) {
                store.mouseBatchChooseEndId = record.id;
                store.changeMouseBatchChooseIdList(getIdList(store.mouseBatchChooseStartId, store.mouseBatchChooseEndId));
            }
        };
        if (selection === "multiple" /* multiple */) {
            return (React.createElement(ObserverCheckBox, { checked: record.isSelected, onChange: handleChange, onClick: stopPropagation, onMouseDown: handleMouseDown, onMouseEnter: handleMouseEnter, disabled: !record.selectable, value: true }));
        }
        if (selection === "single" /* single */) {
            return (React.createElement(ObserverRadio, { checked: record.isSelected, onChange: handleChange, onClick: handleClick, onMouseDown: handleMouseDown, onMouseEnter: handleMouseEnter, disabled: !record.selectable, value: true }));
        }
    }
}
function mergeDefaultProps(columns, columnsMergeCoverage, defaultKey = [0]) {
    const columnsNew = [];
    const leftFixedColumns = [];
    const rightFixedColumns = [];
    columns.forEach((column) => {
        if (isPlainObject(column)) {
            let newColumn = { ...Column.defaultProps, ...column };
            if (isNil(getColumnKey(newColumn))) {
                newColumn.key = `anonymous-${defaultKey[0]++}`;
            }
            const { children } = newColumn;
            if (children) {
                newColumn.children = mergeDefaultProps(children, columnsMergeCoverage, defaultKey);
            }
            // TODO 后续可以加key
            if (columnsMergeCoverage && columnsMergeCoverage.length > 0) {
                const mergeItem = columnsMergeCoverage.find(columnItem => columnItem.name === column.name);
                if (mergeItem) {
                    newColumn = mergeObject(['header'], mergeItem, column);
                }
            }
            if (newColumn.lock === "left" /* left */ || newColumn.lock === true) {
                leftFixedColumns.push(newColumn);
            }
            else if (newColumn.lock === "right" /* right */) {
                rightFixedColumns.push(newColumn);
            }
            else {
                columnsNew.push(newColumn);
            }
        }
    });
    return leftFixedColumns.concat(columnsNew, rightFixedColumns);
}
function normalizeColumns(elements, columnsMergeCoverage, parent = null, defaultKey = [0]) {
    const columns = [];
    const leftFixedColumns = [];
    const rightFixedColumns = [];
    Children.forEach(elements, element => {
        if (!isValidElement(element) || element.type !== Column) {
            return;
        }
        const { props, key } = element;
        let column = {
            ...props,
        };
        if (isNil(getColumnKey(column))) {
            column.key = `anonymous-${defaultKey[0]++}`;
        }
        if (parent) {
            column.lock = parent.lock;
        }
        column.children = normalizeColumns(column.children, columnsMergeCoverage, column, defaultKey);
        if (key) {
            column.key = key;
        }
        // 后续可以加key
        if (columnsMergeCoverage && columnsMergeCoverage.length > 0) {
            const mergeItem = columnsMergeCoverage.find(columnItem => columnItem.name === column.name);
            if (mergeItem) {
                column = mergeObject(['header'], mergeItem, column);
            }
        }
        if (column.lock === "left" /* left */ || column.lock === true) {
            leftFixedColumns.push(column);
        }
        else if (column.lock === "right" /* right */) {
            rightFixedColumns.push(column);
        }
        else {
            columns.push(column);
        }
    });
    return leftFixedColumns.concat(columns, rightFixedColumns);
}
async function getHeaderTexts(dataSet, columns, headers = []) {
    const column = columns.shift();
    if (column) {
        headers.push({ name: column.name, label: await getReactNodeText(getHeader(column, dataSet)) });
    }
    if (columns.length) {
        await getHeaderTexts(dataSet, columns, headers);
    }
    return headers;
}
export default class TableStore {
    constructor(node) {
        this.mouseBatchChooseStartId = 0;
        this.mouseBatchChooseEndId = 0;
        this.mouseBatchChooseState = false;
        this.handleSelectAllChange = action(value => {
            const { dataSet, filter } = this.props;
            if (value) {
                dataSet.selectAll(filter);
            }
            else {
                dataSet.unSelectAll();
                if (this.showCachedSeletion) {
                    dataSet.clearCachedSelected();
                }
            }
        });
        runInAction(() => {
            this.showCachedSeletion = false;
            this.lockColumnsHeadRowsHeight = {};
            this.lockColumnsBodyRowsHeight = {};
            this.lockColumnsFootRowsHeight = {};
            this.node = node;
            this.expandedRows = [];
            this.columnDeep = 0;
        });
        this.setProps(node.props);
    }
    get dataSet() {
        return this.props.dataSet;
    }
    get hidden() {
        return !!this.styledHidden || this.props.hidden;
    }
    get alwaysShowRowBox() {
        if ('alwaysShowRowBox' in this.props) {
            return this.props.alwaysShowRowBox;
        }
        const alwaysShowRowBox = getConfig('tableAlwaysShowRowBox');
        if (typeof alwaysShowRowBox !== 'undefined') {
            return alwaysShowRowBox;
        }
        return false;
    }
    get columnResizable() {
        if (this.currentEditRecord) {
            return false;
        }
        if ('columnResizable' in this.props) {
            return this.props.columnResizable;
        }
        if (getConfig('tableColumnResizable') === false) {
            return false;
        }
        return true;
    }
    get pagination() {
        if ('pagination' in this.props) {
            return this.props.pagination;
        }
        return getConfig('pagination');
    }
    get dragColumnAlign() {
        if ('dragColumnAlign' in this.props) {
            return this.props.dragColumnAlign;
        }
        return getConfig('tableDragColumnAlign');
    }
    get dragColumn() {
        if (this.columnMaxDeep > 1) {
            return false;
        }
        if ('dragColumn' in this.props) {
            return this.props.dragColumn;
        }
        return getConfig('tableDragColumn');
    }
    get dragRow() {
        if (this.isTree) {
            return false;
        }
        if ('dragRow' in this.props) {
            return this.props.dragRow;
        }
        return getConfig('tableDragRow');
    }
    get rowHeight() {
        if ('rowHeight' in this.props) {
            return this.props.rowHeight;
        }
        const rowHeight = getConfig('tableRowHeight');
        if (typeof rowHeight !== 'undefined') {
            return rowHeight;
        }
        return 30;
    }
    get emptyText() {
        return getConfig('renderEmpty')('Table');
    }
    get highLightRow() {
        if ('highLightRow' in this.props) {
            return this.props.highLightRow;
        }
        if (getConfig('tableHighLightRow') === false) {
            return false;
        }
        return true;
    }
    get selectedHighLightRow() {
        if ('selectedHighLightRow' in this.props) {
            return this.props.selectedHighLightRow;
        }
        if (getConfig('tableSelectedHighLightRow') === false) {
            return false;
        }
        return true;
    }
    get editorNextKeyEnterDown() {
        if ('editorNextKeyEnterDown' in this.props) {
            return this.props.editorNextKeyEnterDown;
        }
        if (getConfig('tableEditorNextKeyEnterDown') === false) {
            return false;
        }
        return true;
    }
    get border() {
        if ('border' in this.props) {
            return this.props.border;
        }
        if (getConfig('tableBorder') === false) {
            return false;
        }
        return true;
    }
    get queryBar() {
        return this.props.queryBar || getConfig('queryBar');
    }
    get expandIcon() {
        return this.props.expandIcon || getConfig('tableExpandIcon');
    }
    get pristine() {
        return this.props.pristine;
    }
    get currentEditRecord() {
        return this.dataSet.find(record => record.editing === true);
    }
    set currentEditRecord(record) {
        runInAction(() => {
            const { currentEditRecord, dataSet } = this;
            if (currentEditRecord) {
                if (currentEditRecord.status === "add" /* add */) {
                    dataSet.remove(currentEditRecord);
                }
                else {
                    currentEditRecord.reset();
                    currentEditRecord.editing = false;
                }
            }
            if (record) {
                defer(action(() => (record.editing = true)));
            }
        });
    }
    get isTree() {
        return this.props.mode === "tree" /* tree */;
    }
    get editing() {
        return this.currentEditorName !== undefined || this.currentEditRecord !== undefined;
    }
    get hasRowBox() {
        const { dataSet, selectionMode } = this.props;
        const { alwaysShowRowBox } = this;
        if (dataSet) {
            const { selection } = dataSet;
            return selection && (selectionMode === "rowbox" /* rowbox */ || alwaysShowRowBox);
        }
        return false;
    }
    get useMouseBatchChoose() {
        const { useMouseBatchChoose } = this.props;
        if (useMouseBatchChoose !== undefined) {
            return useMouseBatchChoose;
        }
        if (getConfig('tableUseMouseBatchChoose') !== undefined) {
            return getConfig('tableUseMouseBatchChoose');
        }
        return false;
    }
    get overflowX() {
        if (this.width) {
            return this.totalLeafColumnsWidth > this.width;
        }
        return false;
    }
    get overflowY() {
        const { bodyHeight, height } = this;
        return (bodyHeight !== undefined &&
            height !== undefined &&
            height < bodyHeight + (this.overflowX ? measureScrollbar() : 0));
    }
    get columns() {
        const { columnsMergeCoverage } = this.props;
        let { columns, children } = this.props;
        if (this.headersOderable) {
            if (columnsMergeCoverage && columns) {
                columns = reorderingColumns(columnsMergeCoverage, columns);
            }
            else {
                children = reorderingColumns(columnsMergeCoverage, children);
            }
        }
        // 分开处理可以满足于只修改表头信息场景不改变顺序 
        return observable.array(this.addExpandColumn(this.addDragColumn(this.addSelectionColumn(columns
            ? mergeDefaultProps(columns, this.headersEditable
                ? columnsMergeCoverage
                : undefined)
            : normalizeColumns(children, this.headersEditable
                ? columnsMergeCoverage :
                undefined)))));
    }
    set columns(columns) {
        runInAction(() => {
            set(this.props, 'columns', columns);
        });
    }
    /**
     * 表头支持编辑
     */
    get headersEditable() {
        return (this.props.columnsEditType === "header" /* header */ || this.props.columnsEditType === "all" /* all */) && !!this.props.columnsMergeCoverage;
    }
    /**
     * 表头支持排序
     */
    get headersOderable() {
        return (this.props.columnsEditType === "order" /* order */ || this.props.columnsEditType === "all" /* all */) && !!this.props.columnsMergeCoverage;
    }
    get leftColumns() {
        return this.columns.filter(column => column.lock === "left" /* left */ || column.lock === true);
    }
    get rightColumns() {
        return this.columns.filter(column => column.lock === "right" /* right */);
    }
    get columnGroups() {
        return new ColumnGroups(this.columns);
    }
    get groupedColumns() {
        return this.columnGroups.columns;
    }
    get leftGroupedColumns() {
        return this.groupedColumns.filter(({ column: { lock } }) => lock === "left" /* left */ || lock === true);
    }
    get rightGroupedColumns() {
        return this.groupedColumns.filter(({ column: { lock } }) => lock === "right" /* right */);
    }
    get leafColumns() {
        return this.getLeafColumns(this.columns);
    }
    get leftLeafColumns() {
        return this.getLeafColumns(this.leftColumns);
    }
    get rightLeafColumns() {
        return this.getLeafColumns(this.rightColumns);
    }
    get leafNamedColumns() {
        return this.leafColumns.filter(column => !!column.name);
    }
    get totalLeafColumnsWidth() {
        return this.leafColumns.reduce((total, column) => total + columnWidth(column), 0);
    }
    get leftLeafColumnsWidth() {
        return this.leftLeafColumns.reduce((total, column) => total + columnWidth(column), 0);
    }
    get rightLeafColumnsWidth() {
        return this.rightLeafColumns.reduce((total, column) => total + columnWidth(column), 0);
    }
    get hasCheckFieldColumn() {
        const { checkField } = this.dataSet.props;
        return this.leafColumns.some(({ name, editor }) => !!editor && checkField === name);
    }
    get hasFooter() {
        return this.leafColumns.some(column => !!column.footer && column.key !== SELECTION_KEY);
    }
    get isAnyColumnsResizable() {
        return this.leafColumns.some(column => column.resizable === true);
    }
    get isAnyColumnsLock() {
        return this.columns.some(column => !!column.lock);
    }
    get isAnyColumnsLeftLock() {
        return this.columns.some(column => column.lock === "left" /* left */ || column.lock === true);
    }
    get isAnyColumnsRightLock() {
        return this.columns.some(column => column.lock === "right" /* right */);
    }
    get data() {
        const { filter, pristine } = this.props;
        const { dataSet, isTree, showCachedSeletion } = this;
        let data = isTree ? dataSet.treeRecords : dataSet.records;
        if (typeof filter === 'function') {
            data = data.filter(filter);
        }
        if (pristine) {
            data = data.filter(record => record.status !== "add" /* add */);
        }
        if (showCachedSeletion) {
            return [...dataSet.cachedSelected, ...data];
        }
        return data;
    }
    get indeterminate() {
        const { dataSet, showCachedSeletion } = this;
        if (dataSet) {
            const { length } = dataSet.records.filter(record => record.selectable);
            const selectedLength = showCachedSeletion
                ? dataSet.selected.length
                : dataSet.currentSelected.length;
            return !!selectedLength && selectedLength !== length;
        }
        return false;
    }
    get allChecked() {
        const { dataSet, showCachedSeletion } = this;
        if (dataSet) {
            const { length } = dataSet.records.filter(record => record.selectable);
            const selectedLength = showCachedSeletion
                ? dataSet.selected.length
                : dataSet.currentSelected.length;
            return !!selectedLength && selectedLength === length;
        }
        return false;
    }
    get expandIconAsCell() {
        const { expandedRowRenderer } = this.props;
        return !!expandedRowRenderer && !this.isTree;
    }
    get expandIconColumnIndex() {
        const { expandIconAsCell, props: { expandIconColumnIndex = 0 }, } = this;
        if (expandIconAsCell) {
            return 0;
        }
        if (this.hasRowBox) {
            return expandIconColumnIndex + 1;
        }
        return expandIconColumnIndex;
    }
    get inlineEdit() {
        return this.props.editMode === "inline" /* inline */;
    }
    get columnMaxDeep() {
        return this.columnDeep;
    }
    set columnMaxDeep(deep) {
        runInAction(() => {
            this.columnDeep = Math.max(this.columnDeep, deep);
        });
    }
    async getColumnHeaders() {
        const { leafNamedColumns, dataSet } = this;
        return getHeaderTexts(dataSet, leafNamedColumns.slice());
    }
    showEditor(name) {
        this.currentEditorName = name;
    }
    setLastScrollTop(lastScrollTop) {
        this.lastScrollTop = lastScrollTop;
    }
    hideEditor() {
        this.currentEditorName = undefined;
    }
    changeMouseBatchChooseIdList(idList) {
        this.mouseBatchChooseIdList = idList;
    }
    showNextEditor(name, reserve) {
        if (reserve) {
            this.dataSet.pre();
        }
        else {
            this.dataSet.next();
        }
        this.showEditor(name);
    }
    setProps(props) {
        this.props = props;
    }
    isRowExpanded(record) {
        const { parent } = record;
        // 如果 存在expandFiled 然后这个 record 被标记为展开 或者 能在存储的已经展开列中找到 那么它为已经展开
        // 所以逻辑错误的地方就是当这个列没有从tree expand删除那么它会一直在。
        // 最后的方法表示当父亲节点为不展开它也不展开返回false
        const expanded = this.dataSet.props.expandField ? record.isExpanded : this.expandedRows.indexOf(record.key) !== -1;
        return expanded && (!this.isTree || !parent || this.isRowExpanded(parent));
    }
    setRowExpanded(record, expanded) {
        if (this.dataSet.props.expandField) {
            record.isExpanded = expanded;
        }
        const index = this.expandedRows.indexOf(record.key);
        if (expanded) {
            if (index === -1) {
                this.expandedRows.push(record.key);
            }
        }
        else if (index !== -1) {
            this.expandedRows.splice(index, 1);
        }
        const { onExpand } = this.props;
        if (onExpand) {
            onExpand(expanded, record);
        }
    }
    isRowHover(record) {
        return this.hoverRow === record;
    }
    setRowHover(record, hover) {
        this.hoverRow = hover ? record : undefined;
    }
    expandAll() {
        this.dataSet.records.forEach(record => this.setRowExpanded(record, true));
    }
    collapseAll() {
        this.dataSet.records.forEach(record => this.setRowExpanded(record, false));
    }
    getLeafColumns(columns) {
        const leafColumns = [];
        columns.forEach(column => {
            if (!column.children || column.children.length === 0) {
                leafColumns.push(column);
            }
            else {
                leafColumns.push(...this.getLeafColumns(column.children));
            }
        });
        return leafColumns;
    }
    addExpandColumn(columns) {
        if (this.expandIconAsCell) {
            columns.unshift({
                key: EXPAND_KEY,
                resizable: false,
                align: "center" /* center */,
                width: 50,
                lock: true,
            });
        }
        return columns;
    }
    multipleSelectionRenderer() {
        return (React.createElement(ObserverCheckBox, { checked: this.allChecked, indeterminate: this.indeterminate, onChange: this.handleSelectAllChange, value: true }));
    }
    addSelectionColumn(columns) {
        if (this.hasRowBox) {
            const { dataSet } = this;
            const { suffixCls, prefixCls } = this.props;
            const selectionColumn = {
                key: SELECTION_KEY,
                resizable: false,
                className: `${getProPrefixCls(suffixCls, prefixCls)}-selection-column`,
                renderer: ({ record }) => renderSelectionBox({ record, store: this }),
                align: "center" /* center */,
                width: 50,
                lock: true,
            };
            if (dataSet && dataSet.selection === "multiple" /* multiple */) {
                selectionColumn.header = this.multipleSelectionRenderer;
                selectionColumn.footer = this.multipleSelectionRenderer;
            }
            columns.unshift(selectionColumn);
        }
        return columns;
    }
    renderDrageBox({ record }) {
        const { rowDragRender } = this.props;
        if (rowDragRender && isFunction(rowDragRender.renderIcon)) {
            return rowDragRender.renderIcon({ record });
        }
        return (React.createElement(Icon, { type: "baseline-drag_indicator" }));
    }
    addDragColumn(columns) {
        const { dragColumnAlign, dragRow, props: { suffixCls, prefixCls } } = this;
        if (dragColumnAlign && dragRow) {
            const dragColumn = {
                key: DRAG_KEY,
                resizable: false,
                className: `${getProPrefixCls(suffixCls, prefixCls)}-drag-column`,
                renderer: ({ record }) => this.renderDrageBox({ record }),
                align: "center" /* center */,
                width: 50,
            };
            if (dragColumnAlign === "left" /* left */) {
                dragColumn.lock = "left" /* left */;
                columns.unshift(dragColumn);
            }
            if (dragColumnAlign === "right" /* right */) {
                dragColumn.lock = "right" /* right */;
                columns.push(dragColumn);
            }
        }
        return columns;
    }
}
__decorate([
    observable
], TableStore.prototype, "props", void 0);
__decorate([
    observable
], TableStore.prototype, "bodyHeight", void 0);
__decorate([
    observable
], TableStore.prototype, "width", void 0);
__decorate([
    observable
], TableStore.prototype, "height", void 0);
__decorate([
    observable
], TableStore.prototype, "lastScrollTop", void 0);
__decorate([
    observable
], TableStore.prototype, "lockColumnsBodyRowsHeight", void 0);
__decorate([
    observable
], TableStore.prototype, "lockColumnsFootRowsHeight", void 0);
__decorate([
    observable
], TableStore.prototype, "lockColumnsHeadRowsHeight", void 0);
__decorate([
    observable
], TableStore.prototype, "expandedRows", void 0);
__decorate([
    observable
], TableStore.prototype, "hoverRow", void 0);
__decorate([
    observable
], TableStore.prototype, "currentEditorName", void 0);
__decorate([
    observable
], TableStore.prototype, "styledHidden", void 0);
__decorate([
    observable
], TableStore.prototype, "mouseBatchChooseIdList", void 0);
__decorate([
    observable
], TableStore.prototype, "columnDeep", void 0);
__decorate([
    computed
], TableStore.prototype, "dataSet", null);
__decorate([
    computed
], TableStore.prototype, "alwaysShowRowBox", null);
__decorate([
    computed
], TableStore.prototype, "columnResizable", null);
__decorate([
    computed
], TableStore.prototype, "pagination", null);
__decorate([
    computed
], TableStore.prototype, "dragColumnAlign", null);
__decorate([
    computed
], TableStore.prototype, "dragColumn", null);
__decorate([
    computed
], TableStore.prototype, "dragRow", null);
__decorate([
    computed
], TableStore.prototype, "rowHeight", null);
__decorate([
    computed
], TableStore.prototype, "emptyText", null);
__decorate([
    computed
], TableStore.prototype, "highLightRow", null);
__decorate([
    computed
], TableStore.prototype, "selectedHighLightRow", null);
__decorate([
    computed
], TableStore.prototype, "editorNextKeyEnterDown", null);
__decorate([
    computed
], TableStore.prototype, "border", null);
__decorate([
    computed
], TableStore.prototype, "queryBar", null);
__decorate([
    computed
], TableStore.prototype, "expandIcon", null);
__decorate([
    computed
], TableStore.prototype, "currentEditRecord", null);
__decorate([
    observable
], TableStore.prototype, "showCachedSeletion", void 0);
__decorate([
    computed
], TableStore.prototype, "hasRowBox", null);
__decorate([
    computed
], TableStore.prototype, "useMouseBatchChoose", null);
__decorate([
    computed
], TableStore.prototype, "overflowX", null);
__decorate([
    computed
], TableStore.prototype, "overflowY", null);
__decorate([
    computed
], TableStore.prototype, "columns", null);
__decorate([
    computed
], TableStore.prototype, "headersEditable", null);
__decorate([
    computed
], TableStore.prototype, "headersOderable", null);
__decorate([
    computed
], TableStore.prototype, "leftColumns", null);
__decorate([
    computed
], TableStore.prototype, "rightColumns", null);
__decorate([
    computed
], TableStore.prototype, "columnGroups", null);
__decorate([
    computed
], TableStore.prototype, "groupedColumns", null);
__decorate([
    computed
], TableStore.prototype, "leftGroupedColumns", null);
__decorate([
    computed
], TableStore.prototype, "rightGroupedColumns", null);
__decorate([
    computed
], TableStore.prototype, "leafColumns", null);
__decorate([
    computed
], TableStore.prototype, "leftLeafColumns", null);
__decorate([
    computed
], TableStore.prototype, "rightLeafColumns", null);
__decorate([
    computed
], TableStore.prototype, "leafNamedColumns", null);
__decorate([
    computed
], TableStore.prototype, "totalLeafColumnsWidth", null);
__decorate([
    computed
], TableStore.prototype, "leftLeafColumnsWidth", null);
__decorate([
    computed
], TableStore.prototype, "rightLeafColumnsWidth", null);
__decorate([
    computed
], TableStore.prototype, "hasCheckFieldColumn", null);
__decorate([
    computed
], TableStore.prototype, "hasFooter", null);
__decorate([
    computed
], TableStore.prototype, "isAnyColumnsResizable", null);
__decorate([
    computed
], TableStore.prototype, "isAnyColumnsLock", null);
__decorate([
    computed
], TableStore.prototype, "isAnyColumnsLeftLock", null);
__decorate([
    computed
], TableStore.prototype, "isAnyColumnsRightLock", null);
__decorate([
    computed
], TableStore.prototype, "data", null);
__decorate([
    computed
], TableStore.prototype, "indeterminate", null);
__decorate([
    computed
], TableStore.prototype, "allChecked", null);
__decorate([
    computed
], TableStore.prototype, "expandIconAsCell", null);
__decorate([
    computed
], TableStore.prototype, "expandIconColumnIndex", null);
__decorate([
    computed
], TableStore.prototype, "inlineEdit", null);
__decorate([
    computed
], TableStore.prototype, "columnMaxDeep", null);
__decorate([
    action
], TableStore.prototype, "showEditor", null);
__decorate([
    action
], TableStore.prototype, "setLastScrollTop", null);
__decorate([
    action
], TableStore.prototype, "hideEditor", null);
__decorate([
    action
], TableStore.prototype, "changeMouseBatchChooseIdList", null);
__decorate([
    action
], TableStore.prototype, "setProps", null);
__decorate([
    action
], TableStore.prototype, "setRowExpanded", null);
__decorate([
    action
], TableStore.prototype, "setRowHover", null);
__decorate([
    action
], TableStore.prototype, "expandAll", null);
__decorate([
    action
], TableStore.prototype, "collapseAll", null);
__decorate([
    autobind
], TableStore.prototype, "multipleSelectionRenderer", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlU3RvcmUudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQWEsTUFBTSxPQUFPLENBQUM7QUFDbkUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEUsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sYUFBYSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLGdCQUFnQixNQUFNLHlDQUF5QyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDeEUsT0FBTyxJQUFJLE1BQU0sdUJBQXVCLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNwQyxPQUFPLE1BQU0sRUFBRSxFQUFlLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUc1RCxPQUFPLGdCQUFnQixNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLGFBQWEsTUFBTSxVQUFVLENBQUM7QUFZckMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRyxNQUFNLFNBQVMsQ0FBQztBQUNuRixPQUFPLGdCQUFnQixNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFDO0FBSXpDLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztBQUVwRCxNQUFNLENBQUMsTUFBTSxRQUFR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c0NBZVI7QUFHRDtJQURDLFFBQVE7K0NBV1I7QUFHRDtJQURDLFFBQVE7NENBV1I7QUFHRDtJQURDLFFBQVE7a0RBSVI7QUFHRDtJQURDLFFBQVE7dURBYVI7QUFHRDtJQURDLFFBQVE7NENBR1I7QUFHRDtJQURDLFFBQVE7K0NBR1I7QUF1Q0Q7SUFEQyxNQUFNOzRDQUdOO0FBR0Q7SUFEQyxNQUFNO2tEQUdOO0FBR0Q7SUFEQyxNQUFNOzRDQUdOO0FBR0Q7SUFEQyxNQUFNOzhEQUdOO0FBWUQ7SUFEQyxNQUFNOzBDQUdOO0FBWUQ7SUFEQyxNQUFNO2dEQWlCTjtBQU9EO0lBREMsTUFBTTs2Q0FHTjtBQUdEO0lBREMsTUFBTTsyQ0FHTjtBQUdEO0lBREMsTUFBTTs2Q0FHTjtBQTRCRDtJQURDLFFBQVE7MkRBVVIiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlU3RvcmUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBDaGlsZHJlbiwgaXNWYWxpZEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGFjdGlvbiwgc2V0LCBjb21wdXRlZCwgb2JzZXJ2YWJsZSwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCBpc05pbCBmcm9tICdsb2Rhc2gvaXNOaWwnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnbG9kYXNoL2lzUGxhaW5PYmplY3QnO1xuaW1wb3J0IGRlZmVyIGZyb20gJ2xvZGFzaC9kZWZlcic7XG5pbXBvcnQgbWVhc3VyZVNjcm9sbGJhciBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL21lYXN1cmVTY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0Q29uZmlnLCBnZXRQcm9QcmVmaXhDbHMgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbmZpZ3VyZSc7XG5pbXBvcnQgSWNvbiBmcm9tICdjaG9lcm9kb24tdWkvbGliL2ljb24nO1xuaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgQ29sdW1uLCB7IENvbHVtblByb3BzLCBjb2x1bW5XaWR0aCB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXQnO1xuaW1wb3J0IFJlY29yZCBmcm9tICcuLi9kYXRhLXNldC9SZWNvcmQnO1xuaW1wb3J0IE9ic2VydmVyQ2hlY2tCb3ggZnJvbSAnLi4vY2hlY2stYm94JztcbmltcG9ydCBPYnNlcnZlclJhZGlvIGZyb20gJy4uL3JhZGlvJztcbmltcG9ydCB7IERhdGFTZXRTZWxlY3Rpb24sIFJlY29yZFN0YXR1cyB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IHtcbiAgQ29sdW1uQWxpZ24sXG4gIENvbHVtbkxvY2ssXG4gIFNlbGVjdGlvbk1vZGUsXG4gIFRhYmxlRWRpdE1vZGUsXG4gIFRhYmxlTW9kZSxcbiAgVGFibGVRdWVyeUJhclR5cGUsXG4gIERyYWdDb2x1bW5BbGlnbixcbiAgQ29sdW1uc0VkaXRUeXBlLFxufSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHsgc3RvcFByb3BhZ2F0aW9uIH0gZnJvbSAnLi4vX3V0aWwvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCB7IGdldENvbHVtbktleSwgZ2V0SGVhZGVyLCByZW9yZGVyaW5nQ29sdW1ucywgbWVyZ2VPYmplY3QgIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgZ2V0UmVhY3ROb2RlVGV4dCBmcm9tICcuLi9fdXRpbC9nZXRSZWFjdE5vZGVUZXh0JztcbmltcG9ydCBDb2x1bW5Hcm91cHMgZnJvbSAnLi9Db2x1bW5Hcm91cHMnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCBDb2x1bW5Hcm91cCBmcm9tICcuL0NvbHVtbkdyb3VwJztcbmltcG9ydCB7IGV4cGFuZEljb25Qcm9wcywgVGFibGVQYWdpbmF0aW9uQ29uZmlnIH0gZnJvbSAnLi9UYWJsZSc7XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RJT05fS0VZID0gJ19fc2VsZWN0aW9uLWNvbHVtbl9fJztcblxuZXhwb3J0IGNvbnN0IERSQUdfS0VZID0gJ19fZHJhZy1jb2x1bW5fXyc7XG5cbmV4cG9ydCBjb25zdCBFWFBBTkRfS0VZID0gJ19fZXhwYW5kLWNvbHVtbl9fJztcblxuZXhwb3J0IHR5cGUgSGVhZGVyVGV4dCA9IHsgbmFtZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyB9O1xuXG5leHBvcnQgY29uc3QgZ2V0SWRMaXN0ID0gKHN0YXJ0SWQ6IG51bWJlciwgZW5kSWQ6IG51bWJlcikgPT4ge1xuICBjb25zdCBpZExpc3Q6IGFueVtdID0gW107XG4gIGNvbnN0IG1pbiA9IE1hdGgubWluKHN0YXJ0SWQsIGVuZElkKTtcbiAgY29uc3QgbWF4ID0gTWF0aC5tYXgoc3RhcnRJZCwgZW5kSWQpO1xuICBmb3IgKGxldCBpID0gbWluOyBpIDw9IG1heDsgaSsrKSB7XG4gICAgaWRMaXN0LnB1c2goaSk7XG4gIH1cbiAgcmV0dXJuIGlkTGlzdDtcbn07XG5cbmZ1bmN0aW9uIHJlbmRlclNlbGVjdGlvbkJveCh7IHJlY29yZCwgc3RvcmUgfTogeyByZWNvcmQ6IGFueSwgc3RvcmU6IFRhYmxlU3RvcmU7IH0pIHtcbiAgY29uc3QgeyBkYXRhU2V0IH0gPSByZWNvcmQ7XG4gIGlmIChkYXRhU2V0KSB7XG4gICAgY29uc3QgeyBzZWxlY3Rpb24gfSA9IGRhdGFTZXQ7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gdmFsdWUgPT4ge1xuICAgICAgaWYgKHN0b3JlLnByb3BzLnNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUubW91c2Vkb3duKSB7XG4gICAgICAgIC8vIOWwhuWkhOeQhumAu+i+keS6pOe7mSBtb3VzZWRvd24g55qE5aSE55CG6YC76L6RIOS4jeeEtuS8muS4pOasoeinpuWPkeWvvOiHtOS4jeiiq+WLvumAieS4ilxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZGF0YVNldC5zZWxlY3QocmVjb3JkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFTZXQudW5TZWxlY3QocmVjb3JkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgaGFuZGxlQ2xpY2sgPSBlID0+IHtcbiAgICAgIHN0b3BQcm9wYWdhdGlvbihlKTtcbiAgICAgIGlmIChyZWNvcmQuaXNTZWxlY3RlZCkge1xuICAgICAgICBkYXRhU2V0LnVuU2VsZWN0KHJlY29yZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZU1vdXNlRG93biA9ICgpID0+IHtcbiAgICAgIGlmIChzdG9yZS51c2VNb3VzZUJhdGNoQ2hvb3NlKSB7XG4gICAgICAgIHN0b3JlLm1vdXNlQmF0Y2hDaG9vc2VTdGFydElkID0gcmVjb3JkLmlkO1xuICAgICAgICBzdG9yZS5tb3VzZUJhdGNoQ2hvb3NlRW5kSWQgPSByZWNvcmQuaWQ7XG4gICAgICAgIHN0b3JlLm1vdXNlQmF0Y2hDaG9vc2VTdGF0ZSA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZU1vdXNlRW50ZXIgPSAoKSA9PiB7XG4gICAgICBpZiAoc3RvcmUudXNlTW91c2VCYXRjaENob29zZSAmJiBzdG9yZS5tb3VzZUJhdGNoQ2hvb3NlU3RhdGUpIHtcbiAgICAgICAgc3RvcmUubW91c2VCYXRjaENob29zZUVuZElkID0gcmVjb3JkLmlkO1xuICAgICAgICBzdG9yZS5jaGFuZ2VNb3VzZUJhdGNoQ2hvb3NlSWRMaXN0KGdldElkTGlzdChzdG9yZS5tb3VzZUJhdGNoQ2hvb3NlU3RhcnRJZCwgc3RvcmUubW91c2VCYXRjaENob29zZUVuZElkKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzZWxlY3Rpb24gPT09IERhdGFTZXRTZWxlY3Rpb24ubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxPYnNlcnZlckNoZWNrQm94XG4gICAgICAgICAgY2hlY2tlZD17cmVjb3JkLmlzU2VsZWN0ZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgICBvbkNsaWNrPXtzdG9wUHJvcGFnYXRpb259XG4gICAgICAgICAgb25Nb3VzZURvd249e2hhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgICBvbk1vdXNlRW50ZXI9e2hhbmRsZU1vdXNlRW50ZXJ9XG4gICAgICAgICAgZGlzYWJsZWQ9eyFyZWNvcmQuc2VsZWN0YWJsZX1cbiAgICAgICAgICB2YWx1ZVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHNlbGVjdGlvbiA9PT0gRGF0YVNldFNlbGVjdGlvbi5zaW5nbGUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxPYnNlcnZlclJhZGlvXG4gICAgICAgICAgY2hlY2tlZD17cmVjb3JkLmlzU2VsZWN0ZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbGlja31cbiAgICAgICAgICBvbk1vdXNlRG93bj17aGFuZGxlTW91c2VEb3dufVxuICAgICAgICAgIG9uTW91c2VFbnRlcj17aGFuZGxlTW91c2VFbnRlcn1cbiAgICAgICAgICBkaXNhYmxlZD17IXJlY29yZC5zZWxlY3RhYmxlfVxuICAgICAgICAgIHZhbHVlXG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRQcm9wcyhjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdLGNvbHVtbnNNZXJnZUNvdmVyYWdlPzpDb2x1bW5Qcm9wc1tdLGRlZmF1bHRLZXk6IG51bWJlcltdID0gWzBdKTogQ29sdW1uUHJvcHNbXSB7XG4gIGNvbnN0IGNvbHVtbnNOZXc6IGFueVtdID0gW107XG4gIGNvbnN0IGxlZnRGaXhlZENvbHVtbnM6IGFueVtdID0gW107XG4gIGNvbnN0IHJpZ2h0Rml4ZWRDb2x1bW5zOiBhbnlbXSA9IFtdO1xuICBjb2x1bW5zLmZvckVhY2goKGNvbHVtbjogQ29sdW1uUHJvcHMpID0+IHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChjb2x1bW4pKSB7XG4gICAgICBsZXQgbmV3Q29sdW1uOiBDb2x1bW5Qcm9wcyA9IHsgLi4uQ29sdW1uLmRlZmF1bHRQcm9wcywgLi4uY29sdW1uIH07XG4gICAgICBpZiAoaXNOaWwoZ2V0Q29sdW1uS2V5KG5ld0NvbHVtbikpKSB7XG4gICAgICAgIG5ld0NvbHVtbi5rZXkgPSBgYW5vbnltb3VzLSR7ZGVmYXVsdEtleVswXSsrfWA7XG4gICAgICB9XG4gICAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSBuZXdDb2x1bW47XG4gICAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgICAgbmV3Q29sdW1uLmNoaWxkcmVuID0gbWVyZ2VEZWZhdWx0UHJvcHMoY2hpbGRyZW4sY29sdW1uc01lcmdlQ292ZXJhZ2UsZGVmYXVsdEtleSk7XG4gICAgICB9XG4gICAgICAvLyBUT0RPIOWQjue7reWPr+S7peWKoGtleVxuICAgICAgaWYoY29sdW1uc01lcmdlQ292ZXJhZ2UgJiYgY29sdW1uc01lcmdlQ292ZXJhZ2UubGVuZ3RoID4gMCl7XG4gICAgICAgIGNvbnN0IG1lcmdlSXRlbSA9IGNvbHVtbnNNZXJnZUNvdmVyYWdlLmZpbmQoY29sdW1uSXRlbSA9PiBjb2x1bW5JdGVtLm5hbWUgPT09IGNvbHVtbi5uYW1lKVxuICAgICAgICBpZihtZXJnZUl0ZW0pe1xuICAgICAgICAgIG5ld0NvbHVtbiA9IG1lcmdlT2JqZWN0KFsnaGVhZGVyJ10sbWVyZ2VJdGVtLGNvbHVtbilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5ld0NvbHVtbi5sb2NrID09PSBDb2x1bW5Mb2NrLmxlZnQgfHwgbmV3Q29sdW1uLmxvY2sgPT09IHRydWUpIHtcbiAgICAgICAgbGVmdEZpeGVkQ29sdW1ucy5wdXNoKG5ld0NvbHVtbik7XG4gICAgICB9IGVsc2UgaWYgKG5ld0NvbHVtbi5sb2NrID09PSBDb2x1bW5Mb2NrLnJpZ2h0KSB7XG4gICAgICAgIHJpZ2h0Rml4ZWRDb2x1bW5zLnB1c2gobmV3Q29sdW1uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbHVtbnNOZXcucHVzaChuZXdDb2x1bW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsZWZ0Rml4ZWRDb2x1bW5zLmNvbmNhdChjb2x1bW5zTmV3LCByaWdodEZpeGVkQ29sdW1ucyk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbHVtbnMoXG4gIGVsZW1lbnRzOiBSZWFjdE5vZGUsXG4gIGNvbHVtbnNNZXJnZUNvdmVyYWdlPzpDb2x1bW5Qcm9wc1tdLFxuICBwYXJlbnQ6IENvbHVtblByb3BzIHwgbnVsbCA9IG51bGwsXG4gIGRlZmF1bHRLZXk6IG51bWJlcltdID0gWzBdLFxuKSB7XG4gIGNvbnN0IGNvbHVtbnM6IGFueVtdID0gW107XG4gIGNvbnN0IGxlZnRGaXhlZENvbHVtbnM6IGFueVtdID0gW107XG4gIGNvbnN0IHJpZ2h0Rml4ZWRDb2x1bW5zOiBhbnlbXSA9IFtdO1xuICBDaGlsZHJlbi5mb3JFYWNoKGVsZW1lbnRzLCBlbGVtZW50ID0+IHtcbiAgICBpZiAoIWlzVmFsaWRFbGVtZW50KGVsZW1lbnQpIHx8IGVsZW1lbnQudHlwZSAhPT0gQ29sdW1uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHsgcHJvcHMsIGtleSB9ID0gZWxlbWVudDtcbiAgICBsZXQgY29sdW1uOiBhbnkgPSB7XG4gICAgICAuLi5wcm9wcyxcbiAgICB9O1xuICAgIGlmIChpc05pbChnZXRDb2x1bW5LZXkoY29sdW1uKSkpIHtcbiAgICAgIGNvbHVtbi5rZXkgPSBgYW5vbnltb3VzLSR7ZGVmYXVsdEtleVswXSsrfWA7XG4gICAgfVxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIGNvbHVtbi5sb2NrID0gcGFyZW50LmxvY2s7XG4gICAgfVxuICAgIGNvbHVtbi5jaGlsZHJlbiA9IG5vcm1hbGl6ZUNvbHVtbnMoY29sdW1uLmNoaWxkcmVuLGNvbHVtbnNNZXJnZUNvdmVyYWdlLCBjb2x1bW4sIGRlZmF1bHRLZXkpO1xuICAgIGlmIChrZXkpIHtcbiAgICAgIGNvbHVtbi5rZXkgPSBrZXk7XG4gICAgfVxuICAgIC8vIOWQjue7reWPr+S7peWKoGtleVxuICAgIGlmKGNvbHVtbnNNZXJnZUNvdmVyYWdlICYmIGNvbHVtbnNNZXJnZUNvdmVyYWdlLmxlbmd0aCA+IDApe1xuICAgICBjb25zdCBtZXJnZUl0ZW0gPSBjb2x1bW5zTWVyZ2VDb3ZlcmFnZS5maW5kKGNvbHVtbkl0ZW0gPT4gY29sdW1uSXRlbS5uYW1lID09PSBjb2x1bW4ubmFtZSlcbiAgICAgaWYobWVyZ2VJdGVtKXtcbiAgICAgIGNvbHVtbiA9IG1lcmdlT2JqZWN0KFsnaGVhZGVyJ10sbWVyZ2VJdGVtLGNvbHVtbilcbiAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2x1bW4ubG9jayA9PT0gQ29sdW1uTG9jay5sZWZ0IHx8IGNvbHVtbi5sb2NrID09PSB0cnVlKSB7XG4gICAgICBsZWZ0Rml4ZWRDb2x1bW5zLnB1c2goY29sdW1uKTtcbiAgICB9IGVsc2UgaWYgKGNvbHVtbi5sb2NrID09PSBDb2x1bW5Mb2NrLnJpZ2h0KSB7XG4gICAgICByaWdodEZpeGVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbHVtbnMucHVzaChjb2x1bW4pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsZWZ0Rml4ZWRDb2x1bW5zLmNvbmNhdChjb2x1bW5zLCByaWdodEZpeGVkQ29sdW1ucyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEhlYWRlclRleHRzKFxuICBkYXRhU2V0OiBEYXRhU2V0LFxuICBjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdLFxuICBoZWFkZXJzOiBIZWFkZXJUZXh0W10gPSBbXSxcbik6IFByb21pc2U8SGVhZGVyVGV4dFtdPiB7XG4gIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnMuc2hpZnQoKTtcbiAgaWYgKGNvbHVtbikge1xuICAgIGhlYWRlcnMucHVzaCh7IG5hbWU6IGNvbHVtbi5uYW1lISwgbGFiZWw6IGF3YWl0IGdldFJlYWN0Tm9kZVRleHQoZ2V0SGVhZGVyKGNvbHVtbiwgZGF0YVNldCkpIH0pO1xuICB9XG4gIGlmIChjb2x1bW5zLmxlbmd0aCkge1xuICAgIGF3YWl0IGdldEhlYWRlclRleHRzKGRhdGFTZXQsIGNvbHVtbnMsIGhlYWRlcnMpO1xuICB9XG4gIHJldHVybiBoZWFkZXJzO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZVN0b3JlIHtcbiAgbm9kZTogYW55O1xuXG4gIEBvYnNlcnZhYmxlIHByb3BzOiBhbnk7XG5cbiAgQG9ic2VydmFibGUgYm9keUhlaWdodDogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIHdpZHRoPzogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIGhlaWdodD86IG51bWJlcjtcblxuICBAb2JzZXJ2YWJsZSBsYXN0U2Nyb2xsVG9wPzogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIGxvY2tDb2x1bW5zQm9keVJvd3NIZWlnaHQ6IGFueTtcblxuICBAb2JzZXJ2YWJsZSBsb2NrQ29sdW1uc0Zvb3RSb3dzSGVpZ2h0OiBhbnk7XG5cbiAgQG9ic2VydmFibGUgbG9ja0NvbHVtbnNIZWFkUm93c0hlaWdodDogYW55O1xuXG4gIEBvYnNlcnZhYmxlIGV4cGFuZGVkUm93czogKHN0cmluZyB8IG51bWJlcilbXTtcblxuICBAb2JzZXJ2YWJsZSBob3ZlclJvdz86IFJlY29yZDtcblxuICBAb2JzZXJ2YWJsZSBjdXJyZW50RWRpdG9yTmFtZT86IHN0cmluZztcblxuICBAb2JzZXJ2YWJsZSBzdHlsZWRIaWRkZW4/OiBib29sZWFuO1xuXG4gIG1vdXNlQmF0Y2hDaG9vc2VTdGFydElkOiBudW1iZXIgPSAwO1xuXG4gIG1vdXNlQmF0Y2hDaG9vc2VFbmRJZDogbnVtYmVyID0gMDtcblxuICBtb3VzZUJhdGNoQ2hvb3NlU3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBAb2JzZXJ2YWJsZSBtb3VzZUJhdGNoQ2hvb3NlSWRMaXN0PzogbnVtYmVyW107XG5cbiAgQG9ic2VydmFibGUgY29sdW1uRGVlcDogbnVtYmVyO1xuXG4gIFxuICBAY29tcHV0ZWRcbiAgZ2V0IGRhdGFTZXQoKTogRGF0YVNldCB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGF0YVNldDtcbiAgfVxuXG4gIGdldCBoaWRkZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5zdHlsZWRIaWRkZW4gfHwgdGhpcy5wcm9wcy5oaWRkZW47XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGFsd2F5c1Nob3dSb3dCb3goKTogYm9vbGVhbiB7XG4gICAgaWYgKCdhbHdheXNTaG93Um93Qm94JyBpbiB0aGlzLnByb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5hbHdheXNTaG93Um93Qm94O1xuICAgIH1cbiAgICBjb25zdCBhbHdheXNTaG93Um93Qm94ID0gZ2V0Q29uZmlnKCd0YWJsZUFsd2F5c1Nob3dSb3dCb3gnKTtcbiAgICBpZiAodHlwZW9mIGFsd2F5c1Nob3dSb3dCb3ggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gYWx3YXlzU2hvd1Jvd0JveDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjb2x1bW5SZXNpemFibGUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuY3VycmVudEVkaXRSZWNvcmQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCdjb2x1bW5SZXNpemFibGUnIGluIHRoaXMucHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmNvbHVtblJlc2l6YWJsZTtcbiAgICB9XG4gICAgaWYgKGdldENvbmZpZygndGFibGVDb2x1bW5SZXNpemFibGUnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBhZ2luYXRpb24oKTogVGFibGVQYWdpbmF0aW9uQ29uZmlnIHwgZmFsc2UgfCB1bmRlZmluZWQge1xuICAgIGlmICgncGFnaW5hdGlvbicgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucGFnaW5hdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbmZpZygncGFnaW5hdGlvbicpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkcmFnQ29sdW1uQWxpZ24oKTpEcmFnQ29sdW1uQWxpZ24gfCB1bmRlZmluZWQge1xuICAgIGlmKCdkcmFnQ29sdW1uQWxpZ24nIGluIHRoaXMucHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmRyYWdDb2x1bW5BbGlnbjtcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbmZpZygndGFibGVEcmFnQ29sdW1uQWxpZ24nKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZHJhZ0NvbHVtbigpOmJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIGlmKHRoaXMuY29sdW1uTWF4RGVlcCA+IDEpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZignZHJhZ0NvbHVtbicgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZHJhZ0NvbHVtbjtcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbmZpZygndGFibGVEcmFnQ29sdW1uJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGRyYWdSb3coKTpib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodGhpcy5pc1RyZWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYoJ2RyYWdSb3cnIGluIHRoaXMucHJvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLmRyYWdSb3c7XG4gICAgfVxuICAgIHJldHVybiBnZXRDb25maWcoJ3RhYmxlRHJhZ1JvdycpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCByb3dIZWlnaHQoKTogJ2F1dG8nIHwgbnVtYmVyIHtcbiAgICBpZiAoJ3Jvd0hlaWdodCcgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMucm93SGVpZ2h0O1xuICAgIH1cbiAgICBjb25zdCByb3dIZWlnaHQgPSBnZXRDb25maWcoJ3RhYmxlUm93SGVpZ2h0Jyk7XG4gICAgaWYgKHR5cGVvZiByb3dIZWlnaHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gcm93SGVpZ2h0O1xuICAgIH1cbiAgICByZXR1cm4gMzA7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGVtcHR5VGV4dCgpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiBnZXRDb25maWcoJ3JlbmRlckVtcHR5JykoJ1RhYmxlJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGhpZ2hMaWdodFJvdygpOiBib29sZWFuIHtcbiAgICBpZiAoJ2hpZ2hMaWdodFJvdycgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuaGlnaExpZ2h0Um93O1xuICAgIH1cbiAgICBpZiAoZ2V0Q29uZmlnKCd0YWJsZUhpZ2hMaWdodFJvdycpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgc2VsZWN0ZWRIaWdoTGlnaHRSb3coKTogYm9vbGVhbiB7XG4gICAgaWYgKCdzZWxlY3RlZEhpZ2hMaWdodFJvdycgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuc2VsZWN0ZWRIaWdoTGlnaHRSb3c7XG4gICAgfVxuICAgIGlmIChnZXRDb25maWcoJ3RhYmxlU2VsZWN0ZWRIaWdoTGlnaHRSb3cnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGVkaXRvck5leHRLZXlFbnRlckRvd24oKTogYm9vbGVhbiB7XG4gICAgaWYgKCdlZGl0b3JOZXh0S2V5RW50ZXJEb3duJyBpbiB0aGlzLnByb3BzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5lZGl0b3JOZXh0S2V5RW50ZXJEb3duO1xuICAgIH1cbiAgICBpZiAoZ2V0Q29uZmlnKCd0YWJsZUVkaXRvck5leHRLZXlFbnRlckRvd24nKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGJvcmRlcigpOiBib29sZWFuIHtcbiAgICBpZiAoJ2JvcmRlcicgaW4gdGhpcy5wcm9wcykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuYm9yZGVyO1xuICAgIH1cbiAgICBpZiAoZ2V0Q29uZmlnKCd0YWJsZUJvcmRlcicpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcXVlcnlCYXIoKTogVGFibGVRdWVyeUJhclR5cGUge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnF1ZXJ5QmFyIHx8IGdldENvbmZpZygncXVlcnlCYXInKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZXhwYW5kSWNvbigpOiAocHJvcHM6IGV4cGFuZEljb25Qcm9wcykgPT4gUmVhY3ROb2RlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5leHBhbmRJY29uIHx8IGdldENvbmZpZygndGFibGVFeHBhbmRJY29uJyk7XG4gIH1cblxuICBnZXQgcHJpc3RpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMucHJpc3RpbmU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGN1cnJlbnRFZGl0UmVjb3JkKCk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVNldC5maW5kKHJlY29yZCA9PiByZWNvcmQuZWRpdGluZyA9PT0gdHJ1ZSk7XG4gIH1cblxuICBzZXQgY3VycmVudEVkaXRSZWNvcmQocmVjb3JkOiBSZWNvcmQgfCB1bmRlZmluZWQpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCB7IGN1cnJlbnRFZGl0UmVjb3JkLCBkYXRhU2V0IH0gPSB0aGlzO1xuICAgICAgaWYgKGN1cnJlbnRFZGl0UmVjb3JkKSB7XG4gICAgICAgIGlmIChjdXJyZW50RWRpdFJlY29yZC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgICAgICBkYXRhU2V0LnJlbW92ZShjdXJyZW50RWRpdFJlY29yZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3VycmVudEVkaXRSZWNvcmQucmVzZXQoKTtcbiAgICAgICAgICBjdXJyZW50RWRpdFJlY29yZC5lZGl0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgZGVmZXIoYWN0aW9uKCgpID0+IChyZWNvcmQuZWRpdGluZyA9IHRydWUpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBAb2JzZXJ2YWJsZSBzaG93Q2FjaGVkU2VsZXRpb24/OiBib29sZWFuO1xuXG4gIGdldCBpc1RyZWUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubW9kZSA9PT0gVGFibGVNb2RlLnRyZWU7XG4gIH1cblxuICBnZXQgZWRpdGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RWRpdG9yTmFtZSAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuY3VycmVudEVkaXRSZWNvcmQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaGFzUm93Qm94KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgZGF0YVNldCwgc2VsZWN0aW9uTW9kZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IGFsd2F5c1Nob3dSb3dCb3ggfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSBkYXRhU2V0O1xuICAgICAgcmV0dXJuIHNlbGVjdGlvbiAmJiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5yb3dib3ggfHwgYWx3YXlzU2hvd1Jvd0JveCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdXNlTW91c2VCYXRjaENob29zZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHVzZU1vdXNlQmF0Y2hDaG9vc2UgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHVzZU1vdXNlQmF0Y2hDaG9vc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVzZU1vdXNlQmF0Y2hDaG9vc2U7XG4gICAgfVxuICAgIGlmIChnZXRDb25maWcoJ3RhYmxlVXNlTW91c2VCYXRjaENob29zZScpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBnZXRDb25maWcoJ3RhYmxlVXNlTW91c2VCYXRjaENob29zZScpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IG92ZXJmbG93WCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy53aWR0aCkge1xuICAgICAgcmV0dXJuIHRoaXMudG90YWxMZWFmQ29sdW1uc1dpZHRoID4gdGhpcy53aWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBvdmVyZmxvd1koKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBib2R5SGVpZ2h0LCBoZWlnaHQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChcbiAgICAgIGJvZHlIZWlnaHQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgaGVpZ2h0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIGhlaWdodCA8IGJvZHlIZWlnaHQgKyAodGhpcy5vdmVyZmxvd1ggPyBtZWFzdXJlU2Nyb2xsYmFyKCkgOiAwKVxuICAgICk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGNvbHVtbnMoKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgY29uc3QgeyBjb2x1bW5zTWVyZ2VDb3ZlcmFnZSB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgeyBjb2x1bW5zLCBjaGlsZHJlbiB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodGhpcy5oZWFkZXJzT2RlcmFibGUpIHtcbiAgICAgIGlmIChjb2x1bW5zTWVyZ2VDb3ZlcmFnZSAmJiBjb2x1bW5zKSB7XG4gICAgICAgIGNvbHVtbnMgPSByZW9yZGVyaW5nQ29sdW1ucyhjb2x1bW5zTWVyZ2VDb3ZlcmFnZSwgY29sdW1ucylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkcmVuID0gcmVvcmRlcmluZ0NvbHVtbnMoY29sdW1uc01lcmdlQ292ZXJhZ2UsIGNoaWxkcmVuKVxuICAgICAgfVxuICAgIH1cbiAgICAvLyDliIblvIDlpITnkIblj6/ku6Xmu6HotrPkuo7lj6rkv67mlLnooajlpLTkv6Hmga/lnLrmma/kuI3mlLnlj5jpobrluo8gXG4gICAgcmV0dXJuIG9ic2VydmFibGUuYXJyYXkoXG4gICAgICB0aGlzLmFkZEV4cGFuZENvbHVtbihcbiAgICAgICAgdGhpcy5hZGREcmFnQ29sdW1uKHRoaXMuYWRkU2VsZWN0aW9uQ29sdW1uKGNvbHVtbnNcbiAgICAgICAgICA/IG1lcmdlRGVmYXVsdFByb3BzKGNvbHVtbnMsIHRoaXMuaGVhZGVyc0VkaXRhYmxlXG4gICAgICAgICAgICA/IGNvbHVtbnNNZXJnZUNvdmVyYWdlXG4gICAgICAgICAgICA6IHVuZGVmaW5lZClcbiAgICAgICAgICA6IG5vcm1hbGl6ZUNvbHVtbnMoY2hpbGRyZW4sIHRoaXMuaGVhZGVyc0VkaXRhYmxlXG4gICAgICAgICAgICA/IGNvbHVtbnNNZXJnZUNvdmVyYWdlIDpcbiAgICAgICAgICAgIHVuZGVmaW5lZCksXG4gICAgICAgICkpLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgc2V0IGNvbHVtbnMoY29sdW1uczogQ29sdW1uUHJvcHNbXSkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHNldCh0aGlzLnByb3BzLCAnY29sdW1ucycsIGNvbHVtbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOihqOWktOaUr+aMgee8lui+kVxuICAgKi9cbiAgQGNvbXB1dGVkIFxuICBnZXQgaGVhZGVyc0VkaXRhYmxlICgpe1xuICAgIHJldHVybiAodGhpcy5wcm9wcy5jb2x1bW5zRWRpdFR5cGUgPT09IENvbHVtbnNFZGl0VHlwZS5oZWFkZXIgfHwgdGhpcy5wcm9wcy5jb2x1bW5zRWRpdFR5cGUgPT09IENvbHVtbnNFZGl0VHlwZS5hbGwpICYmICEhdGhpcy5wcm9wcy5jb2x1bW5zTWVyZ2VDb3ZlcmFnZVxuICB9XG5cbiAgLyoqXG4gICAqIOihqOWktOaUr+aMgeaOkuW6j1xuICAgKi9cbiAgQGNvbXB1dGVkIFxuICBnZXQgaGVhZGVyc09kZXJhYmxlICgpe1xuICAgIHJldHVybiAodGhpcy5wcm9wcy5jb2x1bW5zRWRpdFR5cGUgPT09IENvbHVtbnNFZGl0VHlwZS5vcmRlciB8fCB0aGlzLnByb3BzLmNvbHVtbnNFZGl0VHlwZSA9PT0gQ29sdW1uc0VkaXRUeXBlLmFsbCkgJiYgISF0aGlzLnByb3BzLmNvbHVtbnNNZXJnZUNvdmVyYWdlXG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGxlZnRDb2x1bW5zKCk6IENvbHVtblByb3BzW10ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuZmlsdGVyKGNvbHVtbiA9PiBjb2x1bW4ubG9jayA9PT0gQ29sdW1uTG9jay5sZWZ0IHx8IGNvbHVtbi5sb2NrID09PSB0cnVlKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcmlnaHRDb2x1bW5zKCk6IENvbHVtblByb3BzW10ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuZmlsdGVyKGNvbHVtbiA9PiBjb2x1bW4ubG9jayA9PT0gQ29sdW1uTG9jay5yaWdodCk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGNvbHVtbkdyb3VwcygpOiBDb2x1bW5Hcm91cHMge1xuICAgIHJldHVybiBuZXcgQ29sdW1uR3JvdXBzKHRoaXMuY29sdW1ucyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGdyb3VwZWRDb2x1bW5zKCk6IENvbHVtbkdyb3VwW10ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbkdyb3Vwcy5jb2x1bW5zO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsZWZ0R3JvdXBlZENvbHVtbnMoKTogQ29sdW1uR3JvdXBbXSB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXBlZENvbHVtbnMuZmlsdGVyKFxuICAgICAgKHsgY29sdW1uOiB7IGxvY2sgfSB9KSA9PiBsb2NrID09PSBDb2x1bW5Mb2NrLmxlZnQgfHwgbG9jayA9PT0gdHJ1ZSxcbiAgICApO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCByaWdodEdyb3VwZWRDb2x1bW5zKCk6IENvbHVtbkdyb3VwW10ge1xuICAgIHJldHVybiB0aGlzLmdyb3VwZWRDb2x1bW5zLmZpbHRlcigoeyBjb2x1bW46IHsgbG9jayB9IH0pID0+IGxvY2sgPT09IENvbHVtbkxvY2sucmlnaHQpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsZWFmQ29sdW1ucygpOiBDb2x1bW5Qcm9wc1tdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMZWFmQ29sdW1ucyh0aGlzLmNvbHVtbnMpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsZWZ0TGVhZkNvbHVtbnMoKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVhZkNvbHVtbnModGhpcy5sZWZ0Q29sdW1ucyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHJpZ2h0TGVhZkNvbHVtbnMoKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVhZkNvbHVtbnModGhpcy5yaWdodENvbHVtbnMpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsZWFmTmFtZWRDb2x1bW5zKCk6IENvbHVtblByb3BzW10ge1xuICAgIHJldHVybiB0aGlzLmxlYWZDb2x1bW5zLmZpbHRlcihjb2x1bW4gPT4gISFjb2x1bW4ubmFtZSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHRvdGFsTGVhZkNvbHVtbnNXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmxlYWZDb2x1bW5zLnJlZHVjZSgodG90YWwsIGNvbHVtbikgPT4gdG90YWwgKyBjb2x1bW5XaWR0aChjb2x1bW4pLCAwKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbGVmdExlYWZDb2x1bW5zV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5sZWZ0TGVhZkNvbHVtbnMucmVkdWNlKCh0b3RhbCwgY29sdW1uKSA9PiB0b3RhbCArIGNvbHVtbldpZHRoKGNvbHVtbiksIDApO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCByaWdodExlYWZDb2x1bW5zV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yaWdodExlYWZDb2x1bW5zLnJlZHVjZSgodG90YWwsIGNvbHVtbikgPT4gdG90YWwgKyBjb2x1bW5XaWR0aChjb2x1bW4pLCAwKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaGFzQ2hlY2tGaWVsZENvbHVtbigpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGNoZWNrRmllbGQgfSA9IHRoaXMuZGF0YVNldC5wcm9wcztcbiAgICByZXR1cm4gdGhpcy5sZWFmQ29sdW1ucy5zb21lKCh7IG5hbWUsIGVkaXRvciB9KSA9PiAhIWVkaXRvciAmJiBjaGVja0ZpZWxkID09PSBuYW1lKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaGFzRm9vdGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlYWZDb2x1bW5zLnNvbWUoY29sdW1uID0+ICEhY29sdW1uLmZvb3RlciAmJiBjb2x1bW4ua2V5ICE9PSBTRUxFQ1RJT05fS0VZKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaXNBbnlDb2x1bW5zUmVzaXphYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlYWZDb2x1bW5zLnNvbWUoY29sdW1uID0+IGNvbHVtbi5yZXNpemFibGUgPT09IHRydWUpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBpc0FueUNvbHVtbnNMb2NrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuc29tZShjb2x1bW4gPT4gISFjb2x1bW4ubG9jayk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzQW55Q29sdW1uc0xlZnRMb2NrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuc29tZShjb2x1bW4gPT4gY29sdW1uLmxvY2sgPT09IENvbHVtbkxvY2subGVmdCB8fCBjb2x1bW4ubG9jayA9PT0gdHJ1ZSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzQW55Q29sdW1uc1JpZ2h0TG9jaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb2x1bW5zLnNvbWUoY29sdW1uID0+IGNvbHVtbi5sb2NrID09PSBDb2x1bW5Mb2NrLnJpZ2h0KTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZGF0YSgpOiBSZWNvcmRbXSB7XG4gICAgY29uc3QgeyBmaWx0ZXIsIHByaXN0aW5lIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgZGF0YVNldCwgaXNUcmVlLCBzaG93Q2FjaGVkU2VsZXRpb24gfSA9IHRoaXM7XG4gICAgbGV0IGRhdGEgPSBpc1RyZWUgPyBkYXRhU2V0LnRyZWVSZWNvcmRzIDogZGF0YVNldC5yZWNvcmRzO1xuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkYXRhID0gZGF0YS5maWx0ZXIoZmlsdGVyKTtcbiAgICB9XG4gICAgaWYgKHByaXN0aW5lKSB7XG4gICAgICBkYXRhID0gZGF0YS5maWx0ZXIocmVjb3JkID0+IHJlY29yZC5zdGF0dXMgIT09IFJlY29yZFN0YXR1cy5hZGQpO1xuICAgIH1cbiAgICBpZiAoc2hvd0NhY2hlZFNlbGV0aW9uKSB7XG4gICAgICByZXR1cm4gWy4uLmRhdGFTZXQuY2FjaGVkU2VsZWN0ZWQsIC4uLmRhdGFdO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaW5kZXRlcm1pbmF0ZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGRhdGFTZXQsIHNob3dDYWNoZWRTZWxldGlvbiB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgY29uc3QgeyBsZW5ndGggfSA9IGRhdGFTZXQucmVjb3Jkcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZC5zZWxlY3RhYmxlKTtcbiAgICAgIGNvbnN0IHNlbGVjdGVkTGVuZ3RoID0gc2hvd0NhY2hlZFNlbGV0aW9uXG4gICAgICAgID8gZGF0YVNldC5zZWxlY3RlZC5sZW5ndGhcbiAgICAgICAgOiBkYXRhU2V0LmN1cnJlbnRTZWxlY3RlZC5sZW5ndGg7XG4gICAgICByZXR1cm4gISFzZWxlY3RlZExlbmd0aCAmJiBzZWxlY3RlZExlbmd0aCAhPT0gbGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGFsbENoZWNrZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBkYXRhU2V0LCBzaG93Q2FjaGVkU2VsZXRpb24gfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBkYXRhU2V0LnJlY29yZHMuZmlsdGVyKHJlY29yZCA9PiByZWNvcmQuc2VsZWN0YWJsZSk7XG4gICAgICBjb25zdCBzZWxlY3RlZExlbmd0aCA9IHNob3dDYWNoZWRTZWxldGlvblxuICAgICAgICA/IGRhdGFTZXQuc2VsZWN0ZWQubGVuZ3RoXG4gICAgICAgIDogZGF0YVNldC5jdXJyZW50U2VsZWN0ZWQubGVuZ3RoO1xuICAgICAgcmV0dXJuICEhc2VsZWN0ZWRMZW5ndGggJiYgc2VsZWN0ZWRMZW5ndGggPT09IGxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBleHBhbmRJY29uQXNDZWxsKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgZXhwYW5kZWRSb3dSZW5kZXJlciB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gISFleHBhbmRlZFJvd1JlbmRlcmVyICYmICF0aGlzLmlzVHJlZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZXhwYW5kSWNvbkNvbHVtbkluZGV4KCk6IG51bWJlciB7XG4gICAgY29uc3Qge1xuICAgICAgZXhwYW5kSWNvbkFzQ2VsbCxcbiAgICAgIHByb3BzOiB7IGV4cGFuZEljb25Db2x1bW5JbmRleCA9IDAgfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoZXhwYW5kSWNvbkFzQ2VsbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmICh0aGlzLmhhc1Jvd0JveCkge1xuICAgICAgcmV0dXJuIGV4cGFuZEljb25Db2x1bW5JbmRleCArIDE7XG4gICAgfVxuICAgIHJldHVybiBleHBhbmRJY29uQ29sdW1uSW5kZXg7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlubGluZUVkaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZWRpdE1vZGUgPT09IFRhYmxlRWRpdE1vZGUuaW5saW5lO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjb2x1bW5NYXhEZWVwKCkge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbkRlZXA7XG4gIH1cblxuICBzZXQgY29sdW1uTWF4RGVlcChkZWVwOiBudW1iZXIpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLmNvbHVtbkRlZXAgPSBNYXRoLm1heCh0aGlzLmNvbHVtbkRlZXAsIGRlZXApO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVTZWxlY3RBbGxDaGFuZ2UgPSBhY3Rpb24odmFsdWUgPT4ge1xuICAgIGNvbnN0IHsgZGF0YVNldCwgZmlsdGVyIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgZGF0YVNldC5zZWxlY3RBbGwoZmlsdGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YVNldC51blNlbGVjdEFsbCgpO1xuICAgICAgaWYgKHRoaXMuc2hvd0NhY2hlZFNlbGV0aW9uKSB7XG4gICAgICAgIGRhdGFTZXQuY2xlYXJDYWNoZWRTZWxlY3RlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuc2hvd0NhY2hlZFNlbGV0aW9uID0gZmFsc2U7XG4gICAgICB0aGlzLmxvY2tDb2x1bW5zSGVhZFJvd3NIZWlnaHQgPSB7fTtcbiAgICAgIHRoaXMubG9ja0NvbHVtbnNCb2R5Um93c0hlaWdodCA9IHt9O1xuICAgICAgdGhpcy5sb2NrQ29sdW1uc0Zvb3RSb3dzSGVpZ2h0ID0ge307XG4gICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgdGhpcy5leHBhbmRlZFJvd3MgPSBbXTtcbiAgICAgIHRoaXMuY29sdW1uRGVlcCA9IDA7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRQcm9wcyhub2RlLnByb3BzKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbHVtbkhlYWRlcnMoKTogUHJvbWlzZTxIZWFkZXJUZXh0W10+IHtcbiAgICBjb25zdCB7IGxlYWZOYW1lZENvbHVtbnMsIGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGdldEhlYWRlclRleHRzKGRhdGFTZXQsIGxlYWZOYW1lZENvbHVtbnMuc2xpY2UoKSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNob3dFZGl0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50RWRpdG9yTmFtZSA9IG5hbWU7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldExhc3RTY3JvbGxUb3AobGFzdFNjcm9sbFRvcDogbnVtYmVyKSB7XG4gICAgdGhpcy5sYXN0U2Nyb2xsVG9wID0gbGFzdFNjcm9sbFRvcDtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgaGlkZUVkaXRvcigpIHtcbiAgICB0aGlzLmN1cnJlbnRFZGl0b3JOYW1lID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgQGFjdGlvblxuICBjaGFuZ2VNb3VzZUJhdGNoQ2hvb3NlSWRMaXN0KGlkTGlzdDogbnVtYmVyW10pIHtcbiAgICB0aGlzLm1vdXNlQmF0Y2hDaG9vc2VJZExpc3QgPSBpZExpc3Q7XG4gIH1cblxuICBzaG93TmV4dEVkaXRvcihuYW1lOiBzdHJpbmcsIHJlc2VydmU6IGJvb2xlYW4pIHtcbiAgICBpZiAocmVzZXJ2ZSkge1xuICAgICAgdGhpcy5kYXRhU2V0LnByZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRhdGFTZXQubmV4dCgpO1xuICAgIH1cbiAgICB0aGlzLnNob3dFZGl0b3IobmFtZSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldFByb3BzKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICB9XG5cbiAgaXNSb3dFeHBhbmRlZChyZWNvcmQ6IFJlY29yZCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgcGFyZW50IH0gPSByZWNvcmQ7XG4gICAgLy8g5aaC5p6cIOWtmOWcqGV4cGFuZEZpbGVkIOeEtuWQjui/meS4qiByZWNvcmQg6KKr5qCH6K6w5Li65bGV5byAIOaIluiAhSDog73lnKjlrZjlgqjnmoTlt7Lnu4/lsZXlvIDliJfkuK3mib7liLAg6YKj5LmI5a6D5Li65bey57uP5bGV5byAXG4gICAgLy8g5omA5Lul6YC76L6R6ZSZ6K+v55qE5Zyw5pa55bCx5piv5b2T6L+Z5Liq5YiX5rKh5pyJ5LuOdHJlZSBleHBhbmTliKDpmaTpgqPkuYjlroPkvJrkuIDnm7TlnKjjgIJcbiAgICAvLyDmnIDlkI7nmoTmlrnms5XooajnpLrlvZPniLbkurLoioLngrnkuLrkuI3lsZXlvIDlroPkuZ/kuI3lsZXlvIDov5Tlm55mYWxzZVxuICAgIGNvbnN0IGV4cGFuZGVkID0gdGhpcy5kYXRhU2V0LnByb3BzLmV4cGFuZEZpZWxkID8gcmVjb3JkLmlzRXhwYW5kZWQgOiB0aGlzLmV4cGFuZGVkUm93cy5pbmRleE9mKHJlY29yZC5rZXkpICE9PSAtMTtcbiAgICByZXR1cm4gZXhwYW5kZWQgJiYgKCF0aGlzLmlzVHJlZSB8fCAhcGFyZW50IHx8IHRoaXMuaXNSb3dFeHBhbmRlZChwYXJlbnQpKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0Um93RXhwYW5kZWQocmVjb3JkOiBSZWNvcmQsIGV4cGFuZGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuZGF0YVNldC5wcm9wcy5leHBhbmRGaWVsZCkge1xuICAgICAgcmVjb3JkLmlzRXhwYW5kZWQgPSBleHBhbmRlZDtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmV4cGFuZGVkUm93cy5pbmRleE9mKHJlY29yZC5rZXkpO1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aGlzLmV4cGFuZGVkUm93cy5wdXNoKHJlY29yZC5rZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLmV4cGFuZGVkUm93cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBjb25zdCB7IG9uRXhwYW5kIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbkV4cGFuZCkge1xuICAgICAgb25FeHBhbmQoZXhwYW5kZWQsIHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgaXNSb3dIb3ZlcihyZWNvcmQ6IFJlY29yZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhvdmVyUm93ID09PSByZWNvcmQ7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldFJvd0hvdmVyKHJlY29yZDogUmVjb3JkLCBob3ZlcjogYm9vbGVhbikge1xuICAgIHRoaXMuaG92ZXJSb3cgPSBob3ZlciA/IHJlY29yZCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgZXhwYW5kQWxsKCkge1xuICAgIHRoaXMuZGF0YVNldC5yZWNvcmRzLmZvckVhY2gocmVjb3JkID0+IHRoaXMuc2V0Um93RXhwYW5kZWQocmVjb3JkLCB0cnVlKSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGNvbGxhcHNlQWxsKCkge1xuICAgIHRoaXMuZGF0YVNldC5yZWNvcmRzLmZvckVhY2gocmVjb3JkID0+IHRoaXMuc2V0Um93RXhwYW5kZWQocmVjb3JkLCBmYWxzZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMZWFmQ29sdW1ucyhjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgY29uc3QgbGVhZkNvbHVtbnM6IENvbHVtblByb3BzW10gPSBbXTtcbiAgICBjb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHtcbiAgICAgIGlmICghY29sdW1uLmNoaWxkcmVuIHx8IGNvbHVtbi5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbGVhZkNvbHVtbnMucHVzaChjb2x1bW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVhZkNvbHVtbnMucHVzaCguLi50aGlzLmdldExlYWZDb2x1bW5zKGNvbHVtbi5jaGlsZHJlbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsZWFmQ29sdW1ucztcbiAgfVxuXG4gIHByaXZhdGUgYWRkRXhwYW5kQ29sdW1uKGNvbHVtbnM6IENvbHVtblByb3BzW10pOiBDb2x1bW5Qcm9wc1tdIHtcbiAgICBpZiAodGhpcy5leHBhbmRJY29uQXNDZWxsKSB7XG4gICAgICBjb2x1bW5zLnVuc2hpZnQoe1xuICAgICAgICBrZXk6IEVYUEFORF9LRVksXG4gICAgICAgIHJlc2l6YWJsZTogZmFsc2UsXG4gICAgICAgIGFsaWduOiBDb2x1bW5BbGlnbi5jZW50ZXIsXG4gICAgICAgIHdpZHRoOiA1MCxcbiAgICAgICAgbG9jazogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29sdW1ucztcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBwcml2YXRlIG11bHRpcGxlU2VsZWN0aW9uUmVuZGVyZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxPYnNlcnZlckNoZWNrQm94XG4gICAgICAgIGNoZWNrZWQ9e3RoaXMuYWxsQ2hlY2tlZH1cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17dGhpcy5pbmRldGVybWluYXRlfVxuICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVTZWxlY3RBbGxDaGFuZ2V9XG4gICAgICAgIHZhbHVlXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZFNlbGVjdGlvbkNvbHVtbihjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgaWYgKHRoaXMuaGFzUm93Qm94KSB7XG4gICAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgICBjb25zdCB7IHN1ZmZpeENscywgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3Qgc2VsZWN0aW9uQ29sdW1uOiBDb2x1bW5Qcm9wcyA9IHtcbiAgICAgICAga2V5OiBTRUxFQ1RJT05fS0VZLFxuICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICBjbGFzc05hbWU6IGAke2dldFByb1ByZWZpeENscyhzdWZmaXhDbHMhLCBwcmVmaXhDbHMpfS1zZWxlY3Rpb24tY29sdW1uYCxcbiAgICAgICAgcmVuZGVyZXI6ICh7IHJlY29yZCB9KSA9PiByZW5kZXJTZWxlY3Rpb25Cb3goeyByZWNvcmQsIHN0b3JlOiB0aGlzIH0pLFxuICAgICAgICBhbGlnbjogQ29sdW1uQWxpZ24uY2VudGVyLFxuICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgIGxvY2s6IHRydWUsXG4gICAgICB9O1xuICAgICAgaWYgKGRhdGFTZXQgJiYgZGF0YVNldC5zZWxlY3Rpb24gPT09IERhdGFTZXRTZWxlY3Rpb24ubXVsdGlwbGUpIHtcbiAgICAgICAgc2VsZWN0aW9uQ29sdW1uLmhlYWRlciA9IHRoaXMubXVsdGlwbGVTZWxlY3Rpb25SZW5kZXJlcjtcbiAgICAgICAgc2VsZWN0aW9uQ29sdW1uLmZvb3RlciA9IHRoaXMubXVsdGlwbGVTZWxlY3Rpb25SZW5kZXJlcjtcbiAgICAgIH1cbiAgICAgIGNvbHVtbnMudW5zaGlmdChzZWxlY3Rpb25Db2x1bW4pO1xuICAgIH1cbiAgICByZXR1cm4gY29sdW1ucztcbiAgfVxuXG4gIHJlbmRlckRyYWdlQm94KHsgcmVjb3JkIH0pIHtcbiAgICBjb25zdCB7IHJvd0RyYWdSZW5kZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHJvd0RyYWdSZW5kZXIgJiYgaXNGdW5jdGlvbihyb3dEcmFnUmVuZGVyLnJlbmRlckljb24pKSB7XG4gICAgICByZXR1cm4gcm93RHJhZ1JlbmRlci5yZW5kZXJJY29uKHsgcmVjb3JkIH0pO1xuICAgIH1cbiAgICByZXR1cm4gKDxJY29uIHR5cGU9XCJiYXNlbGluZS1kcmFnX2luZGljYXRvclwiIC8+KTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkRHJhZ0NvbHVtbihjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdKTogQ29sdW1uUHJvcHNbXSB7XG4gICAgY29uc3QgeyBkcmFnQ29sdW1uQWxpZ24sIGRyYWdSb3csIHByb3BzOiB7IHN1ZmZpeENscywgcHJlZml4Q2xzIH0gfSA9IHRoaXNcbiAgICBpZiAoZHJhZ0NvbHVtbkFsaWduICYmIGRyYWdSb3cpIHtcbiAgICAgIGNvbnN0IGRyYWdDb2x1bW46IENvbHVtblByb3BzID0ge1xuICAgICAgICBrZXk6IERSQUdfS0VZLFxuICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICBjbGFzc05hbWU6IGAke2dldFByb1ByZWZpeENscyhzdWZmaXhDbHMhLCBwcmVmaXhDbHMpfS1kcmFnLWNvbHVtbmAsXG4gICAgICAgIHJlbmRlcmVyOiAoeyByZWNvcmQgfSkgPT4gdGhpcy5yZW5kZXJEcmFnZUJveCh7IHJlY29yZCB9KSxcbiAgICAgICAgYWxpZ246IENvbHVtbkFsaWduLmNlbnRlcixcbiAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgfTtcbiAgICAgIGlmIChkcmFnQ29sdW1uQWxpZ24gPT09IERyYWdDb2x1bW5BbGlnbi5sZWZ0KSB7XG4gICAgICAgIGRyYWdDb2x1bW4ubG9jayA9IENvbHVtbkxvY2subGVmdDtcbiAgICAgICAgY29sdW1ucy51bnNoaWZ0KGRyYWdDb2x1bW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZHJhZ0NvbHVtbkFsaWduID09PSBEcmFnQ29sdW1uQWxpZ24ucmlnaHQpIHtcbiAgICAgICAgZHJhZ0NvbHVtbi5sb2NrID0gQ29sdW1uTG9jay5yaWdodDtcbiAgICAgICAgY29sdW1ucy5wdXNoKGRyYWdDb2x1bW4pO1xuICAgICAgfVxuXG4gICAgfVxuICAgIHJldHVybiBjb2x1bW5zO1xuICB9XG5cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==