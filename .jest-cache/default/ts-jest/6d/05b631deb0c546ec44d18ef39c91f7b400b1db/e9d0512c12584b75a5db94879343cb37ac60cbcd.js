import { __decorate } from "tslib";
import React, { createElement, isValidElement } from 'react';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FormField } from '../field/FormField';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import Icon from '../icon';
import { preventDefault, stopPropagation } from '../_util/EventManager';
import measureTextWidth from '../_util/measureTextWidth';
import Animate from '../animate';
import Tooltip from '../tooltip/Tooltip';
let PLACEHOLDER_SUPPORT;
export function isPlaceHolderSupport() {
    if (PLACEHOLDER_SUPPORT !== undefined) {
        return PLACEHOLDER_SUPPORT;
    }
    if (typeof window !== 'undefined') {
        return (PLACEHOLDER_SUPPORT = 'placeholder' in document.createElement('input'));
    }
    return true;
}
export class TextField extends FormField {
    constructor() {
        super(...arguments);
        this.type = 'text';
    }
    saveTagContainer(node) {
        this.tagContainer = node;
    }
    isEmpty() {
        return isEmpty(this.text) && super.isEmpty();
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'prefix',
            'suffix',
            'clearButton',
            'addonBefore',
            'addonAfter',
            'restrict',
            'placeholder',
            'placeHolder',
            'maxLengths',
            'autoComplete',
        ]);
        otherProps.type = this.type;
        otherProps.maxLength = this.getProp('maxLength');
        otherProps.onKeyDown = this.handleKeyDown;
        otherProps.autoComplete = this.props.autoComplete || getConfig('textFieldAutoComplete') || 'off';
        return otherProps;
    }
    getValidatorProps() {
        const pattern = this.getProp('pattern');
        const maxLength = this.getProp('maxLength');
        const minLength = this.getProp('minLength');
        return {
            ...super.getValidatorProps(),
            pattern,
            maxLength,
            minLength,
        };
    }
    getWrapperClassNames(...args) {
        const { prefixCls, multiple, range } = this;
        const suffix = this.getSuffix();
        const prefix = this.getPrefix();
        return super.getWrapperClassNames({
            [`${prefixCls}-empty`]: this.isEmpty(),
            [`${prefixCls}-suffix-button`]: isValidElement(suffix),
            [`${prefixCls}-multiple`]: multiple,
            [`${prefixCls}-range`]: range,
            [`${prefixCls}-prefix-button`]: isValidElement(prefix),
        }, ...args);
    }
    renderWrapper() {
        return this.renderGroup();
    }
    renderInputElement() {
        const { addonBefore, addonAfter } = this.props;
        const input = this.getWrappedEditor();
        const button = this.getInnerSpanButton();
        const suffix = this.getSuffix();
        const prefix = this.getPrefix();
        const otherPrevNode = this.getOtherPrevNode();
        const otherNextNode = this.getOtherNextNode();
        const placeholderDiv = this.renderPlaceHolder();
        const renderedValue = this.renderRenderedValue();
        const floatLabel = this.renderFloatLabel();
        const multipleHolder = this.renderMultipleHolder();
        const wrapperProps = this.getWrapperProps();
        // 修复设置宽度导致拥有addon出现宽度超出
        if (addonAfter || addonBefore) {
            wrapperProps.style = omit(wrapperProps.style, 'width');
        }
        const element = (React.createElement("span", Object.assign({ key: "element" }, wrapperProps),
            multipleHolder,
            otherPrevNode,
            placeholderDiv,
            renderedValue,
            React.createElement("label", { onMouseDown: this.handleMouseDown },
                prefix,
                input,
                floatLabel,
                button,
                suffix)));
        if (otherNextNode) {
            return (React.createElement(React.Fragment, null,
                element,
                otherNextNode));
        }
        return element;
    }
    renderGroup() {
        const { prefixCls, props: { addonBefore, addonAfter, showHelp }, } = this;
        const inputElement = this.renderInputElement();
        const help = showHelp === "tooltip" /* tooltip */ ? this.renderTooltipHelp() : null;
        if (!addonBefore && !addonAfter && !help) {
            return inputElement;
        }
        const classString = classNames(`${prefixCls}-group`, {
            [`${prefixCls}-float-label-group`]: this.hasFloatLabel,
        });
        return (React.createElement("div", { key: "wrapper", className: `${prefixCls}-group-wrapper` },
            React.createElement("div", Object.assign({}, this.getWrapperProps(), { className: classString }),
                this.wrapGroupItem(addonBefore, "before" /* before */),
                this.wrapGroupItem(inputElement, "input" /* input */),
                this.wrapGroupItem(help, "help" /* help */),
                this.wrapGroupItem(addonAfter, "after" /* after */))));
    }
    renderTooltipHelp() {
        return (React.createElement(Tooltip, { title: this.getProp('help'), placement: "bottom" },
            React.createElement(Icon, { type: "help" })));
    }
    getPlaceholders() {
        const { placeholder } = this.props;
        const holders = [];
        return placeholder ? holders.concat(placeholder) : holders;
    }
    getLabel() {
        const [placeholder] = this.getPlaceholders();
        if (this.isEmpty() && placeholder) {
            return placeholder;
        }
        return this.getProp('label');
    }
    wrapGroupItem(node, category) {
        const { prefixCls } = this;
        if (!node) {
            return null;
        }
        return React.createElement("div", { className: `${prefixCls}-group-${category}` }, node);
    }
    setRangeTarget(target) {
        if (this.text !== undefined) {
            this.prepareSetValue(this.text);
            this.setText();
        }
        super.setRangeTarget(target);
        defer(() => this.isFocused && this.select());
    }
    renderRangeEditor(props) {
        const { prefixCls, rangeTarget, isFocused } = this;
        const [startPlaceholder, endPlaceHolder = startPlaceholder] = this.getPlaceholders();
        const [startValue = '', endValue = ''] = this.processRangeValue();
        const editorStyle = {};
        if (rangeTarget === 1) {
            editorStyle.right = 0;
        }
        else {
            editorStyle.left = 0;
        }
        return (React.createElement("span", { key: "text", className: `${prefixCls}-range-text` },
            React.createElement("input", Object.assign({}, props, { className: `${prefixCls}-range-input`, key: "text", value: rangeTarget === undefined || !this.isFocused
                    ? ''
                    : this.text === undefined
                        ? rangeTarget === 0
                            ? startValue
                            : endValue
                        : this.text, placeholder: rangeTarget === undefined || !this.isFocused
                    ? ''
                    : rangeTarget === 0
                        ? startPlaceholder
                        : endPlaceHolder, readOnly: this.isReadOnly(), style: editorStyle })),
            React.createElement("input", { tabIndex: -1, className: `${prefixCls}-range-start`, onChange: noop, onMouseDown: this.handleRangeStart, value: rangeTarget === 0 && isFocused ? '' : startValue, placeholder: rangeTarget === 0 && isFocused ? '' : startPlaceholder, disabled: props.disabled === undefined ? false : props.disabled, readOnly: true }),
            React.createElement("span", { className: `${prefixCls}-range-split` }, "~"),
            React.createElement("input", { tabIndex: -1, className: `${prefixCls}-range-end`, onChange: noop, onMouseDown: this.handleRangeEnd, value: rangeTarget === 1 && isFocused ? '' : endValue, placeholder: rangeTarget === 1 && isFocused ? '' : endPlaceHolder, disabled: props.disabled === undefined ? false : props.disabled, readOnly: true })));
    }
    renderMultipleEditor(props) {
        const { style } = this.props;
        const { text } = this;
        const editorStyle = {};
        if (!this.editable) {
            editorStyle.position = 'absolute';
            editorStyle.left = 0;
            editorStyle.top = 0;
            editorStyle.zIndex = -1;
            props.readOnly = true;
        }
        else if (text) {
            editorStyle.width = pxToRem(measureTextWidth(text, style));
        }
        return (React.createElement("li", { key: "text" },
            React.createElement("input", Object.assign({}, props, { value: text || '', style: editorStyle }))));
    }
    getWrappedEditor() {
        return this.getEditor();
    }
    getClassName(...props) {
        const { prefixCls, format } = this;
        return super.getClassName({
            [`${prefixCls}-${format}`]: [
                "uppercase" /* uppercase */,
                "lowercase" /* lowercase */,
                "capitalize" /* capitalize */,
            ].includes(format),
        }, ...props);
    }
    getEditor() {
        const { prefixCls, multiple, range, props: { style }, } = this;
        const otherProps = this.getOtherProps();
        const { height } = (style || {});
        if (multiple) {
            return (React.createElement("div", { key: "text", className: otherProps.className },
                React.createElement(Animate, { component: "ul", componentProps: {
                        ref: this.saveTagContainer,
                        onScroll: stopPropagation,
                        style: height && height !== 'auto' ? { height: pxToRem(toPx(height) - 2) } : undefined,
                    }, transitionName: "zoom", exclusive: true, onEnd: this.handleTagAnimateEnd, onEnter: this.handleTagAnimateEnter },
                    this.renderMultipleValues(),
                    range
                        ? this.renderRangeEditor(otherProps)
                        : this.renderMultipleEditor({
                            ...otherProps,
                            className: `${prefixCls}-multiple-input`,
                        }))));
        }
        if (range) {
            return (React.createElement("span", { key: "text", className: otherProps.className }, this.renderRangeEditor(otherProps)));
        }
        const text = this.getTextNode();
        if (isValidElement(text)) {
            otherProps.style = { ...otherProps.style, textIndent: -1000 };
        }
        return (React.createElement("input", Object.assign({ key: "text" }, otherProps, { placeholder: this.hasFloatLabel ? undefined : this.getPlaceholders()[0], value: isString(text) ? text : this.getText(this.getValue()), readOnly: !this.editable })));
    }
    getSuffix() {
        const { suffix = this.getDefaultSuffix() } = this.props;
        if (suffix) {
            return this.wrapperSuffix(suffix);
        }
    }
    getDefaultSuffix() {
        return undefined;
    }
    wrapperSuffix(children, props) {
        const { prefixCls } = this;
        if (isValidElement(children)) {
            const { type } = children;
            const { onClick, ...otherProps } = children.props;
            if (onClick) {
                children = createElement(type, otherProps);
                props = {
                    onClick,
                    ...props,
                };
            }
        }
        return (React.createElement("div", Object.assign({ className: `${prefixCls}-suffix`, onMouseDown: preventDefault }, props), children));
    }
    getPrefix() {
        const { prefix } = this.props;
        if (prefix) {
            return this.wrapperPrefix(prefix);
        }
    }
    wrapperPrefix(children) {
        const { prefixCls } = this;
        return React.createElement("div", { className: `${prefixCls}-prefix` }, children);
    }
    renderMultipleHolder() {
        const { name, multiple } = this;
        if (multiple) {
            return (React.createElement("input", { key: "value", className: `${this.prefixCls}-multiple-value`, value: this.toValueString(this.getValue()) || '', name: name, onChange: noop }));
        }
    }
    getOtherPrevNode() {
        return undefined;
    }
    getOtherNextNode() {
        return undefined;
    }
    renderPlaceHolder() {
        if ((this.multiple || !isPlaceHolderSupport()) && !this.hasFloatLabel && !this.range) {
            return this.getPlaceHolderNode();
        }
    }
    renderRenderedValue() {
        const { prefixCls, range, multiple } = this;
        if (!range && !multiple) {
            const text = this.getTextNode();
            if ((!this.isFocused || !this.editable) && isValidElement(text)) {
                return (React.createElement("span", { key: "renderedText", className: `${prefixCls}-rendered-value` },
                    React.createElement("span", { className: `${prefixCls}-rendered-value-inner` }, text)));
            }
        }
    }
    getPlaceHolderNode() {
        const { prefixCls } = this;
        const [placeholder] = this.getPlaceholders();
        if (placeholder) {
            return React.createElement("div", { className: `${prefixCls}-placeholder` }, placeholder);
        }
    }
    getInnerSpanButton() {
        const { props: { clearButton }, prefixCls, } = this;
        if (clearButton && !this.isReadOnly()) {
            return this.wrapperInnerSpanButton(React.createElement(Icon, { type: "close", onClick: this.handleClearButtonClick }), {
                className: `${prefixCls}-clear-button`,
            });
        }
    }
    wrapperInnerSpanButton(children, props = {}) {
        const { prefixCls } = this;
        const { className, ...otherProps } = props;
        return (!this.isDisabled() && (React.createElement("div", Object.assign({ key: "inner-button" }, otherProps, { className: classNames(`${prefixCls}-inner-button`, className) }), children)));
    }
    removeLastValue() {
        const values = this.getValues();
        const value = values.pop();
        this.setValue(values);
        this.afterRemoveValue(value, -1);
    }
    handleTagAnimateEnd() { }
    handleTagAnimateEnter() {
        const { tagContainer } = this;
        const { style } = this.props;
        if (tagContainer && style && style.height) {
            if (tagContainer.scrollTo) {
                tagContainer.scrollTo(0, tagContainer.getBoundingClientRect().height);
            }
            else {
                tagContainer.scrollTop = tagContainer.getBoundingClientRect().height;
            }
        }
    }
    handleRangeStart(event) {
        // 进行切换的时候默认不会收起 popup 因为点击start的时候也会触发 trigger 的 handleClick
        // 导致在设置了 isClickToHide 的情况下回收起
        // handleRangeEnd 同理
        if (this.rangeTarget === 1 && this.isFocused) {
            event.preventDefault();
        }
        this.setRangeTarget(0);
    }
    handleRangeEnd(event) {
        if (this.rangeTarget === 0 && this.isFocused) {
            event.preventDefault();
        }
        this.setRangeTarget(1);
    }
    handleKeyDown(e) {
        const { disabled, clearButton } = this.props;
        if (!this.isReadOnly() && !disabled) {
            if (this.range && e.keyCode === KeyCode.TAB) {
                if (this.rangeTarget === 0 && !e.shiftKey) {
                    this.setRangeTarget(1);
                    e.preventDefault();
                }
                if (this.rangeTarget === 1 && e.shiftKey) {
                    this.setRangeTarget(0);
                    e.preventDefault();
                }
            }
            if (this.multiple) {
                if (!this.text) {
                    switch (e.keyCode) {
                        case KeyCode.DELETE:
                            this.clear();
                            break;
                        case KeyCode.BACKSPACE:
                            this.removeLastValue();
                            break;
                        default:
                    }
                }
            }
            else if (clearButton && !this.editable) {
                switch (e.keyCode) {
                    case KeyCode.DELETE:
                    case KeyCode.BACKSPACE:
                        this.clear();
                        break;
                    default:
                }
            }
        }
        super.handleKeyDown(e);
    }
    handleMouseDown(e) {
        if (e.target !== this.element) {
            e.preventDefault();
            if (!this.isFocused) {
                this.focus();
            }
        }
    }
    handleClearButtonClick() {
        this.setRangeTarget(0);
        this.clear();
    }
    handleFocus(e) {
        super.handleFocus(e);
        defer(() => this.isFocused && this.select());
    }
    handleBlur(e) {
        if (!e.isDefaultPrevented()) {
            if (this.editable) {
                this.syncValueOnBlur(e.target.value);
            }
            else if (!this.getValues().length) {
                this.setValue(null);
            }
        }
        super.handleBlur(e);
    }
    setValue(value) {
        super.setValue(value);
        this.setText(undefined);
    }
    getTextNode() {
        return this.text === undefined ? super.getTextNode() : this.text;
    }
    setText(text) {
        this.text = text;
    }
    select() {
        const { element } = this;
        if (element && this.editable) {
            element.select();
        }
    }
    handleChange(e) {
        const { target, type, target: { value }, } = e;
        if (type === 'compositionend') {
            this.lock = false;
        }
        if (!this.lock) {
            const restricted = this.restrictInput(value);
            if (restricted !== value) {
                const selectionEnd = target.selectionEnd + restricted.length - value.length;
                target.value = restricted;
                target.setSelectionRange(selectionEnd, selectionEnd);
            }
            this.setText(restricted);
        }
        else {
            this.setText(value);
        }
    }
    restrictInput(value) {
        const { restrict } = this.props;
        if (restrict) {
            return value.replace(new RegExp(`[^${restrict}]+`, 'g'), '');
        }
        return value;
    }
    toValueString(value) {
        if (isArray(value)) {
            return value.join(',');
        }
        return value;
    }
}
TextField.displayName = 'TextField';
TextField.propTypes = {
    /**
     * 占位词
     */
    placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    /**
     * 最小长度
     */
    minLength: PropTypes.number,
    /**
     * 最大长度
     */
    maxLength: PropTypes.number,
    /**
     * 正则校验
     */
    pattern: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * 自动完成
     */
    autoComplete: PropTypes.string,
    /**
     * 前缀
     */
    prefix: PropTypes.node,
    /**
     * 后缀
     */
    suffix: PropTypes.node,
    /**
     * 是否显示清除按钮
     */
    clearButton: PropTypes.bool,
    /**
     * 前置标签
     */
    addonBefore: PropTypes.node,
    /**
     * 后置标签
     */
    addonAfter: PropTypes.node,
    /**
     * 限制可输入的字符
     */
    restrict: PropTypes.string,
    ...FormField.propTypes,
};
TextField.defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'input',
    clearButton: false,
    multiple: false,
};
__decorate([
    observable
], TextField.prototype, "text", void 0);
__decorate([
    autobind
], TextField.prototype, "saveTagContainer", null);
__decorate([
    action
], TextField.prototype, "removeLastValue", null);
__decorate([
    autobind
], TextField.prototype, "handleTagAnimateEnter", null);
__decorate([
    autobind
], TextField.prototype, "handleRangeStart", null);
__decorate([
    autobind
], TextField.prototype, "handleRangeEnd", null);
__decorate([
    autobind
], TextField.prototype, "handleKeyDown", null);
__decorate([
    autobind
], TextField.prototype, "handleMouseDown", null);
__decorate([
    autobind
], TextField.prototype, "handleClearButtonClick", null);
__decorate([
    autobind
], TextField.prototype, "handleFocus", null);
__decorate([
    autobind
], TextField.prototype, "handleBlur", null);
__decorate([
    action
], TextField.prototype, "setValue", null);
__decorate([
    action
], TextField.prototype, "setText", null);
__decorate([
    autobind
], TextField.prototype, "handleChange", null);
let ObserverTextField = class ObserverTextField extends TextField {
};
ObserverTextField.defaultProps = TextField.defaultProps;
ObserverTextField = __decorate([
    observer
], ObserverTextField);
export default ObserverTextField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RleHQtZmllbGQvVGV4dEZpZWxkLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxhQUFhLEVBQWlCLGNBQWMsRUFBYSxNQUFNLE9BQU8sQ0FBQztBQUN2RixPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFNBQVMsRUFBa0IsTUFBTSxvQkFBb0IsQ0FBQztBQUMvRCxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxrQkFBa0IsQ0FBQztBQUN2QyxPQUFPLElBQUksTUFBTSxTQUFTLENBQUM7QUFFM0IsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLGdCQUFnQixNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLE9BQU8sTUFBTSxvQkFBb0IsQ0FB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QUFDLElBQUk7SUFDdEI7O09BRUc7SUFDSCxXQUFXLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDM0I7O09BRUc7SUFDSCxXQUFXLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDM0I7O09BRUc7SUFDSCxVQUFVLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDMUI7O09BRUc7SUFDSCxRQUFRLEVBQUUsU0FBUyxDQUFDLE1BQU07SUFDMUIsR0FBRyxTQUFTLENBQUMsU0FBUztDQUN2QixDQUFDO0FBRUssc0JBQVksR0FBRztJQUNwQixHQUFHLFNBQVMsQ0FBQyxZQUFZO0lBQ3pCLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLFFBQVEsRUFBRSxLQUFLO0NBQ2hCLENBQUM7QUFFVTtJQUFYLFVBQVU7dUNBQWU7QUFPMUI7SUFEQyxRQUFRO2lEQUdSO0FBd2NEO0lBREMsTUFBTTtnREFNTjtBQUtEO0lBREMsUUFBUTtzREFZUjtBQUdEO0lBREMsUUFBUTtpREFTUjtBQUdEO0lBREMsUUFBUTsrQ0FNUjtBQUdEO0lBREMsUUFBUTs4Q0FxQ1I7QUFHRDtJQURDLFFBQVE7Z0RBUVI7QUFHRDtJQURDLFFBQVE7dURBSVI7QUFHRDtJQURDLFFBQVE7NENBSVI7QUFHRDtJQURDLFFBQVE7MkNBVVI7QUFHRDtJQURDLE1BQU07eUNBSU47QUFPRDtJQURDLE1BQU07d0NBR047QUFVRDtJQURDLFFBQVE7NkNBc0JSO0FBbUJILElBQXFCLGlCQUFpQixHQUF0QyxNQUFxQixpQkFBa0IsU0FBUSxTQUF5QjtDQUV2RSxDQUFBO0FBRFEsOEJBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBRDFCLGlCQUFpQjtJQURyQyxRQUFRO0dBQ1ksaUJBQWlCLENBRXJDO2VBRm9CLGlCQUFpQiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vdGV4dC1maWVsZC9UZXh0RmllbGQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVFbGVtZW50LCBDU1NQcm9wZXJ0aWVzLCBpc1ZhbGlkRWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IGRlZmVyIGZyb20gJ2xvZGFzaC9kZWZlcic7XG5pbXBvcnQgaXNBcnJheSBmcm9tICdsb2Rhc2gvaXNBcnJheSc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJztcbmltcG9ydCBub29wIGZyb20gJ2xvZGFzaC9ub29wJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCBLZXlDb2RlIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvS2V5Q29kZSc7XG5pbXBvcnQgeyBweFRvUmVtLCB0b1B4IH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB7IEZvcm1GaWVsZCwgRm9ybUZpZWxkUHJvcHMgfSBmcm9tICcuLi9maWVsZC9Gb3JtRmllbGQnO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCBpc0VtcHR5IGZyb20gJy4uL191dGlsL2lzRW1wdHknO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgeyBWYWxpZGF0b3JQcm9wcyB9IGZyb20gJy4uL3ZhbGlkYXRvci9ydWxlcyc7XG5pbXBvcnQgeyBwcmV2ZW50RGVmYXVsdCwgc3RvcFByb3BhZ2F0aW9uIH0gZnJvbSAnLi4vX3V0aWwvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCBtZWFzdXJlVGV4dFdpZHRoIGZyb20gJy4uL191dGlsL21lYXN1cmVUZXh0V2lkdGgnO1xuaW1wb3J0IEFuaW1hdGUgZnJvbSAnLi4vYW5pbWF0ZSc7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi90b29sdGlwL1Rvb2x0aXAnO1xuaW1wb3J0IHsgR3JvdXBJdGVtQ2F0ZWdvcnkgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHsgU2hvd0hlbHAgfSBmcm9tICcuLi9maWVsZC9lbnVtJztcbmltcG9ydCB7IEZpZWxkRm9ybWF0IH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5cbmxldCBQTEFDRUhPTERFUl9TVVBQT1JUO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFjZUhvbGRlclN1cHBvcnQoKTogYm9vbGVhbiB7XG4gIGlmIChQTEFDRUhPTERFUl9TVVBQT1JUICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gUExBQ0VIT0xERVJfU1VQUE9SVDtcbiAgfVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gKFBMQUNFSE9MREVSX1NVUFBPUlQgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRleHRGaWVsZFByb3BzIGV4dGVuZHMgRm9ybUZpZWxkUHJvcHMge1xuICAvKipcbiAgICog5Y2g5L2N6K+NXG4gICAqL1xuICBwbGFjZWhvbGRlcj86IHN0cmluZyB8IHN0cmluZ1tdO1xuICAvKipcbiAgICog5pyA5bCP6ZW/5bqmXG4gICAqL1xuICBtaW5MZW5ndGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDmnIDlpKfplb/luqZcbiAgICovXG4gIG1heExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOato+WImeagoemqjFxuICAgKi9cbiAgcGF0dGVybj86IHN0cmluZyB8IFJlZ0V4cDtcbiAgLyoqXG4gICAqIOiHquWKqOWujOaIkFxuICAgKi9cbiAgYXV0b0NvbXBsZXRlPzogJ29uJyB8ICdvZmYnO1xuICAvKipcbiAgICog5YmN57yAXG4gICAqL1xuICBwcmVmaXg/OiBSZWFjdE5vZGU7XG4gIC8qKlxuICAgKiDlkI7nvIBcbiAgICovXG4gIHN1ZmZpeD86IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOaYr+WQpuaYvuekuua4hemZpOaMiemSrlxuICAgKi9cbiAgY2xlYXJCdXR0b24/OiBib29sZWFuO1xuICAvKipcbiAgICog5YmN572u5qCH562+XG4gICAqL1xuICBhZGRvbkJlZm9yZT86IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOWQjue9ruagh+etvlxuICAgKi9cbiAgYWRkb25BZnRlcj86IFJlYWN0Tm9kZTtcbiAgLyoqXG4gICAqIOmZkOWItuWPr+i+k+WFpeeahOWtl+esplxuICAgKi9cbiAgcmVzdHJpY3Q/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0RmllbGQ8VCBleHRlbmRzIFRleHRGaWVsZFByb3BzPiBleHRlbmRzIEZvcm1GaWVsZDxUPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdUZXh0RmllbGQnO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLyoqXG4gICAgICog5Y2g5L2N6K+NXG4gICAgICovXG4gICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpXSksXG4gICAgLyoqXG4gICAgICog5pyA5bCP6ZW/5bqmXG4gICAgICovXG4gICAgbWluTGVuZ3RoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIC8qKlxuICAgICAqIOacgOWkp+mVv+W6plxuICAgICAqL1xuICAgIG1heExlbmd0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICAvKipcbiAgICAgKiDmraPliJnmoKHpqoxcbiAgICAgKi9cbiAgICBwYXR0ZXJuOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMub2JqZWN0XSksXG4gICAgLyoqXG4gICAgICog6Ieq5Yqo5a6M5oiQXG4gICAgICovXG4gICAgYXV0b0NvbXBsZXRlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOWJjee8gFxuICAgICAqL1xuICAgIHByZWZpeDogUHJvcFR5cGVzLm5vZGUsXG4gICAgLyoqXG4gICAgICog5ZCO57yAXG4gICAgICovXG4gICAgc3VmZml4OiBQcm9wVHlwZXMubm9kZSxcbiAgICAvKipcbiAgICAgKiDmmK/lkKbmmL7npLrmuIXpmaTmjInpkq5cbiAgICAgKi9cbiAgICBjbGVhckJ1dHRvbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgLyoqXG4gICAgICog5YmN572u5qCH562+XG4gICAgICovXG4gICAgYWRkb25CZWZvcmU6IFByb3BUeXBlcy5ub2RlLFxuICAgIC8qKlxuICAgICAqIOWQjue9ruagh+etvlxuICAgICAqL1xuICAgIGFkZG9uQWZ0ZXI6IFByb3BUeXBlcy5ub2RlLFxuICAgIC8qKlxuICAgICAqIOmZkOWItuWPr+i+k+WFpeeahOWtl+esplxuICAgICAqL1xuICAgIHJlc3RyaWN0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC4uLkZvcm1GaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5Gb3JtRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ2lucHV0JyxcbiAgICBjbGVhckJ1dHRvbjogZmFsc2UsXG4gICAgbXVsdGlwbGU6IGZhbHNlLFxuICB9O1xuXG4gIEBvYnNlcnZhYmxlIHRleHQ/OiBzdHJpbmc7XG5cbiAgdHlwZTogc3RyaW5nID0gJ3RleHQnO1xuXG4gIHRhZ0NvbnRhaW5lcjogSFRNTFVMaXN0RWxlbWVudCB8IG51bGw7XG5cbiAgQGF1dG9iaW5kXG4gIHNhdmVUYWdDb250YWluZXIobm9kZSkge1xuICAgIHRoaXMudGFnQ29udGFpbmVyID0gbm9kZTtcbiAgfVxuXG4gIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIGlzRW1wdHkodGhpcy50ZXh0KSAmJiBzdXBlci5pc0VtcHR5KCk7XG4gIH1cblxuICBnZXRPdGhlclByb3BzKCkge1xuICAgIGNvbnN0IG90aGVyUHJvcHMgPSBvbWl0KHN1cGVyLmdldE90aGVyUHJvcHMoKSwgW1xuICAgICAgJ3ByZWZpeCcsXG4gICAgICAnc3VmZml4JyxcbiAgICAgICdjbGVhckJ1dHRvbicsXG4gICAgICAnYWRkb25CZWZvcmUnLFxuICAgICAgJ2FkZG9uQWZ0ZXInLFxuICAgICAgJ3Jlc3RyaWN0JyxcbiAgICAgICdwbGFjZWhvbGRlcicsXG4gICAgICAncGxhY2VIb2xkZXInLFxuICAgICAgJ21heExlbmd0aHMnLFxuICAgICAgJ2F1dG9Db21wbGV0ZScsXG4gICAgXSk7XG4gICAgb3RoZXJQcm9wcy50eXBlID0gdGhpcy50eXBlO1xuICAgIG90aGVyUHJvcHMubWF4TGVuZ3RoID0gdGhpcy5nZXRQcm9wKCdtYXhMZW5ndGgnKTtcbiAgICBvdGhlclByb3BzLm9uS2V5RG93biA9IHRoaXMuaGFuZGxlS2V5RG93bjtcbiAgICBvdGhlclByb3BzLmF1dG9Db21wbGV0ZSA9IHRoaXMucHJvcHMuYXV0b0NvbXBsZXRlIHx8IGdldENvbmZpZygndGV4dEZpZWxkQXV0b0NvbXBsZXRlJykgfHwgJ29mZic7XG4gICAgcmV0dXJuIG90aGVyUHJvcHM7XG4gIH1cblxuICBnZXRWYWxpZGF0b3JQcm9wcygpOiBWYWxpZGF0b3JQcm9wcyB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2V0UHJvcCgncGF0dGVybicpO1xuICAgIGNvbnN0IG1heExlbmd0aCA9IHRoaXMuZ2V0UHJvcCgnbWF4TGVuZ3RoJyk7XG4gICAgY29uc3QgbWluTGVuZ3RoID0gdGhpcy5nZXRQcm9wKCdtaW5MZW5ndGgnKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uc3VwZXIuZ2V0VmFsaWRhdG9yUHJvcHMoKSxcbiAgICAgIHBhdHRlcm4sXG4gICAgICBtYXhMZW5ndGgsXG4gICAgICBtaW5MZW5ndGgsXG4gICAgfTtcbiAgfVxuXG4gIGdldFdyYXBwZXJDbGFzc05hbWVzKC4uLmFyZ3MpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCBtdWx0aXBsZSwgcmFuZ2UgfSA9IHRoaXM7XG4gICAgY29uc3Qgc3VmZml4ID0gdGhpcy5nZXRTdWZmaXgoKTtcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLmdldFByZWZpeCgpO1xuICAgIHJldHVybiBzdXBlci5nZXRXcmFwcGVyQ2xhc3NOYW1lcyhcbiAgICAgIHtcbiAgICAgICAgW2Ake3ByZWZpeENsc30tZW1wdHlgXTogdGhpcy5pc0VtcHR5KCksXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LXN1ZmZpeC1idXR0b25gXTogaXNWYWxpZEVsZW1lbnQ8eyBvbkNsaWNrOyB9PihzdWZmaXgpLFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1tdWx0aXBsZWBdOiBtdWx0aXBsZSxcbiAgICAgICAgW2Ake3ByZWZpeENsc30tcmFuZ2VgXTogcmFuZ2UsXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LXByZWZpeC1idXR0b25gXTogaXNWYWxpZEVsZW1lbnQ8eyBvbkNsaWNrOyB9PihwcmVmaXgpLFxuICAgICAgfSxcbiAgICAgIC4uLmFyZ3MsXG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlcldyYXBwZXIoKTogUmVhY3ROb2RlIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJHcm91cCgpO1xuICB9XG5cbiAgcmVuZGVySW5wdXRFbGVtZW50KCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBhZGRvbkJlZm9yZSwgYWRkb25BZnRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuZ2V0V3JhcHBlZEVkaXRvcigpO1xuICAgIGNvbnN0IGJ1dHRvbiA9IHRoaXMuZ2V0SW5uZXJTcGFuQnV0dG9uKCk7XG4gICAgY29uc3Qgc3VmZml4ID0gdGhpcy5nZXRTdWZmaXgoKTtcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLmdldFByZWZpeCgpO1xuICAgIGNvbnN0IG90aGVyUHJldk5vZGUgPSB0aGlzLmdldE90aGVyUHJldk5vZGUoKTtcbiAgICBjb25zdCBvdGhlck5leHROb2RlID0gdGhpcy5nZXRPdGhlck5leHROb2RlKCk7XG4gICAgY29uc3QgcGxhY2Vob2xkZXJEaXYgPSB0aGlzLnJlbmRlclBsYWNlSG9sZGVyKCk7XG4gICAgY29uc3QgcmVuZGVyZWRWYWx1ZSA9IHRoaXMucmVuZGVyUmVuZGVyZWRWYWx1ZSgpO1xuICAgIGNvbnN0IGZsb2F0TGFiZWwgPSB0aGlzLnJlbmRlckZsb2F0TGFiZWwoKTtcbiAgICBjb25zdCBtdWx0aXBsZUhvbGRlciA9IHRoaXMucmVuZGVyTXVsdGlwbGVIb2xkZXIoKTtcbiAgICBjb25zdCB3cmFwcGVyUHJvcHMgPSB0aGlzLmdldFdyYXBwZXJQcm9wcygpO1xuXG4gICAgLy8g5L+u5aSN6K6+572u5a695bqm5a+86Ie05oul5pyJYWRkb27lh7rnjrDlrr3luqbotoXlh7pcbiAgICBpZiAoYWRkb25BZnRlciB8fCBhZGRvbkJlZm9yZSkge1xuICAgICAgd3JhcHBlclByb3BzLnN0eWxlID0gb21pdCh3cmFwcGVyUHJvcHMuc3R5bGUsICd3aWR0aCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSAoXG4gICAgICA8c3BhbiBrZXk9XCJlbGVtZW50XCIgey4uLndyYXBwZXJQcm9wc30+XG4gICAgICAgIHttdWx0aXBsZUhvbGRlcn1cbiAgICAgICAge290aGVyUHJldk5vZGV9XG4gICAgICAgIHtwbGFjZWhvbGRlckRpdn1cbiAgICAgICAge3JlbmRlcmVkVmFsdWV9XG4gICAgICAgIDxsYWJlbCBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuICAgICAgICAgIHtwcmVmaXh9XG4gICAgICAgICAge2lucHV0fVxuICAgICAgICAgIHtmbG9hdExhYmVsfVxuICAgICAgICAgIHtidXR0b259XG4gICAgICAgICAge3N1ZmZpeH1cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuXG4gICAgaWYgKG90aGVyTmV4dE5vZGUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDw+XG4gICAgICAgICAge2VsZW1lbnR9XG4gICAgICAgICAge290aGVyTmV4dE5vZGV9XG4gICAgICAgIDwvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHJlbmRlckdyb3VwKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHsgYWRkb25CZWZvcmUsIGFkZG9uQWZ0ZXIsIHNob3dIZWxwIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgaW5wdXRFbGVtZW50ID0gdGhpcy5yZW5kZXJJbnB1dEVsZW1lbnQoKTtcbiAgICBjb25zdCBoZWxwID0gc2hvd0hlbHAgPT09IFNob3dIZWxwLnRvb2x0aXAgPyB0aGlzLnJlbmRlclRvb2x0aXBIZWxwKCkgOiBudWxsO1xuXG4gICAgaWYgKCFhZGRvbkJlZm9yZSAmJiAhYWRkb25BZnRlciAmJiAhaGVscCkge1xuICAgICAgcmV0dXJuIGlucHV0RWxlbWVudDtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc1N0cmluZyA9IGNsYXNzTmFtZXMoYCR7cHJlZml4Q2xzfS1ncm91cGAsIHtcbiAgICAgIFtgJHtwcmVmaXhDbHN9LWZsb2F0LWxhYmVsLWdyb3VwYF06IHRoaXMuaGFzRmxvYXRMYWJlbCxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGtleT1cIndyYXBwZXJcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tZ3JvdXAtd3JhcHBlcmB9PlxuICAgICAgICA8ZGl2IHsuLi50aGlzLmdldFdyYXBwZXJQcm9wcygpfSBjbGFzc05hbWU9e2NsYXNzU3RyaW5nfT5cbiAgICAgICAgICB7dGhpcy53cmFwR3JvdXBJdGVtKGFkZG9uQmVmb3JlLCBHcm91cEl0ZW1DYXRlZ29yeS5iZWZvcmUpfVxuICAgICAgICAgIHt0aGlzLndyYXBHcm91cEl0ZW0oaW5wdXRFbGVtZW50LCBHcm91cEl0ZW1DYXRlZ29yeS5pbnB1dCl9XG4gICAgICAgICAge3RoaXMud3JhcEdyb3VwSXRlbShoZWxwLCBHcm91cEl0ZW1DYXRlZ29yeS5oZWxwKX1cbiAgICAgICAgICB7dGhpcy53cmFwR3JvdXBJdGVtKGFkZG9uQWZ0ZXIsIEdyb3VwSXRlbUNhdGVnb3J5LmFmdGVyKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyVG9vbHRpcEhlbHAoKTogUmVhY3ROb2RlIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFRvb2x0aXAgdGl0bGU9e3RoaXMuZ2V0UHJvcCgnaGVscCcpfSBwbGFjZW1lbnQ9XCJib3R0b21cIj5cbiAgICAgICAgPEljb24gdHlwZT1cImhlbHBcIiAvPlxuICAgICAgPC9Ub29sdGlwPlxuICAgICk7XG4gIH1cblxuICBnZXRQbGFjZWhvbGRlcnMoKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IHsgcGxhY2Vob2xkZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgaG9sZGVyczogc3RyaW5nW10gPSBbXTtcbiAgICByZXR1cm4gcGxhY2Vob2xkZXIgPyBob2xkZXJzLmNvbmNhdChwbGFjZWhvbGRlciEpIDogaG9sZGVycztcbiAgfVxuXG4gIGdldExhYmVsKCkge1xuICAgIGNvbnN0IFtwbGFjZWhvbGRlcl0gPSB0aGlzLmdldFBsYWNlaG9sZGVycygpO1xuICAgIGlmICh0aGlzLmlzRW1wdHkoKSAmJiBwbGFjZWhvbGRlcikge1xuICAgICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRQcm9wKCdsYWJlbCcpO1xuICB9XG5cbiAgd3JhcEdyb3VwSXRlbShub2RlOiBSZWFjdE5vZGUsIGNhdGVnb3J5OiBHcm91cEl0ZW1DYXRlZ29yeSk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWdyb3VwLSR7Y2F0ZWdvcnl9YH0+e25vZGV9PC9kaXY+O1xuICB9XG5cbiAgc2V0UmFuZ2VUYXJnZXQodGFyZ2V0KSB7XG4gICAgaWYgKHRoaXMudGV4dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnByZXBhcmVTZXRWYWx1ZSh0aGlzLnRleHQpO1xuICAgICAgdGhpcy5zZXRUZXh0KCk7XG4gICAgfVxuICAgIHN1cGVyLnNldFJhbmdlVGFyZ2V0KHRhcmdldCk7XG4gICAgZGVmZXIoKCkgPT4gdGhpcy5pc0ZvY3VzZWQgJiYgdGhpcy5zZWxlY3QoKSk7XG4gIH1cblxuICByZW5kZXJSYW5nZUVkaXRvcihwcm9wcykge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCByYW5nZVRhcmdldCwgaXNGb2N1c2VkIH0gPSB0aGlzO1xuICAgIGNvbnN0IFtzdGFydFBsYWNlaG9sZGVyLCBlbmRQbGFjZUhvbGRlciA9IHN0YXJ0UGxhY2Vob2xkZXJdID0gdGhpcy5nZXRQbGFjZWhvbGRlcnMoKTtcbiAgICBjb25zdCBbc3RhcnRWYWx1ZSA9ICcnLCBlbmRWYWx1ZSA9ICcnXSA9IHRoaXMucHJvY2Vzc1JhbmdlVmFsdWUoKTtcbiAgICBjb25zdCBlZGl0b3JTdHlsZSA9IHt9IGFzIENTU1Byb3BlcnRpZXM7XG4gICAgaWYgKHJhbmdlVGFyZ2V0ID09PSAxKSB7XG4gICAgICBlZGl0b3JTdHlsZS5yaWdodCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkaXRvclN0eWxlLmxlZnQgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4ga2V5PVwidGV4dFwiIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1yYW5nZS10ZXh0YH0+XG4gICAgICAgIHsvKiDnoa7kv50gcmFuZ2UtaW5wdXQg5Li656ys5LiA5LiqIOW9k+eCueWHu2xhYmVs55qE5pe25YCZ5Ye65LqG5Lya6K6pZWxlbWVudOiBmueEpuS7peWklui/mOS8muiuqSBsYWJlbOeahOesrOS4gOS4quihqOWNleWFg+e0oOiBmueEpiDlm6DmraTlr7zoh7TmhI/mlpnkuYvlpJbnmoRidWcgKi99XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcmFuZ2UtaW5wdXRgfVxuICAgICAgICAgIGtleT1cInRleHRcIlxuICAgICAgICAgIHZhbHVlPXtcbiAgICAgICAgICAgIHJhbmdlVGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgIXRoaXMuaXNGb2N1c2VkXG4gICAgICAgICAgICAgID8gJydcbiAgICAgICAgICAgICAgOiB0aGlzLnRleHQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8gcmFuZ2VUYXJnZXQgPT09IDBcbiAgICAgICAgICAgICAgICAgID8gc3RhcnRWYWx1ZVxuICAgICAgICAgICAgICAgICAgOiBlbmRWYWx1ZVxuICAgICAgICAgICAgICAgIDogdGhpcy50ZXh0XG4gICAgICAgICAgfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtcbiAgICAgICAgICAgIHJhbmdlVGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgIXRoaXMuaXNGb2N1c2VkXG4gICAgICAgICAgICAgID8gJydcbiAgICAgICAgICAgICAgOiByYW5nZVRhcmdldCA9PT0gMFxuICAgICAgICAgICAgICAgID8gc3RhcnRQbGFjZWhvbGRlclxuICAgICAgICAgICAgICAgIDogZW5kUGxhY2VIb2xkZXJcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVhZE9ubHk9e3RoaXMuaXNSZWFkT25seSgpfVxuICAgICAgICAgIHN0eWxlPXtlZGl0b3JTdHlsZX1cbiAgICAgICAgLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1yYW5nZS1zdGFydGB9XG4gICAgICAgICAgb25DaGFuZ2U9e25vb3B9XG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlUmFuZ2VTdGFydH1cbiAgICAgICAgICB2YWx1ZT17cmFuZ2VUYXJnZXQgPT09IDAgJiYgaXNGb2N1c2VkID8gJycgOiBzdGFydFZhbHVlfVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtyYW5nZVRhcmdldCA9PT0gMCAmJiBpc0ZvY3VzZWQgPyAnJyA6IHN0YXJ0UGxhY2Vob2xkZXJ9XG4gICAgICAgICAgZGlzYWJsZWQ9e3Byb3BzLmRpc2FibGVkID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIHJlYWRPbmx5XG4gICAgICAgIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1yYW5nZS1zcGxpdGB9Pn48L3NwYW4+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHRhYkluZGV4PXstMX1cbiAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcmFuZ2UtZW5kYH1cbiAgICAgICAgICBvbkNoYW5nZT17bm9vcH1cbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVSYW5nZUVuZH1cbiAgICAgICAgICB2YWx1ZT17cmFuZ2VUYXJnZXQgPT09IDEgJiYgaXNGb2N1c2VkID8gJycgOiBlbmRWYWx1ZX1cbiAgICAgICAgICBwbGFjZWhvbGRlcj17cmFuZ2VUYXJnZXQgPT09IDEgJiYgaXNGb2N1c2VkID8gJycgOiBlbmRQbGFjZUhvbGRlcn1cbiAgICAgICAgICBkaXNhYmxlZD17cHJvcHMuZGlzYWJsZWQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogcHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgcmVhZE9ubHlcbiAgICAgICAgLz5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyTXVsdGlwbGVFZGl0b3IocHJvcHM6IFQpIHtcbiAgICBjb25zdCB7IHN0eWxlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgdGV4dCB9ID0gdGhpcztcbiAgICBjb25zdCBlZGl0b3JTdHlsZSA9IHt9IGFzIENTU1Byb3BlcnRpZXM7XG4gICAgaWYgKCF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBlZGl0b3JTdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBlZGl0b3JTdHlsZS5sZWZ0ID0gMDtcbiAgICAgIGVkaXRvclN0eWxlLnRvcCA9IDA7XG4gICAgICBlZGl0b3JTdHlsZS56SW5kZXggPSAtMTtcbiAgICAgIHByb3BzLnJlYWRPbmx5ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRleHQpIHtcbiAgICAgIGVkaXRvclN0eWxlLndpZHRoID0gcHhUb1JlbShtZWFzdXJlVGV4dFdpZHRoKHRleHQsIHN0eWxlKSk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8bGkga2V5PVwidGV4dFwiPlxuICAgICAgICA8aW5wdXQgey4uLihwcm9wcyBhcyBPYmplY3QpfSB2YWx1ZT17dGV4dCB8fCAnJ30gc3R5bGU9e2VkaXRvclN0eWxlfSAvPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgZ2V0V3JhcHBlZEVkaXRvcigpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiB0aGlzLmdldEVkaXRvcigpO1xuICB9XG5cbiAgZ2V0Q2xhc3NOYW1lKC4uLnByb3BzKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHByZWZpeENscywgZm9ybWF0IH0gPSB0aGlzO1xuICAgIHJldHVybiBzdXBlci5nZXRDbGFzc05hbWUoXG4gICAgICB7XG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LSR7Zm9ybWF0fWBdOiBbXG4gICAgICAgICAgRmllbGRGb3JtYXQudXBwZXJjYXNlLFxuICAgICAgICAgIEZpZWxkRm9ybWF0Lmxvd2VyY2FzZSxcbiAgICAgICAgICBGaWVsZEZvcm1hdC5jYXBpdGFsaXplLFxuICAgICAgICBdLmluY2x1ZGVzKGZvcm1hdCBhcyBGaWVsZEZvcm1hdCksXG4gICAgICB9LFxuICAgICAgLi4ucHJvcHMsXG4gICAgKTtcbiAgfVxuXG4gIGdldEVkaXRvcigpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIG11bHRpcGxlLFxuICAgICAgcmFuZ2UsXG4gICAgICBwcm9wczogeyBzdHlsZSB9LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IG90aGVyUHJvcHMgPSB0aGlzLmdldE90aGVyUHJvcHMoKTtcbiAgICBjb25zdCB7IGhlaWdodCB9ID0gKHN0eWxlIHx8IHt9KSBhcyBDU1NQcm9wZXJ0aWVzO1xuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9XCJ0ZXh0XCIgY2xhc3NOYW1lPXtvdGhlclByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgICAgPEFuaW1hdGVcbiAgICAgICAgICAgIGNvbXBvbmVudD1cInVsXCJcbiAgICAgICAgICAgIGNvbXBvbmVudFByb3BzPXt7XG4gICAgICAgICAgICAgIHJlZjogdGhpcy5zYXZlVGFnQ29udGFpbmVyLFxuICAgICAgICAgICAgICBvblNjcm9sbDogc3RvcFByb3BhZ2F0aW9uLFxuICAgICAgICAgICAgICBzdHlsZTpcbiAgICAgICAgICAgICAgICBoZWlnaHQgJiYgaGVpZ2h0ICE9PSAnYXV0bycgPyB7IGhlaWdodDogcHhUb1JlbSh0b1B4KGhlaWdodCkhIC0gMikgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uTmFtZT1cInpvb21cIlxuICAgICAgICAgICAgZXhjbHVzaXZlXG4gICAgICAgICAgICBvbkVuZD17dGhpcy5oYW5kbGVUYWdBbmltYXRlRW5kfVxuICAgICAgICAgICAgb25FbnRlcj17dGhpcy5oYW5kbGVUYWdBbmltYXRlRW50ZXJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RoaXMucmVuZGVyTXVsdGlwbGVWYWx1ZXMoKX1cbiAgICAgICAgICAgIHtyYW5nZVxuICAgICAgICAgICAgICA/IHRoaXMucmVuZGVyUmFuZ2VFZGl0b3Iob3RoZXJQcm9wcylcbiAgICAgICAgICAgICAgOiB0aGlzLnJlbmRlck11bHRpcGxlRWRpdG9yKHtcbiAgICAgICAgICAgICAgICAuLi5vdGhlclByb3BzLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1tdWx0aXBsZS1pbnB1dGAsXG4gICAgICAgICAgICAgIH0gYXMgVCl9XG4gICAgICAgICAgPC9BbmltYXRlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4ga2V5PVwidGV4dFwiIGNsYXNzTmFtZT17b3RoZXJQcm9wcy5jbGFzc05hbWV9PlxuICAgICAgICAgIHt0aGlzLnJlbmRlclJhbmdlRWRpdG9yKG90aGVyUHJvcHMpfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXRUZXh0Tm9kZSgpO1xuXG4gICAgaWYgKGlzVmFsaWRFbGVtZW50KHRleHQpKSB7XG4gICAgICBvdGhlclByb3BzLnN0eWxlID0geyAuLi5vdGhlclByb3BzLnN0eWxlLCB0ZXh0SW5kZW50OiAtMTAwMCB9O1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIGtleT1cInRleHRcIlxuICAgICAgICB7Li4ub3RoZXJQcm9wc31cbiAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMuaGFzRmxvYXRMYWJlbCA/IHVuZGVmaW5lZCA6IHRoaXMuZ2V0UGxhY2Vob2xkZXJzKClbMF19XG4gICAgICAgIHZhbHVlPXtpc1N0cmluZyh0ZXh0KSA/IHRleHQgOiB0aGlzLmdldFRleHQodGhpcy5nZXRWYWx1ZSgpKX1cbiAgICAgICAgcmVhZE9ubHk9eyF0aGlzLmVkaXRhYmxlfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgZ2V0U3VmZml4KCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBzdWZmaXggPSB0aGlzLmdldERlZmF1bHRTdWZmaXgoKSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoc3VmZml4KSB7XG4gICAgICByZXR1cm4gdGhpcy53cmFwcGVyU3VmZml4KHN1ZmZpeCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGVmYXVsdFN1ZmZpeCgpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICB3cmFwcGVyU3VmZml4KGNoaWxkcmVuOiBSZWFjdE5vZGUsIHByb3BzPzogYW55KTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBpZiAoaXNWYWxpZEVsZW1lbnQ8YW55PihjaGlsZHJlbikpIHtcbiAgICAgIGNvbnN0IHsgdHlwZSB9ID0gY2hpbGRyZW47XG4gICAgICBjb25zdCB7IG9uQ2xpY2ssIC4uLm90aGVyUHJvcHMgfSA9IGNoaWxkcmVuLnByb3BzO1xuICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgY2hpbGRyZW4gPSBjcmVhdGVFbGVtZW50KHR5cGUsIG90aGVyUHJvcHMpO1xuICAgICAgICBwcm9wcyA9IHtcbiAgICAgICAgICBvbkNsaWNrLFxuICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tc3VmZml4YH0gb25Nb3VzZURvd249e3ByZXZlbnREZWZhdWx0fSB7Li4ucHJvcHN9PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZ2V0UHJlZml4KCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXggfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHByZWZpeCkge1xuICAgICAgcmV0dXJuIHRoaXMud3JhcHBlclByZWZpeChwcmVmaXgpO1xuICAgIH1cbiAgfVxuXG4gIHdyYXBwZXJQcmVmaXgoY2hpbGRyZW46IFJlYWN0Tm9kZSk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXM7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXByZWZpeGB9PntjaGlsZHJlbn08L2Rpdj47XG4gIH1cblxuICByZW5kZXJNdWx0aXBsZUhvbGRlcigpIHtcbiAgICBjb25zdCB7IG5hbWUsIG11bHRpcGxlIH0gPSB0aGlzO1xuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGlucHV0XG4gICAgICAgICAga2V5PVwidmFsdWVcIlxuICAgICAgICAgIGNsYXNzTmFtZT17YCR7dGhpcy5wcmVmaXhDbHN9LW11bHRpcGxlLXZhbHVlYH1cbiAgICAgICAgICB2YWx1ZT17dGhpcy50b1ZhbHVlU3RyaW5nKHRoaXMuZ2V0VmFsdWUoKSkgfHwgJyd9XG4gICAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgICBvbkNoYW5nZT17bm9vcH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZ2V0T3RoZXJQcmV2Tm9kZSgpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXRPdGhlck5leHROb2RlKCk6IFJlYWN0Tm9kZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJlbmRlclBsYWNlSG9sZGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgaWYgKCh0aGlzLm11bHRpcGxlIHx8ICFpc1BsYWNlSG9sZGVyU3VwcG9ydCgpKSAmJiAhdGhpcy5oYXNGbG9hdExhYmVsICYmICF0aGlzLnJhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQbGFjZUhvbGRlck5vZGUoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJSZW5kZXJlZFZhbHVlKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMsIHJhbmdlLCBtdWx0aXBsZSB9ID0gdGhpcztcbiAgICBpZiAoIXJhbmdlICYmICFtdWx0aXBsZSkge1xuICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZ2V0VGV4dE5vZGUoKTtcbiAgICAgIGlmICgoIXRoaXMuaXNGb2N1c2VkIHx8ICF0aGlzLmVkaXRhYmxlKSAmJiBpc1ZhbGlkRWxlbWVudCh0ZXh0KSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuIGtleT1cInJlbmRlcmVkVGV4dFwiIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1yZW5kZXJlZC12YWx1ZWB9PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXJlbmRlcmVkLXZhbHVlLWlubmVyYH0+e3RleHR9PC9zcGFuPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRQbGFjZUhvbGRlck5vZGUoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBjb25zdCBbcGxhY2Vob2xkZXJdID0gdGhpcy5nZXRQbGFjZWhvbGRlcnMoKTtcbiAgICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1wbGFjZWhvbGRlcmB9PntwbGFjZWhvbGRlcn08L2Rpdj47XG4gICAgfVxuICB9XG5cbiAgZ2V0SW5uZXJTcGFuQnV0dG9uKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHM6IHsgY2xlYXJCdXR0b24gfSxcbiAgICAgIHByZWZpeENscyxcbiAgICB9ID0gdGhpcztcbiAgICBpZiAoY2xlYXJCdXR0b24gJiYgIXRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy53cmFwcGVySW5uZXJTcGFuQnV0dG9uKFxuICAgICAgICA8SWNvbiB0eXBlPVwiY2xvc2VcIiBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsZWFyQnV0dG9uQ2xpY2t9IC8+LFxuICAgICAgICB7XG4gICAgICAgICAgY2xhc3NOYW1lOiBgJHtwcmVmaXhDbHN9LWNsZWFyLWJ1dHRvbmAsXG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHdyYXBwZXJJbm5lclNwYW5CdXR0b24oY2hpbGRyZW46IFJlYWN0Tm9kZSwgcHJvcHM6IGFueSA9IHt9KTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBjb25zdCB7IGNsYXNzTmFtZSwgLi4ub3RoZXJQcm9wcyB9ID0gcHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmlzRGlzYWJsZWQoKSAmJiAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBrZXk9XCJpbm5lci1idXR0b25cIlxuICAgICAgICAgIHsuLi5vdGhlclByb3BzfVxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhgJHtwcmVmaXhDbHN9LWlubmVyLWJ1dHRvbmAsIGNsYXNzTmFtZSl9XG4gICAgICAgID5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHJlbW92ZUxhc3RWYWx1ZSgpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzLnBvcCgpO1xuICAgIHRoaXMuc2V0VmFsdWUodmFsdWVzKTtcbiAgICB0aGlzLmFmdGVyUmVtb3ZlVmFsdWUodmFsdWUsIC0xKTtcbiAgfVxuXG4gIGhhbmRsZVRhZ0FuaW1hdGVFbmQoKSB7IH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlVGFnQW5pbWF0ZUVudGVyKCkge1xuICAgIGNvbnN0IHsgdGFnQ29udGFpbmVyIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgc3R5bGUgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHRhZ0NvbnRhaW5lciAmJiBzdHlsZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgIGlmICh0YWdDb250YWluZXIuc2Nyb2xsVG8pIHtcbiAgICAgICAgdGFnQ29udGFpbmVyLnNjcm9sbFRvKDAsIHRhZ0NvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFnQ29udGFpbmVyLnNjcm9sbFRvcCA9IHRhZ0NvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUmFuZ2VTdGFydChldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MSW5wdXRFbGVtZW50LCBNb3VzZUV2ZW50Pikge1xuICAgIC8vIOi/m+ihjOWIh+aNoueahOaXtuWAmem7mOiupOS4jeS8muaUtui1tyBwb3B1cCDlm6DkuLrngrnlh7tzdGFydOeahOaXtuWAmeS5n+S8muinpuWPkSB0cmlnZ2VyIOeahCBoYW5kbGVDbGlja1xuICAgIC8vIOWvvOiHtOWcqOiuvue9ruS6hiBpc0NsaWNrVG9IaWRlIOeahOaDheWGteS4i+WbnuaUtui1t1xuICAgIC8vIGhhbmRsZVJhbmdlRW5kIOWQjOeQhlxuICAgIGlmICh0aGlzLnJhbmdlVGFyZ2V0ID09PSAxICYmIHRoaXMuaXNGb2N1c2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICB0aGlzLnNldFJhbmdlVGFyZ2V0KDApO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVJhbmdlRW5kKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQsIE1vdXNlRXZlbnQ+KSB7XG4gICAgaWYgKHRoaXMucmFuZ2VUYXJnZXQgPT09IDAgJiYgdGhpcy5pc0ZvY3VzZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICAgIHRoaXMuc2V0UmFuZ2VUYXJnZXQoMSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgY29uc3QgeyBkaXNhYmxlZCwgY2xlYXJCdXR0b24gfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCF0aGlzLmlzUmVhZE9ubHkoKSAmJiAhZGlzYWJsZWQpIHtcbiAgICAgIGlmICh0aGlzLnJhbmdlICYmIGUua2V5Q29kZSA9PT0gS2V5Q29kZS5UQUIpIHtcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VUYXJnZXQgPT09IDAgJiYgIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICB0aGlzLnNldFJhbmdlVGFyZ2V0KDEpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yYW5nZVRhcmdldCA9PT0gMSAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgdGhpcy5zZXRSYW5nZVRhcmdldCgwKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgIGlmICghdGhpcy50ZXh0KSB7XG4gICAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgS2V5Q29kZS5ERUxFVEU6XG4gICAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUNvZGUuQkFDS1NQQUNFOlxuICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxhc3RWYWx1ZSgpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNsZWFyQnV0dG9uICYmICF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgY2FzZSBLZXlDb2RlLkRFTEVURTpcbiAgICAgICAgICBjYXNlIEtleUNvZGUuQkFDS1NQQUNFOlxuICAgICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzdXBlci5oYW5kbGVLZXlEb3duKGUpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZU1vdXNlRG93bihlKSB7XG4gICAgaWYgKGUudGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICghdGhpcy5pc0ZvY3VzZWQpIHtcbiAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVDbGVhckJ1dHRvbkNsaWNrKCkge1xuICAgIHRoaXMuc2V0UmFuZ2VUYXJnZXQoMCk7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUZvY3VzKGUpIHtcbiAgICBzdXBlci5oYW5kbGVGb2N1cyhlKTtcbiAgICBkZWZlcigoKSA9PiB0aGlzLmlzRm9jdXNlZCAmJiB0aGlzLnNlbGVjdCgpKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVCbHVyKGUpIHtcbiAgICBpZiAoIWUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgIGlmICh0aGlzLmVkaXRhYmxlKSB7XG4gICAgICAgIHRoaXMuc3luY1ZhbHVlT25CbHVyKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuZ2V0VmFsdWVzKCkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUobnVsbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLmhhbmRsZUJsdXIoZSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBzdXBlci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgdGhpcy5zZXRUZXh0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBnZXRUZXh0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09PSB1bmRlZmluZWQgPyAoc3VwZXIuZ2V0VGV4dE5vZGUoKSBhcyBzdHJpbmcpIDogdGhpcy50ZXh0O1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRUZXh0KHRleHQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICB9XG5cbiAgc2VsZWN0KCkge1xuICAgIGNvbnN0IHsgZWxlbWVudCB9ID0gdGhpcztcbiAgICBpZiAoZWxlbWVudCAmJiB0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBlbGVtZW50LnNlbGVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVDaGFuZ2UoZSkge1xuICAgIGNvbnN0IHtcbiAgICAgIHRhcmdldCxcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXQ6IHsgdmFsdWUgfSxcbiAgICB9ID0gZTtcbiAgICBpZiAodHlwZSA9PT0gJ2NvbXBvc2l0aW9uZW5kJykge1xuICAgICAgdGhpcy5sb2NrID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmxvY2spIHtcbiAgICAgIGNvbnN0IHJlc3RyaWN0ZWQgPSB0aGlzLnJlc3RyaWN0SW5wdXQodmFsdWUpO1xuICAgICAgaWYgKHJlc3RyaWN0ZWQgIT09IHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbkVuZCA9IHRhcmdldC5zZWxlY3Rpb25FbmQgKyByZXN0cmljdGVkLmxlbmd0aCAtIHZhbHVlLmxlbmd0aDtcbiAgICAgICAgdGFyZ2V0LnZhbHVlID0gcmVzdHJpY3RlZDtcbiAgICAgICAgdGFyZ2V0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvbkVuZCwgc2VsZWN0aW9uRW5kKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0VGV4dChyZXN0cmljdGVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRUZXh0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXN0cmljdElucHV0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgcmVzdHJpY3QgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHJlc3RyaWN0KSB7XG4gICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShuZXcgUmVnRXhwKGBbXiR7cmVzdHJpY3R9XStgLCAnZycpLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHRvVmFsdWVTdHJpbmcodmFsdWU6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuam9pbignLCcpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZlclRleHRGaWVsZCBleHRlbmRzIFRleHRGaWVsZDxUZXh0RmllbGRQcm9wcz4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0gVGV4dEZpZWxkLmRlZmF1bHRQcm9wcztcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==