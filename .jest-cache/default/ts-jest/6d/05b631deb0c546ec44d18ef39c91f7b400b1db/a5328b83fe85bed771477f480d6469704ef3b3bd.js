import { __decorate } from "tslib";
import { createElement } from 'react';
import PropTypes from 'prop-types';
import moment, { isMoment } from 'moment';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import TriggerField from '../trigger-field/TriggerField';
import DaysView from './DaysView';
import DateTimesView from './DateTimesView';
import WeeksView from './WeeksView';
import TimesView from './TimesView';
import MonthsView from './MonthsView';
import YearsView from './YearsView';
import DecadeYearsView from './DecadeYearsView';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { $l } from '../locale-context';
import isSame from '../_util/isSame';
import formatString from '../formatter/formatString';
const viewComponents = {
    ["decade" /* decade */]: DecadeYearsView,
    ["year" /* year */]: YearsView,
    ["month" /* month */]: MonthsView,
    ["date" /* date */]: DaysView,
    ["dateTime" /* dateTime */]: DateTimesView,
    ["week" /* week */]: WeeksView,
    ["time" /* time */]: TimesView,
};
let DatePicker = class DatePicker extends TriggerField {
    get value() {
        const { value } = this.observableProps;
        const { range } = this;
        if (isArrayLike(value)) {
            return value.map(item => {
                if (isArrayLike(item)) {
                    return item.map(this.checkMoment, this);
                }
                return this.checkMoment(item);
            });
        }
        if (isArrayLike(range)) {
            if (isPlainObject(value)) {
                const [start, end] = range;
                return {
                    [start]: this.checkMoment(value[start]),
                    [end]: this.checkMoment(value[end]),
                };
            }
        }
        return this.checkMoment(value);
    }
    set value(value) {
        runInAction(() => {
            this.observableProps.value = value;
        });
    }
    get defaultValidationMessages() {
        const label = this.getProp('label');
        return {
            valueMissing: $l('DatePicker', label ? 'value_missing' : 'value_missing_no_label', {
                label,
            }),
        };
    }
    get editable() {
        const mode = this.getViewMode();
        return super.editable && mode !== "week" /* week */;
    }
    get min() {
        return this.getLimit('min');
    }
    get max() {
        return this.getLimit('max');
    }
    getOtherProps() {
        return omit(super.getOtherProps(), ['mode', 'filter', 'cellRenderer']);
    }
    getDefaultViewMode() {
        const { mode } = this.props;
        if (mode === "decade" /* decade */ || mode === undefined) {
            return "date" /* date */;
        }
        return mode;
    }
    getPopupContent() {
        const mode = this.getViewMode();
        return createElement(viewComponents[mode], {
            ref: node => (this.view = node),
            date: this.getSelectedDate(),
            mode: this.getDefaultViewMode(),
            renderer: this.getCellRenderer(mode),
            onSelect: this.handleSelect,
            onSelectedDateChange: this.handleSelectedDateChange,
            onViewModeChange: this.handelViewModeChange,
            isValidDate: this.isValidDate,
            format: this.getDateFormat(),
            step: this.getProp('step') || {},
        });
    }
    getCellRenderer(mode) {
        const { cellRenderer = noop } = this.props;
        return cellRenderer(mode);
    }
    getTriggerIconFont() {
        return 'date_range';
    }
    getFieldType() {
        return viewComponents[this.getDefaultViewMode()].type;
    }
    getViewMode() {
        const { mode = this.getDefaultViewMode() } = this;
        return mode;
    }
    checkMoment(item) {
        if (!isNil(item) && !isMoment(item)) {
            warning(false, `DatePicker: The value of DatePicker is not moment.`);
            const format = this.getDateFormat();
            if (item instanceof Date) {
                item = moment(item).format(format);
            }
            return moment(item, format);
        }
        return item;
    }
    // 避免出现影响过多组件使用继承覆盖原有方法 Fix onchange moment use ValueOf to get the Timestamp compare
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
            if (!isSame(this.momentToTimestamp(old), this.momentToTimestamp(value))) {
                onChange(value, toJS(old), formNode);
            }
            this.value = value;
        }
        this.setText(undefined);
    }
    momentToTimestamp(value) {
        if (isMoment(value)) {
            return moment(value).valueOf();
        }
        return value;
    }
    // processValue(value: any): ReactNode {
    //   return super.processValue(this.checkMoment(value));
    // }
    getSelectedDate() {
        const { range, multiple, rangeTarget, rangeValue } = this;
        const selectedDate = this.selectedDate ||
            (range && !multiple && rangeTarget !== undefined && rangeValue && rangeValue[rangeTarget]) ||
            (!multiple && this.getValue());
        if (isMoment(selectedDate) && selectedDate.isValid()) {
            return selectedDate.clone();
        }
        return this.getValidDate(moment().startOf('d'));
    }
    getLimit(minOrMax) {
        const limit = this.getProp(minOrMax);
        if (!isNil(limit)) {
            const { record } = this;
            if (record && isString(limit) && record.getField(limit)) {
                return record.get(limit) ? this.getLimitWithType(moment(record.get(limit)), minOrMax) : record.get(limit);
            }
            return this.getLimitWithType(moment(limit), minOrMax);
        }
    }
    getLimitWithType(limit, minOrMax) {
        if (minOrMax === 'min') {
            return limit.startOf('d');
        }
        return limit.endOf('d');
    }
    getPopupStyleFromAlign() {
        return undefined;
    }
    handleSelectedDateChange(selectedDate, mode) {
        if (this.isUnderRange(selectedDate, mode)) {
            this.changeSelectedDate(selectedDate);
        }
    }
    handelViewModeChange(mode) {
        runInAction(() => {
            this.mode = mode;
        });
    }
    handlePopupAnimateAppear() {
    }
    handlePopupAnimateEnd(key, exists) {
        if (!exists && key === 'align') {
            runInAction(() => {
                this.selectedDate = undefined;
                this.mode = undefined;
            });
        }
    }
    handleSelect(date) {
        if (this.multiple && this.isSelected(date)) {
            this.unChoose(date);
        }
        else {
            this.choose(date);
        }
    }
    handleKeyDown(e) {
        if (!this.isDisabled() && !this.isReadOnly()) {
            const el = this.popup ? this.view || this : this;
            switch (e.keyCode) {
                case KeyCode.RIGHT:
                    el.handleKeyDownRight(e);
                    break;
                case KeyCode.LEFT:
                    el.handleKeyDownLeft(e);
                    break;
                case KeyCode.DOWN:
                    el.handleKeyDownDown(e);
                    break;
                case KeyCode.UP:
                    el.handleKeyDownUp(e);
                    break;
                case KeyCode.END:
                    el.handleKeyDownEnd(e);
                    break;
                case KeyCode.HOME:
                    el.handleKeyDownHome(e);
                    break;
                case KeyCode.PAGE_UP:
                    el.handleKeyDownPageUp(e);
                    break;
                case KeyCode.PAGE_DOWN:
                    el.handleKeyDownPageDown(e);
                    break;
                case KeyCode.ENTER:
                    el.handleKeyDownEnter(e);
                    break;
                case KeyCode.TAB:
                    this.handleKeyDownTab();
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
    handleKeyDownHome(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().startOf('M'));
        }
    }
    handleKeyDownEnd(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().endOf('M'));
        }
    }
    handleKeyDownLeft(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().subtract(1, 'd'));
        }
    }
    handleKeyDownRight(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().add(1, 'd'));
        }
    }
    handleKeyDownUp(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().subtract(1, 'w'));
        }
    }
    handleKeyDownDown(e) {
        if (this.multiple) {
            this.expand();
        }
        else if (!this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().add(1, 'w'));
        }
    }
    handleKeyDownPageUp(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().subtract(1, e.altKey ? 'y' : 'M'));
        }
    }
    handleKeyDownPageDown(e) {
        if (!this.multiple && !this.editable) {
            stopEvent(e);
            this.choose(this.getSelectedDate().add(1, e.altKey ? 'y' : 'M'));
        }
    }
    handleKeyDownEnter(_e) {
        if (!this.multiple && !this.editable) {
            this.choose(this.getSelectedDate());
        }
    }
    handleKeyDownEsc(e) {
        if (this.popup) {
            e.preventDefault();
            this.collapse();
        }
    }
    handleKeyDownTab() {
        // this.collapse();
    }
    handleKeyDownSpace(e) {
        e.preventDefault();
        if (!this.popup) {
            this.expand();
        }
    }
    handleEnterDown(e) {
        super.handleEnterDown(e);
        if (this.multiple && this.range) {
            this.setRangeTarget(0);
            this.beginRange();
            this.expand();
        }
    }
    syncValueOnBlur(value) {
        if (value) {
            this.prepareSetValue(this.checkMoment(value));
        }
        else if (!this.multiple) {
            this.setValue(this.emptyValue);
        }
    }
    getValueKey(v) {
        if (isArrayLike(v)) {
            return v.map(this.getValueKey, this).join(',');
        }
        if (isMoment(v)) {
            return v.format();
        }
        return v;
    }
    changeSelectedDate(selectedDate) {
        this.selectedDate = this.getValidDate(selectedDate);
    }
    isSelected(date) {
        return this.getValues().some(value => date.isSame(value));
    }
    unChoose(date) {
        this.removeValue(date, -1);
    }
    choose(date) {
        date = this.getValidDate(date);
        this.prepareSetValue(date);
        this.changeSelectedDate(date);
        if (this.range ? this.rangeTarget === 1 : !this.multiple) {
            this.collapse();
        }
        if (this.range && this.rangeTarget === 0 && this.popup) {
            this.setRangeTarget(1);
        }
    }
    setRangeTarget(target) {
        if (target !== undefined && target !== this.rangeTarget) {
            this.expand();
        }
        this.selectedDate = undefined;
        super.setRangeTarget(target);
    }
    getValidDate(date) {
        const { min, max } = this;
        if (min && date.isSameOrBefore(min)) {
            date = min;
        }
        else if (max && date.isSameOrAfter(max)) {
            date = max;
        }
        return date;
    }
    isLowerRange(m1, m2) {
        return m1.isBefore(m2);
    }
    isUnderRange(date, mode) {
        const { min, max } = this;
        if (min || max) {
            let start = (min || date).clone();
            let end = (max || date).clone();
            switch (mode || this.getViewMode()) {
                case "month" /* month */:
                    start = start.startOf('M');
                    end = end.endOf('M');
                    break;
                case "year" /* year */:
                    start = start.startOf('y');
                    end = end.endOf('y');
                    break;
                case "decade" /* decade */:
                    start = start
                        .startOf('y')
                        .subtract(start.year() % 10, 'y')
                        .startOf('d');
                    end = end
                        .endOf('y')
                        .add(9 - (end.year() % 10), 'y')
                        .endOf('d');
                    break;
                case "dateTime" /* dateTime */:
                    start = start.startOf('d');
                    end = end.endOf('d');
                    break;
                default:
            }
            return date.isBetween(start, end, undefined, '[]');
        }
        return true;
    }
    isValidDate(currentDate, selected) {
        const { filter } = this.props;
        const isValid = this.isUnderRange(currentDate);
        if (isValid && filter) {
            return filter(currentDate, selected);
        }
        return isValid;
    }
    getValidatorProps() {
        const { min, max } = this;
        return {
            ...super.getValidatorProps(),
            min,
            max,
            format: this.getDateFormat(),
        };
    }
};
DatePicker.displayName = 'DatePicker';
DatePicker.propTypes = {
    /**
     * 日期格式，如 `YYYY-MM-DD HH:mm:ss`
     */
    format: PropTypes.string,
    /**
     * 显示模式date|dateTime|time|year|month|week
     */
    mode: PropTypes.string,
    /**
     * 单元格渲染
     */
    cellRenderer: PropTypes.func,
    /**
     * 日期过滤
     */
    filter: PropTypes.func,
    /**
     * 最小日期
     */
    min: PropTypes.any,
    /**
     * 最大日期
     */
    max: PropTypes.any,
    /**
     * 时间步距
     */
    step: PropTypes.shape({
        hour: PropTypes.number,
        minute: PropTypes.number,
        second: PropTypes.number,
    }),
    ...TriggerField.propTypes,
};
DatePicker.defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'calendar-picker',
    mode: "date" /* date */,
};
__decorate([
    computed
], DatePicker.prototype, "value", null);
__decorate([
    computed
], DatePicker.prototype, "defaultValidationMessages", null);
__decorate([
    computed
], DatePicker.prototype, "editable", null);
__decorate([
    computed
], DatePicker.prototype, "min", null);
__decorate([
    computed
], DatePicker.prototype, "max", null);
__decorate([
    observable
], DatePicker.prototype, "selectedDate", void 0);
__decorate([
    observable
], DatePicker.prototype, "mode", void 0);
__decorate([
    action
], DatePicker.prototype, "setValue", null);
__decorate([
    autobind
], DatePicker.prototype, "handleSelectedDateChange", null);
__decorate([
    autobind
], DatePicker.prototype, "handelViewModeChange", null);
__decorate([
    autobind
], DatePicker.prototype, "handlePopupAnimateEnd", null);
__decorate([
    autobind
], DatePicker.prototype, "handleSelect", null);
__decorate([
    autobind
], DatePicker.prototype, "handleKeyDown", null);
__decorate([
    action
], DatePicker.prototype, "handleEnterDown", null);
__decorate([
    action
], DatePicker.prototype, "changeSelectedDate", null);
__decorate([
    action
], DatePicker.prototype, "setRangeTarget", null);
__decorate([
    autobind
], DatePicker.prototype, "isUnderRange", null);
__decorate([
    autobind
], DatePicker.prototype, "isValidDate", null);
DatePicker = __decorate([
    observer
], DatePicker);
export default DatePicker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGUtcGlja2VyL0RhdGVQaWNrZXIudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFrRCxNQUFNLE9BQU8sQ0FBQztBQUN0RixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQXVCLE1BQU0sUUFBUSxDQUFDO0FBQy9ELE9BQU8sYUFBYSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUMsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ25GLE9BQU8sT0FBTyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JELE9BQU8sT0FBTyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JELE9BQU8sWUFBbUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRixPQUFPLFFBQTJCLE1BQU0sWUFBWSxDQUFDO0FBQ3JELE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxVQUFVLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUVoRCxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUsU0FBUyxF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LFFBQVE7K0NBNkNSO0FBcUZEO0lBREMsTUFBTTtpREFRTjtBQXFCRDtJQURDLE1BQU07b0RBR047QUF1QkQ7SUFEQyxNQUFNO2dEQU9OO0FBaUJEO0lBREMsUUFBUTs4Q0FrQ1I7QUFHRDtJQURDLFFBQVE7NkNBUVI7QUF2aEJrQixVQUFVO0lBRDlCLFFBQVE7R0FDWSxVQUFVLENBa2lCOUI7ZUFsaUJvQixVQUFVIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9kYXRlLXBpY2tlci9EYXRlUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVFbGVtZW50LCBDU1NQcm9wZXJ0aWVzLCBLZXlib2FyZEV2ZW50SGFuZGxlciwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBtb21lbnQsIHsgaXNNb21lbnQsIE1vbWVudCwgTW9tZW50SW5wdXQgfSBmcm9tICdtb21lbnQnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnbG9kYXNoL2lzUGxhaW5PYmplY3QnO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC9pc1N0cmluZyc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBub29wIGZyb20gJ2xvZGFzaC9ub29wJztcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgeyBhY3Rpb24sIGNvbXB1dGVkLCBpc0FycmF5TGlrZSwgb2JzZXJ2YWJsZSwgcnVuSW5BY3Rpb24sdG9KUyB9IGZyb20gJ21vYngnO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgVHJpZ2dlckZpZWxkLCB7IFRyaWdnZXJGaWVsZFByb3BzIH0gZnJvbSAnLi4vdHJpZ2dlci1maWVsZC9UcmlnZ2VyRmllbGQnO1xuaW1wb3J0IERheXNWaWV3LCB7IERhdGVWaWV3UHJvcHMgfSBmcm9tICcuL0RheXNWaWV3JztcbmltcG9ydCBEYXRlVGltZXNWaWV3IGZyb20gJy4vRGF0ZVRpbWVzVmlldyc7XG5pbXBvcnQgV2Vla3NWaWV3IGZyb20gJy4vV2Vla3NWaWV3JztcbmltcG9ydCBUaW1lc1ZpZXcgZnJvbSAnLi9UaW1lc1ZpZXcnO1xuaW1wb3J0IE1vbnRoc1ZpZXcgZnJvbSAnLi9Nb250aHNWaWV3JztcbmltcG9ydCBZZWFyc1ZpZXcgZnJvbSAnLi9ZZWFyc1ZpZXcnO1xuaW1wb3J0IERlY2FkZVllYXJzVmlldyBmcm9tICcuL0RlY2FkZVllYXJzVmlldyc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uTWVzc2FnZXMgfSBmcm9tICcuLi92YWxpZGF0b3IvVmFsaWRhdG9yJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBWaWV3TW9kZSB9IGZyb20gJy4vZW51bSc7XG5pbXBvcnQgeyBzdG9wRXZlbnQgfSBmcm9tICcuLi9fdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHsgRmllbGRUeXBlIH0gZnJvbSAnLi4vZGF0YS1zZXQvZW51bSc7XG5pbXBvcnQgeyAkbCB9IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcbmltcG9ydCB7IFZhbGlkYXRvclByb3BzIH0gZnJvbSAnLi4vdmFsaWRhdG9yL3J1bGVzJztcbmltcG9ydCBpc1NhbWUgZnJvbSAnLi4vX3V0aWwvaXNTYW1lJztcbmltcG9ydCBmb3JtYXRTdHJpbmcgZnJvbSAnLi4vZm9ybWF0dGVyL2Zvcm1hdFN0cmluZyc7XG5cbmV4cG9ydCB0eXBlIFJlbmRlckZ1bmN0aW9uID0gKFxuICBwcm9wczogb2JqZWN0LFxuICB0ZXh0OiBzdHJpbmcsXG4gIGN1cnJlbnREYXRlOiBNb21lbnQsXG4gIHNlbGVjdGVkOiBNb21lbnQsXG4pID0+IFJlYWN0Tm9kZTtcblxuZXhwb3J0IHR5cGUgVGltZVN0ZXAgPSB7XG4gIGhvdXI/OiBudW1iZXI7XG4gIG1pbnV0ZT86IG51bWJlcjtcbiAgc2Vjb25kPzogbnVtYmVyO1xufVxuXG5jb25zdCB2aWV3Q29tcG9uZW50czogeyBbeDogc3RyaW5nXTogdHlwZW9mIERheXNWaWV3IH0gPSB7XG4gIFtWaWV3TW9kZS5kZWNhZGVdOiBEZWNhZGVZZWFyc1ZpZXcsXG4gIFtWaWV3TW9kZS55ZWFyXTogWWVhcnNWaWV3LFxuICBbVmlld01vZGUubW9udGhdOiBNb250aHNWaWV3LFxuICBbVmlld01vZGUuZGF0ZV06IERheXNWaWV3LFxuICBbVmlld01vZGUuZGF0ZVRpbWVdOiBEYXRlVGltZXNWaWV3LFxuICBbVmlld01vZGUud2Vla106IFdlZWtzVmlldyxcbiAgW1ZpZXdNb2RlLnRpbWVdOiBUaW1lc1ZpZXcsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIERhdGVQaWNrZXJQcm9wcyBleHRlbmRzIFRyaWdnZXJGaWVsZFByb3BzIHtcbiAgLyoqXG4gICAqIOaYvuekuuaooeW8j2RhdGV8ZGF0ZVRpbWV8dGltZXx5ZWFyfG1vbnRofHdlZWtcbiAgICovXG4gIG1vZGU/OiBWaWV3TW9kZTtcbiAgLyoqXG4gICAqIOWNleWFg+agvOa4suafk1xuICAgKi9cbiAgY2VsbFJlbmRlcmVyPzogKG1vZGU6IFZpZXdNb2RlKSA9PiBSZW5kZXJGdW5jdGlvbiB8IHVuZGVmaW5lZDtcbiAgZmlsdGVyPzogKGN1cnJlbnREYXRlOiBNb21lbnQsIHNlbGVjdGVkOiBNb21lbnQpID0+IGJvb2xlYW47XG4gIG1pbj86IE1vbWVudElucHV0IHwgbnVsbDtcbiAgbWF4PzogTW9tZW50SW5wdXQgfCBudWxsO1xuICBzdGVwPzogVGltZVN0ZXA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVBpY2tlcktleWJvYXJkRXZlbnQge1xuICBoYW5kbGVLZXlEb3duUmlnaHQ6IEtleWJvYXJkRXZlbnRIYW5kbGVyPGFueT47XG4gIGhhbmRsZUtleURvd25MZWZ0OiBLZXlib2FyZEV2ZW50SGFuZGxlcjxhbnk+O1xuICBoYW5kbGVLZXlEb3duRG93bjogS2V5Ym9hcmRFdmVudEhhbmRsZXI8YW55PjtcbiAgaGFuZGxlS2V5RG93blVwOiBLZXlib2FyZEV2ZW50SGFuZGxlcjxhbnk+O1xuICBoYW5kbGVLZXlEb3duRW5kOiBLZXlib2FyZEV2ZW50SGFuZGxlcjxhbnk+O1xuICBoYW5kbGVLZXlEb3duSG9tZTogS2V5Ym9hcmRFdmVudEhhbmRsZXI8YW55PjtcbiAgaGFuZGxlS2V5RG93blBhZ2VVcDogS2V5Ym9hcmRFdmVudEhhbmRsZXI8YW55PjtcbiAgaGFuZGxlS2V5RG93blBhZ2VEb3duOiBLZXlib2FyZEV2ZW50SGFuZGxlcjxhbnk+O1xuICBoYW5kbGVLZXlEb3duRW50ZXI6IEtleWJvYXJkRXZlbnRIYW5kbGVyPGFueT47XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0ZVBpY2tlciBleHRlbmRzIFRyaWdnZXJGaWVsZDxEYXRlUGlja2VyUHJvcHM+XG4gIGltcGxlbWVudHMgRGF0ZVBpY2tlcktleWJvYXJkRXZlbnQge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnRGF0ZVBpY2tlcic7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAvKipcbiAgICAgKiDml6XmnJ/moLzlvI/vvIzlpoIgYFlZWVktTU0tREQgSEg6bW06c3NgXG4gICAgICovXG4gICAgZm9ybWF0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOaYvuekuuaooeW8j2RhdGV8ZGF0ZVRpbWV8dGltZXx5ZWFyfG1vbnRofHdlZWtcbiAgICAgKi9cbiAgICBtb2RlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOWNleWFg+agvOa4suafk1xuICAgICAqL1xuICAgIGNlbGxSZW5kZXJlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgLyoqXG4gICAgICog5pel5pyf6L+H5rukXG4gICAgICovXG4gICAgZmlsdGVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAvKipcbiAgICAgKiDmnIDlsI/ml6XmnJ9cbiAgICAgKi9cbiAgICBtaW46IFByb3BUeXBlcy5hbnksXG4gICAgLyoqXG4gICAgICog5pyA5aSn5pel5pyfXG4gICAgICovXG4gICAgbWF4OiBQcm9wVHlwZXMuYW55LFxuICAgIC8qKlxuICAgICAqIOaXtumXtOatpei3nVxuICAgICAqL1xuICAgIHN0ZXA6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBob3VyOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgbWludXRlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgc2Vjb25kOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIH0pLFxuICAgIC4uLlRyaWdnZXJGaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5UcmlnZ2VyRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ2NhbGVuZGFyLXBpY2tlcicsXG4gICAgbW9kZTogVmlld01vZGUuZGF0ZSxcbiAgfTtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IHZhbHVlKCk6IGFueSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB2YWx1ZSB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgY29uc3QgeyByYW5nZSB9ID0gdGhpcztcbiAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoaXNBcnJheUxpa2UoaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5tYXAodGhpcy5jaGVja01vbWVudCwgdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tNb21lbnQoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXlMaWtlKHJhbmdlKSkge1xuICAgICAgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHJhbmdlO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIFtzdGFydF06IHRoaXMuY2hlY2tNb21lbnQodmFsdWVbc3RhcnRdKSxcbiAgICAgICAgICBbZW5kXTogdGhpcy5jaGVja01vbWVudCh2YWx1ZVtlbmRdKSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hlY2tNb21lbnQodmFsdWUpO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkgfCB1bmRlZmluZWQpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLm9ic2VydmFibGVQcm9wcy52YWx1ZSA9IHZhbHVlO1xuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzKCk6IFZhbGlkYXRpb25NZXNzYWdlcyB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldFByb3AoJ2xhYmVsJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlTWlzc2luZzogJGwoJ0RhdGVQaWNrZXInLCBsYWJlbCA/ICd2YWx1ZV9taXNzaW5nJyA6ICd2YWx1ZV9taXNzaW5nX25vX2xhYmVsJywge1xuICAgICAgICBsYWJlbCxcbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGVkaXRhYmxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG1vZGUgPSB0aGlzLmdldFZpZXdNb2RlKCk7XG4gICAgcmV0dXJuIHN1cGVyLmVkaXRhYmxlICYmIG1vZGUgIT09IFZpZXdNb2RlLndlZWs7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IG1pbigpOiBNb21lbnQgfCB1bmRlZmluZWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMaW1pdCgnbWluJyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IG1heCgpOiBNb21lbnQgfCB1bmRlZmluZWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMaW1pdCgnbWF4Jyk7XG4gIH1cblxuICB2aWV3OiBEYXRlUGlja2VyS2V5Ym9hcmRFdmVudCB8IG51bGw7XG5cbiAgQG9ic2VydmFibGUgc2VsZWN0ZWREYXRlPzogTW9tZW50O1xuXG4gIEBvYnNlcnZhYmxlIG1vZGU/OiBWaWV3TW9kZTtcblxuICBnZXRPdGhlclByb3BzKCkge1xuICAgIHJldHVybiBvbWl0KHN1cGVyLmdldE90aGVyUHJvcHMoKSwgWydtb2RlJywgJ2ZpbHRlcicsICdjZWxsUmVuZGVyZXInXSk7XG4gIH1cblxuICBnZXREZWZhdWx0Vmlld01vZGUoKSB7XG4gICAgY29uc3QgeyBtb2RlIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChtb2RlID09PSBWaWV3TW9kZS5kZWNhZGUgfHwgbW9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gVmlld01vZGUuZGF0ZTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGU7XG4gIH1cblxuICBnZXRQb3B1cENvbnRlbnQoKSB7XG4gICAgY29uc3QgbW9kZSA9IHRoaXMuZ2V0Vmlld01vZGUoKTtcbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudCh2aWV3Q29tcG9uZW50c1ttb2RlXSwge1xuICAgICAgcmVmOiBub2RlID0+ICh0aGlzLnZpZXcgPSBub2RlKSxcbiAgICAgIGRhdGU6IHRoaXMuZ2V0U2VsZWN0ZWREYXRlKCksXG4gICAgICBtb2RlOiB0aGlzLmdldERlZmF1bHRWaWV3TW9kZSgpLFxuICAgICAgcmVuZGVyZXI6IHRoaXMuZ2V0Q2VsbFJlbmRlcmVyKG1vZGUpLFxuICAgICAgb25TZWxlY3Q6IHRoaXMuaGFuZGxlU2VsZWN0LFxuICAgICAgb25TZWxlY3RlZERhdGVDaGFuZ2U6IHRoaXMuaGFuZGxlU2VsZWN0ZWREYXRlQ2hhbmdlLFxuICAgICAgb25WaWV3TW9kZUNoYW5nZTogdGhpcy5oYW5kZWxWaWV3TW9kZUNoYW5nZSxcbiAgICAgIGlzVmFsaWREYXRlOiB0aGlzLmlzVmFsaWREYXRlLFxuICAgICAgZm9ybWF0OiB0aGlzLmdldERhdGVGb3JtYXQoKSxcbiAgICAgIHN0ZXA6IHRoaXMuZ2V0UHJvcCgnc3RlcCcpIHx8IHt9LFxuICAgIH0gYXMgRGF0ZVZpZXdQcm9wcyk7XG4gIH1cblxuICBnZXRDZWxsUmVuZGVyZXIobW9kZTogVmlld01vZGUpOiBSZW5kZXJGdW5jdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBjZWxsUmVuZGVyZXIgPSBub29wIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBjZWxsUmVuZGVyZXIobW9kZSk7XG4gIH1cblxuICBnZXRUcmlnZ2VySWNvbkZvbnQoKSB7XG4gICAgcmV0dXJuICdkYXRlX3JhbmdlJztcbiAgfVxuXG4gIGdldEZpZWxkVHlwZSgpOiBGaWVsZFR5cGUge1xuICAgIHJldHVybiB2aWV3Q29tcG9uZW50c1t0aGlzLmdldERlZmF1bHRWaWV3TW9kZSgpXS50eXBlO1xuICB9XG5cbiAgZ2V0Vmlld01vZGUoKTogVmlld01vZGUge1xuICAgIGNvbnN0IHsgbW9kZSA9IHRoaXMuZ2V0RGVmYXVsdFZpZXdNb2RlKCkgfSA9IHRoaXM7XG4gICAgcmV0dXJuIG1vZGU7XG4gIH1cblxuICBjaGVja01vbWVudChpdGVtKSB7XG4gICAgaWYgKCFpc05pbChpdGVtKSAmJiAhaXNNb21lbnQoaXRlbSkpIHtcbiAgICAgIHdhcm5pbmcoZmFsc2UsIGBEYXRlUGlja2VyOiBUaGUgdmFsdWUgb2YgRGF0ZVBpY2tlciBpcyBub3QgbW9tZW50LmApO1xuICAgICAgY29uc3QgZm9ybWF0ID0gdGhpcy5nZXREYXRlRm9ybWF0KCk7XG4gICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgaXRlbSA9IG1vbWVudChpdGVtKS5mb3JtYXQoZm9ybWF0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtb21lbnQoaXRlbSwgZm9ybWF0KTtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuIC8vIOmBv+WFjeWHuueOsOW9seWTjei/h+Wkmue7hOS7tuS9v+eUqOe7p+aJv+imhuebluWOn+acieaWueazlSBGaXggb25jaGFuZ2UgbW9tZW50IHVzZSBWYWx1ZU9mIHRvIGdldCB0aGUgVGltZXN0YW1wIGNvbXBhcmVcbiAgQGFjdGlvblxuICBzZXRWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzUmVhZE9ubHkoKSkge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLm11bHRpcGxlIHx8IHRoaXMucmFuZ2VcbiAgICAgICAgICA/IGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAhdmFsdWUubGVuZ3RoXG4gICAgICAgICAgOiBpc05pbCh2YWx1ZSkgfHwgdmFsdWUgPT09ICcnXG4gICAgICApIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmVtcHR5VmFsdWU7XG4gICAgICB9XG4gICAgICBjb25zdCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGRhdGFTZXQsXG4gICAgICAgIHRyaW0sXG4gICAgICAgIGZvcm1hdCxcbiAgICAgICAgb2JzZXJ2YWJsZVByb3BzOiB7IGRhdGFJbmRleCB9LFxuICAgICAgfSA9IHRoaXM7XG4gICAgICBjb25zdCB7IG9uQ2hhbmdlID0gbm9vcCB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHsgZm9ybU5vZGUgfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIGNvbnN0IG9sZCA9IHRoaXMuZ2V0T2xkVmFsdWUoKTtcbiAgICAgIGlmIChkYXRhU2V0ICYmIG5hbWUpIHtcbiAgICAgICAgKHRoaXMucmVjb3JkIHx8IGRhdGFTZXQuY3JlYXRlKHt9LCBkYXRhSW5kZXgpKS5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBmb3JtYXRTdHJpbmcodmFsdWUsIHtcbiAgICAgICAgICB0cmltLFxuICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudmFsaWRhdGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgaWYgKCFpc1NhbWUodGhpcy5tb21lbnRUb1RpbWVzdGFtcChvbGQpLCB0aGlzLm1vbWVudFRvVGltZXN0YW1wKHZhbHVlKSkpIHtcbiAgICAgICAgb25DaGFuZ2UodmFsdWUsIHRvSlMob2xkKSwgZm9ybU5vZGUpO1xuICAgICAgfVxuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuc2V0VGV4dCh1bmRlZmluZWQpO1xuICB9XG5cbiAgbW9tZW50VG9UaW1lc3RhbXAodmFsdWUpe1xuICAgIGlmKGlzTW9tZW50KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG1vbWVudCh2YWx1ZSkudmFsdWVPZigpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gcHJvY2Vzc1ZhbHVlKHZhbHVlOiBhbnkpOiBSZWFjdE5vZGUge1xuICAvLyAgIHJldHVybiBzdXBlci5wcm9jZXNzVmFsdWUodGhpcy5jaGVja01vbWVudCh2YWx1ZSkpO1xuICAvLyB9XG5cbiAgZ2V0U2VsZWN0ZWREYXRlKCk6IE1vbWVudCB7XG4gICAgY29uc3QgeyByYW5nZSwgbXVsdGlwbGUsIHJhbmdlVGFyZ2V0LCByYW5nZVZhbHVlIH0gPSB0aGlzO1xuICAgIGNvbnN0IHNlbGVjdGVkRGF0ZSA9XG4gICAgICB0aGlzLnNlbGVjdGVkRGF0ZSB8fFxuICAgICAgKHJhbmdlICYmICFtdWx0aXBsZSAmJiByYW5nZVRhcmdldCAhPT0gdW5kZWZpbmVkICYmIHJhbmdlVmFsdWUgJiYgcmFuZ2VWYWx1ZVtyYW5nZVRhcmdldF0pIHx8XG4gICAgICAoIW11bHRpcGxlICYmIHRoaXMuZ2V0VmFsdWUoKSk7XG4gICAgaWYgKGlzTW9tZW50KHNlbGVjdGVkRGF0ZSkgJiYgc2VsZWN0ZWREYXRlLmlzVmFsaWQoKSkge1xuICAgICAgcmV0dXJuIHNlbGVjdGVkRGF0ZS5jbG9uZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRWYWxpZERhdGUobW9tZW50KCkuc3RhcnRPZignZCcpKTtcbiAgfVxuXG4gIGdldExpbWl0KG1pbk9yTWF4OiAnbWluJyB8ICdtYXgnKSB7XG4gICAgY29uc3QgbGltaXQgPSB0aGlzLmdldFByb3AobWluT3JNYXgpO1xuICAgIGlmICghaXNOaWwobGltaXQpKSB7XG4gICAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcztcbiAgICAgIGlmIChyZWNvcmQgJiYgaXNTdHJpbmcobGltaXQpICYmIHJlY29yZC5nZXRGaWVsZChsaW1pdCkpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZC5nZXQobGltaXQpID8gdGhpcy5nZXRMaW1pdFdpdGhUeXBlKG1vbWVudChyZWNvcmQuZ2V0KGxpbWl0KSksIG1pbk9yTWF4KSA6IHJlY29yZC5nZXQobGltaXQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGltaXRXaXRoVHlwZShtb21lbnQobGltaXQpLCBtaW5Pck1heCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TGltaXRXaXRoVHlwZShsaW1pdDogTW9tZW50LCBtaW5Pck1heDogJ21pbicgfCAnbWF4Jykge1xuICAgIGlmIChtaW5Pck1heCA9PT0gJ21pbicpIHtcbiAgICAgIHJldHVybiBsaW1pdC5zdGFydE9mKCdkJyk7XG4gICAgfVxuICAgIHJldHVybiBsaW1pdC5lbmRPZignZCcpO1xuICB9XG5cbiAgZ2V0UG9wdXBTdHlsZUZyb21BbGlnbigpOiBDU1NQcm9wZXJ0aWVzIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVNlbGVjdGVkRGF0ZUNoYW5nZShzZWxlY3RlZERhdGU6IE1vbWVudCwgbW9kZT86IFZpZXdNb2RlKSB7XG4gICAgaWYgKHRoaXMuaXNVbmRlclJhbmdlKHNlbGVjdGVkRGF0ZSwgbW9kZSkpIHtcbiAgICAgIHRoaXMuY2hhbmdlU2VsZWN0ZWREYXRlKHNlbGVjdGVkRGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRlbFZpZXdNb2RlQ2hhbmdlKG1vZGU6IFZpZXdNb2RlKSB7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZVBvcHVwQW5pbWF0ZUFwcGVhcigpIHtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVQb3B1cEFuaW1hdGVFbmQoa2V5LCBleGlzdHMpIHtcbiAgICBpZiAoIWV4aXN0cyAmJiBrZXkgPT09ICdhbGlnbicpIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubW9kZSA9IHVuZGVmaW5lZDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVTZWxlY3QoZGF0ZTogTW9tZW50KSB7XG4gICAgaWYgKHRoaXMubXVsdGlwbGUgJiYgdGhpcy5pc1NlbGVjdGVkKGRhdGUpKSB7XG4gICAgICB0aGlzLnVuQ2hvb3NlKGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNob29zZShkYXRlKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQoKSAmJiAhdGhpcy5pc1JlYWRPbmx5KCkpIHtcbiAgICAgIGNvbnN0IGVsID0gdGhpcy5wb3B1cCA/IHRoaXMudmlldyB8fCB0aGlzIDogdGhpcztcbiAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5SSUdIVDpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duUmlnaHQoZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5MRUZUOlxuICAgICAgICAgIGVsLmhhbmRsZUtleURvd25MZWZ0KGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuRE9XTjpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duRG93bihlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLlVQOlxuICAgICAgICAgIGVsLmhhbmRsZUtleURvd25VcChlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLkVORDpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duRW5kKGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuSE9NRTpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duSG9tZShlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLlBBR0VfVVA6XG4gICAgICAgICAgZWwuaGFuZGxlS2V5RG93blBhZ2VVcChlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBLZXlDb2RlLlBBR0VfRE9XTjpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duUGFnZURvd24oZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5FTlRFUjpcbiAgICAgICAgICBlbC5oYW5kbGVLZXlEb3duRW50ZXIoZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5UQUI6XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duVGFiKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgS2V5Q29kZS5FU0M6XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRXNjKGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEtleUNvZGUuU1BBQ0U6XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duU3BhY2UoZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLmhhbmRsZUtleURvd24oZSk7XG4gIH1cblxuICBoYW5kbGVLZXlEb3duSG9tZShlKSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmICF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBzdG9wRXZlbnQoZSk7XG4gICAgICB0aGlzLmNob29zZSh0aGlzLmdldFNlbGVjdGVkRGF0ZSgpLnN0YXJ0T2YoJ00nKSk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93bkVuZChlKSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmICF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBzdG9wRXZlbnQoZSk7XG4gICAgICB0aGlzLmNob29zZSh0aGlzLmdldFNlbGVjdGVkRGF0ZSgpLmVuZE9mKCdNJykpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25MZWZ0KGUpIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIHN0b3BFdmVudChlKTtcbiAgICAgIHRoaXMuY2hvb3NlKHRoaXMuZ2V0U2VsZWN0ZWREYXRlKCkuc3VidHJhY3QoMSwgJ2QnKSk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93blJpZ2h0KGUpIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIHN0b3BFdmVudChlKTtcbiAgICAgIHRoaXMuY2hvb3NlKHRoaXMuZ2V0U2VsZWN0ZWREYXRlKCkuYWRkKDEsICdkJykpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25VcChlKSB7XG4gICAgaWYgKCF0aGlzLm11bHRpcGxlICYmICF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBzdG9wRXZlbnQoZSk7XG4gICAgICB0aGlzLmNob29zZSh0aGlzLmdldFNlbGVjdGVkRGF0ZSgpLnN1YnRyYWN0KDEsICd3JykpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25Eb3duKGUpIHtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgdGhpcy5leHBhbmQoKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmVkaXRhYmxlKSB7XG4gICAgICBzdG9wRXZlbnQoZSk7XG4gICAgICB0aGlzLmNob29zZSh0aGlzLmdldFNlbGVjdGVkRGF0ZSgpLmFkZCgxLCAndycpKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVLZXlEb3duUGFnZVVwKGUpIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIHN0b3BFdmVudChlKTtcbiAgICAgIHRoaXMuY2hvb3NlKHRoaXMuZ2V0U2VsZWN0ZWREYXRlKCkuc3VidHJhY3QoMSwgZS5hbHRLZXkgPyAneScgOiAnTScpKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVLZXlEb3duUGFnZURvd24oZSkge1xuICAgIGlmICghdGhpcy5tdWx0aXBsZSAmJiAhdGhpcy5lZGl0YWJsZSkge1xuICAgICAgc3RvcEV2ZW50KGUpO1xuICAgICAgdGhpcy5jaG9vc2UodGhpcy5nZXRTZWxlY3RlZERhdGUoKS5hZGQoMSwgZS5hbHRLZXkgPyAneScgOiAnTScpKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVLZXlEb3duRW50ZXIoX2UpIHtcbiAgICBpZiAoIXRoaXMubXVsdGlwbGUgJiYgIXRoaXMuZWRpdGFibGUpIHtcbiAgICAgIHRoaXMuY2hvb3NlKHRoaXMuZ2V0U2VsZWN0ZWREYXRlKCkpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUtleURvd25Fc2MoZSkge1xuICAgIGlmICh0aGlzLnBvcHVwKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlS2V5RG93blRhYigpIHtcbiAgICAvLyB0aGlzLmNvbGxhcHNlKCk7XG4gIH1cblxuICBoYW5kbGVLZXlEb3duU3BhY2UoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMucG9wdXApIHtcbiAgICAgIHRoaXMuZXhwYW5kKCk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBoYW5kbGVFbnRlckRvd24oZSkge1xuICAgIHN1cGVyLmhhbmRsZUVudGVyRG93bihlKTtcbiAgICBpZiAodGhpcy5tdWx0aXBsZSAmJiB0aGlzLnJhbmdlKSB7XG4gICAgICB0aGlzLnNldFJhbmdlVGFyZ2V0KDApO1xuICAgICAgdGhpcy5iZWdpblJhbmdlKCk7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH1cbiAgfVxuXG4gIHN5bmNWYWx1ZU9uQmx1cih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5wcmVwYXJlU2V0VmFsdWUodGhpcy5jaGVja01vbWVudCh2YWx1ZSkpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgIHRoaXMuc2V0VmFsdWUodGhpcy5lbXB0eVZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBnZXRWYWx1ZUtleSh2OiBhbnkpIHtcbiAgICBpZiAoaXNBcnJheUxpa2UodikpIHtcbiAgICAgIHJldHVybiB2Lm1hcCh0aGlzLmdldFZhbHVlS2V5LCB0aGlzKS5qb2luKCcsJyk7XG4gICAgfVxuICAgIGlmIChpc01vbWVudCh2KSkge1xuICAgICAgcmV0dXJuIHYuZm9ybWF0KCk7XG4gICAgfVxuICAgIHJldHVybiB2O1xuICB9XG5cbiAgQGFjdGlvblxuICBjaGFuZ2VTZWxlY3RlZERhdGUoc2VsZWN0ZWREYXRlOiBNb21lbnQpIHtcbiAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IHRoaXMuZ2V0VmFsaWREYXRlKHNlbGVjdGVkRGF0ZSk7XG4gIH1cblxuICBpc1NlbGVjdGVkKGRhdGU6IE1vbWVudCkge1xuICAgIHJldHVybiB0aGlzLmdldFZhbHVlcygpLnNvbWUodmFsdWUgPT4gZGF0ZS5pc1NhbWUodmFsdWUpKTtcbiAgfVxuXG4gIHVuQ2hvb3NlKGRhdGU6IE1vbWVudCkge1xuICAgIHRoaXMucmVtb3ZlVmFsdWUoZGF0ZSwgLTEpO1xuICB9XG5cbiAgY2hvb3NlKGRhdGU6IE1vbWVudCkge1xuICAgIGRhdGUgPSB0aGlzLmdldFZhbGlkRGF0ZShkYXRlKTtcbiAgICB0aGlzLnByZXBhcmVTZXRWYWx1ZShkYXRlKTtcbiAgICB0aGlzLmNoYW5nZVNlbGVjdGVkRGF0ZShkYXRlKTtcbiAgICBpZiAodGhpcy5yYW5nZSA/IHRoaXMucmFuZ2VUYXJnZXQgPT09IDEgOiAhdGhpcy5tdWx0aXBsZSkge1xuICAgICAgdGhpcy5jb2xsYXBzZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yYW5nZSAmJiB0aGlzLnJhbmdlVGFyZ2V0ID09PSAwICYmIHRoaXMucG9wdXApIHtcbiAgICAgIHRoaXMuc2V0UmFuZ2VUYXJnZXQoMSk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBzZXRSYW5nZVRhcmdldCh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0ICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0ICE9PSB0aGlzLnJhbmdlVGFyZ2V0KSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IHVuZGVmaW5lZDtcbiAgICBzdXBlci5zZXRSYW5nZVRhcmdldCh0YXJnZXQpO1xuICB9XG5cbiAgZ2V0VmFsaWREYXRlKGRhdGU6IE1vbWVudCk6IE1vbWVudCB7XG4gICAgY29uc3QgeyBtaW4sIG1heCB9ID0gdGhpcztcbiAgICBpZiAobWluICYmIGRhdGUuaXNTYW1lT3JCZWZvcmUobWluKSkge1xuICAgICAgZGF0ZSA9IG1pbjtcbiAgICB9IGVsc2UgaWYgKG1heCAmJiBkYXRlLmlzU2FtZU9yQWZ0ZXIobWF4KSkge1xuICAgICAgZGF0ZSA9IG1heDtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cblxuICBpc0xvd2VyUmFuZ2UobTE6IE1vbWVudCwgbTI6IE1vbWVudCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBtMS5pc0JlZm9yZShtMik7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaXNVbmRlclJhbmdlKGRhdGU6IE1vbWVudCwgbW9kZT86IFZpZXdNb2RlKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBtaW4sIG1heCB9ID0gdGhpcztcbiAgICBpZiAobWluIHx8IG1heCkge1xuICAgICAgbGV0IHN0YXJ0ID0gKG1pbiB8fCBkYXRlKS5jbG9uZSgpO1xuICAgICAgbGV0IGVuZCA9IChtYXggfHwgZGF0ZSkuY2xvbmUoKTtcbiAgICAgIHN3aXRjaCAobW9kZSB8fCB0aGlzLmdldFZpZXdNb2RlKCkpIHtcbiAgICAgICAgY2FzZSBWaWV3TW9kZS5tb250aDpcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0LnN0YXJ0T2YoJ00nKTtcbiAgICAgICAgICBlbmQgPSBlbmQuZW5kT2YoJ00nKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBWaWV3TW9kZS55ZWFyOlxuICAgICAgICAgIHN0YXJ0ID0gc3RhcnQuc3RhcnRPZigneScpO1xuICAgICAgICAgIGVuZCA9IGVuZC5lbmRPZigneScpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFZpZXdNb2RlLmRlY2FkZTpcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0XG4gICAgICAgICAgICAuc3RhcnRPZigneScpXG4gICAgICAgICAgICAuc3VidHJhY3Qoc3RhcnQueWVhcigpICUgMTAsICd5JylcbiAgICAgICAgICAgIC5zdGFydE9mKCdkJyk7XG4gICAgICAgICAgZW5kID0gZW5kXG4gICAgICAgICAgICAuZW5kT2YoJ3knKVxuICAgICAgICAgICAgLmFkZCg5IC0gKGVuZC55ZWFyKCkgJSAxMCksICd5JylcbiAgICAgICAgICAgIC5lbmRPZignZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFZpZXdNb2RlLmRhdGVUaW1lOlxuICAgICAgICAgIHN0YXJ0ID0gc3RhcnQuc3RhcnRPZignZCcpO1xuICAgICAgICAgIGVuZCA9IGVuZC5lbmRPZignZCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGUuaXNCZXR3ZWVuKHN0YXJ0LCBlbmQsIHVuZGVmaW5lZCwgJ1tdJyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGlzVmFsaWREYXRlKGN1cnJlbnREYXRlOiBNb21lbnQsIHNlbGVjdGVkOiBNb21lbnQpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGZpbHRlciB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBpc1ZhbGlkID0gdGhpcy5pc1VuZGVyUmFuZ2UoY3VycmVudERhdGUpO1xuICAgIGlmIChpc1ZhbGlkICYmIGZpbHRlcikge1xuICAgICAgcmV0dXJuIGZpbHRlcihjdXJyZW50RGF0ZSwgc2VsZWN0ZWQpO1xuICAgIH1cbiAgICByZXR1cm4gaXNWYWxpZDtcbiAgfVxuXG4gIGdldFZhbGlkYXRvclByb3BzKCk6IFZhbGlkYXRvclByb3BzIHtcbiAgICBjb25zdCB7IG1pbiwgbWF4IH0gPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdXBlci5nZXRWYWxpZGF0b3JQcm9wcygpLFxuICAgICAgbWluLFxuICAgICAgbWF4LFxuICAgICAgZm9ybWF0OiB0aGlzLmdldERhdGVGb3JtYXQoKSxcbiAgICB9O1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=