import { __decorate } from "tslib";
import React, { cloneElement, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, get, remove, set } from 'mobx';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import omit from 'lodash/omit';
import TableCell from './TableCell';
import Record from '../data-set/Record';
import TableContext from './TableContext';
import ExpandIcon from './ExpandIcon';
import { findFirstFocusableElement, getColumnKey, isDisabledRow, isSelectedRow } from './utils';
import { DRAG_KEY, EXPAND_KEY } from './TableStore';
import autobind from '../_util/autobind';
let TableRow = class TableRow extends Component {
    constructor() {
        super(...arguments);
        this.rowExternalProps = {};
        this.childrenRendered = false;
    }
    get expandable() {
        const { tableStore: { isTree, props: { expandedRowRenderer }, }, } = this.context;
        const { record } = this.props;
        return !!expandedRowRenderer || (isTree && !!record.children);
    }
    get isExpanded() {
        const { tableStore } = this.context;
        const { record } = this.props;
        return tableStore.isRowExpanded(record);
    }
    set isExpanded(expanded) {
        const { tableStore } = this.context;
        const { record } = this.props;
        tableStore.setRowExpanded(record, expanded);
    }
    get isHover() {
        const { tableStore } = this.context;
        const { record } = this.props;
        return tableStore.isRowHover(record);
    }
    set isHover(hover) {
        const { tableStore } = this.context;
        if (tableStore.highLightRow) {
            const { record } = this.props;
            tableStore.setRowHover(record, hover);
        }
    }
    saveRef(node) {
        if (node) {
            this.node = node;
            const { lock, record } = this.props;
            const { tableStore: { rowHeight, lockColumnsBodyRowsHeight }, } = this.context;
            if (rowHeight === 'auto' && !lock) {
                set(lockColumnsBodyRowsHeight, (this.rowKey = record.key), node.offsetHeight);
            }
        }
    }
    handleMouseEnter() {
        this.isHover = true;
    }
    handleMouseLeave() {
        this.isHover = false;
    }
    async handleSelectionByClick(e) {
        if (await this.handleClick(e) !== false) {
            this.handleSelection();
        }
    }
    handleSelectionByMouseDown(e) {
        this.handleSelection();
        const { onMouseDown } = this.rowExternalProps;
        if (typeof onMouseDown === 'function') {
            onMouseDown(e);
        }
    }
    handleSelectionByDblClick(e) {
        this.handleSelection();
        const { onDoubleClick } = this.rowExternalProps;
        if (typeof onDoubleClick === 'function') {
            onDoubleClick(e);
        }
    }
    handleExpandChange() {
        if (this.expandable) {
            this.isExpanded = !this.isExpanded;
        }
    }
    handleClickCapture(e) {
        const { record, record: { dataSet }, } = this.props;
        if (dataSet && !isDisabledRow(record)) {
            dataSet.current = record;
        }
        const { onClickCapture } = this.rowExternalProps;
        if (typeof onClickCapture === 'function') {
            onClickCapture(e);
        }
    }
    handleClick(e) {
        const { onClick } = this.rowExternalProps;
        if (typeof onClick === 'function') {
            return onClick(e);
        }
    }
    getCell(column, index, isDragging) {
        const { prefixCls, record, indentSize, lock, dragColumnAlign } = this.props;
        const { tableStore: { leafColumns, rightLeafColumns }, } = this.context;
        const columnIndex = lock === 'right' ? index + leafColumns.length - rightLeafColumns.length : index;
        return (React.createElement(TableCell, { key: getColumnKey(column), prefixCls: prefixCls, column: column, record: record, indentSize: indentSize, isDragging: isDragging, style: dragColumnAlign && column.key === DRAG_KEY ? { cursor: 'move' } : {} }, this.hasExpandIcon(columnIndex) && this.renderExpandIcon()));
    }
    focusRow(row) {
        if (row) {
            const { tableStore: { node, overflowY, currentEditorName, inlineEdit }, } = this.context;
            const { lock, record } = this.props;
            /**
             * 判断是否为ie浏览器
             */
            // @ts-ignore
            const isIE = !!window.ActiveXObject || "ActiveXObject" in window;
            // 当不是为lock 和 当前不是编辑状态的时候
            if (!lock && !currentEditorName) {
                const { element } = node;
                // table 包含目前被focus的element
                // 找到当前组件对应record生成的组件对象 然后遍历 每个 tr里面不是focus的目标那么这个函数触发row.focus
                if (element &&
                    element.contains(document.activeElement) &&
                    !inlineEdit && // 这里的原因是因为当编辑状态为inline的时候currentEditorName永远为 undefined 所以暂时屏蔽掉
                    Array.from(element.querySelectorAll(`tr[data-index="${record.id}"]`)).every(tr => !tr.contains(document.activeElement))) {
                    if (isIE) {
                        element.setActive(); // IE/Edge 暂时这样使用保证ie下可以被检测到已经激活
                    }
                    else {
                        element.focus(); // All other browsers
                    }
                }
            }
            if (overflowY) {
                const { offsetParent } = row;
                if (offsetParent) {
                    const tableBodyWrap = offsetParent.parentNode;
                    if (tableBodyWrap) {
                        const { offsetTop, offsetHeight } = row;
                        const { scrollTop, offsetHeight: height } = tableBodyWrap;
                        const bottomSide = offsetTop + offsetHeight - height + measureScrollbar();
                        let st = scrollTop;
                        if (st < bottomSide) {
                            st = bottomSide;
                        }
                        if (st > offsetTop) {
                            st = offsetTop + 1;
                        }
                        if (st !== scrollTop) {
                            tableBodyWrap.scrollTop = st;
                            node.handleBodyScrollTop({
                                target: tableBodyWrap,
                                currentTarget: tableBodyWrap,
                            });
                        }
                    }
                }
            }
        }
    }
    componentDidMount() {
        const { lock, record } = this.props;
        if (record.isCurrent) {
            if (record.status === "add" /* add */) {
                const cell = this.node && lock !== "right" /* right */ ? findFirstFocusableElement(this.node) : null;
                if (cell) {
                    cell.focus();
                }
            }
        }
    }
    componentDidUpdate() {
        const { record } = this.props;
        if (record.isCurrent) {
            this.focusRow(this.node);
        }
    }
    componentWillUnmount() {
        const { record } = this.props;
        const { tableStore } = this.context;
        tableStore.setRowExpanded(record, false);
        remove(tableStore.lockColumnsBodyRowsHeight, this.rowKey);
    }
    handleSelection() {
        const { record } = this.props;
        const { dataSet } = record;
        if (dataSet) {
            dataSet[record.isSelected ? 'unSelect' : 'select'](record);
        }
    }
    hasExpandIcon(columnIndex) {
        const { tableStore } = this.context;
        const { props: { expandRowByClick, expandedRowRenderer }, expandIconColumnIndex, isTree, } = tableStore;
        return (!expandRowByClick && (expandedRowRenderer || isTree) && columnIndex === expandIconColumnIndex);
    }
    renderExpandIcon() {
        const { prefixCls, record } = this.props;
        const { tableStore: { expandIcon }, } = this.context;
        const { isExpanded: expanded, expandable, handleExpandChange } = this;
        if (typeof expandIcon === 'function') {
            return expandIcon({
                prefixCls,
                expanded,
                expandable,
                needIndentSpaced: !expandable,
                record,
                onExpand: handleExpandChange,
            });
        }
        return (React.createElement(ExpandIcon, { prefixCls: prefixCls, expandable: expandable, onChange: handleExpandChange, expanded: expanded }));
    }
    renderExpandRow() {
        const { isExpanded, props: { children, columns, record, prefixCls, index }, } = this;
        const { tableStore } = this.context;
        const { props: { expandedRowRenderer, onRow }, expandIconAsCell, overflowX, } = tableStore;
        const expandRows = [];
        if (isExpanded || this.childrenRendered) {
            this.childrenRendered = true;
            if (expandedRowRenderer) {
                const rowExternalProps = typeof onRow === 'function'
                    ? onRow({
                        dataSet: record.dataSet,
                        record,
                        expandedRow: true,
                        index,
                    })
                    : {};
                const classString = classNames(`${prefixCls}-expanded-row`, rowExternalProps.className);
                const rowProps = {
                    key: `${record.key}-expanded-row`,
                    className: classString,
                    style: { ...rowExternalProps.style },
                };
                if (overflowX || !record.isCurrent) {
                    rowProps.onMouseEnter = this.handleMouseEnter;
                    rowProps.onMouseLeave = this.handleMouseLeave;
                }
                if (!isExpanded) {
                    rowProps.style.display = 'none';
                }
                expandRows.push(React.createElement("tr", Object.assign({}, rowExternalProps, rowProps),
                    expandIconAsCell && React.createElement("td", { key: EXPAND_KEY }),
                    React.createElement("td", { key: `${EXPAND_KEY}-rest`, className: `${prefixCls}-cell`, colSpan: columns.length - (expandIconAsCell ? 1 : 0) },
                        React.createElement("div", { className: `${prefixCls}-cell-inner` }, expandedRowRenderer({ dataSet: record.dataSet, record })))));
            }
            if (isValidElement(children)) {
                expandRows.push(cloneElement(children, { isExpanded, key: `${record.key}-expanded-rows` }));
            }
        }
        return expandRows;
    }
    render() {
        const { prefixCls, columns, record, lock, hidden, index, provided, snapshot, dragColumnAlign, className } = this.props;
        const { tableStore: { rowHeight, lockColumnsBodyRowsHeight, overflowX, highLightRow, selectedHighLightRow, mouseBatchChooseIdList, mouseBatchChooseState, dragColumnAlign: dragColumnAlignProps, dragRow, props: { onRow, rowRenderer, selectionMode }, }, } = this.context;
        const { dataSet, isCurrent, key, id } = record;
        const rowExternalProps = {
            ...(typeof rowRenderer === 'function' ? rowRenderer(record, index) : {}),
            ...(typeof onRow === 'function'
                ? onRow({
                    dataSet: dataSet,
                    record,
                    expandedRow: false,
                    index,
                })
                : {}),
        };
        this.rowExternalProps = rowExternalProps;
        const disabled = isDisabledRow(record);
        const selected = isSelectedRow(record);
        const rowPrefixCls = `${prefixCls}-row`;
        const classString = classNames(rowPrefixCls, {
            [`${rowPrefixCls}-current`]: highLightRow && isCurrent,
            [`${rowPrefixCls}-hover`]: highLightRow && this.isHover,
            [`${rowPrefixCls}-highlight`]: highLightRow,
            [`${rowPrefixCls}-selected`]: selectedHighLightRow && selected,
            [`${rowPrefixCls}-disabled`]: disabled,
            [`${rowPrefixCls}-mouse-batch-choose`]: mouseBatchChooseState && (mouseBatchChooseIdList || []).includes(id),
            [`${rowPrefixCls}-expanded`]: this.isExpanded,
            [`${className}`]: className,
        }, rowExternalProps.className);
        const rowProps = {
            ref: (ref) => {
                this.saveRef(ref);
                provided.innerRef(ref);
            },
            className: classString,
            style: { ...rowExternalProps.style },
            onClick: this.handleClick,
            onClickCapture: this.handleClickCapture,
            tabIndex: -1,
            disabled,
            'data-index': id,
        };
        if (overflowX) {
            rowProps.onMouseEnter = this.handleMouseEnter;
            rowProps.onMouseLeave = this.handleMouseLeave;
        }
        if (dragRow && provided && provided.draggableProps) {
            rowProps.style = { ...provided.draggableProps.style, ...rowExternalProps.style, cursor: 'move' };
            if (!dragColumnAlign && dragColumnAlignProps) {
                rowProps.style = omit(rowProps.style, ['cursor']);
            }
        }
        if (hidden) {
            rowProps.style.display = 'none';
        }
        if (lock) {
            if (rowHeight === 'auto') {
                rowProps.style.height = pxToRem(get(lockColumnsBodyRowsHeight, key));
            }
        }
        if (selectionMode === "click" /* click */) {
            rowProps.onClick = this.handleSelectionByClick;
        }
        else if (selectionMode === "dblclick" /* dblclick */) {
            rowProps.onDoubleClick = this.handleSelectionByDblClick;
        }
        else if (selectionMode === "mousedown" /* mousedown */) {
            rowProps.onMouseDown = this.handleSelectionByMouseDown;
        }
        const getCellWithDrag = (columnItem, indexItem) => {
            return this.getCell(columnItem, indexItem, snapshot.isDragging);
        };
        const filterDrag = (columnItem) => {
            if (dragColumnAlign) {
                return columnItem.key === DRAG_KEY;
            }
            return true;
        };
        return [
            React.createElement("tr", Object.assign({ key: key }, rowExternalProps, rowProps, provided.draggableProps, provided.dragHandleProps, { style: rowProps.style }), columns.filter(filterDrag).map(getCellWithDrag)),
            ...this.renderExpandRow(),
        ];
    }
};
TableRow.displayName = 'TableRow';
TableRow.propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.oneOf(["right" /* right */, "left" /* left */]),
    ]),
    columns: PropTypes.array.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
    dragColumnAlign: PropTypes.oneOf(["right" /* right */, "left" /* left */]),
};
TableRow.contextType = TableContext;
__decorate([
    computed
], TableRow.prototype, "expandable", null);
__decorate([
    computed
], TableRow.prototype, "isExpanded", null);
__decorate([
    computed
], TableRow.prototype, "isHover", null);
__decorate([
    autobind,
    action
], TableRow.prototype, "saveRef", null);
__decorate([
    autobind
], TableRow.prototype, "handleMouseEnter", null);
__decorate([
    autobind
], TableRow.prototype, "handleMouseLeave", null);
__decorate([
    autobind
], TableRow.prototype, "handleSelectionByClick", null);
__decorate([
    autobind
], TableRow.prototype, "handleSelectionByMouseDown", null);
__decorate([
    autobind
], TableRow.prototype, "handleSelectionByDblClick", null);
__decorate([
    autobind
], TableRow.prototype, "handleExpandChange", null);
__decorate([
    autobind
], TableRow.prototype, "handleClickCapture", null);
__decorate([
    autobind
], TableRow.prototype, "handleClick", null);
__decorate([
    autobind
], TableRow.prototype, "getCell", null);
__decorate([
    action
], TableRow.prototype, "componentWillUnmount", null);
TableRow = __decorate([
    observer
], TableRow);
export default TableRow;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlUm93LnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUE0QixjQUFjLEVBQWtCLE1BQU0sT0FBTyxDQUFDO0FBQ2pILE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzFELE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUVwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0QsT0FBTyxnQkFBZ0IsTUFBTSx5Q0FBeUMsQ0FBQztBQUN2RSxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFFL0IsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sTUFBTSxNQUFNLG9CQUFvQixDQUFDO0FBRXhDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEcsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFcEQsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFlekMsSUFBcUIsUUFBUSxHQUE3QixNQUFxQixRQUFTLFNBQVEsU0FBNkI7SUFBbkU7O1FBbUJFLHFCQUFnQixHQUFRLEVBQUUsQ0FBQztRQUUzQixxQkFBZ0IsR0FBWSxLQUFLLENBQUM7SUFzY3BDLENBQUM7SUFqY0MsSUFBSSxVQUFVO1FBQ1osTUFBTSxFQUNK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Q0FBQyxLQUFLLENBQUMsVUFBVTtJQUNuQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVO0lBQy9DLFVBQVUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7SUFDdkMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsd0NBQW1DLENBQUM7Q0FDdEUsQ0FBQztBQUVLLG9CQUFXLEdBQUcsWUFBWSxDQUFDO0FBV2xDO0lBREMsUUFBUTswQ0FVUjtBQUdEO0lBREMsUUFBUTswQ0FLUjtBQVNEO0lBREMsUUFBUTt1Q0FLUjtBQVlEO0lBRkMsUUFBUTtJQUNSLE1BQU07dUNBWU47QUFHRDtJQURDLFFBQVE7Z0RBR1I7QUFHRDtJQURDLFFBQVE7Z0RBR1I7QUFHRDtJQURDLFFBQVE7c0RBS1I7QUFHRDtJQURDLFFBQVE7MERBT1I7QUFHRDtJQURDLFFBQVE7eURBT1I7QUFHRDtJQURDLFFBQVE7a0RBS1I7QUFHRDtJQURDLFFBQVE7a0RBYVI7QUFHRDtJQURDLFFBQVE7MkNBTVI7QUFHRDtJQURDLFFBQVE7dUNBcUJSO0FBa0ZEO0lBREMsTUFBTTtvREFNTjtBQTdQa0IsUUFBUTtJQUQ1QixRQUFRO0dBQ1ksUUFBUSxDQTJkNUI7ZUEzZG9CLFFBQVEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlUm93LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY2xvbmVFbGVtZW50LCBDb21wb25lbnQsIENTU1Byb3BlcnRpZXMsIEhUTUxQcm9wcywgaXNWYWxpZEVsZW1lbnQsIEtleSwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgeyBhY3Rpb24sIGNvbXB1dGVkLCBnZXQsIHJlbW92ZSwgc2V0IH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IERyYWdnYWJsZVByb3ZpZGVkLCBEcmFnZ2FibGVTdGF0ZVNuYXBzaG90IH0gZnJvbSAncmVhY3QtYmVhdXRpZnVsLWRuZCc7XG5pbXBvcnQgeyBweFRvUmVtIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCBtZWFzdXJlU2Nyb2xsYmFyIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvbWVhc3VyZVNjcm9sbGJhcic7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgeyBDb2x1bW5Qcm9wcyB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCBUYWJsZUNlbGwgZnJvbSAnLi9UYWJsZUNlbGwnO1xuaW1wb3J0IFJlY29yZCBmcm9tICcuLi9kYXRhLXNldC9SZWNvcmQnO1xuaW1wb3J0IHsgRWxlbWVudFByb3BzIH0gZnJvbSAnLi4vY29yZS9WaWV3Q29tcG9uZW50JztcbmltcG9ydCBUYWJsZUNvbnRleHQgZnJvbSAnLi9UYWJsZUNvbnRleHQnO1xuaW1wb3J0IEV4cGFuZEljb24gZnJvbSAnLi9FeHBhbmRJY29uJztcbmltcG9ydCB7IENvbHVtbkxvY2ssIERyYWdDb2x1bW5BbGlnbiwgU2VsZWN0aW9uTW9kZSB9IGZyb20gJy4vZW51bSc7XG5pbXBvcnQgeyBmaW5kRmlyc3RGb2N1c2FibGVFbGVtZW50LCBnZXRDb2x1bW5LZXksIGlzRGlzYWJsZWRSb3csIGlzU2VsZWN0ZWRSb3cgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IERSQUdfS0VZLCBFWFBBTkRfS0VZIH0gZnJvbSAnLi9UYWJsZVN0b3JlJztcbmltcG9ydCB7IEV4cGFuZGVkUm93UHJvcHMgfSBmcm9tICcuL0V4cGFuZGVkUm93JztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBSZWNvcmRTdGF0dXMgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcblxuZXhwb3J0IGludGVyZmFjZSBUYWJsZVJvd1Byb3BzIGV4dGVuZHMgRWxlbWVudFByb3BzIHtcbiAgbG9jaz86IENvbHVtbkxvY2sgfCBib29sZWFuO1xuICBjb2x1bW5zOiBDb2x1bW5Qcm9wc1tdO1xuICByZWNvcmQ6IFJlY29yZDtcbiAgaW5kZW50U2l6ZTogbnVtYmVyO1xuICBpbmRleDogbnVtYmVyO1xuICBzbmFwc2hvdDogRHJhZ2dhYmxlU3RhdGVTbmFwc2hvdDtcbiAgcHJvdmlkZWQ6IERyYWdnYWJsZVByb3ZpZGVkO1xuICBkcmFnQ29sdW1uQWxpZ24/OiBEcmFnQ29sdW1uQWxpZ247XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVSb3cgZXh0ZW5kcyBDb21wb25lbnQ8VGFibGVSb3dQcm9wcywgYW55PiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdUYWJsZVJvdyc7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBwcmVmaXhDbHM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbG9jazogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuYm9vbCxcbiAgICAgIFByb3BUeXBlcy5vbmVPZihbQ29sdW1uTG9jay5yaWdodCwgQ29sdW1uTG9jay5sZWZ0XSksXG4gICAgXSksXG4gICAgY29sdW1uczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gICAgcmVjb3JkOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSZWNvcmQpLmlzUmVxdWlyZWQsXG4gICAgaW5kZW50U2l6ZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGRyYWdDb2x1bW5BbGlnbjogUHJvcFR5cGVzLm9uZU9mKFtDb2x1bW5Mb2NrLnJpZ2h0LCBDb2x1bW5Mb2NrLmxlZnRdKSxcbiAgfTtcblxuICBzdGF0aWMgY29udGV4dFR5cGUgPSBUYWJsZUNvbnRleHQ7XG5cbiAgcm93S2V5OiBLZXk7XG5cbiAgcm93RXh0ZXJuYWxQcm9wczogYW55ID0ge307XG5cbiAgY2hpbGRyZW5SZW5kZXJlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIG5vZGU6IEhUTUxUYWJsZVJvd0VsZW1lbnQgfCBudWxsO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgZXhwYW5kYWJsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7XG4gICAgICAgIGlzVHJlZSxcbiAgICAgICAgcHJvcHM6IHsgZXhwYW5kZWRSb3dSZW5kZXJlciB9LFxuICAgICAgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAhIWV4cGFuZGVkUm93UmVuZGVyZXIgfHwgKGlzVHJlZSAmJiAhIXJlY29yZC5jaGlsZHJlbik7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzRXhwYW5kZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgeyByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIHRhYmxlU3RvcmUuaXNSb3dFeHBhbmRlZChyZWNvcmQpO1xuICB9XG5cbiAgc2V0IGlzRXhwYW5kZWQoZXhwYW5kZWQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICB0YWJsZVN0b3JlLnNldFJvd0V4cGFuZGVkKHJlY29yZCwgZXhwYW5kZWQpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBpc0hvdmVyKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB0YWJsZVN0b3JlLmlzUm93SG92ZXIocmVjb3JkKTtcbiAgfVxuXG4gIHNldCBpc0hvdmVyKGhvdmVyOiBib29sZWFuKSB7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHRhYmxlU3RvcmUuaGlnaExpZ2h0Um93KSB7XG4gICAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHRhYmxlU3RvcmUuc2V0Um93SG92ZXIocmVjb3JkLCBob3Zlcik7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgcHJpdmF0ZSBzYXZlUmVmKG5vZGU6IEhUTUxUYWJsZVJvd0VsZW1lbnQgfCBudWxsKSB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICBjb25zdCB7IGxvY2ssIHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdGFibGVTdG9yZTogeyByb3dIZWlnaHQsIGxvY2tDb2x1bW5zQm9keVJvd3NIZWlnaHQgfSxcbiAgICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICBpZiAocm93SGVpZ2h0ID09PSAnYXV0bycgJiYgIWxvY2spIHtcbiAgICAgICAgc2V0KGxvY2tDb2x1bW5zQm9keVJvd3NIZWlnaHQsICh0aGlzLnJvd0tleSA9IHJlY29yZC5rZXkpLCBub2RlLm9mZnNldEhlaWdodCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZU1vdXNlRW50ZXIoKSB7XG4gICAgdGhpcy5pc0hvdmVyID0gdHJ1ZTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVNb3VzZUxlYXZlKCkge1xuICAgIHRoaXMuaXNIb3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZVNlbGVjdGlvbkJ5Q2xpY2soZSkge1xuICAgIGlmIChhd2FpdCB0aGlzLmhhbmRsZUNsaWNrKGUpICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5oYW5kbGVTZWxlY3Rpb24oKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlU2VsZWN0aW9uQnlNb3VzZURvd24oZSkge1xuICAgIHRoaXMuaGFuZGxlU2VsZWN0aW9uKCk7XG4gICAgY29uc3QgeyBvbk1vdXNlRG93biB9ID0gdGhpcy5yb3dFeHRlcm5hbFByb3BzO1xuICAgIGlmICh0eXBlb2Ygb25Nb3VzZURvd24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uTW91c2VEb3duKGUpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVTZWxlY3Rpb25CeURibENsaWNrKGUpIHtcbiAgICB0aGlzLmhhbmRsZVNlbGVjdGlvbigpO1xuICAgIGNvbnN0IHsgb25Eb3VibGVDbGljayB9ID0gdGhpcy5yb3dFeHRlcm5hbFByb3BzO1xuICAgIGlmICh0eXBlb2Ygb25Eb3VibGVDbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25Eb3VibGVDbGljayhlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRXhwYW5kQ2hhbmdlKCkge1xuICAgIGlmICh0aGlzLmV4cGFuZGFibGUpIHtcbiAgICAgIHRoaXMuaXNFeHBhbmRlZCA9ICF0aGlzLmlzRXhwYW5kZWQ7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUNsaWNrQ2FwdHVyZShlKSB7XG4gICAgY29uc3Qge1xuICAgICAgcmVjb3JkLFxuICAgICAgcmVjb3JkOiB7IGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoZGF0YVNldCAmJiAhaXNEaXNhYmxlZFJvdyhyZWNvcmQpKSB7XG4gICAgICBkYXRhU2V0LmN1cnJlbnQgPSByZWNvcmQ7XG4gICAgfVxuICAgIGNvbnN0IHsgb25DbGlja0NhcHR1cmUgfSA9IHRoaXMucm93RXh0ZXJuYWxQcm9wcztcbiAgICBpZiAodHlwZW9mIG9uQ2xpY2tDYXB0dXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkNsaWNrQ2FwdHVyZShlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ2xpY2soZSkge1xuICAgIGNvbnN0IHsgb25DbGljayB9ID0gdGhpcy5yb3dFeHRlcm5hbFByb3BzO1xuICAgIGlmICh0eXBlb2Ygb25DbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9uQ2xpY2soZSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGdldENlbGwoY29sdW1uOiBDb2x1bW5Qcm9wcywgaW5kZXg6IG51bWJlciwgaXNEcmFnZ2luZzogYm9vbGVhbik6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMsIHJlY29yZCwgaW5kZW50U2l6ZSwgbG9jaywgZHJhZ0NvbHVtbkFsaWduIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHsgbGVhZkNvbHVtbnMsIHJpZ2h0TGVhZkNvbHVtbnMgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IGNvbHVtbkluZGV4ID1cbiAgICAgIGxvY2sgPT09ICdyaWdodCcgPyBpbmRleCArIGxlYWZDb2x1bW5zLmxlbmd0aCAtIHJpZ2h0TGVhZkNvbHVtbnMubGVuZ3RoIDogaW5kZXg7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUYWJsZUNlbGxcbiAgICAgICAga2V5PXtnZXRDb2x1bW5LZXkoY29sdW1uKX1cbiAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgIGNvbHVtbj17Y29sdW1ufVxuICAgICAgICByZWNvcmQ9e3JlY29yZH1cbiAgICAgICAgaW5kZW50U2l6ZT17aW5kZW50U2l6ZX1cbiAgICAgICAgaXNEcmFnZ2luZz17aXNEcmFnZ2luZ31cbiAgICAgICAgc3R5bGU9e2RyYWdDb2x1bW5BbGlnbiAmJiBjb2x1bW4ua2V5ID09PSBEUkFHX0tFWSA/IHsgY3Vyc29yOiAnbW92ZScgfSA6IHt9fVxuICAgICAgPlxuICAgICAgICB7dGhpcy5oYXNFeHBhbmRJY29uKGNvbHVtbkluZGV4KSAmJiB0aGlzLnJlbmRlckV4cGFuZEljb24oKX1cbiAgICAgIDwvVGFibGVDZWxsPlxuICAgICk7XG4gIH1cblxuICBmb2N1c1Jvdyhyb3c6IEhUTUxUYWJsZVJvd0VsZW1lbnQgfCBudWxsKSB7XG4gICAgaWYgKHJvdykge1xuICAgICAgY29uc3Qge1xuICAgICAgICB0YWJsZVN0b3JlOiB7IG5vZGUsIG92ZXJmbG93WSwgY3VycmVudEVkaXRvck5hbWUsIGlubGluZUVkaXR9LFxuICAgICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIGNvbnN0IHsgbG9jaywgcmVjb3JkIH0gPSB0aGlzLnByb3BzO1xuICAgICAgLyoqXG4gICAgICAgKiDliKTmlq3mmK/lkKbkuLppZea1j+iniOWZqFxuICAgICAgICovXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb25zdCBpc0lFOmJvb2xlYW4gPSAhIXdpbmRvdy5BY3RpdmVYT2JqZWN0IHx8IFwiQWN0aXZlWE9iamVjdFwiIGluIHdpbmRvd1xuICAgICAgLy8g5b2T5LiN5piv5Li6bG9jayDlkowg5b2T5YmN5LiN5piv57yW6L6R54q25oCB55qE5pe25YCZXG4gICAgICBpZiAoIWxvY2sgJiYgIWN1cnJlbnRFZGl0b3JOYW1lKSB7XG4gICAgICAgIGNvbnN0IHsgZWxlbWVudCB9ID0gbm9kZTtcbiAgICAgICAgLy8gdGFibGUg5YyF5ZCr55uu5YmN6KKrZm9jdXPnmoRlbGVtZW50XG4gICAgICAgIC8vIOaJvuWIsOW9k+WJjee7hOS7tuWvueW6lHJlY29yZOeUn+aIkOeahOe7hOS7tuWvueixoSDnhLblkI7pgY3ljoYg5q+P5LiqIHRy6YeM6Z2i5LiN5pivZm9jdXPnmoTnm67moIfpgqPkuYjov5nkuKrlh73mlbDop6blj5Fyb3cuZm9jdXNcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGVsZW1lbnQgJiZcbiAgICAgICAgICBlbGVtZW50LmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpICYmXG4gICAgICAgICAgIWlubGluZUVkaXQgJiYgICAvLyDov5nph4znmoTljp/lm6DmmK/lm6DkuLrlvZPnvJbovpHnirbmgIHkuLppbmxpbmXnmoTml7blgJljdXJyZW50RWRpdG9yTmFtZeawuOi/nOS4uiB1bmRlZmluZWQg5omA5Lul5pqC5pe25bGP6JS95o6JXG4gICAgICAgICAgQXJyYXkuZnJvbTxIVE1MVGFibGVSb3dFbGVtZW50PihcbiAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgdHJbZGF0YS1pbmRleD1cIiR7cmVjb3JkLmlkfVwiXWApLFxuICAgICAgICAgICkuZXZlcnkodHIgPT4gIXRyLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoaXNJRSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBY3RpdmUoKTsgLy8gSUUvRWRnZSDmmoLml7bov5nmoLfkvb/nlKjkv53or4FpZeS4i+WPr+S7peiiq+ajgOa1i+WIsOW3sue7j+a/gOa0u1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7IC8vIEFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3ZlcmZsb3dZKSB7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0UGFyZW50IH0gPSByb3c7XG4gICAgICAgIGlmIChvZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICBjb25zdCB0YWJsZUJvZHlXcmFwID0gb2Zmc2V0UGFyZW50LnBhcmVudE5vZGUgYXMgSFRNTERpdkVsZW1lbnQ7XG4gICAgICAgICAgaWYgKHRhYmxlQm9keVdyYXApIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb2Zmc2V0VG9wLCBvZmZzZXRIZWlnaHQgfSA9IHJvdztcbiAgICAgICAgICAgIGNvbnN0IHsgc2Nyb2xsVG9wLCBvZmZzZXRIZWlnaHQ6IGhlaWdodCB9ID0gdGFibGVCb2R5V3JhcDtcbiAgICAgICAgICAgIGNvbnN0IGJvdHRvbVNpZGUgPSBvZmZzZXRUb3AgKyBvZmZzZXRIZWlnaHQgLSBoZWlnaHQgKyBtZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICBsZXQgc3QgPSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBpZiAoc3QgPCBib3R0b21TaWRlKSB7XG4gICAgICAgICAgICAgIHN0ID0gYm90dG9tU2lkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdCA+IG9mZnNldFRvcCkge1xuICAgICAgICAgICAgICBzdCA9IG9mZnNldFRvcCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3QgIT09IHNjcm9sbFRvcCkge1xuICAgICAgICAgICAgICB0YWJsZUJvZHlXcmFwLnNjcm9sbFRvcCA9IHN0O1xuICAgICAgICAgICAgICBub2RlLmhhbmRsZUJvZHlTY3JvbGxUb3Aoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGFibGVCb2R5V3JhcCxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0OiB0YWJsZUJvZHlXcmFwLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7IGxvY2ssIHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAocmVjb3JkLmlzQ3VycmVudCkge1xuICAgICAgaWYgKHJlY29yZC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgICAgY29uc3QgY2VsbCA9IHRoaXMubm9kZSAmJiBsb2NrICE9PSBDb2x1bW5Mb2NrLnJpZ2h0ID8gZmluZEZpcnN0Rm9jdXNhYmxlRWxlbWVudCh0aGlzLm5vZGUpIDogbnVsbDtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBjZWxsLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgY29uc3QgeyByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHJlY29yZC5pc0N1cnJlbnQpIHtcbiAgICAgIHRoaXMuZm9jdXNSb3codGhpcy5ub2RlKTtcbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRhYmxlU3RvcmUuc2V0Um93RXhwYW5kZWQocmVjb3JkLCBmYWxzZSk7XG4gICAgcmVtb3ZlKHRhYmxlU3RvcmUubG9ja0NvbHVtbnNCb2R5Um93c0hlaWdodCwgdGhpcy5yb3dLZXkpO1xuICB9XG5cbiAgaGFuZGxlU2VsZWN0aW9uKCkge1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gcmVjb3JkO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBkYXRhU2V0W3JlY29yZC5pc1NlbGVjdGVkID8gJ3VuU2VsZWN0JyA6ICdzZWxlY3QnXShyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGhhc0V4cGFuZEljb24oY29sdW1uSW5kZXgpIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7XG4gICAgICBwcm9wczogeyBleHBhbmRSb3dCeUNsaWNrLCBleHBhbmRlZFJvd1JlbmRlcmVyIH0sXG4gICAgICBleHBhbmRJY29uQ29sdW1uSW5kZXgsXG4gICAgICBpc1RyZWUsXG4gICAgfSA9IHRhYmxlU3RvcmU7XG4gICAgcmV0dXJuIChcbiAgICAgICFleHBhbmRSb3dCeUNsaWNrICYmIChleHBhbmRlZFJvd1JlbmRlcmVyIHx8IGlzVHJlZSkgJiYgY29sdW1uSW5kZXggPT09IGV4cGFuZEljb25Db2x1bW5JbmRleFxuICAgICk7XG4gIH1cblxuICByZW5kZXJFeHBhbmRJY29uKCkge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBleHBhbmRJY29uIH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IGlzRXhwYW5kZWQ6IGV4cGFuZGVkLCBleHBhbmRhYmxlLCBoYW5kbGVFeHBhbmRDaGFuZ2UgfSA9IHRoaXM7XG4gICAgaWYgKHR5cGVvZiBleHBhbmRJY29uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZXhwYW5kSWNvbih7XG4gICAgICAgIHByZWZpeENscyxcbiAgICAgICAgZXhwYW5kZWQsXG4gICAgICAgIGV4cGFuZGFibGUsXG4gICAgICAgIG5lZWRJbmRlbnRTcGFjZWQ6ICFleHBhbmRhYmxlLFxuICAgICAgICByZWNvcmQsXG4gICAgICAgIG9uRXhwYW5kOiBoYW5kbGVFeHBhbmRDaGFuZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxFeHBhbmRJY29uXG4gICAgICAgIHByZWZpeENscz17cHJlZml4Q2xzfVxuICAgICAgICBleHBhbmRhYmxlPXtleHBhbmRhYmxlfVxuICAgICAgICBvbkNoYW5nZT17aGFuZGxlRXhwYW5kQ2hhbmdlfVxuICAgICAgICBleHBhbmRlZD17ZXhwYW5kZWR9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJFeHBhbmRSb3coKTogUmVhY3ROb2RlW10ge1xuICAgIGNvbnN0IHtcbiAgICAgIGlzRXhwYW5kZWQsXG4gICAgICBwcm9wczogeyBjaGlsZHJlbiwgY29sdW1ucywgcmVjb3JkLCBwcmVmaXhDbHMsIGluZGV4IH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHM6IHsgZXhwYW5kZWRSb3dSZW5kZXJlciwgb25Sb3cgfSxcbiAgICAgIGV4cGFuZEljb25Bc0NlbGwsXG4gICAgICBvdmVyZmxvd1gsXG4gICAgfSA9IHRhYmxlU3RvcmU7XG4gICAgY29uc3QgZXhwYW5kUm93czogUmVhY3ROb2RlW10gPSBbXTtcbiAgICBpZiAoaXNFeHBhbmRlZCB8fCB0aGlzLmNoaWxkcmVuUmVuZGVyZWQpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5SZW5kZXJlZCA9IHRydWU7XG4gICAgICBpZiAoZXhwYW5kZWRSb3dSZW5kZXJlcikge1xuICAgICAgICBjb25zdCByb3dFeHRlcm5hbFByb3BzID1cbiAgICAgICAgICB0eXBlb2Ygb25Sb3cgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gb25Sb3coe1xuICAgICAgICAgICAgICBkYXRhU2V0OiByZWNvcmQuZGF0YVNldCEsXG4gICAgICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICAgICAgZXhwYW5kZWRSb3c6IHRydWUsXG4gICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDoge307XG4gICAgICAgIGNvbnN0IGNsYXNzU3RyaW5nID0gY2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LWV4cGFuZGVkLXJvd2AsIHJvd0V4dGVybmFsUHJvcHMuY2xhc3NOYW1lKTtcbiAgICAgICAgY29uc3Qgcm93UHJvcHM6IEhUTUxQcm9wczxIVE1MVGFibGVSb3dFbGVtZW50PiAmIHsgc3R5bGU6IENTU1Byb3BlcnRpZXM7IH0gPSB7XG4gICAgICAgICAga2V5OiBgJHtyZWNvcmQua2V5fS1leHBhbmRlZC1yb3dgLFxuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NTdHJpbmcsXG4gICAgICAgICAgc3R5bGU6IHsgLi4ucm93RXh0ZXJuYWxQcm9wcy5zdHlsZSB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvdmVyZmxvd1ggfHwgIXJlY29yZC5pc0N1cnJlbnQpIHtcbiAgICAgICAgICByb3dQcm9wcy5vbk1vdXNlRW50ZXIgPSB0aGlzLmhhbmRsZU1vdXNlRW50ZXI7XG4gICAgICAgICAgcm93UHJvcHMub25Nb3VzZUxlYXZlID0gdGhpcy5oYW5kbGVNb3VzZUxlYXZlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0V4cGFuZGVkKSB7XG4gICAgICAgICAgcm93UHJvcHMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgICBleHBhbmRSb3dzLnB1c2goXG4gICAgICAgICAgPHRyIHsuLi5yb3dFeHRlcm5hbFByb3BzfSB7Li4ucm93UHJvcHN9PlxuICAgICAgICAgICAge2V4cGFuZEljb25Bc0NlbGwgJiYgPHRkIGtleT17RVhQQU5EX0tFWX0gLz59XG4gICAgICAgICAgICA8dGRcbiAgICAgICAgICAgICAga2V5PXtgJHtFWFBBTkRfS0VZfS1yZXN0YH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNlbGxgfVxuICAgICAgICAgICAgICBjb2xTcGFuPXtjb2x1bW5zLmxlbmd0aCAtIChleHBhbmRJY29uQXNDZWxsID8gMSA6IDApfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1jZWxsLWlubmVyYH0+XG4gICAgICAgICAgICAgICAge2V4cGFuZGVkUm93UmVuZGVyZXIoeyBkYXRhU2V0OiByZWNvcmQuZGF0YVNldCEsIHJlY29yZCB9KX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+LFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGlzVmFsaWRFbGVtZW50PEV4cGFuZGVkUm93UHJvcHM+KGNoaWxkcmVuKSkge1xuICAgICAgICBleHBhbmRSb3dzLnB1c2goY2xvbmVFbGVtZW50KGNoaWxkcmVuLCB7IGlzRXhwYW5kZWQsIGtleTogYCR7cmVjb3JkLmtleX0tZXhwYW5kZWQtcm93c2AgfSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXhwYW5kUm93cztcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHByZWZpeENscywgY29sdW1ucywgcmVjb3JkLCBsb2NrLCBoaWRkZW4sIGluZGV4LCBwcm92aWRlZCwgc25hcHNob3QsIGRyYWdDb2x1bW5BbGlnbiwgY2xhc3NOYW1lfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZToge1xuICAgICAgICByb3dIZWlnaHQsXG4gICAgICAgIGxvY2tDb2x1bW5zQm9keVJvd3NIZWlnaHQsXG4gICAgICAgIG92ZXJmbG93WCxcbiAgICAgICAgaGlnaExpZ2h0Um93LFxuICAgICAgICBzZWxlY3RlZEhpZ2hMaWdodFJvdyxcbiAgICAgICAgbW91c2VCYXRjaENob29zZUlkTGlzdCxcbiAgICAgICAgbW91c2VCYXRjaENob29zZVN0YXRlLFxuICAgICAgICBkcmFnQ29sdW1uQWxpZ246IGRyYWdDb2x1bW5BbGlnblByb3BzLFxuICAgICAgICBkcmFnUm93LFxuICAgICAgICBwcm9wczogeyBvblJvdywgcm93UmVuZGVyZXIsIHNlbGVjdGlvbk1vZGUgfSxcbiAgICAgIH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IGRhdGFTZXQsIGlzQ3VycmVudCwga2V5LCBpZCB9ID0gcmVjb3JkO1xuICAgIGNvbnN0IHJvd0V4dGVybmFsUHJvcHMgPSB7XG4gICAgICAuLi4odHlwZW9mIHJvd1JlbmRlcmVyID09PSAnZnVuY3Rpb24nID8gcm93UmVuZGVyZXIocmVjb3JkLCBpbmRleCkgOiB7fSksXG4gICAgICAuLi4odHlwZW9mIG9uUm93ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gb25Sb3coe1xuICAgICAgICAgIGRhdGFTZXQ6IGRhdGFTZXQhLFxuICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICBleHBhbmRlZFJvdzogZmFsc2UsXG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgIH0pXG4gICAgICAgIDoge30pLFxuICAgIH07XG4gICAgdGhpcy5yb3dFeHRlcm5hbFByb3BzID0gcm93RXh0ZXJuYWxQcm9wcztcbiAgICBjb25zdCBkaXNhYmxlZCA9IGlzRGlzYWJsZWRSb3cocmVjb3JkKTtcbiAgICBjb25zdCBzZWxlY3RlZCA9IGlzU2VsZWN0ZWRSb3cocmVjb3JkKTtcbiAgICBjb25zdCByb3dQcmVmaXhDbHMgPSBgJHtwcmVmaXhDbHN9LXJvd2A7XG4gICAgY29uc3QgY2xhc3NTdHJpbmcgPSBjbGFzc05hbWVzKFxuICAgICAgcm93UHJlZml4Q2xzLFxuICAgICAge1xuICAgICAgICBbYCR7cm93UHJlZml4Q2xzfS1jdXJyZW50YF06IGhpZ2hMaWdodFJvdyAmJiBpc0N1cnJlbnQsXG4gICAgICAgIFtgJHtyb3dQcmVmaXhDbHN9LWhvdmVyYF06IGhpZ2hMaWdodFJvdyAmJiB0aGlzLmlzSG92ZXIsXG4gICAgICAgIFtgJHtyb3dQcmVmaXhDbHN9LWhpZ2hsaWdodGBdOiBoaWdoTGlnaHRSb3csXG4gICAgICAgIFtgJHtyb3dQcmVmaXhDbHN9LXNlbGVjdGVkYF06IHNlbGVjdGVkSGlnaExpZ2h0Um93ICYmIHNlbGVjdGVkLFxuICAgICAgICBbYCR7cm93UHJlZml4Q2xzfS1kaXNhYmxlZGBdOiBkaXNhYmxlZCxcbiAgICAgICAgW2Ake3Jvd1ByZWZpeENsc30tbW91c2UtYmF0Y2gtY2hvb3NlYF06IG1vdXNlQmF0Y2hDaG9vc2VTdGF0ZSAmJiAobW91c2VCYXRjaENob29zZUlkTGlzdCB8fCBbXSkuaW5jbHVkZXMoaWQpLFxuICAgICAgICBbYCR7cm93UHJlZml4Q2xzfS1leHBhbmRlZGBdOnRoaXMuaXNFeHBhbmRlZCxcbiAgICAgICAgW2Ake2NsYXNzTmFtZX1gXTogY2xhc3NOYW1lICwgLy8g5aKe5Yqg5Y+v5Lul6Ieq5a6a5LmJ57G75ZCN5ruh6Laz5ouW5ou95Yqf6IO9XG4gICAgICB9LFxuICAgICAgcm93RXh0ZXJuYWxQcm9wcy5jbGFzc05hbWUsXG4gICAgKTtcbiAgICBjb25zdCByb3dQcm9wczogSFRNTFByb3BzPEhUTUxUYWJsZVJvd0VsZW1lbnQ+ICYge1xuICAgICAgc3R5bGU6IENTU1Byb3BlcnRpZXM7XG4gICAgICAnZGF0YS1pbmRleCc6IG51bWJlcjtcbiAgICB9ID0ge1xuICAgICAgcmVmOiAocmVmKSA9PiB7XG4gICAgICAgIHRoaXMuc2F2ZVJlZihyZWYpO1xuICAgICAgICBwcm92aWRlZC5pbm5lclJlZihyZWYpO1xuICAgICAgfSxcbiAgICAgIGNsYXNzTmFtZTogY2xhc3NTdHJpbmcsXG4gICAgICBzdHlsZTogeyAuLi5yb3dFeHRlcm5hbFByb3BzLnN0eWxlIH0sXG4gICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUNsaWNrLFxuICAgICAgb25DbGlja0NhcHR1cmU6IHRoaXMuaGFuZGxlQ2xpY2tDYXB0dXJlLFxuICAgICAgdGFiSW5kZXg6IC0xLFxuICAgICAgZGlzYWJsZWQsXG4gICAgICAnZGF0YS1pbmRleCc6IGlkLFxuICAgIH07XG4gICAgaWYgKG92ZXJmbG93WCkge1xuICAgICAgcm93UHJvcHMub25Nb3VzZUVudGVyID0gdGhpcy5oYW5kbGVNb3VzZUVudGVyO1xuICAgICAgcm93UHJvcHMub25Nb3VzZUxlYXZlID0gdGhpcy5oYW5kbGVNb3VzZUxlYXZlO1xuICAgIH1cbiAgICBpZiAoZHJhZ1JvdyAmJiBwcm92aWRlZCAmJiBwcm92aWRlZC5kcmFnZ2FibGVQcm9wcykge1xuICAgICAgcm93UHJvcHMuc3R5bGUgPSB7IC4uLnByb3ZpZGVkLmRyYWdnYWJsZVByb3BzLnN0eWxlLCAuLi5yb3dFeHRlcm5hbFByb3BzLnN0eWxlLCBjdXJzb3I6ICdtb3ZlJyB9O1xuICAgICAgaWYgKCFkcmFnQ29sdW1uQWxpZ24gJiYgZHJhZ0NvbHVtbkFsaWduUHJvcHMpIHtcbiAgICAgICAgcm93UHJvcHMuc3R5bGUgPSBvbWl0KHJvd1Byb3BzLnN0eWxlLCBbJ2N1cnNvciddKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGlkZGVuKSB7XG4gICAgICByb3dQcm9wcy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBpZiAobG9jaykge1xuICAgICAgaWYgKHJvd0hlaWdodCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIHJvd1Byb3BzLnN0eWxlLmhlaWdodCA9IHB4VG9SZW0oZ2V0KGxvY2tDb2x1bW5zQm9keVJvd3NIZWlnaHQsIGtleSkgYXMgbnVtYmVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuY2xpY2spIHtcbiAgICAgIHJvd1Byb3BzLm9uQ2xpY2sgPSB0aGlzLmhhbmRsZVNlbGVjdGlvbkJ5Q2xpY2s7XG4gICAgfSBlbHNlIGlmIChzZWxlY3Rpb25Nb2RlID09PSBTZWxlY3Rpb25Nb2RlLmRibGNsaWNrKSB7XG4gICAgICByb3dQcm9wcy5vbkRvdWJsZUNsaWNrID0gdGhpcy5oYW5kbGVTZWxlY3Rpb25CeURibENsaWNrO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5tb3VzZWRvd24pIHtcbiAgICAgIHJvd1Byb3BzLm9uTW91c2VEb3duID0gdGhpcy5oYW5kbGVTZWxlY3Rpb25CeU1vdXNlRG93bjtcbiAgICB9XG5cbiAgICBjb25zdCBnZXRDZWxsV2l0aERyYWcgPSAoY29sdW1uSXRlbTogQ29sdW1uUHJvcHMsIGluZGV4SXRlbTogbnVtYmVyKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDZWxsKGNvbHVtbkl0ZW0sIGluZGV4SXRlbSwgc25hcHNob3QuaXNEcmFnZ2luZyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbHRlckRyYWcgPSAoY29sdW1uSXRlbTogQ29sdW1uUHJvcHMpID0+IHtcbiAgICAgIGlmIChkcmFnQ29sdW1uQWxpZ24pIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbkl0ZW0ua2V5ID09PSBEUkFHX0tFWTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgcmV0dXJuIFtcbiAgICAgIDx0clxuICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgey4uLnJvd0V4dGVybmFsUHJvcHN9XG4gICAgICAgIHsuLi5yb3dQcm9wc31cbiAgICAgICAgey4uLnByb3ZpZGVkLmRyYWdnYWJsZVByb3BzfVxuICAgICAgICB7Li4ucHJvdmlkZWQuZHJhZ0hhbmRsZVByb3BzfVxuICAgICAgICBzdHlsZT17cm93UHJvcHMuc3R5bGV9XG4gICAgICA+XG4gICAgICAgIHtjb2x1bW5zLmZpbHRlcihmaWx0ZXJEcmFnKS5tYXAoZ2V0Q2VsbFdpdGhEcmFnKX1cbiAgICAgIDwvdHI+LFxuICAgICAgLi4udGhpcy5yZW5kZXJFeHBhbmRSb3coKSxcbiAgICBdO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=