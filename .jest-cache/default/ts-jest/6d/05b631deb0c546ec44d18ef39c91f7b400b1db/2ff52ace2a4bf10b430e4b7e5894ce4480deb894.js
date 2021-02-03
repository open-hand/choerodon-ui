import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Radio } from '../radio/Radio';
export class CheckBox extends Radio {
    constructor(props, context) {
        super(props, context);
        this.type = 'checkbox';
        runInAction(() => {
            this.value = this.props.defaultChecked ? this.checkedValue : this.unCheckedValue;
        });
    }
    get unCheckedValue() {
        const { unCheckedValue } = this.props;
        if (unCheckedValue !== undefined) {
            return unCheckedValue;
        }
        const { field } = this;
        if (field) {
            return field.get("falseValue" /* falseValue */);
        }
        return false;
    }
    get checkedValue() {
        const { value } = this.props;
        if (value !== undefined) {
            return value;
        }
        const { field } = this;
        if (field) {
            return field.get("trueValue" /* trueValue */);
        }
        return true;
    }
    getOtherProps() {
        return omit(super.getOtherProps(), [
            'defaultChecked',
            'unCheckedValue',
            'unCheckedChildren',
            'indeterminate',
        ]);
    }
    renderInner() {
        return React.createElement("i", { className: `${this.prefixCls}-inner` });
    }
    getChildrenText() {
        const { children, unCheckedChildren } = this.props;
        return this.isChecked() ? children : unCheckedChildren || children;
    }
    getWrapperClassNames() {
        const { prefixCls, props: { indeterminate }, } = this;
        return super.getWrapperClassNames({
            [`${prefixCls}-indeterminate`]: indeterminate,
        });
    }
    isChecked() {
        const { checked, indeterminate } = this.props;
        if (indeterminate) {
            return false;
        }
        const { name, dataSet, checkedValue } = this;
        if (dataSet && name) {
            return this.getValues().indexOf(checkedValue) !== -1;
        }
        if (checked !== undefined) {
            return checked;
        }
        return this.value === checkedValue;
    }
    getDataSetValues() {
        const values = this.getDataSetValue();
        if (values === undefined) {
            return [];
        }
        return [].concat(values);
    }
    setValue(value) {
        const { record, checkedValue, multiple } = this;
        if (record) {
            let values;
            if (multiple) {
                values = this.getValues();
                if (value === checkedValue) {
                    values.push(value);
                }
                else {
                    const index = values.indexOf(checkedValue);
                    if (index !== -1) {
                        values.splice(index, 1);
                    }
                }
            }
            else {
                values = value;
            }
            super.setValue(values);
        }
        else {
            super.setValue(value);
        }
    }
    setChecked(checked) {
        this.setValue(checked ? this.checkedValue : this.unCheckedValue);
    }
    getOldValue() {
        return this.isChecked() ? this.checkedValue : this.unCheckedValue;
    }
}
CheckBox.displayName = 'CheckBox';
CheckBox.propTypes = {
    /**
     * 中间状态
     */
    indeterminate: PropTypes.bool,
    /**
     * 未选中时的值
     */
    unCheckedValue: PropTypes.any,
    /**
     * 未选中时的内容
     */
    unCheckedChildren: PropTypes.node,
    defaultChecked: PropTypes.bool,
    ...Radio.propTypes,
};
/**
 * tooltip disable sign
 */
// eslint-disable-next-line camelcase
CheckBox.__Pro_CHECKBOX = true;
CheckBox.defaultProps = {
    ...Radio.defaultProps,
    suffixCls: 'checkbox',
    indeterminate: false,
};
__decorate([
    action
], CheckBox.prototype, "setValue", null);
__decorate([
    action
], CheckBox.prototype, "setChecked", null);
let ObserverCheckBox = class ObserverCheckBox extends CheckBox {
};
ObserverCheckBox.defaultProps = CheckBox.defaultProps;
ObserverCheckBox = __decorate([
    observer
], ObserverCheckBox);
export default ObserverCheckBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2NoZWNrLWJveC9DaGVja0JveC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBb0IsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxLQUFLLEVBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQW1CbkQsTUFBTSxPQUFPLFFBQWtDLFNBQVEsS0FBd0I7SUEwRDdFLFlBQVksS0FBSyxFQUFFLE9BQU87UUFDeEIsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQTNCeEIsU0FBSSxHQUFXLFVBQVUsQ0FBQztRQTRCeEIsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBN0JELElBQUksY0FBYztRQUNoQixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QyxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxjQUFjLENBQUM7U0FDdkI7UUFDRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksS0FBSyxFQUFFO1lBQ1QsT0FBTyxLQUFLLENBQUMsR0FBRywrQkFBeUIsQ0FBQztTQUMzQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELElB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QTtBQURRLDZCQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUR6QixnQkFBZ0I7SUFEcEMsUUFBUTtHQUNZLGdCQUFnQixDQUVwQztlQUZvQixnQkFBZ0IiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2NoZWNrLWJveC9DaGVja0JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgeyBhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgUmFkaW8sIFJhZGlvUHJvcHMgfSBmcm9tICcuLi9yYWRpby9SYWRpbyc7XG5pbXBvcnQgeyBCb29sZWFuVmFsdWUgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcblxuZXhwb3J0IGludGVyZmFjZSBDaGVja0JveFByb3BzIGV4dGVuZHMgUmFkaW9Qcm9wcyB7XG4gIC8qKlxuICAgKiDkuK3pl7TnirbmgIFcbiAgICovXG4gIGluZGV0ZXJtaW5hdGU/OiBib29sZWFuO1xuICAvKipcbiAgICog5pyq6YCJ5Lit5pe255qE5YC8XG4gICAqL1xuICB1bkNoZWNrZWRWYWx1ZT86IGFueTtcbiAgLyoqXG4gICAqIOmdnumAieS4reaXtueahOWGheWuuVxuICAgKi9cbiAgdW5DaGVja2VkQ2hpbGRyZW4/OiBSZWFjdE5vZGU7XG4gIGRlZmF1bHRDaGVja2VkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIENoZWNrQm94PFQgZXh0ZW5kcyBDaGVja0JveFByb3BzPiBleHRlbmRzIFJhZGlvPFQgJiBDaGVja0JveFByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdDaGVja0JveCc7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiDkuK3pl7TnirbmgIFcbiAgICAgKi9cbiAgICBpbmRldGVybWluYXRlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvKipcbiAgICAgKiDmnKrpgInkuK3ml7bnmoTlgLxcbiAgICAgKi9cbiAgICB1bkNoZWNrZWRWYWx1ZTogUHJvcFR5cGVzLmFueSxcbiAgICAvKipcbiAgICAgKiDmnKrpgInkuK3ml7bnmoTlhoXlrrlcbiAgICAgKi9cbiAgICB1bkNoZWNrZWRDaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgZGVmYXVsdENoZWNrZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIC4uLlJhZGlvLnByb3BUeXBlcyxcbiAgfTtcblxuICAvKipcbiAgICogdG9vbHRpcCBkaXNhYmxlIHNpZ25cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgc3RhdGljIF9fUHJvX0NIRUNLQk9YID0gdHJ1ZTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIC4uLlJhZGlvLmRlZmF1bHRQcm9wcyxcbiAgICBzdWZmaXhDbHM6ICdjaGVja2JveCcsXG4gICAgaW5kZXRlcm1pbmF0ZTogZmFsc2UsXG4gIH07XG5cbiAgdHlwZTogc3RyaW5nID0gJ2NoZWNrYm94JztcblxuICBnZXQgdW5DaGVja2VkVmFsdWUoKSB7XG4gICAgY29uc3QgeyB1bkNoZWNrZWRWYWx1ZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodW5DaGVja2VkVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuQ2hlY2tlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCB7IGZpZWxkIH0gPSB0aGlzO1xuICAgIGlmIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmdldChCb29sZWFuVmFsdWUuZmFsc2VWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldCBjaGVja2VkVmFsdWUoKSB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBjb25zdCB7IGZpZWxkIH0gPSB0aGlzO1xuICAgIGlmIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmdldChCb29sZWFuVmFsdWUudHJ1ZVZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5wcm9wcy5kZWZhdWx0Q2hlY2tlZCA/IHRoaXMuY2hlY2tlZFZhbHVlIDogdGhpcy51bkNoZWNrZWRWYWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE90aGVyUHJvcHMoKSB7XG4gICAgcmV0dXJuIG9taXQoc3VwZXIuZ2V0T3RoZXJQcm9wcygpLCBbXG4gICAgICAnZGVmYXVsdENoZWNrZWQnLFxuICAgICAgJ3VuQ2hlY2tlZFZhbHVlJyxcbiAgICAgICd1bkNoZWNrZWRDaGlsZHJlbicsXG4gICAgICAnaW5kZXRlcm1pbmF0ZScsXG4gICAgXSk7XG4gIH1cblxuICByZW5kZXJJbm5lcigpOiBSZWFjdE5vZGUge1xuICAgIHJldHVybiA8aSBjbGFzc05hbWU9e2Ake3RoaXMucHJlZml4Q2xzfS1pbm5lcmB9IC8+O1xuICB9XG5cbiAgZ2V0Q2hpbGRyZW5UZXh0KCkge1xuICAgIGNvbnN0IHsgY2hpbGRyZW4sIHVuQ2hlY2tlZENoaWxkcmVuIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB0aGlzLmlzQ2hlY2tlZCgpID8gY2hpbGRyZW4gOiB1bkNoZWNrZWRDaGlsZHJlbiB8fCBjaGlsZHJlbjtcbiAgfVxuXG4gIGdldFdyYXBwZXJDbGFzc05hbWVzKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIHByb3BzOiB7IGluZGV0ZXJtaW5hdGUgfSxcbiAgICB9ID0gdGhpcztcbiAgICByZXR1cm4gc3VwZXIuZ2V0V3JhcHBlckNsYXNzTmFtZXMoe1xuICAgICAgW2Ake3ByZWZpeENsc30taW5kZXRlcm1pbmF0ZWBdOiBpbmRldGVybWluYXRlLFxuICAgIH0pO1xuICB9XG5cbiAgaXNDaGVja2VkKCkge1xuICAgIGNvbnN0IHsgY2hlY2tlZCwgaW5kZXRlcm1pbmF0ZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoaW5kZXRlcm1pbmF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB7IG5hbWUsIGRhdGFTZXQsIGNoZWNrZWRWYWx1ZSB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCAmJiBuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZXMoKS5pbmRleE9mKGNoZWNrZWRWYWx1ZSkgIT09IC0xO1xuICAgIH1cbiAgICBpZiAoY2hlY2tlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY2hlY2tlZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudmFsdWUgPT09IGNoZWNrZWRWYWx1ZTtcbiAgfVxuXG4gIGdldERhdGFTZXRWYWx1ZXMoKTogYW55W10ge1xuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0RGF0YVNldFZhbHVlKCk7XG4gICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBbXS5jb25jYXQodmFsdWVzKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0VmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVjb3JkLCBjaGVja2VkVmFsdWUsIG11bHRpcGxlIH0gPSB0aGlzO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIGxldCB2YWx1ZXM7XG4gICAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgICAgdmFsdWVzID0gdGhpcy5nZXRWYWx1ZXMoKTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBjaGVja2VkVmFsdWUpIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSB2YWx1ZXMuaW5kZXhPZihjaGVja2VkVmFsdWUpO1xuICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzID0gdmFsdWU7XG4gICAgICB9XG4gICAgICBzdXBlci5zZXRWYWx1ZSh2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdXBlci5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBzZXRDaGVja2VkKGNoZWNrZWQpIHtcbiAgICB0aGlzLnNldFZhbHVlKGNoZWNrZWQgPyB0aGlzLmNoZWNrZWRWYWx1ZSA6IHRoaXMudW5DaGVja2VkVmFsdWUpO1xuICB9XG5cbiAgZ2V0T2xkVmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNDaGVja2VkKCkgPyB0aGlzLmNoZWNrZWRWYWx1ZSA6IHRoaXMudW5DaGVja2VkVmFsdWU7XG4gIH1cbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZlckNoZWNrQm94IGV4dGVuZHMgQ2hlY2tCb3g8Q2hlY2tCb3hQcm9wcz4ge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzID0gQ2hlY2tCb3guZGVmYXVsdFByb3BzO1xufVxuIl0sInZlcnNpb24iOjN9