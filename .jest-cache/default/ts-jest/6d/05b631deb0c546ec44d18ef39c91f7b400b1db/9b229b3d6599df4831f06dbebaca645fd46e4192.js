import { __decorate } from "tslib";
import React, { Children, createElement, isValidElement, cloneElement, } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { action as mobxAction, computed, isArrayLike, observable, runInAction } from 'mobx';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import Responsive from 'choerodon-ui/lib/responsive/Responsive';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import axios from '../axios';
import autobind from '../_util/autobind';
import { getFieldsById } from '../field/FormField';
import FormContext from './FormContext';
import DataSetComponent from '../data-set/DataSetComponent';
import { defaultColumns, defaultLabelWidth, FIELD_SUFFIX, getProperty, normalizeLabelWidth, defaultExcludeUseColonTag, findFirstInvalidElement, } from './utils';
import FormVirtualGroup from './FormVirtualGroup';
/**
 * 表单name生成器
 */
const NameGen = (function* (start) {
    while (true) {
        start += 1;
        yield `form-${start}`;
    }
})(0);
const labelWidthPropTypes = PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
]);
const labelAlignPropTypes = PropTypes.oneOf(["left" /* left */, "center" /* center */, "right" /* right */]);
const labelLayoutPropTypes = PropTypes.oneOf([
    "horizontal" /* horizontal */,
    "vertical" /* vertical */,
    "placeholder" /* placeholder */,
    "float" /* float */,
]);
let Form = class Form extends DataSetComponent {
    constructor(props, context) {
        super(props, context);
        this.fields = [];
        this.name = NameGen.next().value;
        runInAction(() => {
            this.responsiveItems = [];
        });
    }
    get axios() {
        return this.observableProps.axios || getConfig('axios') || axios;
    }
    get dataSet() {
        const { record } = this;
        if (record) {
            return record.dataSet;
        }
        return this.observableProps.dataSet;
    }
    get record() {
        const { record, dataSet, dataIndex } = this.observableProps;
        if (record) {
            return record;
        }
        if (dataSet) {
            if (isNumber(dataIndex)) {
                return dataSet.get(dataIndex);
            }
            return dataSet.current;
        }
        return undefined;
    }
    get dataIndex() {
        return this.observableProps.dataIndex;
    }
    get useColon() {
        const { useColon } = this.observableProps;
        if (useColon !== undefined) {
            return useColon;
        }
        const configUseColon = getConfig('useColon');
        if (configUseColon !== undefined) {
            return configUseColon;
        }
        return false;
    }
    get excludeUseColonTagList() {
        const { excludeUseColonTagList } = this.observableProps;
        if (excludeUseColonTagList !== undefined) {
            return excludeUseColonTagList;
        }
        const configExcludeUseColonTagList = getConfig('excludeUseColonTagList');
        if (configExcludeUseColonTagList !== undefined) {
            return configExcludeUseColonTagList;
        }
        return defaultExcludeUseColonTag;
    }
    get columns() {
        const { columns } = this.observableProps;
        if (isNumber(columns)) {
            return columns;
        }
        if (columns) {
            const responsiveColumns = this.responsiveItems[0];
            if (responsiveColumns) {
                return responsiveColumns;
            }
        }
        return defaultColumns;
    }
    get labelWidth() {
        const { labelWidth } = this.observableProps;
        if (isNumber(labelWidth) || isArrayLike(labelWidth)) {
            return labelWidth;
        }
        if (labelWidth) {
            const responsiveWidth = this.responsiveItems[1];
            if (responsiveWidth !== undefined) {
                return responsiveWidth;
            }
        }
        return defaultLabelWidth;
    }
    get labelAlign() {
        const { labelAlign } = this.observableProps;
        const defaultLabelAlign = this.labelLayout === "vertical" /* vertical */ ? "left" /* left */ : "right" /* right */;
        if (isString(labelAlign)) {
            return labelAlign;
        }
        if (labelAlign) {
            const responsiveAlign = this.responsiveItems[2];
            if (responsiveAlign) {
                return responsiveAlign;
            }
        }
        return defaultLabelAlign;
    }
    get labelLayout() {
        const defaultLabelLayout = getConfig('labelLayout') || "horizontal" /* horizontal */;
        const { labelLayout } = this.observableProps;
        if (isString(labelLayout)) {
            return labelLayout;
        }
        if (labelLayout) {
            const responsiveLabelLayout = this.responsiveItems[3];
            if (responsiveLabelLayout) {
                return responsiveLabelLayout;
            }
        }
        return defaultLabelLayout;
    }
    get pristine() {
        return this.observableProps.pristine;
    }
    isDisabled() {
        return super.isDisabled() || this.context.disabled;
    }
    getObservableProps(props, context) {
        return {
            dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
            record: 'record' in props ? props.record : context.record,
            dataIndex: defaultTo(props.dataIndex, context.dataIndex),
            labelLayout: 'labelLayout' in props ? props.labelLayout : context.labelLayout,
            labelAlign: 'labelAlign' in props ? props.labelAlign : context.labelAlign,
            labelWidth: defaultTo(props.labelWidth, context.labelWidth),
            pristine: 'pristine' in props ? props.pristine : context.pristine,
            columns: props.columns,
            useColon: props.useColon,
            excludeUseColonTagList: props.excludeUseColonTagList,
        };
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'record',
            'dataIndex',
            'onSuccess',
            'onError',
            'processParams',
            'labelWidth',
            'labelAlign',
            'labelLayout',
            'columns',
            'pristine',
            'axios',
            'useColon',
            'excludeUseColonTagList',
        ]);
        otherProps.onSubmit = this.handleSubmit;
        otherProps.onReset = this.handleReset;
        if (!otherProps.name) {
            otherProps.name = this.name;
        }
        return otherProps;
    }
    getHeader() {
        const { props: { header }, prefixCls, } = this;
        if (header) {
            return (React.createElement("div", { key: "form-header", className: `${prefixCls}-header` }, header));
        }
    }
    getClassName(...props) {
        const { prefixCls, labelLayout } = this;
        return super.getClassName({
            ...props,
            [`${prefixCls}-float-label`]: labelLayout === "float" /* float */,
        });
    }
    componentWillMount() {
        this.processDataSetListener(true);
    }
    componentWillUnmount() {
        this.processDataSetListener(false);
    }
    processDataSetListener(flag) {
        const { dataSet } = this;
        if (dataSet) {
            const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
            handler.call(dataSet, 'validate', this.handleDataSetValidate);
        }
    }
    // 处理校验失败定位
    async handleDataSetValidate({ result }) {
        if (!await result) {
            const item = this.element ? findFirstInvalidElement(this.element) : null;
            if (item) {
                item.focus();
            }
        }
    }
    rasterizedChildren() {
        const { dataSet, record, columns, labelLayout, labelAlign, useColon, excludeUseColonTagList, props: { children }, } = this;
        const prefixCls = getProPrefixCls(FIELD_SUFFIX);
        const labelWidth = normalizeLabelWidth(this.labelWidth, columns);
        const rows = [];
        let cols = [];
        let rowIndex = 0;
        let colIndex = 0;
        const matrix = [[]];
        let noLabel = true;
        const childrenArray = [];
        Children.forEach(children, child => {
            if (isValidElement(child)) {
                const setChild = (arr, outChild, groupProps = {}) => {
                    if (noLabel === true &&
                        labelLayout === "horizontal" /* horizontal */ &&
                        getProperty(outChild.props, 'label', dataSet, record)) {
                        noLabel = false;
                    }
                    if (!outChild?.type) {
                        return;
                    }
                    if (outChild?.type && outChild.type.displayName === 'FormVirtualGroup') {
                        if (!outChild.props.children) {
                            return;
                        }
                        if (isArray(outChild.props.children)) {
                            outChild.props.children.forEach((c) => {
                                setChild(arr, c, omit(outChild.props, ['children']));
                            });
                        }
                        else if (outChild?.type && outChild.type.displayName === 'FormVirtualGroup') {
                            setChild(arr, outChild.props.children, omit(outChild.props, ['children']));
                        }
                        else {
                            arr.push(cloneElement(outChild.props.children, {
                                ...groupProps,
                                ...outChild.props.children.props,
                            }));
                        }
                    }
                    else {
                        arr.push(cloneElement(outChild, {
                            ...groupProps,
                            ...outChild.props,
                        }));
                    }
                };
                setChild(childrenArray, child);
            }
        });
        function completeLine() {
            if (cols.length) {
                rows.push((React.createElement("tr", { key: `row-${rowIndex}` }, cols)));
                cols = [];
            }
            rowIndex++;
            colIndex = 0;
            matrix[rowIndex] = matrix[rowIndex] || [];
        }
        for (let index = 0, len = childrenArray.length; index < len;) {
            const { props, key, type } = childrenArray[index];
            let TagName = type;
            if (isFunction(type)) {
                TagName = type.displayName;
            }
            const label = getProperty(props, 'label', dataSet, record);
            const fieldLabelWidth = getProperty(props, 'labelWidth', dataSet, record);
            const required = getProperty(props, 'required', dataSet, record);
            const readOnly = getProperty(props, 'readOnly', dataSet, record);
            const { rowSpan = 1, colSpan = 1, newLine, className, placeholder, ...otherProps } = props;
            let newColSpan = colSpan;
            const currentRow = matrix[rowIndex];
            if (newLine) {
                if (colIndex !== 0) {
                    completeLine();
                    continue;
                }
            }
            while (currentRow[colIndex]) {
                colIndex++;
            }
            if (colIndex >= columns) {
                completeLine();
                continue;
            }
            if (newColSpan + colIndex > columns) {
                newColSpan = columns - colIndex;
            }
            for (let i = colIndex, k = colIndex + newColSpan; i < k; i++) {
                if (currentRow[i]) {
                    newColSpan = i - colIndex;
                    break;
                }
            }
            for (let i = rowIndex; i < rowSpan + rowIndex; i++) {
                for (let j = colIndex, k = newColSpan + colIndex; j < k; j++) {
                    if (!matrix[i]) {
                        matrix[i] = [];
                    }
                    matrix[i][j] = true;
                }
            }
            const isOutput = labelLayout === "horizontal" /* horizontal */ && type.displayName === 'Output';
            const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, {
                [`${prefixCls}-required`]: required,
                [`${prefixCls}-readonly`]: readOnly,
                [`${prefixCls}-label-vertical`]: labelLayout === "vertical" /* vertical */,
                [`${prefixCls}-label-output`]: isOutput,
                [`${prefixCls}-label-useColon`]: useColon && !excludeUseColonTagList.find(v => v === TagName),
            });
            const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
                [`${prefixCls}-output`]: isOutput,
            });
            if (!noLabel) {
                if (!isNaN(fieldLabelWidth)) {
                    labelWidth[colIndex] = Math.max(labelWidth[colIndex], fieldLabelWidth);
                }
                cols.push(React.createElement("td", { key: `row-${rowIndex}-col-${colIndex}-label`, className: labelClassName, rowSpan: rowSpan },
                    React.createElement("label", { title: isString(label) ? label : '' },
                        React.createElement("span", null, label))));
            }
            const fieldElementProps = {
                key,
                className: classNames(prefixCls, className),
                placeholder: label && labelLayout === "placeholder" /* placeholder */ ? label : placeholder,
                ...otherProps,
            };
            if (!isString(type)) {
                fieldElementProps.rowIndex = rowIndex;
                fieldElementProps.colIndex = colIndex;
            }
            cols.push(React.createElement("td", { key: `row-${rowIndex}-col-${colIndex}-field`, colSpan: noLabel ? newColSpan : newColSpan * 2 - 1, rowSpan: rowSpan },
                labelLayout === "vertical" /* vertical */ && (React.createElement("label", { className: labelClassName }, label)),
                React.createElement("div", { className: wrapperClassName }, createElement(type, fieldElementProps))));
            if (index === len - 1) {
                completeLine();
            }
            else {
                colIndex++;
            }
            index++;
        }
        cols = [];
        if (!noLabel) {
            for (let i = 0; i < columns; i++) {
                cols.push(React.createElement("col", { key: `label-${i}`, style: { width: pxToRem(labelWidth[i % columns]) } }), React.createElement("col", { key: `wrapper-${i}` }));
            }
        }
        else {
            for (let i = 0; i < columns; i++) {
                cols.push(React.createElement("col", { key: `wrapper-${i}` }));
            }
        }
        return [
            this.getHeader(),
            (React.createElement("table", { key: "form-body" },
                cols.length ? React.createElement("colgroup", null, cols) : undefined,
                React.createElement("tbody", null, rows))),
        ];
    }
    render() {
        const { labelWidth, labelAlign, labelLayout, pristine, dataSet, record, dataIndex, observableProps, } = this;
        const { formNode } = this.context;
        const value = {
            formNode: formNode || this,
            dataSet,
            dataIndex,
            record,
            labelWidth,
            labelAlign,
            labelLayout,
            pristine,
            disabled: this.isDisabled(),
        };
        let children = this.rasterizedChildren();
        if (!formNode) {
            children = (React.createElement("form", Object.assign({}, this.getMergedProps(), { noValidate: true }), children));
        }
        return (React.createElement(Responsive, { items: [
                observableProps.columns,
                observableProps.labelWidth,
                observableProps.labelAlign,
                observableProps.labelLayout,
            ], onChange: this.handleResponsive },
            React.createElement(FormContext.Provider, { value: value }, children)));
    }
    handleResponsive(items) {
        this.responsiveItems = items;
    }
    async handleSubmit(e) {
        e.preventDefault();
        e.persist();
        if (await this.checkValidity()) {
            const { target, action, dataSet, method, processParams = noop, onSuccess = noop, onError = noop, onSubmit = noop, } = this.props;
            onSubmit(e);
            try {
                if (dataSet) {
                    onSuccess(await dataSet.submit());
                }
                else if (action) {
                    if (target && this.element) {
                        this.element.submit();
                    }
                    else {
                        onSuccess(await this.axios[method || 'get'](action, processParams(e)));
                    }
                }
            }
            catch (error) {
                onError(error);
            }
        }
    }
    handleReset(e) {
        const { onReset = noop } = this.props;
        const { record } = this;
        onReset(e);
        if (!e.isDefaultPrevented()) {
            if (record) {
                record.reset();
            }
            else {
                this.getFields().forEach(field => field.reset());
            }
        }
    }
    checkValidity() {
        const { dataSet } = this;
        if (dataSet) {
            if (!dataSet.length) {
                dataSet.create();
            }
            return dataSet.validate();
        }
        return Promise.all(this.getFields().map(field => field.checkValidity())).then(results => results.every(result => result));
    }
    getFields() {
        const { id } = this.props;
        if (id) {
            return [].concat(this.fields, getFieldsById(id));
        }
        return this.fields;
    }
    getField(name) {
        return this.getFields().find(field => field.props.name === name);
    }
    addField(field) {
        this.fields.push(field);
    }
    removeField(field) {
        const index = this.fields.indexOf(field);
        if (index !== -1) {
            this.fields.splice(index, 1);
        }
    }
};
Form.displayName = 'Form';
Form.FormVirtualGroup = FormVirtualGroup;
Form.propTypes = {
    /**
     * 表单提交请求地址
     */
    action: PropTypes.string,
    /**
     * 表单提交的HTTP Method
     * 可选值：POST | GET
     * @default POST
     */
    method: PropTypes.string,
    /**
     * 表单提交的目标
     * 当表单设置了设置target且没有dataSet时作浏览器默认提交，否则作Ajax提交
     */
    target: PropTypes.string,
    /**
     * Ajax提交时的参数回调
     */
    processParams: PropTypes.func,
    /**
     * 内部控件的标签的宽度
     */
    labelWidth: PropTypes.oneOfType([
        labelWidthPropTypes,
        PropTypes.shape({
            ["xs" /* xs */]: labelWidthPropTypes,
            ["sm" /* sm */]: labelWidthPropTypes,
            ["md" /* md */]: labelWidthPropTypes,
            ["lg" /* lg */]: labelWidthPropTypes,
            ["xl" /* xl */]: labelWidthPropTypes,
            ["xxl" /* xxl */]: labelWidthPropTypes,
        }),
    ]),
    useColon: PropTypes.bool,
    excludeUseColonTagList: PropTypes.array,
    /**
     * 标签文字对齐方式
     * 可选值： 'left' | 'center' | 'right'
     */
    labelAlign: PropTypes.oneOfType([
        labelAlignPropTypes,
        PropTypes.shape({
            ["xs" /* xs */]: labelAlignPropTypes,
            ["sm" /* sm */]: labelAlignPropTypes,
            ["md" /* md */]: labelAlignPropTypes,
            ["lg" /* lg */]: labelAlignPropTypes,
            ["xl" /* xl */]: labelAlignPropTypes,
            ["xxl" /* xxl */]: labelAlignPropTypes,
        }),
    ]),
    /**
     * 标签位置
     * 可选值： 'horizontal' | 'vertical' | 'placeholder' | 'float' | 'none'
     */
    labelLayout: PropTypes.oneOfType([
        labelLayoutPropTypes,
        PropTypes.shape({
            ["xs" /* xs */]: labelLayoutPropTypes,
            ["sm" /* sm */]: labelLayoutPropTypes,
            ["md" /* md */]: labelLayoutPropTypes,
            ["lg" /* lg */]: labelLayoutPropTypes,
            ["xl" /* xl */]: labelLayoutPropTypes,
            ["xxl" /* xxl */]: labelLayoutPropTypes,
        }),
    ]),
    /**
     * 表单列数
     */
    columns: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
            ["xs" /* xs */]: PropTypes.number,
            ["sm" /* sm */]: PropTypes.number,
            ["md" /* md */]: PropTypes.number,
            ["lg" /* lg */]: PropTypes.number,
            ["xl" /* xl */]: PropTypes.number,
            ["xxl" /* xxl */]: PropTypes.number,
        }),
    ]),
    pristine: PropTypes.bool,
    /**
     * 表单头
     */
    header: PropTypes.string,
    /**
     * 提交回调
     */
    onSubmit: PropTypes.func,
    /**
     * 重置回调
     */
    onReset: PropTypes.func,
    /**
     * 提交成功回调
     */
    onSuccess: PropTypes.func,
    /**
     * 提交失败回调
     */
    onError: PropTypes.func,
    ...DataSetComponent.propTypes,
};
Form.defaultProps = {
    suffixCls: 'form',
    columns: defaultColumns,
    labelWidth: defaultLabelWidth,
};
Form.contextType = FormContext;
__decorate([
    observable
], Form.prototype, "responsiveItems", void 0);
__decorate([
    computed
], Form.prototype, "axios", null);
__decorate([
    computed
], Form.prototype, "dataSet", null);
__decorate([
    computed
], Form.prototype, "record", null);
__decorate([
    computed
], Form.prototype, "dataIndex", null);
__decorate([
    computed
], Form.prototype, "useColon", null);
__decorate([
    computed
], Form.prototype, "excludeUseColonTagList", null);
__decorate([
    computed
], Form.prototype, "columns", null);
__decorate([
    computed
], Form.prototype, "labelWidth", null);
__decorate([
    computed
], Form.prototype, "labelAlign", null);
__decorate([
    computed
], Form.prototype, "labelLayout", null);
__decorate([
    computed
], Form.prototype, "pristine", null);
__decorate([
    autobind
], Form.prototype, "handleDataSetValidate", null);
__decorate([
    autobind,
    mobxAction
], Form.prototype, "handleResponsive", null);
__decorate([
    autobind
], Form.prototype, "handleSubmit", null);
__decorate([
    autobind
], Form.prototype, "handleReset", null);
Form = __decorate([
    observer
], Form);
export default Form;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2Zvcm0vRm9ybS50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQ1osUUFBUSxFQUNSLGFBQWEsRUFHYixjQUFjLEVBR2QsWUFBWSxHQUNiLE1BQU0sT0FBTyxDQUFDO0FBQ2YsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sVUFBVSxNQUFNLFlBQVksQ0FBQztBQUNwQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxNQUFNLElBQUksVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1RixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBRXpDLE9BQU8sVUFBVSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDeEUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9ELE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUM3QixPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQTZCLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzlFLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLGdCQUEyQyxNQUFNLDhCQUE4QixDQUFDO0FBSXZGLE9BQU8sRUFDTCxjQUFjLEVBQ2QsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixXQUFXLEVBQ1gsbUJBQW1CLEVBQ25CLHlCQUF5QixFQUN6Qix1QkFBdUIsR0FDeEIsTUFBTSxTQUFTLENBQUM7QUFDakIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUVsRDs7R0FFRztBQUNILE1BQU0sT0FBTyxHQUE2QixDQUFDLFFBQVEsQ0FBQyxFQUFFLEtBQWE7SUFDakUsT0FBTyxJQUFJLEVBQUU7UUFDWCxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ1gsTUFBTSxRQUFRLEtBQUssRUFBRSxDQUFDO0tBQ3ZCO0FBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFnR04sTUFBTSxtQkFBbUIsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQzlDLFNBQVMsQ0FBQyxNQUFNO0lBQ2hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztDQUNwQyxDQUFDLENBQUM7QUFDSCxNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsK0RBQXNELENBQUMsQ0FBQztBQUNwRyxNQUFNLG9CQUFvQixHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7Ozs7O0NBSzVDLENBQUMsQ0FBQztBQUdILElBQXFCLElBQUksR0FBekIsTUFBcUIsSUFBSyxTQUFRLGdCQUEyQjtJQTJIM0QsWUFBWSxLQUFLLEVBQUUsT0FBTztRQUN4QixLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBUHhCLFdBQU0sR0FBZ0MsRUFBRSxDQUFDO1FBSXpDLFNBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1FBSTFCLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDbkUsQ0FBQztJQUdELElBQUksT0FBTztRQUNULE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxNQUFNLEVBQUU7WUFDVixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7U0FDdkI7UUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO0lBQ3RDLENBQUM7SUFHRCxJQUFJLE1BQU07UUFDUixNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzVELElBQUksTUFBTSxFQUFFO1lBQ1YsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUNELElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3ZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMvQjtZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUN4QjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFHRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO0lBQ3hDLENBQUM7SUFHRCxJQUFJLFFBQVE7UUFDVixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUUxQyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsT0FBTyxRQUFRLENBQUM7U0FDakI7UUFFRCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQ2hDLE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBR0QsSUFBSSxzQkFBc0I7UUFDeEIsTUFBTSxFQUFFLHNCQUFzQixFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUV4RCxJQUFJLHNCQUFzQixLQUFLLFNBQVMsRUFBRTtZQUN4QyxPQUFPLHNCQUFzQixDQUFDO1NBQy9CO1FBRUQsTUFBTSw0QkFBNEIsR0FBRyxTQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN6RSxJQUFJLDRCQUE0QixLQUFLLFNBQVMsRUFBRTtZQUM5QyxPQUFPLDRCQUE0QixDQUFDO1NBQ3JDO1FBRUQsT0FBTyx5QkFBeUIsQ0FBQztJQUNuQyxDQUFDO0lBR0QsSUFBSSxPQUFPO1FBQ1QsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDekMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDckIsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFDRCxJQUFJLE9BQU8sRUFBRTtZQUNYLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLGlCQUFpQixFQUFFO2dCQUNyQixPQUFPLGlCQUFpQixDQUFDO2FBQzFCO1NBQ0Y7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBR0QsSUFBSSxVQUFVO1FBQ1osTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ25ELE9BQU8sVUFBVSxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRTtnQkFDakMsT0FBTyxlQUFlLENBQUM7YUFDeEI7U0FDRjtRQUNELE9BQU8saUJBQWlCLENBQUM7SUFDM0IsQ0FBQztJQUdELElBQUksVUFBVTtRQUNaLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzVDLE1BQU0saUJBQWlCLEdBQ3JCLElBQUksQ0FBQyxXQUFXLDhCQUF5QixDQUFDLENBQUMsbUJBQWlCLENBQUMsb0JBQWlCLENBQUM7UUFDakYsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEIsT0FBTyxVQUF3QixDQUFDO1NBQ2pDO1FBQ0QsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksZUFBZSxFQUFFO2dCQUNuQixPQUFPLGVBQWUsQ0FBQzthQUN4QjtTQUNGO1FBQ0QsT0FBTyxpQkFBaUIsQ0FBQztJQUMzQixDQUFDO0lBR0QsSUFBSSxXQUFXO1FBQ2IsTUFBTSxrQkFBa0IsR0FBSSxTQUFTLENBQUMsYUFBYSxDQUFpQixpQ0FBMEIsQ0FBQztRQUMvRixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUN6QixPQUFPLFdBQTBCLENBQUM7U0FDbkM7UUFDRCxJQUFJLFdBQVcsRUFBRTtZQUNmLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLHFCQUFxQixFQUFFO2dCQUN6QixPQUFPLHFCQUFxQixDQUFDO2FBQzlCO1NBQ0Y7UUFDRCxPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7SUFHRCxJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxVQUFVO1FBQ1IsT0FBTyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDckQsQ0FBQztJQUVELGtCQUFrQixDQUFDLEtBQUssRUFBRSxPQUFPO1FBQy9CLE9BQU87WUFDTCxPQUFPLEVBQUUsU0FBUyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU87WUFDN0QsTUFBTSxFQUFFLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNO1lBQ3pELFNBQVMsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDO1lBQ3hELFdBQVcsRUFBRSxhQUFhLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVztZQUM3RSxVQUFVLEVBQUUsWUFBWSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDekUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDM0QsUUFBUSxFQUFFLFVBQVUsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRO1lBQ2pFLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztZQUN0QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLHNCQUFzQjtTQUNyRCxDQUFDO0lBQ0osQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQzdDLFFBQVE7WUFDUixXQUFXO1lBQ1gsV0FBVztZQUNYLFNBQVM7WUFDVCxlQUFlO1lBQ2YsWUFBWTtZQUNaLFlBQVk7WUFDWixhQUFhO1lBQ2IsU0FBUztZQUNULFVBQVU7WUFDVixPQUFPO1lBQ1AsVUFBVTtZQUNWLHdCQUF3QjtTQUN6QixDQUFDLENBQUM7UUFDSCxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDeEMsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ3BCLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztTQUM3QjtRQUNELE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxTQUFTO1FBQ1AsTUFBTSxFQUNKLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUNqQixTQUFTLEdBQ1YsR0FBRyxJQUFJLENBQUM7UUFDVCxJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sQ0FDTCw2QkFBSyxHQUFHLEVBQUMsYUFBYSxFQUFDLFNBQVMsRUFBRSxHQUFHLFNBQVMsU0FBUyxJQUNwRCxNQUFNLENBQ0gsQ0FDUCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQsWUFBWSxDQUFDLEdBQUcsS0FBSztRQUNuQixNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN4QyxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDeEIsR0FBRyxLQUFLO1lBQ1IsQ0FBQyxHQUFHLFNBQVMsY0FBYyxDQUFDLEVBQUUsV0FBVyx3QkFBc0I7U0FDaEUsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUdELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELHNCQUFzQixDQUFDLElBQWE7UUFDbEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLE9BQU8sRUFBRTtZQUNYLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7WUFDOUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQztJQUVELFdBQVc7SUFFWCxLQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUU7UUFDcEMsSUFBSSxDQUFDLE1BQU0sTUFBTSxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pFLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNkO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE1BQU0sRUFDSixPQUFPLEVBQ1AsTUFBTSxFQUNOLE9BQU8sRUFDUCxXQUFXLEVBQ1gsVUFBVSxFQUNWLFFBQVEsRUFDUixzQkFBc0IsRUFDdEIsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQ3BCLEdBQUcsSUFBSSxDQUFDO1FBQ1QsTUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sVUFBVSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakUsTUFBTSxJQUFJLEdBQXdCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLElBQUksR0FBd0IsRUFBRSxDQUFDO1FBQ25DLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsTUFBTSxNQUFNLEdBQThCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sYUFBYSxHQUF3QixFQUFFLENBQUM7UUFDOUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDakMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUU7b0JBQ2xELElBQ0UsT0FBTyxLQUFLLElBQUk7d0JBQ2hCLFdBQVcsa0NBQTJCO3dCQUN0QyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUNyRDt3QkFDQSxPQUFPLEdBQUcsS0FBSyxDQUFDO3FCQUNqQjtvQkFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRTt3QkFDbkIsT0FBTztxQkFDUjtvQkFDRCxJQUFJLFFBQVEsRUFBRSxJQUFJLElBQUssUUFBUSxDQUFDLElBQVksQ0FBQyxXQUFXLEtBQUssa0JBQWtCLEVBQUU7d0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTs0QkFDNUIsT0FBTzt5QkFDUjt3QkFDRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFOzRCQUNwQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQ0FDcEMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZELENBQUMsQ0FBQyxDQUFDO3lCQUNKOzZCQUFNLElBQUksUUFBUSxFQUFFLElBQUksSUFBSyxRQUFRLENBQUMsSUFBWSxDQUFDLFdBQVcsS0FBSyxrQkFBa0IsRUFBRTs0QkFDdEYsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDNUU7NkJBQU07NEJBQ0wsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0NBQzdDLEdBQUcsVUFBVTtnQ0FDYixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUs7NkJBQ2pDLENBQUMsQ0FBQyxDQUFDO3lCQUNMO3FCQUNGO3lCQUFNO3dCQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTs0QkFDOUIsR0FBRyxVQUFVOzRCQUNiLEdBQUcsUUFBUSxDQUFDLEtBQUs7eUJBQ2xCLENBQUMsQ0FBQyxDQUFDO3FCQUNMO2dCQUNILENBQUMsQ0FBQztnQkFDRixRQUFRLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLFlBQVk7WUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyw0QkFBSSxHQUFHLEVBQUUsT0FBTyxRQUFRLEVBQUUsSUFBRyxJQUFJLENBQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELElBQUksR0FBRyxFQUFFLENBQUM7YUFDWDtZQUNELFFBQVEsRUFBRSxDQUFDO1lBQ1gsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNiLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVDLENBQUM7UUFFRCxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHO1lBQzVELE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVsRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU8sR0FBSSxJQUFZLENBQUMsV0FBVyxDQUFDO2FBQ3JDO1lBRUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNELE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRSxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakUsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sRUFDSixPQUFPLEdBQUcsQ0FBQyxFQUNYLE9BQU8sR0FBRyxDQUFDLEVBQ1gsT0FBTyxFQUNQLFNBQVMsRUFDVCxXQUFXLEVBQ1gsR0FBRyxVQUFVLEVBQ2QsR0FBRyxLQUFZLENBQUM7WUFDakIsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDO1lBQ3pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwQyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7b0JBQ2xCLFlBQVksRUFBRSxDQUFDO29CQUNmLFNBQVM7aUJBQ1Y7YUFDRjtZQUNELE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzQixRQUFRLEVBQUUsQ0FBQzthQUNaO1lBQ0QsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUN2QixZQUFZLEVBQUUsQ0FBQztnQkFDZixTQUFTO2FBQ1Y7WUFDRCxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsT0FBTyxFQUFFO2dCQUNuQyxVQUFVLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQzthQUNqQztZQUNELEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsR0FBRyxRQUFRLEdBQUcsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNqQixVQUFVLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztvQkFDMUIsTUFBTTtpQkFDUDthQUNGO1lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xELEtBQUssSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsR0FBRyxVQUFVLEdBQUcsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ2QsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztxQkFDaEI7b0JBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDckI7YUFDRjtZQUNELE1BQU0sUUFBUSxHQUNaLFdBQVcsa0NBQTJCLElBQUssSUFBWSxDQUFDLFdBQVcsS0FBSyxRQUFRLENBQUM7WUFDbkYsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLEdBQUcsU0FBUyxRQUFRLEVBQUUsR0FBRyxTQUFTLFVBQVUsVUFBVSxFQUFFLEVBQUU7Z0JBQzFGLENBQUMsR0FBRyxTQUFTLFdBQVcsQ0FBQyxFQUFFLFFBQVE7Z0JBQ25DLENBQUMsR0FBRyxTQUFTLFdBQVcsQ0FBQyxFQUFFLFFBQVE7Z0JBQ25DLENBQUMsR0FBRyxTQUFTLGlCQUFpQixDQUFDLEVBQUUsV0FBVyw4QkFBeUI7Z0JBQ3JFLENBQUMsR0FBRyxTQUFTLGVBQWUsQ0FBQyxFQUFFLFFBQVE7Z0JBQ3ZDLENBQUMsR0FBRyxTQUFTLGlCQUFpQixDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQzthQUM5RixDQUFDLENBQUM7WUFDSCxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxHQUFHLFNBQVMsVUFBVSxFQUFFO2dCQUMxRCxDQUFDLEdBQUcsU0FBUyxTQUFTLENBQUMsRUFBRSxRQUFRO2FBQ2xDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDM0IsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2lCQUN4RTtnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUNQLDRCQUNFLEdBQUcsRUFBRSxPQUFPLFFBQVEsUUFBUSxRQUFRLFFBQVEsRUFDNUMsU0FBUyxFQUFFLGNBQWMsRUFDekIsT0FBTyxFQUFFLE9BQU87b0JBRWhCLCtCQUFPLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDeEMsa0NBQ0csS0FBSyxDQUNELENBQ0QsQ0FDTCxDQUNOLENBQUM7YUFDSDtZQUNELE1BQU0saUJBQWlCLEdBQVE7Z0JBQzdCLEdBQUc7Z0JBQ0gsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO2dCQUMzQyxXQUFXLEVBQUUsS0FBSyxJQUFJLFdBQVcsb0NBQTRCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVztnQkFDbkYsR0FBRyxVQUFVO2FBQ2QsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7Z0JBQ3RDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7YUFDdkM7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUNQLDRCQUNFLEdBQUcsRUFBRSxPQUFPLFFBQVEsUUFBUSxRQUFRLFFBQVEsRUFDNUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDbEQsT0FBTyxFQUFFLE9BQU87Z0JBRWYsV0FBVyw4QkFBeUIsSUFBSSxDQUN2QywrQkFBTyxTQUFTLEVBQUUsY0FBYyxJQUFHLEtBQUssQ0FBUyxDQUNsRDtnQkFDRCw2QkFBSyxTQUFTLEVBQUUsZ0JBQWdCLElBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFPLENBQzdFLENBQ04sQ0FBQztZQUNGLElBQUksS0FBSyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLFlBQVksRUFBRSxDQUFDO2FBQ2hCO2lCQUFNO2dCQUNMLFFBQVEsRUFBRSxDQUFDO2FBQ1o7WUFDRCxLQUFLLEVBQUUsQ0FBQztTQUNUO1FBQ0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNWLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoQyxJQUFJLENBQUMsSUFBSSxDQUNQLDZCQUFLLEdBQUcsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUksRUFDOUUsNkJBQUssR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEdBQUksQ0FDN0IsQ0FBQzthQUNIO1NBQ0Y7YUFBTTtZQUNMLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxJQUFJLENBQ1AsNkJBQUssR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEdBQUksQ0FDN0IsQ0FBQzthQUNIO1NBQ0Y7UUFDRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixDQUFDLCtCQUFPLEdBQUcsRUFBQyxXQUFXO2dCQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxzQ0FBVyxJQUFJLENBQVksQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDdEQsbUNBQVEsSUFBSSxDQUFTLENBQ2YsQ0FBQztTQUNWLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTTtRQUNKLE1BQU0sRUFDSixVQUFVLEVBQ1YsVUFBVSxFQUNWLFdBQVcsRUFDWCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixTQUFTLEVBQ1QsZUFBZSxHQUNoQixHQUFHLElBQUksQ0FBQztRQUNULE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sS0FBSyxHQUFHO1lBQ1osUUFBUSxFQUFFLFFBQVEsSUFBSSxJQUFJO1lBQzFCLE9BQU87WUFDUCxTQUFTO1lBQ1QsTUFBTTtZQUNOLFVBQVU7WUFDVixVQUFVO1lBQ1YsV0FBVztZQUNYLFFBQVE7WUFDUixRQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRTtTQUM1QixDQUFDO1FBQ0YsSUFBSSxRQUFRLEdBQWMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDcEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLFFBQVEsR0FBRyxDQUNULDhDQUFVLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBRSxVQUFVLFdBQ3hDLFFBQVEsQ0FDSixDQUNSLENBQUM7U0FDSDtRQUNELE9BQU8sQ0FDTCxvQkFBQyxVQUFVLElBQ1QsS0FBSyxFQUFFO2dCQUNMLGVBQWUsQ0FBQyxPQUFPO2dCQUN2QixlQUFlLENBQUMsVUFBVTtnQkFDMUIsZUFBZSxDQUFDLFVBQVU7Z0JBQzFCLGVBQWUsQ0FBQyxXQUFXO2FBQzVCLEVBQ0QsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFFL0Isb0JBQUMsV0FBVyxDQUFDLFFBQVEsSUFBQyxLQUFLLEVBQUUsS0FBSyxJQUFHLFFBQVEsQ0FBd0IsQ0FDMUQsQ0FDZCxDQUFDO0lBQ0osQ0FBQztJQUlELGdCQUFnQixDQUFDLEtBQUs7UUFDcEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUdELEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ1osSUFBSSxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUM5QixNQUFNLEVBQ0osTUFBTSxFQUNOLE1BQU0sRUFDTixPQUFPLEVBQ1AsTUFBTSxFQUNOLGFBQWEsR0FBRyxJQUFJLEVBQ3BCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLE9BQU8sR0FBRyxJQUFJLEVBQ2QsUUFBUSxHQUFHLElBQUksR0FDaEIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2YsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1osSUFBSTtnQkFDRixJQUFJLE9BQU8sRUFBRTtvQkFDWCxTQUFTLENBQUMsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztpQkFDbkM7cUJBQU0sSUFBSSxNQUFNLEVBQUU7b0JBQ2pCLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ3ZCO3lCQUFNO3dCQUNMLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN4RTtpQkFDRjthQUNGO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hCO1NBQ0Y7SUFDSCxDQUFDO0lBR0QsV0FBVyxDQUFDLENBQUM7UUFDWCxNQUFNLEVBQUUsT0FBTyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN4QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLEVBQUU7WUFDM0IsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUNsRDtTQUNGO0lBQ0gsQ0FBQztJQUVELGFBQWE7UUFDWCxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNsQjtZQUNELE9BQU8sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzNCO1FBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUN0RixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQ2hDLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBUztRQUNQLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzFCLElBQUksRUFBRSxFQUFFO1lBQ04sT0FBUSxFQUFrQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxRQUFRLENBQUMsSUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQWdDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBSztRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM5QjtJQUNILENBQUM7Q0FDRixDQUFBO0FBdHJCUSxnQkFBVyxHQUFHLE1BQU0sQ0FBQztBQUVyQixxQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUVwQyxjQUFTLEdBQUc7SUFDakI7O09BRUc7SUFDSCxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07SUFDeEI7Ozs7T0FJRztJQUNILE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtJQUN4Qjs7O09BR0c7SUFDSCxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07SUFDeEI7O09BRUc7SUFDSCxhQUFhLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDN0I7O09BRUc7SUFDSCxVQUFVLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUM5QixtQkFBbUI7UUFDbkIsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNkLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGlCQUFvQixFQUFFLG1CQUFtQjtTQUMxQyxDQUFDO0tBQ0gsQ0FBQztJQUNGLFFBQVEsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN4QixzQkFBc0IsRUFBRSxTQUFTLENBQUMsS0FBSztJQUN2Qzs7O09BR0c7SUFDSCxVQUFVLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUM5QixtQkFBbUI7UUFDbkIsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNkLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGVBQW1CLEVBQUUsbUJBQW1CO1lBQ3hDLGlCQUFvQixFQUFFLG1CQUFtQjtTQUMxQyxDQUFDO0tBQ0gsQ0FBQztJQUNGOzs7T0FHRztJQUNILFdBQVcsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQy9CLG9CQUFvQjtRQUNwQixTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ2QsZUFBbUIsRUFBRSxvQkFBb0I7WUFDekMsZUFBbUIsRUFBRSxvQkFBb0I7WUFDekMsZUFBbUIsRUFBRSxvQkFBb0I7WUFDekMsZUFBbUIsRUFBRSxvQkFBb0I7WUFDekMsZUFBbUIsRUFBRSxvQkFBb0I7WUFDekMsaUJBQW9CLEVBQUUsb0JBQW9CO1NBQzNDLENBQUM7S0FDSCxDQUFDO0lBQ0Y7O09BRUc7SUFDSCxPQUFPLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUMzQixTQUFTLENBQUMsTUFBTTtRQUNoQixTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ2QsZUFBbUIsRUFBRSxTQUFTLENBQUMsTUFBTTtZQUNyQyxlQUFtQixFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3JDLGVBQW1CLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDckMsZUFBbUIsRUFBRSxTQUFTLENBQUMsTUFBTTtZQUNyQyxlQUFtQixFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3JDLGlCQUFvQixFQUFFLFNBQVMsQ0FBQyxNQUFNO1NBQ3ZDLENBQUM7S0FDSCxDQUFDO0lBQ0YsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3hCOztPQUVHO0lBQ0gsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBQ3hCOztPQUVHO0lBQ0gsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3hCOztPQUVHO0lBQ0gsT0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3ZCOztPQUVHO0lBQ0gsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3pCOztPQUVHO0lBQ0gsT0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3ZCLEdBQUcsZ0JBQWdCLENBQUMsU0FBUztDQUM5QixDQUFDO0FBRUssaUJBQVksR0FBRztJQUNwQixTQUFTLEVBQUUsTUFBTTtJQUNqQixPQUFPLEVBQUUsY0FBYztJQUN2QixVQUFVLEVBQUUsaUJBQWlCO0NBQzlCLENBQUM7QUFFSyxnQkFBVyxHQUFHLFdBQVcsQ0FBQztBQUlyQjtJQUFYLFVBQVU7NkNBQXdCO0FBWW5DO0lBREMsUUFBUTtpQ0FHUjtBQUdEO0lBREMsUUFBUTttQ0FPUjtBQUdEO0lBREMsUUFBUTtrQ0FhUjtBQUdEO0lBREMsUUFBUTtxQ0FHUjtBQUdEO0lBREMsUUFBUTtvQ0FjUjtBQUdEO0lBREMsUUFBUTtrREFjUjtBQUdEO0lBREMsUUFBUTttQ0FhUjtBQUdEO0lBREMsUUFBUTtzQ0FhUjtBQUdEO0lBREMsUUFBUTtzQ0FlUjtBQUdEO0lBREMsUUFBUTt1Q0FjUjtBQUdEO0lBREMsUUFBUTtvQ0FHUjtBQXNGRDtJQURDLFFBQVE7aURBUVI7QUErUEQ7SUFGQyxRQUFRO0lBQ1IsVUFBVTs0Q0FHVjtBQUdEO0lBREMsUUFBUTt3Q0E4QlI7QUFHRDtJQURDLFFBQVE7dUNBWVI7QUFscEJrQixJQUFJO0lBRHhCLFFBQVE7R0FDWSxJQUFJLENBdXJCeEI7ZUF2ckJvQixJQUFJIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9mb3JtL0Zvcm0udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge1xuICBDaGlsZHJlbixcbiAgY3JlYXRlRWxlbWVudCxcbiAgRm9ybUV2ZW50LFxuICBGb3JtRXZlbnRIYW5kbGVyLFxuICBpc1ZhbGlkRWxlbWVudCxcbiAgUmVhY3RFbGVtZW50LFxuICBSZWFjdE5vZGUsXG4gIGNsb25lRWxlbWVudCxcbn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCB7IGFjdGlvbiBhcyBtb2J4QWN0aW9uLCBjb21wdXRlZCwgaXNBcnJheUxpa2UsIG9ic2VydmFibGUsIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgaXNOdW1iZXIgZnJvbSAnbG9kYXNoL2lzTnVtYmVyJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IGRlZmF1bHRUbyBmcm9tICdsb2Rhc2gvZGVmYXVsdFRvJztcbmltcG9ydCB7IEF4aW9zSW5zdGFuY2UgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgUmVzcG9uc2l2ZSBmcm9tICdjaG9lcm9kb24tdWkvbGliL3Jlc3BvbnNpdmUvUmVzcG9uc2l2ZSc7XG5pbXBvcnQgeyBnZXRDb25maWcsIGdldFByb1ByZWZpeENscyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB7IHB4VG9SZW0gfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL1VuaXRDb252ZXJ0b3InO1xuaW1wb3J0IGlzRnVuY3Rpb24gZnJvbSAnbG9kYXNoL2lzRnVuY3Rpb24nO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknO1xuaW1wb3J0IGF4aW9zIGZyb20gJy4uL2F4aW9zJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBGb3JtRmllbGQsIEZvcm1GaWVsZFByb3BzLCBnZXRGaWVsZHNCeUlkIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBGb3JtQ29udGV4dCBmcm9tICcuL0Zvcm1Db250ZXh0JztcbmltcG9ydCBEYXRhU2V0Q29tcG9uZW50LCB7IERhdGFTZXRDb21wb25lbnRQcm9wcyB9IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXRDb21wb25lbnQnO1xuaW1wb3J0IERhdGFTZXQgZnJvbSAnLi4vZGF0YS1zZXQvRGF0YVNldCc7XG5pbXBvcnQgUmVjb3JkIGZyb20gJy4uL2RhdGEtc2V0L1JlY29yZCc7XG5pbXBvcnQgeyBMYWJlbEFsaWduLCBMYWJlbExheW91dCwgUmVzcG9uc2l2ZUtleXMgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHtcbiAgZGVmYXVsdENvbHVtbnMsXG4gIGRlZmF1bHRMYWJlbFdpZHRoLFxuICBGSUVMRF9TVUZGSVgsXG4gIGdldFByb3BlcnR5LFxuICBub3JtYWxpemVMYWJlbFdpZHRoLFxuICBkZWZhdWx0RXhjbHVkZVVzZUNvbG9uVGFnLFxuICBmaW5kRmlyc3RJbnZhbGlkRWxlbWVudCxcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgRm9ybVZpcnR1YWxHcm91cCBmcm9tICcuL0Zvcm1WaXJ0dWFsR3JvdXAnO1xuXG4vKipcbiAqIOihqOWNlW5hbWXnlJ/miJDlmahcbiAqL1xuY29uc3QgTmFtZUdlbjogSXRlcmFibGVJdGVyYXRvcjxzdHJpbmc+ID0gKGZ1bmN0aW9uKiAoc3RhcnQ6IG51bWJlcikge1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN0YXJ0ICs9IDE7XG4gICAgeWllbGQgYGZvcm0tJHtzdGFydH1gO1xuICB9XG59KSgwKTtcblxuZXhwb3J0IHR5cGUgTGFiZWxXaWR0aCA9IG51bWJlciB8IG51bWJlcltdO1xuXG5leHBvcnQgdHlwZSBMYWJlbFdpZHRoVHlwZSA9IExhYmVsV2lkdGggfCB7IFtrZXkgaW4gUmVzcG9uc2l2ZUtleXNdOiBMYWJlbFdpZHRoIH07XG5leHBvcnQgdHlwZSBMYWJlbEFsaWduVHlwZSA9IExhYmVsQWxpZ24gfCB7IFtrZXkgaW4gUmVzcG9uc2l2ZUtleXNdOiBMYWJlbEFsaWduIH07XG5leHBvcnQgdHlwZSBMYWJlbExheW91dFR5cGUgPSBMYWJlbExheW91dCB8IHsgW2tleSBpbiBSZXNwb25zaXZlS2V5c106IExhYmVsTGF5b3V0IH07XG5leHBvcnQgdHlwZSBDb2x1bW5zVHlwZSA9IG51bWJlciB8IHsgW2tleSBpbiBSZXNwb25zaXZlS2V5c106IG51bWJlciB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1Qcm9wcyBleHRlbmRzIERhdGFTZXRDb21wb25lbnRQcm9wcyB7XG4gIC8qKlxuICAgKiDooajljZXmj5DkuqTor7fmsYLlnLDlnYBcbiAgICovXG4gIGFjdGlvbj86IHN0cmluZztcbiAgLyoqXG4gICAqIOihqOWNleaPkOS6pOeahEhUVFAgTWV0aG9kXG4gICAqIOWPr+mAieWAvO+8mlBPU1QgfCBHRVRcbiAgICogQGRlZmF1bHQgUE9TVFxuICAgKi9cbiAgbWV0aG9kPzogc3RyaW5nO1xuICAvKipcbiAgICog6KGo5Y2V5o+Q5Lqk55qE55uu5qCHXG4gICAqIOW9k+ihqOWNleiuvue9ruS6huiuvue9rnRhcmdldOS4lOayoeaciWRhdGFTZXTml7bkvZzmtY/op4jlmajpu5jorqTmj5DkuqTvvIzlkKbliJnkvZxBamF45o+Q5LqkXG4gICAqL1xuICB0YXJnZXQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBamF45o+Q5Lqk5pe255qE5Y+C5pWw5Zue6LCDXG4gICAqL1xuICBwcm9jZXNzUGFyYW1zPzogKGU6IEZvcm1FdmVudDxhbnk+KSA9PiBhbnk7XG4gIC8qKlxuICAgKiDmmK/lkKbkvb/nlKjlhpLlj7dcbiAgICovXG4gIHVzZUNvbG9uPzogYm9vbGVhbixcbiAgLyoqXG4gICAqIOS4jeS9v+eUqOWGkuWPt+eahOWIl+ihqFxuICAgKi9cbiAgZXhjbHVkZVVzZUNvbG9uVGFnTGlzdD86IHN0cmluZ1tdLFxuICAvKipcbiAgICog5YaF6YOo5o6n5Lu255qE5qCH562+55qE5a695bqmXG4gICAqL1xuICBsYWJlbFdpZHRoPzogTGFiZWxXaWR0aFR5cGU7XG4gIC8qKlxuICAgKiDmoIfnrb7mloflrZflr7npvZDmlrnlvI9cbiAgICog5Y+v6YCJ5YC877yaICdsZWZ0JyB8ICdjZW50ZXInIHwgJ3JpZ2h0J1xuICAgKiBAZGVmYXVsdCByaWdodDtcbiAgICovXG4gIGxhYmVsQWxpZ24/OiBMYWJlbEFsaWduVHlwZTtcbiAgLyoqXG4gICAqIOagh+etvuS9jee9rlxuICAgKiDlj6/pgInlgLzvvJogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJyB8ICdwbGFjZWhvbGRlcicgfCAnbm9uZSdcbiAgICovXG4gIGxhYmVsTGF5b3V0PzogTGFiZWxMYXlvdXRUeXBlO1xuICAvKipcbiAgICog6KGo5Y2V5YiX5pWwXG4gICAqL1xuICBjb2x1bW5zPzogQ29sdW1uc1R5cGU7XG4gIC8qKlxuICAgKiDmmL7npLrljp/lp4vlgLxcbiAgICovXG4gIHByaXN0aW5lPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOihqOWNleWktO+8jOiLpeaPkOS+m+WImeWQjOaXtuaYvuekuuihqOWNleWktOWSjOihqOWNleWktOS4i+aWueeahOWIhumalOe6v1xuICAgKlxuICAgKiBAdHlwZSB7c3RyaW5nfSDmmoLlrprkuLpzdHJpbmfmlrnkvr/lhpnmoLflvI9cbiAgICogQG1lbWJlcm9mIEZvcm1Qcm9wc1xuICAgKi9cbiAgaGVhZGVyPzogc3RyaW5nO1xuICAvKipcbiAgICog5a+554WncmVjb3Jk5ZyoRGF0YVNldOS4reeahGluZGV4XG4gICAqIEBkZWZhdWx0IGRhdGFTZXQuY3VycmVudEluZGV4XG4gICAqL1xuICBkYXRhSW5kZXg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDlr7nnhadyZWNvcmRcbiAgICog5LyY5YWI57qn6auY5LqOZGF0YVNldOWSjGRhdGFJbmRleFxuICAgKi9cbiAgcmVjb3JkPzogUmVjb3JkO1xuICAvKipcbiAgICog5o+Q5Lqk5Zue6LCDXG4gICAqL1xuICBvblN1Ym1pdD86IEZvcm1FdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOmHjee9ruWbnuiwg1xuICAgKi9cbiAgb25SZXNldD86IEZvcm1FdmVudEhhbmRsZXI8YW55PjtcbiAgLyoqXG4gICAqIOaPkOS6pOaIkOWKn+Wbnuiwg1xuICAgKi9cbiAgb25TdWNjZXNzPzogKHJlc3A6IGFueSkgPT4gdm9pZDtcbiAgLyoqXG4gICAqIOaPkOS6pOWksei0peWbnuiwg1xuICAgKi9cbiAgb25FcnJvcj86IChlcnJvcjogRXJyb3IpID0+IHZvaWQ7XG4gIGF4aW9zPzogQXhpb3NJbnN0YW5jZTtcbn1cblxuY29uc3QgbGFiZWxXaWR0aFByb3BUeXBlcyA9IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICBQcm9wVHlwZXMubnVtYmVyLFxuICBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubnVtYmVyKSxcbl0pO1xuY29uc3QgbGFiZWxBbGlnblByb3BUeXBlcyA9IFByb3BUeXBlcy5vbmVPZihbTGFiZWxBbGlnbi5sZWZ0LCBMYWJlbEFsaWduLmNlbnRlciwgTGFiZWxBbGlnbi5yaWdodF0pO1xuY29uc3QgbGFiZWxMYXlvdXRQcm9wVHlwZXMgPSBQcm9wVHlwZXMub25lT2YoW1xuICBMYWJlbExheW91dC5ob3Jpem9udGFsLFxuICBMYWJlbExheW91dC52ZXJ0aWNhbCxcbiAgTGFiZWxMYXlvdXQucGxhY2Vob2xkZXIsXG4gIExhYmVsTGF5b3V0LmZsb2F0LFxuXSk7XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybSBleHRlbmRzIERhdGFTZXRDb21wb25lbnQ8Rm9ybVByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdGb3JtJztcblxuICBzdGF0aWMgRm9ybVZpcnR1YWxHcm91cCA9IEZvcm1WaXJ0dWFsR3JvdXA7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiDooajljZXmj5DkuqTor7fmsYLlnLDlnYBcbiAgICAgKi9cbiAgICBhY3Rpb246IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICog6KGo5Y2V5o+Q5Lqk55qESFRUUCBNZXRob2RcbiAgICAgKiDlj6/pgInlgLzvvJpQT1NUIHwgR0VUXG4gICAgICogQGRlZmF1bHQgUE9TVFxuICAgICAqL1xuICAgIG1ldGhvZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiDooajljZXmj5DkuqTnmoTnm67moIdcbiAgICAgKiDlvZPooajljZXorr7nva7kuoborr7nva50YXJnZXTkuJTmsqHmnIlkYXRhU2V05pe25L2c5rWP6KeI5Zmo6buY6K6k5o+Q5Lqk77yM5ZCm5YiZ5L2cQWpheOaPkOS6pFxuICAgICAqL1xuICAgIHRhcmdldDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiBBamF45o+Q5Lqk5pe255qE5Y+C5pWw5Zue6LCDXG4gICAgICovXG4gICAgcHJvY2Vzc1BhcmFtczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog5YaF6YOo5o6n5Lu255qE5qCH562+55qE5a695bqmXG4gICAgICovXG4gICAgbGFiZWxXaWR0aDogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBsYWJlbFdpZHRoUHJvcFR5cGVzLFxuICAgICAgUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnhzXTogbGFiZWxXaWR0aFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnNtXTogbGFiZWxXaWR0aFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLm1kXTogbGFiZWxXaWR0aFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLmxnXTogbGFiZWxXaWR0aFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnhsXTogbGFiZWxXaWR0aFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnh4bF06IGxhYmVsV2lkdGhQcm9wVHlwZXMsXG4gICAgICB9KSxcbiAgICBdKSxcbiAgICB1c2VDb2xvbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgZXhjbHVkZVVzZUNvbG9uVGFnTGlzdDogUHJvcFR5cGVzLmFycmF5LFxuICAgIC8qKlxuICAgICAqIOagh+etvuaWh+Wtl+Wvuem9kOaWueW8j1xuICAgICAqIOWPr+mAieWAvO+8miAnbGVmdCcgfCAnY2VudGVyJyB8ICdyaWdodCdcbiAgICAgKi9cbiAgICBsYWJlbEFsaWduOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIGxhYmVsQWxpZ25Qcm9wVHlwZXMsXG4gICAgICBQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgICBbUmVzcG9uc2l2ZUtleXMueHNdOiBsYWJlbEFsaWduUHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMuc21dOiBsYWJlbEFsaWduUHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMubWRdOiBsYWJlbEFsaWduUHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMubGddOiBsYWJlbEFsaWduUHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMueGxdOiBsYWJlbEFsaWduUHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMueHhsXTogbGFiZWxBbGlnblByb3BUeXBlcyxcbiAgICAgIH0pLFxuICAgIF0pLFxuICAgIC8qKlxuICAgICAqIOagh+etvuS9jee9rlxuICAgICAqIOWPr+mAieWAvO+8miAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnIHwgJ3BsYWNlaG9sZGVyJyB8ICdmbG9hdCcgfCAnbm9uZSdcbiAgICAgKi9cbiAgICBsYWJlbExheW91dDogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBsYWJlbExheW91dFByb3BUeXBlcyxcbiAgICAgIFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICAgIFtSZXNwb25zaXZlS2V5cy54c106IGxhYmVsTGF5b3V0UHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMuc21dOiBsYWJlbExheW91dFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLm1kXTogbGFiZWxMYXlvdXRQcm9wVHlwZXMsXG4gICAgICAgIFtSZXNwb25zaXZlS2V5cy5sZ106IGxhYmVsTGF5b3V0UHJvcFR5cGVzLFxuICAgICAgICBbUmVzcG9uc2l2ZUtleXMueGxdOiBsYWJlbExheW91dFByb3BUeXBlcyxcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnh4bF06IGxhYmVsTGF5b3V0UHJvcFR5cGVzLFxuICAgICAgfSksXG4gICAgXSksXG4gICAgLyoqXG4gICAgICog6KGo5Y2V5YiX5pWwXG4gICAgICovXG4gICAgY29sdW1uczogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnhzXTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnNtXTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLm1kXTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLmxnXTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnhsXTogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgW1Jlc3BvbnNpdmVLZXlzLnh4bF06IFByb3BUeXBlcy5udW1iZXIsXG4gICAgICB9KSxcbiAgICBdKSxcbiAgICBwcmlzdGluZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog6KGo5Y2V5aS0XG4gICAgICovXG4gICAgaGVhZGVyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOaPkOS6pOWbnuiwg1xuICAgICAqL1xuICAgIG9uU3VibWl0OiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDph43nva7lm57osINcbiAgICAgKi9cbiAgICBvblJlc2V0OiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDmj5DkuqTmiJDlip/lm57osINcbiAgICAgKi9cbiAgICBvblN1Y2Nlc3M6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOaPkOS6pOWksei0peWbnuiwg1xuICAgICAqL1xuICAgIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLFxuICAgIC4uLkRhdGFTZXRDb21wb25lbnQucHJvcFR5cGVzLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgc3VmZml4Q2xzOiAnZm9ybScsXG4gICAgY29sdW1uczogZGVmYXVsdENvbHVtbnMsXG4gICAgbGFiZWxXaWR0aDogZGVmYXVsdExhYmVsV2lkdGgsXG4gIH07XG5cbiAgc3RhdGljIGNvbnRleHRUeXBlID0gRm9ybUNvbnRleHQ7XG5cbiAgZmllbGRzOiBGb3JtRmllbGQ8Rm9ybUZpZWxkUHJvcHM+W10gPSBbXTtcblxuICBAb2JzZXJ2YWJsZSByZXNwb25zaXZlSXRlbXM6IGFueVtdO1xuXG4gIG5hbWUgPSBOYW1lR2VuLm5leHQoKS52YWx1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLnJlc3BvbnNpdmVJdGVtcyA9IFtdO1xuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBheGlvcygpOiBBeGlvc0luc3RhbmNlIHtcbiAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlUHJvcHMuYXhpb3MgfHwgZ2V0Q29uZmlnKCdheGlvcycpIHx8IGF4aW9zO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkYXRhU2V0KCk6IERhdGFTZXQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHJldHVybiByZWNvcmQuZGF0YVNldDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLmRhdGFTZXQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHJlY29yZCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcmVjb3JkLCBkYXRhU2V0LCBkYXRhSW5kZXggfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBpZiAoaXNOdW1iZXIoZGF0YUluZGV4KSkge1xuICAgICAgICByZXR1cm4gZGF0YVNldC5nZXQoZGF0YUluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhU2V0LmN1cnJlbnQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGRhdGFJbmRleCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm9ic2VydmFibGVQcm9wcy5kYXRhSW5kZXg7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHVzZUNvbG9uKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgdXNlQ29sb24gfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuXG4gICAgaWYgKHVzZUNvbG9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1c2VDb2xvbjtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWdVc2VDb2xvbiA9IGdldENvbmZpZygndXNlQ29sb24nKTtcbiAgICBpZiAoY29uZmlnVXNlQ29sb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNvbmZpZ1VzZUNvbG9uO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZXhjbHVkZVVzZUNvbG9uVGFnTGlzdCgpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgeyBleGNsdWRlVXNlQ29sb25UYWdMaXN0IH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcblxuICAgIGlmIChleGNsdWRlVXNlQ29sb25UYWdMaXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBleGNsdWRlVXNlQ29sb25UYWdMaXN0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ0V4Y2x1ZGVVc2VDb2xvblRhZ0xpc3QgPSBnZXRDb25maWcoJ2V4Y2x1ZGVVc2VDb2xvblRhZ0xpc3QnKTtcbiAgICBpZiAoY29uZmlnRXhjbHVkZVVzZUNvbG9uVGFnTGlzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY29uZmlnRXhjbHVkZVVzZUNvbG9uVGFnTGlzdDtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmYXVsdEV4Y2x1ZGVVc2VDb2xvblRhZztcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgY29sdW1ucygpOiBudW1iZXIge1xuICAgIGNvbnN0IHsgY29sdW1ucyB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgaWYgKGlzTnVtYmVyKGNvbHVtbnMpKSB7XG4gICAgICByZXR1cm4gY29sdW1ucztcbiAgICB9XG4gICAgaWYgKGNvbHVtbnMpIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNpdmVDb2x1bW5zID0gdGhpcy5yZXNwb25zaXZlSXRlbXNbMF07XG4gICAgICBpZiAocmVzcG9uc2l2ZUNvbHVtbnMpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNpdmVDb2x1bW5zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdENvbHVtbnM7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGxhYmVsV2lkdGgoKTogTGFiZWxXaWR0aCB7XG4gICAgY29uc3QgeyBsYWJlbFdpZHRoIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAoaXNOdW1iZXIobGFiZWxXaWR0aCkgfHwgaXNBcnJheUxpa2UobGFiZWxXaWR0aCkpIHtcbiAgICAgIHJldHVybiBsYWJlbFdpZHRoO1xuICAgIH1cbiAgICBpZiAobGFiZWxXaWR0aCkge1xuICAgICAgY29uc3QgcmVzcG9uc2l2ZVdpZHRoID0gdGhpcy5yZXNwb25zaXZlSXRlbXNbMV07XG4gICAgICBpZiAocmVzcG9uc2l2ZVdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNpdmVXaWR0aDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRMYWJlbFdpZHRoO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBsYWJlbEFsaWduKCk6IExhYmVsQWxpZ24ge1xuICAgIGNvbnN0IHsgbGFiZWxBbGlnbiB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgY29uc3QgZGVmYXVsdExhYmVsQWxpZ24gPVxuICAgICAgdGhpcy5sYWJlbExheW91dCA9PT0gTGFiZWxMYXlvdXQudmVydGljYWwgPyBMYWJlbEFsaWduLmxlZnQgOiBMYWJlbEFsaWduLnJpZ2h0O1xuICAgIGlmIChpc1N0cmluZyhsYWJlbEFsaWduKSkge1xuICAgICAgcmV0dXJuIGxhYmVsQWxpZ24gYXMgTGFiZWxBbGlnbjtcbiAgICB9XG4gICAgaWYgKGxhYmVsQWxpZ24pIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNpdmVBbGlnbiA9IHRoaXMucmVzcG9uc2l2ZUl0ZW1zWzJdO1xuICAgICAgaWYgKHJlc3BvbnNpdmVBbGlnbikge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2l2ZUFsaWduO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdExhYmVsQWxpZ247XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGxhYmVsTGF5b3V0KCk6IExhYmVsTGF5b3V0IHtcbiAgICBjb25zdCBkZWZhdWx0TGFiZWxMYXlvdXQgPSAoZ2V0Q29uZmlnKCdsYWJlbExheW91dCcpIGFzIExhYmVsTGF5b3V0KSB8fCBMYWJlbExheW91dC5ob3Jpem9udGFsO1xuICAgIGNvbnN0IHsgbGFiZWxMYXlvdXQgfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIGlmIChpc1N0cmluZyhsYWJlbExheW91dCkpIHtcbiAgICAgIHJldHVybiBsYWJlbExheW91dCBhcyBMYWJlbExheW91dDtcbiAgICB9XG4gICAgaWYgKGxhYmVsTGF5b3V0KSB7XG4gICAgICBjb25zdCByZXNwb25zaXZlTGFiZWxMYXlvdXQgPSB0aGlzLnJlc3BvbnNpdmVJdGVtc1szXTtcbiAgICAgIGlmIChyZXNwb25zaXZlTGFiZWxMYXlvdXQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNpdmVMYWJlbExheW91dDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRMYWJlbExheW91dDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcHJpc3RpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLnByaXN0aW5lO1xuICB9XG5cbiAgaXNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gc3VwZXIuaXNEaXNhYmxlZCgpIHx8IHRoaXMuY29udGV4dC5kaXNhYmxlZDtcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhU2V0OiAnZGF0YVNldCcgaW4gcHJvcHMgPyBwcm9wcy5kYXRhU2V0IDogY29udGV4dC5kYXRhU2V0LFxuICAgICAgcmVjb3JkOiAncmVjb3JkJyBpbiBwcm9wcyA/IHByb3BzLnJlY29yZCA6IGNvbnRleHQucmVjb3JkLFxuICAgICAgZGF0YUluZGV4OiBkZWZhdWx0VG8ocHJvcHMuZGF0YUluZGV4LCBjb250ZXh0LmRhdGFJbmRleCksXG4gICAgICBsYWJlbExheW91dDogJ2xhYmVsTGF5b3V0JyBpbiBwcm9wcyA/IHByb3BzLmxhYmVsTGF5b3V0IDogY29udGV4dC5sYWJlbExheW91dCxcbiAgICAgIGxhYmVsQWxpZ246ICdsYWJlbEFsaWduJyBpbiBwcm9wcyA/IHByb3BzLmxhYmVsQWxpZ24gOiBjb250ZXh0LmxhYmVsQWxpZ24sXG4gICAgICBsYWJlbFdpZHRoOiBkZWZhdWx0VG8ocHJvcHMubGFiZWxXaWR0aCwgY29udGV4dC5sYWJlbFdpZHRoKSxcbiAgICAgIHByaXN0aW5lOiAncHJpc3RpbmUnIGluIHByb3BzID8gcHJvcHMucHJpc3RpbmUgOiBjb250ZXh0LnByaXN0aW5lLFxuICAgICAgY29sdW1uczogcHJvcHMuY29sdW1ucyxcbiAgICAgIHVzZUNvbG9uOiBwcm9wcy51c2VDb2xvbixcbiAgICAgIGV4Y2x1ZGVVc2VDb2xvblRhZ0xpc3Q6IHByb3BzLmV4Y2x1ZGVVc2VDb2xvblRhZ0xpc3QsXG4gICAgfTtcbiAgfVxuXG4gIGdldE90aGVyUHJvcHMoKSB7XG4gICAgY29uc3Qgb3RoZXJQcm9wcyA9IG9taXQoc3VwZXIuZ2V0T3RoZXJQcm9wcygpLCBbXG4gICAgICAncmVjb3JkJyxcbiAgICAgICdkYXRhSW5kZXgnLFxuICAgICAgJ29uU3VjY2VzcycsXG4gICAgICAnb25FcnJvcicsXG4gICAgICAncHJvY2Vzc1BhcmFtcycsXG4gICAgICAnbGFiZWxXaWR0aCcsXG4gICAgICAnbGFiZWxBbGlnbicsXG4gICAgICAnbGFiZWxMYXlvdXQnLFxuICAgICAgJ2NvbHVtbnMnLFxuICAgICAgJ3ByaXN0aW5lJyxcbiAgICAgICdheGlvcycsXG4gICAgICAndXNlQ29sb24nLFxuICAgICAgJ2V4Y2x1ZGVVc2VDb2xvblRhZ0xpc3QnLFxuICAgIF0pO1xuICAgIG90aGVyUHJvcHMub25TdWJtaXQgPSB0aGlzLmhhbmRsZVN1Ym1pdDtcbiAgICBvdGhlclByb3BzLm9uUmVzZXQgPSB0aGlzLmhhbmRsZVJlc2V0O1xuICAgIGlmICghb3RoZXJQcm9wcy5uYW1lKSB7XG4gICAgICBvdGhlclByb3BzLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgfVxuICAgIHJldHVybiBvdGhlclByb3BzO1xuICB9XG5cbiAgZ2V0SGVhZGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHM6IHsgaGVhZGVyIH0sXG4gICAgICBwcmVmaXhDbHMsXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKGhlYWRlcikge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9XCJmb3JtLWhlYWRlclwiIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1oZWFkZXJgfT5cbiAgICAgICAgICB7aGVhZGVyfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2xhc3NOYW1lKC4uLnByb3BzKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHByZWZpeENscywgbGFiZWxMYXlvdXQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIHN1cGVyLmdldENsYXNzTmFtZSh7XG4gICAgICAuLi5wcm9wcyxcbiAgICAgIFtgJHtwcmVmaXhDbHN9LWZsb2F0LWxhYmVsYF06IGxhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC5mbG9hdCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLnByb2Nlc3NEYXRhU2V0TGlzdGVuZXIodHJ1ZSk7XG4gIH1cblxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucHJvY2Vzc0RhdGFTZXRMaXN0ZW5lcihmYWxzZSk7XG4gIH1cblxuICBwcm9jZXNzRGF0YVNldExpc3RlbmVyKGZsYWc6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSBmbGFnID8gZGF0YVNldC5hZGRFdmVudExpc3RlbmVyIDogZGF0YVNldC5yZW1vdmVFdmVudExpc3RlbmVyO1xuICAgICAgaGFuZGxlci5jYWxsKGRhdGFTZXQsICd2YWxpZGF0ZScsIHRoaXMuaGFuZGxlRGF0YVNldFZhbGlkYXRlKTtcbiAgICB9XG4gIH1cblxuICAvLyDlpITnkIbmoKHpqozlpLHotKXlrprkvY1cbiAgQGF1dG9iaW5kXG4gIGFzeW5jIGhhbmRsZURhdGFTZXRWYWxpZGF0ZSh7IHJlc3VsdCB9KSB7XG4gICAgaWYgKCFhd2FpdCByZXN1bHQpIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmVsZW1lbnQgPyBmaW5kRmlyc3RJbnZhbGlkRWxlbWVudCh0aGlzLmVsZW1lbnQpIDogbnVsbDtcbiAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGl0ZW0uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByYXN0ZXJpemVkQ2hpbGRyZW4oKSB7XG4gICAgY29uc3Qge1xuICAgICAgZGF0YVNldCxcbiAgICAgIHJlY29yZCxcbiAgICAgIGNvbHVtbnMsXG4gICAgICBsYWJlbExheW91dCxcbiAgICAgIGxhYmVsQWxpZ24sXG4gICAgICB1c2VDb2xvbixcbiAgICAgIGV4Y2x1ZGVVc2VDb2xvblRhZ0xpc3QsXG4gICAgICBwcm9wczogeyBjaGlsZHJlbiB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHByZWZpeENscyA9IGdldFByb1ByZWZpeENscyhGSUVMRF9TVUZGSVgpO1xuICAgIGNvbnN0IGxhYmVsV2lkdGggPSBub3JtYWxpemVMYWJlbFdpZHRoKHRoaXMubGFiZWxXaWR0aCwgY29sdW1ucyk7XG4gICAgY29uc3Qgcm93czogUmVhY3RFbGVtZW50PGFueT5bXSA9IFtdO1xuICAgIGxldCBjb2xzOiBSZWFjdEVsZW1lbnQ8YW55PltdID0gW107XG4gICAgbGV0IHJvd0luZGV4ID0gMDtcbiAgICBsZXQgY29sSW5kZXggPSAwO1xuICAgIGNvbnN0IG1hdHJpeDogKGJvb2xlYW4gfCB1bmRlZmluZWQpW11bXSA9IFtbXV07XG4gICAgbGV0IG5vTGFiZWwgPSB0cnVlO1xuICAgIGNvbnN0IGNoaWxkcmVuQXJyYXk6IFJlYWN0RWxlbWVudDxhbnk+W10gPSBbXTtcbiAgICBDaGlsZHJlbi5mb3JFYWNoKGNoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgICBpZiAoaXNWYWxpZEVsZW1lbnQoY2hpbGQpKSB7XG4gICAgICAgIGNvbnN0IHNldENoaWxkID0gKGFyciwgb3V0Q2hpbGQsIGdyb3VwUHJvcHMgPSB7fSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIG5vTGFiZWwgPT09IHRydWUgJiZcbiAgICAgICAgICAgIGxhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC5ob3Jpem9udGFsICYmXG4gICAgICAgICAgICBnZXRQcm9wZXJ0eShvdXRDaGlsZC5wcm9wcywgJ2xhYmVsJywgZGF0YVNldCwgcmVjb3JkKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgbm9MYWJlbCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIW91dENoaWxkPy50eXBlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvdXRDaGlsZD8udHlwZSAmJiAob3V0Q2hpbGQudHlwZSBhcyBhbnkpLmRpc3BsYXlOYW1lID09PSAnRm9ybVZpcnR1YWxHcm91cCcpIHtcbiAgICAgICAgICAgIGlmICghb3V0Q2hpbGQucHJvcHMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXJyYXkob3V0Q2hpbGQucHJvcHMuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgIG91dENoaWxkLnByb3BzLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRDaGlsZChhcnIsIGMsIG9taXQob3V0Q2hpbGQucHJvcHMsIFsnY2hpbGRyZW4nXSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3V0Q2hpbGQ/LnR5cGUgJiYgKG91dENoaWxkLnR5cGUgYXMgYW55KS5kaXNwbGF5TmFtZSA9PT0gJ0Zvcm1WaXJ0dWFsR3JvdXAnKSB7XG4gICAgICAgICAgICAgIHNldENoaWxkKGFyciwgb3V0Q2hpbGQucHJvcHMuY2hpbGRyZW4sIG9taXQob3V0Q2hpbGQucHJvcHMsIFsnY2hpbGRyZW4nXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXJyLnB1c2goY2xvbmVFbGVtZW50KG91dENoaWxkLnByb3BzLmNoaWxkcmVuLCB7XG4gICAgICAgICAgICAgICAgLi4uZ3JvdXBQcm9wcyxcbiAgICAgICAgICAgICAgICAuLi5vdXRDaGlsZC5wcm9wcy5jaGlsZHJlbi5wcm9wcyxcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnIucHVzaChjbG9uZUVsZW1lbnQob3V0Q2hpbGQsIHtcbiAgICAgICAgICAgICAgLi4uZ3JvdXBQcm9wcyxcbiAgICAgICAgICAgICAgLi4ub3V0Q2hpbGQucHJvcHMsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZXRDaGlsZChjaGlsZHJlbkFycmF5LCBjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZUxpbmUoKSB7XG4gICAgICBpZiAoY29scy5sZW5ndGgpIHtcbiAgICAgICAgcm93cy5wdXNoKCg8dHIga2V5PXtgcm93LSR7cm93SW5kZXh9YH0+e2NvbHN9PC90cj4pKTtcbiAgICAgICAgY29scyA9IFtdO1xuICAgICAgfVxuICAgICAgcm93SW5kZXgrKztcbiAgICAgIGNvbEluZGV4ID0gMDtcbiAgICAgIG1hdHJpeFtyb3dJbmRleF0gPSBtYXRyaXhbcm93SW5kZXhdIHx8IFtdO1xuICAgIH1cblxuICAgIGZvciAobGV0IGluZGV4ID0gMCwgbGVuID0gY2hpbGRyZW5BcnJheS5sZW5ndGg7IGluZGV4IDwgbGVuOykge1xuICAgICAgY29uc3QgeyBwcm9wcywga2V5LCB0eXBlIH0gPSBjaGlsZHJlbkFycmF5W2luZGV4XTtcblxuICAgICAgbGV0IFRhZ05hbWUgPSB0eXBlO1xuICAgICAgaWYgKGlzRnVuY3Rpb24odHlwZSkpIHtcbiAgICAgICAgVGFnTmFtZSA9ICh0eXBlIGFzIGFueSkuZGlzcGxheU5hbWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGxhYmVsID0gZ2V0UHJvcGVydHkocHJvcHMsICdsYWJlbCcsIGRhdGFTZXQsIHJlY29yZCk7XG4gICAgICBjb25zdCBmaWVsZExhYmVsV2lkdGggPSBnZXRQcm9wZXJ0eShwcm9wcywgJ2xhYmVsV2lkdGgnLCBkYXRhU2V0LCByZWNvcmQpO1xuICAgICAgY29uc3QgcmVxdWlyZWQgPSBnZXRQcm9wZXJ0eShwcm9wcywgJ3JlcXVpcmVkJywgZGF0YVNldCwgcmVjb3JkKTtcbiAgICAgIGNvbnN0IHJlYWRPbmx5ID0gZ2V0UHJvcGVydHkocHJvcHMsICdyZWFkT25seScsIGRhdGFTZXQsIHJlY29yZCk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHJvd1NwYW4gPSAxLFxuICAgICAgICBjb2xTcGFuID0gMSxcbiAgICAgICAgbmV3TGluZSxcbiAgICAgICAgY2xhc3NOYW1lLFxuICAgICAgICBwbGFjZWhvbGRlcixcbiAgICAgICAgLi4ub3RoZXJQcm9wc1xuICAgICAgfSA9IHByb3BzIGFzIGFueTtcbiAgICAgIGxldCBuZXdDb2xTcGFuID0gY29sU3BhbjtcbiAgICAgIGNvbnN0IGN1cnJlbnRSb3cgPSBtYXRyaXhbcm93SW5kZXhdO1xuICAgICAgaWYgKG5ld0xpbmUpIHtcbiAgICAgICAgaWYgKGNvbEluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgY29tcGxldGVMaW5lKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlIChjdXJyZW50Um93W2NvbEluZGV4XSkge1xuICAgICAgICBjb2xJbmRleCsrO1xuICAgICAgfVxuICAgICAgaWYgKGNvbEluZGV4ID49IGNvbHVtbnMpIHtcbiAgICAgICAgY29tcGxldGVMaW5lKCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKG5ld0NvbFNwYW4gKyBjb2xJbmRleCA+IGNvbHVtbnMpIHtcbiAgICAgICAgbmV3Q29sU3BhbiA9IGNvbHVtbnMgLSBjb2xJbmRleDtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGkgPSBjb2xJbmRleCwgayA9IGNvbEluZGV4ICsgbmV3Q29sU3BhbjsgaSA8IGs7IGkrKykge1xuICAgICAgICBpZiAoY3VycmVudFJvd1tpXSkge1xuICAgICAgICAgIG5ld0NvbFNwYW4gPSBpIC0gY29sSW5kZXg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGkgPSByb3dJbmRleDsgaSA8IHJvd1NwYW4gKyByb3dJbmRleDsgaSsrKSB7XG4gICAgICAgIGZvciAobGV0IGogPSBjb2xJbmRleCwgayA9IG5ld0NvbFNwYW4gKyBjb2xJbmRleDsgaiA8IGs7IGorKykge1xuICAgICAgICAgIGlmICghbWF0cml4W2ldKSB7XG4gICAgICAgICAgICBtYXRyaXhbaV0gPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWF0cml4W2ldW2pdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgaXNPdXRwdXQgPVxuICAgICAgICBsYWJlbExheW91dCA9PT0gTGFiZWxMYXlvdXQuaG9yaXpvbnRhbCAmJiAodHlwZSBhcyBhbnkpLmRpc3BsYXlOYW1lID09PSAnT3V0cHV0JztcbiAgICAgIGNvbnN0IGxhYmVsQ2xhc3NOYW1lID0gY2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LWxhYmVsYCwgYCR7cHJlZml4Q2xzfS1sYWJlbC0ke2xhYmVsQWxpZ259YCwge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS1yZXF1aXJlZGBdOiByZXF1aXJlZCxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tcmVhZG9ubHlgXTogcmVhZE9ubHksXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWxhYmVsLXZlcnRpY2FsYF06IGxhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC52ZXJ0aWNhbCxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tbGFiZWwtb3V0cHV0YF06IGlzT3V0cHV0LFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1sYWJlbC11c2VDb2xvbmBdOiB1c2VDb2xvbiAmJiAhZXhjbHVkZVVzZUNvbG9uVGFnTGlzdC5maW5kKHYgPT4gdiA9PT0gVGFnTmFtZSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHdyYXBwZXJDbGFzc05hbWUgPSBjbGFzc05hbWVzKGAke3ByZWZpeENsc30td3JhcHBlcmAsIHtcbiAgICAgICAgW2Ake3ByZWZpeENsc30tb3V0cHV0YF06IGlzT3V0cHV0LFxuICAgICAgfSk7XG4gICAgICBpZiAoIW5vTGFiZWwpIHtcbiAgICAgICAgaWYgKCFpc05hTihmaWVsZExhYmVsV2lkdGgpKSB7XG4gICAgICAgICAgbGFiZWxXaWR0aFtjb2xJbmRleF0gPSBNYXRoLm1heChsYWJlbFdpZHRoW2NvbEluZGV4XSwgZmllbGRMYWJlbFdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICBjb2xzLnB1c2goXG4gICAgICAgICAgPHRkXG4gICAgICAgICAgICBrZXk9e2Byb3ctJHtyb3dJbmRleH0tY29sLSR7Y29sSW5kZXh9LWxhYmVsYH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17bGFiZWxDbGFzc05hbWV9XG4gICAgICAgICAgICByb3dTcGFuPXtyb3dTcGFufVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxsYWJlbCB0aXRsZT17aXNTdHJpbmcobGFiZWwpID8gbGFiZWwgOiAnJ30+XG4gICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L3RkPixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpZWxkRWxlbWVudFByb3BzOiBhbnkgPSB7XG4gICAgICAgIGtleSxcbiAgICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWVzKHByZWZpeENscywgY2xhc3NOYW1lKSxcbiAgICAgICAgcGxhY2Vob2xkZXI6IGxhYmVsICYmIGxhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC5wbGFjZWhvbGRlciA/IGxhYmVsIDogcGxhY2Vob2xkZXIsXG4gICAgICAgIC4uLm90aGVyUHJvcHMsXG4gICAgICB9O1xuICAgICAgaWYgKCFpc1N0cmluZyh0eXBlKSkge1xuICAgICAgICBmaWVsZEVsZW1lbnRQcm9wcy5yb3dJbmRleCA9IHJvd0luZGV4O1xuICAgICAgICBmaWVsZEVsZW1lbnRQcm9wcy5jb2xJbmRleCA9IGNvbEluZGV4O1xuICAgICAgfVxuICAgICAgY29scy5wdXNoKFxuICAgICAgICA8dGRcbiAgICAgICAgICBrZXk9e2Byb3ctJHtyb3dJbmRleH0tY29sLSR7Y29sSW5kZXh9LWZpZWxkYH1cbiAgICAgICAgICBjb2xTcGFuPXtub0xhYmVsID8gbmV3Q29sU3BhbiA6IG5ld0NvbFNwYW4gKiAyIC0gMX1cbiAgICAgICAgICByb3dTcGFuPXtyb3dTcGFufVxuICAgICAgICA+XG4gICAgICAgICAge2xhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC52ZXJ0aWNhbCAmJiAoXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPXtsYWJlbENsYXNzTmFtZX0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17d3JhcHBlckNsYXNzTmFtZX0+e2NyZWF0ZUVsZW1lbnQodHlwZSwgZmllbGRFbGVtZW50UHJvcHMpfTwvZGl2PlxuICAgICAgICA8L3RkPixcbiAgICAgICk7XG4gICAgICBpZiAoaW5kZXggPT09IGxlbiAtIDEpIHtcbiAgICAgICAgY29tcGxldGVMaW5lKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xJbmRleCsrO1xuICAgICAgfVxuICAgICAgaW5kZXgrKztcbiAgICB9XG4gICAgY29scyA9IFtdO1xuICAgIGlmICghbm9MYWJlbCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2x1bW5zOyBpKyspIHtcbiAgICAgICAgY29scy5wdXNoKFxuICAgICAgICAgIDxjb2wga2V5PXtgbGFiZWwtJHtpfWB9IHN0eWxlPXt7IHdpZHRoOiBweFRvUmVtKGxhYmVsV2lkdGhbaSAlIGNvbHVtbnNdKSB9fSAvPixcbiAgICAgICAgICA8Y29sIGtleT17YHdyYXBwZXItJHtpfWB9IC8+LFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnM7IGkrKykge1xuICAgICAgICBjb2xzLnB1c2goXG4gICAgICAgICAgPGNvbCBrZXk9e2B3cmFwcGVyLSR7aX1gfSAvPixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHRoaXMuZ2V0SGVhZGVyKCksXG4gICAgICAoPHRhYmxlIGtleT1cImZvcm0tYm9keVwiPlxuICAgICAgICB7Y29scy5sZW5ndGggPyA8Y29sZ3JvdXA+e2NvbHN9PC9jb2xncm91cD4gOiB1bmRlZmluZWR9XG4gICAgICAgIDx0Ym9keT57cm93c308L3Rib2R5PlxuICAgICAgPC90YWJsZT4pLFxuICAgIF07XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgbGFiZWxXaWR0aCxcbiAgICAgIGxhYmVsQWxpZ24sXG4gICAgICBsYWJlbExheW91dCxcbiAgICAgIHByaXN0aW5lLFxuICAgICAgZGF0YVNldCxcbiAgICAgIHJlY29yZCxcbiAgICAgIGRhdGFJbmRleCxcbiAgICAgIG9ic2VydmFibGVQcm9wcyxcbiAgICB9ID0gdGhpcztcbiAgICBjb25zdCB7IGZvcm1Ob2RlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgdmFsdWUgPSB7XG4gICAgICBmb3JtTm9kZTogZm9ybU5vZGUgfHwgdGhpcyxcbiAgICAgIGRhdGFTZXQsXG4gICAgICBkYXRhSW5kZXgsXG4gICAgICByZWNvcmQsXG4gICAgICBsYWJlbFdpZHRoLFxuICAgICAgbGFiZWxBbGlnbixcbiAgICAgIGxhYmVsTGF5b3V0LFxuICAgICAgcHJpc3RpbmUsXG4gICAgICBkaXNhYmxlZDogdGhpcy5pc0Rpc2FibGVkKCksXG4gICAgfTtcbiAgICBsZXQgY2hpbGRyZW46IFJlYWN0Tm9kZSA9IHRoaXMucmFzdGVyaXplZENoaWxkcmVuKCk7XG4gICAgaWYgKCFmb3JtTm9kZSkge1xuICAgICAgY2hpbGRyZW4gPSAoXG4gICAgICAgIDxmb3JtIHsuLi50aGlzLmdldE1lcmdlZFByb3BzKCl9IG5vVmFsaWRhdGU+XG4gICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L2Zvcm0+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFJlc3BvbnNpdmVcbiAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICBvYnNlcnZhYmxlUHJvcHMuY29sdW1ucyxcbiAgICAgICAgICBvYnNlcnZhYmxlUHJvcHMubGFiZWxXaWR0aCxcbiAgICAgICAgICBvYnNlcnZhYmxlUHJvcHMubGFiZWxBbGlnbixcbiAgICAgICAgICBvYnNlcnZhYmxlUHJvcHMubGFiZWxMYXlvdXQsXG4gICAgICAgIF19XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZVJlc3BvbnNpdmV9XG4gICAgICA+XG4gICAgICAgIDxGb3JtQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PntjaGlsZHJlbn08L0Zvcm1Db250ZXh0LlByb3ZpZGVyPlxuICAgICAgPC9SZXNwb25zaXZlPlxuICAgICk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgQG1vYnhBY3Rpb25cbiAgaGFuZGxlUmVzcG9uc2l2ZShpdGVtcykge1xuICAgIHRoaXMucmVzcG9uc2l2ZUl0ZW1zID0gaXRlbXM7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgYXN5bmMgaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5wZXJzaXN0KCk7XG4gICAgaWYgKGF3YWl0IHRoaXMuY2hlY2tWYWxpZGl0eSgpKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgYWN0aW9uLFxuICAgICAgICBkYXRhU2V0LFxuICAgICAgICBtZXRob2QsXG4gICAgICAgIHByb2Nlc3NQYXJhbXMgPSBub29wLFxuICAgICAgICBvblN1Y2Nlc3MgPSBub29wLFxuICAgICAgICBvbkVycm9yID0gbm9vcCxcbiAgICAgICAgb25TdWJtaXQgPSBub29wLFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gICAgICBvblN1Ym1pdChlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgICAgb25TdWNjZXNzKGF3YWl0IGRhdGFTZXQuc3VibWl0KCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbikge1xuICAgICAgICAgIGlmICh0YXJnZXQgJiYgdGhpcy5lbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3VibWl0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9uU3VjY2Vzcyhhd2FpdCB0aGlzLmF4aW9zW21ldGhvZCB8fCAnZ2V0J10oYWN0aW9uLCBwcm9jZXNzUGFyYW1zKGUpKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBvbkVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUmVzZXQoZSkge1xuICAgIGNvbnN0IHsgb25SZXNldCA9IG5vb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyByZWNvcmQgfSA9IHRoaXM7XG4gICAgb25SZXNldChlKTtcbiAgICBpZiAoIWUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgcmVjb3JkLnJlc2V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdldEZpZWxkcygpLmZvckVhY2goZmllbGQgPT4gZmllbGQucmVzZXQoKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2hlY2tWYWxpZGl0eSgpIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGlmICghZGF0YVNldC5sZW5ndGgpIHtcbiAgICAgICAgZGF0YVNldC5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhU2V0LnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmdldEZpZWxkcygpLm1hcChmaWVsZCA9PiBmaWVsZC5jaGVja1ZhbGlkaXR5KCkpKS50aGVuKHJlc3VsdHMgPT5cbiAgICAgIHJlc3VsdHMuZXZlcnkocmVzdWx0ID0+IHJlc3VsdCksXG4gICAgKTtcbiAgfVxuXG4gIGdldEZpZWxkcygpOiBGb3JtRmllbGQ8Rm9ybUZpZWxkUHJvcHM+W10ge1xuICAgIGNvbnN0IHsgaWQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGlkKSB7XG4gICAgICByZXR1cm4gKFtdIGFzIEZvcm1GaWVsZDxGb3JtRmllbGRQcm9wcz5bXSkuY29uY2F0KHRoaXMuZmllbGRzLCBnZXRGaWVsZHNCeUlkKGlkKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpZWxkcztcbiAgfVxuXG4gIGdldEZpZWxkKG5hbWU6IHN0cmluZyk6IEZvcm1GaWVsZDxGb3JtRmllbGRQcm9wcz4gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmdldEZpZWxkcygpLmZpbmQoZmllbGQgPT4gZmllbGQucHJvcHMubmFtZSA9PT0gbmFtZSk7XG4gIH1cblxuICBhZGRGaWVsZChmaWVsZDogRm9ybUZpZWxkPEZvcm1GaWVsZFByb3BzPikge1xuICAgIHRoaXMuZmllbGRzLnB1c2goZmllbGQpO1xuICB9XG5cbiAgcmVtb3ZlRmllbGQoZmllbGQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZmllbGRzLmluZGV4T2YoZmllbGQpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuZmllbGRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG59XG4iXSwidmVyc2lvbiI6M30=