import { __decorate } from "tslib";
import React, { cloneElement, Component, isValidElement, } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, set } from 'mobx';
import classNames from 'classnames';
import raf from 'raf';
import omit from 'lodash/omit';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { getConfig } from 'choerodon-ui/lib/configure';
import { minColumnWidth } from './Column';
import Record from '../data-set/Record';
import TableContext from './TableContext';
import { findCell, findFirstFocusableElement, getAlignByField, getColumnKey, getEditorByColumnAndRecord, isDisabledRow, isRadio, } from './utils';
import { TableCommandType } from './enum';
import ObserverCheckBox from '../check-box/CheckBox';
import Output from '../output/Output';
import Button from '../button/Button';
import { $l } from '../locale-context';
import Tooltip from '../tooltip/Tooltip';
import autobind from '../_util/autobind';
let inTab = false;
let TableCell = class TableCell extends Component {
    get cellEditor() {
        const { column, record } = this.props;
        return getEditorByColumnAndRecord(column, record);
    }
    get cellEditorInCell() {
        return isRadio(this.cellEditor);
    }
    get hasEditor() {
        const { tableStore: { pristine }, } = this.context;
        return !pristine && this.cellEditor && !this.cellEditorInCell;
    }
    saveOutput(node) {
        this.disconnect();
        if (node) {
            this.element = node.element;
            const { tableStore: { dataSet }, } = this.context;
            dataSet.addEventListener("update" /* update */, this.handleOutputChange);
            this.handleResize();
        }
        else {
            this.element = null;
        }
    }
    disconnect() {
        const { tableStore: { dataSet }, } = this.context;
        dataSet.removeEventListener("update" /* update */, this.handleOutputChange);
    }
    handleResize() {
        const { element } = this;
        const { tableStore } = this.context;
        if (element && !tableStore.hidden) {
            if (this.nextFrameActionId !== undefined) {
                raf.cancel(this.nextFrameActionId);
            }
            this.nextFrameActionId = raf(this.syncSize);
        }
    }
    handleOutputChange({ record, name }) {
        const { record: thisRecord, column: { name: thisName }, } = this.props;
        if (thisRecord && thisName) {
            const field = thisRecord.getField(thisName);
            const bind = field ? field.get('bind') : undefined;
            if (record === thisRecord &&
                (thisName === name || (isString(bind) && bind.startsWith(`${name}.`)))) {
                this.handleResize();
            }
        }
    }
    syncSize() {
        this.overflow = this.computeOverFlow();
        this.setMaxColumnWidth();
    }
    setMaxColumnWidth() {
        const { element } = this;
        if (element && element.textContent) {
            const { column, } = this.props;
            const { innerMaxWidth } = column;
            if (column) {
                const { width } = element.getBoundingClientRect();
                if (width !== 0) {
                    element.style.position = 'absolute';
                    let { width: measureWidth } = element.getBoundingClientRect();
                    element.style.position = '';
                    measureWidth = 20 + measureWidth;
                    const newWidth = Math.max(measureWidth, minColumnWidth(column), column.width ? column.width : 0);
                    if (!innerMaxWidth || newWidth > innerMaxWidth) {
                        set(column, 'innerMaxWidth', newWidth);
                    }
                }
            }
        }
    }
    computeOverFlow() {
        const { element } = this;
        if (element && element.textContent) {
            const { column: { tooltip }, } = this.props;
            if (tooltip === "always" /* always */) {
                return true;
            }
            if (tooltip === "overflow" /* overflow */) {
                const { width } = element.getBoundingClientRect();
                if (width !== 0) {
                    element.style.position = 'absolute';
                    const { width: measureWidth } = element.getBoundingClientRect();
                    element.style.position = '';
                    return measureWidth > width;
                }
            }
        }
        return false;
    }
    handleEditorKeyDown(e) {
        switch (e.keyCode) {
            case KeyCode.TAB: {
                const { prefixCls, column } = this.props;
                const { tableStore } = this.context;
                const cell = findCell(tableStore, prefixCls, getColumnKey(column));
                if (cell) {
                    if (cell.contains(document.activeElement)) {
                        inTab = true;
                    }
                    else {
                        const node = findFirstFocusableElement(cell);
                        if (node) {
                            inTab = true;
                            node.focus();
                        }
                    }
                }
                break;
            }
            default:
        }
    }
    handleFocus(e) {
        const { tableStore } = this.context;
        const { dataSet, inlineEdit } = tableStore;
        const { prefixCls, record, column, column: { lock }, } = this.props;
        if (!isDisabledRow(record) && (!inlineEdit || record.editing)) {
            dataSet.current = record;
            this.showEditor(e.currentTarget, lock);
            if (!this.cellEditor || isRadio(this.cellEditor)) {
                const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
                if (cell && !cell.contains(document.activeElement)) {
                    const node = findFirstFocusableElement(cell);
                    if (node && !inTab) {
                        node.focus();
                    }
                }
            }
        }
        inTab = false;
    }
    handleCommandEdit() {
        const { record } = this.props;
        const { tableStore } = this.context;
        if (tableStore.inlineEdit) {
            tableStore.currentEditRecord = record;
        }
    }
    handleCommandDelete() {
        const { record } = this.props;
        const { tableStore } = this.context;
        const { dataSet } = tableStore;
        dataSet.delete(record);
    }
    async handleCommandSave() {
        const { tableStore } = this.context;
        const { dataSet } = tableStore;
        if ((await dataSet.submit()) !== false) {
            tableStore.currentEditRecord = undefined;
        }
    }
    handleCommandCancel() {
        const { record } = this.props;
        const { tableStore } = this.context;
        if (record.status === "add" /* add */) {
            const { dataSet } = tableStore;
            dataSet.remove(record);
        }
        else {
            record.reset();
            tableStore.currentEditRecord = undefined;
        }
    }
    getButtonProps(type, record) {
        const disabled = isDisabledRow(record);
        switch (type) {
            case TableCommandType.edit:
                return {
                    icon: 'mode_edit',
                    onClick: this.handleCommandEdit,
                    disabled,
                    title: $l('Table', 'edit_button'),
                };
            case TableCommandType.delete:
                return {
                    icon: 'delete',
                    onClick: this.handleCommandDelete,
                    disabled,
                    title: $l('Table', 'delete_button'),
                };
            default:
        }
    }
    renderCommand() {
        const { record } = this.props;
        const command = this.getCommand();
        const tableCommandProps = getConfig('tableCommandProps');
        if (record.editing) {
            return [
                React.createElement(Tooltip, { key: "save", title: $l('Table', 'save_button') },
                    React.createElement(Button, Object.assign({}, tableCommandProps, { icon: "finished", onClick: this.handleCommandSave }))),
                React.createElement(Tooltip, { key: "cancel", title: $l('Table', 'cancel_button') },
                    React.createElement(Button, Object.assign({}, tableCommandProps, { icon: "cancle_a", onClick: this.handleCommandCancel }))),
            ];
        }
        if (command) {
            const children = [];
            command.forEach(button => {
                let props = {};
                if (isArrayLike(button)) {
                    props = button[1] || {};
                    button = button[0];
                }
                if (isString(button) && button in TableCommandType) {
                    const defaultButtonProps = this.getButtonProps(button, record);
                    if (defaultButtonProps) {
                        const { afterClick, ...buttonProps } = props;
                        if (afterClick) {
                            const { onClick } = defaultButtonProps;
                            defaultButtonProps.onClick = async (e) => {
                                e.persist();
                                try {
                                    await onClick(e);
                                }
                                finally {
                                    afterClick(e);
                                }
                            };
                        }
                        const { title, ...otherProps } = defaultButtonProps;
                        children.push(React.createElement(Tooltip, { key: button, title: title },
                            React.createElement(Button, Object.assign({}, tableCommandProps, otherProps, buttonProps))));
                    }
                }
                else if (isValidElement(button)) {
                    children.push(cloneElement(button, { ...tableCommandProps, ...button.props }));
                }
                else if (isObject(button)) {
                    children.push(React.createElement(Button, Object.assign({}, tableCommandProps, button)));
                }
            });
            return children;
        }
    }
    renderEditor() {
        const { cellEditor } = this;
        if (isValidElement(cellEditor)) {
            const { tableStore: { dataSet, pristine, inlineEdit }, } = this.context;
            const { column: { name }, record, } = this.props;
            const field = record.getField(name);
            const { checkField } = dataSet.props;
            const newEditorProps = {
                ...cellEditor.props,
                record,
                name,
                pristine,
                disabled: isDisabledRow(record) || (inlineEdit && !record.editing),
                indeterminate: checkField && checkField === name && record.isIndeterminate,
                labelLayout: "none" /* none */,
                _inTable: true,
            };
            /**
             * 渲染多行编辑器
             */
            if (field?.get('multiLine')) {
                return cellEditor;
            }
            return cloneElement(cellEditor, newEditorProps);
        }
    }
    getCheckBox() {
        const { record } = this.props;
        const { tableStore: { dataSet }, } = this.context;
        const { checkField } = dataSet.props;
        if (checkField) {
            return (React.createElement(ObserverCheckBox, { name: checkField, record: record, disabled: isDisabledRow(record), indeterminate: record.isIndeterminate }));
        }
    }
    getCommand() {
        const { column: { command }, record, } = this.props;
        const { tableStore: { dataSet }, } = this.context;
        if (typeof command === 'function') {
            return command({ dataSet, record });
        }
        return command;
    }
    getCellRenderer(command) {
        const { column } = this.props;
        const { renderer } = column;
        if (command) {
            return this.renderCommand;
        }
        if (this.cellEditorInCell) {
            return this.renderEditor;
        }
        return renderer;
    }
    getInnerNode(prefixCls, command) {
        const { context: { tableStore: { dataSet, rowHeight, expandIconAsCell, hasCheckFieldColumn, pristine, props: { autoMaxWidth } }, }, props: { children }, } = this;
        if (expandIconAsCell && children) {
            return children;
        }
        const { column, record, indentSize } = this.props;
        const { name, tooltip } = column;
        const { hasEditor } = this;
        // 计算多行编辑单元格高度
        const field = record.getField(name);
        let rows = 0;
        if (field?.get('multiLine')) {
            rows = dataSet.props.fields?.map(field => {
                if (field.bind && field.bind.split('.')[0] === name) {
                    return record.getField(field.name) || dataSet.getField(field.name);
                }
            }).filter(f => f).length;
        }
        const innerProps = {
            className: `${prefixCls}-inner`,
            tabIndex: hasEditor && !isDisabledRow(record) ? 0 : -1,
            onFocus: this.handleFocus,
            pristine,
        };
        if (!hasEditor) {
            innerProps.onKeyDown = this.handleEditorKeyDown;
        }
        if (rowHeight !== 'auto') {
            innerProps.style = {
                height: pxToRem(rows > 0 ? rowHeight * rows + 5 : rowHeight),
            };
            if (autoMaxWidth || (tooltip && tooltip !== "none" /* none */)) {
                innerProps.ref = this.saveOutput;
            }
        }
        const indentText = children && (React.createElement("span", { style: { paddingLeft: pxToRem(indentSize * record.level) } }));
        const checkBox = children && !hasCheckFieldColumn && this.getCheckBox();
        const prefix = (indentText || children || checkBox) && (React.createElement("span", { key: "prefix", className: `${prefixCls}-prefix`, style: innerProps.style },
            indentText,
            children,
            checkBox));
        const output = (React.createElement(Output, Object.assign({ key: "output" }, innerProps, { record: record, renderer: this.getCellRenderer(command), name: name, disabled: isDisabledRow(record), showHelp: "none" /* none */ })));
        const text = this.overflow ? (React.createElement(Tooltip, { key: "tooltip", title: cloneElement(output, { ref: null, className: null }) }, output)) : (output);
        return [prefix, text];
    }
    componentWillUnmount() {
        this.disconnect();
    }
    render() {
        const { column, prefixCls, record, isDragging } = this.props;
        const { tableStore: { inlineEdit, pristine, props: { autoMaxWidth } }, } = this.context;
        const { className, style, align, name, onCell, tooltip } = column;
        const command = this.getCommand();
        const field = name ? record.getField(name) : undefined;
        const cellPrefix = `${prefixCls}-cell`;
        const cellExternalProps = typeof onCell === 'function'
            ? onCell({
                dataSet: record.dataSet,
                record,
                column,
            })
            : {};
        const cellStyle = {
            textAlign: align || (command ? "center" /* center */ : getAlignByField(field)),
            ...style,
            ...cellExternalProps.style,
        };
        const classString = classNames(cellPrefix, {
            [`${cellPrefix}-dirty`]: field && !pristine && field.dirty,
            [`${cellPrefix}-required`]: field && !inlineEdit && field.required,
            [`${cellPrefix}-editable`]: !inlineEdit && this.hasEditor,
        }, className, cellExternalProps.className);
        const widthDraggingStyle = () => {
            const draggingStyle = {};
            if (isDragging) {
                if (column.width) {
                    draggingStyle.width = pxToRem(column.width);
                }
                if (column.minWidth) {
                    draggingStyle.minWidth = pxToRem(column.minWidth);
                }
                draggingStyle.whiteSpace = "nowrap";
            }
            return draggingStyle;
        };
        const td = (React.createElement("td", Object.assign({}, cellExternalProps, { className: classString, style: { ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle() }, "data-index": getColumnKey(column) }), this.getInnerNode(cellPrefix, command)));
        return (autoMaxWidth || tooltip === "overflow" /* overflow */) ? (React.createElement(ReactResizeObserver, { onResize: this.handleResize, resizeProp: "width" }, td)) : (td);
    }
    showEditor(cell, lock) {
        const { column: { name }, } = this.props;
        const { tableStore } = this.context;
        const { cellEditor } = this;
        if (name && cellEditor && !isRadio(cellEditor)) {
            if (!lock) {
                const { node, overflowX } = tableStore;
                if (overflowX) {
                    const tableBodyWrap = cell.offsetParent;
                    if (tableBodyWrap) {
                        const { leftLeafColumnsWidth, rightLeafColumnsWidth } = tableStore;
                        const { offsetLeft, offsetWidth } = cell;
                        const { scrollLeft } = tableBodyWrap;
                        const { width } = tableBodyWrap.getBoundingClientRect();
                        const leftSide = offsetLeft - leftLeafColumnsWidth;
                        const rightSide = offsetLeft + offsetWidth - width + rightLeafColumnsWidth + measureScrollbar();
                        let sl = scrollLeft;
                        if (sl < rightSide) {
                            sl = rightSide;
                        }
                        if (sl > leftSide) {
                            sl = leftSide;
                        }
                        if (sl !== scrollLeft) {
                            tableBodyWrap.scrollLeft = sl;
                            node.handleBodyScrollLeft({
                                target: tableBodyWrap,
                                currentTarget: tableBodyWrap,
                            });
                        }
                    }
                }
            }
            tableStore.showEditor(name);
        }
    }
};
TableCell.displayName = 'TableCell';
TableCell.propTypes = {
    prefixCls: PropTypes.string,
    column: PropTypes.object.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
    indentSize: PropTypes.number.isRequired,
};
TableCell.contextType = TableContext;
__decorate([
    observable
], TableCell.prototype, "overflow", void 0);
__decorate([
    computed
], TableCell.prototype, "cellEditor", null);
__decorate([
    computed
], TableCell.prototype, "cellEditorInCell", null);
__decorate([
    computed
], TableCell.prototype, "hasEditor", null);
__decorate([
    autobind,
    action
], TableCell.prototype, "saveOutput", null);
__decorate([
    autobind
], TableCell.prototype, "handleResize", null);
__decorate([
    autobind
], TableCell.prototype, "handleOutputChange", null);
__decorate([
    autobind,
    action
], TableCell.prototype, "syncSize", null);
__decorate([
    action
], TableCell.prototype, "setMaxColumnWidth", null);
__decorate([
    autobind
], TableCell.prototype, "handleEditorKeyDown", null);
__decorate([
    autobind
], TableCell.prototype, "handleFocus", null);
__decorate([
    autobind
], TableCell.prototype, "handleCommandEdit", null);
__decorate([
    autobind
], TableCell.prototype, "handleCommandDelete", null);
__decorate([
    autobind
], TableCell.prototype, "handleCommandSave", null);
__decorate([
    autobind
], TableCell.prototype, "handleCommandCancel", null);
__decorate([
    autobind
], TableCell.prototype, "renderCommand", null);
__decorate([
    autobind
], TableCell.prototype, "renderEditor", null);
TableCell = __decorate([
    observer
], TableCell);
export default TableCell;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlQ2VsbC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQ1osWUFBWSxFQUNaLFNBQVMsRUFHVCxjQUFjLEdBSWYsTUFBTSxPQUFPLENBQUM7QUFDZixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN0RSxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0QsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxnQkFBZ0IsTUFBTSx5Q0FBeUMsQ0FBQztBQUN2RSxPQUFPLG1CQUFtQixNQUFNLHVDQUF1QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLEVBQWUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3ZELE9BQU8sTUFBTSxNQUFNLG9CQUFvQixDQUFDO0FBRXhDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sRUFDTCxRQUFRLEVBQ1IseUJBQXlCLEVBQ3pCLGVBQWUsRUFDZixZQUFZLEVBQ1osMEJBQTBCLEVBQzFCLGFBQWEsRUFDYixPQUFPLEdBQ1IsTUFBTSxTQUFTLENBQUM7QUFFakIsT0FBTyxFQUEr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NkJBQzdCLENBQUMsQ0FBQzt5QkFDSjtxQkFDRjtpQkFDRjthQUNGO1lBQ0QsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7Q0FDRixDQUFBO0FBeGpCUSxxQkFBVyxHQUFHLFdBQVcsQ0FBQztBQUUxQixtQkFBUyxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTTtJQUMzQixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0lBQ25DLE1BQU0sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVU7SUFDL0MsVUFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtDQUN4QyxDQUFDO0FBRUsscUJBQVcsR0FBRyxZQUFZLENBQUM7QUFNdEI7SUFBWCxVQUFVOzJDQUFvQjtBQUcvQjtJQURDLFFBQVE7MkNBSVI7QUFHRDtJQURDLFFBQVE7aURBR1I7QUFHRDtJQURDLFFBQVE7MENBTVI7QUFJRDtJQUZDLFFBQVE7SUFDUixNQUFNOzJDQWFOO0FBVUQ7SUFEQyxRQUFROzZDQVVSO0FBR0Q7SUFEQyxRQUFRO21EQWdCUjtBQUlEO0lBRkMsUUFBUTtJQUNSLE1BQU07eUNBSU47QUFHRDtJQURDLE1BQU07a0RBc0JOO0FBeUJEO0lBREMsUUFBUTtvREFzQlI7QUFHRDtJQURDLFFBQVE7NENBd0JSO0FBR0Q7SUFEQyxRQUFRO2tEQU9SO0FBR0Q7SUFEQyxRQUFRO29EQU1SO0FBR0Q7SUFEQyxRQUFRO2tEQU9SO0FBR0Q7SUFEQyxRQUFRO29EQVdSO0FBMkJEO0lBREMsUUFBUTs4Q0FxRFI7QUFHRDtJQURDLFFBQVE7NkNBK0JSO0FBdFZrQixTQUFTO0lBRDdCLFFBQVE7R0FDWSxTQUFTLENBeWpCN0I7ZUF6akJvQixTQUFTIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby90YWJsZS9UYWJsZUNlbGwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge1xuICBjbG9uZUVsZW1lbnQsXG4gIENvbXBvbmVudCxcbiAgQ1NTUHJvcGVydGllcyxcbiAgSFRNTFByb3BzLFxuICBpc1ZhbGlkRWxlbWVudCxcbiAgTW91c2VFdmVudEhhbmRsZXIsXG4gIFJlYWN0RWxlbWVudCxcbiAgUmVhY3ROb2RlLFxufSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQsIGlzQXJyYXlMaWtlLCBvYnNlcnZhYmxlLCBzZXQgfSBmcm9tICdtb2J4JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHJhZiBmcm9tICdyYWYnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC9pc09iamVjdCc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJztcbmltcG9ydCB7IHB4VG9SZW0gfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL1VuaXRDb252ZXJ0b3InO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCBtZWFzdXJlU2Nyb2xsYmFyIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvbWVhc3VyZVNjcm9sbGJhcic7XG5pbXBvcnQgUmVhY3RSZXNpemVPYnNlcnZlciBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL3Jlc2l6ZU9ic2VydmVyJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB7IENvbHVtblByb3BzLCBtaW5Db2x1bW5XaWR0aCB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi4vZGF0YS1zZXQvUmVjb3JkJztcbmltcG9ydCB7IEVsZW1lbnRQcm9wcyB9IGZyb20gJy4uL2NvcmUvVmlld0NvbXBvbmVudCc7XG5pbXBvcnQgVGFibGVDb250ZXh0IGZyb20gJy4vVGFibGVDb250ZXh0JztcbmltcG9ydCB7XG4gIGZpbmRDZWxsLFxuICBmaW5kRmlyc3RGb2N1c2FibGVFbGVtZW50LFxuICBnZXRBbGlnbkJ5RmllbGQsXG4gIGdldENvbHVtbktleSxcbiAgZ2V0RWRpdG9yQnlDb2x1bW5BbmRSZWNvcmQsXG4gIGlzRGlzYWJsZWRSb3csXG4gIGlzUmFkaW8sXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgRm9ybUZpZWxkUHJvcHMsIFJlbmRlcmVyIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCB7IENvbHVtbkFsaWduLCBDb2x1bW5Mb2NrLCBUYWJsZUNvbHVtblRvb2x0aXAsIFRhYmxlQ29tbWFuZFR5cGUgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IE9ic2VydmVyQ2hlY2tCb3ggZnJvbSAnLi4vY2hlY2stYm94L0NoZWNrQm94JztcbmltcG9ydCBPdXRwdXQgZnJvbSAnLi4vb3V0cHV0L091dHB1dCc7XG5pbXBvcnQgeyBTaG93SGVscCB9IGZyb20gJy4uL2ZpZWxkL2VudW0nO1xuaW1wb3J0IEJ1dHRvbiwgeyBCdXR0b25Qcm9wcyB9IGZyb20gJy4uL2J1dHRvbi9CdXR0b24nO1xuaW1wb3J0IHsgJGwgfSBmcm9tICcuLi9sb2NhbGUtY29udGV4dCc7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi90b29sdGlwL1Rvb2x0aXAnO1xuaW1wb3J0IHsgRGF0YVNldEV2ZW50cywgUmVjb3JkU3RhdHVzIH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5pbXBvcnQgeyBMYWJlbExheW91dCB9IGZyb20gJy4uL2Zvcm0vZW51bSc7XG5pbXBvcnQgeyBDb21tYW5kcywgVGFibGVCdXR0b25Qcm9wcyB9IGZyb20gJy4vVGFibGUnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcblxuZXhwb3J0IGludGVyZmFjZSBUYWJsZUNlbGxQcm9wcyBleHRlbmRzIEVsZW1lbnRQcm9wcyB7XG4gIGNvbHVtbjogQ29sdW1uUHJvcHM7XG4gIHJlY29yZDogUmVjb3JkO1xuICBpbmRlbnRTaXplOiBudW1iZXI7XG4gIGlzRHJhZ2dpbmc6IGJvb2xlYW47XG59XG5cbmxldCBpblRhYjogYm9vbGVhbiA9IGZhbHNlO1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlQ2VsbCBleHRlbmRzIENvbXBvbmVudDxUYWJsZUNlbGxQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVGFibGVDZWxsJztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHByZWZpeENsczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjb2x1bW46IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICByZWNvcmQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFJlY29yZCkuaXNSZXF1aXJlZCxcbiAgICBpbmRlbnRTaXplOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGNvbnRleHRUeXBlID0gVGFibGVDb250ZXh0O1xuXG4gIGVsZW1lbnQ/OiBIVE1MU3BhbkVsZW1lbnQgfCBudWxsO1xuXG4gIG5leHRGcmFtZUFjdGlvbklkPzogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIG92ZXJmbG93PzogYm9vbGVhbjtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IGNlbGxFZGl0b3IoKSB7XG4gICAgY29uc3QgeyBjb2x1bW4sIHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gZ2V0RWRpdG9yQnlDb2x1bW5BbmRSZWNvcmQoY29sdW1uLCByZWNvcmQpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjZWxsRWRpdG9ySW5DZWxsKCkge1xuICAgIHJldHVybiBpc1JhZGlvKHRoaXMuY2VsbEVkaXRvcik7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGhhc0VkaXRvcigpIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IHByaXN0aW5lIH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gIXByaXN0aW5lICYmIHRoaXMuY2VsbEVkaXRvciAmJiAhdGhpcy5jZWxsRWRpdG9ySW5DZWxsO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgc2F2ZU91dHB1dChub2RlKSB7XG4gICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5vZGUuZWxlbWVudDtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgZGF0YVNldC5hZGRFdmVudExpc3RlbmVyKERhdGFTZXRFdmVudHMudXBkYXRlLCB0aGlzLmhhbmRsZU91dHB1dENoYW5nZSk7XG4gICAgICB0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBkYXRhU2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoRGF0YVNldEV2ZW50cy51cGRhdGUsIHRoaXMuaGFuZGxlT3V0cHV0Q2hhbmdlKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVSZXNpemUoKSB7XG4gICAgY29uc3QgeyBlbGVtZW50IH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGlmIChlbGVtZW50ICYmICF0YWJsZVN0b3JlLmhpZGRlbikge1xuICAgICAgaWYgKHRoaXMubmV4dEZyYW1lQWN0aW9uSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByYWYuY2FuY2VsKHRoaXMubmV4dEZyYW1lQWN0aW9uSWQpO1xuICAgICAgfVxuICAgICAgdGhpcy5uZXh0RnJhbWVBY3Rpb25JZCA9IHJhZih0aGlzLnN5bmNTaXplKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlT3V0cHV0Q2hhbmdlKHsgcmVjb3JkLCBuYW1lIH0pIHtcbiAgICBjb25zdCB7XG4gICAgICByZWNvcmQ6IHRoaXNSZWNvcmQsXG4gICAgICBjb2x1bW46IHsgbmFtZTogdGhpc05hbWUgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodGhpc1JlY29yZCAmJiB0aGlzTmFtZSkge1xuICAgICAgY29uc3QgZmllbGQgPSB0aGlzUmVjb3JkLmdldEZpZWxkKHRoaXNOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmQgPSBmaWVsZCA/IGZpZWxkLmdldCgnYmluZCcpIDogdW5kZWZpbmVkO1xuICAgICAgaWYgKFxuICAgICAgICByZWNvcmQgPT09IHRoaXNSZWNvcmQgJiZcbiAgICAgICAgKHRoaXNOYW1lID09PSBuYW1lIHx8IChpc1N0cmluZyhiaW5kKSAmJiBiaW5kLnN0YXJ0c1dpdGgoYCR7bmFtZX0uYCkpKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgc3luY1NpemUoKSB7XG4gICAgdGhpcy5vdmVyZmxvdyA9IHRoaXMuY29tcHV0ZU92ZXJGbG93KCk7XG4gICAgdGhpcy5zZXRNYXhDb2x1bW5XaWR0aCgpO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRNYXhDb2x1bW5XaWR0aCgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGVsZW1lbnQgfSA9IHRoaXM7XG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudC50ZXh0Q29udGVudCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb2x1bW4sXG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHsgaW5uZXJNYXhXaWR0aCB9ID0gY29sdW1uO1xuICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICBjb25zdCB7IHdpZHRoIH0gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAod2lkdGggIT09IDApIHtcbiAgICAgICAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICBsZXQgeyB3aWR0aDogbWVhc3VyZVdpZHRoIH0gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgICBtZWFzdXJlV2lkdGggPSAyMCArIG1lYXN1cmVXaWR0aDtcbiAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IE1hdGgubWF4KG1lYXN1cmVXaWR0aCwgbWluQ29sdW1uV2lkdGgoY29sdW1uKSwgY29sdW1uLndpZHRoID8gY29sdW1uLndpZHRoIDogMCk7XG4gICAgICAgICAgaWYgKCFpbm5lck1heFdpZHRoIHx8IG5ld1dpZHRoID4gaW5uZXJNYXhXaWR0aCkge1xuICAgICAgICAgICAgc2V0KGNvbHVtbiwgJ2lubmVyTWF4V2lkdGgnLCBuZXdXaWR0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcHV0ZU92ZXJGbG93KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgZWxlbWVudCB9ID0gdGhpcztcbiAgICBpZiAoZWxlbWVudCAmJiBlbGVtZW50LnRleHRDb250ZW50KSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGNvbHVtbjogeyB0b29sdGlwIH0sXG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmICh0b29sdGlwID09PSBUYWJsZUNvbHVtblRvb2x0aXAuYWx3YXlzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRvb2x0aXAgPT09IFRhYmxlQ29sdW1uVG9vbHRpcC5vdmVyZmxvdykge1xuICAgICAgICBjb25zdCB7IHdpZHRoIH0gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAod2lkdGggIT09IDApIHtcbiAgICAgICAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICBjb25zdCB7IHdpZHRoOiBtZWFzdXJlV2lkdGggfSA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICcnO1xuICAgICAgICAgIHJldHVybiBtZWFzdXJlV2lkdGggPiB3aWR0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRWRpdG9yS2V5RG93bihlKSB7XG4gICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgIGNhc2UgS2V5Q29kZS5UQUI6IHtcbiAgICAgICAgY29uc3QgeyBwcmVmaXhDbHMsIGNvbHVtbiB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGNvbnN0IGNlbGwgPSBmaW5kQ2VsbCh0YWJsZVN0b3JlLCBwcmVmaXhDbHMsIGdldENvbHVtbktleShjb2x1bW4pKTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBpZiAoY2VsbC5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkge1xuICAgICAgICAgICAgaW5UYWIgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gZmluZEZpcnN0Rm9jdXNhYmxlRWxlbWVudChjZWxsKTtcbiAgICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICAgIGluVGFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgbm9kZS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUZvY3VzKGUpIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IGRhdGFTZXQsIGlubGluZUVkaXQgfSA9IHRhYmxlU3RvcmU7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcmVjb3JkLFxuICAgICAgY29sdW1uLFxuICAgICAgY29sdW1uOiB7IGxvY2sgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWlzRGlzYWJsZWRSb3cocmVjb3JkKSAmJiAoIWlubGluZUVkaXQgfHwgcmVjb3JkLmVkaXRpbmcpKSB7XG4gICAgICBkYXRhU2V0LmN1cnJlbnQgPSByZWNvcmQ7XG4gICAgICB0aGlzLnNob3dFZGl0b3IoZS5jdXJyZW50VGFyZ2V0LCBsb2NrKTtcbiAgICAgIGlmICghdGhpcy5jZWxsRWRpdG9yIHx8IGlzUmFkaW8odGhpcy5jZWxsRWRpdG9yKSkge1xuICAgICAgICBjb25zdCBjZWxsID0gZmluZENlbGwodGFibGVTdG9yZSwgcHJlZml4Q2xzLCBnZXRDb2x1bW5LZXkoY29sdW1uKSwgbG9jayk7XG4gICAgICAgIGlmIChjZWxsICYmICFjZWxsLmNvbnRhaW5zKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGZpbmRGaXJzdEZvY3VzYWJsZUVsZW1lbnQoY2VsbCk7XG4gICAgICAgICAgaWYgKG5vZGUgJiYgIWluVGFiKSB7XG4gICAgICAgICAgICBub2RlLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGluVGFiID0gZmFsc2U7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ29tbWFuZEVkaXQoKSB7XG4gICAgY29uc3QgeyByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHRhYmxlU3RvcmUuaW5saW5lRWRpdCkge1xuICAgICAgdGFibGVTdG9yZS5jdXJyZW50RWRpdFJlY29yZCA9IHJlY29yZDtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ29tbWFuZERlbGV0ZSgpIHtcbiAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRhYmxlU3RvcmU7XG4gICAgZGF0YVNldC5kZWxldGUocmVjb3JkKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBhc3luYyBoYW5kbGVDb21tYW5kU2F2ZSgpIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRhYmxlU3RvcmU7XG4gICAgaWYgKChhd2FpdCBkYXRhU2V0LnN1Ym1pdCgpKSAhPT0gZmFsc2UpIHtcbiAgICAgIHRhYmxlU3RvcmUuY3VycmVudEVkaXRSZWNvcmQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUNvbW1hbmRDYW5jZWwoKSB7XG4gICAgY29uc3QgeyByZWNvcmQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHJlY29yZC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGFibGVTdG9yZTtcbiAgICAgIGRhdGFTZXQucmVtb3ZlKHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC5yZXNldCgpO1xuICAgICAgdGFibGVTdG9yZS5jdXJyZW50RWRpdFJlY29yZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBnZXRCdXR0b25Qcm9wcyhcbiAgICB0eXBlOiBUYWJsZUNvbW1hbmRUeXBlLFxuICAgIHJlY29yZDogUmVjb3JkLFxuICApOiBCdXR0b25Qcm9wcyAmIHsgb25DbGljazogTW91c2VFdmVudEhhbmRsZXI8YW55PjsgY2hpbGRyZW4/OiBSZWFjdE5vZGUgfSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSBpc0Rpc2FibGVkUm93KHJlY29yZCk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFRhYmxlQ29tbWFuZFR5cGUuZWRpdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpY29uOiAnbW9kZV9lZGl0JyxcbiAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUNvbW1hbmRFZGl0LFxuICAgICAgICAgIGRpc2FibGVkLFxuICAgICAgICAgIHRpdGxlOiAkbCgnVGFibGUnLCAnZWRpdF9idXR0b24nKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgVGFibGVDb21tYW5kVHlwZS5kZWxldGU6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWNvbjogJ2RlbGV0ZScsXG4gICAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVDb21tYW5kRGVsZXRlLFxuICAgICAgICAgIGRpc2FibGVkLFxuICAgICAgICAgIHRpdGxlOiAkbCgnVGFibGUnLCAnZGVsZXRlX2J1dHRvbicpLFxuICAgICAgICB9O1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgcmVuZGVyQ29tbWFuZCgpIHtcbiAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5nZXRDb21tYW5kKCk7XG4gICAgY29uc3QgdGFibGVDb21tYW5kUHJvcHMgPSBnZXRDb25maWcoJ3RhYmxlQ29tbWFuZFByb3BzJyk7XG4gICAgaWYgKHJlY29yZC5lZGl0aW5nKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICA8VG9vbHRpcCBrZXk9XCJzYXZlXCIgdGl0bGU9eyRsKCdUYWJsZScsICdzYXZlX2J1dHRvbicpfT5cbiAgICAgICAgICA8QnV0dG9uIHsuLi50YWJsZUNvbW1hbmRQcm9wc30gaWNvbj1cImZpbmlzaGVkXCIgb25DbGljaz17dGhpcy5oYW5kbGVDb21tYW5kU2F2ZX0gLz5cbiAgICAgICAgPC9Ub29sdGlwPixcbiAgICAgICAgPFRvb2x0aXAga2V5PVwiY2FuY2VsXCIgdGl0bGU9eyRsKCdUYWJsZScsICdjYW5jZWxfYnV0dG9uJyl9PlxuICAgICAgICAgIDxCdXR0b24gey4uLnRhYmxlQ29tbWFuZFByb3BzfSBpY29uPVwiY2FuY2xlX2FcIiBvbkNsaWNrPXt0aGlzLmhhbmRsZUNvbW1hbmRDYW5jZWx9IC8+XG4gICAgICAgIDwvVG9vbHRpcD4sXG4gICAgICBdO1xuICAgIH1cbiAgICBpZiAoY29tbWFuZCkge1xuICAgICAgY29uc3QgY2hpbGRyZW46IFJlYWN0RWxlbWVudDxCdXR0b25Qcm9wcz5bXSA9IFtdO1xuICAgICAgY29tbWFuZC5mb3JFYWNoKGJ1dHRvbiA9PiB7XG4gICAgICAgIGxldCBwcm9wczogVGFibGVCdXR0b25Qcm9wcyA9IHt9O1xuICAgICAgICBpZiAoaXNBcnJheUxpa2UoYnV0dG9uKSkge1xuICAgICAgICAgIHByb3BzID0gYnV0dG9uWzFdIHx8IHt9O1xuICAgICAgICAgIGJ1dHRvbiA9IGJ1dHRvblswXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNTdHJpbmcoYnV0dG9uKSAmJiBidXR0b24gaW4gVGFibGVDb21tYW5kVHlwZSkge1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRCdXR0b25Qcm9wcyA9IHRoaXMuZ2V0QnV0dG9uUHJvcHMoYnV0dG9uLCByZWNvcmQpO1xuICAgICAgICAgIGlmIChkZWZhdWx0QnV0dG9uUHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgYWZ0ZXJDbGljaywgLi4uYnV0dG9uUHJvcHMgfSA9IHByb3BzO1xuICAgICAgICAgICAgaWYgKGFmdGVyQ2xpY2spIHtcbiAgICAgICAgICAgICAgY29uc3QgeyBvbkNsaWNrIH0gPSBkZWZhdWx0QnV0dG9uUHJvcHM7XG4gICAgICAgICAgICAgIGRlZmF1bHRCdXR0b25Qcm9wcy5vbkNsaWNrID0gYXN5bmMgZSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wZXJzaXN0KCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGF3YWl0IG9uQ2xpY2soZSk7XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgIGFmdGVyQ2xpY2soZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyB0aXRsZSwgLi4ub3RoZXJQcm9wcyB9ID0gZGVmYXVsdEJ1dHRvblByb3BzO1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICAgICAgPFRvb2x0aXAga2V5PXtidXR0b259IHRpdGxlPXt0aXRsZX0+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiB7Li4udGFibGVDb21tYW5kUHJvcHN9IHsuLi5vdGhlclByb3BzfSB7Li4uYnV0dG9uUHJvcHN9IC8+XG4gICAgICAgICAgICAgIDwvVG9vbHRpcD4sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc1ZhbGlkRWxlbWVudDxCdXR0b25Qcm9wcz4oYnV0dG9uKSkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2xvbmVFbGVtZW50KGJ1dHRvbiwgeyAuLi50YWJsZUNvbW1hbmRQcm9wcywgLi4uYnV0dG9uLnByb3BzIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChidXR0b24pKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCg8QnV0dG9uIHsuLi50YWJsZUNvbW1hbmRQcm9wc30gey4uLmJ1dHRvbn0gLz4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgcmVuZGVyRWRpdG9yKCkge1xuICAgIGNvbnN0IHsgY2VsbEVkaXRvciB9ID0gdGhpcztcbiAgICBpZiAoaXNWYWxpZEVsZW1lbnQoY2VsbEVkaXRvcikpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0LCBwcmlzdGluZSwgaW5saW5lRWRpdCB9LFxuICAgICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29sdW1uOiB7IG5hbWUgfSxcbiAgICAgICAgcmVjb3JkLFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gICAgICBjb25zdCBmaWVsZCA9IHJlY29yZC5nZXRGaWVsZChuYW1lKTtcbiAgICAgIGNvbnN0IHsgY2hlY2tGaWVsZCB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgIGNvbnN0IG5ld0VkaXRvclByb3BzID0ge1xuICAgICAgICAuLi5jZWxsRWRpdG9yLnByb3BzLFxuICAgICAgICByZWNvcmQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHByaXN0aW5lLFxuICAgICAgICBkaXNhYmxlZDogaXNEaXNhYmxlZFJvdyhyZWNvcmQpIHx8IChpbmxpbmVFZGl0ICYmICFyZWNvcmQuZWRpdGluZyksXG4gICAgICAgIGluZGV0ZXJtaW5hdGU6IGNoZWNrRmllbGQgJiYgY2hlY2tGaWVsZCA9PT0gbmFtZSAmJiByZWNvcmQuaXNJbmRldGVybWluYXRlLFxuICAgICAgICBsYWJlbExheW91dDogTGFiZWxMYXlvdXQubm9uZSxcbiAgICAgICAgX2luVGFibGU6dHJ1ZSxcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIOa4suafk+WkmuihjOe8lui+keWZqFxuICAgICAgICovXG4gICAgICBpZiAoZmllbGQ/LmdldCgnbXVsdGlMaW5lJykpIHtcbiAgICAgICAgcmV0dXJuIGNlbGxFZGl0b3I7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xvbmVFbGVtZW50KGNlbGxFZGl0b3IsIG5ld0VkaXRvclByb3BzIGFzIEZvcm1GaWVsZFByb3BzKTtcbiAgICB9XG4gIH1cblxuICBnZXRDaGVja0JveCgpIHtcbiAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHsgY2hlY2tGaWVsZCB9ID0gZGF0YVNldC5wcm9wcztcbiAgICBpZiAoY2hlY2tGaWVsZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPE9ic2VydmVyQ2hlY2tCb3hcbiAgICAgICAgICBuYW1lPXtjaGVja0ZpZWxkfVxuICAgICAgICAgIHJlY29yZD17cmVjb3JkfVxuICAgICAgICAgIGRpc2FibGVkPXtpc0Rpc2FibGVkUm93KHJlY29yZCl9XG4gICAgICAgICAgaW5kZXRlcm1pbmF0ZT17cmVjb3JkLmlzSW5kZXRlcm1pbmF0ZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tbWFuZCgpOiBDb21tYW5kc1tdIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7XG4gICAgICBjb2x1bW46IHsgY29tbWFuZCB9LFxuICAgICAgcmVjb3JkLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHsgZGF0YVNldCB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHR5cGVvZiBjb21tYW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gY29tbWFuZCh7IGRhdGFTZXQsIHJlY29yZCB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmQ7XG4gIH1cblxuICBnZXRDZWxsUmVuZGVyZXIoY29tbWFuZD86IENvbW1hbmRzW10pOiBSZW5kZXJlciB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyByZW5kZXJlciB9ID0gY29sdW1uO1xuICAgIGlmIChjb21tYW5kKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJDb21tYW5kO1xuICAgIH1cbiAgICBpZiAodGhpcy5jZWxsRWRpdG9ySW5DZWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJFZGl0b3I7XG4gICAgfVxuICAgIHJldHVybiByZW5kZXJlcjtcbiAgfVxuXG4gIGdldElubmVyTm9kZShwcmVmaXhDbHMsIGNvbW1hbmQ/OiBDb21tYW5kc1tdKSB7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDoge1xuICAgICAgICB0YWJsZVN0b3JlOiB7IGRhdGFTZXQsIHJvd0hlaWdodCwgZXhwYW5kSWNvbkFzQ2VsbCwgaGFzQ2hlY2tGaWVsZENvbHVtbiwgcHJpc3RpbmUsIHByb3BzOiB7IGF1dG9NYXhXaWR0aCB9IH0sXG4gICAgICB9LFxuICAgICAgcHJvcHM6IHsgY2hpbGRyZW4gfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoZXhwYW5kSWNvbkFzQ2VsbCAmJiBjaGlsZHJlbikge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgIH1cbiAgICBjb25zdCB7IGNvbHVtbiwgcmVjb3JkLCBpbmRlbnRTaXplIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgbmFtZSwgdG9vbHRpcCB9ID0gY29sdW1uO1xuICAgIGNvbnN0IHsgaGFzRWRpdG9yIH0gPSB0aGlzO1xuICAgIC8vIOiuoeeul+WkmuihjOe8lui+keWNleWFg+agvOmrmOW6plxuICAgIGNvbnN0IGZpZWxkID0gcmVjb3JkLmdldEZpZWxkKG5hbWUpO1xuICAgIGxldCByb3dzID0gMDtcbiAgICBpZiAoZmllbGQ/LmdldCgnbXVsdGlMaW5lJykpIHtcbiAgICAgIHJvd3MgPSBkYXRhU2V0LnByb3BzLmZpZWxkcz8ubWFwKGZpZWxkID0+IHtcbiAgICAgICAgaWYgKGZpZWxkLmJpbmQgJiYgZmllbGQuYmluZC5zcGxpdCgnLicpWzBdID09PSBuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZC5nZXRGaWVsZChmaWVsZC5uYW1lKSB8fCBkYXRhU2V0LmdldEZpZWxkKGZpZWxkLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KS5maWx0ZXIoZiA9PiBmKS5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IGlubmVyUHJvcHM6IGFueSA9IHtcbiAgICAgIGNsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1pbm5lcmAsXG4gICAgICB0YWJJbmRleDogaGFzRWRpdG9yICYmICFpc0Rpc2FibGVkUm93KHJlY29yZCkgPyAwIDogLTEsXG4gICAgICBvbkZvY3VzOiB0aGlzLmhhbmRsZUZvY3VzLFxuICAgICAgcHJpc3RpbmUsXG4gICAgfTtcbiAgICBpZiAoIWhhc0VkaXRvcikge1xuICAgICAgaW5uZXJQcm9wcy5vbktleURvd24gPSB0aGlzLmhhbmRsZUVkaXRvcktleURvd247XG4gICAgfVxuICAgIGlmIChyb3dIZWlnaHQgIT09ICdhdXRvJykge1xuICAgICAgaW5uZXJQcm9wcy5zdHlsZSA9IHtcbiAgICAgICAgaGVpZ2h0OiBweFRvUmVtKHJvd3MgPiAwID8gcm93SGVpZ2h0ICogcm93cyArIDUgOiByb3dIZWlnaHQpLFxuICAgICAgfTtcbiAgICAgIGlmIChhdXRvTWF4V2lkdGggfHwgKHRvb2x0aXAgJiYgdG9vbHRpcCAhPT0gVGFibGVDb2x1bW5Ub29sdGlwLm5vbmUpKSB7XG4gICAgICAgIGlubmVyUHJvcHMucmVmID0gdGhpcy5zYXZlT3V0cHV0O1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBpbmRlbnRUZXh0ID0gY2hpbGRyZW4gJiYgKFxuICAgICAgPHNwYW4gc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IHB4VG9SZW0oaW5kZW50U2l6ZSAqIHJlY29yZC5sZXZlbCkgfX0gLz5cbiAgICApO1xuXG4gICAgY29uc3QgY2hlY2tCb3ggPSBjaGlsZHJlbiAmJiAhaGFzQ2hlY2tGaWVsZENvbHVtbiAmJiB0aGlzLmdldENoZWNrQm94KCk7XG5cbiAgICBjb25zdCBwcmVmaXggPSAoaW5kZW50VGV4dCB8fCBjaGlsZHJlbiB8fCBjaGVja0JveCkgJiYgKFxuICAgICAgPHNwYW4ga2V5PVwicHJlZml4XCIgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXByZWZpeGB9IHN0eWxlPXtpbm5lclByb3BzLnN0eWxlfT5cbiAgICAgICAge2luZGVudFRleHR9XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAge2NoZWNrQm94fVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gICAgY29uc3Qgb3V0cHV0ID0gKFxuICAgICAgPE91dHB1dFxuICAgICAgICBrZXk9XCJvdXRwdXRcIlxuICAgICAgICB7Li4uaW5uZXJQcm9wc31cbiAgICAgICAgcmVjb3JkPXtyZWNvcmR9XG4gICAgICAgIHJlbmRlcmVyPXt0aGlzLmdldENlbGxSZW5kZXJlcihjb21tYW5kKX1cbiAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgZGlzYWJsZWQ9e2lzRGlzYWJsZWRSb3cocmVjb3JkKX1cbiAgICAgICAgc2hvd0hlbHA9e1Nob3dIZWxwLm5vbmV9XG4gICAgICAvPlxuICAgICk7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMub3ZlcmZsb3cgPyAoXG4gICAgICA8VG9vbHRpcCBrZXk9XCJ0b29sdGlwXCIgdGl0bGU9e2Nsb25lRWxlbWVudChvdXRwdXQsIHsgcmVmOiBudWxsLCBjbGFzc05hbWU6IG51bGwgfSl9PlxuICAgICAgICB7b3V0cHV0fVxuICAgICAgPC9Ub29sdGlwPlxuICAgICkgOiAoXG4gICAgICBvdXRwdXRcbiAgICApO1xuICAgIHJldHVybiBbcHJlZml4LCB0ZXh0XTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgY29sdW1uLCBwcmVmaXhDbHMsIHJlY29yZCwgaXNEcmFnZ2luZyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IGlubGluZUVkaXQsIHByaXN0aW5lLCBwcm9wczogeyBhdXRvTWF4V2lkdGggfSB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgeyBjbGFzc05hbWUsIHN0eWxlLCBhbGlnbiwgbmFtZSwgb25DZWxsLCB0b29sdGlwIH0gPSBjb2x1bW47XG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuZ2V0Q29tbWFuZCgpO1xuICAgIGNvbnN0IGZpZWxkID0gbmFtZSA/IHJlY29yZC5nZXRGaWVsZChuYW1lKSA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBjZWxsUHJlZml4ID0gYCR7cHJlZml4Q2xzfS1jZWxsYDtcbiAgICBjb25zdCBjZWxsRXh0ZXJuYWxQcm9wczogSFRNTFByb3BzPEhUTUxUYWJsZUNlbGxFbGVtZW50PiA9XG4gICAgICB0eXBlb2Ygb25DZWxsID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gb25DZWxsKHtcbiAgICAgICAgICBkYXRhU2V0OiByZWNvcmQuZGF0YVNldCEsXG4gICAgICAgICAgcmVjb3JkLFxuICAgICAgICAgIGNvbHVtbixcbiAgICAgICAgfSlcbiAgICAgICAgOiB7fTtcbiAgICBjb25zdCBjZWxsU3R5bGU6IENTU1Byb3BlcnRpZXMgPSB7XG4gICAgICB0ZXh0QWxpZ246IGFsaWduIHx8IChjb21tYW5kID8gQ29sdW1uQWxpZ24uY2VudGVyIDogZ2V0QWxpZ25CeUZpZWxkKGZpZWxkKSksXG4gICAgICAuLi5zdHlsZSxcbiAgICAgIC4uLmNlbGxFeHRlcm5hbFByb3BzLnN0eWxlLFxuICAgIH07XG4gICAgY29uc3QgY2xhc3NTdHJpbmcgPSBjbGFzc05hbWVzKFxuICAgICAgY2VsbFByZWZpeCxcbiAgICAgIHtcbiAgICAgICAgW2Ake2NlbGxQcmVmaXh9LWRpcnR5YF06IGZpZWxkICYmICFwcmlzdGluZSAmJiBmaWVsZC5kaXJ0eSxcbiAgICAgICAgW2Ake2NlbGxQcmVmaXh9LXJlcXVpcmVkYF06IGZpZWxkICYmICFpbmxpbmVFZGl0ICYmIGZpZWxkLnJlcXVpcmVkLFxuICAgICAgICBbYCR7Y2VsbFByZWZpeH0tZWRpdGFibGVgXTogIWlubGluZUVkaXQgJiYgdGhpcy5oYXNFZGl0b3IsXG4gICAgICB9LFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgY2VsbEV4dGVybmFsUHJvcHMuY2xhc3NOYW1lLFxuICAgICk7XG4gICAgY29uc3Qgd2lkdGhEcmFnZ2luZ1N0eWxlID0gKCk6UmVhY3QuQ1NTUHJvcGVydGllcyA9PntcbiAgICAgIGNvbnN0IGRyYWdnaW5nU3R5bGU6UmVhY3QuQ1NTUHJvcGVydGllcyA9IHt9O1xuICAgICAgaWYgKGlzRHJhZ2dpbmcpIHtcbiAgICAgICAgaWYgKGNvbHVtbi53aWR0aCkge1xuICAgICAgICAgIGRyYWdnaW5nU3R5bGUud2lkdGggPSBweFRvUmVtKGNvbHVtbi53aWR0aClcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sdW1uLm1pbldpZHRoKSB7XG4gICAgICAgICAgZHJhZ2dpbmdTdHlsZS5taW5XaWR0aCA9IHB4VG9SZW0oY29sdW1uLm1pbldpZHRoKVxuICAgICAgICB9XG4gICAgICAgIGRyYWdnaW5nU3R5bGUud2hpdGVTcGFjZSA9IFwibm93cmFwXCJcbiAgICAgIH1cbiAgICAgIHJldHVybiBkcmFnZ2luZ1N0eWxlXG4gICAgfTtcbiAgICBjb25zdCB0ZCA9IChcbiAgICAgIDx0ZFxuICAgICAgICB7Li4uY2VsbEV4dGVybmFsUHJvcHN9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NTdHJpbmd9XG4gICAgICAgIHN0eWxlPXt7IC4uLm9taXQoY2VsbFN0eWxlLCBbJ3dpZHRoJywgJ2hlaWdodCddKSwgLi4ud2lkdGhEcmFnZ2luZ1N0eWxlKCkgfX1cbiAgICAgICAgZGF0YS1pbmRleD17Z2V0Q29sdW1uS2V5KGNvbHVtbil9XG4gICAgICA+XG4gICAgICAgIHt0aGlzLmdldElubmVyTm9kZShjZWxsUHJlZml4LCBjb21tYW5kKX1cbiAgICAgIDwvdGQ+XG4gICAgKTtcbiAgICByZXR1cm4gKGF1dG9NYXhXaWR0aCB8fCB0b29sdGlwID09PSBUYWJsZUNvbHVtblRvb2x0aXAub3ZlcmZsb3cpID8gKFxuICAgICAgPFJlYWN0UmVzaXplT2JzZXJ2ZXIgb25SZXNpemU9e3RoaXMuaGFuZGxlUmVzaXplfSByZXNpemVQcm9wPVwid2lkdGhcIj5cbiAgICAgICAge3RkfVxuICAgICAgPC9SZWFjdFJlc2l6ZU9ic2VydmVyPlxuICAgICkgOiAoXG4gICAgICB0ZFxuICAgICk7XG4gIH1cblxuICBzaG93RWRpdG9yKGNlbGwsIGxvY2s/OiBDb2x1bW5Mb2NrIHwgYm9vbGVhbikge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbHVtbjogeyBuYW1lIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgeyBjZWxsRWRpdG9yIH0gPSB0aGlzO1xuICAgIGlmIChuYW1lICYmIGNlbGxFZGl0b3IgJiYgIWlzUmFkaW8oY2VsbEVkaXRvcikpIHtcbiAgICAgIGlmICghbG9jaykge1xuICAgICAgICBjb25zdCB7IG5vZGUsIG92ZXJmbG93WCB9ID0gdGFibGVTdG9yZTtcbiAgICAgICAgaWYgKG92ZXJmbG93WCkge1xuICAgICAgICAgIGNvbnN0IHRhYmxlQm9keVdyYXAgPSBjZWxsLm9mZnNldFBhcmVudDtcbiAgICAgICAgICBpZiAodGFibGVCb2R5V3JhcCkge1xuICAgICAgICAgICAgY29uc3QgeyBsZWZ0TGVhZkNvbHVtbnNXaWR0aCwgcmlnaHRMZWFmQ29sdW1uc1dpZHRoIH0gPSB0YWJsZVN0b3JlO1xuICAgICAgICAgICAgY29uc3QgeyBvZmZzZXRMZWZ0LCBvZmZzZXRXaWR0aCB9ID0gY2VsbDtcbiAgICAgICAgICAgIGNvbnN0IHsgc2Nyb2xsTGVmdCB9ID0gdGFibGVCb2R5V3JhcDtcbiAgICAgICAgICAgIGNvbnN0IHsgd2lkdGggfSA9IHRhYmxlQm9keVdyYXAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCBsZWZ0U2lkZSA9IG9mZnNldExlZnQgLSBsZWZ0TGVhZkNvbHVtbnNXaWR0aDtcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0U2lkZSA9XG4gICAgICAgICAgICAgIG9mZnNldExlZnQgKyBvZmZzZXRXaWR0aCAtIHdpZHRoICsgcmlnaHRMZWFmQ29sdW1uc1dpZHRoICsgbWVhc3VyZVNjcm9sbGJhcigpO1xuICAgICAgICAgICAgbGV0IHNsID0gc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIGlmIChzbCA8IHJpZ2h0U2lkZSkge1xuICAgICAgICAgICAgICBzbCA9IHJpZ2h0U2lkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzbCA+IGxlZnRTaWRlKSB7XG4gICAgICAgICAgICAgIHNsID0gbGVmdFNpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2wgIT09IHNjcm9sbExlZnQpIHtcbiAgICAgICAgICAgICAgdGFibGVCb2R5V3JhcC5zY3JvbGxMZWZ0ID0gc2w7XG4gICAgICAgICAgICAgIG5vZGUuaGFuZGxlQm9keVNjcm9sbExlZnQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGFibGVCb2R5V3JhcCxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0OiB0YWJsZUJvZHlXcmFwLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRhYmxlU3RvcmUuc2hvd0VkaXRvcihuYW1lKTtcbiAgICB9XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==