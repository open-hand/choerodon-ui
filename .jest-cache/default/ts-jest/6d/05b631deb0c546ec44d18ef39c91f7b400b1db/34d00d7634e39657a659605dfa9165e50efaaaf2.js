import { __decorate } from "tslib";
import React, { cloneElement, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Row from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import TableContext from './TableContext';
import { findCell, getColumnKey, getEditorByColumnAndRecord, getEditorByField, isRadio } from './utils';
import { stopEvent } from '../_util/EventManager';
import autobind from '../_util/autobind';
let TableEditor = class TableEditor extends Component {
    constructor() {
        super(...arguments);
        this.editing = false;
    }
    onWindowResize() {
        this.forceUpdate();
    }
    /**
     * 触发多行编辑器失焦切换编辑/只读模式
     * @param e
     */
    onWindowClick(e) {
        const { prefixCls } = this.props;
        if (e.target.className !== `${prefixCls}-content`) {
            this.handleEditorBlur(e);
        }
    }
    componentDidMount() {
        const { column: { name } } = this.props;
        const { tableStore: { dataSet, currentEditRecord }, } = this.context;
        const record = currentEditRecord || dataSet.current;
        const field = record?.getField(name) || dataSet.getField(name);
        if (field?.get('multiLine')) {
            window.addEventListener('click', this.onWindowClick);
        }
        window.addEventListener('resize', this.onWindowResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('click', this.onWindowClick);
    }
    saveRef(node) {
        this.editor = node;
    }
    handleEditorKeyEnterDown(e) {
        const { tableStore } = this.context;
        const editorNextKeyEnterDown = tableStore.editorNextKeyEnterDown;
        if (!e.isDefaultPrevented() && editorNextKeyEnterDown) {
            this.showNextEditor(e.shiftKey);
        }
    }
    handleEditorKeyDown(e) {
        if (e.keyCode !== KeyCode.ESC || !e.isDefaultPrevented()) {
            const { tableStore } = this.context;
            switch (e.keyCode) {
                case KeyCode.ESC:
                case KeyCode.TAB: {
                    const { prefixCls, column } = this.props;
                    const cell = findCell(tableStore, prefixCls, getColumnKey(column));
                    if (cell) {
                        cell.focus();
                    }
                    this.hideEditor();
                    break;
                }
                case KeyCode.PAGE_UP:
                case KeyCode.PAGE_DOWN:
                    stopEvent(e);
                    break;
                default:
            }
        }
        const { editorProps } = this;
        if (editorProps) {
            const { onKeyDown = noop } = editorProps;
            onKeyDown(e);
        }
    }
    handleEditorFocus() {
        const { currentEditorName, context: { tableStore }, } = this;
        if (!tableStore.currentEditorName && currentEditorName) {
            runInAction(() => {
                tableStore.currentEditorName = currentEditorName;
            });
        }
    }
    handleEditorBlur(e) {
        this.hideEditor();
        const { editorProps } = this;
        if (editorProps) {
            const { onBlur = noop } = editorProps;
            onBlur(e);
        }
    }
    /**
     * 多行编辑切换编辑器阻止冒泡
     * @param e
     */
    handleEditorClick(e) {
        const { editorProps } = this;
        if (editorProps) {
            const { onClick = noop } = editorProps;
            onClick(e);
        }
        stopEvent(e);
    }
    hideEditor() {
        if (this.editing) {
            const { tableStore } = this.context;
            tableStore.hideEditor();
        }
    }
    showNextEditor(reserve) {
        if (this.editor) {
            this.editor.blur();
        }
        const { tableStore } = this.context;
        const { column } = this.props;
        tableStore.showNextEditor(column.name, reserve);
    }
    /**
     * 渲染多行编辑单元格
     */
    renderMultiLineEditor() {
        const { column: { name }, prefixCls } = this.props;
        const { tableStore: { dataSet, currentEditRecord, rowHeight, inlineEdit }, } = this.context;
        const record = currentEditRecord || dataSet.current;
        const multiLineFields = dataSet.props.fields.map(field => {
            if (field.bind && field.bind.split('.')[0] === name) {
                return record.getField(field.name) || dataSet.getField(field.name);
            }
        }).filter(f => f);
        if (multiLineFields && multiLineFields.length) {
            return (React.createElement("div", null, multiLineFields.map((fields, index) => {
                if (fields) {
                    const editor = getEditorByField(fields);
                    this.editorProps = editor.props;
                    const { style = {}, ...otherProps } = this.editorProps;
                    if (rowHeight !== 'auto') {
                        style.height = pxToRem(rowHeight);
                    }
                    const newEditorProps = {
                        ...otherProps,
                        style,
                        ref: index === 0 ? this.saveRef : '',
                        record,
                        name: fields.get('name'),
                        onKeyDown: this.handleEditorKeyDown,
                        onEnterDown: this.handleEditorKeyEnterDown,
                        onClick: this.handleEditorClick,
                        tabIndex: -1,
                        showHelp: "none" /* none */,
                        // 目前测试inline时候需要放开限制
                        _inTable: !inlineEdit,
                    };
                    return (React.createElement(Row, { key: `${record?.index}-multi-${index}`, className: `${prefixCls}-multi` },
                        React.createElement(Col, { span: 8, className: `${prefixCls}-multi-label` }, fields.get('label')),
                        React.createElement(Col, { span: 16, className: `${prefixCls}-multi-value` }, cloneElement(editor, newEditorProps))));
                }
                return null;
            })));
        }
    }
    renderEditor() {
        const { column } = this.props;
        const { tableStore: { dataSet, currentEditRecord, rowHeight, pristine, inlineEdit }, } = this.context;
        const record = currentEditRecord || dataSet.current;
        const field = record?.getField(column.name);
        // 多行编辑拦截返回渲染器
        if (!pristine && field && field.get('multiLine')) {
            return this.renderMultiLineEditor();
        }
        const cellEditor = getEditorByColumnAndRecord(column, record);
        if (!pristine && isValidElement(cellEditor) && !isRadio(cellEditor)) {
            this.editorProps = cellEditor.props;
            const { style = {}, ...otherProps } = this.editorProps;
            if (rowHeight !== 'auto') {
                style.height = pxToRem(rowHeight);
            }
            const newEditorProps = {
                ...otherProps,
                style,
                ref: this.saveRef,
                record,
                name: column.name,
                onKeyDown: this.handleEditorKeyDown,
                onEnterDown: this.handleEditorKeyEnterDown,
                onBlur: this.handleEditorBlur,
                tabIndex: -1,
                showHelp: "none" /* none */,
                // 目前测试inline时候需要放开限制
                _inTable: !inlineEdit,
            };
            return cloneElement(cellEditor, newEditorProps);
        }
    }
    render() {
        const editor = this.renderEditor();
        if (editor) {
            const { prefixCls, column, column: { lock, name }, } = this.props;
            const props = {
                className: `${prefixCls}-editor`,
            };
            const editorProps = {};
            const { tableStore } = this.context;
            if (tableStore.currentEditorName === name || tableStore.currentEditRecord) {
                this.currentEditorName = name;
                const cell = findCell(tableStore, prefixCls, getColumnKey(column), lock);
                if (cell) {
                    this.editing = true;
                    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = cell;
                    props.style = {
                        left: pxToRem(offsetLeft),
                        top: pxToRem(offsetTop),
                    };
                    editorProps.style = {
                        ...editor.props.style,
                        width: pxToRem(offsetWidth),
                        height: pxToRem(offsetHeight),
                    };
                }
            }
            else if (this.editing) {
                this.editing = false;
                editorProps.onFocus = this.handleEditorFocus;
            }
            return React.createElement("div", Object.assign({}, props), cloneElement(editor, editorProps));
        }
        return null;
    }
    componentDidUpdate() {
        const { column: { name }, } = this.props;
        const { tableStore } = this.context;
        if (this.editor && this.editing && tableStore.currentEditorName === name) {
            this.editor.focus();
        }
    }
};
TableEditor.displayName = 'TableEditor';
TableEditor.propTypes = {
    column: PropTypes.object.isRequired,
};
TableEditor.contextType = TableContext;
__decorate([
    autobind
], TableEditor.prototype, "onWindowResize", null);
__decorate([
    autobind
], TableEditor.prototype, "onWindowClick", null);
__decorate([
    autobind
], TableEditor.prototype, "saveRef", null);
__decorate([
    autobind
], TableEditor.prototype, "handleEditorKeyEnterDown", null);
__decorate([
    autobind
], TableEditor.prototype, "handleEditorKeyDown", null);
__decorate([
    autobind
], TableEditor.prototype, "handleEditorFocus", null);
__decorate([
    autobind
], TableEditor.prototype, "handleEditorBlur", null);
__decorate([
    autobind
], TableEditor.prototype, "handleEditorClick", null);
__decorate([
    autobind
], TableEditor.prototype, "hideEditor", null);
TableEditor = __decorate([
    observer
], TableEditor);
export default TableEditor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlRWRpdG9yLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBZ0IsTUFBTSxPQUFPLENBQUM7QUFDckYsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9ELE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZDLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDO0FBSXZDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLDBCQUEwQixFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUN4RyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFbEQsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFPekMsSUFBcUIsV0FBVyxHQUFoQyxNQUFxQixXQUFZLFNBQVEsU0FBMkI7SUFBcEU7O1FBYUUsWUFBTyxHQUFZLEtBQUssQ0FBQztJQWdSM0IsQ0FBQztJQTNRQyxjQUFjO1FBQ1osSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7O09BR0c7SUFFSCxhQUFhLENBQUMsQ0FBQztRQUNiLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxDQUFDLE1B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SSxVQUFVLENBQUMsaUJBQWlCLEtBQUssSUFBSSxFQUFFO1lBQ3hFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDckI7SUFDSCxDQUFDO0NBQ0YsQ0FBQTtBQTVSUSx1QkFBVyxHQUFHLGFBQWEsQ0FBQztBQUU1QixxQkFBUyxHQUFHO0lBQ2pCLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7Q0FDcEMsQ0FBQztBQUVLLHVCQUFXLEdBQUcsWUFBWSxDQUFDO0FBV2xDO0lBREMsUUFBUTtpREFHUjtBQU9EO0lBREMsUUFBUTtnREFNUjtBQXFCRDtJQURDLFFBQVE7MENBR1I7QUFHRDtJQURDLFFBQVE7MkRBT1I7QUFHRDtJQURDLFFBQVE7c0RBMkJSO0FBR0Q7SUFEQyxRQUFRO29EQVdSO0FBR0Q7SUFEQyxRQUFRO21EQVFSO0FBT0Q7SUFEQyxRQUFRO29EQVFSO0FBR0Q7SUFEQyxRQUFROzZDQU1SO0FBMUlrQixXQUFXO0lBRC9CLFFBQVE7R0FDWSxXQUFXLENBNlIvQjtlQTdSb0IsV0FBVyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vdGFibGUvVGFibGVFZGl0b3IudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjbG9uZUVsZW1lbnQsIENvbXBvbmVudCwgaXNWYWxpZEVsZW1lbnQsIFJlYWN0RWxlbWVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCBub29wIGZyb20gJ2xvZGFzaC9ub29wJztcbmltcG9ydCBLZXlDb2RlIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvS2V5Q29kZSc7XG5pbXBvcnQgeyBweFRvUmVtIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCBSb3cgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9yb3cnO1xuaW1wb3J0IENvbCBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbCc7XG5pbXBvcnQgeyBDb2x1bW5Qcm9wcyB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCB7IEVsZW1lbnRQcm9wcyB9IGZyb20gJy4uL2NvcmUvVmlld0NvbXBvbmVudCc7XG5pbXBvcnQgeyBGb3JtRmllbGQsIEZvcm1GaWVsZFByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBUYWJsZUNvbnRleHQgZnJvbSAnLi9UYWJsZUNvbnRleHQnO1xuaW1wb3J0IHsgZmluZENlbGwsIGdldENvbHVtbktleSwgZ2V0RWRpdG9yQnlDb2x1bW5BbmRSZWNvcmQsIGdldEVkaXRvckJ5RmllbGQsIGlzUmFkaW8gfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHN0b3BFdmVudCB9IGZyb20gJy4uL191dGlsL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgeyBTaG93SGVscCB9IGZyb20gJy4uL2ZpZWxkL2VudW0nO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcblxuZXhwb3J0IGludGVyZmFjZSBUYWJsZUVkaXRvclByb3BzIGV4dGVuZHMgRWxlbWVudFByb3BzIHtcbiAgY29sdW1uOiBDb2x1bW5Qcm9wcztcbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZUVkaXRvciBleHRlbmRzIENvbXBvbmVudDxUYWJsZUVkaXRvclByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdUYWJsZUVkaXRvcic7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjb2x1bW46IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0aWMgY29udGV4dFR5cGUgPSBUYWJsZUNvbnRleHQ7XG5cbiAgZWRpdG9yUHJvcHM/OiBhbnk7XG5cbiAgZWRpdG9yOiBGb3JtRmllbGQ8Rm9ybUZpZWxkUHJvcHM+IHwgbnVsbDtcblxuICBlZGl0aW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY3VycmVudEVkaXRvck5hbWU/OiBzdHJpbmc7XG5cbiAgQGF1dG9iaW5kXG4gIG9uV2luZG93UmVzaXplKCkge1xuICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDop6blj5HlpJrooYznvJbovpHlmajlpLHnhKbliIfmjaLnvJbovpEv5Y+q6K+75qih5byPXG4gICAqIEBwYXJhbSBlXG4gICAqL1xuICBAYXV0b2JpbmRcbiAgb25XaW5kb3dDbGljayhlKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGUudGFyZ2V0LmNsYXNzTmFtZSAhPT0gYCR7cHJlZml4Q2xzfS1jb250ZW50YCkge1xuICAgICAgdGhpcy5oYW5kbGVFZGl0b3JCbHVyKGUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHsgY29sdW1uOiB7IG5hbWUgfSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IGRhdGFTZXQsIGN1cnJlbnRFZGl0UmVjb3JkIH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCByZWNvcmQgPSBjdXJyZW50RWRpdFJlY29yZCB8fCBkYXRhU2V0LmN1cnJlbnQ7XG4gICAgY29uc3QgZmllbGQgPSByZWNvcmQ/LmdldEZpZWxkKG5hbWUpIHx8IGRhdGFTZXQuZ2V0RmllbGQobmFtZSk7XG4gICAgaWYgKGZpZWxkPy5nZXQoJ211bHRpTGluZScpKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uV2luZG93Q2xpY2spO1xuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vbldpbmRvd1Jlc2l6ZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbldpbmRvd0NsaWNrKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBzYXZlUmVmKG5vZGUpIHtcbiAgICB0aGlzLmVkaXRvciA9IG5vZGU7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRWRpdG9yS2V5RW50ZXJEb3duKGUpIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCBlZGl0b3JOZXh0S2V5RW50ZXJEb3duID0gdGFibGVTdG9yZS5lZGl0b3JOZXh0S2V5RW50ZXJEb3duO1xuICAgIGlmICghZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSAmJiBlZGl0b3JOZXh0S2V5RW50ZXJEb3duKSB7XG4gICAgICB0aGlzLnNob3dOZXh0RWRpdG9yKGUuc2hpZnRLZXkpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVFZGl0b3JLZXlEb3duKGUpIHtcbiAgICBpZiAoZS5rZXlDb2RlICE9PSBLZXlDb2RlLkVTQyB8fCAhZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICBjYXNlIEtleUNvZGUuRVNDOlxuICAgICAgICBjYXNlIEtleUNvZGUuVEFCOiB7XG4gICAgICAgICAgY29uc3QgeyBwcmVmaXhDbHMsIGNvbHVtbiB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICBjb25zdCBjZWxsID0gZmluZENlbGwodGFibGVTdG9yZSwgcHJlZml4Q2xzLCBnZXRDb2x1bW5LZXkoY29sdW1uKSk7XG4gICAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICAgIGNlbGwuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5oaWRlRWRpdG9yKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBLZXlDb2RlLlBBR0VfVVA6XG4gICAgICAgIGNhc2UgS2V5Q29kZS5QQUdFX0RPV046XG4gICAgICAgICAgc3RvcEV2ZW50KGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB7IGVkaXRvclByb3BzIH0gPSB0aGlzO1xuICAgIGlmIChlZGl0b3JQcm9wcykge1xuICAgICAgY29uc3QgeyBvbktleURvd24gPSBub29wIH0gPSBlZGl0b3JQcm9wcztcbiAgICAgIG9uS2V5RG93bihlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRWRpdG9yRm9jdXMoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY3VycmVudEVkaXRvck5hbWUsXG4gICAgICBjb250ZXh0OiB7IHRhYmxlU3RvcmUgfSxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoIXRhYmxlU3RvcmUuY3VycmVudEVkaXRvck5hbWUgJiYgY3VycmVudEVkaXRvck5hbWUpIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGFibGVTdG9yZS5jdXJyZW50RWRpdG9yTmFtZSA9IGN1cnJlbnRFZGl0b3JOYW1lO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUVkaXRvckJsdXIoZSkge1xuICAgIHRoaXMuaGlkZUVkaXRvcigpO1xuICAgIGNvbnN0IHsgZWRpdG9yUHJvcHMgfSA9IHRoaXM7XG4gICAgaWYgKGVkaXRvclByb3BzKSB7XG4gICAgICBjb25zdCB7IG9uQmx1ciA9IG5vb3AgfSA9IGVkaXRvclByb3BzO1xuICAgICAgb25CbHVyKGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlpJrooYznvJbovpHliIfmjaLnvJbovpHlmajpmLvmraLlhpLms6FcbiAgICogQHBhcmFtIGVcbiAgICovXG4gIEBhdXRvYmluZFxuICBoYW5kbGVFZGl0b3JDbGljayhlKSB7XG4gICAgY29uc3QgeyBlZGl0b3JQcm9wcyB9ID0gdGhpcztcbiAgICBpZiAoZWRpdG9yUHJvcHMpIHtcbiAgICAgIGNvbnN0IHsgb25DbGljayA9IG5vb3AgfSA9IGVkaXRvclByb3BzO1xuICAgICAgb25DbGljayhlKTtcbiAgICB9XG4gICAgc3RvcEV2ZW50KGUpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhpZGVFZGl0b3IoKSB7XG4gICAgaWYgKHRoaXMuZWRpdGluZykge1xuICAgICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0YWJsZVN0b3JlLmhpZGVFZGl0b3IoKTtcbiAgICB9XG4gIH1cblxuICBzaG93TmV4dEVkaXRvcihyZXNlcnZlOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yKSB7XG4gICAgICB0aGlzLmVkaXRvci5ibHVyKCk7XG4gICAgfVxuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHsgY29sdW1uIH0gPSB0aGlzLnByb3BzO1xuICAgIHRhYmxlU3RvcmUuc2hvd05leHRFZGl0b3IoY29sdW1uLm5hbWUsIHJlc2VydmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIOa4suafk+WkmuihjOe8lui+keWNleWFg+agvFxuICAgKi9cbiAgcmVuZGVyTXVsdGlMaW5lRWRpdG9yKCk6IFJlYWN0RWxlbWVudDxGb3JtRmllbGRQcm9wcz4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgY29sdW1uOiB7IG5hbWUgfSwgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHsgZGF0YVNldCwgY3VycmVudEVkaXRSZWNvcmQsIHJvd0hlaWdodCwgaW5saW5lRWRpdCB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgcmVjb3JkID0gY3VycmVudEVkaXRSZWNvcmQgfHwgZGF0YVNldC5jdXJyZW50O1xuICAgIGNvbnN0IG11bHRpTGluZUZpZWxkcyA9IGRhdGFTZXQucHJvcHMuZmllbGRzLm1hcChmaWVsZCA9PiB7XG4gICAgICBpZiAoZmllbGQuYmluZCAmJiBmaWVsZC5iaW5kLnNwbGl0KCcuJylbMF0gPT09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZC5nZXRGaWVsZChmaWVsZC5uYW1lKSB8fCBkYXRhU2V0LmdldEZpZWxkKGZpZWxkLm5hbWUpO1xuICAgICAgfVxuICAgIH0pLmZpbHRlcihmID0+IGYpO1xuICAgIGlmIChtdWx0aUxpbmVGaWVsZHMgJiYgbXVsdGlMaW5lRmllbGRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICB7bXVsdGlMaW5lRmllbGRzLm1hcCgoZmllbGRzLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpZWxkcykge1xuICAgICAgICAgICAgICBjb25zdCBlZGl0b3IgPSBnZXRFZGl0b3JCeUZpZWxkKGZpZWxkcyk7XG4gICAgICAgICAgICAgIHRoaXMuZWRpdG9yUHJvcHMgPSBlZGl0b3IucHJvcHM7XG4gICAgICAgICAgICAgIGNvbnN0IHsgc3R5bGUgPSB7fSwgLi4ub3RoZXJQcm9wcyB9ID0gdGhpcy5lZGl0b3JQcm9wcztcbiAgICAgICAgICAgICAgaWYgKHJvd0hlaWdodCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgc3R5bGUuaGVpZ2h0ID0gcHhUb1JlbShyb3dIZWlnaHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0VkaXRvclByb3BzID0ge1xuICAgICAgICAgICAgICAgIC4uLm90aGVyUHJvcHMsXG4gICAgICAgICAgICAgICAgc3R5bGUsXG4gICAgICAgICAgICAgICAgcmVmOiBpbmRleCA9PT0gMCA/IHRoaXMuc2F2ZVJlZiA6ICcnLFxuICAgICAgICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZHMuZ2V0KCduYW1lJyksXG4gICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLmhhbmRsZUVkaXRvcktleURvd24sXG4gICAgICAgICAgICAgICAgb25FbnRlckRvd246IHRoaXMuaGFuZGxlRWRpdG9yS2V5RW50ZXJEb3duLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGFuZGxlRWRpdG9yQ2xpY2ssXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg6IC0xLFxuICAgICAgICAgICAgICAgIHNob3dIZWxwOiBTaG93SGVscC5ub25lLFxuICAgICAgICAgICAgICAgIC8vIOebruWJjea1i+ivlWlubGluZeaXtuWAmemcgOimgeaUvuW8gOmZkOWItlxuICAgICAgICAgICAgICAgIF9pblRhYmxlOiAhaW5saW5lRWRpdCxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8Um93IGtleT17YCR7cmVjb3JkPy5pbmRleH0tbXVsdGktJHtpbmRleH1gfSBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tbXVsdGlgfT5cbiAgICAgICAgICAgICAgICAgIDxDb2wgc3Bhbj17OH0gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LW11bHRpLWxhYmVsYH0+e2ZpZWxkcy5nZXQoJ2xhYmVsJyl9PC9Db2w+XG4gICAgICAgICAgICAgICAgICA8Q29sIHNwYW49ezE2fSBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tbXVsdGktdmFsdWVgfT57Y2xvbmVFbGVtZW50PEZvcm1GaWVsZFByb3BzPihlZGl0b3IsIG5ld0VkaXRvclByb3BzKX08L0NvbD5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyRWRpdG9yKCk6IFJlYWN0RWxlbWVudDxGb3JtRmllbGRQcm9wcz4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgY29sdW1uIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHsgZGF0YVNldCwgY3VycmVudEVkaXRSZWNvcmQsIHJvd0hlaWdodCwgcHJpc3RpbmUsIGlubGluZUVkaXQgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHJlY29yZCA9IGN1cnJlbnRFZGl0UmVjb3JkIHx8IGRhdGFTZXQuY3VycmVudDtcbiAgICBjb25zdCBmaWVsZCA9IHJlY29yZD8uZ2V0RmllbGQoY29sdW1uLm5hbWUpO1xuICAgIC8vIOWkmuihjOe8lui+keaLpuaIqui/lOWbnua4suafk+WZqFxuICAgIGlmICghcHJpc3RpbmUgJiYgZmllbGQgJiYgZmllbGQuZ2V0KCdtdWx0aUxpbmUnKSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTXVsdGlMaW5lRWRpdG9yKCk7XG4gICAgfVxuICAgIGNvbnN0IGNlbGxFZGl0b3IgPSBnZXRFZGl0b3JCeUNvbHVtbkFuZFJlY29yZChjb2x1bW4sIHJlY29yZCk7XG4gICAgaWYgKCFwcmlzdGluZSAmJiBpc1ZhbGlkRWxlbWVudChjZWxsRWRpdG9yKSAmJiAhaXNSYWRpbyhjZWxsRWRpdG9yKSkge1xuICAgICAgdGhpcy5lZGl0b3JQcm9wcyA9IGNlbGxFZGl0b3IucHJvcHM7XG4gICAgICBjb25zdCB7IHN0eWxlID0ge30sIC4uLm90aGVyUHJvcHMgfSA9IHRoaXMuZWRpdG9yUHJvcHM7XG4gICAgICBpZiAocm93SGVpZ2h0ICE9PSAnYXV0bycpIHtcbiAgICAgICAgc3R5bGUuaGVpZ2h0ID0gcHhUb1JlbShyb3dIZWlnaHQpO1xuICAgICAgfVxuICAgICAgY29uc3QgbmV3RWRpdG9yUHJvcHMgPSB7XG4gICAgICAgIC4uLm90aGVyUHJvcHMsXG4gICAgICAgIHN0eWxlLFxuICAgICAgICByZWY6IHRoaXMuc2F2ZVJlZixcbiAgICAgICAgcmVjb3JkLFxuICAgICAgICBuYW1lOiBjb2x1bW4ubmFtZSxcbiAgICAgICAgb25LZXlEb3duOiB0aGlzLmhhbmRsZUVkaXRvcktleURvd24sXG4gICAgICAgIG9uRW50ZXJEb3duOiB0aGlzLmhhbmRsZUVkaXRvcktleUVudGVyRG93bixcbiAgICAgICAgb25CbHVyOiB0aGlzLmhhbmRsZUVkaXRvckJsdXIsXG4gICAgICAgIHRhYkluZGV4OiAtMSxcbiAgICAgICAgc2hvd0hlbHA6IFNob3dIZWxwLm5vbmUsXG4gICAgICAgIC8vIOebruWJjea1i+ivlWlubGluZeaXtuWAmemcgOimgeaUvuW8gOmZkOWItlxuICAgICAgICBfaW5UYWJsZTogIWlubGluZUVkaXQsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNsb25lRWxlbWVudDxGb3JtRmllbGRQcm9wcz4oY2VsbEVkaXRvciwgbmV3RWRpdG9yUHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBlZGl0b3IgPSB0aGlzLnJlbmRlckVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcHJlZml4Q2xzLFxuICAgICAgICBjb2x1bW4sXG4gICAgICAgIGNvbHVtbjogeyBsb2NrLCBuYW1lIH0sXG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHByb3BzOiBhbnkgPSB7XG4gICAgICAgIGNsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1lZGl0b3JgLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IGVkaXRvclByb3BzOiBhbnkgPSB7fTtcbiAgICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgaWYgKHRhYmxlU3RvcmUuY3VycmVudEVkaXRvck5hbWUgPT09IG5hbWUgfHwgdGFibGVTdG9yZS5jdXJyZW50RWRpdFJlY29yZCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRFZGl0b3JOYW1lID0gbmFtZTtcbiAgICAgICAgY29uc3QgY2VsbCA9IGZpbmRDZWxsKHRhYmxlU3RvcmUsIHByZWZpeENscywgZ2V0Q29sdW1uS2V5KGNvbHVtbiksIGxvY2spO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHRoaXMuZWRpdGluZyA9IHRydWU7XG4gICAgICAgICAgY29uc3QgeyBvZmZzZXRMZWZ0LCBvZmZzZXRUb3AsIG9mZnNldFdpZHRoLCBvZmZzZXRIZWlnaHQgfSA9IGNlbGw7XG4gICAgICAgICAgcHJvcHMuc3R5bGUgPSB7XG4gICAgICAgICAgICBsZWZ0OiBweFRvUmVtKG9mZnNldExlZnQpLFxuICAgICAgICAgICAgdG9wOiBweFRvUmVtKG9mZnNldFRvcCksXG4gICAgICAgICAgfTtcbiAgICAgICAgICBlZGl0b3JQcm9wcy5zdHlsZSA9IHtcbiAgICAgICAgICAgIC4uLmVkaXRvci5wcm9wcy5zdHlsZSxcbiAgICAgICAgICAgIHdpZHRoOiBweFRvUmVtKG9mZnNldFdpZHRoKSxcbiAgICAgICAgICAgIGhlaWdodDogcHhUb1JlbShvZmZzZXRIZWlnaHQpLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0aW5nKSB7XG4gICAgICAgIHRoaXMuZWRpdGluZyA9IGZhbHNlO1xuICAgICAgICBlZGl0b3JQcm9wcy5vbkZvY3VzID0gdGhpcy5oYW5kbGVFZGl0b3JGb2N1cztcbiAgICAgIH1cbiAgICAgIHJldHVybiA8ZGl2IHsuLi5wcm9wc30+e2Nsb25lRWxlbWVudChlZGl0b3IsIGVkaXRvclByb3BzKX08L2Rpdj47XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbHVtbjogeyBuYW1lIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHRoaXMuZWRpdG9yICYmIHRoaXMuZWRpdGluZyAmJiB0YWJsZVN0b3JlLmN1cnJlbnRFZGl0b3JOYW1lID09PSBuYW1lKSB7XG4gICAgICB0aGlzLmVkaXRvci5mb2N1cygpO1xuICAgIH1cbiAgfVxufVxuIl0sInZlcnNpb24iOjN9