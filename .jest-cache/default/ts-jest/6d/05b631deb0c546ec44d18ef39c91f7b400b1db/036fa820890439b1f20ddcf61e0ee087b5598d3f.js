import { __decorate } from "tslib";
import Set from 'core-js/library/fn/set';
import React, { cloneElement } from 'react';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isString from 'lodash/isString';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, reaction, runInAction, toJS, } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Icon from '../../icon';
import { TextField } from '../../text-field/TextField';
import autobind from '../../_util/autobind';
import measureTextWidth from '../../_util/measureTextWidth';
import { getEditorByField } from '../utils';
import ObserverSelect from '../../select/Select';
import Option from '../../option/Option';
import isSameLike from '../../_util/isSameLike';
import { processFieldValue } from '../../data-set/utils';
let FilterSelect = class FilterSelect extends TextField {
    constructor(props, context) {
        super(props, context);
        this.setFilterText = debounce(action((text) => {
            this.filterText = text;
        }), 500);
        this.doQuery = throttle(() => {
            const { optionDataSet } = this.observableProps;
            optionDataSet.query();
        }, 500);
        const { observableProps } = this;
        this.on(observableProps.queryDataSet);
        this.reaction = reaction(() => observableProps.queryDataSet, this.on);
    }
    get value() {
        const { filter } = this.props;
        const { value, queryDataSet } = this.observableProps;
        if (value) {
            return filter ? value.filter(filter) : value;
        }
        const { paramName } = this.props;
        if (queryDataSet) {
            const { current } = queryDataSet;
            if (current) {
                const result = [];
                const keys = queryDataSet.fields.keys();
                [...new Set(paramName ? [...keys, paramName] : keys)].forEach((key) => {
                    if (key && (!filter || filter(key))) {
                        const values = current.get(key);
                        if (isArrayLike(values)) {
                            values.forEach(item => !isNil(item) && result.push(key));
                        }
                        else if (!isNil(values)) {
                            result.push(key);
                        }
                    }
                });
                return result;
            }
        }
        return undefined;
    }
    set value(value) {
        runInAction(() => {
            this.observableProps.value = value;
        });
    }
    getObservableProps(props, context) {
        return {
            ...super.getObservableProps(props, context),
            optionDataSet: props.optionDataSet,
            queryDataSet: props.queryDataSet,
        };
    }
    on(ds) {
        this.off();
        if (ds) {
            ds.addEventListener("update" /* update */, this.handleDataSetUpdate);
            ds.addEventListener("reset" /* reset */, this.handleDataSetReset);
        }
        this.queryDataSet = ds;
    }
    off() {
        const { queryDataSet } = this;
        if (queryDataSet) {
            queryDataSet.removeEventListener("update" /* update */, this.handleDataSetUpdate);
            queryDataSet.removeEventListener("reset" /* reset */, this.handleDataSetReset);
        }
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.setFilterText.cancel();
        this.off();
        this.reaction();
    }
    setText(text) {
        super.setText(text);
        this.setFilterText(text);
    }
    getPlaceholders() {
        if (!this.selectField) {
            return super.getPlaceholders();
        }
        return [];
    }
    getOtherProps() {
        return omit(super.getOtherProps(), [
            'paramName',
            'optionDataSet',
            'queryDataSet',
            'dropdownMenuStyle',
            'hiddenIfNone',
            'editable',
            'filter',
        ]);
    }
    getRootDomNode() {
        return this.element;
    }
    defaultRenderer({ value, repeat = 0 }) {
        const { paramName } = this.props;
        const { queryDataSet } = this.observableProps;
        if (queryDataSet) {
            const { current } = queryDataSet;
            if (current) {
                let fieldValue = current.get(value);
                if (value === paramName) {
                    return fieldValue;
                }
                const field = queryDataSet.getField(value);
                if (field) {
                    if (field.get('multiple')) {
                        fieldValue = (fieldValue || [])[repeat];
                    }
                    if (field.get('bind') || !fieldValue)
                        return;
                    return `${this.getFieldLabel(field)}: ${processFieldValue(isPlainObject(fieldValue) ? fieldValue : super.processValue(fieldValue), field, this.lang)}`;
                }
                return value;
            }
        }
    }
    getQueryRecord() {
        const { queryDataSet } = this.observableProps;
        if (queryDataSet) {
            return queryDataSet.current;
        }
    }
    getQueryField(fieldName) {
        const { queryDataSet } = this.observableProps;
        if (queryDataSet) {
            return queryDataSet.getField(fieldName);
        }
    }
    addQueryParams(value) {
        const { paramName } = this.props;
        if (paramName) {
            this.setQueryValue(paramName, value);
        }
    }
    afterRemoveValue(value, repeat) {
        const values = this.getQueryValues(value);
        if (repeat === -1) {
            values.pop();
        }
        else {
            values.splice(repeat, 1);
        }
        const multiple = this.getQueryFieldMultiple(value);
        this.setQueryValue(value, multiple ? values : values[0]);
    }
    getQueryFieldMultiple(value) {
        const { paramName } = this.props;
        if (paramName !== value) {
            const field = this.getQueryField(value);
            if (field && field.get('multiple')) {
                return true;
            }
        }
        return false;
    }
    handleDataSetReset() {
        this.setValue(undefined);
    }
    handleDataSetUpdate({ name, value }) {
        const values = this.getValues();
        if (isArrayLike(value)) {
            const { length } = value;
            if (length) {
                let repeat = 0;
                const filtered = values.filter(item => {
                    if (item === name) {
                        repeat += 1;
                        if (repeat > length) {
                            return false;
                        }
                    }
                    return true;
                });
                for (let i = 0, n = length - repeat; i < n; i += 1) {
                    filtered.push(name);
                }
                this.setValue(filtered);
            }
            else {
                this.setValue(values.filter(item => item !== name));
            }
        }
        else if (isNil(value)) {
            this.setValue(values.filter(item => item !== name));
        }
        else {
            if (values.indexOf(name) === -1) {
                values.push(name);
            }
            this.setValue(values);
        }
        this.doQuery();
    }
    handleBlur(e) {
        super.handleBlur(e);
        this.setSelectField(undefined);
    }
    isEditorReadOnly() {
        const { paramName, editable } = this.props;
        return (this.getQueryValues(paramName).length > 0 && !this.selectField) || !editable;
    }
    handleFieldChange(value) {
        const { selectField } = this;
        if (selectField) {
            const { name } = selectField;
            this.setQueryValue(name, value);
        }
        else if (isString(value)) {
            this.addQueryParams(value);
            if (this.isFocused) {
                this.element.expand();
            }
        }
        else {
            this.setSelectField(value);
        }
    }
    handleInput(e) {
        this.setText(e.target.value);
    }
    handleFieldEnterDown() {
        defer(() => this.focus());
    }
    handleKeyDown(e) {
        if (this.selectField) {
            if (e.keyCode === KeyCode.BACKSPACE && !this.text) {
                this.setSelectField(undefined);
            }
        }
        else {
            super.handleKeyDown(e);
        }
    }
    handleEnterDown() { }
    setSelectField(value) {
        this.selectField = value;
        this.setFilterText(undefined);
    }
    getQueryValues(fieldName) {
        const current = this.getQueryRecord();
        if (current) {
            return [].concat(toJS(current.get(fieldName)) || []);
        }
        return [];
    }
    syncValueOnBlur() { }
    setQueryValue(fieldName, value) {
        const current = this.getQueryRecord();
        if (current) {
            current.set(fieldName, value);
        }
        this.setSelectField(undefined);
    }
    getFieldLabel(field) {
        return field.get('label') || field.name;
    }
    multipleFieldExistsValue(field, current) {
        if (field.get('multiple')) {
            const { options } = field;
            if (options && current) {
                const values = current.get(field.name);
                const valueField = field.get('valueField');
                return options.some(r => !values.some(value => isSameLike(r.get(valueField), value)));
            }
        }
        return false;
    }
    getInputFilterOptions(filterText) {
        const { optionDataSet, optionDataSet: { fields }, } = this.observableProps;
        const values = new Set();
        optionDataSet.forEach(record => {
            [...fields.keys()].forEach(key => {
                const value = record.get(key);
                if (isString(value) && value.toLowerCase().indexOf(filterText.toLowerCase()) !== -1) {
                    values.add(value);
                }
            });
        });
        return [...values].map(value => (React.createElement(Option, { key: value, value: value }, value)));
    }
    getFieldSelectOptions() {
        const { paramName } = this.props;
        const { queryDataSet } = this.observableProps;
        const data = [];
        if (queryDataSet) {
            [...queryDataSet.fields.entries()].forEach(([key, field]) => {
                if (key !== paramName &&
                    (this.getValues().indexOf(key) === -1 ||
                        this.multipleFieldExistsValue(field, this.getQueryRecord())) &&
                    !field.get('bind')) {
                    data.push(React.createElement(Option, { key: key, value: field }, this.getFieldLabel(field)));
                }
            });
        }
        return data;
    }
    getFieldEditor(props, selectField) {
        const editor = getEditorByField(selectField);
        const editorProps = {
            ...props,
            key: 'value',
            record: this.getQueryRecord(),
            name: selectField.name,
            autoFocus: true,
            onInput: this.handleInput,
            onEnterDown: this.handleFieldEnterDown,
            renderer: noop,
        };
        if (editor.type === ObserverSelect) {
            editorProps.dropdownMenuStyle = this.props.dropdownMenuStyle;
            editorProps.dropdownMatchSelectWidth = false;
        }
        return cloneElement(editor, editorProps);
    }
    getFieldSelect(props) {
        const { filterText, props: { dropdownMenuStyle }, } = this;
        const editable = !this.isEditorReadOnly();
        const options = editable && filterText
            ? this.getInputFilterOptions(filterText)
            : this.getFieldSelectOptions();
        return (React.createElement(ObserverSelect, Object.assign({}, props, { key: "key", combo: editable, searchable: editable, value: null, onInput: this.handleInput, onEnterDown: this.handleFieldEnterDown, autoFocus: this.isFocused, dropdownMenuStyle: dropdownMenuStyle, dropdownMatchSelectWidth: false }), options));
    }
    clear() {
        const record = this.getQueryRecord();
        if (record) {
            record.clear();
        }
    }
    renderWrapper() {
        const { hiddenIfNone } = this.props;
        if (this.isEmpty() && hiddenIfNone) {
            return null;
        }
        return super.renderWrapper();
    }
    renderMultipleEditor(props) {
        const { text, selectField, prefixCls } = this;
        const editorProps = {
            ...omit(props, ['multiple', 'prefixCls']),
            clearButton: false,
            prefix: null,
            suffix: null,
            elementClassName: `${prefixCls}-inner-editor`,
            onChange: this.handleFieldChange,
        };
        if (text) {
            editorProps.style = { width: pxToRem(measureTextWidth(text)) };
        }
        return (React.createElement("li", { key: "text" },
            selectField ? (React.createElement("span", { className: `${prefixCls}-select-field` },
                this.getFieldLabel(selectField),
                ":")) : null,
            selectField
                ? this.getFieldEditor(editorProps, selectField)
                : this.getFieldSelect(editorProps)));
    }
};
FilterSelect.defaultProps = {
    ...TextField.defaultProps,
    multiple: true,
    clearButton: true,
    editable: true,
    prefix: React.createElement(Icon, { type: "filter_list" }),
    dropdownMenuStyle: { minWidth: pxToRem(180) },
};
__decorate([
    observable
], FilterSelect.prototype, "selectField", void 0);
__decorate([
    observable
], FilterSelect.prototype, "filterText", void 0);
__decorate([
    computed
], FilterSelect.prototype, "value", null);
__decorate([
    autobind
], FilterSelect.prototype, "on", null);
__decorate([
    action
], FilterSelect.prototype, "setText", null);
__decorate([
    autobind
], FilterSelect.prototype, "getRootDomNode", null);
__decorate([
    autobind
], FilterSelect.prototype, "defaultRenderer", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleDataSetReset", null);
__decorate([
    autobind,
    action
], FilterSelect.prototype, "handleDataSetUpdate", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleBlur", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleFieldChange", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleInput", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleFieldEnterDown", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleKeyDown", null);
__decorate([
    autobind
], FilterSelect.prototype, "handleEnterDown", null);
__decorate([
    action
], FilterSelect.prototype, "setSelectField", null);
__decorate([
    action
], FilterSelect.prototype, "setQueryValue", null);
__decorate([
    action
], FilterSelect.prototype, "clear", null);
FilterSelect = __decorate([
    observer
], FilterSelect);
export default FilterSelect;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3F1ZXJ5LWJhci9GaWx0ZXJTZWxlY3QudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEdBQUcsTUFBTSx3QkFBd0IsQ0FBQztBQUN6QyxPQUFPLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBMEMsTUFBTSxPQUFPLENBQUM7QUFDcEYsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sYUFBYSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUNMLE1BQU0sRUFDTixRQUFRLEVBRVIsV0FBVyxFQUNYLFVBQVUsRUFDVixRQUFRLEVBQ1IsV0FBVyxFQUNYLElBQUksR0FDTCxNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRCxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLElBQUksTUFBTSxZQUFZLENBQUM7QUFFOUIsT0FBTyxFQUFFLFNBQVMsRUFBa0IsTUFBTSw0QkFBNEIsQ0FBQztBQUd2RSxPQUFPLFFBQVEsTUFBTSxzQkFBc0IsQ0FBQztBQUU1QyxPQUFPLGdCQUFnQixNQUFNLDhCQUE4QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM1QyxPQUFPLGNBQStCLE1BQU0scUJBQXFCLENBQUM7QUFDbEUsT0FB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TjtBQStHRDtJQURDLE1BQU07eUNBTU47QUFwYmtCLFlBQVk7SUFEaEMsUUFBUTtHQUNZLFlBQVksQ0FzZGhDO2VBdGRvQixZQUFZIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby90YWJsZS9xdWVyeS1iYXIvRmlsdGVyU2VsZWN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2V0IGZyb20gJ2NvcmUtanMvbGlicmFyeS9mbi9zZXQnO1xuaW1wb3J0IFJlYWN0LCB7IGNsb25lRWxlbWVudCwgQ1NTUHJvcGVydGllcywgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdsb2Rhc2gvaXNQbGFpbk9iamVjdCc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCBkZWZlciBmcm9tICdsb2Rhc2gvZGVmZXInO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC9kZWJvdW5jZSc7XG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoL3Rocm90dGxlJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7XG4gIGFjdGlvbixcbiAgY29tcHV0ZWQsXG4gIElSZWFjdGlvbkRpc3Bvc2VyLFxuICBpc0FycmF5TGlrZSxcbiAgb2JzZXJ2YWJsZSxcbiAgcmVhY3Rpb24sXG4gIHJ1bkluQWN0aW9uLFxuICB0b0pTLFxufSBmcm9tICdtb2J4JztcbmltcG9ydCB7IHB4VG9SZW0gfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL1VuaXRDb252ZXJ0b3InO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCBJY29uIGZyb20gJy4uLy4uL2ljb24nO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uL2RhdGEtc2V0L0ZpZWxkJztcbmltcG9ydCB7IFRleHRGaWVsZCwgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICcuLi8uLi90ZXh0LWZpZWxkL1RleHRGaWVsZCc7XG5pbXBvcnQgRGF0YVNldCBmcm9tICcuLi8uLi9kYXRhLXNldC9EYXRhU2V0JztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi4vLi4vZGF0YS1zZXQvUmVjb3JkJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi8uLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBGb3JtRmllbGRQcm9wcywgUmVuZGVyUHJvcHMgfSBmcm9tICcuLi8uLi9maWVsZC9Gb3JtRmllbGQnO1xuaW1wb3J0IG1lYXN1cmVUZXh0V2lkdGggZnJvbSAnLi4vLi4vX3V0aWwvbWVhc3VyZVRleHRXaWR0aCc7XG5pbXBvcnQgeyBnZXRFZGl0b3JCeUZpZWxkIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IE9ic2VydmVyU2VsZWN0LCB7IFNlbGVjdFByb3BzIH0gZnJvbSAnLi4vLi4vc2VsZWN0L1NlbGVjdCc7XG5pbXBvcnQgT3B0aW9uLCB7IE9wdGlvblByb3BzIH0gZnJvbSAnLi4vLi4vb3B0aW9uL09wdGlvbic7XG5pbXBvcnQgaXNTYW1lTGlrZSBmcm9tICcuLi8uLi9fdXRpbC9pc1NhbWVMaWtlJztcbmltcG9ydCB7IERhdGFTZXRFdmVudHMgfSBmcm9tICcuLi8uLi9kYXRhLXNldC9lbnVtJztcbmltcG9ydCB7IHByb2Nlc3NGaWVsZFZhbHVlIH0gZnJvbSAnLi4vLi4vZGF0YS1zZXQvdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclNlbGVjdFByb3BzIGV4dGVuZHMgVGV4dEZpZWxkUHJvcHMge1xuICBwYXJhbU5hbWU/OiBzdHJpbmc7XG4gIG9wdGlvbkRhdGFTZXQ6IERhdGFTZXQ7XG4gIHF1ZXJ5RGF0YVNldD86IERhdGFTZXQ7XG4gIGRyb3Bkb3duTWVudVN0eWxlPzogQ1NTUHJvcGVydGllcztcbiAgZWRpdGFibGU/OiBib29sZWFuO1xuICBoaWRkZW5JZk5vbmU/OiBib29sZWFuO1xuICBmaWx0ZXI/OiAoc3RyaW5nKSA9PiBib29sZWFuO1xufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbHRlclNlbGVjdCBleHRlbmRzIFRleHRGaWVsZDxGaWx0ZXJTZWxlY3RQcm9wcz4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIC4uLlRleHRGaWVsZC5kZWZhdWx0UHJvcHMsXG4gICAgbXVsdGlwbGU6IHRydWUsXG4gICAgY2xlYXJCdXR0b246IHRydWUsXG4gICAgZWRpdGFibGU6IHRydWUsXG4gICAgcHJlZml4OiA8SWNvbiB0eXBlPVwiZmlsdGVyX2xpc3RcIiAvPixcbiAgICBkcm9wZG93bk1lbnVTdHlsZTogeyBtaW5XaWR0aDogcHhUb1JlbSgxODApIH0sXG4gIH07XG5cbiAgQG9ic2VydmFibGUgc2VsZWN0RmllbGQ/OiBGaWVsZDtcblxuICBAb2JzZXJ2YWJsZSBmaWx0ZXJUZXh0Pzogc3RyaW5nO1xuXG4gIHF1ZXJ5RGF0YVNldD86IERhdGFTZXQ7XG5cbiAgcmVhY3Rpb246IElSZWFjdGlvbkRpc3Bvc2VyO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsdWUoKTogYW55IHtcbiAgICBjb25zdCB7IGZpbHRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHZhbHVlLCBxdWVyeURhdGFTZXQgfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZpbHRlciA/IHZhbHVlLmZpbHRlcihmaWx0ZXIpIDogdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IHsgcGFyYW1OYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChxdWVyeURhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gcXVlcnlEYXRhU2V0O1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCBrZXlzID0gcXVlcnlEYXRhU2V0LmZpZWxkcy5rZXlzKCk7XG4gICAgICAgIFsuLi5uZXcgU2V0KHBhcmFtTmFtZSA/IFsuLi5rZXlzLCBwYXJhbU5hbWVdIDoga2V5cyldLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKGtleSAmJiAoIWZpbHRlciB8fCBmaWx0ZXIoa2V5KSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IGN1cnJlbnQuZ2V0KGtleSk7XG4gICAgICAgICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWVzKSkge1xuICAgICAgICAgICAgICB2YWx1ZXMuZm9yRWFjaChpdGVtID0+ICFpc05pbChpdGVtKSAmJiByZXN1bHQucHVzaChrZXkpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzTmlsKHZhbHVlcykpIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLm9ic2VydmFibGVQcm9wcy52YWx1ZSA9IHZhbHVlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRGaWx0ZXJUZXh0ID0gZGVib3VuY2UoXG4gICAgYWN0aW9uKCh0ZXh0Pzogc3RyaW5nKSA9PiB7XG4gICAgICB0aGlzLmZpbHRlclRleHQgPSB0ZXh0O1xuICAgIH0pLFxuICAgIDUwMCxcbiAgKTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICBjb25zdCB7IG9ic2VydmFibGVQcm9wcyB9ID0gdGhpcztcbiAgICB0aGlzLm9uKG9ic2VydmFibGVQcm9wcy5xdWVyeURhdGFTZXQpO1xuICAgIHRoaXMucmVhY3Rpb24gPSByZWFjdGlvbigoKSA9PiBvYnNlcnZhYmxlUHJvcHMucXVlcnlEYXRhU2V0LCB0aGlzLm9uKTtcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dDogYW55KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLmdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCksXG4gICAgICBvcHRpb25EYXRhU2V0OiBwcm9wcy5vcHRpb25EYXRhU2V0LFxuICAgICAgcXVlcnlEYXRhU2V0OiBwcm9wcy5xdWVyeURhdGFTZXQsXG4gICAgfTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBvbihkcz86IERhdGFTZXQpIHtcbiAgICB0aGlzLm9mZigpO1xuICAgIGlmIChkcykge1xuICAgICAgZHMuYWRkRXZlbnRMaXN0ZW5lcihEYXRhU2V0RXZlbnRzLnVwZGF0ZSwgdGhpcy5oYW5kbGVEYXRhU2V0VXBkYXRlKTtcbiAgICAgIGRzLmFkZEV2ZW50TGlzdGVuZXIoRGF0YVNldEV2ZW50cy5yZXNldCwgdGhpcy5oYW5kbGVEYXRhU2V0UmVzZXQpO1xuICAgIH1cbiAgICB0aGlzLnF1ZXJ5RGF0YVNldCA9IGRzO1xuICB9XG5cbiAgb2ZmKCkge1xuICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSB0aGlzO1xuICAgIGlmIChxdWVyeURhdGFTZXQpIHtcbiAgICAgIHF1ZXJ5RGF0YVNldC5yZW1vdmVFdmVudExpc3RlbmVyKERhdGFTZXRFdmVudHMudXBkYXRlLCB0aGlzLmhhbmRsZURhdGFTZXRVcGRhdGUpO1xuICAgICAgcXVlcnlEYXRhU2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoRGF0YVNldEV2ZW50cy5yZXNldCwgdGhpcy5oYW5kbGVEYXRhU2V0UmVzZXQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgdGhpcy5zZXRGaWx0ZXJUZXh0LmNhbmNlbCgpO1xuICAgIHRoaXMub2ZmKCk7XG4gICAgdGhpcy5yZWFjdGlvbigpO1xuICB9XG5cbiAgZG9RdWVyeSA9IHRocm90dGxlKCgpID0+IHtcbiAgICBjb25zdCB7IG9wdGlvbkRhdGFTZXQgfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIG9wdGlvbkRhdGFTZXQucXVlcnkoKTtcbiAgfSwgNTAwKTtcblxuICBAYWN0aW9uXG4gIHNldFRleHQodGV4dCkge1xuICAgIHN1cGVyLnNldFRleHQodGV4dCk7XG4gICAgdGhpcy5zZXRGaWx0ZXJUZXh0KHRleHQpO1xuICB9XG5cbiAgZ2V0UGxhY2Vob2xkZXJzKCk6IHN0cmluZ1tdIHtcbiAgICBpZiAoIXRoaXMuc2VsZWN0RmllbGQpIHtcbiAgICAgIHJldHVybiBzdXBlci5nZXRQbGFjZWhvbGRlcnMoKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICByZXR1cm4gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICdwYXJhbU5hbWUnLFxuICAgICAgJ29wdGlvbkRhdGFTZXQnLFxuICAgICAgJ3F1ZXJ5RGF0YVNldCcsXG4gICAgICAnZHJvcGRvd25NZW51U3R5bGUnLFxuICAgICAgJ2hpZGRlbklmTm9uZScsXG4gICAgICAnZWRpdGFibGUnLFxuICAgICAgJ2ZpbHRlcicsXG4gICAgXSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgZ2V0Um9vdERvbU5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBkZWZhdWx0UmVuZGVyZXIoeyB2YWx1ZSwgcmVwZWF0ID0gMCB9OiBSZW5kZXJQcm9wcykge1xuICAgIGNvbnN0IHsgcGFyYW1OYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAocXVlcnlEYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IGN1cnJlbnQgfSA9IHF1ZXJ5RGF0YVNldDtcbiAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgIGxldCBmaWVsZFZhbHVlID0gY3VycmVudC5nZXQodmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgPT09IHBhcmFtTmFtZSkge1xuICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpZWxkID0gcXVlcnlEYXRhU2V0LmdldEZpZWxkKHZhbHVlKTtcbiAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgaWYgKGZpZWxkLmdldCgnbXVsdGlwbGUnKSkge1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IChmaWVsZFZhbHVlIHx8IFtdKVtyZXBlYXRdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZmllbGQuZ2V0KCdiaW5kJykgfHwgIWZpZWxkVmFsdWUpIHJldHVybjtcbiAgICAgICAgICByZXR1cm4gYCR7dGhpcy5nZXRGaWVsZExhYmVsKGZpZWxkKX06ICR7cHJvY2Vzc0ZpZWxkVmFsdWUoXG4gICAgICAgICAgICBpc1BsYWluT2JqZWN0KGZpZWxkVmFsdWUpID8gZmllbGRWYWx1ZSA6IHN1cGVyLnByb2Nlc3NWYWx1ZShmaWVsZFZhbHVlKSxcbiAgICAgICAgICAgIGZpZWxkLFxuICAgICAgICAgICAgdGhpcy5sYW5nLFxuICAgICAgICAgICl9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UXVlcnlSZWNvcmQoKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHF1ZXJ5RGF0YVNldCB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgaWYgKHF1ZXJ5RGF0YVNldCkge1xuICAgICAgcmV0dXJuIHF1ZXJ5RGF0YVNldC5jdXJyZW50O1xuICAgIH1cbiAgfVxuXG4gIGdldFF1ZXJ5RmllbGQoZmllbGROYW1lKTogRmllbGQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAocXVlcnlEYXRhU2V0KSB7XG4gICAgICByZXR1cm4gcXVlcnlEYXRhU2V0LmdldEZpZWxkKGZpZWxkTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgYWRkUXVlcnlQYXJhbXModmFsdWUpIHtcbiAgICBjb25zdCB7IHBhcmFtTmFtZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAocGFyYW1OYW1lKSB7XG4gICAgICB0aGlzLnNldFF1ZXJ5VmFsdWUocGFyYW1OYW1lISwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGFmdGVyUmVtb3ZlVmFsdWUodmFsdWUsIHJlcGVhdDogbnVtYmVyKSB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5nZXRRdWVyeVZhbHVlcyh2YWx1ZSk7XG4gICAgaWYgKHJlcGVhdCA9PT0gLTEpIHtcbiAgICAgIHZhbHVlcy5wb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVzLnNwbGljZShyZXBlYXQsIDEpO1xuICAgIH1cbiAgICBjb25zdCBtdWx0aXBsZSA9IHRoaXMuZ2V0UXVlcnlGaWVsZE11bHRpcGxlKHZhbHVlKTtcbiAgICB0aGlzLnNldFF1ZXJ5VmFsdWUodmFsdWUsIG11bHRpcGxlID8gdmFsdWVzIDogdmFsdWVzWzBdKTtcbiAgfVxuXG4gIGdldFF1ZXJ5RmllbGRNdWx0aXBsZSh2YWx1ZSkge1xuICAgIGNvbnN0IHsgcGFyYW1OYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChwYXJhbU5hbWUgIT09IHZhbHVlKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZ2V0UXVlcnlGaWVsZCh2YWx1ZSk7XG4gICAgICBpZiAoZmllbGQgJiYgZmllbGQuZ2V0KCdtdWx0aXBsZScpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRGF0YVNldFJlc2V0KCkge1xuICAgIHRoaXMuc2V0VmFsdWUodW5kZWZpbmVkKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBAYWN0aW9uXG4gIGhhbmRsZURhdGFTZXRVcGRhdGUoeyBuYW1lLCB2YWx1ZSB9KSB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpKSB7XG4gICAgICBjb25zdCB7IGxlbmd0aCB9ID0gdmFsdWU7XG4gICAgICBpZiAobGVuZ3RoKSB7XG4gICAgICAgIGxldCByZXBlYXQgPSAwO1xuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHZhbHVlcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gPT09IG5hbWUpIHtcbiAgICAgICAgICAgIHJlcGVhdCArPSAxO1xuICAgICAgICAgICAgaWYgKHJlcGVhdCA+IGxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIG4gPSBsZW5ndGggLSByZXBlYXQ7IGkgPCBuOyBpICs9IDEpIHtcbiAgICAgICAgICBmaWx0ZXJlZC5wdXNoKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0VmFsdWUoZmlsdGVyZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh2YWx1ZXMuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gbmFtZSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNOaWwodmFsdWUpKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHZhbHVlcy5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBuYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2YWx1ZXMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgdmFsdWVzLnB1c2gobmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFZhbHVlKHZhbHVlcyk7XG4gICAgfVxuICAgIHRoaXMuZG9RdWVyeSgpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJsdXIoZSkge1xuICAgIHN1cGVyLmhhbmRsZUJsdXIoZSk7XG4gICAgdGhpcy5zZXRTZWxlY3RGaWVsZCh1bmRlZmluZWQpO1xuICB9XG5cbiAgaXNFZGl0b3JSZWFkT25seSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHBhcmFtTmFtZSwgZWRpdGFibGUgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuICh0aGlzLmdldFF1ZXJ5VmFsdWVzKHBhcmFtTmFtZSkubGVuZ3RoID4gMCAmJiAhdGhpcy5zZWxlY3RGaWVsZCkgfHwgIWVkaXRhYmxlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUZpZWxkQ2hhbmdlKHZhbHVlKSB7XG4gICAgY29uc3QgeyBzZWxlY3RGaWVsZCB9ID0gdGhpcztcbiAgICBpZiAoc2VsZWN0RmllbGQpIHtcbiAgICAgIGNvbnN0IHsgbmFtZSB9ID0gc2VsZWN0RmllbGQ7XG4gICAgICB0aGlzLnNldFF1ZXJ5VmFsdWUobmFtZSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICB0aGlzLmFkZFF1ZXJ5UGFyYW1zKHZhbHVlKTtcbiAgICAgIGlmICh0aGlzLmlzRm9jdXNlZCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuZXhwYW5kKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U2VsZWN0RmllbGQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVJbnB1dChlKSB7XG4gICAgdGhpcy5zZXRUZXh0KGUudGFyZ2V0LnZhbHVlKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVGaWVsZEVudGVyRG93bigpIHtcbiAgICBkZWZlcigoKSA9PiB0aGlzLmZvY3VzKCkpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUtleURvd24oZSkge1xuICAgIGlmICh0aGlzLnNlbGVjdEZpZWxkKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSBLZXlDb2RlLkJBQ0tTUEFDRSAmJiAhdGhpcy50ZXh0KSB7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0RmllbGQodW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuaGFuZGxlS2V5RG93bihlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlRW50ZXJEb3duKCkge31cblxuICBAYWN0aW9uXG4gIHNldFNlbGVjdEZpZWxkKHZhbHVlKSB7XG4gICAgdGhpcy5zZWxlY3RGaWVsZCA9IHZhbHVlO1xuICAgIHRoaXMuc2V0RmlsdGVyVGV4dCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0UXVlcnlWYWx1ZXMoZmllbGROYW1lKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMuZ2V0UXVlcnlSZWNvcmQoKTtcbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdCh0b0pTKGN1cnJlbnQuZ2V0KGZpZWxkTmFtZSkpIHx8IFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgc3luY1ZhbHVlT25CbHVyKCkge31cblxuICBAYWN0aW9uXG4gIHNldFF1ZXJ5VmFsdWUoZmllbGROYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5nZXRRdWVyeVJlY29yZCgpO1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBjdXJyZW50LnNldChmaWVsZE5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy5zZXRTZWxlY3RGaWVsZCh1bmRlZmluZWQpO1xuICB9XG5cbiAgZ2V0RmllbGRMYWJlbChmaWVsZDogRmllbGQpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiBmaWVsZC5nZXQoJ2xhYmVsJykgfHwgZmllbGQubmFtZTtcbiAgfVxuXG4gIG11bHRpcGxlRmllbGRFeGlzdHNWYWx1ZShmaWVsZDogRmllbGQsIGN1cnJlbnQ/OiBSZWNvcmQpOiBib29sZWFuIHtcbiAgICBpZiAoZmllbGQuZ2V0KCdtdWx0aXBsZScpKSB7XG4gICAgICBjb25zdCB7IG9wdGlvbnMgfSA9IGZpZWxkO1xuICAgICAgaWYgKG9wdGlvbnMgJiYgY3VycmVudCkge1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBjdXJyZW50LmdldChmaWVsZC5uYW1lKTtcbiAgICAgICAgY29uc3QgdmFsdWVGaWVsZCA9IGZpZWxkLmdldCgndmFsdWVGaWVsZCcpO1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5zb21lKHIgPT4gIXZhbHVlcy5zb21lKHZhbHVlID0+IGlzU2FtZUxpa2Uoci5nZXQodmFsdWVGaWVsZCksIHZhbHVlKSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXRJbnB1dEZpbHRlck9wdGlvbnMoZmlsdGVyVGV4dDogc3RyaW5nKTogUmVhY3RFbGVtZW50PE9wdGlvblByb3BzPltdIHtcbiAgICBjb25zdCB7XG4gICAgICBvcHRpb25EYXRhU2V0LFxuICAgICAgb3B0aW9uRGF0YVNldDogeyBmaWVsZHMgfSxcbiAgICB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgY29uc3QgdmFsdWVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIG9wdGlvbkRhdGFTZXQuZm9yRWFjaChyZWNvcmQgPT4ge1xuICAgICAgWy4uLmZpZWxkcy5rZXlzKCldLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZWNvcmQuZ2V0KGtleSk7XG4gICAgICAgIGlmIChpc1N0cmluZyh2YWx1ZSkgJiYgdmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlclRleHQudG9Mb3dlckNhc2UoKSkgIT09IC0xKSB7XG4gICAgICAgICAgdmFsdWVzLmFkZCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBbLi4udmFsdWVzXS5tYXAodmFsdWUgPT4gKFxuICAgICAgPE9wdGlvbiBrZXk9e3ZhbHVlfSB2YWx1ZT17dmFsdWV9PlxuICAgICAgICB7dmFsdWV9XG4gICAgICA8L09wdGlvbj5cbiAgICApKTtcbiAgfVxuXG4gIGdldEZpZWxkU2VsZWN0T3B0aW9ucygpOiBSZWFjdEVsZW1lbnQ8T3B0aW9uUHJvcHM+W10ge1xuICAgIGNvbnN0IHsgcGFyYW1OYW1lIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBjb25zdCBkYXRhOiBSZWFjdEVsZW1lbnQ8T3B0aW9uUHJvcHM+W10gPSBbXTtcbiAgICBpZiAocXVlcnlEYXRhU2V0KSB7XG4gICAgICBbLi4ucXVlcnlEYXRhU2V0LmZpZWxkcy5lbnRyaWVzKCldLmZvckVhY2goKFtrZXksIGZpZWxkXSkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAga2V5ICE9PSBwYXJhbU5hbWUgJiZcbiAgICAgICAgICAodGhpcy5nZXRWYWx1ZXMoKS5pbmRleE9mKGtleSkgPT09IC0xIHx8XG4gICAgICAgICAgICB0aGlzLm11bHRpcGxlRmllbGRFeGlzdHNWYWx1ZShmaWVsZCwgdGhpcy5nZXRRdWVyeVJlY29yZCgpKSkgJiZcbiAgICAgICAgICAhZmllbGQuZ2V0KCdiaW5kJylcbiAgICAgICAgKSB7XG4gICAgICAgICAgZGF0YS5wdXNoKFxuICAgICAgICAgICAgPE9wdGlvbiBrZXk9e2tleX0gdmFsdWU9e2ZpZWxkfT5cbiAgICAgICAgICAgICAge3RoaXMuZ2V0RmllbGRMYWJlbChmaWVsZCl9XG4gICAgICAgICAgICA8L09wdGlvbj4sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZ2V0RmllbGRFZGl0b3IocHJvcHMsIHNlbGVjdEZpZWxkOiBGaWVsZCk6IFJlYWN0RWxlbWVudDxGb3JtRmllbGRQcm9wcz4ge1xuICAgIGNvbnN0IGVkaXRvcjogUmVhY3RFbGVtZW50PEZvcm1GaWVsZFByb3BzPiA9IGdldEVkaXRvckJ5RmllbGQoc2VsZWN0RmllbGQpO1xuICAgIGNvbnN0IGVkaXRvclByb3BzOiBGb3JtRmllbGRQcm9wcyA9IHtcbiAgICAgIC4uLnByb3BzLFxuICAgICAga2V5OiAndmFsdWUnLFxuICAgICAgcmVjb3JkOiB0aGlzLmdldFF1ZXJ5UmVjb3JkKCksXG4gICAgICBuYW1lOiBzZWxlY3RGaWVsZC5uYW1lLFxuICAgICAgYXV0b0ZvY3VzOiB0cnVlLFxuICAgICAgb25JbnB1dDogdGhpcy5oYW5kbGVJbnB1dCxcbiAgICAgIG9uRW50ZXJEb3duOiB0aGlzLmhhbmRsZUZpZWxkRW50ZXJEb3duLFxuICAgICAgcmVuZGVyZXI6IG5vb3AsXG4gICAgfTtcblxuICAgIGlmIChlZGl0b3IudHlwZSA9PT0gKE9ic2VydmVyU2VsZWN0IGFzIGFueSkpIHtcbiAgICAgIChlZGl0b3JQcm9wcyBhcyBTZWxlY3RQcm9wcykuZHJvcGRvd25NZW51U3R5bGUgPSB0aGlzLnByb3BzLmRyb3Bkb3duTWVudVN0eWxlO1xuICAgICAgKGVkaXRvclByb3BzIGFzIFNlbGVjdFByb3BzKS5kcm9wZG93bk1hdGNoU2VsZWN0V2lkdGggPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lRWxlbWVudDxGb3JtRmllbGRQcm9wcz4oZWRpdG9yLCBlZGl0b3JQcm9wcyk7XG4gIH1cblxuICBnZXRGaWVsZFNlbGVjdChwcm9wcyk6IFJlYWN0RWxlbWVudDxTZWxlY3RQcm9wcz4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGZpbHRlclRleHQsXG4gICAgICBwcm9wczogeyBkcm9wZG93bk1lbnVTdHlsZSB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGVkaXRhYmxlID0gIXRoaXMuaXNFZGl0b3JSZWFkT25seSgpO1xuICAgIGNvbnN0IG9wdGlvbnMgPVxuICAgICAgZWRpdGFibGUgJiYgZmlsdGVyVGV4dFxuICAgICAgICA/IHRoaXMuZ2V0SW5wdXRGaWx0ZXJPcHRpb25zKGZpbHRlclRleHQpXG4gICAgICAgIDogdGhpcy5nZXRGaWVsZFNlbGVjdE9wdGlvbnMoKTtcbiAgICByZXR1cm4gKFxuICAgICAgPE9ic2VydmVyU2VsZWN0XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAga2V5PVwia2V5XCJcbiAgICAgICAgY29tYm89e2VkaXRhYmxlfVxuICAgICAgICBzZWFyY2hhYmxlPXtlZGl0YWJsZX1cbiAgICAgICAgdmFsdWU9e251bGx9XG4gICAgICAgIG9uSW5wdXQ9e3RoaXMuaGFuZGxlSW5wdXR9XG4gICAgICAgIG9uRW50ZXJEb3duPXt0aGlzLmhhbmRsZUZpZWxkRW50ZXJEb3dufVxuICAgICAgICBhdXRvRm9jdXM9e3RoaXMuaXNGb2N1c2VkfVxuICAgICAgICBkcm9wZG93bk1lbnVTdHlsZT17ZHJvcGRvd25NZW51U3R5bGV9XG4gICAgICAgIGRyb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aD17ZmFsc2V9XG4gICAgICA+XG4gICAgICAgIHtvcHRpb25zfVxuICAgICAgPC9PYnNlcnZlclNlbGVjdD5cbiAgICApO1xuICB9XG5cbiAgQGFjdGlvblxuICBjbGVhcigpIHtcbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmdldFF1ZXJ5UmVjb3JkKCk7XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgcmVjb3JkLmNsZWFyKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyV3JhcHBlcigpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgaGlkZGVuSWZOb25lIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0aGlzLmlzRW1wdHkoKSAmJiBoaWRkZW5JZk5vbmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIucmVuZGVyV3JhcHBlcigpO1xuICB9XG5cbiAgcmVuZGVyTXVsdGlwbGVFZGl0b3IocHJvcHM6IEZpbHRlclNlbGVjdFByb3BzKSB7XG4gICAgY29uc3QgeyB0ZXh0LCBzZWxlY3RGaWVsZCwgcHJlZml4Q2xzIH0gPSB0aGlzO1xuICAgIGNvbnN0IGVkaXRvclByb3BzOiBGaWx0ZXJTZWxlY3RQcm9wcyA9IHtcbiAgICAgIC4uLm9taXQocHJvcHMsIFsnbXVsdGlwbGUnLCAncHJlZml4Q2xzJ10pLFxuICAgICAgY2xlYXJCdXR0b246IGZhbHNlLFxuICAgICAgcHJlZml4OiBudWxsLFxuICAgICAgc3VmZml4OiBudWxsLFxuICAgICAgZWxlbWVudENsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1pbm5lci1lZGl0b3JgLFxuICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlRmllbGRDaGFuZ2UsXG4gICAgfTtcbiAgICBpZiAodGV4dCkge1xuICAgICAgZWRpdG9yUHJvcHMuc3R5bGUgPSB7IHdpZHRoOiBweFRvUmVtKG1lYXN1cmVUZXh0V2lkdGgodGV4dCkpIH07XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8bGkga2V5PVwidGV4dFwiPlxuICAgICAgICB7c2VsZWN0RmllbGQgPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXNlbGVjdC1maWVsZGB9Pnt0aGlzLmdldEZpZWxkTGFiZWwoc2VsZWN0RmllbGQpfTo8L3NwYW4+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7c2VsZWN0RmllbGRcbiAgICAgICAgICA/IHRoaXMuZ2V0RmllbGRFZGl0b3IoZWRpdG9yUHJvcHMsIHNlbGVjdEZpZWxkKVxuICAgICAgICAgIDogdGhpcy5nZXRGaWVsZFNlbGVjdChlZGl0b3JQcm9wcyl9XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==