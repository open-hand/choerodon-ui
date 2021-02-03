import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { FormField } from '../field/FormField';
import autobind from '../_util/autobind';
import { $l } from '../locale-context';
export class Radio extends FormField {
    constructor() {
        super(...arguments);
        this.type = 'radio';
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('Radio', label ? 'value_missing' : 'value_missing_no_label', { label }),
        };
    }
    get checkedValue() {
        const { value = 'on' } = this.props;
        return value;
    }
    get isControlled() {
        return this.props.checked !== undefined;
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), ['value', 'readOnly', 'mode']);
        otherProps.type = this.type;
        // if (this.isReadOnly()) {
        //   otherProps.disabled = true;
        // }
        otherProps.onMouseDown = this.handleMouseDown;
        otherProps.onClick = otherProps.onChange;
        otherProps.onChange = noop;
        return otherProps;
    }
    renderWrapper() {
        const checked = this.isChecked();
        return (React.createElement(React.Fragment, null,
            React.createElement("label", Object.assign({ key: "wrapper" }, this.getWrapperProps()),
                React.createElement("input", Object.assign({}, this.getOtherProps(), { checked: checked, value: this.checkedValue })),
                this.renderInner(),
                this.getTextNode(),
                this.renderFloatLabel()),
            super.hasFloatLabel ? this.renderSwitchFloatLabel() : undefined));
    }
    /**
     * 解决form 在float的时候没有表头的问题
     * 也可以在需要不在组件内部展现label的时候使用
     */
    renderSwitchFloatLabel() { return undefined; }
    renderInner() {
        return React.createElement("span", { className: `${this.prefixCls}-inner` });
    }
    /**
     * 当使用label代替children时，不需要展示float label
     *
     * @readonly
     * @memberof Radio
     */
    get hasFloatLabel() {
        return this.getLabelChildren() ? false : super.hasFloatLabel;
    }
    /**
     * 没有children时，使用label替代children
     *
     * @returns {ReactNode} label
     * @memberof Radio
     */
    getLabelChildren() {
        const { labelLayout } = this;
        return (labelLayout &&
            !["horizontal" /* horizontal */, "vertical" /* vertical */, "none" /* none */].includes(labelLayout) &&
            this.getLabel());
    }
    getChildrenText() {
        return this.props.children;
    }
    getTextNode() {
        const { prefixCls } = this;
        const text = this.getChildrenText() || this.getLabelChildren();
        if (text) {
            return React.createElement("span", { className: `${prefixCls}-label` }, text);
        }
    }
    getWrapperClassNames(...args) {
        const { prefixCls, props: { mode }, } = this;
        return super.getWrapperClassNames({
            [`${prefixCls}-button`]: mode === "button" /* button */,
        }, ...args);
    }
    isChecked() {
        const { checked } = this.props;
        const { name, dataSet, checkedValue } = this;
        if (dataSet && name) {
            return this.getDataSetValue() === checkedValue;
        }
        return checked;
    }
    handleMouseDown(e) {
        // e.stopPropagation();
        const { onMouseDown } = this.props;
        if (typeof onMouseDown === 'function') {
            onMouseDown(e);
        }
    }
    handleChange(e) {
        const { onClick = noop } = this.props;
        const { checked } = e.target;
        onClick(e);
        this.setChecked(checked);
    }
    setChecked(checked) {
        if (checked) {
            this.setValue(this.checkedValue);
        }
    }
    getOldValue() {
        return this.isChecked() ? this.checkedValue : undefined;
    }
}
Radio.displayName = 'Radio';
Radio.propTypes = {
    /**
     * <受控>是否选中
     */
    checked: PropTypes.bool,
    /**
     * 初始是否选中
     */
    defaultChecked: PropTypes.bool,
    /**
     * 显示模式
     * 可选值： button | box
     * @default box
     */
    mode: PropTypes.oneOf(["button" /* button */, "box" /* box */]),
    ...FormField.propTypes,
};
Radio.defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'radio',
};
__decorate([
    computed
], Radio.prototype, "defaultValidationMessages", null);
__decorate([
    autobind
], Radio.prototype, "handleMouseDown", null);
__decorate([
    autobind
], Radio.prototype, "handleChange", null);
__decorate([
    action
], Radio.prototype, "setChecked", null);
let ObserverRadio = class ObserverRadio extends Radio {
};
ObserverRadio.defaultProps = Radio.defaultProps;
ObserverRadio = __decorate([
    observer
], ObserverRadio);
export default ObserverRadio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3JhZGlvL1JhZGlvLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFvQixNQUFNLE9BQU8sQ0FBQztBQUN6QyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDeEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxTQUFTLEVBQWtCLE1BQU0sb0JBQW9CLENBQUM7QUFDL0QsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFHekMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBb0J2QyxNQUFNLE9BQU8sS0FBNEIsU0FBUSxTQUF5QjtJQUExRTs7UUEwQkUsU0FBSSxHQUFXLE9BQU8sQ0FBQztJQStJekIsQ0FBQztJQTVJQyxJQUFJLHlCQUF5QjtRQUMzQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLE9BQU87WUFDTCxZQUFZLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUN6RixDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE1BQU0sRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNwQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUMx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QUFLLENBQUMsd0NBQStCLENBQUM7SUFDdEQsR0FBRyxTQUFTLENBQUMsU0FBUztDQUN2QixDQUFDO0FBRUssa0JBQVksR0FBRztJQUNwQixHQUFHLFNBQVMsQ0FBQyxZQUFZO0lBQ3pCLFNBQVMsRUFBRSxPQUFPO0NBQ25CLENBQUM7QUFLRjtJQURDLFFBQVE7c0RBTVI7QUE2R0Q7SUFEQyxRQUFROzRDQU9SO0FBR0Q7SUFEQyxRQUFRO3lDQU1SO0FBR0Q7SUFEQyxNQUFNO3VDQUtOO0FBUUgsSUFBcUIsYUFBYSxHQUFsQyxNQUFxQixhQUFjLFNBQVEsS0FBaUI7Q0FFM0QsQ0FBQTtBQURRLDBCQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUR0QixhQUFhO0lBRGpDLFFBQVE7R0FDWSxhQUFhLENBRWpDO2VBRm9CLGFBQWEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3JhZGlvL1JhZGlvLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgbm9vcCBmcm9tICdsb2Rhc2gvbm9vcCc7XG5pbXBvcnQgeyBGb3JtRmllbGQsIEZvcm1GaWVsZFByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uTWVzc2FnZXMgfSBmcm9tICcuLi92YWxpZGF0b3IvVmFsaWRhdG9yJztcbmltcG9ydCB7IFZpZXdNb2RlIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgTGFiZWxMYXlvdXQgfSBmcm9tICcuLi9mb3JtL2VudW0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJhZGlvUHJvcHMgZXh0ZW5kcyBGb3JtRmllbGRQcm9wcyB7XG4gIC8qKlxuICAgKiA85Y+X5o6nPuaYr+WQpumAieS4rVxuICAgKi9cbiAgY2hlY2tlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDliJ3lp4vmmK/lkKbpgInkuK1cbiAgICovXG4gIGRlZmF1bHRDaGVja2VkPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaYvuekuuaooeW8j1xuICAgKiDlj6/pgInlgLzvvJogYnV0dG9uIHwgYm94XG4gICAqIEBkZWZhdWx0IGJveFxuICAgKi9cbiAgbW9kZT86IFZpZXdNb2RlO1xufVxuXG5leHBvcnQgY2xhc3MgUmFkaW88VCBleHRlbmRzIFJhZGlvUHJvcHM+IGV4dGVuZHMgRm9ybUZpZWxkPFQgJiBSYWRpb1Byb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdSYWRpbyc7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiA85Y+X5o6nPuaYr+WQpumAieS4rVxuICAgICAqL1xuICAgIGNoZWNrZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIC8qKlxuICAgICAqIOWIneWni+aYr+WQpumAieS4rVxuICAgICAqL1xuICAgIGRlZmF1bHRDaGVja2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDmmL7npLrmqKHlvI9cbiAgICAgKiDlj6/pgInlgLzvvJogYnV0dG9uIHwgYm94XG4gICAgICogQGRlZmF1bHQgYm94XG4gICAgICovXG4gICAgbW9kZTogUHJvcFR5cGVzLm9uZU9mKFtWaWV3TW9kZS5idXR0b24sIFZpZXdNb2RlLmJveF0pLFxuICAgIC4uLkZvcm1GaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5Gb3JtRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ3JhZGlvJyxcbiAgfTtcblxuICB0eXBlOiBzdHJpbmcgPSAncmFkaW8nO1xuXG4gIEBjb21wdXRlZFxuICBnZXQgZGVmYXVsdFZhbGlkYXRpb25NZXNzYWdlcygpOiBWYWxpZGF0aW9uTWVzc2FnZXMge1xuICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRQcm9wKCdsYWJlbCcpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZU1pc3Npbmc6ICRsKCdSYWRpbycsIGxhYmVsID8gJ3ZhbHVlX21pc3NpbmcnIDogJ3ZhbHVlX21pc3Npbmdfbm9fbGFiZWwnLCB7IGxhYmVsIH0pLFxuICAgIH07XG4gIH1cblxuICBnZXQgY2hlY2tlZFZhbHVlKCkge1xuICAgIGNvbnN0IHsgdmFsdWUgPSAnb24nIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGdldCBpc0NvbnRyb2xsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY2hlY2tlZCAhPT0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFsndmFsdWUnLCAncmVhZE9ubHknLCAnbW9kZSddKTtcbiAgICBvdGhlclByb3BzLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAgLy8gaWYgKHRoaXMuaXNSZWFkT25seSgpKSB7XG4gICAgLy8gICBvdGhlclByb3BzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAvLyB9XG4gICAgb3RoZXJQcm9wcy5vbk1vdXNlRG93biA9IHRoaXMuaGFuZGxlTW91c2VEb3duO1xuICAgIG90aGVyUHJvcHMub25DbGljayA9IG90aGVyUHJvcHMub25DaGFuZ2U7XG4gICAgb3RoZXJQcm9wcy5vbkNoYW5nZSA9IG5vb3A7XG4gICAgcmV0dXJuIG90aGVyUHJvcHM7XG4gIH1cblxuICByZW5kZXJXcmFwcGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgY2hlY2tlZCA9IHRoaXMuaXNDaGVja2VkKCk7XG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICA8bGFiZWwga2V5PVwid3JhcHBlclwiIHsuLi50aGlzLmdldFdyYXBwZXJQcm9wcygpfT5cbiAgICAgICAgPGlucHV0IHsuLi50aGlzLmdldE90aGVyUHJvcHMoKX0gY2hlY2tlZD17Y2hlY2tlZH0gdmFsdWU9e3RoaXMuY2hlY2tlZFZhbHVlfSAvPlxuICAgICAgICB7dGhpcy5yZW5kZXJJbm5lcigpfVxuICAgICAgICB7dGhpcy5nZXRUZXh0Tm9kZSgpfVxuICAgICAgICB7dGhpcy5yZW5kZXJGbG9hdExhYmVsKCl9XG4gICAgICA8L2xhYmVsPlxuICAgICAge3N1cGVyLmhhc0Zsb2F0TGFiZWwgPyB0aGlzLnJlbmRlclN3aXRjaEZsb2F0TGFiZWwoKTogdW5kZWZpbmVkIH0gIFxuICAgICAgPC8+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDop6PlhrNmb3JtIOWcqGZsb2F055qE5pe25YCZ5rKh5pyJ6KGo5aS055qE6Zeu6aKYXG4gICAqIOS5n+WPr+S7peWcqOmcgOimgeS4jeWcqOe7hOS7tuWGhemDqOWxleeOsGxhYmVs55qE5pe25YCZ5L2/55SoXG4gICAqL1xuICByZW5kZXJTd2l0Y2hGbG9hdExhYmVsICgpOiBSZWFjdE5vZGUgfCB1bmRlZmluZWQgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG5cblxuICByZW5kZXJJbm5lcigpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2Ake3RoaXMucHJlZml4Q2xzfS1pbm5lcmB9IC8+O1xuICB9XG5cbiAgLyoqXG4gICAqIOW9k+S9v+eUqGxhYmVs5Luj5pu/Y2hpbGRyZW7ml7bvvIzkuI3pnIDopoHlsZXnpLpmbG9hdCBsYWJlbFxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICogQG1lbWJlcm9mIFJhZGlvXG4gICAqL1xuICBnZXQgaGFzRmxvYXRMYWJlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMYWJlbENoaWxkcmVuKCkgPyBmYWxzZSA6IHN1cGVyLmhhc0Zsb2F0TGFiZWw7XG4gIH1cblxuICAvKipcbiAgICog5rKh5pyJY2hpbGRyZW7ml7bvvIzkvb/nlKhsYWJlbOabv+S7o2NoaWxkcmVuXG4gICAqXG4gICAqIEByZXR1cm5zIHtSZWFjdE5vZGV9IGxhYmVsXG4gICAqIEBtZW1iZXJvZiBSYWRpb1xuICAgKi9cbiAgZ2V0TGFiZWxDaGlsZHJlbigpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgbGFiZWxMYXlvdXQgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChcbiAgICAgIGxhYmVsTGF5b3V0ICYmXG4gICAgICAhW0xhYmVsTGF5b3V0Lmhvcml6b250YWwsIExhYmVsTGF5b3V0LnZlcnRpY2FsLCBMYWJlbExheW91dC5ub25lXS5pbmNsdWRlcyhsYWJlbExheW91dCkgJiZcbiAgICAgIHRoaXMuZ2V0TGFiZWwoKVxuICAgICk7XG4gIH1cblxuICBnZXRDaGlsZHJlblRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gIH1cblxuICBnZXRUZXh0Tm9kZSgpIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXRDaGlsZHJlblRleHQoKSB8fCB0aGlzLmdldExhYmVsQ2hpbGRyZW4oKTtcbiAgICBpZiAodGV4dCkge1xuICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1sYWJlbGB9Pnt0ZXh0fTwvc3Bhbj47XG4gICAgfVxuICB9XG5cbiAgZ2V0V3JhcHBlckNsYXNzTmFtZXMoLi4uYXJncykge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHByb3BzOiB7IG1vZGUgfSxcbiAgICB9ID0gdGhpcztcbiAgICByZXR1cm4gc3VwZXIuZ2V0V3JhcHBlckNsYXNzTmFtZXMoXG4gICAgICB7XG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWJ1dHRvbmBdOiBtb2RlID09PSBWaWV3TW9kZS5idXR0b24sXG4gICAgICB9LFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICB9XG5cbiAgaXNDaGVja2VkKCkge1xuICAgIGNvbnN0IHsgY2hlY2tlZCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IG5hbWUsIGRhdGFTZXQsIGNoZWNrZWRWYWx1ZSB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCAmJiBuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREYXRhU2V0VmFsdWUoKSA9PT0gY2hlY2tlZFZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gY2hlY2tlZDtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVNb3VzZURvd24oZSkge1xuICAgIC8vIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgY29uc3QgeyBvbk1vdXNlRG93biB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodHlwZW9mIG9uTW91c2VEb3duID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbk1vdXNlRG93bihlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ2hhbmdlKGUpIHtcbiAgICBjb25zdCB7IG9uQ2xpY2sgPSBub29wIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgY2hlY2tlZCB9ID0gZS50YXJnZXQ7XG4gICAgb25DbGljayhlKTtcbiAgICB0aGlzLnNldENoZWNrZWQoY2hlY2tlZCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldENoZWNrZWQoY2hlY2tlZDogYm9vbGVhbikge1xuICAgIGlmIChjaGVja2VkKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRoaXMuY2hlY2tlZFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBnZXRPbGRWYWx1ZSgpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmlzQ2hlY2tlZCgpID8gdGhpcy5jaGVja2VkVmFsdWUgOiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZlclJhZGlvIGV4dGVuZHMgUmFkaW88UmFkaW9Qcm9wcz4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0gUmFkaW8uZGVmYXVsdFByb3BzO1xufVxuIl0sInZlcnNpb24iOjN9