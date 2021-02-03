import { __decorate } from "tslib";
import React, { isValidElement } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, reaction, runInAction } from 'mobx';
import Menu, { Item, ItemGroup } from 'choerodon-ui/lib/rc-components/menu';
import Tag from 'choerodon-ui/lib/tag';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import TriggerField from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import DataSet from '../data-set/DataSet';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isEmpty from '../_util/isEmpty';
import isSame from '../_util/isSame';
import isSameLike from '../_util/isSameLike';
function updateActiveKey(menu, activeKey) {
    const store = menu.getStore();
    const menuId = menu.getEventKey();
    const state = store.getState();
    store.setState({
        activeKey: {
            ...state.activeKey,
            [menuId]: activeKey,
        },
    });
}
function defaultSearchMatcher({ record, text, textField }) {
    return record.get(textField).indexOf(text) !== -1;
}
const disabledField = '__disabled';
function defaultOnOption({ record }) {
    return {
        disabled: record.get(disabledField),
    };
}
export function getItemKey(record, text, value) {
    return `item-${value || record.id}-${(isValidElement(text) ? text.key : text) || record.id}`;
}
function getSimpleValue(value, valueField) {
    if (isPlainObject(value)) {
        return ObjectChainValue.get(value, valueField);
    }
    return value;
}
export class Select extends TriggerField {
    constructor() {
        super(...arguments);
        this.comboOptions = new DataSet();
        this.doSearch = debounce(value => this.searchRemote(value), 500);
    }
    get searchMatcher() {
        const { searchMatcher = defaultSearchMatcher } = this.observableProps;
        return searchMatcher;
    }
    get paramMatcher() {
        const { paramMatcher } = this.observableProps;
        return paramMatcher;
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('Select', label ? 'value_missing' : 'value_missing_no_label', { label }),
        };
    }
    get textField() {
        return this.getProp('textField') || 'meaning';
    }
    get valueField() {
        return this.getProp('valueField') || 'value';
    }
    get currentComboOption() {
        return this.comboOptions.filter(record => !this.isSelected(record))[0];
    }
    get filteredOptions() {
        const { optionsWithCombo, text } = this;
        return this.filterData(optionsWithCombo, text);
    }
    get optionsWithCombo() {
        return [...this.comboOptions.data, ...this.cascadeOptions];
    }
    get cascadeOptions() {
        const { record, field, options, searchMatcher } = this;
        const { data } = options;
        if (field && !isString(searchMatcher)) {
            const cascadeMap = field.get('cascadeMap');
            if (cascadeMap) {
                if (record) {
                    const cascades = Object.keys(cascadeMap);
                    return data.filter(item => cascades.every(cascade => isSameLike(record.get(cascadeMap[cascade]), item.get(cascade))));
                }
                return [];
            }
        }
        return data;
    }
    get editable() {
        const { combo } = this.observableProps;
        return !this.isReadOnly() && (!!this.searchable || !!combo);
    }
    get searchable() {
        return !!this.props.searchable;
    }
    get multiple() {
        return !!this.getProp('multiple');
    }
    get menuMultiple() {
        return this.multiple;
    }
    get options() {
        const { field, textField, valueField, multiple, observableProps: { children, options }, } = this;
        return (options ||
            (field && field.options) ||
            normalizeOptions({ textField, valueField, disabledField, multiple, children }));
    }
    get primitive() {
        const type = this.getProp('type');
        return this.observableProps.primitiveValue !== false && type !== "object" /* object */;
    }
    saveMenu(node) {
        this.menu = node;
    }
    checkValue() {
        this.checkValueReaction = reaction(() => this.cascadeOptions, () => this.processSelectedData());
    }
    checkCombo() {
        this.checkComboReaction = reaction(() => this.getValue(), value => this.generateComboOption(value));
    }
    clearCheckValue() {
        if (this.checkValueReaction) {
            this.checkValueReaction();
            this.checkValueReaction = undefined;
        }
    }
    clearCheckCombo() {
        if (this.checkComboReaction) {
            this.checkComboReaction();
            this.checkComboReaction = undefined;
        }
    }
    clearReaction() {
        this.clearCheckValue();
        this.clearCheckCombo();
    }
    componentWillMount() {
        super.componentWillMount();
        const { checkValueOnOptionsChange, combo } = this.props;
        if (checkValueOnOptionsChange) {
            this.checkValue();
        }
        if (combo) {
            this.checkCombo();
            this.generateComboOption(this.getValue());
        }
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.doSearch.cancel();
        this.clearReaction();
    }
    componentWillReceiveProps(nextProps, nextContext) {
        super.componentWillReceiveProps(nextProps, nextContext);
        const { checkValueOnOptionsChange, combo } = this.props;
        if (checkValueOnOptionsChange && !nextProps.checkValueOnOptionsChange) {
            this.clearCheckValue();
        }
        if (!checkValueOnOptionsChange && nextProps.checkValueOnOptionsChange) {
            this.checkValue();
        }
        if (combo && !nextProps.combo) {
            this.removeComboOptions();
            this.clearCheckCombo();
        }
        if (!combo && nextProps.combo) {
            this.checkCombo();
            if ('value' in nextProps) {
                this.generateComboOption(nextProps.value);
            }
        }
    }
    componentDidUpdate() {
        this.forcePopupAlign();
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'searchable',
            'searchMatcher',
            'paramMatcher',
            'combo',
            'commonItem',
            'maxCommonTagPlaceholder',
            'maxCommonTagCount',
            'maxCommonTagTextLength',
            'multiple',
            'value',
            'name',
            'options',
            'optionsFilter',
            'dropdownMatchSelectWidth',
            'dropdownMenuStyle',
            'checkValueOnOptionsChange',
            'primitiveValue',
            'optionRenderer',
            'notFoundContent',
            'onOption',
        ]);
        return otherProps;
    }
    getObservableProps(props, context) {
        return {
            ...super.getObservableProps(props, context),
            children: props.children,
            options: props.options,
            combo: props.combo,
            commonItem: props.commonItem,
            primitiveValue: props.primitiveValue,
            searchMatcher: props.searchMatcher,
            paramMatcher: props.paramMatcher,
        };
    }
    getMenuPrefixCls() {
        return `${this.prefixCls}-dropdown-menu`;
    }
    renderMultipleHolder() {
        const { name, multiple } = this;
        if (multiple) {
            return super.renderMultipleHolder();
        }
        return (React.createElement("input", { key: "value", type: "hidden", value: this.toValueString(this.getValue()) || '', name: name, onChange: noop }));
    }
    getNotFoundContent() {
        const { notFoundContent } = this.props;
        if (notFoundContent !== undefined) {
            return notFoundContent;
        }
        return getConfig('renderEmpty')('Select');
    }
    getOtherNextNode() {
        const { options, textField, valueField, observableProps: { commonItem }, props: { maxCommonTagCount, maxCommonTagPlaceholder, maxCommonTagTextLength }, } = this;
        if (!options) {
            return undefined;
        }
        const values = this.getValues();
        if (commonItem) {
            const valueLength = commonItem.length;
            const tags = commonItem.slice(0, maxCommonTagCount).map((item) => {
                let text = item;
                let textRecord;
                options.map((record) => {
                    if (record.get(valueField) === item) {
                        text = maxCommonTagTextLength &&
                            isString(record.get(textField)) &&
                            record.get(textField).length > maxCommonTagTextLength
                            ? `${record.get(textField).slice(0, maxCommonTagTextLength)}...`
                            : record.get(textField);
                        textRecord = record;
                    }
                    return null;
                });
                return (React.createElement(Tag, { key: item, className: values.includes(item) ? `${this.prefixCls}-common-item ${this.prefixCls}-common-item-selected` : `${this.prefixCls}-common-item`, 
                    // @ts-ignore
                    onClick: () => this.handleCommonItemClick(textRecord) }, text));
            });
            if (valueLength > maxCommonTagCount) {
                let content = `+ ${valueLength - Number(maxCommonTagCount)} ...`;
                if (maxCommonTagPlaceholder) {
                    const omittedValues = commonItem.slice(maxCommonTagCount, valueLength);
                    content =
                        typeof maxCommonTagPlaceholder === 'function'
                            ? maxCommonTagPlaceholder(omittedValues)
                            : maxCommonTagPlaceholder;
                }
                tags.push(React.createElement(Tag, { className: `${this.prefixCls}-common-item`, key: "maxCommonTagPlaceholder" }, content));
            }
            return (React.createElement("div", { className: `${this.prefixCls}-common-item-wrapper` },
                React.createElement("span", { className: `${this.prefixCls}-common-item-label` }, $l('Select', 'common_item')),
                tags));
        }
    }
    getMenu(menuProps = {}) {
        const { options, textField, valueField, props: { dropdownMenuStyle, optionRenderer, onOption, dropdownMatchSelectWidth = getConfig('dropdownMatchSelectWidth') }, } = this;
        if (!options) {
            return null;
        }
        const menuDisabled = this.isDisabled();
        const groups = options.getGroups();
        const optGroups = [];
        const selectedKeys = [];
        let overflowYAdd = {};
        this.filteredOptions.forEach(record => {
            let previousGroup;
            groups.every(field => {
                const label = record.get(field);
                if (label !== undefined) {
                    if (!previousGroup) {
                        previousGroup = optGroups.find(item => item.props.title === label);
                        if (!previousGroup) {
                            previousGroup = (React.createElement(ItemGroup, { key: `group-${label}`, title: label }, []));
                            optGroups.push(previousGroup);
                        }
                    }
                    else {
                        const { children } = previousGroup.props;
                        previousGroup = children.find(item => item.props.title === label);
                        if (!previousGroup) {
                            previousGroup = (React.createElement(ItemGroup, { key: `group-${label}`, title: label }, []));
                            children.push(previousGroup);
                        }
                    }
                    return true;
                }
                return false;
            });
            const value = record.get(valueField);
            const text = record.get(textField);
            const optionProps = onOption({ dataSet: options, record });
            const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
            const key = getItemKey(record, text, value);
            if (!('selectedKeys' in menuProps) && this.isSelected(record)) {
                selectedKeys.push(key);
            }
            const itemContent = optionRenderer
                ? optionRenderer({ dataSet: this.options, record, text, value })
                : text;
            const option = (React.createElement(Item, Object.assign({}, optionProps, { key: key, value: record, disabled: optionDisabled }), itemContent));
            if (previousGroup) {
                const { children } = previousGroup.props;
                children.push(option);
            }
            else {
                optGroups.push(option);
            }
        });
        if (!optGroups.length) {
            optGroups.push(React.createElement(Item, { key: "no_data", disabled: true }, this.loading ? ' ' : this.getNotFoundContent()));
        }
        if (typeof window !== 'undefined') {
            // @ts-ignore 判断ie浏览器处理 下拉栏覆盖问题
            if (!dropdownMatchSelectWidth && (!!window.ActiveXObject || "ActiveXObject" in window)) {
                overflowYAdd = { overflowY: 'scroll' };
            }
        }
        return (React.createElement(Menu, Object.assign({ ref: this.saveMenu, disabled: menuDisabled, defaultActiveFirst: true, multiple: this.menuMultiple, selectedKeys: selectedKeys, prefixCls: this.getMenuPrefixCls(), onClick: this.handleMenuClick, style: { ...dropdownMenuStyle, ...overflowYAdd }, focusable: false }, menuProps), optGroups));
    }
    getPopupProps() {
        const { options, textField, valueField } = this;
        return {
            dataSet: options,
            textField,
            valueField,
        };
    }
    get loading() {
        const { field, options } = this;
        return options.status === "loading" /* loading */ || (!!field && field.pending.length > 0);
    }
    getPopupContent() {
        const menu = (React.createElement(Spin, { key: "menu", spinning: this.loading }, this.getMenu()));
        if (this.multiple) {
            return [
                React.createElement("div", { key: "check-all", className: `${this.prefixCls}-select-all-none` },
                    React.createElement("span", { onClick: this.chooseAll }, $l('Select', 'select_all')),
                    React.createElement("span", { onClick: this.unChooseAll }, $l('Select', 'unselect_all'))),
                menu,
            ];
        }
        return menu;
    }
    getPopupStyleFromAlign(target) {
        const { dropdownMatchSelectWidth = getConfig('dropdownMatchSelectWidth') } = this.props;
        if (target) {
            if (dropdownMatchSelectWidth) {
                return {
                    width: pxToRem(target.getBoundingClientRect().width),
                };
            }
            return {
                minWidth: pxToRem(target.getBoundingClientRect().width),
            };
        }
    }
    getTriggerIconFont() {
        return 'baseline-arrow_drop_down';
    }
    handleKeyDown(e) {
        const { menu } = this;
        if (!this.isDisabled() && !this.isReadOnly() && menu) {
            if (this.popup && menu.onKeyDown(e)) {
                stopEvent(e);
            }
            else {
                switch (e.keyCode) {
                    case KeyCode.RIGHT:
                    case KeyCode.DOWN:
                        this.handleKeyDownPrevNext(e, menu, 1);
                        break;
                    case KeyCode.LEFT:
                    case KeyCode.UP:
                        this.handleKeyDownPrevNext(e, menu, -1);
                        break;
                    case KeyCode.END:
                    case KeyCode.PAGE_DOWN:
                        this.handleKeyDownFirstLast(e, menu, 1);
                        break;
                    case KeyCode.HOME:
                    case KeyCode.PAGE_UP:
                        this.handleKeyDownFirstLast(e, menu, -1);
                        break;
                    // case KeyCode.ENTER:
                    //   this.handleKeyDownEnter(e);
                    //   break;
                    case KeyCode.ESC:
                        this.handleKeyDownEsc(e);
                        break;
                    case KeyCode.SPACE:
                        this.handleKeyDownSpace(e);
                        break;
                    default:
                }
            }
        }
        super.handleKeyDown(e);
    }
    handleKeyDownFirstLast(e, menu, direction) {
        stopEvent(e);
        const children = menu.getFlatInstanceArray();
        const activeItem = children[direction < 0 ? 0 : children.length - 1];
        if (activeItem) {
            if (!this.editable || this.popup) {
                updateActiveKey(menu, activeItem.props.eventKey);
            }
            if (!this.editable && !this.popup) {
                this.choose(activeItem.props.value);
            }
        }
    }
    handleKeyDownPrevNext(e, menu, direction) {
        if (!this.multiple && !this.editable) {
            const activeItem = menu.step(direction);
            if (activeItem) {
                updateActiveKey(menu, activeItem.props.eventKey);
                this.choose(activeItem.props.value);
            }
            e.preventDefault();
        }
        else if (e === KeyCode.DOWN) {
            this.expand();
            e.preventDefault();
        }
    }
    // handleKeyDownEnter(_e) {
    // }
    handleKeyDownEsc(e) {
        if (this.popup) {
            e.preventDefault();
            this.collapse();
        }
    }
    handleKeyDownSpace(e) {
        if (!this.editable) {
            e.preventDefault();
            if (!this.popup) {
                this.expand();
            }
        }
    }
    handleBlur(e) {
        if (!e.isDefaultPrevented()) {
            super.handleBlur(e);
            this.resetFilter();
        }
    }
    expand() {
        const { filteredOptions } = this;
        if (filteredOptions && filteredOptions.length) {
            super.expand();
        }
    }
    syncValueOnBlur(value) {
        if (value) {
            const { data } = this.comboOptions;
            this.options.ready().then(() => {
                const record = this.findByTextWithValue(value, data);
                if (record) {
                    this.choose(record);
                }
            });
        }
        else if (!this.multiple) {
            this.setValue(this.emptyValue);
        }
    }
    findByTextWithValue(text, data) {
        const { textField } = this;
        const records = [...data, ...this.filteredOptions].filter(record => isSameLike(record.get(textField), text));
        if (records.length > 1) {
            const { valueField, primitive } = this;
            const value = this.getValue();
            if (value) {
                const found = records.find(record => isSameLike(record.get(valueField), primitive ? value : value[valueField]));
                if (found) {
                    return found;
                }
            }
        }
        return records[0];
    }
    findByText(text) {
        const { textField } = this;
        return this.optionsWithCombo.find(record => isSameLike(record.get(textField), text));
    }
    findByValue(value) {
        const { valueField } = this;
        const autoType = this.getProp('type') === "auto" /* auto */;
        value = getSimpleValue(value, valueField);
        return this.optionsWithCombo.find(record => autoType ? isSameLike(record.get(valueField), value) : isSame(record.get(valueField), value));
    }
    isSelected(record) {
        const { valueField } = this;
        const autoType = this.getProp('type') === "auto" /* auto */;
        return this.getValues().some(value => {
            const simpleValue = getSimpleValue(value, valueField);
            return autoType
                ? isSameLike(record.get(valueField), simpleValue)
                : isSame(record.get(valueField), simpleValue);
        });
    }
    generateComboOption(value, callback) {
        const { currentComboOption, textField, valueField } = this;
        if (value) {
            if (isArrayLike(value)) {
                value.forEach(v => !isNil(v) && this.generateComboOption(v));
            }
            else {
                const found = this.findByText(value) || this.findByValue(value);
                if (found) {
                    const text = found.get(textField);
                    if (text !== value && callback) {
                        callback(text);
                    }
                    this.removeComboOption();
                }
                else if (currentComboOption) {
                    currentComboOption.set(textField, value);
                    currentComboOption.set(valueField, value);
                }
                else {
                    this.createComboOption(value);
                }
            }
        }
        else {
            this.removeComboOption();
        }
    }
    createComboOption(value) {
        const { textField, valueField, menu } = this;
        const record = this.comboOptions.create({
            [textField]: value,
            [valueField]: value,
        }, 0);
        if (menu) {
            updateActiveKey(menu, getItemKey(record, value, value));
        }
    }
    removeComboOptions() {
        this.comboOptions.forEach(record => this.removeComboOption(record));
    }
    removeComboOption(record) {
        if (!record) {
            record = this.currentComboOption;
        }
        if (record && !this.isSelected(record)) {
            this.comboOptions.remove(record);
        }
    }
    handlePopupAnimateAppear() { }
    getValueKey(v) {
        if (isArrayLike(v)) {
            return v.map(this.getValueKey, this).join(',');
        }
        const autoType = this.getProp('type') === "auto" /* auto */;
        const value = getSimpleValue(v, this.valueField);
        return autoType && !isNil(value) ? value.toString() : value;
    }
    handlePopupAnimateEnd(_key, _exists) { }
    handleMenuClick({ item: { props: { value }, }, }) {
        if (this.multiple && this.isSelected(value)) {
            this.unChoose(value);
        }
        else {
            this.choose(value);
        }
    }
    handleCommonItemClick(value) {
        if (this.multiple && this.isSelected(value)) {
            this.unChoose(value);
        }
        else {
            this.choose(value);
        }
    }
    handleOptionSelect(record) {
        this.prepareSetValue(this.processRecordToObject(record));
    }
    handleOptionUnSelect(record) {
        const { valueField } = this;
        const newValue = record.get(valueField);
        this.removeValue(newValue, -1);
    }
    setText(text) {
        super.setText(text);
        if (this.searchable && isString(this.searchMatcher)) {
            this.doSearch(text);
        }
    }
    searchRemote(value) {
        const { field, searchMatcher } = this;
        if (field && isString(searchMatcher)) {
            field.setLovPara(searchMatcher, value === '' ? undefined : value);
        }
    }
    handleChange(e) {
        const { target, target: { value }, } = e;
        const restricted = this.restrictInput(value);
        if (restricted !== value) {
            const selectionEnd = target.selectionEnd + restricted.length - value.length;
            target.value = restricted;
            target.setSelectionRange(selectionEnd, selectionEnd);
        }
        this.setText(restricted);
        if (this.observableProps.combo) {
            this.generateComboOption(restricted, text => this.setText(text));
        }
        if (!this.popup) {
            this.expand();
        }
    }
    processRecordToObject(record) {
        const { primitive, valueField } = this;
        // 如果为原始值那么 restricted 失效
        const restricted = this.restrictInput(record.get(valueField));
        return primitive ? restricted : record.toData();
    }
    processObjectValue(value, textField) {
        if (!isNil(value)) {
            if (isPlainObject(value)) {
                return ObjectChainValue.get(value, textField);
            }
            const found = this.findByValue(value);
            if (found) {
                return found.get(textField);
            }
        }
    }
    processLookupValue(value) {
        const { field, textField, primitive } = this;
        if (primitive && field && field.lookup) {
            return super.processValue(field.getText(value));
        }
        return super.processValue(this.processObjectValue(value, textField));
    }
    processValue(value) {
        const text = this.processLookupValue(value);
        if (isEmpty(text)) {
            if (isPlainObject(value)) {
                return ObjectChainValue.get(value, this.valueField) || '';
            }
            return super.processValue(value);
        }
        return text;
    }
    clear() {
        this.setText(undefined);
        super.clear();
        this.removeComboOptions();
    }
    resetFilter() {
        this.setText(undefined);
        this.removeComboOption();
        this.forcePopupAlign();
    }
    reset() {
        super.reset();
        this.resetFilter();
    }
    unChoose(record) {
        if (record) {
            this.handleOptionUnSelect(record);
        }
    }
    choose(record) {
        if (!this.multiple) {
            this.collapse();
        }
        if (record) {
            this.handleOptionSelect(record);
        }
    }
    chooseAll() {
        const { options, props: { onOption }, } = this;
        const selectedOptions = this.filteredOptions.filter((record) => {
            const optionProps = onOption({ dataSet: options, record });
            const optionDisabled = (optionProps && optionProps.disabled);
            return !optionDisabled;
        });
        this.setValue(selectedOptions.map(this.processRecordToObject, this));
    }
    unChooseAll() {
        this.clear();
    }
    async handlePopupHiddenChange(hidden) {
        if (!hidden) {
            this.forcePopupAlign();
        }
        super.handlePopupHiddenChange(hidden);
    }
    async processSelectedData() {
        this.comboOptions.removeAll();
        const values = this.getValues();
        const { field } = this;
        if (field) {
            await field.ready();
        }
        const { filteredOptions, observableProps: { combo }, } = this;
        runInAction(() => {
            const newValues = values.filter(value => {
                const record = this.findByValue(value);
                if (record) {
                    return true;
                }
                if (combo) {
                    this.createComboOption(value);
                    return true;
                }
                return false;
            });
            if (this.text && combo) {
                this.generateComboOption(this.text);
            }
            if (field &&
                field.get('cascadeMap') &&
                filteredOptions.length &&
                !isEqual(newValues, values)) {
                this.setValue(this.multiple ? newValues : newValues[0]);
            }
        });
    }
    filterData(data, text) {
        const { textField, valueField, searchable, searchMatcher, props: { optionsFilter }, } = this;
        data = optionsFilter ? data.filter(optionsFilter) : data;
        if (searchable && text && typeof searchMatcher === 'function') {
            return data.filter(record => searchMatcher({ record, text, textField, valueField }));
        }
        return data;
    }
}
Select.displayName = 'Select';
Select.propTypes = {
    /**
     * 复合输入值
     * @default false
     */
    combo: PropTypes.bool,
    /**
     * 常用项
     * @default undefined
     */
    commonItem: PropTypes.array,
    /**
     * 多值标签超出最大数量时的占位描述
     */
    maxCommonTagPlaceholder: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 多值标签最大数量
     */
    maxCommonTagCount: PropTypes.number,
    /**
     * 多值标签文案最大长度
     */
    maxCommonTagTextLength: PropTypes.number,
    /**
     * 过滤器
     * @default false
     */
    searchable: PropTypes.bool,
    /**
     * 搜索匹配器。 当为字符串时，作为lookup的参数名来重新请求值列表。
     */
    searchMatcher: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 参数匹配器。 当为字符串时，参数拼接。
     */
    paramMatcher: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 是否为原始值
     * true - 选项中valueField对应的值
     * false - 选项值对象
     */
    primitiveValue: PropTypes.bool,
    /**
     * 渲染Option文本的钩子
     * @example
     * ```js
     * <Select
     *   {...props}
     *   optionRenderer={({ dataSet, record, text, value }) => text + '$'}
     * />
     * ```
     */
    optionRenderer: PropTypes.func,
    /**
     * 当下拉列表为空时显示的内容
     */
    notFoundContent: PropTypes.node,
    /**
     * 设置选项属性，如 disabled;
     */
    onOption: PropTypes.func,
    ...TriggerField.propTypes,
};
Select.defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'select',
    combo: false,
    searchable: false,
    checkValueOnOptionsChange: true,
    onOption: defaultOnOption,
};
Select.Option = Option;
Select.OptGroup = OptGroup;
__decorate([
    computed
], Select.prototype, "searchMatcher", null);
__decorate([
    computed
], Select.prototype, "paramMatcher", null);
__decorate([
    computed
], Select.prototype, "defaultValidationMessages", null);
__decorate([
    computed
], Select.prototype, "textField", null);
__decorate([
    computed
], Select.prototype, "valueField", null);
__decorate([
    computed
], Select.prototype, "optionsWithCombo", null);
__decorate([
    computed
], Select.prototype, "cascadeOptions", null);
__decorate([
    computed
], Select.prototype, "editable", null);
__decorate([
    computed
], Select.prototype, "searchable", null);
__decorate([
    computed
], Select.prototype, "multiple", null);
__decorate([
    computed
], Select.prototype, "menuMultiple", null);
__decorate([
    computed
], Select.prototype, "options", null);
__decorate([
    computed
], Select.prototype, "primitive", null);
__decorate([
    autobind
], Select.prototype, "saveMenu", null);
__decorate([
    autobind
], Select.prototype, "getMenu", null);
__decorate([
    computed
], Select.prototype, "loading", null);
__decorate([
    autobind
], Select.prototype, "getPopupStyleFromAlign", null);
__decorate([
    autobind
], Select.prototype, "handleKeyDown", null);
__decorate([
    autobind
], Select.prototype, "handleBlur", null);
__decorate([
    autobind
], Select.prototype, "handlePopupAnimateEnd", null);
__decorate([
    autobind
], Select.prototype, "handleMenuClick", null);
__decorate([
    autobind
], Select.prototype, "handleCommonItemClick", null);
__decorate([
    action
], Select.prototype, "setText", null);
__decorate([
    autobind,
    action
], Select.prototype, "handleChange", null);
__decorate([
    action
], Select.prototype, "clear", null);
__decorate([
    autobind
], Select.prototype, "reset", null);
__decorate([
    autobind
], Select.prototype, "chooseAll", null);
__decorate([
    autobind
], Select.prototype, "unChooseAll", null);
__decorate([
    autobind
], Select.prototype, "handlePopupHiddenChange", null);
let ObserverSelect = class ObserverSelect extends Select {
};
ObserverSelect.defaultProps = Select.defaultProps;
ObserverSelect.Option = Option;
ObserverSelect.OptGroup = OptGroup;
ObserverSelect = __decorate([
    observer
], ObserverSelect);
export default ObserverSelect;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3NlbGVjdC9TZWxlY3QudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssRUFBRSxFQUFpQixjQUFjLEVBQWdDLE1BQU0sT0FBTyxDQUFDO0FBQzNGLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxPQUFPLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLGFBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFxQixXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvRixPQUFPLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RSxPQUFPLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQztBQUN2QyxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sWUFBbUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRixPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUV6QyxPQUFPLE1BQXVCLE1BQU0sa0JBQWtCLENBQUM7QUFDdkQsT0FBTyxRQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFFMUMsT0FBTyxPQUFPLE1BQU0s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QixjQUFjLEdBQW5DLE1BQXFCLGNBQWUsU0FBUSxNQUFtQjtDQU05RCxDQUFBO0FBTFEsMkJBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBRW5DLHFCQUFNLEdBQUcsTUFBTSxDQUFDO0FBRWhCLHVCQUFRLEdBQUcsUUFBUSxDQUFDO0FBTFIsY0FBYztJQURsQyxRQUFRO0dBQ1ksY0FBYyxDQU1sQztlQU5vQixjQUFjIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9zZWxlY3QvU2VsZWN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ1NTUHJvcGVydGllcywgaXNWYWxpZEVsZW1lbnQsIEtleSwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC9kZWJvdW5jZSc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcbmltcG9ydCBpc05pbCBmcm9tICdsb2Rhc2gvaXNOaWwnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnbG9kYXNoL2lzUGxhaW5PYmplY3QnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQsIElSZWFjdGlvbkRpc3Bvc2VyLCBpc0FycmF5TGlrZSwgcmVhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgTWVudSwgeyBJdGVtLCBJdGVtR3JvdXAgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL3JjLWNvbXBvbmVudHMvbWVudSc7XG5pbXBvcnQgVGFnIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvdGFnJztcbmltcG9ydCBLZXlDb2RlIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvS2V5Q29kZSc7XG5pbXBvcnQgeyBweFRvUmVtIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBUcmlnZ2VyRmllbGQsIHsgVHJpZ2dlckZpZWxkUHJvcHMgfSBmcm9tICcuLi90cmlnZ2VyLWZpZWxkL1RyaWdnZXJGaWVsZCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IHsgVmFsaWRhdGlvbk1lc3NhZ2VzIH0gZnJvbSAnLi4vdmFsaWRhdG9yL1ZhbGlkYXRvcic7XG5pbXBvcnQgT3B0aW9uLCB7IE9wdGlvblByb3BzIH0gZnJvbSAnLi4vb3B0aW9uL09wdGlvbic7XG5pbXBvcnQgT3B0R3JvdXAgZnJvbSAnLi4vb3B0aW9uL09wdEdyb3VwJztcbmltcG9ydCB7IERhdGFTZXRTdGF0dXMsIEZpZWxkVHlwZSB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IERhdGFTZXQgZnJvbSAnLi4vZGF0YS1zZXQvRGF0YVNldCc7XG5pbXBvcnQgUmVjb3JkIGZyb20gJy4uL2RhdGEtc2V0L1JlY29yZCc7XG5pbXBvcnQgU3BpbiBmcm9tICcuLi9zcGluJztcbmltcG9ydCB7IHN0b3BFdmVudCB9IGZyb20gJy4uL191dGlsL0V2ZW50TWFuYWdlcic7XG5pbXBvcnQgbm9ybWFsaXplT3B0aW9ucyBmcm9tICcuLi9vcHRpb24vbm9ybWFsaXplT3B0aW9ucyc7XG5pbXBvcnQgeyAkbCB9IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcbmltcG9ydCAqIGFzIE9iamVjdENoYWluVmFsdWUgZnJvbSAnLi4vX3V0aWwvT2JqZWN0Q2hhaW5WYWx1ZSc7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICcuLi9fdXRpbC9pc0VtcHR5JztcbmltcG9ydCBpc1NhbWUgZnJvbSAnLi4vX3V0aWwvaXNTYW1lJztcbmltcG9ydCBpc1NhbWVMaWtlIGZyb20gJy4uL191dGlsL2lzU2FtZUxpa2UnO1xuaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuLi9maWVsZC9Gb3JtRmllbGQnO1xuXG5mdW5jdGlvbiB1cGRhdGVBY3RpdmVLZXkobWVudTogTWVudSwgYWN0aXZlS2V5OiBzdHJpbmcpIHtcbiAgY29uc3Qgc3RvcmUgPSBtZW51LmdldFN0b3JlKCk7XG4gIGNvbnN0IG1lbnVJZCA9IG1lbnUuZ2V0RXZlbnRLZXkoKTtcbiAgY29uc3Qgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpO1xuICBzdG9yZS5zZXRTdGF0ZSh7XG4gICAgYWN0aXZlS2V5OiB7XG4gICAgICAuLi5zdGF0ZS5hY3RpdmVLZXksXG4gICAgICBbbWVudUlkXTogYWN0aXZlS2V5LFxuICAgIH0sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0U2VhcmNoTWF0Y2hlcih7IHJlY29yZCwgdGV4dCwgdGV4dEZpZWxkIH0pIHtcbiAgcmV0dXJuIHJlY29yZC5nZXQodGV4dEZpZWxkKS5pbmRleE9mKHRleHQpICE9PSAtMTtcbn1cblxuY29uc3QgZGlzYWJsZWRGaWVsZCA9ICdfX2Rpc2FibGVkJztcblxuZnVuY3Rpb24gZGVmYXVsdE9uT3B0aW9uKHsgcmVjb3JkIH0pIHtcbiAgcmV0dXJuIHtcbiAgICBkaXNhYmxlZDogcmVjb3JkLmdldChkaXNhYmxlZEZpZWxkKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEl0ZW1LZXkocmVjb3JkOiBSZWNvcmQsIHRleHQ6IFJlYWN0Tm9kZSwgdmFsdWU6IGFueSkge1xuICByZXR1cm4gYGl0ZW0tJHt2YWx1ZSB8fCByZWNvcmQuaWR9LSR7KGlzVmFsaWRFbGVtZW50KHRleHQpID8gdGV4dC5rZXkgOiB0ZXh0KSB8fCByZWNvcmQuaWR9YDtcbn1cblxuZnVuY3Rpb24gZ2V0U2ltcGxlVmFsdWUodmFsdWUsIHZhbHVlRmllbGQpIHtcbiAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIE9iamVjdENoYWluVmFsdWUuZ2V0KHZhbHVlLCB2YWx1ZUZpZWxkKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cblxuZXhwb3J0IHR5cGUgb25PcHRpb25Qcm9wcyA9IHsgZGF0YVNldDogRGF0YVNldDsgcmVjb3JkOiBSZWNvcmQgfTtcblxuZXhwb3J0IHR5cGUgU2VhcmNoTWF0Y2hlciA9IHN0cmluZyB8ICgocHJvcHM6IFNlYXJjaE1hdGNoZXJQcm9wcykgPT4gYm9vbGVhbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VhcmNoTWF0Y2hlclByb3BzIHtcbiAgcmVjb3JkOiBSZWNvcmQ7XG4gIHRleHQ6IHN0cmluZztcbiAgdGV4dEZpZWxkOiBzdHJpbmc7XG4gIHZhbHVlRmllbGQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUGFyYW1NYXRjaGVyID0gc3RyaW5nIHwgKChwcm9wczogUGFyYW1NYXRjaGVyUHJvcHMpID0+IHN0cmluZyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyYW1NYXRjaGVyUHJvcHMge1xuICByZWNvcmQ6IFJlY29yZCB8IHVuZGVmaW5lZDtcbiAgdGV4dDogc3RyaW5nO1xuICB0ZXh0RmllbGQ6IHN0cmluZztcbiAgdmFsdWVGaWVsZDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdFByb3BzIGV4dGVuZHMgVHJpZ2dlckZpZWxkUHJvcHMge1xuICAvKipcbiAgICog5aSN5ZCI6L6T5YWl5YC8XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBjb21ibz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDluLjnlKjpoblcbiAgICovXG4gIGNvbW1vbkl0ZW0/OiBzdHJpbmdbXSxcbiAgLyoqXG4gICAqIOW4uOeUqOmhueagh+etvui2heWHuuacgOWkp+aVsOmHj+aXtueahOWNoOS9jeaPj+i/sFxuICAgKi9cbiAgbWF4Q29tbW9uVGFnUGxhY2Vob2xkZXI/OiBSZWFjdE5vZGUgfCAoKG9taXR0ZWRWYWx1ZXM6IGFueVtdKSA9PiBSZWFjdE5vZGUpO1xuICAvKipcbiAgICog5bi455So6aG55qCH562+5pyA5aSn5pWw6YePXG4gICAqL1xuICBtYXhDb21tb25UYWdDb3VudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOW4uOeUqOmhueagh+etvuaWh+ahiOacgOWkp+mVv+W6plxuICAgKi9cbiAgbWF4Q29tbW9uVGFnVGV4dExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOWPr+aQnOe0olxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgc2VhcmNoYWJsZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmkJzntKLljLnphY3lmajjgIIg5b2T5Li65a2X56ym5Liy5pe277yM5L2c5Li6bG9va3Vw55qE5Y+C5pWw5ZCN5p2l6YeN5paw6K+35rGC5YC85YiX6KGo44CCXG4gICAqL1xuICBzZWFyY2hNYXRjaGVyPzogU2VhcmNoTWF0Y2hlcjtcbiAgLyoqXG4gICAqIOWPguaVsOWMuemFjeWZqOOAgiDlvZPkuLrlrZfnrKbkuLLml7bvvIzlj4LmlbDmi7zmjqXjgIJcbiAgICovXG4gIHBhcmFtTWF0Y2hlcj86IFBhcmFtTWF0Y2hlcjtcbiAgLyoqXG4gICAqIOmAiemhuei/h+a7pFxuICAgKiBAcGFyYW0ge1JlY29yZH0gcmVjb3JkXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBvcHRpb25zRmlsdGVyPzogKHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyLCByZWNvcmRzOiBSZWNvcmRbXSkgPT4gYm9vbGVhbjtcbiAgLyoqXG4gICAqIOW9k+mAiemhueaUueWPmOaXtu+8jOajgOafpeW5tua4hemZpOS4jeWcqOmAiemhueS4reeahOWAvFxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjaGVja1ZhbHVlT25PcHRpb25zQ2hhbmdlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOS4i+aLieahhuWMuemFjei+k+WFpeahhuWuveW6plxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBkcm9wZG93bk1hdGNoU2VsZWN0V2lkdGg/OiBib29sZWFuO1xuICAvKipcbiAgICog5LiL5ouJ5qGG6I+c5Y2V5qC35byP5ZCNXG4gICAqL1xuICBkcm9wZG93bk1lbnVTdHlsZT86IENTU1Byb3BlcnRpZXM7XG4gIC8qKlxuICAgKiDpgInpobnmlbDmja7mupBcbiAgICovXG4gIG9wdGlvbnM/OiBEYXRhU2V0O1xuICAvKipcbiAgICog5piv5ZCm5Li65Y6f5aeL5YC8XG4gICAqIHRydWUgLSDpgInpobnkuK12YWx1ZUZpZWxk5a+55bqU55qE5YC8XG4gICAqIGZhbHNlIC0g6YCJ6aG55YC85a+56LGhXG4gICAqL1xuICBwcmltaXRpdmVWYWx1ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmuLLmn5NPcHRpb27mlofmnKznmoTpkqnlrZBcbiAgICogQGV4YW1wbGVcbiAgICogYGBganNcbiAgICogPFNlbGVjdFxuICAgKiAgIHsuLi5wcm9wc31cbiAgICogICBvcHRpb25SZW5kZXJlcj17KHsgcmVjb3JkLCB0ZXh0LCB2YWx1ZSB9KSA9PiB0ZXh0ICsgJyQnfVxuICAgKiAvPlxuICAgKiBgYGBcbiAgICovXG4gIG9wdGlvblJlbmRlcmVyPzogUmVuZGVyZXI7XG4gIC8qKlxuICAgKiDlvZPkuIvmi4nliJfooajkuLrnqbrml7bmmL7npLrnmoTlhoXlrrlcbiAgICovXG4gIG5vdEZvdW5kQ29udGVudD86IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOiuvue9rumAiemhueWxnuaAp++8jOWmgiBkaXNhYmxlZDtcbiAgICovXG4gIG9uT3B0aW9uOiAocHJvcHM6IG9uT3B0aW9uUHJvcHMpID0+IE9wdGlvblByb3BzO1xufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0PFQgZXh0ZW5kcyBTZWxlY3RQcm9wcz4gZXh0ZW5kcyBUcmlnZ2VyRmllbGQ8VD4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnU2VsZWN0JztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8qKlxuICAgICAqIOWkjeWQiOi+k+WFpeWAvFxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgY29tYm86IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOW4uOeUqOmhuVxuICAgICAqIEBkZWZhdWx0IHVuZGVmaW5lZFxuICAgICAqL1xuICAgIGNvbW1vbkl0ZW06IFByb3BUeXBlcy5hcnJheSxcbiAgICAvKipcbiAgICAgKiDlpJrlgLzmoIfnrb7otoXlh7rmnIDlpKfmlbDph4/ml7bnmoTljaDkvY3mj4/ov7BcbiAgICAgKi9cbiAgICBtYXhDb21tb25UYWdQbGFjZWhvbGRlcjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm5vZGUsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgLyoqXG4gICAgICog5aSa5YC85qCH562+5pyA5aSn5pWw6YePXG4gICAgICovXG4gICAgbWF4Q29tbW9uVGFnQ291bnQ6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICog5aSa5YC85qCH562+5paH5qGI5pyA5aSn6ZW/5bqmXG4gICAgICovXG4gICAgbWF4Q29tbW9uVGFnVGV4dExlbmd0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiDov4fmu6TlmahcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIHNlYXJjaGFibGU6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOaQnOe0ouWMuemFjeWZqOOAgiDlvZPkuLrlrZfnrKbkuLLml7bvvIzkvZzkuLpsb29rdXDnmoTlj4LmlbDlkI3mnaXph43mlrDor7fmsYLlgLzliJfooajjgIJcbiAgICAgKi9cbiAgICBzZWFyY2hNYXRjaGVyOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIC8qKlxuICAgICAqIOWPguaVsOWMuemFjeWZqOOAgiDlvZPkuLrlrZfnrKbkuLLml7bvvIzlj4LmlbDmi7zmjqXjgIJcbiAgICAgKi9cbiAgICBwYXJhbU1hdGNoZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgLyoqXG4gICAgICog5piv5ZCm5Li65Y6f5aeL5YC8XG4gICAgICogdHJ1ZSAtIOmAiemhueS4rXZhbHVlRmllbGTlr7nlupTnmoTlgLxcbiAgICAgKiBmYWxzZSAtIOmAiemhueWAvOWvueixoVxuICAgICAqL1xuICAgIHByaW1pdGl2ZVZhbHVlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDmuLLmn5NPcHRpb27mlofmnKznmoTpkqnlrZBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogPFNlbGVjdFxuICAgICAqICAgey4uLnByb3BzfVxuICAgICAqICAgb3B0aW9uUmVuZGVyZXI9eyh7IGRhdGFTZXQsIHJlY29yZCwgdGV4dCwgdmFsdWUgfSkgPT4gdGV4dCArICckJ31cbiAgICAgKiAvPlxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIG9wdGlvblJlbmRlcmVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDlvZPkuIvmi4nliJfooajkuLrnqbrml7bmmL7npLrnmoTlhoXlrrlcbiAgICAgKi9cbiAgICBub3RGb3VuZENvbnRlbnQ6IFByb3BUeXBlcy5ub2RlLFxuICAgIC8qKlxuICAgICAqIOiuvue9rumAiemhueWxnuaAp++8jOWmgiBkaXNhYmxlZDtcbiAgICAgKi9cbiAgICBvbk9wdGlvbjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLi4uVHJpZ2dlckZpZWxkLnByb3BUeXBlcyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIC4uLlRyaWdnZXJGaWVsZC5kZWZhdWx0UHJvcHMsXG4gICAgc3VmZml4Q2xzOiAnc2VsZWN0JyxcbiAgICBjb21ibzogZmFsc2UsXG4gICAgc2VhcmNoYWJsZTogZmFsc2UsXG4gICAgY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZTogdHJ1ZSxcbiAgICBvbk9wdGlvbjogZGVmYXVsdE9uT3B0aW9uLFxuICB9O1xuXG4gIHN0YXRpYyBPcHRpb24gPSBPcHRpb247XG5cbiAgc3RhdGljIE9wdEdyb3VwID0gT3B0R3JvdXA7XG5cbiAgY29tYm9PcHRpb25zOiBEYXRhU2V0ID0gbmV3IERhdGFTZXQoKTtcblxuICBtZW51PzogTWVudSB8IG51bGw7XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBzZWFyY2hNYXRjaGVyKCk6IFNlYXJjaE1hdGNoZXIge1xuICAgIGNvbnN0IHsgc2VhcmNoTWF0Y2hlciA9IGRlZmF1bHRTZWFyY2hNYXRjaGVyIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICByZXR1cm4gc2VhcmNoTWF0Y2hlcjtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcGFyYW1NYXRjaGVyKCk6IFBhcmFtTWF0Y2hlciB7XG4gICAgY29uc3QgeyBwYXJhbU1hdGNoZXIgfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIHJldHVybiBwYXJhbU1hdGNoZXI7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMoKTogVmFsaWRhdGlvbk1lc3NhZ2VzIHtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0UHJvcCgnbGFiZWwnKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVNaXNzaW5nOiAkbCgnU2VsZWN0JywgbGFiZWwgPyAndmFsdWVfbWlzc2luZycgOiAndmFsdWVfbWlzc2luZ19ub19sYWJlbCcsIHsgbGFiZWwgfSksXG4gICAgfTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdGV4dEZpZWxkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcCgndGV4dEZpZWxkJykgfHwgJ21lYW5pbmcnO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB2YWx1ZUZpZWxkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcCgndmFsdWVGaWVsZCcpIHx8ICd2YWx1ZSc7XG4gIH1cblxuICBnZXQgY3VycmVudENvbWJvT3B0aW9uKCk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuY29tYm9PcHRpb25zLmZpbHRlcihyZWNvcmQgPT4gIXRoaXMuaXNTZWxlY3RlZChyZWNvcmQpKVswXTtcbiAgfVxuXG4gIGdldCBmaWx0ZXJlZE9wdGlvbnMoKTogUmVjb3JkW10ge1xuICAgIGNvbnN0IHsgb3B0aW9uc1dpdGhDb21ibywgdGV4dCB9ID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJEYXRhKG9wdGlvbnNXaXRoQ29tYm8sIHRleHQpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBvcHRpb25zV2l0aENvbWJvKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gWy4uLnRoaXMuY29tYm9PcHRpb25zLmRhdGEsIC4uLnRoaXMuY2FzY2FkZU9wdGlvbnNdO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjYXNjYWRlT3B0aW9ucygpOiBSZWNvcmRbXSB7XG4gICAgY29uc3QgeyByZWNvcmQsIGZpZWxkLCBvcHRpb25zLCBzZWFyY2hNYXRjaGVyIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9ucztcbiAgICBpZiAoZmllbGQgJiYgIWlzU3RyaW5nKHNlYXJjaE1hdGNoZXIpKSB7XG4gICAgICBjb25zdCBjYXNjYWRlTWFwID0gZmllbGQuZ2V0KCdjYXNjYWRlTWFwJyk7XG4gICAgICBpZiAoY2FzY2FkZU1hcCkge1xuICAgICAgICBpZiAocmVjb3JkKSB7XG4gICAgICAgICAgY29uc3QgY2FzY2FkZXMgPSBPYmplY3Qua2V5cyhjYXNjYWRlTWFwKTtcbiAgICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoaXRlbSA9PlxuICAgICAgICAgICAgY2FzY2FkZXMuZXZlcnkoY2FzY2FkZSA9PlxuICAgICAgICAgICAgICBpc1NhbWVMaWtlKHJlY29yZC5nZXQoY2FzY2FkZU1hcFtjYXNjYWRlXSksIGl0ZW0uZ2V0KGNhc2NhZGUpKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBlZGl0YWJsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGNvbWJvIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICByZXR1cm4gIXRoaXMuaXNSZWFkT25seSgpICYmICghIXRoaXMuc2VhcmNoYWJsZSB8fCAhIWNvbWJvKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgc2VhcmNoYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnByb3BzLnNlYXJjaGFibGU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IG11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuZ2V0UHJvcCgnbXVsdGlwbGUnKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbWVudU11bHRpcGxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGxlO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBvcHRpb25zKCk6IERhdGFTZXQge1xuICAgIGNvbnN0IHtcbiAgICAgIGZpZWxkLFxuICAgICAgdGV4dEZpZWxkLFxuICAgICAgdmFsdWVGaWVsZCxcbiAgICAgIG11bHRpcGxlLFxuICAgICAgb2JzZXJ2YWJsZVByb3BzOiB7IGNoaWxkcmVuLCBvcHRpb25zIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChcbiAgICAgIG9wdGlvbnMgfHxcbiAgICAgIChmaWVsZCAmJiBmaWVsZC5vcHRpb25zKSB8fFxuICAgICAgbm9ybWFsaXplT3B0aW9ucyh7IHRleHRGaWVsZCwgdmFsdWVGaWVsZCwgZGlzYWJsZWRGaWVsZCwgbXVsdGlwbGUsIGNoaWxkcmVuIH0pXG4gICAgKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcHJpbWl0aXZlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFByb3AoJ3R5cGUnKTtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlUHJvcHMucHJpbWl0aXZlVmFsdWUgIT09IGZhbHNlICYmIHR5cGUgIT09IEZpZWxkVHlwZS5vYmplY3Q7XG4gIH1cblxuICBjaGVja1ZhbHVlUmVhY3Rpb24/OiBJUmVhY3Rpb25EaXNwb3NlcjtcblxuICBjaGVja0NvbWJvUmVhY3Rpb24/OiBJUmVhY3Rpb25EaXNwb3NlcjtcblxuICBAYXV0b2JpbmRcbiAgc2F2ZU1lbnUobm9kZSkge1xuICAgIHRoaXMubWVudSA9IG5vZGU7XG4gIH1cblxuICBjaGVja1ZhbHVlKCkge1xuICAgIHRoaXMuY2hlY2tWYWx1ZVJlYWN0aW9uID0gcmVhY3Rpb24oKCkgPT4gdGhpcy5jYXNjYWRlT3B0aW9ucywgKCkgPT4gdGhpcy5wcm9jZXNzU2VsZWN0ZWREYXRhKCkpO1xuICB9XG5cbiAgY2hlY2tDb21ibygpIHtcbiAgICB0aGlzLmNoZWNrQ29tYm9SZWFjdGlvbiA9IHJlYWN0aW9uKFxuICAgICAgKCkgPT4gdGhpcy5nZXRWYWx1ZSgpLFxuICAgICAgdmFsdWUgPT4gdGhpcy5nZW5lcmF0ZUNvbWJvT3B0aW9uKHZhbHVlKSxcbiAgICApO1xuICB9XG5cbiAgY2xlYXJDaGVja1ZhbHVlKCkge1xuICAgIGlmICh0aGlzLmNoZWNrVmFsdWVSZWFjdGlvbikge1xuICAgICAgdGhpcy5jaGVja1ZhbHVlUmVhY3Rpb24oKTtcbiAgICAgIHRoaXMuY2hlY2tWYWx1ZVJlYWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2hlY2tDb21ibygpIHtcbiAgICBpZiAodGhpcy5jaGVja0NvbWJvUmVhY3Rpb24pIHtcbiAgICAgIHRoaXMuY2hlY2tDb21ib1JlYWN0aW9uKCk7XG4gICAgICB0aGlzLmNoZWNrQ29tYm9SZWFjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjbGVhclJlYWN0aW9uKCkge1xuICAgIHRoaXMuY2xlYXJDaGVja1ZhbHVlKCk7XG4gICAgdGhpcy5jbGVhckNoZWNrQ29tYm8oKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICBjb25zdCB7IGNoZWNrVmFsdWVPbk9wdGlvbnNDaGFuZ2UsIGNvbWJvIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChjaGVja1ZhbHVlT25PcHRpb25zQ2hhbmdlKSB7XG4gICAgICB0aGlzLmNoZWNrVmFsdWUoKTtcbiAgICB9XG4gICAgaWYgKGNvbWJvKSB7XG4gICAgICB0aGlzLmNoZWNrQ29tYm8oKTtcbiAgICAgIHRoaXMuZ2VuZXJhdGVDb21ib09wdGlvbih0aGlzLmdldFZhbHVlKCkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgdGhpcy5kb1NlYXJjaC5jYW5jZWwoKTtcbiAgICB0aGlzLmNsZWFyUmVhY3Rpb24oKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCkge1xuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCk7XG4gICAgY29uc3QgeyBjaGVja1ZhbHVlT25PcHRpb25zQ2hhbmdlLCBjb21ibyB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZSAmJiAhbmV4dFByb3BzLmNoZWNrVmFsdWVPbk9wdGlvbnNDaGFuZ2UpIHtcbiAgICAgIHRoaXMuY2xlYXJDaGVja1ZhbHVlKCk7XG4gICAgfVxuICAgIGlmICghY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZSAmJiBuZXh0UHJvcHMuY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZSkge1xuICAgICAgdGhpcy5jaGVja1ZhbHVlKCk7XG4gICAgfVxuICAgIGlmIChjb21ibyAmJiAhbmV4dFByb3BzLmNvbWJvKSB7XG4gICAgICB0aGlzLnJlbW92ZUNvbWJvT3B0aW9ucygpO1xuICAgICAgdGhpcy5jbGVhckNoZWNrQ29tYm8oKTtcbiAgICB9XG4gICAgaWYgKCFjb21ibyAmJiBuZXh0UHJvcHMuY29tYm8pIHtcbiAgICAgIHRoaXMuY2hlY2tDb21ibygpO1xuICAgICAgaWYgKCd2YWx1ZScgaW4gbmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVDb21ib09wdGlvbihuZXh0UHJvcHMudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLmZvcmNlUG9wdXBBbGlnbigpO1xuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICdzZWFyY2hhYmxlJyxcbiAgICAgICdzZWFyY2hNYXRjaGVyJyxcbiAgICAgICdwYXJhbU1hdGNoZXInLFxuICAgICAgJ2NvbWJvJyxcbiAgICAgICdjb21tb25JdGVtJyxcbiAgICAgICdtYXhDb21tb25UYWdQbGFjZWhvbGRlcicsXG4gICAgICAnbWF4Q29tbW9uVGFnQ291bnQnLFxuICAgICAgJ21heENvbW1vblRhZ1RleHRMZW5ndGgnLFxuICAgICAgJ211bHRpcGxlJyxcbiAgICAgICd2YWx1ZScsXG4gICAgICAnbmFtZScsXG4gICAgICAnb3B0aW9ucycsXG4gICAgICAnb3B0aW9uc0ZpbHRlcicsXG4gICAgICAnZHJvcGRvd25NYXRjaFNlbGVjdFdpZHRoJyxcbiAgICAgICdkcm9wZG93bk1lbnVTdHlsZScsXG4gICAgICAnY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZScsXG4gICAgICAncHJpbWl0aXZlVmFsdWUnLFxuICAgICAgJ29wdGlvblJlbmRlcmVyJyxcbiAgICAgICdub3RGb3VuZENvbnRlbnQnLFxuICAgICAgJ29uT3B0aW9uJyxcbiAgICBdKTtcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci5nZXRPYnNlcnZhYmxlUHJvcHMocHJvcHMsIGNvbnRleHQpLFxuICAgICAgY2hpbGRyZW46IHByb3BzLmNoaWxkcmVuLFxuICAgICAgb3B0aW9uczogcHJvcHMub3B0aW9ucyxcbiAgICAgIGNvbWJvOiBwcm9wcy5jb21ibyxcbiAgICAgIGNvbW1vbkl0ZW06IHByb3BzLmNvbW1vbkl0ZW0sXG4gICAgICBwcmltaXRpdmVWYWx1ZTogcHJvcHMucHJpbWl0aXZlVmFsdWUsXG4gICAgICBzZWFyY2hNYXRjaGVyOiBwcm9wcy5zZWFyY2hNYXRjaGVyLFxuICAgICAgcGFyYW1NYXRjaGVyOiBwcm9wcy5wYXJhbU1hdGNoZXIsXG4gICAgfTtcbiAgfVxuXG4gIGdldE1lbnVQcmVmaXhDbHMoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMucHJlZml4Q2xzfS1kcm9wZG93bi1tZW51YDtcbiAgfVxuXG4gIHJlbmRlck11bHRpcGxlSG9sZGVyKCkge1xuICAgIGNvbnN0IHsgbmFtZSwgbXVsdGlwbGUgfSA9IHRoaXM7XG4gICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICByZXR1cm4gc3VwZXIucmVuZGVyTXVsdGlwbGVIb2xkZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxpbnB1dFxuICAgICAgICBrZXk9XCJ2YWx1ZVwiXG4gICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICB2YWx1ZT17dGhpcy50b1ZhbHVlU3RyaW5nKHRoaXMuZ2V0VmFsdWUoKSkgfHwgJyd9XG4gICAgICAgIG5hbWU9e25hbWV9XG4gICAgICAgIG9uQ2hhbmdlPXtub29wfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgZ2V0Tm90Rm91bmRDb250ZW50KCkge1xuICAgIGNvbnN0IHsgbm90Rm91bmRDb250ZW50IH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChub3RGb3VuZENvbnRlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5vdEZvdW5kQ29udGVudDtcbiAgICB9XG4gICAgcmV0dXJuIGdldENvbmZpZygncmVuZGVyRW1wdHknKSgnU2VsZWN0Jyk7XG4gIH1cblxuICBnZXRPdGhlck5leHROb2RlKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgb3B0aW9ucyxcbiAgICAgIHRleHRGaWVsZCxcbiAgICAgIHZhbHVlRmllbGQsXG4gICAgICBvYnNlcnZhYmxlUHJvcHM6IHsgY29tbW9uSXRlbSB9LFxuICAgICAgcHJvcHM6IHsgbWF4Q29tbW9uVGFnQ291bnQsIG1heENvbW1vblRhZ1BsYWNlaG9sZGVyLCBtYXhDb21tb25UYWdUZXh0TGVuZ3RoIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgIGlmIChjb21tb25JdGVtKSB7XG4gICAgICBjb25zdCB2YWx1ZUxlbmd0aCA9IGNvbW1vbkl0ZW0ubGVuZ3RoO1xuICAgICAgY29uc3QgdGFncyA9IGNvbW1vbkl0ZW0uc2xpY2UoMCwgbWF4Q29tbW9uVGFnQ291bnQpLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgIGxldCB0ZXh0ID0gaXRlbTtcbiAgICAgICAgICBsZXQgdGV4dFJlY29yZDogUmVjb3JkO1xuICAgICAgICAgIG9wdGlvbnMubWFwKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZWNvcmQuZ2V0KHZhbHVlRmllbGQpID09PSBpdGVtKSB7XG4gICAgICAgICAgICAgIHRleHQgPSBtYXhDb21tb25UYWdUZXh0TGVuZ3RoICYmXG4gICAgICAgICAgICAgIGlzU3RyaW5nKHJlY29yZC5nZXQodGV4dEZpZWxkKSkgJiZcbiAgICAgICAgICAgICAgcmVjb3JkLmdldCh0ZXh0RmllbGQpLmxlbmd0aCA+IG1heENvbW1vblRhZ1RleHRMZW5ndGhcbiAgICAgICAgICAgICAgICA/IGAke3JlY29yZC5nZXQodGV4dEZpZWxkKS5zbGljZSgwLCBtYXhDb21tb25UYWdUZXh0TGVuZ3RoKX0uLi5gXG4gICAgICAgICAgICAgICAgOiByZWNvcmQuZ2V0KHRleHRGaWVsZCk7XG4gICAgICAgICAgICAgIHRleHRSZWNvcmQgPSByZWNvcmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gKDxUYWdcbiAgICAgICAgICAgIGtleT17aXRlbX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17dmFsdWVzLmluY2x1ZGVzKGl0ZW0pID8gYCR7dGhpcy5wcmVmaXhDbHN9LWNvbW1vbi1pdGVtICR7dGhpcy5wcmVmaXhDbHN9LWNvbW1vbi1pdGVtLXNlbGVjdGVkYCA6IGAke3RoaXMucHJlZml4Q2xzfS1jb21tb24taXRlbWB9XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLmhhbmRsZUNvbW1vbkl0ZW1DbGljayh0ZXh0UmVjb3JkKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGV4dH1cbiAgICAgICAgICA8L1RhZz4pO1xuICAgICAgICB9KTtcbiAgICAgIGlmICh2YWx1ZUxlbmd0aCA+IG1heENvbW1vblRhZ0NvdW50KSB7XG4gICAgICAgIGxldCBjb250ZW50OiBSZWFjdE5vZGUgPSBgKyAke3ZhbHVlTGVuZ3RoIC0gTnVtYmVyKG1heENvbW1vblRhZ0NvdW50KX0gLi4uYDtcbiAgICAgICAgaWYgKG1heENvbW1vblRhZ1BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgY29uc3Qgb21pdHRlZFZhbHVlcyA9IGNvbW1vbkl0ZW0uc2xpY2UobWF4Q29tbW9uVGFnQ291bnQsIHZhbHVlTGVuZ3RoKTtcbiAgICAgICAgICBjb250ZW50ID1cbiAgICAgICAgICAgIHR5cGVvZiBtYXhDb21tb25UYWdQbGFjZWhvbGRlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICA/IG1heENvbW1vblRhZ1BsYWNlaG9sZGVyKG9taXR0ZWRWYWx1ZXMpXG4gICAgICAgICAgICAgIDogbWF4Q29tbW9uVGFnUGxhY2Vob2xkZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGFncy5wdXNoKFxuICAgICAgICAgIDxUYWcgY2xhc3NOYW1lPXtgJHt0aGlzLnByZWZpeENsc30tY29tbW9uLWl0ZW1gfSBrZXk9XCJtYXhDb21tb25UYWdQbGFjZWhvbGRlclwiPlxuICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgPC9UYWc+LFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuICg8ZGl2IGNsYXNzTmFtZT17YCR7dGhpcy5wcmVmaXhDbHN9LWNvbW1vbi1pdGVtLXdyYXBwZXJgfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHt0aGlzLnByZWZpeENsc30tY29tbW9uLWl0ZW0tbGFiZWxgfT57JGwoJ1NlbGVjdCcsICdjb21tb25faXRlbScpfTwvc3Bhbj5cbiAgICAgICAge3RhZ3N9XG4gICAgICA8L2Rpdj4pO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBnZXRNZW51KG1lbnVQcm9wczogb2JqZWN0ID0ge30pOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIG9wdGlvbnMsXG4gICAgICB0ZXh0RmllbGQsXG4gICAgICB2YWx1ZUZpZWxkLFxuICAgICAgcHJvcHM6IHsgZHJvcGRvd25NZW51U3R5bGUsIG9wdGlvblJlbmRlcmVyLCBvbk9wdGlvbiwgZHJvcGRvd25NYXRjaFNlbGVjdFdpZHRoID0gZ2V0Q29uZmlnKCdkcm9wZG93bk1hdGNoU2VsZWN0V2lkdGgnKSB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG1lbnVEaXNhYmxlZCA9IHRoaXMuaXNEaXNhYmxlZCgpO1xuICAgIGNvbnN0IGdyb3VwcyA9IG9wdGlvbnMuZ2V0R3JvdXBzKCk7XG4gICAgY29uc3Qgb3B0R3JvdXBzOiBSZWFjdEVsZW1lbnQ8YW55PltdID0gW107XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzOiBLZXlbXSA9IFtdO1xuICAgIGxldCBvdmVyZmxvd1lBZGQgPSB7fVxuICAgIHRoaXMuZmlsdGVyZWRPcHRpb25zLmZvckVhY2gocmVjb3JkID0+IHtcbiAgICAgIGxldCBwcmV2aW91c0dyb3VwOiBSZWFjdEVsZW1lbnQ8YW55PiB8IHVuZGVmaW5lZDtcbiAgICAgIGdyb3Vwcy5ldmVyeShmaWVsZCA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gcmVjb3JkLmdldChmaWVsZCk7XG4gICAgICAgIGlmIChsYWJlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKCFwcmV2aW91c0dyb3VwKSB7XG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwID0gb3B0R3JvdXBzLmZpbmQoaXRlbSA9PiBpdGVtLnByb3BzLnRpdGxlID09PSBsYWJlbCk7XG4gICAgICAgICAgICBpZiAoIXByZXZpb3VzR3JvdXApIHtcbiAgICAgICAgICAgICAgcHJldmlvdXNHcm91cCA9IChcbiAgICAgICAgICAgICAgICA8SXRlbUdyb3VwIGtleT17YGdyb3VwLSR7bGFiZWx9YH0gdGl0bGU9e2xhYmVsfT5cbiAgICAgICAgICAgICAgICAgIHtbXX1cbiAgICAgICAgICAgICAgICA8L0l0ZW1Hcm91cD5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgb3B0R3JvdXBzLnB1c2gocHJldmlvdXNHcm91cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHByZXZpb3VzR3JvdXAucHJvcHM7XG4gICAgICAgICAgICBwcmV2aW91c0dyb3VwID0gY2hpbGRyZW4uZmluZChpdGVtID0+IGl0ZW0ucHJvcHMudGl0bGUgPT09IGxhYmVsKTtcbiAgICAgICAgICAgIGlmICghcHJldmlvdXNHcm91cCkge1xuICAgICAgICAgICAgICBwcmV2aW91c0dyb3VwID0gKFxuICAgICAgICAgICAgICAgIDxJdGVtR3JvdXAga2V5PXtgZ3JvdXAtJHtsYWJlbH1gfSB0aXRsZT17bGFiZWx9PlxuICAgICAgICAgICAgICAgICAge1tdfVxuICAgICAgICAgICAgICAgIDwvSXRlbUdyb3VwPlxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHByZXZpb3VzR3JvdXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHZhbHVlID0gcmVjb3JkLmdldCh2YWx1ZUZpZWxkKTtcbiAgICAgIGNvbnN0IHRleHQgPSByZWNvcmQuZ2V0KHRleHRGaWVsZCk7XG4gICAgICBjb25zdCBvcHRpb25Qcm9wcyA9IG9uT3B0aW9uKHsgZGF0YVNldDogb3B0aW9ucywgcmVjb3JkIH0pO1xuICAgICAgY29uc3Qgb3B0aW9uRGlzYWJsZWQgPSBtZW51RGlzYWJsZWQgfHwgKG9wdGlvblByb3BzICYmIG9wdGlvblByb3BzLmRpc2FibGVkKTtcbiAgICAgIGNvbnN0IGtleTogS2V5ID0gZ2V0SXRlbUtleShyZWNvcmQsIHRleHQsIHZhbHVlKTtcbiAgICAgIGlmICghKCdzZWxlY3RlZEtleXMnIGluIG1lbnVQcm9wcykgJiYgdGhpcy5pc1NlbGVjdGVkKHJlY29yZCkpIHtcbiAgICAgICAgc2VsZWN0ZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGl0ZW1Db250ZW50ID0gb3B0aW9uUmVuZGVyZXJcbiAgICAgICAgPyBvcHRpb25SZW5kZXJlcih7IGRhdGFTZXQ6IHRoaXMub3B0aW9ucywgcmVjb3JkLCB0ZXh0LCB2YWx1ZSB9KVxuICAgICAgICA6IHRleHQ7XG4gICAgICBjb25zdCBvcHRpb246IFJlYWN0RWxlbWVudCA9IChcbiAgICAgICAgPEl0ZW0gey4uLm9wdGlvblByb3BzfSBrZXk9e2tleX0gdmFsdWU9e3JlY29yZH0gZGlzYWJsZWQ9e29wdGlvbkRpc2FibGVkfT5cbiAgICAgICAgICB7aXRlbUNvbnRlbnR9XG4gICAgICAgIDwvSXRlbT5cbiAgICAgICk7XG4gICAgICBpZiAocHJldmlvdXNHcm91cCkge1xuICAgICAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSBwcmV2aW91c0dyb3VwLnByb3BzO1xuICAgICAgICBjaGlsZHJlbi5wdXNoKG9wdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRHcm91cHMucHVzaChvcHRpb24pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghb3B0R3JvdXBzLmxlbmd0aCkge1xuICAgICAgb3B0R3JvdXBzLnB1c2goXG4gICAgICAgIDxJdGVtIGtleT1cIm5vX2RhdGFcIiBkaXNhYmxlZD5cbiAgICAgICAgICB7dGhpcy5sb2FkaW5nID8gJyAnIDogdGhpcy5nZXROb3RGb3VuZENvbnRlbnQoKX1cbiAgICAgICAgPC9JdGVtPixcbiAgICAgICk7XG4gICAgfVxuICAgIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBAdHMtaWdub3JlIOWIpOaWrWll5rWP6KeI5Zmo5aSE55CGIOS4i+aLieagj+imhueblumXrumimFxuICAgICAgaWYoIWRyb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aCAmJiAoISF3aW5kb3cuQWN0aXZlWE9iamVjdCB8fCBcIkFjdGl2ZVhPYmplY3RcIiBpbiB3aW5kb3cpKXtcbiAgICAgICAgb3ZlcmZsb3dZQWRkID0ge292ZXJmbG93WTogJ3Njcm9sbCd9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxNZW51XG4gICAgICAgIHJlZj17dGhpcy5zYXZlTWVudX1cbiAgICAgICAgZGlzYWJsZWQ9e21lbnVEaXNhYmxlZH1cbiAgICAgICAgZGVmYXVsdEFjdGl2ZUZpcnN0XG4gICAgICAgIG11bHRpcGxlPXt0aGlzLm1lbnVNdWx0aXBsZX1cbiAgICAgICAgc2VsZWN0ZWRLZXlzPXtzZWxlY3RlZEtleXN9XG4gICAgICAgIHByZWZpeENscz17dGhpcy5nZXRNZW51UHJlZml4Q2xzKCl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlTWVudUNsaWNrfVxuICAgICAgICBzdHlsZT17ey4uLmRyb3Bkb3duTWVudVN0eWxlLC4uLm92ZXJmbG93WUFkZH19XG4gICAgICAgIGZvY3VzYWJsZT17ZmFsc2V9XG4gICAgICAgIHsuLi5tZW51UHJvcHN9XG4gICAgICA+XG4gICAgICAgIHtvcHRHcm91cHN9XG4gICAgICA8L01lbnU+XG4gICAgKTtcbiAgfVxuXG4gIGdldFBvcHVwUHJvcHMoKSB7XG4gICAgY29uc3QgeyBvcHRpb25zLCB0ZXh0RmllbGQsIHZhbHVlRmllbGQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGFTZXQ6IG9wdGlvbnMsXG4gICAgICB0ZXh0RmllbGQsXG4gICAgICB2YWx1ZUZpZWxkLFxuICAgIH07XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGxvYWRpbmcoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBmaWVsZCwgb3B0aW9ucyB9ID0gdGhpcztcbiAgICByZXR1cm4gb3B0aW9ucy5zdGF0dXMgPT09IERhdGFTZXRTdGF0dXMubG9hZGluZyB8fCAoISFmaWVsZCAmJiBmaWVsZC5wZW5kaW5nLmxlbmd0aCA+IDApO1xuICB9XG5cbiAgZ2V0UG9wdXBDb250ZW50KCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgbWVudSA9IChcbiAgICAgIDxTcGluIGtleT1cIm1lbnVcIiBzcGlubmluZz17dGhpcy5sb2FkaW5nfT5cbiAgICAgICAge3RoaXMuZ2V0TWVudSgpfVxuICAgICAgPC9TcGluPlxuICAgICk7XG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIDxkaXYga2V5PVwiY2hlY2stYWxsXCIgY2xhc3NOYW1lPXtgJHt0aGlzLnByZWZpeENsc30tc2VsZWN0LWFsbC1ub25lYH0+XG4gICAgICAgICAgPHNwYW4gb25DbGljaz17dGhpcy5jaG9vc2VBbGx9PnskbCgnU2VsZWN0JywgJ3NlbGVjdF9hbGwnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gb25DbGljaz17dGhpcy51bkNob29zZUFsbH0+eyRsKCdTZWxlY3QnLCAndW5zZWxlY3RfYWxsJyl9PC9zcGFuPlxuICAgICAgICA8L2Rpdj4sXG4gICAgICAgIG1lbnUsXG4gICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiBtZW51O1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGdldFBvcHVwU3R5bGVGcm9tQWxpZ24odGFyZ2V0KTogQ1NTUHJvcGVydGllcyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBkcm9wZG93bk1hdGNoU2VsZWN0V2lkdGggPSBnZXRDb25maWcoJ2Ryb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aCcpIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGlmIChkcm9wZG93bk1hdGNoU2VsZWN0V2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB3aWR0aDogcHhUb1JlbSh0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWluV2lkdGg6IHB4VG9SZW0odGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZ2V0VHJpZ2dlckljb25Gb250KCkge1xuICAgIHJldHVybiAnYmFzZWxpbmUtYXJyb3dfZHJvcF9kb3duJztcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVLZXlEb3duKGUpIHtcbiAgICBjb25zdCB7IG1lbnUgfSA9IHRoaXM7XG4gICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQoKSAmJiAhdGhpcy5pc1JlYWRPbmx5KCkgJiYgbWVudSkge1xuICAgICAgaWYgKHRoaXMucG9wdXAgJiYgbWVudS5vbktleURvd24oZSkpIHtcbiAgICAgICAgc3RvcEV2ZW50KGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICBjYXNlIEtleUNvZGUuUklHSFQ6XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLkRPV046XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25QcmV2TmV4dChlLCBtZW51LCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5MRUZUOlxuICAgICAgICAgIGNhc2UgS2V5Q29kZS5VUDpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93blByZXZOZXh0KGUsIG1lbnUsIC0xKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5FTkQ6XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLlBBR0VfRE9XTjpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkZpcnN0TGFzdChlLCBtZW51LCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5IT01FOlxuICAgICAgICAgIGNhc2UgS2V5Q29kZS5QQUdFX1VQOlxuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRmlyc3RMYXN0KGUsIG1lbnUsIC0xKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIGNhc2UgS2V5Q29kZS5FTlRFUjpcbiAgICAgICAgICAvLyAgIHRoaXMuaGFuZGxlS2V5RG93bkVudGVyKGUpO1xuICAgICAgICAgIC8vICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLkVTQzpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkVzYyhlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgS2V5Q29kZS5TUEFDRTpcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93blNwYWNlKGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzdXBlci5oYW5kbGVLZXlEb3duKGUpO1xuICB9XG5cbiAgaGFuZGxlS2V5RG93bkZpcnN0TGFzdChlLCBtZW51OiBNZW51LCBkaXJlY3Rpb246IG51bWJlcikge1xuICAgIHN0b3BFdmVudChlKTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG1lbnUuZ2V0RmxhdEluc3RhbmNlQXJyYXkoKTtcbiAgICBjb25zdCBhY3RpdmVJdGVtID0gY2hpbGRyZW5bZGlyZWN0aW9uIDwgMCA/IDAgOiBjaGlsZHJlbi5sZW5ndGggLSAxXTtcbiAgICBpZiAoYWN0aXZlSXRlbSkge1xuICAgICAgaWYgKCF0aGlzLmVkaXRhYmxlIHx8IHRoaXMucG9wdXApIHtcbiAgICAgICAgdXBkYXRlQWN0aXZlS2V5KG1lbnUsIGFjdGl2ZUl0ZW0ucHJvcHMuZXZlbnRLZXkpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmVkaXRhYmxlICYmICF0aGlzLnBvcHVwKSB7XG4gICAgICAgIHRoaXMuY2hvb3NlKGFjdGl2ZUl0ZW0ucHJvcHMudmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25QcmV2TmV4dChlLCBtZW51OiBNZW51LCBkaXJlY3Rpb246IG51bWJlcikge1xuICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiAhdGhpcy5lZGl0YWJsZSkge1xuICAgICAgY29uc3QgYWN0aXZlSXRlbSA9IG1lbnUuc3RlcChkaXJlY3Rpb24pO1xuICAgICAgaWYgKGFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgdXBkYXRlQWN0aXZlS2V5KG1lbnUsIGFjdGl2ZUl0ZW0ucHJvcHMuZXZlbnRLZXkpO1xuICAgICAgICB0aGlzLmNob29zZShhY3RpdmVJdGVtLnByb3BzLnZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9IGVsc2UgaWYgKGUgPT09IEtleUNvZGUuRE9XTikge1xuICAgICAgdGhpcy5leHBhbmQoKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvLyBoYW5kbGVLZXlEb3duRW50ZXIoX2UpIHtcbiAgLy8gfVxuXG4gIGhhbmRsZUtleURvd25Fc2MoZSkge1xuICAgIGlmICh0aGlzLnBvcHVwKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93blNwYWNlKGUpIHtcbiAgICBpZiAoIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICghdGhpcy5wb3B1cCkge1xuICAgICAgICB0aGlzLmV4cGFuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVCbHVyKGUpIHtcbiAgICBpZiAoIWUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgIHN1cGVyLmhhbmRsZUJsdXIoZSk7XG4gICAgICB0aGlzLnJlc2V0RmlsdGVyKCk7XG4gICAgfVxuICB9XG5cbiAgZXhwYW5kKCkge1xuICAgIGNvbnN0IHsgZmlsdGVyZWRPcHRpb25zIH0gPSB0aGlzO1xuICAgIGlmIChmaWx0ZXJlZE9wdGlvbnMgJiYgZmlsdGVyZWRPcHRpb25zLmxlbmd0aCkge1xuICAgICAgc3VwZXIuZXhwYW5kKCk7XG4gICAgfVxuICB9XG5cbiAgc3luY1ZhbHVlT25CbHVyKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IHRoaXMuY29tYm9PcHRpb25zO1xuICAgICAgdGhpcy5vcHRpb25zLnJlYWR5KCkudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuZmluZEJ5VGV4dFdpdGhWYWx1ZSh2YWx1ZSwgZGF0YSk7XG4gICAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgICB0aGlzLmNob29zZShyZWNvcmQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZW1wdHlWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5VGV4dFdpdGhWYWx1ZSh0ZXh0LCBkYXRhOiBSZWNvcmRbXSk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB0ZXh0RmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgcmVjb3JkcyA9IFsuLi5kYXRhLCAuLi50aGlzLmZpbHRlcmVkT3B0aW9uc10uZmlsdGVyKHJlY29yZCA9PlxuICAgICAgaXNTYW1lTGlrZShyZWNvcmQuZ2V0KHRleHRGaWVsZCksIHRleHQpLFxuICAgICk7XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoID4gMSkge1xuICAgICAgY29uc3QgeyB2YWx1ZUZpZWxkLCBwcmltaXRpdmUgfSA9IHRoaXM7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBjb25zdCBmb3VuZCA9IHJlY29yZHMuZmluZChyZWNvcmQgPT5cbiAgICAgICAgICBpc1NhbWVMaWtlKHJlY29yZC5nZXQodmFsdWVGaWVsZCksIHByaW1pdGl2ZSA/IHZhbHVlIDogdmFsdWVbdmFsdWVGaWVsZF0pLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICByZXR1cm4gZm91bmQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZHNbMF07XG4gIH1cblxuICBmaW5kQnlUZXh0KHRleHQpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgdGV4dEZpZWxkIH0gPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNXaXRoQ29tYm8uZmluZChyZWNvcmQgPT4gaXNTYW1lTGlrZShyZWNvcmQuZ2V0KHRleHRGaWVsZCksIHRleHQpKTtcbiAgfVxuXG4gIGZpbmRCeVZhbHVlKHZhbHVlKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHZhbHVlRmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgYXV0b1R5cGUgPSB0aGlzLmdldFByb3AoJ3R5cGUnKSA9PT0gRmllbGRUeXBlLmF1dG87XG4gICAgdmFsdWUgPSBnZXRTaW1wbGVWYWx1ZSh2YWx1ZSwgdmFsdWVGaWVsZCk7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9uc1dpdGhDb21iby5maW5kKHJlY29yZCA9PlxuICAgICAgYXV0b1R5cGUgPyBpc1NhbWVMaWtlKHJlY29yZC5nZXQodmFsdWVGaWVsZCksIHZhbHVlKSA6IGlzU2FtZShyZWNvcmQuZ2V0KHZhbHVlRmllbGQpLCB2YWx1ZSksXG4gICAgKTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQocmVjb3JkOiBSZWNvcmQpIHtcbiAgICBjb25zdCB7IHZhbHVlRmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgYXV0b1R5cGUgPSB0aGlzLmdldFByb3AoJ3R5cGUnKSA9PT0gRmllbGRUeXBlLmF1dG87XG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzKCkuc29tZSh2YWx1ZSA9PiB7XG4gICAgICBjb25zdCBzaW1wbGVWYWx1ZSA9IGdldFNpbXBsZVZhbHVlKHZhbHVlLCB2YWx1ZUZpZWxkKTtcbiAgICAgIHJldHVybiBhdXRvVHlwZVxuICAgICAgICA/IGlzU2FtZUxpa2UocmVjb3JkLmdldCh2YWx1ZUZpZWxkKSwgc2ltcGxlVmFsdWUpXG4gICAgICAgIDogaXNTYW1lKHJlY29yZC5nZXQodmFsdWVGaWVsZCksIHNpbXBsZVZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdlbmVyYXRlQ29tYm9PcHRpb24odmFsdWU6IHN0cmluZyB8IGFueVtdLCBjYWxsYmFjaz86ICh0ZXh0OiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBjb25zdCB7IGN1cnJlbnRDb21ib09wdGlvbiwgdGV4dEZpZWxkLCB2YWx1ZUZpZWxkIH0gPSB0aGlzO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5mb3JFYWNoKHYgPT4gIWlzTmlsKHYpICYmIHRoaXMuZ2VuZXJhdGVDb21ib09wdGlvbih2KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZCA9IHRoaXMuZmluZEJ5VGV4dCh2YWx1ZSkgfHwgdGhpcy5maW5kQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBmb3VuZC5nZXQodGV4dEZpZWxkKTtcbiAgICAgICAgICBpZiAodGV4dCAhPT0gdmFsdWUgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJlbW92ZUNvbWJvT3B0aW9uKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudENvbWJvT3B0aW9uKSB7XG4gICAgICAgICAgY3VycmVudENvbWJvT3B0aW9uLnNldCh0ZXh0RmllbGQsIHZhbHVlKTtcbiAgICAgICAgICBjdXJyZW50Q29tYm9PcHRpb24uc2V0KHZhbHVlRmllbGQsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUNvbWJvT3B0aW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUNvbWJvT3B0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlQ29tYm9PcHRpb24odmFsdWUpOiB2b2lkIHtcbiAgICBjb25zdCB7IHRleHRGaWVsZCwgdmFsdWVGaWVsZCwgbWVudSB9ID0gdGhpcztcbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNvbWJvT3B0aW9ucy5jcmVhdGUoXG4gICAgICB7XG4gICAgICAgIFt0ZXh0RmllbGRdOiB2YWx1ZSxcbiAgICAgICAgW3ZhbHVlRmllbGRdOiB2YWx1ZSxcbiAgICAgIH0sXG4gICAgICAwLFxuICAgICk7XG4gICAgaWYgKG1lbnUpIHtcbiAgICAgIHVwZGF0ZUFjdGl2ZUtleShtZW51LCBnZXRJdGVtS2V5KHJlY29yZCwgdmFsdWUsIHZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ29tYm9PcHRpb25zKCkge1xuICAgIHRoaXMuY29tYm9PcHRpb25zLmZvckVhY2gocmVjb3JkID0+IHRoaXMucmVtb3ZlQ29tYm9PcHRpb24ocmVjb3JkKSk7XG4gIH1cblxuICByZW1vdmVDb21ib09wdGlvbihyZWNvcmQ/OiBSZWNvcmQpOiB2b2lkIHtcbiAgICBpZiAoIXJlY29yZCkge1xuICAgICAgcmVjb3JkID0gdGhpcy5jdXJyZW50Q29tYm9PcHRpb247XG4gICAgfVxuICAgIGlmIChyZWNvcmQgJiYgIXRoaXMuaXNTZWxlY3RlZChyZWNvcmQpKSB7XG4gICAgICB0aGlzLmNvbWJvT3B0aW9ucy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVQb3B1cEFuaW1hdGVBcHBlYXIoKSB7fVxuXG4gIGdldFZhbHVlS2V5KHYpIHtcbiAgICBpZiAoaXNBcnJheUxpa2UodikpIHtcbiAgICAgIHJldHVybiB2Lm1hcCh0aGlzLmdldFZhbHVlS2V5LCB0aGlzKS5qb2luKCcsJyk7XG4gICAgfVxuICAgIGNvbnN0IGF1dG9UeXBlID0gdGhpcy5nZXRQcm9wKCd0eXBlJykgPT09IEZpZWxkVHlwZS5hdXRvO1xuICAgIGNvbnN0IHZhbHVlID0gZ2V0U2ltcGxlVmFsdWUodiwgdGhpcy52YWx1ZUZpZWxkKTtcbiAgICByZXR1cm4gYXV0b1R5cGUgJiYgIWlzTmlsKHZhbHVlKSA/IHZhbHVlLnRvU3RyaW5nKCkgOiB2YWx1ZTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVQb3B1cEFuaW1hdGVFbmQoX2tleSwgX2V4aXN0cykge31cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlTWVudUNsaWNrKHtcbiAgICBpdGVtOiB7XG4gICAgICBwcm9wczogeyB2YWx1ZSB9LFxuICAgIH0sXG4gIH0pIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiB0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XG4gICAgICB0aGlzLnVuQ2hvb3NlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaG9vc2UodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVDb21tb25JdGVtQ2xpY2sodmFsdWUpIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiB0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XG4gICAgICB0aGlzLnVuQ2hvb3NlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaG9vc2UodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU9wdGlvblNlbGVjdChyZWNvcmQ6IFJlY29yZCkge1xuICAgIHRoaXMucHJlcGFyZVNldFZhbHVlKHRoaXMucHJvY2Vzc1JlY29yZFRvT2JqZWN0KHJlY29yZCkpO1xuICB9XG5cbiAgaGFuZGxlT3B0aW9uVW5TZWxlY3QocmVjb3JkOiBSZWNvcmQpIHtcbiAgICBjb25zdCB7IHZhbHVlRmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgbmV3VmFsdWUgPSByZWNvcmQuZ2V0KHZhbHVlRmllbGQpO1xuICAgIHRoaXMucmVtb3ZlVmFsdWUobmV3VmFsdWUsIC0xKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0VGV4dCh0ZXh0Pzogc3RyaW5nKTogdm9pZCB7XG4gICAgc3VwZXIuc2V0VGV4dCh0ZXh0KTtcbiAgICBpZiAodGhpcy5zZWFyY2hhYmxlICYmIGlzU3RyaW5nKHRoaXMuc2VhcmNoTWF0Y2hlcikpIHtcbiAgICAgIHRoaXMuZG9TZWFyY2godGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZG9TZWFyY2ggPSBkZWJvdW5jZSh2YWx1ZSA9PiB0aGlzLnNlYXJjaFJlbW90ZSh2YWx1ZSksIDUwMCk7XG5cbiAgc2VhcmNoUmVtb3RlKHZhbHVlKSB7XG4gICAgY29uc3QgeyBmaWVsZCwgc2VhcmNoTWF0Y2hlciB9ID0gdGhpcztcbiAgICBpZiAoZmllbGQgJiYgaXNTdHJpbmcoc2VhcmNoTWF0Y2hlcikpIHtcbiAgICAgIGZpZWxkLnNldExvdlBhcmEoc2VhcmNoTWF0Y2hlciwgdmFsdWUgPT09ICcnID8gdW5kZWZpbmVkIDogdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBAYWN0aW9uXG4gIGhhbmRsZUNoYW5nZShlKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFyZ2V0LFxuICAgICAgdGFyZ2V0OiB7IHZhbHVlIH0sXG4gICAgfSA9IGU7XG4gICAgY29uc3QgcmVzdHJpY3RlZCA9IHRoaXMucmVzdHJpY3RJbnB1dCh2YWx1ZSk7XG4gICAgaWYgKHJlc3RyaWN0ZWQgIT09IHZhbHVlKSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25FbmQgPSB0YXJnZXQuc2VsZWN0aW9uRW5kICsgcmVzdHJpY3RlZC5sZW5ndGggLSB2YWx1ZS5sZW5ndGg7XG4gICAgICB0YXJnZXQudmFsdWUgPSByZXN0cmljdGVkO1xuICAgICAgdGFyZ2V0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvbkVuZCwgc2VsZWN0aW9uRW5kKTtcbiAgICB9XG4gICAgdGhpcy5zZXRUZXh0KHJlc3RyaWN0ZWQpO1xuICAgIGlmICh0aGlzLm9ic2VydmFibGVQcm9wcy5jb21ibykge1xuICAgICAgdGhpcy5nZW5lcmF0ZUNvbWJvT3B0aW9uKHJlc3RyaWN0ZWQsIHRleHQgPT4gdGhpcy5zZXRUZXh0KHRleHQpKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnBvcHVwKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH1cbiAgfVxuXG5cblxuICBwcm9jZXNzUmVjb3JkVG9PYmplY3QocmVjb3JkOiBSZWNvcmQpIHtcbiAgICBjb25zdCB7IHByaW1pdGl2ZSwgdmFsdWVGaWVsZCB9ID0gdGhpcztcbiAgICAvLyDlpoLmnpzkuLrljp/lp4vlgLzpgqPkuYggcmVzdHJpY3RlZCDlpLHmlYhcbiAgICBjb25zdCByZXN0cmljdGVkID0gdGhpcy5yZXN0cmljdElucHV0KHJlY29yZC5nZXQodmFsdWVGaWVsZCkpO1xuICAgIHJldHVybiBwcmltaXRpdmUgPyByZXN0cmljdGVkIDogcmVjb3JkLnRvRGF0YSgpO1xuICB9XG5cbiAgcHJvY2Vzc09iamVjdFZhbHVlKHZhbHVlLCB0ZXh0RmllbGQpIHtcbiAgICBpZiAoIWlzTmlsKHZhbHVlKSkge1xuICAgICAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3RDaGFpblZhbHVlLmdldCh2YWx1ZSwgdGV4dEZpZWxkKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZvdW5kID0gdGhpcy5maW5kQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZvdW5kLmdldCh0ZXh0RmllbGQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NMb29rdXBWYWx1ZSh2YWx1ZSkge1xuICAgIGNvbnN0IHsgZmllbGQsIHRleHRGaWVsZCwgcHJpbWl0aXZlIH0gPSB0aGlzO1xuICAgIGlmIChwcmltaXRpdmUgJiYgZmllbGQgJiYgZmllbGQubG9va3VwKSB7XG4gICAgICByZXR1cm4gc3VwZXIucHJvY2Vzc1ZhbHVlKGZpZWxkLmdldFRleHQodmFsdWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnByb2Nlc3NWYWx1ZSh0aGlzLnByb2Nlc3NPYmplY3RWYWx1ZSh2YWx1ZSwgdGV4dEZpZWxkKSk7XG4gIH1cblxuICBwcm9jZXNzVmFsdWUodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMucHJvY2Vzc0xvb2t1cFZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNFbXB0eSh0ZXh0KSkge1xuICAgICAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3RDaGFpblZhbHVlLmdldCh2YWx1ZSwgdGhpcy52YWx1ZUZpZWxkKSB8fCAnJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdXBlci5wcm9jZXNzVmFsdWUodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zZXRUZXh0KHVuZGVmaW5lZCk7XG4gICAgc3VwZXIuY2xlYXIoKTtcbiAgICB0aGlzLnJlbW92ZUNvbWJvT3B0aW9ucygpO1xuICB9XG5cbiAgcmVzZXRGaWx0ZXIoKSB7XG4gICAgdGhpcy5zZXRUZXh0KHVuZGVmaW5lZCk7XG4gICAgdGhpcy5yZW1vdmVDb21ib09wdGlvbigpO1xuICAgIHRoaXMuZm9yY2VQb3B1cEFsaWduKCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgICB0aGlzLnJlc2V0RmlsdGVyKCk7XG4gIH1cblxuICB1bkNob29zZShyZWNvcmQ/OiBSZWNvcmQgfCBudWxsKSB7XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgdGhpcy5oYW5kbGVPcHRpb25VblNlbGVjdChyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGNob29zZShyZWNvcmQ/OiBSZWNvcmQgfCBudWxsKSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHRoaXMuaGFuZGxlT3B0aW9uU2VsZWN0KHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGNob29zZUFsbCgpIHtcbiAgICBjb25zdCB7XG4gICAgICBvcHRpb25zLFxuICAgICAgcHJvcHM6IHsgb25PcHRpb24gfSxcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCBzZWxlY3RlZE9wdGlvbnMgPSB0aGlzLmZpbHRlcmVkT3B0aW9ucy5maWx0ZXIoKHJlY29yZCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9uUHJvcHMgPSBvbk9wdGlvbih7IGRhdGFTZXQ6IG9wdGlvbnMsIHJlY29yZCB9KTtcbiAgICAgIGNvbnN0IG9wdGlvbkRpc2FibGVkID0gKG9wdGlvblByb3BzICYmIG9wdGlvblByb3BzLmRpc2FibGVkKTtcbiAgICAgIHJldHVybiAhb3B0aW9uRGlzYWJsZWQ7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRWYWx1ZShzZWxlY3RlZE9wdGlvbnMubWFwKHRoaXMucHJvY2Vzc1JlY29yZFRvT2JqZWN0LCB0aGlzKSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgdW5DaG9vc2VBbGwoKSB7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZVBvcHVwSGlkZGVuQ2hhbmdlKGhpZGRlbjogYm9vbGVhbikge1xuICAgIGlmICghaGlkZGVuKSB7XG4gICAgICB0aGlzLmZvcmNlUG9wdXBBbGlnbigpO1xuICAgIH1cbiAgICBzdXBlci5oYW5kbGVQb3B1cEhpZGRlbkNoYW5nZShoaWRkZW4pO1xuICB9XG5cbiAgYXN5bmMgcHJvY2Vzc1NlbGVjdGVkRGF0YSgpIHtcbiAgICB0aGlzLmNvbWJvT3B0aW9ucy5yZW1vdmVBbGwoKTtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgIGNvbnN0IHsgZmllbGQgfSA9IHRoaXM7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBhd2FpdCBmaWVsZC5yZWFkeSgpO1xuICAgIH1cbiAgICBjb25zdCB7XG4gICAgICBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICBvYnNlcnZhYmxlUHJvcHM6IHsgY29tYm8gfSxcbiAgICB9ID0gdGhpcztcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCBuZXdWYWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKHZhbHVlID0+IHtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5maW5kQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tYm8pIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUNvbWJvT3B0aW9uKHZhbHVlKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLnRleHQgJiYgY29tYm8pIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUNvbWJvT3B0aW9uKHRoaXMudGV4dCk7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIGZpZWxkICYmXG4gICAgICAgIGZpZWxkLmdldCgnY2FzY2FkZU1hcCcpICYmXG4gICAgICAgIGZpbHRlcmVkT3B0aW9ucy5sZW5ndGggJiZcbiAgICAgICAgIWlzRXF1YWwobmV3VmFsdWVzLCB2YWx1ZXMpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLm11bHRpcGxlID8gbmV3VmFsdWVzIDogbmV3VmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZpbHRlckRhdGEoZGF0YTogUmVjb3JkW10sIHRleHQ/OiBzdHJpbmcpOiBSZWNvcmRbXSB7XG4gICAgY29uc3Qge1xuICAgICAgdGV4dEZpZWxkLFxuICAgICAgdmFsdWVGaWVsZCxcbiAgICAgIHNlYXJjaGFibGUsXG4gICAgICBzZWFyY2hNYXRjaGVyLFxuICAgICAgcHJvcHM6IHsgb3B0aW9uc0ZpbHRlciB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGRhdGEgPSBvcHRpb25zRmlsdGVyID8gZGF0YS5maWx0ZXIob3B0aW9uc0ZpbHRlciEpIDogZGF0YTtcbiAgICBpZiAoc2VhcmNoYWJsZSAmJiB0ZXh0ICYmIHR5cGVvZiBzZWFyY2hNYXRjaGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZGF0YS5maWx0ZXIocmVjb3JkID0+IHNlYXJjaE1hdGNoZXIoeyByZWNvcmQsIHRleHQsIHRleHRGaWVsZCwgdmFsdWVGaWVsZCB9KSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JzZXJ2ZXJTZWxlY3QgZXh0ZW5kcyBTZWxlY3Q8U2VsZWN0UHJvcHM+IHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IFNlbGVjdC5kZWZhdWx0UHJvcHM7XG5cbiAgc3RhdGljIE9wdGlvbiA9IE9wdGlvbjtcblxuICBzdGF0aWMgT3B0R3JvdXAgPSBPcHRHcm91cDtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==