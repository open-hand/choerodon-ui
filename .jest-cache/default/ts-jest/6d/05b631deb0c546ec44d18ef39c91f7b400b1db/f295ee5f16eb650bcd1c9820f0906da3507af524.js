import { __decorate } from "tslib";
import React from 'react';
import { observer } from 'mobx-react';
import { computed, isArrayLike } from 'mobx';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FormField } from '../field/FormField';
import autobind from '../_util/autobind';
import ObserverCheckBox from '../check-box/CheckBox';
import { processFieldValue } from '../data-set/utils';
let Output = class Output extends FormField {
    get editable() {
        return false;
    }
    handleChange() { }
    getOtherProps() {
        return omit(super.getOtherProps(), ['name']);
    }
    getValueKey(value) {
        if (isArrayLike(value)) {
            return value.map(this.getValueKey, this).join(',');
        }
        return this.processValue(value);
    }
    processValue(value) {
        if (!isNil(value)) {
            const text = isPlainObject(value) ? value : super.processValue(value);
            const { field, lang } = this;
            if (field) {
                return processFieldValue(text, field, lang, true);
            }
            return text;
        }
        return '';
    }
    defaultRenderer({ value, text, repeat, maxTagTextLength }) {
        const { field } = this;
        if (field && field.type === "boolean" /* boolean */) {
            return React.createElement(ObserverCheckBox, { disabled: true, checked: value === field.get("trueValue" /* trueValue */) });
        }
        return super.defaultRenderer({ text, repeat, maxTagTextLength });
    }
    getRenderedValue() {
        const { multiple, range, multiLine } = this;
        if (multiple) {
            return this.renderMultipleValues(true);
        }
        if (range) {
            return this.renderRangeValue(true);
        }
        /**
         * 多行单元格渲染
         */
        if (multiLine) {
            return this.renderMultiLine(true);
        }
        return this.getTextNode() || getConfig('tableDefaultRenderer');
    }
    renderWrapper() {
        return React.createElement("span", Object.assign({}, this.getMergedProps()), this.getRenderedValue());
    }
};
Output.displayName = 'Output';
Output.defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'output',
};
__decorate([
    computed
], Output.prototype, "editable", null);
__decorate([
    autobind
], Output.prototype, "handleChange", null);
__decorate([
    autobind
], Output.prototype, "defaultRenderer", null);
Output = __decorate([
    observer
], Output);
export default Output;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL291dHB1dC9PdXRwdXQudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQW9CLE1BQU0sT0FBTyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDN0MsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFNBQVMsRUFBK0IsTUFBTSxvQkFBb0IsQ0FBQztBQUM1RSxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUV6QyxPQUFPLGdCQUFnQixNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBS3RELElBQXFCLE1BQU0sR0FBM0IsTUFBcUIsTUFBTyxTQUFRLFNBQXNCO0lBU3hELElBQUksUUFBUTtRQUNWLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUdELFlBQVksS0FBSSxDQUFDO0lBRWpCLGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBSztRQUNmLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwRDtRQUNELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsWUFBWSxDQUFDLEtBQVU7UUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQixNQUFNLElBQUksR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLEtBQUssRUFBRTtnQkFDVCxPQUFPLGlCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25EO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUdELGVBQWUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFlO1FBQ3BFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksNEJBQXNCLEVBQUU7WUFDN0MsT0FBTyxvQkFBQyxnQkFBZ0IsSUFBQyxRQUFRLFFBQUMsT0FBTyxFQUFFLEtBQUssS0FBSyxLQUFLLENBQUMsR0FBRyw2QkFBd0IsR0FBSSxDQUFDO1NBQzVGO1FBQ0QsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELGdCQUFnQjtRQUNkLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUM1QyxJQUFJLFFBQVEsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxLQUFLLEVBQUU7WUFDVCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQztRQUNEOztXQUVHO1FBQ0gsSUFBSSxTQUFTLEVBQUU7WUFDYixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU8sOENBQVUsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFRLENBQUM7SUFDM0UsQ0FBQztDQUNGLENBQUE7QUFuRVEsa0JBQVcsR0FBRyxRQUFRLENBQUM7QUFFdkIsbUJBQVksR0FBRztJQUNwQixHQUFHLFNBQVMsQ0FBQyxZQUFZO0lBQ3pCLFNBQVMsRUFBRSxRQUFRO0NBQ3BCLENBQUM7QUFHRjtJQURDLFFBQVE7c0NBR1I7QUFHRDtJQURDLFFBQVE7MENBQ1E7QUEwQmpCO0lBREMsUUFBUTs2Q0FPUjtBQTlDa0IsTUFBTTtJQUQxQixRQUFRO0dBQ1ksTUFBTSxDQW9FMUI7ZUFwRW9CLE1BQU0iLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL291dHB1dC9PdXRwdXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgY29tcHV0ZWQsIGlzQXJyYXlMaWtlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdsb2Rhc2gvaXNQbGFpbk9iamVjdCc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB7IEZvcm1GaWVsZCwgRm9ybUZpZWxkUHJvcHMsIFJlbmRlclByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBCb29sZWFuVmFsdWUsIEZpZWxkVHlwZSB9IGZyb20gJy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IE9ic2VydmVyQ2hlY2tCb3ggZnJvbSAnLi4vY2hlY2stYm94L0NoZWNrQm94JztcbmltcG9ydCB7IHByb2Nlc3NGaWVsZFZhbHVlIH0gZnJvbSAnLi4vZGF0YS1zZXQvdXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE91dHB1dFByb3BzIGV4dGVuZHMgRm9ybUZpZWxkUHJvcHMge31cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXQgZXh0ZW5kcyBGb3JtRmllbGQ8T3V0cHV0UHJvcHM+IHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ091dHB1dCc7XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5Gb3JtRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ291dHB1dCcsXG4gIH07XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBlZGl0YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQ2hhbmdlKCkge31cblxuICBnZXRPdGhlclByb3BzKCkge1xuICAgIHJldHVybiBvbWl0KHN1cGVyLmdldE90aGVyUHJvcHMoKSwgWyduYW1lJ10pO1xuICB9XG5cbiAgZ2V0VmFsdWVLZXkodmFsdWUpIHtcbiAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUubWFwKHRoaXMuZ2V0VmFsdWVLZXksIHRoaXMpLmpvaW4oJywnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1ZhbHVlKHZhbHVlKTtcbiAgfVxuXG4gIHByb2Nlc3NWYWx1ZSh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoIWlzTmlsKHZhbHVlKSkge1xuICAgICAgY29uc3QgdGV4dCA9IGlzUGxhaW5PYmplY3QodmFsdWUpID8gdmFsdWUgOiBzdXBlci5wcm9jZXNzVmFsdWUodmFsdWUpO1xuICAgICAgY29uc3QgeyBmaWVsZCwgbGFuZyB9ID0gdGhpcztcbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0ZpZWxkVmFsdWUodGV4dCwgZmllbGQsIGxhbmcsIHRydWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBkZWZhdWx0UmVuZGVyZXIoeyB2YWx1ZSwgdGV4dCwgcmVwZWF0LCBtYXhUYWdUZXh0TGVuZ3RoIH06IFJlbmRlclByb3BzKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IGZpZWxkIH0gPSB0aGlzO1xuICAgIGlmIChmaWVsZCAmJiBmaWVsZC50eXBlID09PSBGaWVsZFR5cGUuYm9vbGVhbikge1xuICAgICAgcmV0dXJuIDxPYnNlcnZlckNoZWNrQm94IGRpc2FibGVkIGNoZWNrZWQ9e3ZhbHVlID09PSBmaWVsZC5nZXQoQm9vbGVhblZhbHVlLnRydWVWYWx1ZSl9IC8+O1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZGVmYXVsdFJlbmRlcmVyKHsgdGV4dCwgcmVwZWF0LCBtYXhUYWdUZXh0TGVuZ3RoIH0pO1xuICB9XG5cbiAgZ2V0UmVuZGVyZWRWYWx1ZSgpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgbXVsdGlwbGUsIHJhbmdlLCBtdWx0aUxpbmUgfSA9IHRoaXM7XG4gICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJNdWx0aXBsZVZhbHVlcyh0cnVlKTtcbiAgICB9XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJSYW5nZVZhbHVlKHRydWUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiDlpJrooYzljZXlhYPmoLzmuLLmn5NcbiAgICAgKi9cbiAgICBpZiAobXVsdGlMaW5lKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJNdWx0aUxpbmUodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFRleHROb2RlKCkgfHwgZ2V0Q29uZmlnKCd0YWJsZURlZmF1bHRSZW5kZXJlcicpO1xuICB9XG5cbiAgcmVuZGVyV3JhcHBlcigpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiA8c3BhbiB7Li4udGhpcy5nZXRNZXJnZWRQcm9wcygpfT57dGhpcy5nZXRSZW5kZXJlZFZhbHVlKCl9PC9zcGFuPjtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9