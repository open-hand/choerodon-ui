import React, { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Button from '../button';
import Icon from '../icon';
import Input from '../input';
import warning from '../_util/warning';
import interopDefault from '../_util/interopDefault';
import MonthCalendar from '../rc-components/calendar/MonthCalendar';
import RcDatePicker from '../rc-components/calendar/Picker';
import { getPrefixCls } from '../configure';
export default function createPicker(TheCalendar) {
    var _a;
    return _a = class CalenderWrapper extends Component {
            constructor(props) {
                super(props);
                this.renderFooter = (...args) => {
                    const { renderExtraFooter } = this.props;
                    const prefixCls = this.getPrefixCls();
                    return renderExtraFooter ? (React.createElement("div", { className: `${prefixCls}-footer-extra` }, renderExtraFooter(...args))) : null;
                };
                this.clearSelection = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleChange(null);
                };
                this.onPickerIconClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const { disabled } = this.props;
                    if (disabled) {
                        return;
                    }
                    const { focused } = this.state;
                    this.picker.setOpen(!focused);
                };
                this.handleChange = (value) => {
                    const props = this.props;
                    if (!('value' in props)) {
                        this.setState({
                            value,
                            showDate: value,
                        });
                    }
                    props.onChange(value, (value && value.format(props.format)) || '');
                };
                this.handleCalendarChange = (value) => {
                    this.setState({ showDate: value });
                };
                this.handleOpenChange = (status) => {
                    const { onOpenChange } = this.props;
                    const { focused } = this.state;
                    if (status !== focused) {
                        this.setState({
                            focused: status,
                        });
                    }
                    if (onOpenChange) {
                        onOpenChange(status);
                    }
                };
                this.saveInput = (node) => {
                    this.input = node;
                };
                this.savePicker = (node) => {
                    this.picker = node;
                };
                const value = props.value || props.defaultValue;
                if (value && !interopDefault(moment).isMoment(value)) {
                    throw new Error('The value/defaultValue of DatePicker or MonthPicker must be a moment object');
                }
                this.state = {
                    value,
                    showDate: value,
                    focused: false,
                };
            }
            componentWillReceiveProps(nextProps) {
                if ('value' in nextProps) {
                    this.setState({
                        value: nextProps.value,
                        showDate: nextProps.value,
                    });
                }
            }
            focus() {
                this.input.focus();
            }
            blur() {
                this.input.blur();
            }
            getPrefixCls() {
                const { prefixCls } = this.props;
                return getPrefixCls('calendar', prefixCls);
            }
            render() {
                const { value, showDate, focused } = this.state;
                const props = omit(this.props, ['onChange']);
                const { label, disabled, pickerInputClass, locale, localeCode } = props;
                const prefixCls = this.getPrefixCls();
                const placeholder = 'placeholder' in props ? props.placeholder : locale.lang.placeholder;
                const disabledTime = props.showTime ? props.disabledTime : null;
                const calendarClassName = classNames({
                    [`${prefixCls}-time`]: props.showTime,
                    [`${prefixCls}-month`]: MonthCalendar === TheCalendar,
                });
                if (value && localeCode) {
                    value.locale(localeCode);
                }
                let pickerProps = {};
                let calendarProps = {};
                if (props.showTime) {
                    calendarProps = {
                        onSelect: this.handleChange,
                    };
                }
                else {
                    pickerProps = {
                        onChange: this.handleChange,
                    };
                }
                if ('mode' in props) {
                    calendarProps.mode = props.mode;
                }
                warning(!('onOK' in props), 'It should be `DatePicker[onOk]` or `MonthPicker[onOk]`, instead of `onOK`!');
                const calendar = (React.createElement(TheCalendar, Object.assign({}, calendarProps, { disabledDate: props.disabledDate, disabledTime: disabledTime, locale: locale.lang, timePicker: props.timePicker, defaultValue: props.defaultPickerValue || interopDefault(moment)(), dateInputPlaceholder: placeholder, prefixCls: prefixCls, className: calendarClassName, onOk: props.onOk, dateRender: props.dateRender, format: props.format, showToday: props.showToday, monthCellContentRender: props.monthCellContentRender, renderFooter: this.renderFooter, onPanelChange: props.onPanelChange, onChange: this.handleCalendarChange, value: showDate })));
                const clearIcon = !props.disabled && props.allowClear && value ? (React.createElement(Button, { className: `${prefixCls}-picker-clear`, onClick: this.clearSelection, shape: "circle", icon: "close", size: "small" /* small */ })) : null;
                const suffix = (React.createElement("span", { className: `${prefixCls}-picker-icon-wrapper`, onClick: this.onPickerIconClick },
                    clearIcon,
                    React.createElement(Icon, { type: "date_range", className: `${prefixCls}-picker-icon` })));
                const inputProps = {
                    label,
                    disabled,
                    placeholder,
                    suffix,
                    focused,
                };
                const input = ({ value: inputValue }) => (React.createElement(Input, Object.assign({}, inputProps, { ref: this.saveInput, value: (inputValue && inputValue.format(props.format)) || '', className: pickerInputClass, readOnly: true })));
                return (React.createElement("span", { id: props.id, className: classNames(props.className, props.pickerClass), style: props.style, onFocus: props.onFocus, onBlur: props.onBlur },
                    React.createElement(RcDatePicker, Object.assign({}, props, pickerProps, { onOpenChange: this.handleOpenChange, calendar: calendar, value: value, prefixCls: `${prefixCls}-picker-container`, style: props.popupStyle, ref: this.savePicker }), input)));
            }
        },
        _a.displayName = 'CalenderWrapper',
        _a.defaultProps = {
            allowClear: true,
            showToday: true,
        },
        _a;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvY3JlYXRlUGlja2VyLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBOEIsTUFBTSxPQUFPLENBQUM7QUFDckUsT0FBTyxNQUFrQixNQUFNLFFBQVEsQ0FBQztBQUN4QyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQztBQUMvQixPQUFPLElBQUksTUFBTSxTQUFTLENBQUM7QUFDM0IsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQzdCLE9BQU8sT0FBTyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sY0FBYyxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sYUFBYSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3BFLE9BQU8sWUFBWSxNQUFNLGtDQUFrQyxDQUFDO0FBRTVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFPNUMsTUFBTSxDQUFDLE9BQU8sVUFBVSxZQUFZLENBQUMsV0FBMkI7O0lBQzlELFlBQU8sTUFBTSxlQUFnQixTQUFRLFNBQW1CO1lBWXRELFlBQVksS0FBVTtnQkFDcEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQXVCZixpQkFBWSxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtvQkFDaEMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN0QyxPQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUN6Qiw2QkFBSyxTQUFTLEVBQUUsR0FBRyxTQUFTLGVBQWUsSUFBRyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFPLENBQ2hGLENB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SyxvQkFDQSxVQUFVLElBQ2QsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQ25CLEtBQUssRUFBRSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFDNUQsU0FBUyxFQUFFLGdCQUFnQixFQUMzQixRQUFRLFVBQ1IsQ0FDSCxDQUFDO2dCQUVGLE9BQU8sQ0FDTCw4QkFDRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFDWixTQUFTLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUN6RCxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFDbEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQ3RCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtvQkFFcEIsb0JBQUMsWUFBWSxvQkFDUCxLQUFLLEVBQ0wsV0FBVyxJQUNmLFlBQVksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQ25DLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLEtBQUssRUFBRSxLQUFLLEVBQ1osU0FBUyxFQUFFLEdBQUcsU0FBUyxtQkFBbUIsRUFDMUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQ3ZCLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxLQUVuQixLQUFLLENBQ08sQ0FDVixDQUNSLENBQUM7WUFDSixDQUFDO1NBQ0Y7UUFwT1EsY0FBVyxHQUFHLGlCQUFrQjtRQUVoQyxlQUFZLEdBQUc7WUFDcEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsU0FBUyxFQUFFLElBQUk7U0FDZjtXQStORjtBQUNKLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvY3JlYXRlUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBDb21wb25lbnRDbGFzcywgTW91c2VFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBtb21lbnQsIHsgTW9tZW50IH0gZnJvbSAnbW9tZW50JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IG9taXQgZnJvbSAnbG9kYXNoL29taXQnO1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuLi9idXR0b24nO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgSW5wdXQgZnJvbSAnLi4vaW5wdXQnO1xuaW1wb3J0IHdhcm5pbmcgZnJvbSAnLi4vX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgaW50ZXJvcERlZmF1bHQgZnJvbSAnLi4vX3V0aWwvaW50ZXJvcERlZmF1bHQnO1xuaW1wb3J0IE1vbnRoQ2FsZW5kYXIgZnJvbSAnLi4vcmMtY29tcG9uZW50cy9jYWxlbmRhci9Nb250aENhbGVuZGFyJztcbmltcG9ydCBSY0RhdGVQaWNrZXIgZnJvbSAnLi4vcmMtY29tcG9uZW50cy9jYWxlbmRhci9QaWNrZXInO1xuaW1wb3J0IHsgU2l6ZSB9IGZyb20gJy4uL191dGlsL2VudW0nO1xuaW1wb3J0IHsgZ2V0UHJlZml4Q2xzIH0gZnJvbSAnLi4vY29uZmlndXJlJztcblxuZXhwb3J0IGludGVyZmFjZSBQaWNrZXJQcm9wcyB7XG4gIHZhbHVlPzogTW9tZW50O1xuICBwcmVmaXhDbHM6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUGlja2VyKFRoZUNhbGVuZGFyOiBDb21wb25lbnRDbGFzcyk6IGFueSB7XG4gIHJldHVybiBjbGFzcyBDYWxlbmRlcldyYXBwZXIgZXh0ZW5kcyBDb21wb25lbnQ8YW55LCBhbnk+IHtcbiAgICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnQ2FsZW5kZXJXcmFwcGVyJztcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICBhbGxvd0NsZWFyOiB0cnVlLFxuICAgICAgc2hvd1RvZGF5OiB0cnVlLFxuICAgIH07XG5cbiAgICBwcml2YXRlIGlucHV0OiBhbnk7XG5cbiAgICBwcml2YXRlIHBpY2tlcjogYW55O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IGFueSkge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgY29uc3QgdmFsdWUgPSBwcm9wcy52YWx1ZSB8fCBwcm9wcy5kZWZhdWx0VmFsdWU7XG4gICAgICBpZiAodmFsdWUgJiYgIWludGVyb3BEZWZhdWx0KG1vbWVudCkuaXNNb21lbnQodmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVGhlIHZhbHVlL2RlZmF1bHRWYWx1ZSBvZiBEYXRlUGlja2VyIG9yIE1vbnRoUGlja2VyIG11c3QgYmUgYSBtb21lbnQgb2JqZWN0JyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHZhbHVlLFxuICAgICAgICBzaG93RGF0ZTogdmFsdWUsXG4gICAgICAgIGZvY3VzZWQ6IGZhbHNlLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogUGlja2VyUHJvcHMpIHtcbiAgICAgIGlmICgndmFsdWUnIGluIG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICB2YWx1ZTogbmV4dFByb3BzLnZhbHVlLFxuICAgICAgICAgIHNob3dEYXRlOiBuZXh0UHJvcHMudmFsdWUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckZvb3RlciA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgY29uc3QgeyByZW5kZXJFeHRyYUZvb3RlciB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHByZWZpeENscyA9IHRoaXMuZ2V0UHJlZml4Q2xzKCk7XG4gICAgICByZXR1cm4gcmVuZGVyRXh0cmFGb290ZXIgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWZvb3Rlci1leHRyYWB9PntyZW5kZXJFeHRyYUZvb3RlciguLi5hcmdzKX08L2Rpdj5cbiAgICAgICkgOiBudWxsO1xuICAgIH07XG5cbiAgICBjbGVhclNlbGVjdGlvbiA9IChlOiBNb3VzZUV2ZW50PEhUTUxFbGVtZW50PikgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKG51bGwpO1xuICAgIH07XG5cbiAgICBvblBpY2tlckljb25DbGljayA9IChlOiBNb3VzZUV2ZW50PEhUTUxFbGVtZW50PikgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGNvbnN0IHsgZGlzYWJsZWQgfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBmb2N1c2VkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgdGhpcy5waWNrZXIuc2V0T3BlbighZm9jdXNlZCk7XG4gICAgfTtcblxuICAgIGhhbmRsZUNoYW5nZSA9ICh2YWx1ZTogTW9tZW50IHwgbnVsbCkgPT4ge1xuICAgICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKCEoJ3ZhbHVlJyBpbiBwcm9wcykpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgc2hvd0RhdGU6IHZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHByb3BzLm9uQ2hhbmdlKHZhbHVlLCAodmFsdWUgJiYgdmFsdWUuZm9ybWF0KHByb3BzLmZvcm1hdCkpIHx8ICcnKTtcbiAgICB9O1xuXG4gICAgaGFuZGxlQ2FsZW5kYXJDaGFuZ2UgPSAodmFsdWU6IE1vbWVudCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dEYXRlOiB2YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgaGFuZGxlT3BlbkNoYW5nZSA9IChzdGF0dXM6IGJvb2xlYW4pID0+IHtcbiAgICAgIGNvbnN0IHsgb25PcGVuQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgeyBmb2N1c2VkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgaWYgKHN0YXR1cyAhPT0gZm9jdXNlZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBmb2N1c2VkOiBzdGF0dXMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG9uT3BlbkNoYW5nZSkge1xuICAgICAgICBvbk9wZW5DaGFuZ2Uoc3RhdHVzKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9jdXMoKSB7XG4gICAgICB0aGlzLmlucHV0LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgYmx1cigpIHtcbiAgICAgIHRoaXMuaW5wdXQuYmx1cigpO1xuICAgIH1cblxuICAgIHNhdmVJbnB1dCA9IChub2RlOiBhbnkpID0+IHtcbiAgICAgIHRoaXMuaW5wdXQgPSBub2RlO1xuICAgIH07XG5cbiAgICBzYXZlUGlja2VyID0gKG5vZGU6IGFueSkgPT4ge1xuICAgICAgdGhpcy5waWNrZXIgPSBub2RlO1xuICAgIH07XG5cbiAgICBnZXRQcmVmaXhDbHMoKSB7XG4gICAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIHJldHVybiBnZXRQcmVmaXhDbHMoJ2NhbGVuZGFyJywgcHJlZml4Q2xzKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7IHZhbHVlLCBzaG93RGF0ZSwgZm9jdXNlZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGNvbnN0IHByb3BzID0gb21pdCh0aGlzLnByb3BzLCBbJ29uQ2hhbmdlJ10pO1xuICAgICAgY29uc3QgeyBsYWJlbCwgZGlzYWJsZWQsIHBpY2tlcklucHV0Q2xhc3MsIGxvY2FsZSwgbG9jYWxlQ29kZSB9ID0gcHJvcHM7XG4gICAgICBjb25zdCBwcmVmaXhDbHMgPSB0aGlzLmdldFByZWZpeENscygpO1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIHByb3BzID8gcHJvcHMucGxhY2Vob2xkZXIgOiBsb2NhbGUubGFuZy5wbGFjZWhvbGRlcjtcblxuICAgICAgY29uc3QgZGlzYWJsZWRUaW1lID0gcHJvcHMuc2hvd1RpbWUgPyBwcm9wcy5kaXNhYmxlZFRpbWUgOiBudWxsO1xuXG4gICAgICBjb25zdCBjYWxlbmRhckNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoe1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS10aW1lYF06IHByb3BzLnNob3dUaW1lLFxuICAgICAgICBbYCR7cHJlZml4Q2xzfS1tb250aGBdOiBNb250aENhbGVuZGFyID09PSBUaGVDYWxlbmRhcixcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodmFsdWUgJiYgbG9jYWxlQ29kZSkge1xuICAgICAgICB2YWx1ZS5sb2NhbGUobG9jYWxlQ29kZSk7XG4gICAgICB9XG5cbiAgICAgIGxldCBwaWNrZXJQcm9wczogT2JqZWN0ID0ge307XG4gICAgICBsZXQgY2FsZW5kYXJQcm9wczogYW55ID0ge307XG4gICAgICBpZiAocHJvcHMuc2hvd1RpbWUpIHtcbiAgICAgICAgY2FsZW5kYXJQcm9wcyA9IHtcbiAgICAgICAgICBvblNlbGVjdDogdGhpcy5oYW5kbGVDaGFuZ2UsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaWNrZXJQcm9wcyA9IHtcbiAgICAgICAgICBvbkNoYW5nZTogdGhpcy5oYW5kbGVDaGFuZ2UsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoJ21vZGUnIGluIHByb3BzKSB7XG4gICAgICAgIGNhbGVuZGFyUHJvcHMubW9kZSA9IHByb3BzLm1vZGU7XG4gICAgICB9XG5cbiAgICAgIHdhcm5pbmcoXG4gICAgICAgICEoJ29uT0snIGluIHByb3BzKSxcbiAgICAgICAgJ0l0IHNob3VsZCBiZSBgRGF0ZVBpY2tlcltvbk9rXWAgb3IgYE1vbnRoUGlja2VyW29uT2tdYCwgaW5zdGVhZCBvZiBgb25PS2AhJyxcbiAgICAgICk7XG4gICAgICBjb25zdCBjYWxlbmRhciA9IChcbiAgICAgICAgPFRoZUNhbGVuZGFyXG4gICAgICAgICAgey4uLmNhbGVuZGFyUHJvcHN9XG4gICAgICAgICAgZGlzYWJsZWREYXRlPXtwcm9wcy5kaXNhYmxlZERhdGV9XG4gICAgICAgICAgZGlzYWJsZWRUaW1lPXtkaXNhYmxlZFRpbWV9XG4gICAgICAgICAgbG9jYWxlPXtsb2NhbGUubGFuZ31cbiAgICAgICAgICB0aW1lUGlja2VyPXtwcm9wcy50aW1lUGlja2VyfVxuICAgICAgICAgIGRlZmF1bHRWYWx1ZT17cHJvcHMuZGVmYXVsdFBpY2tlclZhbHVlIHx8IGludGVyb3BEZWZhdWx0KG1vbWVudCkoKX1cbiAgICAgICAgICBkYXRlSW5wdXRQbGFjZWhvbGRlcj17cGxhY2Vob2xkZXJ9XG4gICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjYWxlbmRhckNsYXNzTmFtZX1cbiAgICAgICAgICBvbk9rPXtwcm9wcy5vbk9rfVxuICAgICAgICAgIGRhdGVSZW5kZXI9e3Byb3BzLmRhdGVSZW5kZXJ9XG4gICAgICAgICAgZm9ybWF0PXtwcm9wcy5mb3JtYXR9XG4gICAgICAgICAgc2hvd1RvZGF5PXtwcm9wcy5zaG93VG9kYXl9XG4gICAgICAgICAgbW9udGhDZWxsQ29udGVudFJlbmRlcj17cHJvcHMubW9udGhDZWxsQ29udGVudFJlbmRlcn1cbiAgICAgICAgICByZW5kZXJGb290ZXI9e3RoaXMucmVuZGVyRm9vdGVyfVxuICAgICAgICAgIG9uUGFuZWxDaGFuZ2U9e3Byb3BzLm9uUGFuZWxDaGFuZ2V9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2FsZW5kYXJDaGFuZ2V9XG4gICAgICAgICAgdmFsdWU9e3Nob3dEYXRlfVxuICAgICAgICAvPlxuICAgICAgKTtcblxuICAgICAgY29uc3QgY2xlYXJJY29uID1cbiAgICAgICAgIXByb3BzLmRpc2FibGVkICYmIHByb3BzLmFsbG93Q2xlYXIgJiYgdmFsdWUgPyAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXBpY2tlci1jbGVhcmB9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNsZWFyU2VsZWN0aW9ufVxuICAgICAgICAgICAgc2hhcGU9XCJjaXJjbGVcIlxuICAgICAgICAgICAgaWNvbj1cImNsb3NlXCJcbiAgICAgICAgICAgIHNpemU9e1NpemUuc21hbGx9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGw7XG5cbiAgICAgIGNvbnN0IHN1ZmZpeCA9IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXBpY2tlci1pY29uLXdyYXBwZXJgfSBvbkNsaWNrPXt0aGlzLm9uUGlja2VySWNvbkNsaWNrfT5cbiAgICAgICAgICB7Y2xlYXJJY29ufVxuICAgICAgICAgIDxJY29uIHR5cGU9XCJkYXRlX3JhbmdlXCIgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXBpY2tlci1pY29uYH0gLz5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcblxuICAgICAgY29uc3QgaW5wdXRQcm9wcyA9IHtcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIGRpc2FibGVkLFxuICAgICAgICBwbGFjZWhvbGRlcixcbiAgICAgICAgc3VmZml4LFxuICAgICAgICBmb2N1c2VkLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgaW5wdXQgPSAoeyB2YWx1ZTogaW5wdXRWYWx1ZSB9OiB7IHZhbHVlOiBNb21lbnQgfCBudWxsOyB9KSA9PiAoXG4gICAgICAgIDxJbnB1dFxuICAgICAgICAgIHsuLi5pbnB1dFByb3BzfVxuICAgICAgICAgIHJlZj17dGhpcy5zYXZlSW5wdXR9XG4gICAgICAgICAgdmFsdWU9eyhpbnB1dFZhbHVlICYmIGlucHV0VmFsdWUuZm9ybWF0KHByb3BzLmZvcm1hdCkpIHx8ICcnfVxuICAgICAgICAgIGNsYXNzTmFtZT17cGlja2VySW5wdXRDbGFzc31cbiAgICAgICAgICByZWFkT25seVxuICAgICAgICAvPlxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBpZD17cHJvcHMuaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKHByb3BzLmNsYXNzTmFtZSwgcHJvcHMucGlja2VyQ2xhc3MpfVxuICAgICAgICAgIHN0eWxlPXtwcm9wcy5zdHlsZX1cbiAgICAgICAgICBvbkZvY3VzPXtwcm9wcy5vbkZvY3VzfVxuICAgICAgICAgIG9uQmx1cj17cHJvcHMub25CbHVyfVxuICAgICAgICA+XG4gICAgICAgICAgPFJjRGF0ZVBpY2tlclxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgey4uLnBpY2tlclByb3BzfVxuICAgICAgICAgICAgb25PcGVuQ2hhbmdlPXt0aGlzLmhhbmRsZU9wZW5DaGFuZ2V9XG4gICAgICAgICAgICBjYWxlbmRhcj17Y2FsZW5kYXJ9XG4gICAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgICBwcmVmaXhDbHM9e2Ake3ByZWZpeENsc30tcGlja2VyLWNvbnRhaW5lcmB9XG4gICAgICAgICAgICBzdHlsZT17cHJvcHMucG9wdXBTdHlsZX1cbiAgICAgICAgICAgIHJlZj17dGhpcy5zYXZlUGlja2VyfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtpbnB1dH1cbiAgICAgICAgICA8L1JjRGF0ZVBpY2tlcj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgKTtcbiAgICB9XG4gIH07XG59XG4iXSwidmVyc2lvbiI6M30=