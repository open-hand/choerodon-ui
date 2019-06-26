import React, { Component, MouseEvent } from 'react';
import moment, { Moment } from 'moment';
import classNames from 'classnames';
import Icon from '../icon';
import Input from '../input';
import Button from '../button';
import interopDefault from '../_util/interopDefault';
import Calendar from '../rc-components/calendar';
import RcDatePicker from '../rc-components/calendar/Picker';
import { Size } from '../_util/enum';

function formatValue(value: Moment | null, format: string): string {
  return (value && value.format(format)) || '';
}

export default class WeekPicker extends Component<any, any> {
  static defaultProps = {
    format: 'gggg-wo',
    allowClear: true,
  };

  private input: any;
  private picker: any;

  constructor(props: any) {
    super(props);
    const value = props.value || props.defaultValue;
    if (value && !interopDefault(moment).isMoment(value)) {
      throw new Error(
        'The value/defaultValue of DatePicker or MonthPicker must be a moment object',
      );
    }
    this.state = {
      value,
      focused: false,
    };
  }

  componentWillReceiveProps(nextProps: any) {
    if ('value' in nextProps) {
      this.setState({ value: nextProps.value });
    }
  }

  weekDateRender = (current: any) => {
    const selectedValue = this.state.value;
    const { prefixCls } = this.props;
    if (selectedValue &&
      current.year() === selectedValue.year() &&
      current.week() === selectedValue.week()) {
      return (
        <div className={`${prefixCls}-selected-day`}>
          <div className={`${prefixCls}-date`}>
            {current.date()}
          </div>
        </div>
      );
    }
    return (
      <div className={`${prefixCls}-calendar-date`}>
        {current.date()}
      </div>
    );
  };
  handleOpenChange = (status: boolean) => {
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
  handleChange = (value: Moment | null) => {
    if (!('value' in this.props)) {
      this.setState({ value });
    }
    this.props.onChange(value, formatValue(value, this.props.format));
  };
  clearSelection = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.handleChange(null);
  };
  onPickerIconClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { focused } = this.state;
    this.picker.setOpen(!focused);
  };

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  saveInput = (node: any) => {
    this.input = node;
  };
  savePicker = (node: any) => {
    this.picker = node;
  };

  render() {
    const { focused } = this.state;
    const {
      prefixCls, className, disabled, pickerClass, popupStyle,
      pickerInputClass, format, allowClear, locale, localeCode, disabledDate,
      style, onFocus, onBlur, label,
    } = this.props;

    const pickerValue = this.state.value;
    if (pickerValue && localeCode) {
      pickerValue.locale(localeCode);
    }

    const placeholder = ('placeholder' in this.props)
      ? this.props.placeholder : locale.lang.placeholder;

    const calendar = (
      <Calendar
        showWeekNumber
        dateRender={this.weekDateRender}
        prefixCls={prefixCls}
        format={format}
        locale={locale.lang}
        showDateInput={false}
        showToday={false}
        disabledDate={disabledDate}
      />
    );
    const clearIcon = (!disabled && allowClear && this.state.value) ? (
      <Button
        className={`${prefixCls}-picker-clear`}
        onClick={this.clearSelection}
        shape="circle"
        icon="close"
        size={Size.small}
      />
    ) : null;

    const suffix = (<span
      className={`${prefixCls}-picker-icon-wrapper`}
      onClick={this.onPickerIconClick}
    >
      {clearIcon}
      <Icon type="date_range" className={`${prefixCls}-picker-icon`} />
    </span>);
    const input = ({ value }: { value: Moment | undefined }) => (
      <Input
        ref={this.saveInput}
        disabled={disabled}
        readOnly
        value={(value && value.format(format)) || ''}
        placeholder={placeholder}
        className={pickerInputClass}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        suffix={suffix}
        label={label}
        focused={focused}
      />
    );
    return (
      <span className={classNames(className, pickerClass)} id={this.props.id}>
        <RcDatePicker
          {...this.props}
          calendar={calendar}
          prefixCls={`${prefixCls}-picker-container`}
          value={pickerValue}
          onChange={this.handleChange}
          onOpenChange={this.handleOpenChange}
          style={popupStyle}
          ref={this.savePicker}
        >
          {input}
        </RcDatePicker>
      </span>
    );
  }
}
