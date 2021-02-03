import { __decorate } from "tslib";
import Map from 'core-js/library/fn/map';
import React, { cloneElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import isLdEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import { isMoment } from 'moment';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import Row from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import autobind from '../_util/autobind';
import Validator from '../validator/Validator';
import FormContext from '../form/FormContext';
import DataSetComponent from '../data-set/DataSetComponent';
import Icon from '../icon';
import Tooltip from '../tooltip';
import isEmpty from '../_util/isEmpty';
import { FIELD_SUFFIX } from '../form/utils';
import Animate from '../animate';
import CloseButton from './CloseButton';
import { fromRangeValue, getDateFormatByField, toMultipleValue, toRangeValue } from './utils';
import isSame from '../_util/isSame';
import formatString from '../formatter/formatString';
const map = {};
export function getFieldsById(id) {
    if (!map[id]) {
        map[id] = [];
    }
    return map[id];
}
export class FormField extends DataSetComponent {
    constructor() {
        super(...arguments);
        this.emptyValue = null;
        this.lock = false;
    }
    get validator() {
        const { field } = this;
        if (field) {
            return field.validator;
        }
        return new Validator(undefined, this);
    }
    get name() {
        return this.observableProps.name;
    }
    get value() {
        return this.observableProps.value;
    }
    set value(value) {
        runInAction(() => {
            this.observableProps.value = value;
        });
    }
    get labelLayout() {
        return this.props.labelLayout || this.context.labelLayout;
    }
    get hasFloatLabel() {
        const { labelLayout } = this;
        return labelLayout === "float" /* float */;
    }
    get isControlled() {
        return this.props.value !== undefined;
    }
    get pristine() {
        return this.props.pristine || this.context.pristine;
    }
    get defaultValidationMessages() {
        return {};
    }
    // @computed
    get editable() {
        return !this.isDisabled() && !this.isReadOnly();
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
    get field() {
        const { record, dataSet, name, observableProps } = this;
        const { displayName } = this.constructor;
        if (displayName !== 'Output' && !name) {
            warning(!observableProps.dataSet, `${displayName} with binding DataSet need property name.`);
            warning(!observableProps.record, `${displayName} with binding Record need property name.`);
        }
        if (name) {
            const recordField = record ? record.getField(name) : undefined;
            const dsField = dataSet ? dataSet.getField(name) : undefined;
            if (recordField) {
                return recordField;
            }
            return dsField;
        }
        return undefined;
    }
    get isValid() {
        return this.pristine || (this.field ? this.field.valid : this.validator.validity.valid);
    }
    get multiple() {
        return this.getProp('multiple');
    }
    /**
     * 获取字段多行属性
     */
    get multiLine() {
        return this.getProp('multiLine');
    }
    get trim() {
        return this.getProp('trim');
    }
    get format() {
        return this.getProp('format');
    }
    get range() {
        return this.getProp('range');
    }
    defaultRenderer({ text, repeat, maxTagTextLength }) {
        return repeat !== undefined &&
            maxTagTextLength &&
            isString(text) &&
            text.length > maxTagTextLength
            ? `${text.slice(0, maxTagTextLength)}...`
            : text;
    }
    /**
     * 处理多行关联字段校验
     * @param field
     */
    multiLineValidator(field) {
        if (field) {
            return field.validator;
        }
        return new Validator(undefined, this);
    }
    /**
     * 判断是否应该显示验证信息, 作为属性传给Tooltip
     *
     * @readonly
     * @type {(undefined | boolean)}
     * @memberof FormField
     */
    isValidationMessageHidden(message) {
        const { hidden, noValidate } = this.props;
        if (hidden || this.pristine || (!this.record && noValidate) || !message) {
            return true;
        }
    }
    isEmpty() {
        const value = this.getValue();
        return isArrayLike(value) ? !value.length : isEmpty(value);
    }
    getObservableProps(props, context) {
        return {
            name: props.name,
            record: 'record' in props ? props.record : context.record,
            dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
            dataIndex: defaultTo(props.dataIndex, context.dataIndex),
            value: this.observableProps || 'value' in props ? props.value : props.defaultValue,
        };
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'record',
            'defaultValue',
            'dataIndex',
            'onEnterDown',
            'onClear',
            'readOnly',
            'validator',
            'validationRenderer',
            'help',
            'showHelp',
            'renderer',
            'maxTagPlaceholder',
            'maxTagCount',
            'maxTagTextLength',
            'rowIndex',
            'colIndex',
            'labelLayout',
            '_inTable',
            'labelWidth',
            'pristine',
            'range',
            'trim',
        ]);
        otherProps.onChange = !this.isDisabled() && !this.isReadOnly() ? this.handleChange : noop;
        otherProps.onKeyDown = this.handleKeyDown;
        otherProps.onCompositionStart = this.handleCompositionStart;
        otherProps.onCompositionEnd = this.handleChange;
        return otherProps;
    }
    getWrapperClassNames(...args) {
        const { prefixCls } = this;
        return super.getWrapperClassNames({
            [`${prefixCls}-invalid`]: !this.isValid,
            [`${prefixCls}-float-label`]: this.hasFloatLabel,
            [`${prefixCls}-required`]: this.getProp('required'),
            [`${prefixCls}-readonly`]: this.getProp('readOnly'),
        }, ...args);
    }
    renderWrapper() {
        return undefined;
    }
    renderHelpMessage() {
        const { showHelp } = this.props;
        const help = this.getProp('help');
        if (showHelp === "newLine" /* newLine */ && help) {
            return (React.createElement("div", { key: "help", className: `${getProPrefixCls(FIELD_SUFFIX)}-help` }, help));
        }
    }
    getLabel() {
        return this.getProp('label');
    }
    renderFloatLabel() {
        if (this.hasFloatLabel) {
            const label = this.getLabel();
            if (label) {
                const prefixCls = getProPrefixCls(FIELD_SUFFIX);
                const required = this.getProp('required');
                const readOnly = this.getProp('readOnly');
                const classString = classNames(`${prefixCls}-label`, {
                    [`${prefixCls}-required`]: required,
                    [`${prefixCls}-readonly`]: readOnly,
                });
                return (React.createElement("div", { className: `${prefixCls}-label-wrapper` },
                    React.createElement("div", { className: classString }, label)));
            }
        }
    }
    componentDidMount() {
        this.addToForm(this.props, this.context);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        super.componentWillReceiveProps(nextProps, nextContext);
        this.removeFromForm(this.props, this.context);
        this.addToForm(nextProps, nextContext);
        if (!this.record && this.props.value !== nextProps.value) {
            this.validate(nextProps.value);
        }
    }
    componentWillUnmount() {
        this.removeFromForm(this.props, this.context);
    }
    addToForm(props, context) {
        const { form } = props;
        const { formNode } = context;
        if (form) {
            let fields = map[form];
            if (!fields) {
                fields = [];
                map[form] = fields;
            }
            fields.push(this);
        }
        else if (formNode) {
            formNode.addField(this);
        }
    }
    removeFromForm(props, context) {
        const { form } = props;
        const { formNode } = context;
        if (form) {
            const fields = map[form];
            if (fields) {
                const index = fields.indexOf(this);
                if (index !== -1) {
                    fields.splice(index, 1);
                }
            }
        }
        else if (formNode) {
            formNode.removeField(this);
        }
    }
    renderValidationMessage(validationResult) {
        const validationMessage = this.getValidationMessage(validationResult);
        if (validationMessage) {
            return (React.createElement("div", { className: getProPrefixCls('validation-message') },
                this.context.labelLayout !== "float" /* float */ && React.createElement(Icon, { type: "error" }),
                React.createElement("span", null, validationMessage)));
        }
    }
    getValidatorProps() {
        const { name, range, multiple, defaultValidationMessages } = this;
        const type = this.getFieldType();
        const required = this.getProp('required');
        const customValidator = this.getProp('validator');
        const label = this.getProp('label');
        return {
            type,
            required,
            customValidator,
            name,
            label,
            range,
            multiple,
            defaultValidationMessages,
            form: this.context.formNode,
        };
    }
    getValidationMessage(validationResult = this.validator.currentValidationResult) {
        const { validator, props: { validationRenderer }, } = this;
        if (validationResult) {
            if (validationRenderer) {
                const validationMessage = validationRenderer(validationResult, validator.props);
                if (validationMessage) {
                    return validationMessage;
                }
            }
            return validationResult.validationMessage;
        }
    }
    handleFocus(e) {
        super.handleFocus(e);
        if (this.range) {
            this.beginRange();
        }
    }
    handleBlur(e) {
        super.handleBlur(e);
        if (this.range) {
            this.endRange();
        }
    }
    handleCompositionStart() {
        this.lock = true;
    }
    handleChange(e) {
        this.lock = false;
        e.preventDefault();
        e.stopPropagation();
    }
    handleKeyDown(e) {
        const { onKeyDown = noop, onEnterDown = noop } = this.props;
        onKeyDown(e);
        if (!e.isDefaultPrevented()) {
            switch (e.keyCode) {
                case KeyCode.ENTER:
                    this.handleEnterDown(e);
                    onEnterDown(e);
                    break;
                case KeyCode.ESC:
                    this.blur();
                    break;
                default:
            }
        }
    }
    handleEnterDown(e) {
        if (this.multiple) {
            if (this.range) {
                this.endRange();
                e.preventDefault();
            }
            else {
                const { value } = e.target;
                if (value !== '') {
                    this.syncValueOnBlur(value);
                    e.preventDefault();
                }
            }
        }
        else {
            this.blur();
        }
    }
    syncValueOnBlur(value) {
        this.prepareSetValue(value);
    }
    handleMutipleValueRemove(e, value, index) {
        this.removeValue(value, index);
        e.stopPropagation();
    }
    getDateFormat() {
        return getDateFormatByField(this.field, this.getFieldType());
    }
    processValue(value) {
        if (!isNil(value)) {
            if (isMoment(value)) {
                return value.format(this.getDateFormat());
            }
            return value.toString();
        }
        return '';
    }
    isReadOnly() {
        return (this.getProp('readOnly') ||
            this.pristine ||
            (this.isControlled && !this.props.onChange));
    }
    getDataSetValue() {
        const { record, pristine, name } = this;
        if (record) {
            return pristine ? record.getPristineValue(name) : record.get(name);
        }
    }
    getTextNode() {
        const text = this.isFocused && this.editable
            ? this.processValue(this.getValue())
            : this.processRenderer(this.getValue());
        return text;
    }
    getText(value) {
        return this.processValue(value);
    }
    processText(value) {
        return value;
    }
    processRenderer(value, repeat) {
        const { record, dataSet, props: { renderer = this.defaultRenderer, name, maxTagTextLength }, } = this;
        const text = this.processText(this.getText(value));
        return renderer
            ? renderer({
                value,
                text,
                record,
                dataSet,
                name,
                repeat,
                maxTagTextLength,
            })
            : text;
    }
    processRangeValue(value, repeat) {
        if (repeat === undefined) {
            value = this.rangeValue;
        }
        if (value === undefined && !this.multiple) {
            value = toRangeValue(this.getValue(), this.range);
        }
        return (value || []).map(item => this.processRenderer(item, repeat));
    }
    /**
     * 处理获取多行编辑关联字段
     */
    processMultipleLineValue() {
        const { record, props: { name }, dataSet, } = this;
        return dataSet?.props.fields?.map(field => {
            if (field.bind && field.bind.split('.')[0] === name) {
                return record?.getField(field.name) || dataSet?.getField(field.name);
            }
        }) || [];
    }
    getOldValue() {
        return this.getValue();
    }
    getValue() {
        const { name } = this;
        if (this.dataSet && name) {
            return this.getDataSetValue();
        }
        return this.value;
    }
    getValues() {
        return toMultipleValue(this.getValue(), this.range);
    }
    addValue(...values) {
        if (this.multiple) {
            const oldValues = this.getValues();
            if (values.length) {
                this.setValue([...oldValues, ...values]);
            }
            else if (!oldValues.length) {
                this.setValue(this.emptyValue);
            }
        }
        else {
            this.setValue(values.pop());
        }
    }
    isLowerRange(_value1, _value2) {
        return false;
    }
    prepareSetValue(...value) {
        const { rangeTarget, range, rangeValue } = this;
        const values = value.filter(item => !isEmpty(item));
        if (range) {
            if (rangeTarget !== undefined && rangeValue) {
                const [start, end] = rangeValue;
                const newValue = values.pop();
                rangeValue[rangeTarget] = newValue;
                if (rangeTarget === 0 && newValue && end && this.isLowerRange(end, newValue)) {
                    rangeValue[rangeTarget] = end;
                    rangeValue[1] = newValue;
                }
                if (rangeTarget === 1 && newValue && start && this.isLowerRange(newValue, start)) {
                    rangeValue[rangeTarget] = start;
                    rangeValue[0] = newValue;
                }
            }
        }
        else {
            this.addValue(...values);
        }
    }
    removeValues(values, index = 0) {
        let repeat;
        this.setValue(values.reduce((oldValues, value) => {
            repeat = 0;
            return oldValues.filter(v => {
                if (this.getValueKey(v) === this.getValueKey(value)) {
                    if (index === -1 || repeat === index) {
                        this.afterRemoveValue(value, repeat++);
                        return false;
                    }
                    repeat++;
                }
                return true;
            });
        }, this.getValues()));
    }
    removeValue(value, index = 0) {
        this.removeValues([value], index);
    }
    afterRemoveValue(_value, _repeat) {
    }
    beginRange() {
        this.setRangeTarget(this.rangeTarget || 0);
        this.rangeValue = this.multiple
            ? [undefined, undefined]
            : toRangeValue(this.getValue(), this.range);
    }
    endRange() {
        if (this.rangeValue) {
            const values = this.rangeValue.slice();
            this.rangeValue = undefined;
            if (!this.multiple || !values.every(isNil)) {
                this.addValue(fromRangeValue(values, this.range));
            }
        }
    }
    setRangeTarget(target) {
        this.rangeTarget = target;
    }
    setValue(value) {
        if (!this.isReadOnly()) {
            if (this.multiple || this.range
                ? isArrayLike(value) && !value.length
                : isNil(value) || value === '') {
                value = this.emptyValue;
            }
            const { name, dataSet, trim, format, observableProps: { dataIndex }, } = this;
            const { onChange = noop } = this.props;
            const { formNode } = this.context;
            const old = this.getOldValue();
            if (dataSet && name) {
                (this.record || dataSet.create({}, dataIndex)).set(name, value);
            }
            else {
                value = formatString(value, {
                    trim,
                    format,
                });
                this.validate(value);
            }
            // 转成实际的数据再进行判断
            if (!isSame(toJS(old), toJS(value))) {
                onChange(value, toJS(old), formNode);
            }
            this.value = value;
        }
    }
    renderRangeValue(readOnly, value, repeat) {
        const rangeValue = this.processRangeValue(value, repeat);
        if (readOnly) {
            if (rangeValue.length) {
                return (React.createElement(React.Fragment, null,
                    rangeValue[0],
                    "~",
                    rangeValue[1]));
            }
        }
    }
    /**
     * 只读模式下多行单元格渲染
     * @param readOnly
     */
    renderMultiLine(readOnly) {
        const multiLineFields = this.processMultipleLineValue();
        const { record, prefixCls } = this;
        if (readOnly) {
            if (multiLineFields.length) {
                return (React.createElement(React.Fragment, null, multiLineFields.map((field, index) => {
                    if (field) {
                        const { validationResults } = this.multiLineValidator(field);
                        const required = defaultTo(field && field.get('required'), this.props['required']);
                        const repeats = new Map();
                        const validationResult = validationResults.find(error => error.value === record?.get(field.get('name')));
                        const validationMessage = validationResult && this.renderValidationMessage(validationResult);
                        const key = this.getValueKey(record?.get(field.get('name')));
                        const repeat = repeats.get(key) || 0;
                        const validationHidden = this.isValidationMessageHidden(validationMessage);
                        const inner = record?.status === "add" /* add */ ? '' :
                            React.createElement("span", { className: `${prefixCls}-multi-value-invalid` }, "ReactDom invalid");
                        const validationInner = validationHidden ? inner : (React.createElement(Tooltip, { suffixCls: `form-tooltip ${getConfig('proPrefixCls')}-tooltip`, key: `${key}-${repeat}`, title: validationMessage, theme: "light", placement: "bottomLeft", hidden: validationHidden }, validationMessage));
                        return (React.createElement(Row, { key: `${record?.index}-multi-${index}`, className: `${prefixCls}-multi` },
                            React.createElement(Col, { span: 8, className: required ? `${prefixCls}-multi-label ${prefixCls}-multi-label-required` : `${prefixCls}-multi-label` }, field.get('label')),
                            React.createElement(Col, { span: 16, className: validationHidden ?
                                    `${prefixCls}-multi-value` :
                                    `${prefixCls}-multi-value ${prefixCls}-multi-value-invalid` }, record?.get(field.get('name')) ?
                                (React.createElement(Tooltip, { suffixCls: `form-tooltip ${getConfig('proPrefixCls')}-tooltip`, key: `${key}-${repeat}`, title: validationMessage, theme: "light", placement: "bottomLeft", hidden: validationHidden }, record?.get(field.get('name')))) : validationInner)));
                    }
                    return null;
                })));
            }
        }
    }
    getValueKey(v) {
        if (isArrayLike(v)) {
            return v.join(',');
        }
        return v;
    }
    renderMultipleValues(readOnly) {
        const values = this.getValues();
        const valueLength = values.length;
        const { prefixCls, range, props: { maxTagCount = valueLength, maxTagPlaceholder }, } = this;
        const { validationResults } = this.validator;
        const repeats = new Map();
        const blockClassName = classNames({
            [`${prefixCls}-multiple-block-disabled`]: this.isDisabled(),
        }, `${prefixCls}-multiple-block`);
        const tags = values.slice(0, maxTagCount).map(v => {
            const key = this.getValueKey(v);
            const repeat = repeats.get(key) || 0;
            const text = range ? this.renderRangeValue(true, v, repeat) : this.processRenderer(v, repeat);
            repeats.set(key, repeat + 1);
            if (!isNil(text)) {
                const validationResult = validationResults.find(error => error.value === v);
                const className = classNames({
                    [`${prefixCls}-multiple-block-invalid`]: validationResult,
                }, blockClassName);
                const validationMessage = validationResult && this.renderValidationMessage(validationResult);
                const closeBtn = !this.isDisabled() && !this.isReadOnly() && (React.createElement(CloseButton, { onClose: this.handleMutipleValueRemove, value: v, index: repeat }));
                const inner = readOnly ? (React.createElement("span", { className: className }, text)) : (React.createElement("li", { className: className },
                    React.createElement("div", null, text),
                    closeBtn));
                return (React.createElement(Tooltip, { suffixCls: `form-tooltip ${getConfig('proPrefixCls')}-tooltip`, key: `${key}-${repeat}`, title: validationMessage, theme: "light", placement: "bottomLeft", hidden: this.isValidationMessageHidden(validationMessage) }, inner));
            }
            return undefined;
        });
        if (valueLength > maxTagCount) {
            let content = `+ ${valueLength - maxTagCount} ...`;
            if (maxTagPlaceholder) {
                const omittedValues = values.slice(maxTagCount, valueLength);
                content =
                    typeof maxTagPlaceholder === 'function'
                        ? maxTagPlaceholder(omittedValues)
                        : maxTagPlaceholder;
            }
            tags.push(React.createElement("li", { key: "maxTagPlaceholder", className: blockClassName },
                React.createElement("div", null, content)));
        }
        return tags;
    }
    clear() {
        const { onClear = noop } = this.props;
        this.setValue(this.emptyValue);
        this.rangeValue = this.isFocused ? [undefined, undefined] : undefined;
        onClear();
    }
    async checkValidity() {
        const { name } = this;
        const valid = await this.validate();
        const { onInvalid = noop } = this.props;
        if (!valid) {
            const { validationResults, validity } = this.validator;
            onInvalid(validationResults, validity, name);
        }
        return valid;
    }
    async validate(value) {
        let invalid = false;
        if (!this.props.noValidate) {
            if (value === undefined) {
                value = this.multiple ? this.getValues() : this.getValue();
            }
            const { validator } = this;
            validator.reset();
            invalid = !(await validator.checkValidity(value));
        }
        return !invalid;
    }
    isDisabled() {
        const { disabled } = this.context;
        if (disabled || this.getProp('disabled')) {
            return true;
        }
        const { field, record } = this;
        if (field) {
            const cascadeMap = field.get('cascadeMap');
            if (cascadeMap &&
                (!record || Object.keys(cascadeMap).some(cascade => {
                    if (isObject(record.get(cascadeMap[cascade]))) {
                        return isLdEmpty(record.get(cascadeMap[cascade]));
                    }
                    return isNil(record.get(cascadeMap[cascade]));
                }))) {
                return true;
            }
        }
        return super.isDisabled();
    }
    reset() {
        if (!this.isControlled && !this.dataSet) {
            this.setValue(this.props.defaultValue);
        }
        this.validator.reset();
    }
    getFieldType() {
        const { field } = this;
        return (field && field.get('type')) || "string" /* string */;
    }
    getProp(propName) {
        const { field } = this;
        return defaultTo(field && field.get(propName), this.props[propName]);
    }
    render() {
        const validationMessage = this.renderValidationMessage();
        const wrapper = this.renderWrapper();
        const help = this.renderHelpMessage();
        const { _inTable } = this.props;
        return this.hasFloatLabel ? ([
            isValidElement(wrapper) && cloneElement(wrapper, { key: 'wrapper' }),
            React.createElement(Animate, { transitionName: "show-error", component: "", transitionAppear: true, key: "validation-message" }, validationMessage),
            help,
        ]) :
            _inTable ?
                React.createElement(React.Fragment, null,
                    wrapper,
                    help)
                : (React.createElement(Tooltip, { suffixCls: `form-tooltip ${getConfig('proPrefixCls')}-tooltip`, title: !!(this.multiple && this.getValues().length) ||
                        this.isValidationMessageHidden(validationMessage)
                        ? null
                        : validationMessage, theme: "light", placement: "bottomLeft" },
                    wrapper,
                    help));
    }
}
FormField.contextType = FormContext;
FormField.propTypes = {
    _inTable: PropTypes.bool,
    type: PropTypes.string,
    /**
     * 字段名
     */
    name: PropTypes.string,
    /**
     * <受控>当前值
     */
    value: PropTypes.any,
    /**
     * 默认值
     */
    defaultValue: PropTypes.any,
    /**
     * 是否必输
     */
    required: PropTypes.bool,
    /**
     * 是否只读
     */
    readOnly: PropTypes.bool,
    /**
     * 对照表单id
     */
    form: PropTypes.string,
    /**
     * 对照record在DataSet中的index
     * @default dataSet.currentIndex
     */
    dataIndex: PropTypes.number,
    /**
     * 是否是多值
     * @default false
     */
    multiple: PropTypes.bool,
    /**
     * 表单下控件跨越的行数
     */
    rowSpan: PropTypes.number,
    /**
     * 另起新行
     */
    newLine: PropTypes.bool,
    /**
     * 表单下控件跨越的列数
     */
    colSpan: PropTypes.number,
    /**
     * 校验器
     * (value: any, name?: string, form?: ReactInstance) => string | boolean | Promise<string | boolean>
     */
    validator: PropTypes.func,
    /**
     * 校验失败回调
     * (validationMessage: ReactNode, validity: Validity, name?: string) => void
     */
    onInvalid: PropTypes.func,
    /**
     * 额外信息，常用作提示
     */
    help: PropTypes.string,
    /**
     * 显示提示信息的方式
     */
    showHelp: PropTypes.oneOf(["tooltip" /* tooltip */, "newLine" /* newLine */, "none" /* none */]),
    /**
     * 渲染器
     */
    renderer: PropTypes.func,
    /**
     * 校验信息渲染器
     */
    validationRenderer: PropTypes.func,
    /**
     * 多值标签超出最大数量时的占位描述
     */
    maxTagPlaceholder: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 多值标签最大数量
     */
    maxTagCount: PropTypes.number,
    /**
     * 多值标签文案最大长度
     */
    maxTagTextLength: PropTypes.number,
    /**
     * 显示原始值
     */
    pristine: PropTypes.bool,
    /**
     * 字符串值是否去掉首尾空格
     * 可选值: both left right none
     * @default: both
     */
    trim: PropTypes.oneOf(["both" /* both */, "left" /* left */, "right" /* right */, "none" /* none */]),
    /**
     * 值变化回调
     * (value: any, oldValue: any, form?: ReactInstance) => void
     */
    onChange: PropTypes.func,
    /**
     * 输入回调
     */
    onInput: PropTypes.func,
    /**
     * 键盘回车回调
     */
    onEnterDown: PropTypes.func,
    ...DataSetComponent.propTypes,
};
FormField.defaultProps = {
    readOnly: false,
    disabled: false,
    noValidate: false,
    showHelp: 'newLine',
    trim: "both" /* both */,
};
__decorate([
    observable
], FormField.prototype, "rangeTarget", void 0);
__decorate([
    observable
], FormField.prototype, "rangeValue", void 0);
__decorate([
    computed
], FormField.prototype, "validator", null);
__decorate([
    computed
], FormField.prototype, "name", null);
__decorate([
    computed
], FormField.prototype, "value", null);
__decorate([
    computed
], FormField.prototype, "defaultValidationMessages", null);
__decorate([
    computed
], FormField.prototype, "dataSet", null);
__decorate([
    computed
], FormField.prototype, "record", null);
__decorate([
    computed
], FormField.prototype, "field", null);
__decorate([
    computed
], FormField.prototype, "isValid", null);
__decorate([
    computed
], FormField.prototype, "multiple", null);
__decorate([
    computed
], FormField.prototype, "multiLine", null);
__decorate([
    computed
], FormField.prototype, "trim", null);
__decorate([
    computed
], FormField.prototype, "format", null);
__decorate([
    computed
], FormField.prototype, "range", null);
__decorate([
    autobind
], FormField.prototype, "defaultRenderer", null);
__decorate([
    autobind
], FormField.prototype, "handleFocus", null);
__decorate([
    autobind
], FormField.prototype, "handleBlur", null);
__decorate([
    autobind
], FormField.prototype, "handleCompositionStart", null);
__decorate([
    autobind
], FormField.prototype, "handleChange", null);
__decorate([
    autobind
], FormField.prototype, "handleKeyDown", null);
__decorate([
    autobind
], FormField.prototype, "handleMutipleValueRemove", null);
__decorate([
    action
], FormField.prototype, "prepareSetValue", null);
__decorate([
    action
], FormField.prototype, "beginRange", null);
__decorate([
    action
], FormField.prototype, "endRange", null);
__decorate([
    action
], FormField.prototype, "setRangeTarget", null);
__decorate([
    action
], FormField.prototype, "setValue", null);
__decorate([
    action
], FormField.prototype, "clear", null);
__decorate([
    autobind
], FormField.prototype, "reset", null);
let ObserverFormField = class ObserverFormField extends FormField {
};
ObserverFormField.defaultProps = FormField.defaultProps;
ObserverFormField = __decorate([
    observer
], ObserverFormField);
export default ObserverFormField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2ZpZWxkL0Zvcm1GaWVsZC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sR0FBRyxNQUFNLHdCQUF3QixDQUFDO0FBQ3pDLE9BQU8sS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFvQixjQUFjLEVBQTRCLE1BQU0sT0FBTyxDQUFDO0FBQ3hHLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEYsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxTQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBVSxNQUFNLFFBQVEsQ0FBQztBQUMxQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3hFLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZDLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDO0FBQ3ZDLE9BQU8sUUFBUSxNQUFNLG1CQUFt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OlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2ZpZWxkL0Zvcm1GaWVsZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcCBmcm9tICdjb3JlLWpzL2xpYnJhcnkvZm4vbWFwJztcbmltcG9ydCBSZWFjdCwgeyBjbG9uZUVsZW1lbnQsIEZvcm1FdmVudEhhbmRsZXIsIGlzVmFsaWRFbGVtZW50LCBSZWFjdEluc3RhbmNlLCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgYWN0aW9uLCBjb21wdXRlZCwgaXNBcnJheUxpa2UsIG9ic2VydmFibGUsIHJ1bkluQWN0aW9uLCB0b0pTIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBpc051bWJlciBmcm9tICdsb2Rhc2gvaXNOdW1iZXInO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC9pc1N0cmluZyc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCBpc0xkRW1wdHkgZnJvbSAnbG9kYXNoL2lzRW1wdHknO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC9pc09iamVjdCc7XG5pbXBvcnQgZGVmYXVsdFRvIGZyb20gJ2xvZGFzaC9kZWZhdWx0VG8nO1xuaW1wb3J0IHsgaXNNb21lbnQsIE1vbWVudCB9IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoL25vb3AnO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgeyBnZXRDb25maWcsIGdldFByb1ByZWZpeENscyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBSb3cgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9yb3cnO1xuaW1wb3J0IENvbCBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IERhdGFTZXQgZnJvbSAnLi4vZGF0YS1zZXQvRGF0YVNldCc7XG5pbXBvcnQgUmVjb3JkIGZyb20gJy4uL2RhdGEtc2V0L1JlY29yZCc7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vZGF0YS1zZXQvRmllbGQnO1xuaW1wb3J0IFZhbGlkYXRvciwgeyBDdXN0b21WYWxpZGF0b3IsIFZhbGlkYXRpb25NZXNzYWdlcyB9IGZyb20gJy4uL3ZhbGlkYXRvci9WYWxpZGF0b3InO1xuaW1wb3J0IFZhbGlkaXR5IGZyb20gJy4uL3ZhbGlkYXRvci9WYWxpZGl0eSc7XG5pbXBvcnQgRm9ybUNvbnRleHQgZnJvbSAnLi4vZm9ybS9Gb3JtQ29udGV4dCc7XG5pbXBvcnQgRGF0YVNldENvbXBvbmVudCwgeyBEYXRhU2V0Q29tcG9uZW50UHJvcHMgfSBmcm9tICcuLi9kYXRhLXNldC9EYXRhU2V0Q29tcG9uZW50JztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcCc7XG5pbXBvcnQgRm9ybSBmcm9tICcuLi9mb3JtL0Zvcm0nO1xuaW1wb3J0IGlzRW1wdHkgZnJvbSAnLi4vX3V0aWwvaXNFbXB0eSc7XG5pbXBvcnQgeyBGaWVsZEZvcm1hdCwgRmllbGRUcmltLCBGaWVsZFR5cGUsIFJlY29yZFN0YXR1cyB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IFZhbGlkYXRpb25SZXN1bHQgZnJvbSAnLi4vdmFsaWRhdG9yL1ZhbGlkYXRpb25SZXN1bHQnO1xuaW1wb3J0IHsgU2hvd0hlbHAgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHsgVmFsaWRhdG9yUHJvcHMgfSBmcm9tICcuLi92YWxpZGF0b3IvcnVsZXMnO1xuaW1wb3J0IHsgRklFTERfU1VGRklYIH0gZnJvbSAnLi4vZm9ybS91dGlscyc7XG5pbXBvcnQgeyBMYWJlbExheW91dCB9IGZyb20gJy4uL2Zvcm0vZW51bSc7XG5pbXBvcnQgQW5pbWF0ZSBmcm9tICcuLi9hbmltYXRlJztcbmltcG9ydCBDbG9zZUJ1dHRvbiBmcm9tICcuL0Nsb3NlQnV0dG9uJztcbmltcG9ydCB7IGZyb21SYW5nZVZhbHVlLCBnZXREYXRlRm9ybWF0QnlGaWVsZCwgdG9NdWx0aXBsZVZhbHVlLCB0b1JhbmdlVmFsdWUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBpc1NhbWUgZnJvbSAnLi4vX3V0aWwvaXNTYW1lJztcbmltcG9ydCBmb3JtYXRTdHJpbmcgZnJvbSAnLi4vZm9ybWF0dGVyL2Zvcm1hdFN0cmluZyc7XG5cbmNvbnN0IG1hcDogeyBba2V5OiBzdHJpbmddOiBGb3JtRmllbGQ8Rm9ybUZpZWxkUHJvcHM+W107IH0gPSB7fTtcblxuZXhwb3J0IHR5cGUgQ29tcGFyYXRvciA9ICh2MTogYW55LCB2MjogYW55KSA9PiBib29sZWFuO1xuXG5leHBvcnQgdHlwZSBSZW5kZXJQcm9wcyA9IHtcbiAgdmFsdWU/OiBhbnk7XG4gIHRleHQ/OiBzdHJpbmc7XG4gIHJlY29yZD86IFJlY29yZCB8IG51bGw7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIGRhdGFTZXQ/OiBEYXRhU2V0IHwgbnVsbDtcbiAgcmVwZWF0PzogbnVtYmVyO1xuICBtYXhUYWdUZXh0TGVuZ3RoPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUmVuZGVyZXIgPSAocHJvcHM6IFJlbmRlclByb3BzKSA9PiBSZWFjdE5vZGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWVsZHNCeUlkKGlkKTogRm9ybUZpZWxkPEZvcm1GaWVsZFByb3BzPltdIHtcbiAgaWYgKCFtYXBbaWRdKSB7XG4gICAgbWFwW2lkXSA9IFtdO1xuICB9XG4gIHJldHVybiBtYXBbaWRdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1GaWVsZFByb3BzIGV4dGVuZHMgRGF0YVNldENvbXBvbmVudFByb3BzIHtcbiAgLyoqXG4gICAqIOWGhemDqOWxnuaApyzmoIforrDor6Xnu4Tku7bmmK/lkKbkvY3kuo50YWJsZeS4rSzpgILnlKjkuo5DaGVja0JveOS7peWPinN3aXRjaOetiee7hOS7tlxuICAgKi9cbiAgX2luVGFibGU/OiBib29sZWFuLFxuICAvKipcbiAgICog5qCH562+5ZCNXG4gICAqL1xuICBsYWJlbD86IHN0cmluZyB8IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOagh+etvuW4g+WxgFxuICAgKi9cbiAgbGFiZWxMYXlvdXQ/OiBMYWJlbExheW91dDtcbiAgLyoqXG4gICAqIOagh+etvuWuveW6plxuICAgKi9cbiAgbGFiZWxXaWR0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOWtl+auteWQjVxuICAgKi9cbiAgbmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIDzlj5fmjqc+5b2T5YmN5YC8XG4gICAqL1xuICB2YWx1ZT86IGFueTtcbiAgLyoqXG4gICAqIOm7mOiupOWAvFxuICAgKi9cbiAgZGVmYXVsdFZhbHVlPzogYW55O1xuICAvKipcbiAgICog5piv5ZCm5b+F6L6TXG4gICAqL1xuICByZXF1aXJlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmmK/lkKblj6ror7tcbiAgICovXG4gIHJlYWRPbmx5PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaYr+WQpuemgeeUqFxuICAgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICog5a+554Wn6KGo5Y2VaWRcbiAgICovXG4gIGZvcm0/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlr7nnhadyZWNvcmTlnKhEYXRhU2V05Lit55qEaW5kZXhcbiAgICogQGRlZmF1bHQgZGF0YVNldC5jdXJyZW50SW5kZXhcbiAgICovXG4gIGRhdGFJbmRleD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOWvueeFp3JlY29yZFxuICAgKiDkvJjlhYjnuqfpq5jkuo5kYXRhU2V05ZKMZGF0YUluZGV4XG4gICAqL1xuICByZWNvcmQ/OiBSZWNvcmQ7XG4gIC8qKlxuICAgKiDmmK/lkKbmmK/lpJrlgLxcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG11bHRpcGxlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaYr+WQpuaYr+iMg+WbtOWAvFxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgcmFuZ2U/OiBib29sZWFuIHwgW3N0cmluZywgc3RyaW5nXTtcbiAgLyoqXG4gICAqIOagoemqjOWZqFxuICAgKi9cbiAgdmFsaWRhdG9yPzogQ3VzdG9tVmFsaWRhdG9yO1xuICAvKipcbiAgICog5LiN5qCh6aqMXG4gICAqL1xuICBub1ZhbGlkYXRlPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOmineWkluS/oeaBr++8jOW4uOeUqOS9nOaPkOekulxuICAgKlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAbWVtYmVyb2YgRm9ybUZpZWxkUHJvcHNcbiAgICovXG4gIGhlbHA/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlj6botbfmlrDooYxcbiAgICovXG4gIG5ld0xpbmU/OiBib29sZWFuO1xuICAvKipcbiAgICog5pi+56S65o+Q56S65L+h5oGv55qE5pa55byPXG4gICAqXG4gICAqIEB0eXBlIHtTaG93SGVscH1cbiAgICogQG1lbWJlcm9mIEZvcm1GaWVsZFByb3BzXG4gICAqL1xuICBzaG93SGVscD86IFNob3dIZWxwO1xuICAvKipcbiAgICog5riy5p+T5ZmoXG4gICAqL1xuICByZW5kZXJlcj86IFJlbmRlcmVyO1xuICAvKipcbiAgICog5qCh6aqM5L+h5oGv5riy5p+T5ZmoXG4gICAqL1xuICB2YWxpZGF0aW9uUmVuZGVyZXI/OiAocmVzdWx0OiBWYWxpZGF0aW9uUmVzdWx0LCBwcm9wczogVmFsaWRhdG9yUHJvcHMpID0+IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOWkmuWAvOagh+etvui2heWHuuacgOWkp+aVsOmHj+aXtueahOWNoOS9jeaPj+i/sFxuICAgKi9cbiAgbWF4VGFnUGxhY2Vob2xkZXI/OiBSZWFjdE5vZGUgfCAoKG9taXR0ZWRWYWx1ZXM6IGFueVtdKSA9PiBSZWFjdE5vZGUpO1xuICAvKipcbiAgICog5aSa5YC85qCH562+5pyA5aSn5pWw6YePXG4gICAqL1xuICBtYXhUYWdDb3VudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOWkmuWAvOagh+etvuaWh+ahiOacgOWkp+mVv+W6plxuICAgKi9cbiAgbWF4VGFnVGV4dExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOaYvuekuuWOn+Wni+WAvFxuICAgKi9cbiAgcHJpc3RpbmU/OiBib29sZWFuO1xuICAvKipcbiAgICog5a2X56ym5Liy5YC85piv5ZCm5Y675o6J6aaW5bC+56m65qC8XG4gICAqIOWPr+mAieWAvDogYm90aCBsZWZ0IHJpZ2h0IG5vbmVcbiAgICogQGRlZmF1bHQ6IGJvdGhcbiAgICovXG4gIHRyaW0/OiBGaWVsZFRyaW07XG4gIC8qKlxuICAgKiDml6XmnJ/moLzlvI/vvIzlpoIgYFlZWVktTU0tREQgSEg6bW06c3NgXG4gICAqIOWtl+espuS4suagvOW8j++8jOWmgiBgdXBwY2FzZWAgYGxvd2VyY2FzZWAgYGNhcGl0YWxpemVgXG4gICAqL1xuICBmb3JtYXQ/OiBzdHJpbmcgfCBGaWVsZEZvcm1hdDtcbiAgLyoqXG4gICAqIOagoemqjOWksei0peWbnuiwg1xuICAgKi9cbiAgb25JbnZhbGlkPzogKHZhbGlkYXRpb25SZXN1bHRzOiBWYWxpZGF0aW9uUmVzdWx0W10sIHZhbGlkaXR5OiBWYWxpZGl0eSwgbmFtZT86IHN0cmluZykgPT4gdm9pZDtcbiAgLyoqXG4gICAqIOWAvOWPmOWMluWbnuiwg1xuICAgKi9cbiAgb25DaGFuZ2U/OiAodmFsdWU6IGFueSwgb2xkVmFsdWU6IGFueSwgZm9ybT86IFJlYWN0SW5zdGFuY2UpID0+IHZvaWQ7XG4gIC8qKlxuICAgKiDovpPlhaXlm57osINcbiAgICovXG4gIG9uSW5wdXQ/OiBGb3JtRXZlbnRIYW5kbGVyPGFueT47XG4gIC8qKlxuICAgKiDplK7nm5jlm57ovablm57osINcbiAgICovXG4gIG9uRW50ZXJEb3duPzogRm9ybUV2ZW50SGFuZGxlcjxhbnk+O1xuICAvKipcbiAgICog5YC85riF56m65Zue6LCDXG4gICAqL1xuICBvbkNsZWFyPzogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIEZvcm1GaWVsZDxUIGV4dGVuZHMgRm9ybUZpZWxkUHJvcHM+IGV4dGVuZHMgRGF0YVNldENvbXBvbmVudDxUPiB7XG4gIHN0YXRpYyBjb250ZXh0VHlwZSA9IEZvcm1Db250ZXh0O1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgX2luVGFibGU6IFByb3BUeXBlcy5ib29sLFxuICAgIHR5cGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLyoqXG4gICAgICog5a2X5q615ZCNXG4gICAgICovXG4gICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiA85Y+X5o6nPuW9k+WJjeWAvFxuICAgICAqL1xuICAgIHZhbHVlOiBQcm9wVHlwZXMuYW55LFxuICAgIC8qKlxuICAgICAqIOm7mOiupOWAvFxuICAgICAqL1xuICAgIGRlZmF1bHRWYWx1ZTogUHJvcFR5cGVzLmFueSxcbiAgICAvKipcbiAgICAgKiDmmK/lkKblv4XovpNcbiAgICAgKi9cbiAgICByZXF1aXJlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog5piv5ZCm5Y+q6K+7XG4gICAgICovXG4gICAgcmVhZE9ubHk6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOWvueeFp+ihqOWNlWlkXG4gICAgICovXG4gICAgZm9ybTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiDlr7nnhadyZWNvcmTlnKhEYXRhU2V05Lit55qEaW5kZXhcbiAgICAgKiBAZGVmYXVsdCBkYXRhU2V0LmN1cnJlbnRJbmRleFxuICAgICAqL1xuICAgIGRhdGFJbmRleDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmmK/lpJrlgLxcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIG11bHRpcGxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDooajljZXkuIvmjqfku7bot6jotornmoTooYzmlbBcbiAgICAgKi9cbiAgICByb3dTcGFuOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIOWPpui1t+aWsOihjFxuICAgICAqL1xuICAgIG5ld0xpbmU6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOihqOWNleS4i+aOp+S7tui3qOi2iueahOWIl+aVsFxuICAgICAqL1xuICAgIGNvbFNwYW46IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICog5qCh6aqM5ZmoXG4gICAgICogKHZhbHVlOiBhbnksIG5hbWU/OiBzdHJpbmcsIGZvcm0/OiBSZWFjdEluc3RhbmNlKSA9PiBzdHJpbmcgfCBib29sZWFuIHwgUHJvbWlzZTxzdHJpbmcgfCBib29sZWFuPlxuICAgICAqL1xuICAgIHZhbGlkYXRvcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog5qCh6aqM5aSx6LSl5Zue6LCDXG4gICAgICogKHZhbGlkYXRpb25NZXNzYWdlOiBSZWFjdE5vZGUsIHZhbGlkaXR5OiBWYWxpZGl0eSwgbmFtZT86IHN0cmluZykgPT4gdm9pZFxuICAgICAqL1xuICAgIG9uSW52YWxpZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog6aKd5aSW5L+h5oGv77yM5bi455So5L2c5o+Q56S6XG4gICAgICovXG4gICAgaGVscDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvKipcbiAgICAgKiDmmL7npLrmj5DnpLrkv6Hmga/nmoTmlrnlvI9cbiAgICAgKi9cbiAgICBzaG93SGVscDogUHJvcFR5cGVzLm9uZU9mKFtTaG93SGVscC50b29sdGlwLCBTaG93SGVscC5uZXdMaW5lLCBTaG93SGVscC5ub25lXSksXG4gICAgLyoqXG4gICAgICog5riy5p+T5ZmoXG4gICAgICovXG4gICAgcmVuZGVyZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOagoemqjOS/oeaBr+a4suafk+WZqFxuICAgICAqL1xuICAgIHZhbGlkYXRpb25SZW5kZXJlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog5aSa5YC85qCH562+6LaF5Ye65pyA5aSn5pWw6YeP5pe255qE5Y2g5L2N5o+P6L+wXG4gICAgICovXG4gICAgbWF4VGFnUGxhY2Vob2xkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ub2RlLCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIC8qKlxuICAgICAqIOWkmuWAvOagh+etvuacgOWkp+aVsOmHj1xuICAgICAqL1xuICAgIG1heFRhZ0NvdW50OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIOWkmuWAvOagh+etvuaWh+ahiOacgOWkp+mVv+W6plxuICAgICAqL1xuICAgIG1heFRhZ1RleHRMZW5ndGg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgLyoqXG4gICAgICog5pi+56S65Y6f5aeL5YC8XG4gICAgICovXG4gICAgcHJpc3RpbmU6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOWtl+espuS4suWAvOaYr+WQpuWOu+aOiemmluWwvuepuuagvFxuICAgICAqIOWPr+mAieWAvDogYm90aCBsZWZ0IHJpZ2h0IG5vbmVcbiAgICAgKiBAZGVmYXVsdDogYm90aFxuICAgICAqL1xuICAgIHRyaW06IFByb3BUeXBlcy5vbmVPZihbRmllbGRUcmltLmJvdGgsIEZpZWxkVHJpbS5sZWZ0LCBGaWVsZFRyaW0ucmlnaHQsIEZpZWxkVHJpbS5ub25lXSksXG4gICAgLyoqXG4gICAgICog5YC85Y+Y5YyW5Zue6LCDXG4gICAgICogKHZhbHVlOiBhbnksIG9sZFZhbHVlOiBhbnksIGZvcm0/OiBSZWFjdEluc3RhbmNlKSA9PiB2b2lkXG4gICAgICovXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOi+k+WFpeWbnuiwg1xuICAgICAqL1xuICAgIG9uSW5wdXQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIC8qKlxuICAgICAqIOmUruebmOWbnui9puWbnuiwg1xuICAgICAqL1xuICAgIG9uRW50ZXJEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAuLi5EYXRhU2V0Q29tcG9uZW50LnByb3BUeXBlcyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIHJlYWRPbmx5OiBmYWxzZSxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgbm9WYWxpZGF0ZTogZmFsc2UsXG4gICAgc2hvd0hlbHA6ICduZXdMaW5lJyxcbiAgICB0cmltOiBGaWVsZFRyaW0uYm90aCxcbiAgfTtcblxuICBlbXB0eVZhbHVlPzogYW55ID0gbnVsbDtcblxuICBsb2NrOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQG9ic2VydmFibGUgcmFuZ2VUYXJnZXQ/OiAwIHwgMTtcblxuICBAb2JzZXJ2YWJsZSByYW5nZVZhbHVlPzogW2FueSwgYW55XTtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IHZhbGlkYXRvcigpOiBWYWxpZGF0b3Ige1xuICAgIGNvbnN0IHsgZmllbGQgfSA9IHRoaXM7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQudmFsaWRhdG9yO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFZhbGlkYXRvcih1bmRlZmluZWQsIHRoaXMpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBuYW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLm5hbWU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHZhbHVlKCk6IGFueSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLnZhbHVlO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkgfCB1bmRlZmluZWQpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLm9ic2VydmFibGVQcm9wcy52YWx1ZSA9IHZhbHVlO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGxhYmVsTGF5b3V0KCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmxhYmVsTGF5b3V0IHx8IHRoaXMuY29udGV4dC5sYWJlbExheW91dDtcbiAgfVxuXG4gIGdldCBoYXNGbG9hdExhYmVsKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgbGFiZWxMYXlvdXQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGxhYmVsTGF5b3V0ID09PSBMYWJlbExheW91dC5mbG9hdDtcbiAgfVxuXG4gIGdldCBpc0NvbnRyb2xsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBwcmlzdGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5wcmlzdGluZSB8fCB0aGlzLmNvbnRleHQucHJpc3RpbmU7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMoKTogVmFsaWRhdGlvbk1lc3NhZ2VzIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICAvLyBAY29tcHV0ZWRcbiAgZ2V0IGVkaXRhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5pc0Rpc2FibGVkKCkgJiYgIXRoaXMuaXNSZWFkT25seSgpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkYXRhU2V0KCk6IERhdGFTZXQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcmVjb3JkIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHJldHVybiByZWNvcmQuZGF0YVNldDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZVByb3BzLmRhdGFTZXQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHJlY29yZCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcmVjb3JkLCBkYXRhU2V0LCBkYXRhSW5kZXggfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBpZiAoaXNOdW1iZXIoZGF0YUluZGV4KSkge1xuICAgICAgICByZXR1cm4gZGF0YVNldC5nZXQoZGF0YUluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhU2V0LmN1cnJlbnQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGZpZWxkKCk6IEZpZWxkIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHJlY29yZCwgZGF0YVNldCwgbmFtZSwgb2JzZXJ2YWJsZVByb3BzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgZGlzcGxheU5hbWUgfSA9IHRoaXMuY29uc3RydWN0b3IgYXMgYW55O1xuICAgIGlmIChkaXNwbGF5TmFtZSAhPT0gJ091dHB1dCcgJiYgIW5hbWUpIHtcbiAgICAgIHdhcm5pbmcoIW9ic2VydmFibGVQcm9wcy5kYXRhU2V0LCBgJHtkaXNwbGF5TmFtZX0gd2l0aCBiaW5kaW5nIERhdGFTZXQgbmVlZCBwcm9wZXJ0eSBuYW1lLmApO1xuICAgICAgd2FybmluZyghb2JzZXJ2YWJsZVByb3BzLnJlY29yZCwgYCR7ZGlzcGxheU5hbWV9IHdpdGggYmluZGluZyBSZWNvcmQgbmVlZCBwcm9wZXJ0eSBuYW1lLmApO1xuICAgIH1cbiAgICBpZiAobmFtZSkge1xuICAgICAgY29uc3QgcmVjb3JkRmllbGQgPSByZWNvcmQgPyByZWNvcmQuZ2V0RmllbGQobmFtZSkgOiB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBkc0ZpZWxkID0gZGF0YVNldCA/IGRhdGFTZXQuZ2V0RmllbGQobmFtZSkgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAocmVjb3JkRmllbGQpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZEZpZWxkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRzRmllbGQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJpc3RpbmUgfHwgKHRoaXMuZmllbGQgPyB0aGlzLmZpZWxkLnZhbGlkIDogdGhpcy52YWxpZGF0b3IudmFsaWRpdHkudmFsaWQpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBtdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wKCdtdWx0aXBsZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluWtl+auteWkmuihjOWxnuaAp1xuICAgKi9cbiAgQGNvbXB1dGVkXG4gIGdldCBtdWx0aUxpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcCgnbXVsdGlMaW5lJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHRyaW0oKTogRmllbGRUcmltIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wKCd0cmltJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGZvcm1hdCgpOiBGaWVsZEZvcm1hdCB8IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UHJvcCgnZm9ybWF0Jyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHJhbmdlKCk6IGJvb2xlYW4gfCBbc3RyaW5nLCBzdHJpbmddIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wKCdyYW5nZScpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGRlZmF1bHRSZW5kZXJlcih7IHRleHQsIHJlcGVhdCwgbWF4VGFnVGV4dExlbmd0aCB9OiBSZW5kZXJQcm9wcyk6IFJlYWN0Tm9kZSB7XG4gICAgcmV0dXJuIHJlcGVhdCAhPT0gdW5kZWZpbmVkICYmXG4gICAgbWF4VGFnVGV4dExlbmd0aCAmJlxuICAgIGlzU3RyaW5nKHRleHQpICYmXG4gICAgdGV4dC5sZW5ndGggPiBtYXhUYWdUZXh0TGVuZ3RoXG4gICAgICA/IGAke3RleHQuc2xpY2UoMCwgbWF4VGFnVGV4dExlbmd0aCl9Li4uYFxuICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIOWkhOeQhuWkmuihjOWFs+iBlOWtl+auteagoemqjFxuICAgKiBAcGFyYW0gZmllbGRcbiAgICovXG4gIG11bHRpTGluZVZhbGlkYXRvcihmaWVsZCk6IFZhbGlkYXRvciB7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQudmFsaWRhdG9yO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFZhbGlkYXRvcih1bmRlZmluZWQsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuW6lOivpeaYvuekuumqjOivgeS/oeaBrywg5L2c5Li65bGe5oCn5Lyg57uZVG9vbHRpcFxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICogQHR5cGUgeyh1bmRlZmluZWQgfCBib29sZWFuKX1cbiAgICogQG1lbWJlcm9mIEZvcm1GaWVsZFxuICAgKi9cbiAgaXNWYWxpZGF0aW9uTWVzc2FnZUhpZGRlbihtZXNzYWdlPzogUmVhY3ROb2RlKTogdW5kZWZpbmVkIHwgYm9vbGVhbiB7XG4gICAgY29uc3QgeyBoaWRkZW4sIG5vVmFsaWRhdGUgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGhpZGRlbiB8fCB0aGlzLnByaXN0aW5lIHx8ICghdGhpcy5yZWNvcmQgJiYgbm9WYWxpZGF0ZSkgfHwgIW1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKHZhbHVlKSA/ICF2YWx1ZS5sZW5ndGggOiBpc0VtcHR5KHZhbHVlKTtcbiAgfVxuXG4gIGdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBwcm9wcy5uYW1lLFxuICAgICAgcmVjb3JkOiAncmVjb3JkJyBpbiBwcm9wcyA/IHByb3BzLnJlY29yZCA6IGNvbnRleHQucmVjb3JkLFxuICAgICAgZGF0YVNldDogJ2RhdGFTZXQnIGluIHByb3BzID8gcHJvcHMuZGF0YVNldCA6IGNvbnRleHQuZGF0YVNldCxcbiAgICAgIGRhdGFJbmRleDogZGVmYXVsdFRvKHByb3BzLmRhdGFJbmRleCwgY29udGV4dC5kYXRhSW5kZXgpLFxuICAgICAgdmFsdWU6IHRoaXMub2JzZXJ2YWJsZVByb3BzIHx8ICd2YWx1ZScgaW4gcHJvcHMgPyBwcm9wcy52YWx1ZSA6IHByb3BzLmRlZmF1bHRWYWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICdyZWNvcmQnLFxuICAgICAgJ2RlZmF1bHRWYWx1ZScsXG4gICAgICAnZGF0YUluZGV4JyxcbiAgICAgICdvbkVudGVyRG93bicsXG4gICAgICAnb25DbGVhcicsXG4gICAgICAncmVhZE9ubHknLFxuICAgICAgJ3ZhbGlkYXRvcicsXG4gICAgICAndmFsaWRhdGlvblJlbmRlcmVyJyxcbiAgICAgICdoZWxwJyxcbiAgICAgICdzaG93SGVscCcsXG4gICAgICAncmVuZGVyZXInLFxuICAgICAgJ21heFRhZ1BsYWNlaG9sZGVyJyxcbiAgICAgICdtYXhUYWdDb3VudCcsXG4gICAgICAnbWF4VGFnVGV4dExlbmd0aCcsXG4gICAgICAncm93SW5kZXgnLFxuICAgICAgJ2NvbEluZGV4JyxcbiAgICAgICdsYWJlbExheW91dCcsXG4gICAgICAnX2luVGFibGUnLFxuICAgICAgJ2xhYmVsV2lkdGgnLFxuICAgICAgJ3ByaXN0aW5lJyxcbiAgICAgICdyYW5nZScsXG4gICAgICAndHJpbScsXG4gICAgXSk7XG4gICAgb3RoZXJQcm9wcy5vbkNoYW5nZSA9ICF0aGlzLmlzRGlzYWJsZWQoKSAmJiAhdGhpcy5pc1JlYWRPbmx5KCkgPyB0aGlzLmhhbmRsZUNoYW5nZSA6IG5vb3A7XG4gICAgb3RoZXJQcm9wcy5vbktleURvd24gPSB0aGlzLmhhbmRsZUtleURvd247XG4gICAgb3RoZXJQcm9wcy5vbkNvbXBvc2l0aW9uU3RhcnQgPSB0aGlzLmhhbmRsZUNvbXBvc2l0aW9uU3RhcnQ7XG4gICAgb3RoZXJQcm9wcy5vbkNvbXBvc2l0aW9uRW5kID0gdGhpcy5oYW5kbGVDaGFuZ2U7XG4gICAgcmV0dXJuIG90aGVyUHJvcHM7XG4gIH1cblxuICBnZXRXcmFwcGVyQ2xhc3NOYW1lcyguLi5hcmdzKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICByZXR1cm4gc3VwZXIuZ2V0V3JhcHBlckNsYXNzTmFtZXMoXG4gICAgICB7XG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWludmFsaWRgXTogIXRoaXMuaXNWYWxpZCxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tZmxvYXQtbGFiZWxgXTogdGhpcy5oYXNGbG9hdExhYmVsLFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1yZXF1aXJlZGBdOiB0aGlzLmdldFByb3AoJ3JlcXVpcmVkJyksXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LXJlYWRvbmx5YF06IHRoaXMuZ2V0UHJvcCgncmVhZE9ubHknKSxcbiAgICAgIH0sXG4gICAgICAuLi5hcmdzLFxuICAgICk7XG4gIH1cblxuICByZW5kZXJXcmFwcGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJlbmRlckhlbHBNZXNzYWdlKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBzaG93SGVscCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBoZWxwID0gdGhpcy5nZXRQcm9wKCdoZWxwJyk7XG4gICAgaWYgKHNob3dIZWxwID09PSBTaG93SGVscC5uZXdMaW5lICYmIGhlbHApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PVwiaGVscFwiIGNsYXNzTmFtZT17YCR7Z2V0UHJvUHJlZml4Q2xzKEZJRUxEX1NVRkZJWCl9LWhlbHBgfT5cbiAgICAgICAgICB7aGVscH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGdldExhYmVsKCkge1xuICAgIHJldHVybiB0aGlzLmdldFByb3AoJ2xhYmVsJyk7XG4gIH1cblxuICByZW5kZXJGbG9hdExhYmVsKCk6IFJlYWN0Tm9kZSB7XG4gICAgaWYgKHRoaXMuaGFzRmxvYXRMYWJlbCkge1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldExhYmVsKCk7XG4gICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgY29uc3QgcHJlZml4Q2xzID0gZ2V0UHJvUHJlZml4Q2xzKEZJRUxEX1NVRkZJWCk7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVkID0gdGhpcy5nZXRQcm9wKCdyZXF1aXJlZCcpO1xuICAgICAgICBjb25zdCByZWFkT25seSA9IHRoaXMuZ2V0UHJvcCgncmVhZE9ubHknKTtcbiAgICAgICAgY29uc3QgY2xhc3NTdHJpbmcgPSBjbGFzc05hbWVzKGAke3ByZWZpeENsc30tbGFiZWxgLCB7XG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tcmVxdWlyZWRgXTogcmVxdWlyZWQsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tcmVhZG9ubHlgXTogcmVhZE9ubHksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWxhYmVsLXdyYXBwZXJgfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc1N0cmluZ30+e2xhYmVsfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuYWRkVG9Gb3JtKHRoaXMucHJvcHMsIHRoaXMuY29udGV4dCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogVCwgbmV4dENvbnRleHQpIHtcbiAgICBzdXBlci5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcywgbmV4dENvbnRleHQpO1xuICAgIHRoaXMucmVtb3ZlRnJvbUZvcm0odGhpcy5wcm9wcywgdGhpcy5jb250ZXh0KTtcbiAgICB0aGlzLmFkZFRvRm9ybShuZXh0UHJvcHMsIG5leHRDb250ZXh0KTtcbiAgICBpZiAoIXRoaXMucmVjb3JkICYmIHRoaXMucHJvcHMudmFsdWUgIT09IG5leHRQcm9wcy52YWx1ZSkge1xuICAgICAgdGhpcy52YWxpZGF0ZShuZXh0UHJvcHMudmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucmVtb3ZlRnJvbUZvcm0odGhpcy5wcm9wcywgdGhpcy5jb250ZXh0KTtcbiAgfVxuXG4gIGFkZFRvRm9ybShwcm9wcywgY29udGV4dCkge1xuICAgIGNvbnN0IHsgZm9ybSB9ID0gcHJvcHM7XG4gICAgY29uc3QgeyBmb3JtTm9kZSB9ID0gY29udGV4dDtcbiAgICBpZiAoZm9ybSkge1xuICAgICAgbGV0IGZpZWxkcyA9IG1hcFtmb3JtXTtcbiAgICAgIGlmICghZmllbGRzKSB7XG4gICAgICAgIGZpZWxkcyA9IFtdO1xuICAgICAgICBtYXBbZm9ybV0gPSBmaWVsZHM7XG4gICAgICB9XG4gICAgICBmaWVsZHMucHVzaCh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGZvcm1Ob2RlKSB7XG4gICAgICBmb3JtTm9kZS5hZGRGaWVsZCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVGcm9tRm9ybShwcm9wcywgY29udGV4dCkge1xuICAgIGNvbnN0IHsgZm9ybSB9ID0gcHJvcHM7XG4gICAgY29uc3QgeyBmb3JtTm9kZSB9ID0gY29udGV4dDtcbiAgICBpZiAoZm9ybSkge1xuICAgICAgY29uc3QgZmllbGRzID0gbWFwW2Zvcm1dO1xuICAgICAgaWYgKGZpZWxkcykge1xuICAgICAgICBjb25zdCBpbmRleCA9IGZpZWxkcy5pbmRleE9mKHRoaXMpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgZmllbGRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZvcm1Ob2RlKSB7XG4gICAgICBmb3JtTm9kZS5yZW1vdmVGaWVsZCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJWYWxpZGF0aW9uTWVzc2FnZSh2YWxpZGF0aW9uUmVzdWx0PzogVmFsaWRhdGlvblJlc3VsdCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbk1lc3NhZ2UgPSB0aGlzLmdldFZhbGlkYXRpb25NZXNzYWdlKHZhbGlkYXRpb25SZXN1bHQpO1xuICAgIGlmICh2YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2dldFByb1ByZWZpeENscygndmFsaWRhdGlvbi1tZXNzYWdlJyl9PlxuICAgICAgICAgIHt0aGlzLmNvbnRleHQubGFiZWxMYXlvdXQgIT09IExhYmVsTGF5b3V0LmZsb2F0ICYmIDxJY29uIHR5cGU9XCJlcnJvclwiIC8+fVxuICAgICAgICAgIDxzcGFuPnt2YWxpZGF0aW9uTWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBnZXRWYWxpZGF0b3JQcm9wcygpOiBWYWxpZGF0b3JQcm9wcyB7XG4gICAgY29uc3QgeyBuYW1lLCByYW5nZSwgbXVsdGlwbGUsIGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMgfSA9IHRoaXM7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0RmllbGRUeXBlKCk7XG4gICAgY29uc3QgcmVxdWlyZWQgPSB0aGlzLmdldFByb3AoJ3JlcXVpcmVkJyk7XG4gICAgY29uc3QgY3VzdG9tVmFsaWRhdG9yID0gdGhpcy5nZXRQcm9wKCd2YWxpZGF0b3InKTtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0UHJvcCgnbGFiZWwnKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZSxcbiAgICAgIHJlcXVpcmVkLFxuICAgICAgY3VzdG9tVmFsaWRhdG9yLFxuICAgICAgbmFtZSxcbiAgICAgIGxhYmVsLFxuICAgICAgcmFuZ2UsXG4gICAgICBtdWx0aXBsZSxcbiAgICAgIGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBmb3JtOiB0aGlzLmNvbnRleHQuZm9ybU5vZGUgYXMgRm9ybSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0VmFsaWRhdGlvbk1lc3NhZ2UoXG4gICAgdmFsaWRhdGlvblJlc3VsdDogVmFsaWRhdGlvblJlc3VsdCB8IHVuZGVmaW5lZCA9IHRoaXMudmFsaWRhdG9yLmN1cnJlbnRWYWxpZGF0aW9uUmVzdWx0LFxuICApOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIHZhbGlkYXRvcixcbiAgICAgIHByb3BzOiB7IHZhbGlkYXRpb25SZW5kZXJlciB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgICBpZiAodmFsaWRhdGlvblJlbmRlcmVyKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb25NZXNzYWdlID0gdmFsaWRhdGlvblJlbmRlcmVyKHZhbGlkYXRpb25SZXN1bHQsIHZhbGlkYXRvci5wcm9wcyk7XG4gICAgICAgIGlmICh2YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgIHJldHVybiB2YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUZvY3VzKGUpIHtcbiAgICBzdXBlci5oYW5kbGVGb2N1cyhlKTtcbiAgICBpZiAodGhpcy5yYW5nZSkge1xuICAgICAgdGhpcy5iZWdpblJhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJsdXIoZSkge1xuICAgIHN1cGVyLmhhbmRsZUJsdXIoZSk7XG4gICAgaWYgKHRoaXMucmFuZ2UpIHtcbiAgICAgIHRoaXMuZW5kUmFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ29tcG9zaXRpb25TdGFydCgpIHtcbiAgICB0aGlzLmxvY2sgPSB0cnVlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUNoYW5nZShlKSB7XG4gICAgdGhpcy5sb2NrID0gZmFsc2U7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgY29uc3QgeyBvbktleURvd24gPSBub29wLCBvbkVudGVyRG93biA9IG5vb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgb25LZXlEb3duKGUpO1xuICAgIGlmICghZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBLZXlDb2RlLkVOVEVSOlxuICAgICAgICAgIHRoaXMuaGFuZGxlRW50ZXJEb3duKGUpO1xuICAgICAgICAgIG9uRW50ZXJEb3duKGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuRVNDOlxuICAgICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUVudGVyRG93bihlKSB7XG4gICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgIGlmICh0aGlzLnJhbmdlKSB7XG4gICAgICAgIHRoaXMuZW5kUmFuZ2UoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgICB0aGlzLnN5bmNWYWx1ZU9uQmx1cih2YWx1ZSk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmx1cigpO1xuICAgIH1cbiAgfVxuXG4gIHN5bmNWYWx1ZU9uQmx1cih2YWx1ZSkge1xuICAgIHRoaXMucHJlcGFyZVNldFZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVNdXRpcGxlVmFsdWVSZW1vdmUoZSwgdmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucmVtb3ZlVmFsdWUodmFsdWUsIGluZGV4KTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG5cbiAgZ2V0RGF0ZUZvcm1hdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXREYXRlRm9ybWF0QnlGaWVsZCh0aGlzLmZpZWxkLCB0aGlzLmdldEZpZWxkVHlwZSgpKTtcbiAgfVxuXG4gIHByb2Nlc3NWYWx1ZSh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoIWlzTmlsKHZhbHVlKSkge1xuICAgICAgaWYgKGlzTW9tZW50KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gKHZhbHVlIGFzIE1vbWVudCkuZm9ybWF0KHRoaXMuZ2V0RGF0ZUZvcm1hdCgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBpc1JlYWRPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAodGhpcy5nZXRQcm9wKCdyZWFkT25seScpIGFzIGJvb2xlYW4pIHx8XG4gICAgICB0aGlzLnByaXN0aW5lIHx8XG4gICAgICAodGhpcy5pc0NvbnRyb2xsZWQgJiYgIXRoaXMucHJvcHMub25DaGFuZ2UpXG4gICAgKTtcbiAgfVxuXG4gIGdldERhdGFTZXRWYWx1ZSgpOiBhbnkge1xuICAgIGNvbnN0IHsgcmVjb3JkLCBwcmlzdGluZSwgbmFtZSB9ID0gdGhpcztcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICByZXR1cm4gcHJpc3RpbmUgPyByZWNvcmQuZ2V0UHJpc3RpbmVWYWx1ZShuYW1lKSA6IHJlY29yZC5nZXQobmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0VGV4dE5vZGUoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB0ZXh0ID1cbiAgICAgIHRoaXMuaXNGb2N1c2VkICYmIHRoaXMuZWRpdGFibGVcbiAgICAgICAgPyB0aGlzLnByb2Nlc3NWYWx1ZSh0aGlzLmdldFZhbHVlKCkpXG4gICAgICAgIDogdGhpcy5wcm9jZXNzUmVuZGVyZXIodGhpcy5nZXRWYWx1ZSgpKTtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGdldFRleHQodmFsdWU6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHByb2Nlc3NUZXh0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHByb2Nlc3NSZW5kZXJlcih2YWx1ZT86IGFueSwgcmVwZWF0PzogbnVtYmVyKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7XG4gICAgICByZWNvcmQsXG4gICAgICBkYXRhU2V0LFxuICAgICAgcHJvcHM6IHsgcmVuZGVyZXIgPSB0aGlzLmRlZmF1bHRSZW5kZXJlciwgbmFtZSwgbWF4VGFnVGV4dExlbmd0aCB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLnByb2Nlc3NUZXh0KHRoaXMuZ2V0VGV4dCh2YWx1ZSkpO1xuICAgIHJldHVybiByZW5kZXJlclxuICAgICAgPyByZW5kZXJlcih7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0ZXh0LFxuICAgICAgICByZWNvcmQsXG4gICAgICAgIGRhdGFTZXQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHJlcGVhdCxcbiAgICAgICAgbWF4VGFnVGV4dExlbmd0aCxcbiAgICAgIH0pXG4gICAgICA6IHRleHQ7XG4gIH1cblxuICBwcm9jZXNzUmFuZ2VWYWx1ZSh2YWx1ZT86IGFueSwgcmVwZWF0PzogbnVtYmVyKTogW2FueSwgYW55XSB7XG4gICAgaWYgKHJlcGVhdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMucmFuZ2VWYWx1ZTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHZhbHVlID0gdG9SYW5nZVZhbHVlKHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5yYW5nZSk7XG4gICAgfVxuICAgIHJldHVybiAodmFsdWUgfHwgW10pLm1hcChpdGVtID0+IHRoaXMucHJvY2Vzc1JlbmRlcmVyKGl0ZW0sIHJlcGVhdCkpIGFzIFthbnksIGFueV07XG4gIH1cblxuXG4gIC8qKlxuICAgKiDlpITnkIbojrflj5blpJrooYznvJbovpHlhbPogZTlrZfmrrVcbiAgICovXG4gIHByb2Nlc3NNdWx0aXBsZUxpbmVWYWx1ZSgpOiAoRmllbGQgfCB1bmRlZmluZWQpW10ge1xuICAgIGNvbnN0IHtcbiAgICAgIHJlY29yZCxcbiAgICAgIHByb3BzOiB7IG5hbWUgfSxcbiAgICAgIGRhdGFTZXQsXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGRhdGFTZXQ/LnByb3BzLmZpZWxkcz8ubWFwKGZpZWxkID0+IHtcbiAgICAgIGlmIChmaWVsZC5iaW5kICYmIGZpZWxkLmJpbmQuc3BsaXQoJy4nKVswXSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gcmVjb3JkPy5nZXRGaWVsZChmaWVsZC5uYW1lKSB8fCBkYXRhU2V0Py5nZXRGaWVsZChmaWVsZC5uYW1lKTtcbiAgICAgIH1cbiAgICB9KSB8fCBbXTtcbiAgfVxuXG4gIGdldE9sZFZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWUoKTtcbiAgfVxuXG4gIGdldFZhbHVlKCk6IGFueSB7XG4gICAgY29uc3QgeyBuYW1lIH0gPSB0aGlzO1xuICAgIGlmICh0aGlzLmRhdGFTZXQgJiYgbmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YVNldFZhbHVlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9XG5cbiAgZ2V0VmFsdWVzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gdG9NdWx0aXBsZVZhbHVlKHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5yYW5nZSk7XG4gIH1cblxuICBhZGRWYWx1ZSguLi52YWx1ZXMpIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgY29uc3Qgb2xkVmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgICAgIGlmICh2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUoWy4uLm9sZFZhbHVlcywgLi4udmFsdWVzXSk7XG4gICAgICB9IGVsc2UgaWYgKCFvbGRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5lbXB0eVZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRWYWx1ZSh2YWx1ZXMucG9wKCkpO1xuICAgIH1cbiAgfVxuXG4gIGlzTG93ZXJSYW5nZShfdmFsdWUxOiBhbnksIF92YWx1ZTI6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgcHJlcGFyZVNldFZhbHVlKC4uLnZhbHVlOiBhbnlbXSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmFuZ2VUYXJnZXQsIHJhbmdlLCByYW5nZVZhbHVlIH0gPSB0aGlzO1xuICAgIGNvbnN0IHZhbHVlcyA9IHZhbHVlLmZpbHRlcihpdGVtID0+ICFpc0VtcHR5KGl0ZW0pKTtcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIGlmIChyYW5nZVRhcmdldCAhPT0gdW5kZWZpbmVkICYmIHJhbmdlVmFsdWUpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gcmFuZ2VWYWx1ZTtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSB2YWx1ZXMucG9wKCk7XG4gICAgICAgIHJhbmdlVmFsdWVbcmFuZ2VUYXJnZXRdID0gbmV3VmFsdWU7XG4gICAgICAgIGlmIChyYW5nZVRhcmdldCA9PT0gMCAmJiBuZXdWYWx1ZSAmJiBlbmQgJiYgdGhpcy5pc0xvd2VyUmFuZ2UoZW5kLCBuZXdWYWx1ZSkpIHtcbiAgICAgICAgICByYW5nZVZhbHVlW3JhbmdlVGFyZ2V0XSA9IGVuZDtcbiAgICAgICAgICByYW5nZVZhbHVlWzFdID0gbmV3VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmdlVGFyZ2V0ID09PSAxICYmIG5ld1ZhbHVlICYmIHN0YXJ0ICYmIHRoaXMuaXNMb3dlclJhbmdlKG5ld1ZhbHVlLCBzdGFydCkpIHtcbiAgICAgICAgICByYW5nZVZhbHVlW3JhbmdlVGFyZ2V0XSA9IHN0YXJ0O1xuICAgICAgICAgIHJhbmdlVmFsdWVbMF0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZFZhbHVlKC4uLnZhbHVlcyk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlVmFsdWVzKHZhbHVlczogYW55W10sIGluZGV4OiBudW1iZXIgPSAwKSB7XG4gICAgbGV0IHJlcGVhdDogbnVtYmVyO1xuICAgIHRoaXMuc2V0VmFsdWUoXG4gICAgICB2YWx1ZXMucmVkdWNlKChvbGRWYWx1ZXMsIHZhbHVlKSA9PiB7XG4gICAgICAgIHJlcGVhdCA9IDA7XG4gICAgICAgIHJldHVybiBvbGRWYWx1ZXMuZmlsdGVyKHYgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmdldFZhbHVlS2V5KHYpID09PSB0aGlzLmdldFZhbHVlS2V5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSB8fCByZXBlYXQgPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgIHRoaXMuYWZ0ZXJSZW1vdmVWYWx1ZSh2YWx1ZSwgcmVwZWF0KyspO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXBlYXQrKztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcy5nZXRWYWx1ZXMoKSksXG4gICAgKTtcbiAgfVxuXG4gIHJlbW92ZVZhbHVlKHZhbHVlOiBhbnksIGluZGV4OiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5yZW1vdmVWYWx1ZXMoW3ZhbHVlXSwgaW5kZXgpO1xuICB9XG5cbiAgYWZ0ZXJSZW1vdmVWYWx1ZShfdmFsdWUsIF9yZXBlYXQ6IG51bWJlcikge1xuICB9XG5cbiAgQGFjdGlvblxuICBiZWdpblJhbmdlKCkge1xuICAgIHRoaXMuc2V0UmFuZ2VUYXJnZXQodGhpcy5yYW5nZVRhcmdldCB8fCAwKTtcbiAgICB0aGlzLnJhbmdlVmFsdWUgPSB0aGlzLm11bHRpcGxlXG4gICAgICA/IFt1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgICAgIDogdG9SYW5nZVZhbHVlKHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5yYW5nZSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGVuZFJhbmdlKCkge1xuICAgIGlmICh0aGlzLnJhbmdlVmFsdWUpIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMucmFuZ2VWYWx1ZS5zbGljZSgpO1xuICAgICAgdGhpcy5yYW5nZVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKCF0aGlzLm11bHRpcGxlIHx8ICF2YWx1ZXMuZXZlcnkoaXNOaWwpKSB7XG4gICAgICAgIHRoaXMuYWRkVmFsdWUoZnJvbVJhbmdlVmFsdWUodmFsdWVzLCB0aGlzLnJhbmdlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBzZXRSYW5nZVRhcmdldCh0YXJnZXQ/OiAwIHwgMSkge1xuICAgIHRoaXMucmFuZ2VUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMubXVsdGlwbGUgfHwgdGhpcy5yYW5nZVxuICAgICAgICAgID8gaXNBcnJheUxpa2UodmFsdWUpICYmICF2YWx1ZS5sZW5ndGhcbiAgICAgICAgICA6IGlzTmlsKHZhbHVlKSB8fCB2YWx1ZSA9PT0gJydcbiAgICAgICkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMuZW1wdHlWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgZGF0YVNldCxcbiAgICAgICAgdHJpbSxcbiAgICAgICAgZm9ybWF0LFxuICAgICAgICBvYnNlcnZhYmxlUHJvcHM6IHsgZGF0YUluZGV4IH0sXG4gICAgICB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHsgb25DaGFuZ2UgPSBub29wIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgeyBmb3JtTm9kZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgICAgY29uc3Qgb2xkID0gdGhpcy5nZXRPbGRWYWx1ZSgpO1xuICAgICAgaWYgKGRhdGFTZXQgJiYgbmFtZSkge1xuICAgICAgICAodGhpcy5yZWNvcmQgfHwgZGF0YVNldC5jcmVhdGUoe30sIGRhdGFJbmRleCkpLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGZvcm1hdFN0cmluZyh2YWx1ZSwge1xuICAgICAgICAgIHRyaW0sXG4gICAgICAgICAgZm9ybWF0LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyDovazmiJDlrp7pmYXnmoTmlbDmja7lho3ov5vooYzliKTmlq1cbiAgICAgIGlmICghaXNTYW1lKHRvSlMob2xkKSwgdG9KUyh2YWx1ZSkpKSB7XG4gICAgICAgIG9uQ2hhbmdlKHZhbHVlLCB0b0pTKG9sZCksIGZvcm1Ob2RlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJSYW5nZVZhbHVlKHJlYWRPbmx5PzogYm9vbGVhbiwgdmFsdWU/OiBhbnksIHJlcGVhdD86IG51bWJlcik6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgcmFuZ2VWYWx1ZSA9IHRoaXMucHJvY2Vzc1JhbmdlVmFsdWUodmFsdWUsIHJlcGVhdCk7XG4gICAgaWYgKHJlYWRPbmx5KSB7XG4gICAgICBpZiAocmFuZ2VWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAge3JhbmdlVmFsdWVbMF19fntyYW5nZVZhbHVlWzFdfVxuICAgICAgICAgIDwvPlxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlj6ror7vmqKHlvI/kuIvlpJrooYzljZXlhYPmoLzmuLLmn5NcbiAgICogQHBhcmFtIHJlYWRPbmx5XG4gICAqL1xuICByZW5kZXJNdWx0aUxpbmUocmVhZE9ubHk/OiBib29sZWFuKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCBtdWx0aUxpbmVGaWVsZHMgPSB0aGlzLnByb2Nlc3NNdWx0aXBsZUxpbmVWYWx1ZSgpO1xuICAgIGNvbnN0IHsgcmVjb3JkLCBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgaWYgKHJlYWRPbmx5KSB7XG4gICAgICBpZiAobXVsdGlMaW5lRmllbGRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICB7bXVsdGlMaW5lRmllbGRzLm1hcCgoZmllbGQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdmFsaWRhdGlvblJlc3VsdHMgfSA9IHRoaXMubXVsdGlMaW5lVmFsaWRhdG9yKGZpZWxkKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXF1aXJlZCA9IGRlZmF1bHRUbyhmaWVsZCAmJiBmaWVsZC5nZXQoJ3JlcXVpcmVkJyksIHRoaXMucHJvcHNbJ3JlcXVpcmVkJ10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGVhdHM6IE1hcDxhbnksIG51bWJlcj4gPSBuZXcgTWFwPGFueSwgbnVtYmVyPigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0aW9uUmVzdWx0cy5maW5kKGVycm9yID0+IGVycm9yLnZhbHVlID09PSByZWNvcmQ/LmdldChmaWVsZC5nZXQoJ25hbWUnKSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25NZXNzYWdlID1cbiAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb25SZXN1bHQgJiYgdGhpcy5yZW5kZXJWYWxpZGF0aW9uTWVzc2FnZSh2YWxpZGF0aW9uUmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldFZhbHVlS2V5KHJlY29yZD8uZ2V0KGZpZWxkLmdldCgnbmFtZScpKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwZWF0ID0gcmVwZWF0cy5nZXQoa2V5KSB8fCAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25IaWRkZW4gPSB0aGlzLmlzVmFsaWRhdGlvbk1lc3NhZ2VIaWRkZW4odmFsaWRhdGlvbk1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlubmVyID0gcmVjb3JkPy5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQgPyAnJyA6XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tbXVsdGktdmFsdWUtaW52YWxpZGB9PlJlYWN0RG9tIGludmFsaWQ8L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25Jbm5lciA9IHZhbGlkYXRpb25IaWRkZW4gPyBpbm5lciA6IChcbiAgICAgICAgICAgICAgICAgIDxUb29sdGlwXG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeENscz17YGZvcm0tdG9vbHRpcCAke2dldENvbmZpZygncHJvUHJlZml4Q2xzJyl9LXRvb2x0aXBgfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2Ake2tleX0tJHtyZXBlYXR9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3ZhbGlkYXRpb25NZXNzYWdlfVxuICAgICAgICAgICAgICAgICAgICB0aGVtZT1cImxpZ2h0XCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50PVwiYm90dG9tTGVmdFwiXG4gICAgICAgICAgICAgICAgICAgIGhpZGRlbj17dmFsaWRhdGlvbkhpZGRlbn1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3ZhbGlkYXRpb25NZXNzYWdlfVxuICAgICAgICAgICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxSb3cga2V5PXtgJHtyZWNvcmQ/LmluZGV4fS1tdWx0aS0ke2luZGV4fWB9IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1tdWx0aWB9PlxuICAgICAgICAgICAgICAgICAgICA8Q29sXG4gICAgICAgICAgICAgICAgICAgICAgc3Bhbj17OH1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3JlcXVpcmVkID8gYCR7cHJlZml4Q2xzfS1tdWx0aS1sYWJlbCAke3ByZWZpeENsc30tbXVsdGktbGFiZWwtcmVxdWlyZWRgIDogYCR7cHJlZml4Q2xzfS1tdWx0aS1sYWJlbGB9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7ZmllbGQuZ2V0KCdsYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgICA8L0NvbD5cbiAgICAgICAgICAgICAgICAgICAgPENvbFxuICAgICAgICAgICAgICAgICAgICAgIHNwYW49ezE2fVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uSGlkZGVuID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cHJlZml4Q2xzfS1tdWx0aS12YWx1ZWAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtwcmVmaXhDbHN9LW11bHRpLXZhbHVlICR7cHJlZml4Q2xzfS1tdWx0aS12YWx1ZS1pbnZhbGlkYFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZWNvcmQ/LmdldChmaWVsZC5nZXQoJ25hbWUnKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8VG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1ZmZpeENscz17YGZvcm0tdG9vbHRpcCAke2dldENvbmZpZygncHJvUHJlZml4Q2xzJyl9LXRvb2x0aXBgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YCR7a2V5fS0ke3JlcGVhdH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt2YWxpZGF0aW9uTWVzc2FnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVtZT1cImxpZ2h0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQ9XCJib3R0b21MZWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWRkZW49e3ZhbGlkYXRpb25IaWRkZW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVjb3JkPy5nZXQoZmllbGQuZ2V0KCduYW1lJykpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogdmFsaWRhdGlvbklubmVyXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L0NvbD5cbiAgICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRWYWx1ZUtleSh2OiBhbnkpIHtcbiAgICBpZiAoaXNBcnJheUxpa2UodikpIHtcbiAgICAgIHJldHVybiB2LmpvaW4oJywnKTtcbiAgICB9XG4gICAgcmV0dXJuIHY7XG4gIH1cblxuICByZW5kZXJNdWx0aXBsZVZhbHVlcyhyZWFkT25seT86IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgIGNvbnN0IHZhbHVlTGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICByYW5nZSxcbiAgICAgIHByb3BzOiB7IG1heFRhZ0NvdW50ID0gdmFsdWVMZW5ndGgsIG1heFRhZ1BsYWNlaG9sZGVyIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgeyB2YWxpZGF0aW9uUmVzdWx0cyB9ID0gdGhpcy52YWxpZGF0b3I7XG4gICAgY29uc3QgcmVwZWF0czogTWFwPGFueSwgbnVtYmVyPiA9IG5ldyBNYXA8YW55LCBudW1iZXI+KCk7XG4gICAgY29uc3QgYmxvY2tDbGFzc05hbWUgPSBjbGFzc05hbWVzKFxuICAgICAge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS1tdWx0aXBsZS1ibG9jay1kaXNhYmxlZGBdOiB0aGlzLmlzRGlzYWJsZWQoKSxcbiAgICAgIH0sXG4gICAgICBgJHtwcmVmaXhDbHN9LW11bHRpcGxlLWJsb2NrYCxcbiAgICApO1xuICAgIGNvbnN0IHRhZ3MgPSB2YWx1ZXMuc2xpY2UoMCwgbWF4VGFnQ291bnQpLm1hcCh2ID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0VmFsdWVLZXkodik7XG4gICAgICBjb25zdCByZXBlYXQgPSByZXBlYXRzLmdldChrZXkpIHx8IDA7XG4gICAgICBjb25zdCB0ZXh0ID0gcmFuZ2UgPyB0aGlzLnJlbmRlclJhbmdlVmFsdWUodHJ1ZSwgdiwgcmVwZWF0KSA6IHRoaXMucHJvY2Vzc1JlbmRlcmVyKHYsIHJlcGVhdCk7XG4gICAgICByZXBlYXRzLnNldChrZXksIHJlcGVhdCArIDEpO1xuICAgICAgaWYgKCFpc05pbCh0ZXh0KSkge1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGlvblJlc3VsdHMuZmluZChlcnJvciA9PiBlcnJvci52YWx1ZSA9PT0gdik7XG4gICAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoXG4gICAgICAgICAge1xuICAgICAgICAgICAgW2Ake3ByZWZpeENsc30tbXVsdGlwbGUtYmxvY2staW52YWxpZGBdOiB2YWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYmxvY2tDbGFzc05hbWUsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb25NZXNzYWdlID1cbiAgICAgICAgICB2YWxpZGF0aW9uUmVzdWx0ICYmIHRoaXMucmVuZGVyVmFsaWRhdGlvbk1lc3NhZ2UodmFsaWRhdGlvblJlc3VsdCk7XG4gICAgICAgIGNvbnN0IGNsb3NlQnRuID0gIXRoaXMuaXNEaXNhYmxlZCgpICYmICF0aGlzLmlzUmVhZE9ubHkoKSAmJiAoXG4gICAgICAgICAgPENsb3NlQnV0dG9uIG9uQ2xvc2U9e3RoaXMuaGFuZGxlTXV0aXBsZVZhbHVlUmVtb3ZlfSB2YWx1ZT17dn0gaW5kZXg9e3JlcGVhdH0gLz5cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaW5uZXIgPSByZWFkT25seSA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZX0+e3RleHR9PC9zcGFuPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgICAgICA8ZGl2Pnt0ZXh0fTwvZGl2PlxuICAgICAgICAgICAge2Nsb3NlQnRufVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICAgIHN1ZmZpeENscz17YGZvcm0tdG9vbHRpcCAke2dldENvbmZpZygncHJvUHJlZml4Q2xzJyl9LXRvb2x0aXBgfVxuICAgICAgICAgICAga2V5PXtgJHtrZXl9LSR7cmVwZWF0fWB9XG4gICAgICAgICAgICB0aXRsZT17dmFsaWRhdGlvbk1lc3NhZ2V9XG4gICAgICAgICAgICB0aGVtZT1cImxpZ2h0XCJcbiAgICAgICAgICAgIHBsYWNlbWVudD1cImJvdHRvbUxlZnRcIlxuICAgICAgICAgICAgaGlkZGVuPXt0aGlzLmlzVmFsaWRhdGlvbk1lc3NhZ2VIaWRkZW4odmFsaWRhdGlvbk1lc3NhZ2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtpbm5lcn1cbiAgICAgICAgICA8L1Rvb2x0aXA+XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHZhbHVlTGVuZ3RoID4gbWF4VGFnQ291bnQpIHtcbiAgICAgIGxldCBjb250ZW50OiBSZWFjdE5vZGUgPSBgKyAke3ZhbHVlTGVuZ3RoIC0gbWF4VGFnQ291bnR9IC4uLmA7XG4gICAgICBpZiAobWF4VGFnUGxhY2Vob2xkZXIpIHtcbiAgICAgICAgY29uc3Qgb21pdHRlZFZhbHVlcyA9IHZhbHVlcy5zbGljZShtYXhUYWdDb3VudCwgdmFsdWVMZW5ndGgpO1xuICAgICAgICBjb250ZW50ID1cbiAgICAgICAgICB0eXBlb2YgbWF4VGFnUGxhY2Vob2xkZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gbWF4VGFnUGxhY2Vob2xkZXIob21pdHRlZFZhbHVlcylcbiAgICAgICAgICAgIDogbWF4VGFnUGxhY2Vob2xkZXI7XG4gICAgICB9XG4gICAgICB0YWdzLnB1c2goXG4gICAgICAgIDxsaSBrZXk9XCJtYXhUYWdQbGFjZWhvbGRlclwiIGNsYXNzTmFtZT17YmxvY2tDbGFzc05hbWV9PlxuICAgICAgICAgIDxkaXY+e2NvbnRlbnR9PC9kaXY+XG4gICAgICAgIDwvbGk+LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGFncztcbiAgfVxuXG4gIEBhY3Rpb25cbiAgY2xlYXIoKSB7XG4gICAgY29uc3QgeyBvbkNsZWFyID0gbm9vcCB9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFZhbHVlKHRoaXMuZW1wdHlWYWx1ZSk7XG4gICAgdGhpcy5yYW5nZVZhbHVlID0gdGhpcy5pc0ZvY3VzZWQgPyBbdW5kZWZpbmVkLCB1bmRlZmluZWRdIDogdW5kZWZpbmVkO1xuICAgIG9uQ2xlYXIoKTtcbiAgfVxuXG4gIGFzeW5jIGNoZWNrVmFsaWRpdHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgeyBuYW1lIH0gPSB0aGlzO1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgdGhpcy52YWxpZGF0ZSgpO1xuICAgIGNvbnN0IHsgb25JbnZhbGlkID0gbm9vcCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIXZhbGlkKSB7XG4gICAgICBjb25zdCB7IHZhbGlkYXRpb25SZXN1bHRzLCB2YWxpZGl0eSB9ID0gdGhpcy52YWxpZGF0b3I7XG4gICAgICBvbkludmFsaWQodmFsaWRhdGlvblJlc3VsdHMsIHZhbGlkaXR5LCBuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgYXN5bmMgdmFsaWRhdGUodmFsdWU/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBsZXQgaW52YWxpZCA9IGZhbHNlO1xuICAgIGlmICghdGhpcy5wcm9wcy5ub1ZhbGlkYXRlKSB7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMubXVsdGlwbGUgPyB0aGlzLmdldFZhbHVlcygpIDogdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgfVxuICAgICAgY29uc3QgeyB2YWxpZGF0b3IgfSA9IHRoaXM7XG4gICAgICB2YWxpZGF0b3IucmVzZXQoKTtcbiAgICAgIGludmFsaWQgPSAhKGF3YWl0IHZhbGlkYXRvci5jaGVja1ZhbGlkaXR5KHZhbHVlKSk7XG4gICAgfVxuICAgIHJldHVybiAhaW52YWxpZDtcbiAgfVxuXG4gIGlzRGlzYWJsZWQoKSB7XG4gICAgY29uc3QgeyBkaXNhYmxlZCB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGlmIChkaXNhYmxlZCB8fCB0aGlzLmdldFByb3AoJ2Rpc2FibGVkJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCB7IGZpZWxkLCByZWNvcmQgfSA9IHRoaXM7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBjb25zdCBjYXNjYWRlTWFwID0gZmllbGQuZ2V0KCdjYXNjYWRlTWFwJyk7XG4gICAgICBpZiAoXG4gICAgICAgIGNhc2NhZGVNYXAgJiZcbiAgICAgICAgKCFyZWNvcmQgfHwgT2JqZWN0LmtleXMoY2FzY2FkZU1hcCkuc29tZShjYXNjYWRlID0+IHtcbiAgICAgICAgICBpZiAoaXNPYmplY3QocmVjb3JkLmdldChjYXNjYWRlTWFwW2Nhc2NhZGVdKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0xkRW1wdHkocmVjb3JkLmdldChjYXNjYWRlTWFwW2Nhc2NhZGVdKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpc05pbChyZWNvcmQuZ2V0KGNhc2NhZGVNYXBbY2FzY2FkZV0pKTtcbiAgICAgICAgfSkpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5pc0Rpc2FibGVkKCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgcmVzZXQoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29udHJvbGxlZCAmJiAhdGhpcy5kYXRhU2V0KSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKTtcbiAgICB9XG4gICAgdGhpcy52YWxpZGF0b3IucmVzZXQoKTtcbiAgfVxuXG4gIGdldEZpZWxkVHlwZSgpOiBGaWVsZFR5cGUge1xuICAgIGNvbnN0IHsgZmllbGQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChmaWVsZCAmJiBmaWVsZC5nZXQoJ3R5cGUnKSkgfHwgRmllbGRUeXBlLnN0cmluZztcbiAgfVxuXG4gIGdldFByb3AocHJvcE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHsgZmllbGQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIGRlZmF1bHRUbyhmaWVsZCAmJiBmaWVsZC5nZXQocHJvcE5hbWUpLCB0aGlzLnByb3BzW3Byb3BOYW1lXSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbk1lc3NhZ2UgPSB0aGlzLnJlbmRlclZhbGlkYXRpb25NZXNzYWdlKCk7XG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMucmVuZGVyV3JhcHBlcigpO1xuICAgIGNvbnN0IGhlbHAgPSB0aGlzLnJlbmRlckhlbHBNZXNzYWdlKCk7XG4gICAgY29uc3QgeyBfaW5UYWJsZSB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gdGhpcy5oYXNGbG9hdExhYmVsID8gKFxuICAgICAgICBbXG4gICAgICAgICAgaXNWYWxpZEVsZW1lbnQod3JhcHBlcikgJiYgY2xvbmVFbGVtZW50KHdyYXBwZXIsIHsga2V5OiAnd3JhcHBlcicgfSksXG4gICAgICAgICAgPEFuaW1hdGUgdHJhbnNpdGlvbk5hbWU9XCJzaG93LWVycm9yXCIgY29tcG9uZW50PVwiXCIgdHJhbnNpdGlvbkFwcGVhciBrZXk9XCJ2YWxpZGF0aW9uLW1lc3NhZ2VcIj5cbiAgICAgICAgICAgIHt2YWxpZGF0aW9uTWVzc2FnZX1cbiAgICAgICAgICA8L0FuaW1hdGU+LFxuICAgICAgICAgIGhlbHAsXG4gICAgICAgIF1cbiAgICAgICkgOlxuICAgICAgX2luVGFibGUgP1xuICAgICAgICA8PlxuICAgICAgICAgIHt3cmFwcGVyfVxuICAgICAgICAgIHtoZWxwfVxuICAgICAgICA8Lz5cbiAgICAgICAgOiAoXG4gICAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICAgIHN1ZmZpeENscz17YGZvcm0tdG9vbHRpcCAke2dldENvbmZpZygncHJvUHJlZml4Q2xzJyl9LXRvb2x0aXBgfVxuICAgICAgICAgICAgdGl0bGU9e1xuICAgICAgICAgICAgICAhISh0aGlzLm11bHRpcGxlICYmIHRoaXMuZ2V0VmFsdWVzKCkubGVuZ3RoKSB8fFxuICAgICAgICAgICAgICB0aGlzLmlzVmFsaWRhdGlvbk1lc3NhZ2VIaWRkZW4odmFsaWRhdGlvbk1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgPyBudWxsXG4gICAgICAgICAgICAgICAgOiB2YWxpZGF0aW9uTWVzc2FnZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhlbWU9XCJsaWdodFwiXG4gICAgICAgICAgICBwbGFjZW1lbnQ9XCJib3R0b21MZWZ0XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7d3JhcHBlcn1cbiAgICAgICAgICAgIHtoZWxwfVxuICAgICAgICAgIDwvVG9vbHRpcD5cbiAgICAgICAgKTtcbiAgfVxufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ic2VydmVyRm9ybUZpZWxkPFQgZXh0ZW5kcyBGb3JtRmllbGRQcm9wcz4gZXh0ZW5kcyBGb3JtRmllbGQ8VCAmIEZvcm1GaWVsZFByb3BzPiB7XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSBGb3JtRmllbGQuZGVmYXVsdFByb3BzO1xufVxuIl0sInZlcnNpb24iOjN9