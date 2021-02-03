import { __decorate } from "tslib";
import React, { isValidElement } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, observable, computed, isArrayLike, reaction, runInAction, toJS } from 'mobx';
import { Menus, SingleMenu } from 'choerodon-ui/lib/rc-components/cascader';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { MenuMode } from 'choerodon-ui/lib/cascader';
import TriggerField from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isEmptyUtil from '../_util/isEmpty';
import isSameLike from '../_util/isSameLike';
const disabledField = '__disabled';
function defaultOnOption({ record }) {
    if (record instanceof Record) {
        return {
            disabled: record.get(disabledField),
        };
    }
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
/**
 * 简单比较arry的值是否相同
 * 主要问题是观察变量修改了值类型所以使用此方法
 * @param arr
 * @param arrNext
 */
function arraySameLike(arr, arrNext) {
    if (isArrayLike(arr) && isArrayLike(arrNext)) {
        return arr.toString() === arrNext.toString();
    }
    return false;
}
export class Cascader extends TriggerField {
    constructor(props, context) {
        super(props, context);
        this.setActiveValue({});
        this.setItemMenuWidth(0);
        this.setIsClickTab(false);
    }
    get isClickTab() {
        return this.clickTab;
    }
    get activeValue() {
        return this.activeValues;
    }
    get itemMenuWidth() {
        return this.menuItemWith;
    }
    findActiveRecord(value, options) {
        let result;
        const returnActiveValue = (arrayOption, index) => {
            if (arrayOption && arrayOption.length > 0) {
                arrayOption.forEach((item) => {
                    if (isSameLike(value[index], this.getRecordOrObjValue(item, this.valueField))) {
                        result = item;
                        if (item.children) {
                            returnActiveValue(item.children, ++index);
                        }
                    }
                });
            }
        };
        if (options instanceof DataSet) {
            returnActiveValue(options.treeData, 0);
        }
        if (isArrayLike(options)) {
            returnActiveValue(options, 0);
        }
        return result;
    }
    setActiveValue(activeValues) {
        this.activeValues = activeValues;
    }
    setIsClickTab(isClickTab) {
        this.clickTab = isClickTab;
    }
    setItemMenuWidth(width) {
        this.menuItemWith = width;
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('Cascader', label ? 'value_missing' : 'value_missing_no_label', { label }),
        };
    }
    get textField() {
        return this.getProp('textField') || 'meaning';
    }
    get valueField() {
        return this.getProp('valueField') || 'value';
    }
    get cascadeOptions() {
        const { record, field, options } = this;
        const { data } = options;
        if (field) {
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
        return false;
    }
    get multiple() {
        return !!this.getProp('multiple');
    }
    get menuMultiple() {
        return this.multiple;
    }
    get options() {
        const { field, textField, valueField, multiple, observableProps: { children, options }, } = this;
        let dealOption;
        if (isArrayLike(options)) {
            dealOption = this.addOptionsParent(options, undefined);
        }
        else {
            dealOption = options;
        }
        return (dealOption ||
            (field && field.options) ||
            normalizeOptions({ textField, valueField, disabledField, multiple, children }));
    }
    // 增加父级属性
    addOptionsParent(options, parent) {
        if (options.length > 0) {
            const optionPrent = options.map((ele) => {
                ele.parent = parent || undefined;
                if (ele.children) {
                    this.addOptionsParent(ele.children, ele);
                }
                return ele;
            });
            return optionPrent;
        }
    }
    get primitive() {
        const type = this.getProp('type');
        if (this.options instanceof DataSet) {
            return this.observableProps.primitiveValue !== false && type !== "object" /* object */;
        }
        return this.observableProps.primitiveValue !== false;
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
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        this.clearReaction();
    }
    componentWillReceiveProps(nextProps, nextContext) {
        super.componentWillReceiveProps(nextProps, nextContext);
    }
    componentDidUpdate() {
        this.forcePopupAlign();
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'multiple',
            'value',
            'name',
            'dropdownMatchSelectWidth',
            'dropdownMenuStyle',
            'primitiveValue',
            'notFoundContent',
            'onOption',
            'expandTrigger',
            'dropdownMatchSelectWidth',
            'dropdownMenuStyle',
            'menuMode',
            'singleMenuStyle',
            'singleMenuItemStyle',
            'singlePleaseRender',
            'singleMenuItemRender',
        ]);
        return otherProps;
    }
    getObservableProps(props, context) {
        return {
            ...super.getObservableProps(props, context),
            children: props.children,
            options: props.options,
            primitiveValue: props.primitiveValue,
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
    /**
     * 返回一个打平tree返回层级
     * @param record
     * @param fn
     */
    findParentRecodTree(record, fn) {
        const recordTree = [];
        if (record) {
            if (isFunction(fn)) {
                recordTree.push(fn(record));
            }
            else {
                recordTree.push(record);
            }
        }
        if (record && record.parent) {
            if (isFunction(fn)) {
                return [...this.findParentRecodTree(record.parent, fn), ...recordTree];
            }
            return [...this.findParentRecodTree(record.parent), ...recordTree];
        }
        return recordTree;
    }
    /**
     * 获取record 或者 obj对应的值
     * @param value
     * @param key
     */
    getRecordOrObjValue(value, key) {
        if (value instanceof Record) {
            return value.get(key);
        }
        if (isObject(value)) {
            return value[key];
        }
        return value;
    }
    /**
     * 渲染menu 表格
     * @param menuProps
     */
    getMenu(menuProps = {}) {
        // 暂时不用考虑分组情况 groups
        const { options, textField, valueField, props: { dropdownMenuStyle, expandTrigger, onOption, menuMode, singleMenuStyle, singleMenuItemStyle, singlePleaseRender, singleMenuItemRender, }, } = this;
        if (!options) {
            return null;
        }
        const menuDisabled = this.isDisabled();
        let optGroups = [];
        let selectedValues = [];
        // 确保tabkey唯一
        let deepindex = 0;
        const treePropsChange = (treeRecord) => {
            let treeRecords = [];
            if (treeRecord.length > 0) {
                // @ts-ignore
                treeRecords = treeRecord.map((recordItem, index) => {
                    deepindex++;
                    const value = this.getRecordOrObjValue(recordItem, valueField);
                    const text = this.getRecordOrObjValue(recordItem, textField);
                    if (recordItem instanceof Record) {
                        const optionProps = onOption({ dataSet: options, record: recordItem });
                        const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
                        const key = getItemKey(recordItem, text, value);
                        let children;
                        if (recordItem.isSelected) {
                            selectedValues.push(recordItem);
                        }
                        if (recordItem.children) {
                            children = treePropsChange(recordItem.children);
                        }
                        return (children ? {
                            ...optionProps,
                            disabled: optionDisabled,
                            key,
                            label: text,
                            value: recordItem,
                            children,
                        } : {
                            ...optionProps,
                            disabled: optionDisabled,
                            key,
                            label: text,
                            value: recordItem,
                        });
                    }
                    const optionProps = onOption({ dataSet: options, record: recordItem });
                    const optionDisabled = recordItem.disabled || optionProps;
                    const key = `${deepindex}-${index}`;
                    let children;
                    if (recordItem.children) {
                        children = treePropsChange(recordItem.children);
                    }
                    return (children ? {
                        ...optionDisabled,
                        key,
                        label: text,
                        value: recordItem,
                        children,
                        disabled: optionDisabled,
                    } : {
                        ...optionDisabled,
                        key,
                        label: text,
                        value: recordItem,
                        disabled: optionDisabled,
                    });
                });
            }
            return treeRecords;
        };
        if (isArrayLike(options)) {
            optGroups = treePropsChange(options);
        }
        else if (options instanceof DataSet) {
            optGroups = treePropsChange(options.treeData);
        }
        else {
            optGroups = [];
        }
        /**
         * 获取当前激活的menueItem
         * 以及value 展示激活状态的判断
         * 按钮能够控制不受值的影响
         * inputValue：输入框的值
         * activeValue：激活值（choose和键盘影响）
         * this.popup:开启状态有激活值那么为激活值
         */
        const getActiveValue = (inputValue) => {
            let activeValue = [];
            if (!isEmpty(inputValue)) {
                if (inputValue && arraySameLike(this.treeValueToArray(this.activeValue), inputValue) || this.activeValue.children) {
                    activeValue = this.findParentRecodTree(this.activeValue);
                }
                else if (this.activeValue) {
                    if (isArrayLike(options)) {
                        activeValue = this.findParentRecodTree(this.findActiveRecord(inputValue, this.options));
                    }
                    else if (options instanceof DataSet) {
                        activeValue = this.findParentRecodTree(this.findActiveRecord(inputValue, this.options.treeData));
                    }
                    else {
                        activeValue = [];
                    }
                }
            }
            else if (inputValue) {
                activeValue = this.findParentRecodTree(this.activeValue);
            }
            return activeValue;
        };
        if (this.popup && !isEmpty(this.activeValue)) {
            selectedValues = this.findParentRecodTree(this.activeValue);
        }
        else if (!this.multiple) {
            selectedValues = getActiveValue(this.getValues());
        }
        else if (this.getValues() && this.getValues().length > 0) {
            for (let i = this.getValues().length - 1; i >= 0; i--) {
                selectedValues = getActiveValue(this.getValues()[i]);
                if (!isEmpty(selectedValues)) {
                    break;
                }
            }
        }
        else if (!isEmpty(this.activeValue)) {
            selectedValues = this.findParentRecodTree(this.activeValue);
        }
        let dropdownMenuStyleMerge = dropdownMenuStyle;
        if ((this.itemMenuWidth > 0)) {
            dropdownMenuStyleMerge = { ...dropdownMenuStyle, width: pxToRem(this.itemMenuWidth) };
        }
        // 渲染成单项选择还是多项选择组件以及空组件
        if (options && options.length) {
            if (!this.multiple && menuMode === MenuMode.single) {
                return (React.createElement(SingleMenu, Object.assign({}, menuProps, { singleMenuStyle: singleMenuStyle, singleMenuItemStyle: singleMenuItemStyle, singlePleaseRender: singlePleaseRender, singleMenuItemRender: singleMenuItemRender, prefixCls: this.prefixCls, expandTrigger: expandTrigger, activeValue: toJS(selectedValues), options: optGroups, locale: { pleaseSelect: $l('Cascader', 'please_select') }, onSelect: this.handleMenuClick, isTabSelected: this.isClickTab, dropdownMenuColumnStyle: dropdownMenuStyleMerge, visible: this.popup })));
            }
            return (React.createElement(Menus, Object.assign({}, menuProps, { prefixCls: this.prefixCls, expandTrigger: expandTrigger, activeValue: selectedValues, options: optGroups, onSelect: this.handleMenuClick, dropdownMenuColumnStyle: dropdownMenuStyleMerge, visible: this.popup })));
        }
        return (React.createElement("div", { key: "no_data" }, this.loading ? ' ' : this.getNotFoundContent()));
    }
    // 遍历出父亲节点
    get loading() {
        const { field, options } = this;
        return options.status === "loading" /* loading */ || (!!field && field.pending.length > 0);
    }
    getPopupContent() {
        const menu = (React.createElement(Spin, { key: "menu", spinning: this.loading }, this.getMenu()));
        if (this.multiple) {
            return [
                React.createElement("div", { key: "check-all", className: `${this.prefixCls}-select-all-none` },
                    React.createElement("span", { onClick: this.chooseAll }, $l('Cascader', 'select_all')),
                    React.createElement("span", { onClick: this.unChooseAll }, $l('Cascader', 'unselect_all'))),
                menu,
            ];
        }
        return menu;
    }
    getPopupStyleFromAlign(target) {
        if (target) {
            if (this.props.dropdownMatchSelectWidth) {
                this.setItemMenuWidth(target.getBoundingClientRect().width);
                return {
                    minWidth: pxToRem(target.getBoundingClientRect().width),
                };
            }
            return undefined;
        }
    }
    getTriggerIconFont() {
        return 'baseline-arrow_drop_down';
    }
    handleKeyDown(e) {
        if (!this.isDisabled() && !this.isReadOnly()) {
            switch (e.keyCode) {
                case KeyCode.RIGHT:
                    this.handleKeyLeftRightNext(e, 1);
                    break;
                case KeyCode.DOWN:
                    this.handleKeyDownPrevNext(e, 1);
                    break;
                case KeyCode.LEFT:
                    this.handleKeyLeftRightNext(e, -1);
                    break;
                case KeyCode.UP:
                    this.handleKeyDownPrevNext(e, -1);
                    break;
                case KeyCode.END:
                case KeyCode.PAGE_DOWN:
                    this.handleKeyDownFirstLast(e, 1);
                    break;
                case KeyCode.HOME:
                case KeyCode.PAGE_UP:
                    this.handleKeyDownFirstLast(e, -1);
                    break;
                case KeyCode.ENTER:
                    this.handleKeyDownEnter(e);
                    break;
                case KeyCode.ESC:
                    this.handleKeyDownEsc(e);
                    break;
                case KeyCode.SPACE:
                    this.handleKeyDownSpace(e);
                    break;
                default:
            }
        }
        super.handleKeyDown(e);
    }
    // 获取当前列第一个值和最后的值
    findTreeDataFirstLast(options, activeValue, direction) {
        const nowIndexList = activeValue.parent ? activeValue.parent.children : options;
        if (nowIndexList.length > 0 && direction > 0) {
            return nowIndexList[nowIndexList.length - 1];
        }
        if (nowIndexList.length > 0 && direction < 0) {
            return nowIndexList[0];
        }
        return activeValue;
    }
    // 按键第一个和最后一个的位置
    handleKeyDownFirstLast(e, direction) {
        stopEvent(e);
        if (isArrayLike(this.options)) {
            if (isEmpty(toJS(this.activeValue))) {
                this.setActiveValue(this.options[0]);
            }
            else {
                const activeItem = this.findTreeDataFirstLast(this.options, this.activeValue, direction);
                if (!this.editable || this.popup) {
                    this.setActiveValue(activeItem);
                }
            }
        }
        else if (this.options instanceof DataSet) {
            if (isEmpty(toJS(this.activeValue))) {
                this.setActiveValue(this.options.treeData[0]);
            }
            else {
                const activeItem = this.findTreeDataFirstLast(this.options.treeData, this.activeValue, direction);
                if (!this.editable || this.popup) {
                    this.setActiveValue(activeItem);
                }
            }
        }
    }
    // 查找同级位置
    findTreeDataUpDown(options, value, direction, fn) {
        const nowIndexList = value.parent ? value.parent.children : options;
        if (isArrayLike(nowIndexList)) {
            const nowIndex = fn !== undefined ? fn : nowIndexList.findIndex(ele => ele.value === value);
            const length = nowIndexList.length;
            if (nowIndex + direction >= length) {
                return nowIndexList[0];
            }
            if (nowIndex + direction < 0) {
                return nowIndexList[length - 1];
            }
            return nowIndexList[nowIndex + direction];
        }
        return value;
    }
    sameKeyRecordIndex(options, activeValue, valueKey) {
        const nowIndexList = activeValue.parent ? activeValue.parent.children : options;
        return nowIndexList.findIndex(ele => ele[valueKey] === activeValue[valueKey]);
    }
    // 上下按键判断
    handleKeyDownPrevNext(e, direction) {
        if (!this.editable) {
            if (isArrayLike(this.options)) {
                if (isEmpty(toJS(this.activeValue))) {
                    this.setActiveValue(this.options[0]);
                }
                else {
                    this.setActiveValue(this.findTreeDataUpDown(this.options, this.activeValue, direction, this.sameKeyRecordIndex(this.options, this.activeValue, 'value')));
                }
            }
            else if (this.options instanceof DataSet) {
                if (isEmpty(toJS(this.activeValue))) {
                    this.setActiveValue(this.options.treeData[0]);
                }
                else {
                    this.setActiveValue(this.findTreeDataUpDown(this.options.treeData, this.activeValue, direction, this.sameKeyRecordIndex(this.options.treeData, this.activeValue, 'key')));
                }
            }
            e.preventDefault();
        }
        else if (e === KeyCode.DOWN) {
            this.expand();
            e.preventDefault();
        }
    }
    // 查找相邻的节点
    findTreeParentChidren(_options, activeValue, direction) {
        if (direction > 0) {
            if (activeValue.children && activeValue.children.length > 0) {
                return activeValue.children[0];
            }
            return activeValue;
        }
        if (activeValue.parent) {
            return activeValue.parent;
        }
        return activeValue;
    }
    handleKeyLeftRightNext(e, direction) {
        if (!this.editable) {
            if (isArrayLike(this.options)) {
                if (isEmpty(toJS(this.activeValue))) {
                    this.setActiveValue(this.options[0]);
                }
                else {
                    this.setActiveValue(this.findTreeParentChidren(this.options, this.activeValue, direction));
                }
            }
            else if (this.options instanceof DataSet) {
                if (isEmpty(toJS(this.activeValue))) {
                    this.setActiveValue(this.options.treeData[0]);
                }
                else {
                    this.setActiveValue(this.findTreeParentChidren(this.options.treeData, this.activeValue, direction));
                }
            }
            e.preventDefault();
        }
        else if (e === KeyCode.DOWN) {
            this.expand();
            e.preventDefault();
        }
    }
    handleKeyDownEnter(e) {
        if (this.popup && !this.editable) {
            const value = this.activeValue;
            if (this.isSelected(value)) {
                this.unChoose(value);
            }
            else if (value.children) {
                this.setPopup(true);
            }
            else if (value instanceof Record && !value.get(disabledField)) {
                this.choose(value);
            }
            else if (!value.disabled && isObject(value)) {
                // @ts-ignore
                this.choose(value);
            }
        }
        e.preventDefault();
    }
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
        const { options } = this;
        if (options && options.length) {
            super.expand();
        }
    }
    syncValueOnBlur(value) {
        if (value) {
            if (this.options instanceof DataSet) {
                this.options.ready().then(() => {
                    const record = this.findByTextWithValue(value);
                    if (record) {
                        this.choose(record);
                    }
                });
            }
            else {
                const record = this.findByTextWithValue(value);
                if (record) {
                    this.choose(record);
                }
            }
        }
        else if (!this.multiple) {
            this.setValue(this.emptyValue);
        }
    }
    findByTextWithValue(text) {
        if (text) {
            const found = this.findByText(text);
            if (found) {
                return found;
            }
        }
    }
    findByText(text) {
        const { textField } = this;
        const findTreeItem = (options, valueItem, index) => {
            let sameItemTreeNode;
            if (valueItem.length > 0) {
                sameItemTreeNode = options.find(ele => {
                    return isSameLike(this.getRecordOrObjValue(ele, textField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], textField) : valueItem[index]);
                });
                if (sameItemTreeNode) {
                    if (sameItemTreeNode.children) {
                        return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
                    }
                    return sameItemTreeNode;
                }
            }
        };
        const textArray = text.split('/');
        if (textArray && textArray.length > 0) {
            if (this.options instanceof DataSet) {
                return findTreeItem(this.options.treeData, textArray, 0);
            }
            return findTreeItem(this.options, textArray, 0);
        }
    }
    findByValue(value) {
        const { valueField } = this;
        const findTreeItem = (options, valueItem, index) => {
            let sameItemTreeNode;
            if (valueItem.length > 0) {
                sameItemTreeNode = options.find(ele => {
                    return isSameLike(this.getRecordOrObjValue(ele, valueField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], valueField) : valueItem[index]);
                });
                if (sameItemTreeNode) {
                    if (sameItemTreeNode.children) {
                        return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
                    }
                    return sameItemTreeNode;
                }
            }
        };
        value = getSimpleValue(value, valueField);
        if (this.options instanceof DataSet) {
            return findTreeItem(this.options.treeData, value, 0);
        }
        return findTreeItem(this.options, value, 0);
    }
    isSelected(record) {
        const { valueField } = this;
        // 多值处理
        if (this.multiple) {
            return this.getValues().some(value => {
                const simpleValue = getSimpleValue(value, valueField);
                return arraySameLike(this.treeValueToArray(record), toJS(simpleValue));
            });
        }
        const simpleValue = this.getValues();
        return arraySameLike(this.treeValueToArray(record), simpleValue);
    }
    generateComboOption(value, callback) {
        const { textField } = this;
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
                }
            }
        }
    }
    handlePopupAnimateAppear() {
    }
    getValueKey(v) {
        if (isArrayLike(v)) {
            return v.map(this.getValueKey, this).join(',');
        }
        const autoType = this.getProp('type') === "auto" /* auto */;
        const value = getSimpleValue(v, this.valueField);
        return autoType && !isNil(value) ? value.toString() : value;
    }
    handlePopupAnimateEnd(_key, _exists) {
    }
    // 触发下拉框的点击事件
    handleMenuClick(targetOption, _menuIndex, isClickTab) {
        if (!targetOption || targetOption.disabled) {
            return;
        }
        if (!this.isSelected(targetOption.value) || isClickTab) {
            if (targetOption.children) {
                this.setPopup(true);
                this.setActiveValue(targetOption.value);
                this.setIsClickTab(isClickTab);
            }
            else {
                if (!isClickTab) {
                    this.setActiveValue(targetOption.value);
                    this.choose(targetOption.value);
                }
                else {
                    this.setPopup(true);
                }
                this.setIsClickTab(isClickTab);
            }
        }
        else {
            this.setactiveEmpty();
            this.unChoose(targetOption.value);
        }
    }
    setactiveEmpty() {
        if (this.multiple) {
            this.setActiveValue([]);
        }
        else {
            this.setActiveValue({});
        }
    }
    handleOptionSelect(record) {
        this.prepareSetValue(this.processRecordToObject(record));
    }
    handleOptionUnSelect(record) {
        const newValue = this.treeValueToArray(record);
        this.removeValue(newValue, -1);
    }
    // 移除所选值
    removeValues(values, index = 0) {
        if (!this.multiple) {
            const oldValues = this.getValues();
            if (this.getValueKey(oldValues) === this.getValueKey(values[0])) {
                if (index === -1) {
                    this.afterRemoveValue(values[0], 1);
                    this.setValue([]);
                }
            }
        }
        super.removeValues(values, index);
        this.setActiveValue({});
        this.collapse();
    }
    setText(text) {
        super.setText(text);
    }
    handleChange(e) {
        const { value } = e.target;
        this.setText(value);
        if (this.observableProps.combo) {
            this.generateComboOption(value, text => this.setText(text));
        }
        if (!this.popup) {
            this.expand();
        }
    }
    processRecordToObject(record) {
        const { primitive } = this;
        if (record instanceof Record && record.dataSet.getFromTree(0)) {
            return primitive ? this.treeValueToArray(record) : this.treeToArray(record);
        }
        if (isObject(record)) {
            return primitive ? this.treeValueToArray(record) : this.treeToArray(record);
        }
    }
    /**
     * 返回tree 的值的列表方法
     * @param record
     * @param allArray
     */
    treeValueToArray(record, allArray) {
        const { valueField } = this;
        if (!allArray) {
            allArray = [];
        }
        if (record) {
            allArray = [this.getRecordOrObjValue(record, valueField), ...allArray];
        }
        if (record.parent) {
            return this.treeValueToArray(record.parent, allArray);
        }
        return allArray;
    }
    /**
     * 返回tree 的值的列表方法
     * @param record
     * @param allArray
     */
    treeTextToArray(record, allArray) {
        const { textField } = this;
        if (!allArray) {
            allArray = [];
        }
        if (record) {
            allArray = [this.getRecordOrObjValue(record, textField), ...allArray];
        }
        if (record.parent) {
            return this.treeTextToArray(record.parent, allArray);
        }
        return allArray;
    }
    /**
     * 返回tree 的值的列表方法
     * @param record
     * @param allArray
     */
    treeToArray(record, allArray) {
        if (!allArray) {
            allArray = [];
        }
        if (record) {
            if (record instanceof Record) {
                allArray = [record.toData(), ...allArray];
            }
            else {
                allArray = [this.removeObjParentChild(record), ...allArray];
            }
        }
        if (record.parent) {
            return this.treeToArray(record.parent, allArray);
        }
        return allArray;
    }
    removeObjParentChild(obj) {
        if (isPlainObject(obj)) {
            const cloneObj = cloneDeep(toJS(obj));
            delete cloneObj.parent;
            delete cloneObj.children;
            return cloneObj;
        }
        return obj;
    }
    processObjectValue(value, textField) {
        if (!isNil(value)) {
            const found = this.findByValue(value);
            if (found && isArrayLike(value)) {
                return this.treeTextToArray(found);
            }
            if (isPlainObject(value)) {
                return ObjectChainValue.get(value, textField);
            }
        }
    }
    processLookupValue(value) {
        const { field, textField, primitive } = this;
        const processvalue = this.processObjectValue(value, textField);
        if (isArrayLike(processvalue)) {
            return processvalue.join('/');
        }
        if (primitive && field) {
            return super.processValue(field.getText(value));
        }
    }
    // 处理value
    processValue(value) {
        const text = this.processLookupValue(value);
        if (isEmptyUtil(text)) {
            if (isPlainObject(value)) {
                return ObjectChainValue.get(value, this.valueField) || '';
            }
            return super.processValue(value);
        }
        return text;
    }
    toValueString(value) {
        if (isArrayLike(value)) {
            return value.join('/');
        }
        return value;
    }
    clear() {
        this.setText(undefined);
        this.setActiveValue({});
        super.clear();
    }
    addValue(...values) {
        if (this.multiple) {
            const oldValues = this.getValues();
            if (values.length) {
                const oldValuesJS = oldValues.map(item => toJS(item));
                this.setValue([...oldValuesJS, ...values]);
            }
            else if (!oldValues.length) {
                this.setValue(this.emptyValue);
            }
        }
        else {
            this.setValue(values.pop());
        }
    }
    resetFilter() {
        this.setText(undefined);
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
        const chooseAll = [];
        if (isArrayLike(this.options)) {
            const findLeafItem = (option) => {
                option.forEach((item) => {
                    if (isEmpty(item.children) && !item.disabled) {
                        // @ts-ignore
                        chooseAll.push(this.processRecordToObject(item));
                    }
                    else {
                        findLeafItem(item.children);
                    }
                });
            };
            findLeafItem(this.options);
        }
        else if (this.options instanceof DataSet) {
            this.options.forEach(item => {
                if (isEmpty(item.children) && !item.get(disabledField)) {
                    // @ts-ignore
                    chooseAll.push(this.processRecordToObject(item));
                }
            }, this);
        }
        this.setValue(chooseAll);
    }
    unChooseAll() {
        this.clear();
    }
    async handlePopupHiddenChange(hidden) {
        this.setIsClickTab(false);
        if (!hidden) {
            this.forcePopupAlign();
        }
        super.handlePopupHiddenChange(hidden);
    }
    async processSelectedData() {
        const values = this.getValues();
        const { field } = this;
        if (field) {
            await field.ready();
        }
        const { observableProps: { combo }, } = this;
        runInAction(() => {
            const newValues = values.filter(value => {
                const record = this.findByValue(value);
                if (record) {
                    return true;
                }
                return false;
            });
            if (this.text && combo) {
                this.generateComboOption(this.text);
            }
            if (field &&
                field.get('cascadeMap') &&
                !isEqual(newValues, values)) {
                this.setValue(this.multiple ? newValues : newValues[0]);
            }
        });
    }
}
Cascader.displayName = 'Cascader';
Cascader.propTypes = {
    /**
     * 次级菜单的展开方式，可选 'click' 和 'hover'
     */
    expandTrigger: PropTypes.oneOf([
        "hover" /* hover */,
        "click" /* click */,
    ]),
    /**
     * 下拉框匹配输入框宽度
     * @default true
     */
    dropdownMatchSelectWidth: PropTypes.bool,
    /**
     * 下拉框菜单样式名
     */
    dropdownMenuStyle: PropTypes.object,
    /**
     * 选项数据源
     */
    options: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
    ]),
    /**
     * 是否为原始值
     * true - 选项中valueField对应的值
     * false - 选项值对象
     */
    primitiveValue: PropTypes.bool,
    /**
     * 当下拉列表为空时显示的内容
     */
    notFoundContent: PropTypes.node,
    /**
     * 设置选项属性，如 disabled;
     */
    onOption: PropTypes.func,
    singleMenuStyle: PropTypes.object,
    singleMenuItemStyle: PropTypes.object,
    singlePleaseRender: PropTypes.func,
    singleMenuItemRender: PropTypes.func,
    ...TriggerField.propTypes,
};
Cascader.defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'cascader',
    dropdownMatchSelectWidth: false,
    expandTrigger: "click" /* click */,
    onOption: defaultOnOption,
};
__decorate([
    observable
], Cascader.prototype, "activeValues", void 0);
__decorate([
    observable
], Cascader.prototype, "menuItemWith", void 0);
__decorate([
    observable
], Cascader.prototype, "clickTab", void 0);
__decorate([
    computed
], Cascader.prototype, "isClickTab", null);
__decorate([
    computed
], Cascader.prototype, "activeValue", null);
__decorate([
    computed
], Cascader.prototype, "itemMenuWidth", null);
__decorate([
    action
], Cascader.prototype, "setActiveValue", null);
__decorate([
    action
], Cascader.prototype, "setIsClickTab", null);
__decorate([
    action
], Cascader.prototype, "setItemMenuWidth", null);
__decorate([
    computed
], Cascader.prototype, "defaultValidationMessages", null);
__decorate([
    computed
], Cascader.prototype, "textField", null);
__decorate([
    computed
], Cascader.prototype, "valueField", null);
__decorate([
    computed
], Cascader.prototype, "cascadeOptions", null);
__decorate([
    computed
], Cascader.prototype, "editable", null);
__decorate([
    computed
], Cascader.prototype, "multiple", null);
__decorate([
    computed
], Cascader.prototype, "menuMultiple", null);
__decorate([
    computed
], Cascader.prototype, "options", null);
__decorate([
    computed
], Cascader.prototype, "primitive", null);
__decorate([
    autobind
], Cascader.prototype, "getMenu", null);
__decorate([
    computed
], Cascader.prototype, "loading", null);
__decorate([
    autobind
], Cascader.prototype, "getPopupStyleFromAlign", null);
__decorate([
    autobind
], Cascader.prototype, "handleKeyDown", null);
__decorate([
    autobind
], Cascader.prototype, "handleBlur", null);
__decorate([
    autobind
], Cascader.prototype, "handlePopupAnimateEnd", null);
__decorate([
    autobind
], Cascader.prototype, "handleMenuClick", null);
__decorate([
    action
], Cascader.prototype, "setText", null);
__decorate([
    autobind,
    action
], Cascader.prototype, "handleChange", null);
__decorate([
    action
], Cascader.prototype, "clear", null);
__decorate([
    autobind
], Cascader.prototype, "reset", null);
__decorate([
    autobind
], Cascader.prototype, "chooseAll", null);
__decorate([
    autobind
], Cascader.prototype, "unChooseAll", null);
__decorate([
    autobind
], Cascader.prototype, "handlePopupHiddenChange", null);
let ObserverCascader = class ObserverCascader extends Cascader {
};
ObserverCascader.defaultProps = Cascader.defaultProps;
ObserverCascader = __decorate([
    observer
], ObserverCascader);
export default ObserverCascader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Nhc2NhZGVyL0Nhc2NhZGVyLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBaUIsY0FBYyxFQUFnQyxNQUFNLE9BQU8sQ0FBQztBQUMzRixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQXFCLFdBQVcsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNqSCxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzVFLE9BQU8sT0FBTyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0QsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3JELE9BQU8sWUFBbUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRixPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FB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QTBKRDtJQURDLFFBQVE7MENBTVI7QUFxSUQ7SUFEQyxRQUFRO3FEQUVSO0FBSUQ7SUFEQyxRQUFROytDQXVCUjtBQW9DRDtJQURDLE1BQU07dUNBR047QUFLRDtJQUZDLFFBQVE7SUFDUixNQUFNOzRDQVVOO0FBNkhEO0lBREMsTUFBTTtxQ0FLTjtBQXNCRDtJQURDLFFBQVE7cUNBSVI7QUFtQkQ7SUFEQyxRQUFRO3lDQXdCUjtBQUdEO0lBREMsUUFBUTsyQ0FHUjtBQUdEO0lBREMsUUFBUTt1REFPUjtBQWtDSCxJQUFxQixnQkFBZ0IsR0FBckMsTUFBcUIsZ0JBQWlCLFNBQVEsUUFBdUI7Q0FFcEUsQ0FBQTtBQURRLDZCQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUR6QixnQkFBZ0I7SUFEcEMsUUFBUTtHQUNZLGdCQUFnQixDQUVwQztlQUZvQixnQkFBZ0IiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Nhc2NhZGVyL0Nhc2NhZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ1NTUHJvcGVydGllcywgaXNWYWxpZEVsZW1lbnQsIEtleSwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoL2lzRXF1YWwnO1xuaW1wb3J0IGlzTmlsIGZyb20gJ2xvZGFzaC9pc05pbCc7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2gvaXNFbXB0eSc7XG5pbXBvcnQgbm9vcCBmcm9tICdsb2Rhc2gvbm9vcCc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdsb2Rhc2gvaXNQbGFpbk9iamVjdCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlLCBjb21wdXRlZCwgSVJlYWN0aW9uRGlzcG9zZXIsIGlzQXJyYXlMaWtlLCByZWFjdGlvbiwgcnVuSW5BY3Rpb24sIHRvSlMgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IE1lbnVzLCBTaW5nbGVNZW51IH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9yYy1jb21wb25lbnRzL2Nhc2NhZGVyJztcbmltcG9ydCBLZXlDb2RlIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvS2V5Q29kZSc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbmZpZ3VyZSc7XG5pbXBvcnQgeyBweFRvUmVtIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgaXNGdW5jdGlvbiBmcm9tICdsb2Rhc2gvaXNGdW5jdGlvbic7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoL2lzT2JqZWN0JztcbmltcG9ydCB7IE1lbnVNb2RlIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jYXNjYWRlcic7XG5pbXBvcnQgVHJpZ2dlckZpZWxkLCB7IFRyaWdnZXJGaWVsZFByb3BzIH0gZnJvbSAnLi4vdHJpZ2dlci1maWVsZC9UcmlnZ2VyRmllbGQnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCB7IFZhbGlkYXRpb25NZXNzYWdlcyB9IGZyb20gJy4uL3ZhbGlkYXRvci9WYWxpZGF0b3InO1xuaW1wb3J0IHsgRGF0YVNldFN0YXR1cywgRmllbGRUeXBlIH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5pbXBvcnQgRGF0YVNldCBmcm9tICcuLi9kYXRhLXNldC9EYXRhU2V0JztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi4vZGF0YS1zZXQvUmVjb3JkJztcbmltcG9ydCBTcGluIGZyb20gJy4uL3NwaW4nO1xuaW1wb3J0IHsgc3RvcEV2ZW50IH0gZnJvbSAnLi4vX3V0aWwvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCBub3JtYWxpemVPcHRpb25zIGZyb20gJy4uL29wdGlvbi9ub3JtYWxpemVPcHRpb25zJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0ICogYXMgT2JqZWN0Q2hhaW5WYWx1ZSBmcm9tICcuLi9fdXRpbC9PYmplY3RDaGFpblZhbHVlJztcbmltcG9ydCBpc0VtcHR5VXRpbCBmcm9tICcuLi9fdXRpbC9pc0VtcHR5JztcbmltcG9ydCBpc1NhbWVMaWtlIGZyb20gJy4uL191dGlsL2lzU2FtZUxpa2UnO1xuaW1wb3J0IHsgT3B0aW9uUHJvcHMgfSBmcm9tICcuLi9vcHRpb24vT3B0aW9uJztcbmltcG9ydCB7IEV4cGFuZFRyaWdnZXIgfSBmcm9tICcuL2VudW0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbk9iamVjdCB7XG4gIHZhbHVlOiBhbnksXG4gIG1lYW5pbmc6IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9jZXNzT3B0aW9uIGV4dGVuZHMgT3B0aW9uT2JqZWN0IHtcbiAgcGFyZW50OiBhbnksXG4gIGNoaWxkcmVuPzogYW55LFxuICBkaXNhYmxlZD86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FzY2FkZXJPcHRpb25UeXBlIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgbGFiZWw6IFJlYWN0Tm9kZTtcbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICBjaGlsZHJlbj86IEFycmF5PENhc2NhZGVyT3B0aW9uVHlwZT47XG4gIHBhcmVudD86IEFycmF5PENhc2NhZGVyT3B0aW9uVHlwZT47XG4gIF9fSVNfRklMVEVSRURfT1BUSU9OPzogYm9vbGVhbjtcbn1cblxuXG5jb25zdCBkaXNhYmxlZEZpZWxkID0gJ19fZGlzYWJsZWQnO1xuXG5mdW5jdGlvbiBkZWZhdWx0T25PcHRpb24oeyByZWNvcmQgfSkge1xuICBpZiAocmVjb3JkIGluc3RhbmNlb2YgUmVjb3JkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc2FibGVkOiByZWNvcmQuZ2V0KGRpc2FibGVkRmllbGQpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEl0ZW1LZXkocmVjb3JkOiBSZWNvcmQsIHRleHQ6IFJlYWN0Tm9kZSwgdmFsdWU6IGFueSkge1xuICByZXR1cm4gYGl0ZW0tJHt2YWx1ZSB8fCByZWNvcmQuaWR9LSR7KGlzVmFsaWRFbGVtZW50KHRleHQpID8gdGV4dC5rZXkgOiB0ZXh0KSB8fCByZWNvcmQuaWR9YDtcbn1cblxuZnVuY3Rpb24gZ2V0U2ltcGxlVmFsdWUodmFsdWUsIHZhbHVlRmllbGQpIHtcbiAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIE9iamVjdENoYWluVmFsdWUuZ2V0KHZhbHVlLCB2YWx1ZUZpZWxkKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICog566A5Y2V5q+U6L6DYXJyeeeahOWAvOaYr+WQpuebuOWQjFxuICog5Li76KaB6Zeu6aKY5piv6KeC5a+f5Y+Y6YeP5L+u5pS55LqG5YC857G75Z6L5omA5Lul5L2/55So5q2k5pa55rOVXG4gKiBAcGFyYW0gYXJyXG4gKiBAcGFyYW0gYXJyTmV4dFxuICovXG5mdW5jdGlvbiBhcnJheVNhbWVMaWtlKGFyciwgYXJyTmV4dCk6IGJvb2xlYW4ge1xuICBpZiAoIGlzQXJyYXlMaWtlKGFycikgJiYgIGlzQXJyYXlMaWtlKGFyck5leHQpKSB7XG4gICAgcmV0dXJuIGFyci50b1N0cmluZygpID09PSBhcnJOZXh0LnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgdHlwZSBvbk9wdGlvblByb3BzID0geyBkYXRhU2V0OiBEYXRhU2V0OyByZWNvcmQ6IFJlY29yZCB9O1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FzY2FkZXJQcm9wcyBleHRlbmRzIFRyaWdnZXJGaWVsZFByb3BzIHtcbiAgLyoqXG4gICAqIOasoee6p+iPnOWNleeahOWxleW8gOaWueW8j++8jOWPr+mAiSAnY2xpY2snIOWSjCAnaG92ZXInXG4gICAqL1xuICBleHBhbmRUcmlnZ2VyPzogRXhwYW5kVHJpZ2dlclxuICAvKipcbiAgICog5LiL5ouJ5qGG5Yy56YWN6L6T5YWl5qGG5a695bqmXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGRyb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDkuIvmi4nmoYboj5zljZXmoLflvI/lkI1cbiAgICovXG4gIGRyb3Bkb3duTWVudVN0eWxlPzogQ1NTUHJvcGVydGllcztcbiAgLyoqXG4gICAqIOmAiemhueaVsOaNrua6kFxuICAgKi9cbiAgb3B0aW9ucz86IERhdGFTZXQgfCBDYXNjYWRlck9wdGlvblR5cGVbXTtcbiAgLyoqXG4gICAqIOaYr+WQpuS4uuWOn+Wni+WAvFxuICAgKiB0cnVlIC0g6YCJ6aG55LitdmFsdWVGaWVsZOWvueW6lOeahOWAvFxuICAgKiBmYWxzZSAtIOmAiemhueWAvOWvueixoVxuICAgKi9cbiAgcHJpbWl0aXZlVmFsdWU/OiBib29sZWFuO1xuICAvKipcbiAgICog5b2T5LiL5ouJ5YiX6KGo5Li656m65pe25pi+56S655qE5YaF5a65XG4gICAqL1xuICBub3RGb3VuZENvbnRlbnQ/OiBSZWFjdE5vZGU7XG4gIC8qKlxuICAgKiDorr7nva7pgInpobnlsZ7mgKfvvIzlpoIgZGlzYWJsZWQ7XG4gICAqL1xuICBvbk9wdGlvbjogKHByb3BzOiBvbk9wdGlvblByb3BzKSA9PiBPcHRpb25Qcm9wcztcbiAgLyoqIOWNleahhuW8ueWHuuW9ouW8j+WIh+aNoiAqL1xuICBtZW51TW9kZT86IE1lbnVNb2RlO1xuICAvKiog55Sx5LqO5riy5p+T5ZyoYm9keeS4i+WPr+S7peaWueS+v+aMieeFp+S4muWKoemFjee9ruW8ueWHuuahhueahOWkp+WwjyAqL1xuICBzaW5nbGVNZW51U3R5bGU/OiBDU1NQcm9wZXJ0aWVzLFxuICAvKiog55Sx5LqO5riy5p+T5ZyoYm9keeS4i+WPr+S7peaWueS+v+aMieeFp+S4muWKoemFjee9rui2heWHuuWkp+Wwj+agt+W8j+WSjOacgOWwj+WuveW6puetiSAqL1xuICBzaW5nbGVNZW51SXRlbVN0eWxlPzogQ1NTUHJvcGVydGllcyxcbiAgLyoqIOiuvue9rumcgOimgeeahOaPkOekuumXrumimOmFjee9riAqL1xuICBzaW5nbGVQbGVhc2VSZW5kZXI/OiAoe2tleSxjbGFzc05hbWUsdGV4dH06e2tleTogc3RyaW5nLGNsYXNzTmFtZTogc3RyaW5nLHRleHQ6IHN0cmluZ30pID0+IFJlYWN0RWxlbWVudDxhbnk+LFxuICAvKiog5aS06YOo5Y+v5Lul5riy5p+T5Ye65oOz6KaB55qEdGFi5qC35a2QICovXG4gIHNpbmdsZU1lbnVJdGVtUmVuZGVyPzogKHRpdGxlOnN0cmluZykgPT4gUmVhY3RFbGVtZW50PGFueT4sXG59XG5cbmV4cG9ydCBjbGFzcyBDYXNjYWRlcjxUIGV4dGVuZHMgQ2FzY2FkZXJQcm9wcz4gZXh0ZW5kcyBUcmlnZ2VyRmllbGQ8VD4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnQ2FzY2FkZXInO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLyoqXG4gICAgICog5qyh57qn6I+c5Y2V55qE5bGV5byA5pa55byP77yM5Y+v6YCJICdjbGljaycg5ZKMICdob3ZlcidcbiAgICAgKi9cbiAgICBleHBhbmRUcmlnZ2VyOiBQcm9wVHlwZXMub25lT2YoW1xuICAgICAgRXhwYW5kVHJpZ2dlci5ob3ZlcixcbiAgICAgIEV4cGFuZFRyaWdnZXIuY2xpY2ssXG4gICAgXSksXG4gICAgLyoqXG4gICAgICog5LiL5ouJ5qGG5Yy56YWN6L6T5YWl5qGG5a695bqmXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGRyb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aDogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog5LiL5ouJ5qGG6I+c5Y2V5qC35byP5ZCNXG4gICAgICovXG4gICAgZHJvcGRvd25NZW51U3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgLyoqXG4gICAgICog6YCJ6aG55pWw5o2u5rqQXG4gICAgICovXG4gICAgb3B0aW9uczogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCksXG4gICAgXSksXG4gICAgLyoqXG4gICAgICog5piv5ZCm5Li65Y6f5aeL5YC8XG4gICAgICogdHJ1ZSAtIOmAiemhueS4rXZhbHVlRmllbGTlr7nlupTnmoTlgLxcbiAgICAgKiBmYWxzZSAtIOmAiemhueWAvOWvueixoVxuICAgICAqL1xuICAgIHByaW1pdGl2ZVZhbHVlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDlvZPkuIvmi4nliJfooajkuLrnqbrml7bmmL7npLrnmoTlhoXlrrlcbiAgICAgKi9cbiAgICBub3RGb3VuZENvbnRlbnQ6IFByb3BUeXBlcy5ub2RlLFxuICAgIC8qKlxuICAgICAqIOiuvue9rumAiemhueWxnuaAp++8jOWmgiBkaXNhYmxlZDtcbiAgICAgKi9cbiAgICBvbk9wdGlvbjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgc2luZ2xlTWVudVN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHNpbmdsZU1lbnVJdGVtU3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgc2luZ2xlUGxlYXNlUmVuZGVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBzaW5nbGVNZW51SXRlbVJlbmRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLi4uVHJpZ2dlckZpZWxkLnByb3BUeXBlcyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIC4uLlRyaWdnZXJGaWVsZC5kZWZhdWx0UHJvcHMsXG4gICAgc3VmZml4Q2xzOiAnY2FzY2FkZXInLFxuICAgIGRyb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aDogZmFsc2UsXG4gICAgZXhwYW5kVHJpZ2dlcjogRXhwYW5kVHJpZ2dlci5jbGljayxcbiAgICBvbk9wdGlvbjogZGVmYXVsdE9uT3B0aW9uLFxuICB9O1xuXG5cbiAgQG9ic2VydmFibGUgYWN0aXZlVmFsdWVzO1xuXG4gIEBvYnNlcnZhYmxlIG1lbnVJdGVtV2l0aDogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIGNsaWNrVGFiO1xuXG4gIEBjb21wdXRlZCBcbiAgZ2V0IGlzQ2xpY2tUYWIoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xpY2tUYWI7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGFjdGl2ZVZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlVmFsdWVzO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBpdGVtTWVudVdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWVudUl0ZW1XaXRoO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh7fSk7XG4gICAgdGhpcy5zZXRJdGVtTWVudVdpZHRoKDApO1xuICAgIHRoaXMuc2V0SXNDbGlja1RhYihmYWxzZSk7XG4gIH1cblxuICBmaW5kQWN0aXZlUmVjb3JkKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCByZXR1cm5BY3RpdmVWYWx1ZSA9IChhcnJheU9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChhcnJheU9wdGlvbiAmJiBhcnJheU9wdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFycmF5T3B0aW9uLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICBpZiAoaXNTYW1lTGlrZSh2YWx1ZVtpbmRleF0sIHRoaXMuZ2V0UmVjb3JkT3JPYmpWYWx1ZShpdGVtLCB0aGlzLnZhbHVlRmllbGQpKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gaXRlbTtcbiAgICAgICAgICAgIGlmIChpdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgIHJldHVybkFjdGl2ZVZhbHVlKGl0ZW0uY2hpbGRyZW4sICsraW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIERhdGFTZXQpIHtcbiAgICAgIHJldHVybkFjdGl2ZVZhbHVlKG9wdGlvbnMudHJlZURhdGEsIDApO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheUxpa2Uob3B0aW9ucykpIHtcbiAgICAgIHJldHVybkFjdGl2ZVZhbHVlKG9wdGlvbnMsIDApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRBY3RpdmVWYWx1ZShhY3RpdmVWYWx1ZXM6IGFueSkge1xuICAgIHRoaXMuYWN0aXZlVmFsdWVzID0gYWN0aXZlVmFsdWVzO1xuICB9XG5cbiAgQGFjdGlvbiBzZXRJc0NsaWNrVGFiKGlzQ2xpY2tUYWI6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmNsaWNrVGFiID0gaXNDbGlja1RhYjtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0SXRlbU1lbnVXaWR0aCh3aWR0aDogbnVtYmVyKSB7XG4gICAgdGhpcy5tZW51SXRlbVdpdGggPSB3aWR0aDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZGVmYXVsdFZhbGlkYXRpb25NZXNzYWdlcygpOiBWYWxpZGF0aW9uTWVzc2FnZXMge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRQcm9wKCdsYWJlbCcpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZU1pc3Npbmc6ICRsKCdDYXNjYWRlcicsIGxhYmVsID8gJ3ZhbHVlX21pc3NpbmcnIDogJ3ZhbHVlX21pc3Npbmdfbm9fbGFiZWwnLCB7IGxhYmVsIH0pLFxuICAgIH07XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHRleHRGaWVsZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFByb3AoJ3RleHRGaWVsZCcpIHx8ICdtZWFuaW5nJztcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsdWVGaWVsZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldFByb3AoJ3ZhbHVlRmllbGQnKSB8fCAndmFsdWUnO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjYXNjYWRlT3B0aW9ucygpOiBSZWNvcmRbXSB7XG4gICAgY29uc3QgeyByZWNvcmQsIGZpZWxkLCBvcHRpb25zIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gb3B0aW9ucztcbiAgICBpZiAoZmllbGQpIHtcbiAgICAgIGNvbnN0IGNhc2NhZGVNYXAgPSBmaWVsZC5nZXQoJ2Nhc2NhZGVNYXAnKTtcbiAgICAgIGlmIChjYXNjYWRlTWFwKSB7XG4gICAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgICBjb25zdCBjYXNjYWRlcyA9IE9iamVjdC5rZXlzKGNhc2NhZGVNYXApO1xuICAgICAgICAgIHJldHVybiBkYXRhLmZpbHRlcihpdGVtID0+XG4gICAgICAgICAgICBjYXNjYWRlcy5ldmVyeShjYXNjYWRlID0+XG4gICAgICAgICAgICAgIGlzU2FtZUxpa2UocmVjb3JkLmdldChjYXNjYWRlTWFwW2Nhc2NhZGVdKSwgaXRlbS5nZXQoY2FzY2FkZSkpLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGVkaXRhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgQGNvbXB1dGVkXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLmdldFByb3AoJ211bHRpcGxlJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IG1lbnVNdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBsZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgb3B0aW9ucygpOiBEYXRhU2V0IHtcbiAgICBjb25zdCB7XG4gICAgICBmaWVsZCxcbiAgICAgIHRleHRGaWVsZCxcbiAgICAgIHZhbHVlRmllbGQsXG4gICAgICBtdWx0aXBsZSxcbiAgICAgIG9ic2VydmFibGVQcm9wczogeyBjaGlsZHJlbiwgb3B0aW9ucyB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGxldCBkZWFsT3B0aW9uO1xuICAgIGlmIChpc0FycmF5TGlrZShvcHRpb25zKSkge1xuICAgICAgZGVhbE9wdGlvbiA9IHRoaXMuYWRkT3B0aW9uc1BhcmVudChvcHRpb25zLCB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWFsT3B0aW9uID0gb3B0aW9ucztcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIGRlYWxPcHRpb24gfHxcbiAgICAgIChmaWVsZCAmJiBmaWVsZC5vcHRpb25zKSB8fFxuICAgICAgbm9ybWFsaXplT3B0aW9ucyh7IHRleHRGaWVsZCwgdmFsdWVGaWVsZCwgZGlzYWJsZWRGaWVsZCwgbXVsdGlwbGUsIGNoaWxkcmVuIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8vIOWinuWKoOeItue6p+WxnuaAp1xuICBhZGRPcHRpb25zUGFyZW50KG9wdGlvbnMsIHBhcmVudCkge1xuICAgIGlmIChvcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG9wdGlvblByZW50ID0gb3B0aW9ucy5tYXAoKGVsZSkgPT4ge1xuICAgICAgICBlbGUucGFyZW50ID0gcGFyZW50IHx8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGVsZS5jaGlsZHJlbikge1xuICAgICAgICAgIHRoaXMuYWRkT3B0aW9uc1BhcmVudChlbGUuY2hpbGRyZW4sIGVsZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG9wdGlvblByZW50O1xuICAgIH1cbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcHJpbWl0aXZlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFByb3AoJ3R5cGUnKTtcbiAgICBpZiAodGhpcy5vcHRpb25zIGluc3RhbmNlb2YgRGF0YVNldCkge1xuICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLnByaW1pdGl2ZVZhbHVlICE9PSBmYWxzZSAmJiB0eXBlICE9PSBGaWVsZFR5cGUub2JqZWN0O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlUHJvcHMucHJpbWl0aXZlVmFsdWUgIT09IGZhbHNlO1xuICB9XG5cbiAgY2hlY2tWYWx1ZVJlYWN0aW9uPzogSVJlYWN0aW9uRGlzcG9zZXI7XG5cbiAgY2hlY2tDb21ib1JlYWN0aW9uPzogSVJlYWN0aW9uRGlzcG9zZXI7XG5cblxuICBjaGVja1ZhbHVlKCkge1xuICAgIHRoaXMuY2hlY2tWYWx1ZVJlYWN0aW9uID0gcmVhY3Rpb24oKCkgPT4gdGhpcy5jYXNjYWRlT3B0aW9ucywgKCkgPT4gdGhpcy5wcm9jZXNzU2VsZWN0ZWREYXRhKCkpO1xuICB9XG5cbiAgY2hlY2tDb21ibygpIHtcbiAgICB0aGlzLmNoZWNrQ29tYm9SZWFjdGlvbiA9IHJlYWN0aW9uKFxuICAgICAgKCkgPT4gdGhpcy5nZXRWYWx1ZSgpLFxuICAgICAgdmFsdWUgPT4gdGhpcy5nZW5lcmF0ZUNvbWJvT3B0aW9uKHZhbHVlKSxcbiAgICApO1xuICB9XG5cbiAgY2xlYXJDaGVja1ZhbHVlKCkge1xuICAgIGlmICh0aGlzLmNoZWNrVmFsdWVSZWFjdGlvbikge1xuICAgICAgdGhpcy5jaGVja1ZhbHVlUmVhY3Rpb24oKTtcbiAgICAgIHRoaXMuY2hlY2tWYWx1ZVJlYWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2hlY2tDb21ibygpIHtcbiAgICBpZiAodGhpcy5jaGVja0NvbWJvUmVhY3Rpb24pIHtcbiAgICAgIHRoaXMuY2hlY2tDb21ib1JlYWN0aW9uKCk7XG4gICAgICB0aGlzLmNoZWNrQ29tYm9SZWFjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBjbGVhclJlYWN0aW9uKCkge1xuICAgIHRoaXMuY2xlYXJDaGVja1ZhbHVlKCk7XG4gICAgdGhpcy5jbGVhckNoZWNrQ29tYm8oKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBzdXBlci5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgdGhpcy5jbGVhclJlYWN0aW9uKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcywgbmV4dENvbnRleHQpIHtcbiAgICBzdXBlci5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcywgbmV4dENvbnRleHQpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIHRoaXMuZm9yY2VQb3B1cEFsaWduKCk7XG4gIH1cblxuICBnZXRPdGhlclByb3BzKCkge1xuICAgIGNvbnN0IG90aGVyUHJvcHMgPSBvbWl0KHN1cGVyLmdldE90aGVyUHJvcHMoKSwgW1xuICAgICAgJ211bHRpcGxlJyxcbiAgICAgICd2YWx1ZScsXG4gICAgICAnbmFtZScsXG4gICAgICAnZHJvcGRvd25NYXRjaFNlbGVjdFdpZHRoJyxcbiAgICAgICdkcm9wZG93bk1lbnVTdHlsZScsXG4gICAgICAncHJpbWl0aXZlVmFsdWUnLFxuICAgICAgJ25vdEZvdW5kQ29udGVudCcsXG4gICAgICAnb25PcHRpb24nLFxuICAgICAgJ2V4cGFuZFRyaWdnZXInLFxuICAgICAgJ2Ryb3Bkb3duTWF0Y2hTZWxlY3RXaWR0aCcsXG4gICAgICAnZHJvcGRvd25NZW51U3R5bGUnLFxuICAgICAgJ21lbnVNb2RlJyxcbiAgICAgICdzaW5nbGVNZW51U3R5bGUnLFxuICAgICAgJ3NpbmdsZU1lbnVJdGVtU3R5bGUnLFxuICAgICAgJ3NpbmdsZVBsZWFzZVJlbmRlcicsXG4gICAgICAnc2luZ2xlTWVudUl0ZW1SZW5kZXInLCBcbiAgICBdKTtcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci5nZXRPYnNlcnZhYmxlUHJvcHMocHJvcHMsIGNvbnRleHQpLFxuICAgICAgY2hpbGRyZW46IHByb3BzLmNoaWxkcmVuLFxuICAgICAgb3B0aW9uczogcHJvcHMub3B0aW9ucyxcbiAgICAgIHByaW1pdGl2ZVZhbHVlOiBwcm9wcy5wcmltaXRpdmVWYWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0TWVudVByZWZpeENscygpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5wcmVmaXhDbHN9LWRyb3Bkb3duLW1lbnVgO1xuICB9XG5cbiAgcmVuZGVyTXVsdGlwbGVIb2xkZXIoKSB7XG4gICAgY29uc3QgeyBuYW1lLCBtdWx0aXBsZSB9ID0gdGhpcztcbiAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiBzdXBlci5yZW5kZXJNdWx0aXBsZUhvbGRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIGtleT1cInZhbHVlXCJcbiAgICAgICAgdHlwZT1cImhpZGRlblwiXG4gICAgICAgIHZhbHVlPXt0aGlzLnRvVmFsdWVTdHJpbmcodGhpcy5nZXRWYWx1ZSgpKSB8fCAnJ31cbiAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgb25DaGFuZ2U9e25vb3B9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBnZXROb3RGb3VuZENvbnRlbnQoKSB7XG4gICAgY29uc3QgeyBub3RGb3VuZENvbnRlbnQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG5vdEZvdW5kQ29udGVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbm90Rm91bmRDb250ZW50O1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29uZmlnKCdyZW5kZXJFbXB0eScpKCdTZWxlY3QnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDov5Tlm57kuIDkuKrmiZPlubN0cmVl6L+U5Zue5bGC57qnXG4gICAqIEBwYXJhbSByZWNvcmRcbiAgICogQHBhcmFtIGZuXG4gICAqL1xuICBmaW5kUGFyZW50UmVjb2RUcmVlKHJlY29yZDogUmVjb3JkLCBmbj86IGFueSkge1xuICAgIGNvbnN0IHJlY29yZFRyZWU6IGFueVtdID0gW107XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgaWYgKCBpc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICByZWNvcmRUcmVlLnB1c2goZm4ocmVjb3JkKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWNvcmRUcmVlLnB1c2gocmVjb3JkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlY29yZCAmJiByZWNvcmQucGFyZW50KSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLmZpbmRQYXJlbnRSZWNvZFRyZWUocmVjb3JkLnBhcmVudCwgZm4pLCAuLi5yZWNvcmRUcmVlXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbLi4udGhpcy5maW5kUGFyZW50UmVjb2RUcmVlKHJlY29yZC5wYXJlbnQpLCAuLi5yZWNvcmRUcmVlXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZFRyZWU7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+WcmVjb3JkIOaIluiAhSBvYmrlr7nlupTnmoTlgLxcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBrZXlcbiAgICovXG4gIGdldFJlY29yZE9yT2JqVmFsdWUodmFsdWUsIGtleSkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlY29yZCkge1xuICAgICAgcmV0dXJuIHZhbHVlLmdldChrZXkpO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWVba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIOa4suafk21lbnUg6KGo5qC8XG4gICAqIEBwYXJhbSBtZW51UHJvcHNcbiAgICovXG4gIEBhdXRvYmluZFxuICBnZXRNZW51KG1lbnVQcm9wczogb2JqZWN0ID0ge30pOiBSZWFjdE5vZGUge1xuICAgIC8vIOaaguaXtuS4jeeUqOiAg+iZkeWIhue7hOaDheWGtSBncm91cHNcbiAgICBjb25zdCB7XG4gICAgICBvcHRpb25zLFxuICAgICAgdGV4dEZpZWxkLFxuICAgICAgdmFsdWVGaWVsZCxcbiAgICAgIHByb3BzOiB7XG4gICAgICAgIGRyb3Bkb3duTWVudVN0eWxlLCBcbiAgICAgICAgZXhwYW5kVHJpZ2dlciwgXG4gICAgICAgIG9uT3B0aW9uLCBcbiAgICAgICAgbWVudU1vZGUsXG4gICAgICAgIHNpbmdsZU1lbnVTdHlsZSxcbiAgICAgICAgc2luZ2xlTWVudUl0ZW1TdHlsZSxcbiAgICAgICAgc2luZ2xlUGxlYXNlUmVuZGVyLFxuICAgICAgICBzaW5nbGVNZW51SXRlbVJlbmRlcixcbiAgICAgIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbWVudURpc2FibGVkID0gdGhpcy5pc0Rpc2FibGVkKCk7XG4gICAgbGV0IG9wdEdyb3VwczogYW55W10gPSBbXTtcbiAgICBsZXQgc2VsZWN0ZWRWYWx1ZXM6IGFueVtdID0gW107XG4gICAgLy8g56Gu5L+ddGFia2V55ZSv5LiAXG4gICAgbGV0IGRlZXBpbmRleCA9IDA7XG4gICAgY29uc3QgdHJlZVByb3BzQ2hhbmdlID0gKHRyZWVSZWNvcmQ6IFByb2Nlc3NPcHRpb25bXSB8IFJlY29yZFtdKSA9PiB7XG4gICAgICBsZXQgdHJlZVJlY29yZHM6IGFueSA9IFtdO1xuICAgICAgaWYgKHRyZWVSZWNvcmQubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRyZWVSZWNvcmRzID0gdHJlZVJlY29yZC5tYXAoKHJlY29yZEl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgZGVlcGluZGV4KytcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0UmVjb3JkT3JPYmpWYWx1ZShyZWNvcmRJdGVtLCB2YWx1ZUZpZWxkKTtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXRSZWNvcmRPck9ialZhbHVlKHJlY29yZEl0ZW0sIHRleHRGaWVsZCk7XG4gICAgICAgICAgaWYgKHJlY29yZEl0ZW0gaW5zdGFuY2VvZiBSZWNvcmQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvblByb3BzID0gb25PcHRpb24oeyBkYXRhU2V0OiBvcHRpb25zLCByZWNvcmQ6IHJlY29yZEl0ZW0gfSk7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25EaXNhYmxlZCA9IG1lbnVEaXNhYmxlZCB8fCAob3B0aW9uUHJvcHMgJiYgb3B0aW9uUHJvcHMuZGlzYWJsZWQpO1xuICAgICAgICAgICAgY29uc3Qga2V5OiBLZXkgPSBnZXRJdGVtS2V5KHJlY29yZEl0ZW0sIHRleHQsIHZhbHVlKTtcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbjtcbiAgICAgICAgICAgIGlmIChyZWNvcmRJdGVtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZXMucHVzaChyZWNvcmRJdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWNvcmRJdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuID0gdHJlZVByb3BzQ2hhbmdlKHJlY29yZEl0ZW0uY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChjaGlsZHJlbiA/IHtcbiAgICAgICAgICAgICAgLi4ub3B0aW9uUHJvcHMsXG4gICAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25EaXNhYmxlZCxcbiAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICBsYWJlbDogdGV4dCxcbiAgICAgICAgICAgICAgdmFsdWU6IHJlY29yZEl0ZW0sXG4gICAgICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgLi4ub3B0aW9uUHJvcHMsXG4gICAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25EaXNhYmxlZCxcbiAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICBsYWJlbDogdGV4dCxcbiAgICAgICAgICAgICAgdmFsdWU6IHJlY29yZEl0ZW0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgb3B0aW9uUHJvcHMgPSBvbk9wdGlvbih7IGRhdGFTZXQ6IG9wdGlvbnMsIHJlY29yZDogcmVjb3JkSXRlbSB9KTtcbiAgICAgICAgICBjb25zdCBvcHRpb25EaXNhYmxlZCA9IHJlY29yZEl0ZW0uZGlzYWJsZWQgfHwgb3B0aW9uUHJvcHM7XG4gICAgICAgICAgY29uc3Qga2V5OiBLZXkgPSBgJHtkZWVwaW5kZXh9LSR7aW5kZXh9YDtcbiAgICAgICAgICBsZXQgY2hpbGRyZW46IGFueTtcbiAgICAgICAgICBpZiAocmVjb3JkSXRlbS5jaGlsZHJlbikge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSB0cmVlUHJvcHNDaGFuZ2UocmVjb3JkSXRlbS5jaGlsZHJlbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAoY2hpbGRyZW4gPyB7XG4gICAgICAgICAgICAuLi5vcHRpb25EaXNhYmxlZCxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIGxhYmVsOiB0ZXh0LFxuICAgICAgICAgICAgdmFsdWU6IHJlY29yZEl0ZW0sXG4gICAgICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgICAgIGRpc2FibGVkOiBvcHRpb25EaXNhYmxlZCxcbiAgICAgICAgICB9IDoge1xuICAgICAgICAgICAgLi4ub3B0aW9uRGlzYWJsZWQsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICBsYWJlbDogdGV4dCxcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmRJdGVtLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IG9wdGlvbkRpc2FibGVkLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cmVlUmVjb3JkcztcbiAgICB9O1xuICAgIGlmIChpc0FycmF5TGlrZShvcHRpb25zKSkge1xuICAgICAgb3B0R3JvdXBzID0gdHJlZVByb3BzQ2hhbmdlKG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIERhdGFTZXQpIHtcbiAgICAgIG9wdEdyb3VwcyA9IHRyZWVQcm9wc0NoYW5nZShvcHRpb25zLnRyZWVEYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0R3JvdXBzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W5b2T5YmN5r+A5rS755qEbWVudWVJdGVtXG4gICAgICog5Lul5Y+KdmFsdWUg5bGV56S65r+A5rS754q25oCB55qE5Yik5patXG4gICAgICog5oyJ6ZKu6IO95aSf5o6n5Yi25LiN5Y+X5YC855qE5b2x5ZONXG4gICAgICogaW5wdXRWYWx1Ze+8mui+k+WFpeahhueahOWAvFxuICAgICAqIGFjdGl2ZVZhbHVl77ya5r+A5rS75YC877yIY2hvb3Nl5ZKM6ZSu55uY5b2x5ZON77yJXG4gICAgICogdGhpcy5wb3B1cDrlvIDlkK/nirbmgIHmnInmv4DmtLvlgLzpgqPkuYjkuLrmv4DmtLvlgLxcbiAgICAgKi9cbiAgICBjb25zdCBnZXRBY3RpdmVWYWx1ZSA9IChpbnB1dFZhbHVlKSA9PiB7XG4gICAgICBsZXQgYWN0aXZlVmFsdWUgPSBbXTtcbiAgICAgIGlmICghaXNFbXB0eShpbnB1dFZhbHVlKSkge1xuICAgICAgICBpZiAoaW5wdXRWYWx1ZSAmJiBhcnJheVNhbWVMaWtlKHRoaXMudHJlZVZhbHVlVG9BcnJheSh0aGlzLmFjdGl2ZVZhbHVlKSwgaW5wdXRWYWx1ZSkgfHwgdGhpcy5hY3RpdmVWYWx1ZS5jaGlsZHJlbikge1xuICAgICAgICAgIGFjdGl2ZVZhbHVlID0gdGhpcy5maW5kUGFyZW50UmVjb2RUcmVlKHRoaXMuYWN0aXZlVmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZlVmFsdWUpIHtcbiAgICAgICAgICBpZiAoaXNBcnJheUxpa2Uob3B0aW9ucykpIHtcbiAgICAgICAgICAgIGFjdGl2ZVZhbHVlID0gdGhpcy5maW5kUGFyZW50UmVjb2RUcmVlKHRoaXMuZmluZEFjdGl2ZVJlY29yZChpbnB1dFZhbHVlLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgaW5zdGFuY2VvZiBEYXRhU2V0KSB7XG4gICAgICAgICAgICBhY3RpdmVWYWx1ZSA9IHRoaXMuZmluZFBhcmVudFJlY29kVHJlZSh0aGlzLmZpbmRBY3RpdmVSZWNvcmQoaW5wdXRWYWx1ZSwgdGhpcy5vcHRpb25zLnRyZWVEYXRhKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdGl2ZVZhbHVlID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlucHV0VmFsdWUpIHtcbiAgICAgICAgYWN0aXZlVmFsdWUgPSB0aGlzLmZpbmRQYXJlbnRSZWNvZFRyZWUodGhpcy5hY3RpdmVWYWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWN0aXZlVmFsdWU7XG4gICAgfTtcbiAgICBpZiAodGhpcy5wb3B1cCAmJiAhaXNFbXB0eSh0aGlzLmFjdGl2ZVZhbHVlKSkge1xuICAgICAgc2VsZWN0ZWRWYWx1ZXMgPSB0aGlzLmZpbmRQYXJlbnRSZWNvZFRyZWUodGhpcy5hY3RpdmVWYWx1ZSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5tdWx0aXBsZSkge1xuICAgICAgc2VsZWN0ZWRWYWx1ZXMgPSBnZXRBY3RpdmVWYWx1ZSh0aGlzLmdldFZhbHVlcygpKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0VmFsdWVzKCkgJiYgdGhpcy5nZXRWYWx1ZXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gdGhpcy5nZXRWYWx1ZXMoKS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBzZWxlY3RlZFZhbHVlcyA9IGdldEFjdGl2ZVZhbHVlKHRoaXMuZ2V0VmFsdWVzKClbaV0pO1xuICAgICAgICBpZiAoIWlzRW1wdHkoc2VsZWN0ZWRWYWx1ZXMpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFpc0VtcHR5KHRoaXMuYWN0aXZlVmFsdWUpKSB7XG4gICAgICBzZWxlY3RlZFZhbHVlcyA9IHRoaXMuZmluZFBhcmVudFJlY29kVHJlZSh0aGlzLmFjdGl2ZVZhbHVlKTtcbiAgICB9XG4gICAgbGV0IGRyb3Bkb3duTWVudVN0eWxlTWVyZ2UgPSBkcm9wZG93bk1lbnVTdHlsZTtcbiAgICBpZiAoKHRoaXMuaXRlbU1lbnVXaWR0aCA+IDApKSB7XG4gICAgICBkcm9wZG93bk1lbnVTdHlsZU1lcmdlID0geyAuLi5kcm9wZG93bk1lbnVTdHlsZSwgd2lkdGg6IHB4VG9SZW0odGhpcy5pdGVtTWVudVdpZHRoKSB9O1xuICAgIH1cbiAgICAvLyDmuLLmn5PmiJDljZXpobnpgInmi6nov5jmmK/lpJrpobnpgInmi6nnu4Tku7bku6Xlj4rnqbrnu4Tku7ZcbiAgICBpZihvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKXtcbiAgICAgIGlmKCF0aGlzLm11bHRpcGxlICYmIG1lbnVNb2RlID09PSBNZW51TW9kZS5zaW5nbGUgKXtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8U2luZ2xlTWVudVxuICAgICAgICAgIHsuLi5tZW51UHJvcHN9XG4gICAgICAgICAgc2luZ2xlTWVudVN0eWxlID0ge3NpbmdsZU1lbnVTdHlsZX1cbiAgICAgICAgICBzaW5nbGVNZW51SXRlbVN0eWxlID0ge3NpbmdsZU1lbnVJdGVtU3R5bGV9XG4gICAgICAgICAgc2luZ2xlUGxlYXNlUmVuZGVyID0ge3NpbmdsZVBsZWFzZVJlbmRlcn1cbiAgICAgICAgICBzaW5nbGVNZW51SXRlbVJlbmRlciA9e3NpbmdsZU1lbnVJdGVtUmVuZGVyfVxuICAgICAgICAgIHByZWZpeENscz17dGhpcy5wcmVmaXhDbHN9XG4gICAgICAgICAgZXhwYW5kVHJpZ2dlcj17ZXhwYW5kVHJpZ2dlcn1cbiAgICAgICAgICBhY3RpdmVWYWx1ZT17dG9KUyhzZWxlY3RlZFZhbHVlcyl9XG4gICAgICAgICAgb3B0aW9ucz17b3B0R3JvdXBzfVxuICAgICAgICAgIGxvY2FsZT17e3BsZWFzZVNlbGVjdDokbCgnQ2FzY2FkZXInLCAncGxlYXNlX3NlbGVjdCcpfX1cbiAgICAgICAgICBvblNlbGVjdD17dGhpcy5oYW5kbGVNZW51Q2xpY2t9XG4gICAgICAgICAgaXNUYWJTZWxlY3RlZD17dGhpcy5pc0NsaWNrVGFifVxuICAgICAgICAgIGRyb3Bkb3duTWVudUNvbHVtblN0eWxlPXtkcm9wZG93bk1lbnVTdHlsZU1lcmdlfVxuICAgICAgICAgIHZpc2libGU9e3RoaXMucG9wdXB9IC8+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxNZW51c1xuICAgICAgICAgIHsuLi5tZW51UHJvcHN9XG4gICAgICAgICAgcHJlZml4Q2xzPXt0aGlzLnByZWZpeENsc31cbiAgICAgICAgICBleHBhbmRUcmlnZ2VyPXtleHBhbmRUcmlnZ2VyfVxuICAgICAgICAgIGFjdGl2ZVZhbHVlPXtzZWxlY3RlZFZhbHVlc31cbiAgICAgICAgICBvcHRpb25zPXtvcHRHcm91cHN9XG4gICAgICAgICAgb25TZWxlY3Q9e3RoaXMuaGFuZGxlTWVudUNsaWNrfVxuICAgICAgICAgIGRyb3Bkb3duTWVudUNvbHVtblN0eWxlPXtkcm9wZG93bk1lbnVTdHlsZU1lcmdlfVxuICAgICAgICAgIHZpc2libGU9e3RoaXMucG9wdXB9XG4gICAgICAgIC8+XG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGtleT1cIm5vX2RhdGFcIj5cbiAgICAgICAge3RoaXMubG9hZGluZyA/ICcgJyA6IHRoaXMuZ2V0Tm90Rm91bmRDb250ZW50KCl9XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICAvLyDpgY3ljoblh7rniLbkurLoioLngrlcbiAgQGNvbXB1dGVkXG4gIGdldCBsb2FkaW5nKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgZmllbGQsIG9wdGlvbnMgfSA9IHRoaXM7XG4gICAgcmV0dXJuIG9wdGlvbnMuc3RhdHVzID09PSBEYXRhU2V0U3RhdHVzLmxvYWRpbmcgfHwgKCEhZmllbGQgJiYgZmllbGQucGVuZGluZy5sZW5ndGggPiAwKTtcbiAgfVxuXG4gIGdldFBvcHVwQ29udGVudCgpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IG1lbnUgPSAoXG4gICAgICA8U3BpbiBrZXk9XCJtZW51XCIgc3Bpbm5pbmc9e3RoaXMubG9hZGluZ30+XG4gICAgICAgIHt0aGlzLmdldE1lbnUoKX1cbiAgICAgIDwvU3Bpbj5cbiAgICApO1xuICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICA8ZGl2IGtleT1cImNoZWNrLWFsbFwiIGNsYXNzTmFtZT17YCR7dGhpcy5wcmVmaXhDbHN9LXNlbGVjdC1hbGwtbm9uZWB9PlxuICAgICAgICAgIDxzcGFuIG9uQ2xpY2s9e3RoaXMuY2hvb3NlQWxsfT57JGwoJ0Nhc2NhZGVyJywgJ3NlbGVjdF9hbGwnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gb25DbGljaz17dGhpcy51bkNob29zZUFsbH0+eyRsKCdDYXNjYWRlcicsICd1bnNlbGVjdF9hbGwnKX08L3NwYW4+XG4gICAgICAgIDwvZGl2PixcbiAgICAgICAgbWVudSxcbiAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBtZW51O1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGdldFBvcHVwU3R5bGVGcm9tQWxpZ24odGFyZ2V0KTogQ1NTUHJvcGVydGllcyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMuZHJvcGRvd25NYXRjaFNlbGVjdFdpZHRoKSB7XG4gICAgICAgIHRoaXMuc2V0SXRlbU1lbnVXaWR0aCh0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1pbldpZHRoOiBweFRvUmVtKHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCksXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGdldFRyaWdnZXJJY29uRm9udCgpIHtcbiAgICByZXR1cm4gJ2Jhc2VsaW5lLWFycm93X2Ryb3BfZG93bic7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQoKSAmJiAhdGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5SSUdIVDpcbiAgICAgICAgICB0aGlzLmhhbmRsZUtleUxlZnRSaWdodE5leHQoZSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5ET1dOOlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93blByZXZOZXh0KGUsIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuTEVGVDpcbiAgICAgICAgICB0aGlzLmhhbmRsZUtleUxlZnRSaWdodE5leHQoZSwgLTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuVVA6XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duUHJldk5leHQoZSwgLTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuRU5EOlxuICAgICAgICBjYXNlIEtleUNvZGUuUEFHRV9ET1dOOlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkZpcnN0TGFzdChlLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLkhPTUU6XG4gICAgICAgIGNhc2UgS2V5Q29kZS5QQUdFX1VQOlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkZpcnN0TGFzdChlLCAtMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5FTlRFUjpcbiAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25FbnRlcihlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLkVTQzpcbiAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25Fc2MoZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5TUEFDRTpcbiAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd25TcGFjZShlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaGFuZGxlS2V5RG93bihlKTtcbiAgfVxuXG4gIC8vIOiOt+WPluW9k+WJjeWIl+esrOS4gOS4quWAvOWSjOacgOWQjueahOWAvFxuICBmaW5kVHJlZURhdGFGaXJzdExhc3Qob3B0aW9ucywgYWN0aXZlVmFsdWUsIGRpcmVjdGlvbikge1xuICAgIGNvbnN0IG5vd0luZGV4TGlzdCA9IGFjdGl2ZVZhbHVlLnBhcmVudCA/IGFjdGl2ZVZhbHVlLnBhcmVudC5jaGlsZHJlbiA6IG9wdGlvbnM7XG4gICAgaWYgKG5vd0luZGV4TGlzdC5sZW5ndGggPiAwICYmIGRpcmVjdGlvbiA+IDApIHtcbiAgICAgIHJldHVybiBub3dJbmRleExpc3Rbbm93SW5kZXhMaXN0Lmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgICBpZiAobm93SW5kZXhMaXN0Lmxlbmd0aCA+IDAgJiYgZGlyZWN0aW9uIDwgMCkge1xuICAgICAgcmV0dXJuIG5vd0luZGV4TGlzdFswXTtcbiAgICB9XG4gICAgcmV0dXJuIGFjdGl2ZVZhbHVlO1xuICB9XG5cbiAgLy8g5oyJ6ZSu56ys5LiA5Liq5ZKM5pyA5ZCO5LiA5Liq55qE5L2N572uXG4gIGhhbmRsZUtleURvd25GaXJzdExhc3QoZSwgZGlyZWN0aW9uOiBudW1iZXIpIHtcbiAgICBzdG9wRXZlbnQoZSk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKHRoaXMub3B0aW9ucykpIHtcbiAgICAgIGlmIChpc0VtcHR5KHRvSlModGhpcy5hY3RpdmVWYWx1ZSkpKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUodGhpcy5vcHRpb25zWzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSB0aGlzLmZpbmRUcmVlRGF0YUZpcnN0TGFzdCh0aGlzLm9wdGlvbnMsIHRoaXMuYWN0aXZlVmFsdWUsIGRpcmVjdGlvbik7XG4gICAgICAgIGlmICghdGhpcy5lZGl0YWJsZSB8fCB0aGlzLnBvcHVwKSB7XG4gICAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZShhY3RpdmVJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zIGluc3RhbmNlb2YgRGF0YVNldCkge1xuICAgICAgaWYgKGlzRW1wdHkodG9KUyh0aGlzLmFjdGl2ZVZhbHVlKSkpIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh0aGlzLm9wdGlvbnMudHJlZURhdGFbMF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuZmluZFRyZWVEYXRhRmlyc3RMYXN0KHRoaXMub3B0aW9ucy50cmVlRGF0YSwgdGhpcy5hY3RpdmVWYWx1ZSwgZGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKCF0aGlzLmVkaXRhYmxlIHx8IHRoaXMucG9wdXApIHtcbiAgICAgICAgICB0aGlzLnNldEFjdGl2ZVZhbHVlKGFjdGl2ZUl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8g5p+l5om+5ZCM57qn5L2N572uXG4gIGZpbmRUcmVlRGF0YVVwRG93bihvcHRpb25zLCB2YWx1ZSwgZGlyZWN0aW9uLCBmbj86IGFueSkge1xuICAgIGNvbnN0IG5vd0luZGV4TGlzdCA9IHZhbHVlLnBhcmVudCA/IHZhbHVlLnBhcmVudC5jaGlsZHJlbiA6IG9wdGlvbnM7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG5vd0luZGV4TGlzdCkpIHtcbiAgICAgIGNvbnN0IG5vd0luZGV4ID0gZm4gIT09IHVuZGVmaW5lZCA/IGZuIDogbm93SW5kZXhMaXN0LmZpbmRJbmRleChlbGUgPT4gZWxlLnZhbHVlID09PSB2YWx1ZSk7XG4gICAgICBjb25zdCBsZW5ndGggPSBub3dJbmRleExpc3QubGVuZ3RoO1xuICAgICAgaWYgKG5vd0luZGV4ICsgZGlyZWN0aW9uID49IGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbm93SW5kZXhMaXN0WzBdO1xuICAgICAgfVxuICAgICAgaWYgKG5vd0luZGV4ICsgZGlyZWN0aW9uIDwgMCkge1xuICAgICAgICByZXR1cm4gbm93SW5kZXhMaXN0W2xlbmd0aCAtIDFdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vd0luZGV4TGlzdFtub3dJbmRleCArIGRpcmVjdGlvbl07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHNhbWVLZXlSZWNvcmRJbmRleChvcHRpb25zOiBSZWNvcmRbXSwgYWN0aXZlVmFsdWU6IFJlY29yZCwgdmFsdWVLZXk6IHN0cmluZykge1xuICAgIGNvbnN0IG5vd0luZGV4TGlzdCA9IGFjdGl2ZVZhbHVlLnBhcmVudCA/IGFjdGl2ZVZhbHVlLnBhcmVudC5jaGlsZHJlbiA6IG9wdGlvbnM7XG4gICAgcmV0dXJuIG5vd0luZGV4TGlzdCEuZmluZEluZGV4KGVsZSA9PiBlbGVbdmFsdWVLZXldID09PSBhY3RpdmVWYWx1ZVt2YWx1ZUtleV0pO1xuICB9XG5cbiAgLy8g5LiK5LiL5oyJ6ZSu5Yik5patXG4gIGhhbmRsZUtleURvd25QcmV2TmV4dChlLCBkaXJlY3Rpb246IG51bWJlcikge1xuICAgIGlmICghdGhpcy5lZGl0YWJsZSkge1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgaWYgKGlzRW1wdHkodG9KUyh0aGlzLmFjdGl2ZVZhbHVlKSkpIHtcbiAgICAgICAgICB0aGlzLnNldEFjdGl2ZVZhbHVlKHRoaXMub3B0aW9uc1swXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh0aGlzLmZpbmRUcmVlRGF0YVVwRG93bih0aGlzLm9wdGlvbnMsIHRoaXMuYWN0aXZlVmFsdWUsIGRpcmVjdGlvbiwgdGhpcy5zYW1lS2V5UmVjb3JkSW5kZXgodGhpcy5vcHRpb25zLCB0aGlzLmFjdGl2ZVZhbHVlLCAndmFsdWUnKSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucyBpbnN0YW5jZW9mIERhdGFTZXQpIHtcbiAgICAgICAgaWYgKGlzRW1wdHkodG9KUyh0aGlzLmFjdGl2ZVZhbHVlKSkpIHtcbiAgICAgICAgICB0aGlzLnNldEFjdGl2ZVZhbHVlKHRoaXMub3B0aW9ucy50cmVlRGF0YVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh0aGlzLmZpbmRUcmVlRGF0YVVwRG93bih0aGlzLm9wdGlvbnMudHJlZURhdGEsIHRoaXMuYWN0aXZlVmFsdWUsIGRpcmVjdGlvbiwgdGhpcy5zYW1lS2V5UmVjb3JkSW5kZXgodGhpcy5vcHRpb25zLnRyZWVEYXRhLCB0aGlzLmFjdGl2ZVZhbHVlLCAna2V5JykpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAoZSA9PT0gS2V5Q29kZS5ET1dOKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIOafpeaJvuebuOmCu+eahOiKgueCuVxuICBmaW5kVHJlZVBhcmVudENoaWRyZW4oX29wdGlvbnMsIGFjdGl2ZVZhbHVlLCBkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID4gMCkge1xuICAgICAgaWYgKGFjdGl2ZVZhbHVlLmNoaWxkcmVuICYmIGFjdGl2ZVZhbHVlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZVZhbHVlLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjdGl2ZVZhbHVlO1xuICAgIH1cbiAgICBpZiAoYWN0aXZlVmFsdWUucGFyZW50KSB7XG4gICAgICByZXR1cm4gYWN0aXZlVmFsdWUucGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gYWN0aXZlVmFsdWU7XG4gIH1cblxuXG4gIGhhbmRsZUtleUxlZnRSaWdodE5leHQoZSwgZGlyZWN0aW9uOiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIGlmIChpc0FycmF5TGlrZSh0aGlzLm9wdGlvbnMpKSB7XG4gICAgICAgIGlmIChpc0VtcHR5KHRvSlModGhpcy5hY3RpdmVWYWx1ZSkpKSB7XG4gICAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh0aGlzLm9wdGlvbnNbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUodGhpcy5maW5kVHJlZVBhcmVudENoaWRyZW4odGhpcy5vcHRpb25zLCB0aGlzLmFjdGl2ZVZhbHVlLCBkaXJlY3Rpb24pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMgaW5zdGFuY2VvZiBEYXRhU2V0KSB7XG4gICAgICAgIGlmIChpc0VtcHR5KHRvSlModGhpcy5hY3RpdmVWYWx1ZSkpKSB7XG4gICAgICAgICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh0aGlzLm9wdGlvbnMudHJlZURhdGFbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUodGhpcy5maW5kVHJlZVBhcmVudENoaWRyZW4odGhpcy5vcHRpb25zLnRyZWVEYXRhLCB0aGlzLmFjdGl2ZVZhbHVlLCBkaXJlY3Rpb24pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0gZWxzZSBpZiAoZSA9PT0gS2V5Q29kZS5ET1dOKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25FbnRlcihlKSB7XG4gICAgaWYgKHRoaXMucG9wdXAgJiYgIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5hY3RpdmVWYWx1ZTtcbiAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XG4gICAgICAgIHRoaXMudW5DaG9vc2UodmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZS5jaGlsZHJlbikge1xuICAgICAgICB0aGlzLnNldFBvcHVwKHRydWUpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlY29yZCAmJiAhdmFsdWUuZ2V0KGRpc2FibGVkRmllbGQpKSB7XG4gICAgICAgIHRoaXMuY2hvb3NlKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXZhbHVlLmRpc2FibGVkICYmIGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHRoaXMuY2hvb3NlKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgaGFuZGxlS2V5RG93bkVzYyhlKSB7XG4gICAgaWYgKHRoaXMucG9wdXApIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVLZXlEb3duU3BhY2UoZSkge1xuICAgIGlmICghdGhpcy5lZGl0YWJsZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKCF0aGlzLnBvcHVwKSB7XG4gICAgICAgIHRoaXMuZXhwYW5kKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJsdXIoZSkge1xuICAgIGlmICghZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgc3VwZXIuaGFuZGxlQmx1cihlKTtcbiAgICAgIHRoaXMucmVzZXRGaWx0ZXIoKTtcbiAgICB9XG4gIH1cblxuICBleHBhbmQoKSB7XG4gICAgY29uc3QgeyBvcHRpb25zIH0gPSB0aGlzO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICBzdXBlci5leHBhbmQoKTtcbiAgICB9XG4gIH1cblxuICBzeW5jVmFsdWVPbkJsdXIodmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMgaW5zdGFuY2VvZiBEYXRhU2V0KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuZmluZEJ5VGV4dFdpdGhWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICAgICAgdGhpcy5jaG9vc2UocmVjb3JkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5maW5kQnlUZXh0V2l0aFZhbHVlKHZhbHVlKTtcbiAgICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICAgIHRoaXMuY2hvb3NlKHJlY29yZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLm11bHRpcGxlKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMuZW1wdHlWYWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZmluZEJ5VGV4dFdpdGhWYWx1ZSh0ZXh0KTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodGV4dCkge1xuICAgICAgY29uc3QgZm91bmQgPSB0aGlzLmZpbmRCeVRleHQodGV4dCk7XG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRCeVRleHQodGV4dCk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB0ZXh0RmllbGQgfSA9IHRoaXM7XG4gICAgY29uc3QgZmluZFRyZWVJdGVtID0gKG9wdGlvbnMsIHZhbHVlSXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGxldCBzYW1lSXRlbVRyZWVOb2RlO1xuICAgICAgaWYgKHZhbHVlSXRlbS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNhbWVJdGVtVHJlZU5vZGUgPSBvcHRpb25zLmZpbmQoZWxlID0+IHtcbiAgICAgICAgICByZXR1cm4gaXNTYW1lTGlrZSh0aGlzLmdldFJlY29yZE9yT2JqVmFsdWUoZWxlLCB0ZXh0RmllbGQpLCBpc1BsYWluT2JqZWN0KHZhbHVlSXRlbVtpbmRleF0pID8gT2JqZWN0Q2hhaW5WYWx1ZS5nZXQodmFsdWVJdGVtW2luZGV4XSwgdGV4dEZpZWxkKSA6IHZhbHVlSXRlbVtpbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNhbWVJdGVtVHJlZU5vZGUpIHtcbiAgICAgICAgICBpZiAoc2FtZUl0ZW1UcmVlTm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmRUcmVlSXRlbShzYW1lSXRlbVRyZWVOb2RlLmNoaWxkcmVuLCB2YWx1ZUl0ZW0sICsraW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2FtZUl0ZW1UcmVlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgdGV4dEFycmF5ID0gdGV4dC5zcGxpdCgnLycpO1xuICAgIGlmICh0ZXh0QXJyYXkgJiYgdGV4dEFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMgaW5zdGFuY2VvZiBEYXRhU2V0KSB7XG4gICAgICAgIHJldHVybiBmaW5kVHJlZUl0ZW0odGhpcy5vcHRpb25zLnRyZWVEYXRhLCB0ZXh0QXJyYXksIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbmRUcmVlSXRlbSh0aGlzLm9wdGlvbnMsIHRleHRBcnJheSwgMCk7XG4gICAgfVxuICB9XG5cblxuICBmaW5kQnlWYWx1ZSh2YWx1ZSk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB2YWx1ZUZpZWxkIH0gPSB0aGlzO1xuICAgIGNvbnN0IGZpbmRUcmVlSXRlbSA9IChvcHRpb25zLCB2YWx1ZUl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBsZXQgc2FtZUl0ZW1UcmVlTm9kZTtcbiAgICAgIGlmICh2YWx1ZUl0ZW0ubGVuZ3RoID4gMCkge1xuICAgICAgICBzYW1lSXRlbVRyZWVOb2RlID0gb3B0aW9ucy5maW5kKGVsZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGlzU2FtZUxpa2UodGhpcy5nZXRSZWNvcmRPck9ialZhbHVlKGVsZSwgdmFsdWVGaWVsZCksIGlzUGxhaW5PYmplY3QodmFsdWVJdGVtW2luZGV4XSkgPyBPYmplY3RDaGFpblZhbHVlLmdldCh2YWx1ZUl0ZW1baW5kZXhdLCB2YWx1ZUZpZWxkKSA6IHZhbHVlSXRlbVtpbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNhbWVJdGVtVHJlZU5vZGUpIHtcbiAgICAgICAgICBpZiAoc2FtZUl0ZW1UcmVlTm9kZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmRUcmVlSXRlbShzYW1lSXRlbVRyZWVOb2RlLmNoaWxkcmVuLCB2YWx1ZUl0ZW0sICsraW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2FtZUl0ZW1UcmVlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdmFsdWUgPSBnZXRTaW1wbGVWYWx1ZSh2YWx1ZSwgdmFsdWVGaWVsZCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucyBpbnN0YW5jZW9mIERhdGFTZXQpIHtcbiAgICAgIHJldHVybiBmaW5kVHJlZUl0ZW0odGhpcy5vcHRpb25zLnRyZWVEYXRhLCB2YWx1ZSwgMCk7XG4gICAgfVxuICAgIHJldHVybiBmaW5kVHJlZUl0ZW0odGhpcy5vcHRpb25zLCB2YWx1ZSwgMCk7XG4gIH1cblxuXG4gIGlzU2VsZWN0ZWQocmVjb3JkOiBSZWNvcmQpIHtcbiAgICBjb25zdCB7IHZhbHVlRmllbGQgfSA9IHRoaXM7XG4gICAgLy8g5aSa5YC85aSE55CGXG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcygpLnNvbWUodmFsdWUgPT4ge1xuICAgICAgICBjb25zdCBzaW1wbGVWYWx1ZSA9IGdldFNpbXBsZVZhbHVlKHZhbHVlLCB2YWx1ZUZpZWxkKTtcbiAgICAgICAgcmV0dXJuIGFycmF5U2FtZUxpa2UodGhpcy50cmVlVmFsdWVUb0FycmF5KHJlY29yZCksIHRvSlMoc2ltcGxlVmFsdWUpKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNpbXBsZVZhbHVlID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgICByZXR1cm4gYXJyYXlTYW1lTGlrZSh0aGlzLnRyZWVWYWx1ZVRvQXJyYXkocmVjb3JkKSwgc2ltcGxlVmFsdWUpO1xuICB9XG5cbiAgZ2VuZXJhdGVDb21ib09wdGlvbih2YWx1ZTogc3RyaW5nIHwgYW55W10sIGNhbGxiYWNrPzogKHRleHQ6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICAgIGNvbnN0IHsgdGV4dEZpZWxkIH0gPSB0aGlzO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5mb3JFYWNoKHYgPT4gIWlzTmlsKHYpICYmIHRoaXMuZ2VuZXJhdGVDb21ib09wdGlvbih2KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZCA9IHRoaXMuZmluZEJ5VGV4dCh2YWx1ZSkgfHwgdGhpcy5maW5kQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBmb3VuZC5nZXQodGV4dEZpZWxkKTtcbiAgICAgICAgICBpZiAodGV4dCAhPT0gdmFsdWUgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgaGFuZGxlUG9wdXBBbmltYXRlQXBwZWFyKCkge1xuICB9XG5cbiAgZ2V0VmFsdWVLZXkodikge1xuICAgIGlmIChpc0FycmF5TGlrZSh2KSkge1xuICAgICAgcmV0dXJuIHYubWFwKHRoaXMuZ2V0VmFsdWVLZXksIHRoaXMpLmpvaW4oJywnKTtcbiAgICB9XG4gICAgY29uc3QgYXV0b1R5cGUgPSB0aGlzLmdldFByb3AoJ3R5cGUnKSA9PT0gRmllbGRUeXBlLmF1dG87XG4gICAgY29uc3QgdmFsdWUgPSBnZXRTaW1wbGVWYWx1ZSh2LCB0aGlzLnZhbHVlRmllbGQpO1xuICAgIHJldHVybiBhdXRvVHlwZSAmJiAhaXNOaWwodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6IHZhbHVlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVBvcHVwQW5pbWF0ZUVuZChfa2V5LCBfZXhpc3RzKSB7XG4gIH1cblxuICAvLyDop6blj5HkuIvmi4nmoYbnmoTngrnlh7vkuovku7ZcbiAgQGF1dG9iaW5kXG4gIGhhbmRsZU1lbnVDbGljayh0YXJnZXRPcHRpb24sIF9tZW51SW5kZXgsIGlzQ2xpY2tUYWIpIHtcbiAgICBpZiAoIXRhcmdldE9wdGlvbiB8fCB0YXJnZXRPcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQodGFyZ2V0T3B0aW9uLnZhbHVlKSB8fCBpc0NsaWNrVGFiKSB7XG4gICAgICBpZiAodGFyZ2V0T3B0aW9uLmNoaWxkcmVuKSB7XG4gICAgICAgIHRoaXMuc2V0UG9wdXAodHJ1ZSk7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUodGFyZ2V0T3B0aW9uLnZhbHVlKTtcbiAgICAgICAgdGhpcy5zZXRJc0NsaWNrVGFiKGlzQ2xpY2tUYWIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoIWlzQ2xpY2tUYWIpe1xuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUodGFyZ2V0T3B0aW9uLnZhbHVlKTtcbiAgICAgICAgICB0aGlzLmNob29zZSh0YXJnZXRPcHRpb24udmFsdWUpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLnNldFBvcHVwKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0SXNDbGlja1RhYihpc0NsaWNrVGFiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRhY3RpdmVFbXB0eSgpXG4gICAgICB0aGlzLnVuQ2hvb3NlKHRhcmdldE9wdGlvbi52YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgc2V0YWN0aXZlRW1wdHkoKXtcbiAgICBpZih0aGlzLm11bHRpcGxlKXtcbiAgICAgIHRoaXMuc2V0QWN0aXZlVmFsdWUoW10pXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNldEFjdGl2ZVZhbHVlKHt9KVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU9wdGlvblNlbGVjdChyZWNvcmQ6IFJlY29yZCkge1xuICAgIHRoaXMucHJlcGFyZVNldFZhbHVlKHRoaXMucHJvY2Vzc1JlY29yZFRvT2JqZWN0KHJlY29yZCkpO1xuICB9XG5cbiAgaGFuZGxlT3B0aW9uVW5TZWxlY3QocmVjb3JkOiBSZWNvcmQpIHtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMudHJlZVZhbHVlVG9BcnJheShyZWNvcmQpO1xuICAgIHRoaXMucmVtb3ZlVmFsdWUobmV3VmFsdWUsIC0xKTtcbiAgfVxuXG4gIC8vIOenu+mZpOaJgOmAieWAvFxuICByZW1vdmVWYWx1ZXModmFsdWVzOiBhbnlbXSwgaW5kZXg6IG51bWJlciA9IDApIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gICAgICBpZiAodGhpcy5nZXRWYWx1ZUtleShvbGRWYWx1ZXMpID09PSB0aGlzLmdldFZhbHVlS2V5KHZhbHVlc1swXSkpIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgIHRoaXMuYWZ0ZXJSZW1vdmVWYWx1ZSh2YWx1ZXNbMF0sIDEpO1xuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoW10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLnJlbW92ZVZhbHVlcyh2YWx1ZXMsIGluZGV4KTtcbiAgICB0aGlzLnNldEFjdGl2ZVZhbHVlKHt9KTtcbiAgICB0aGlzLmNvbGxhcHNlKCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldFRleHQodGV4dD86IHN0cmluZyk6IHZvaWQge1xuICAgIHN1cGVyLnNldFRleHQodGV4dCk7XG4gIH1cblxuXG4gIEBhdXRvYmluZFxuICBAYWN0aW9uXG4gIGhhbmRsZUNoYW5nZShlKSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gZS50YXJnZXQ7XG4gICAgdGhpcy5zZXRUZXh0KHZhbHVlKTtcbiAgICBpZiAodGhpcy5vYnNlcnZhYmxlUHJvcHMuY29tYm8pIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVDb21ib09wdGlvbih2YWx1ZSwgdGV4dCA9PiB0aGlzLnNldFRleHQodGV4dCkpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucG9wdXApIHtcbiAgICAgIHRoaXMuZXhwYW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc1JlY29yZFRvT2JqZWN0KHJlY29yZDogUmVjb3JkIHwgUHJvY2Vzc09wdGlvbikge1xuICAgIGNvbnN0IHsgcHJpbWl0aXZlIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQgaW5zdGFuY2VvZiBSZWNvcmQgJiYgcmVjb3JkLmRhdGFTZXQhLmdldEZyb21UcmVlKDApKSB7XG4gICAgICByZXR1cm4gcHJpbWl0aXZlID8gdGhpcy50cmVlVmFsdWVUb0FycmF5KHJlY29yZCkgOiB0aGlzLnRyZWVUb0FycmF5KHJlY29yZCk7XG4gICAgfVxuICAgIGlmIChpc09iamVjdChyZWNvcmQpKSB7XG4gICAgICByZXR1cm4gcHJpbWl0aXZlID8gdGhpcy50cmVlVmFsdWVUb0FycmF5KHJlY29yZCkgOiB0aGlzLnRyZWVUb0FycmF5KHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOi/lOWbnnRyZWUg55qE5YC855qE5YiX6KGo5pa55rOVXG4gICAqIEBwYXJhbSByZWNvcmRcbiAgICogQHBhcmFtIGFsbEFycmF5XG4gICAqL1xuICB0cmVlVmFsdWVUb0FycmF5KHJlY29yZDogUmVjb3JkIHwgUHJvY2Vzc09wdGlvbiwgYWxsQXJyYXk/OiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IHsgdmFsdWVGaWVsZCB9ID0gdGhpcztcbiAgICBpZiAoIWFsbEFycmF5KSB7XG4gICAgICBhbGxBcnJheSA9IFtdO1xuICAgIH1cbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICBhbGxBcnJheSA9IFt0aGlzLmdldFJlY29yZE9yT2JqVmFsdWUocmVjb3JkLCB2YWx1ZUZpZWxkKSwgLi4uYWxsQXJyYXldO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJlZVZhbHVlVG9BcnJheShyZWNvcmQucGFyZW50LCBhbGxBcnJheSk7XG4gICAgfVxuICAgIHJldHVybiBhbGxBcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiDov5Tlm550cmVlIOeahOWAvOeahOWIl+ihqOaWueazlVxuICAgKiBAcGFyYW0gcmVjb3JkXG4gICAqIEBwYXJhbSBhbGxBcnJheVxuICAgKi9cbiAgdHJlZVRleHRUb0FycmF5KHJlY29yZDogUmVjb3JkLCBhbGxBcnJheT86IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgeyB0ZXh0RmllbGQgfSA9IHRoaXM7XG4gICAgaWYgKCFhbGxBcnJheSkge1xuICAgICAgYWxsQXJyYXkgPSBbXTtcbiAgICB9XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgYWxsQXJyYXkgPSBbdGhpcy5nZXRSZWNvcmRPck9ialZhbHVlKHJlY29yZCwgdGV4dEZpZWxkKSwgLi4uYWxsQXJyYXldO1xuICAgIH1cbiAgICBpZiAocmVjb3JkLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJlZVRleHRUb0FycmF5KHJlY29yZC5wYXJlbnQsIGFsbEFycmF5KTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbEFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIOi/lOWbnnRyZWUg55qE5YC855qE5YiX6KGo5pa55rOVXG4gICAqIEBwYXJhbSByZWNvcmRcbiAgICogQHBhcmFtIGFsbEFycmF5XG4gICAqL1xuICB0cmVlVG9BcnJheShyZWNvcmQ6IFJlY29yZCB8IFByb2Nlc3NPcHRpb24sIGFsbEFycmF5PzogUHJvY2Vzc09wdGlvbltdIHwgUmVjb3JkW10pIHtcbiAgICBpZiAoIWFsbEFycmF5KSB7XG4gICAgICBhbGxBcnJheSA9IFtdO1xuICAgIH1cbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICBpZiAocmVjb3JkIGluc3RhbmNlb2YgUmVjb3JkKSB7XG4gICAgICAgIGFsbEFycmF5ID0gW3JlY29yZC50b0RhdGEoKSwgLi4uYWxsQXJyYXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxsQXJyYXkgPSBbdGhpcy5yZW1vdmVPYmpQYXJlbnRDaGlsZChyZWNvcmQpLCAuLi5hbGxBcnJheV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZWNvcmQucGFyZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy50cmVlVG9BcnJheShyZWNvcmQucGFyZW50LCBhbGxBcnJheSk7XG4gICAgfVxuICAgIHJldHVybiBhbGxBcnJheTtcbiAgfVxuXG4gIHJlbW92ZU9ialBhcmVudENoaWxkKG9iajogYW55KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3Qob2JqKSkge1xuICAgICAgY29uc3QgY2xvbmVPYmogPSBjbG9uZURlZXAodG9KUyhvYmopKTtcbiAgICAgIGRlbGV0ZSBjbG9uZU9iai5wYXJlbnQ7XG4gICAgICBkZWxldGUgY2xvbmVPYmouY2hpbGRyZW47XG4gICAgICByZXR1cm4gY2xvbmVPYmo7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICBwcm9jZXNzT2JqZWN0VmFsdWUodmFsdWUsIHRleHRGaWVsZCkge1xuICAgIGlmICghaXNOaWwodmFsdWUpKSB7XG4gICAgICBjb25zdCBmb3VuZCA9IHRoaXMuZmluZEJ5VmFsdWUodmFsdWUpO1xuICAgICAgaWYgKGZvdW5kICYmIGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmVlVGV4dFRvQXJyYXkoZm91bmQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBPYmplY3RDaGFpblZhbHVlLmdldCh2YWx1ZSwgdGV4dEZpZWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcm9jZXNzTG9va3VwVmFsdWUodmFsdWUpIHtcbiAgICBjb25zdCB7IGZpZWxkLCB0ZXh0RmllbGQsIHByaW1pdGl2ZSB9ID0gdGhpcztcbiAgICBjb25zdCBwcm9jZXNzdmFsdWUgPSB0aGlzLnByb2Nlc3NPYmplY3RWYWx1ZSh2YWx1ZSwgdGV4dEZpZWxkKTtcbiAgICBpZiAoaXNBcnJheUxpa2UocHJvY2Vzc3ZhbHVlKSkge1xuICAgICAgcmV0dXJuIHByb2Nlc3N2YWx1ZS5qb2luKCcvJyk7XG4gICAgfVxuICAgIGlmIChwcmltaXRpdmUgJiYgZmllbGQpIHtcbiAgICAgIHJldHVybiBzdXBlci5wcm9jZXNzVmFsdWUoZmllbGQuZ2V0VGV4dCh2YWx1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIOWkhOeQhnZhbHVlXG4gIHByb2Nlc3NWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMucHJvY2Vzc0xvb2t1cFZhbHVlKHZhbHVlKTtcbiAgICBpZiAoaXNFbXB0eVV0aWwodGV4dCkpIHtcbiAgICAgIGlmIChpc1BsYWluT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0Q2hhaW5WYWx1ZS5nZXQodmFsdWUsIHRoaXMudmFsdWVGaWVsZCkgfHwgJyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VwZXIucHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICB0b1ZhbHVlU3RyaW5nKHZhbHVlOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGlmIChpc0FycmF5TGlrZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5qb2luKCcvJyk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zZXRUZXh0KHVuZGVmaW5lZCk7XG4gICAgdGhpcy5zZXRBY3RpdmVWYWx1ZSh7fSk7XG4gICAgc3VwZXIuY2xlYXIoKTtcbiAgfVxuXG4gIGFkZFZhbHVlKC4uLnZhbHVlcykge1xuICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICBjb25zdCBvbGRWYWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgICAgaWYgKHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWVzSlMgPSBvbGRWYWx1ZXMubWFwKGl0ZW0gPT4gdG9KUyhpdGVtKSk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUoWy4uLm9sZFZhbHVlc0pTLCAuLi52YWx1ZXNdKTtcbiAgICAgIH0gZWxzZSBpZiAoIW9sZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLmVtcHR5VmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHZhbHVlcy5wb3AoKSk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRGaWx0ZXIoKSB7XG4gICAgdGhpcy5zZXRUZXh0KHVuZGVmaW5lZCk7XG4gICAgdGhpcy5mb3JjZVBvcHVwQWxpZ24oKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMucmVzZXRGaWx0ZXIoKTtcbiAgfVxuXG4gIHVuQ2hvb3NlKHJlY29yZD86IFJlY29yZCB8IG51bGwpIHtcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICB0aGlzLmhhbmRsZU9wdGlvblVuU2VsZWN0KHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgY2hvb3NlKHJlY29yZD86IFJlY29yZCB8IG51bGwpIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICB9XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgdGhpcy5oYW5kbGVPcHRpb25TZWxlY3QocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuXG4gIEBhdXRvYmluZFxuICBjaG9vc2VBbGwoKSB7XG4gICAgY29uc3QgY2hvb3NlQWxsID0gW107XG4gICAgaWYgKGlzQXJyYXlMaWtlKHRoaXMub3B0aW9ucykpIHtcbiAgICAgIGNvbnN0IGZpbmRMZWFmSXRlbSA9IChvcHRpb24pID0+IHtcbiAgICAgICAgb3B0aW9uLmZvckVhY2goKGl0ZW06IENhc2NhZGVyT3B0aW9uVHlwZSkgPT4ge1xuICAgICAgICAgIGlmIChpc0VtcHR5KGl0ZW0uY2hpbGRyZW4pICYmICFpdGVtLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjaG9vc2VBbGwucHVzaCh0aGlzLnByb2Nlc3NSZWNvcmRUb09iamVjdChpdGVtKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbmRMZWFmSXRlbShpdGVtLmNoaWxkcmVuKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGZpbmRMZWFmSXRlbSh0aGlzLm9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zIGluc3RhbmNlb2YgRGF0YVNldCkge1xuICAgICAgdGhpcy5vcHRpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGlmIChpc0VtcHR5KGl0ZW0uY2hpbGRyZW4pICYmICFpdGVtLmdldChkaXNhYmxlZEZpZWxkKSkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBjaG9vc2VBbGwucHVzaCh0aGlzLnByb2Nlc3NSZWNvcmRUb09iamVjdChpdGVtKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLnNldFZhbHVlKGNob29zZUFsbCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgdW5DaG9vc2VBbGwoKSB7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZVBvcHVwSGlkZGVuQ2hhbmdlKGhpZGRlbjogYm9vbGVhbikge1xuICAgIHRoaXMuc2V0SXNDbGlja1RhYihmYWxzZSk7XG4gICAgaWYgKCFoaWRkZW4pIHtcbiAgICAgIHRoaXMuZm9yY2VQb3B1cEFsaWduKCk7XG4gICAgfVxuICAgIHN1cGVyLmhhbmRsZVBvcHVwSGlkZGVuQ2hhbmdlKGhpZGRlbik7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzU2VsZWN0ZWREYXRhKCkge1xuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gICAgY29uc3QgeyBmaWVsZCB9ID0gdGhpcztcbiAgICBpZiAoZmllbGQpIHtcbiAgICAgIGF3YWl0IGZpZWxkLnJlYWR5KCk7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIG9ic2VydmFibGVQcm9wczogeyBjb21ibyB9LFxuICAgIH0gPSB0aGlzO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IHZhbHVlcy5maWx0ZXIodmFsdWUgPT4ge1xuICAgICAgICBjb25zdCByZWNvcmQgPSB0aGlzLmZpbmRCeVZhbHVlKHZhbHVlKTtcbiAgICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMudGV4dCAmJiBjb21ibykge1xuICAgICAgICB0aGlzLmdlbmVyYXRlQ29tYm9PcHRpb24odGhpcy50ZXh0KTtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgZmllbGQgJiZcbiAgICAgICAgZmllbGQuZ2V0KCdjYXNjYWRlTWFwJykgJiZcbiAgICAgICAgIWlzRXF1YWwobmV3VmFsdWVzLCB2YWx1ZXMpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh0aGlzLm11bHRpcGxlID8gbmV3VmFsdWVzIDogbmV3VmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ic2VydmVyQ2FzY2FkZXIgZXh0ZW5kcyBDYXNjYWRlcjxDYXNjYWRlclByb3BzPiB7XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSBDYXNjYWRlci5kZWZhdWx0UHJvcHM7XG59XG4iXSwidmVyc2lvbiI6M30=