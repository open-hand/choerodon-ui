/* tslint:disable jsx-no-multiline-js */
import React, { Component, MouseEventHandler } from 'react';
import moment, { Moment, isMoment } from 'moment';
import classNames from 'classnames';
import Button from '../button';
import Icon from '../icon';
import warning from '../_util/warning';
import { RangePickerPresetRange, RangePickerValue } from './interface';
import RangeCalendar from '../rc-components/calendar/RangeCalendar';
import RcDatePicker from '../rc-components/calendar/Picker';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface RangePickerState {
  value?: RangePickerValue;
  showDate?: RangePickerValue;
  open?: boolean;
  hoverValue?: RangePickerValue;
}

function getShowDateFromValue(value: RangePickerValue) {
  const [start, end] = value;
  // value could be an empty array, then we should not reset showDate
  if (!start && !end) {
    return;
  }
  const newEnd = end && end.isSame(start, 'month') ? end.clone().add(1, 'month') : end;
  return [start, newEnd] as RangePickerValue;
}

function formatValue(value: Moment | undefined, format: string): string {
  return (value && value.format(format)) || '';
}

function pickerValueAdapter(value?: Moment | RangePickerValue): RangePickerValue | undefined {
  if (!value) {
    return;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value, value.clone().add(1, 'month')];
}

function isEmptyArray(arr: any) {
  if (Array.isArray(arr)) {
    return arr.length === 0 || arr.every(i => !i);
  }
  return false;
}

function fixLocale(value: RangePickerValue | undefined, localeCode: string) {
  if (!localeCode) {
    return;
  }
  if (!value || value.length === 0) {
    return;
  }
  if (value[0]) {
    value[0]!.locale(localeCode);
  }
  if (value[1]) {
    value[1]!.locale(localeCode);
  }
}

export default class RangePicker extends Component<any, RangePickerState> {
  static displayName = 'RangePicker';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    allowClear: true,
    showToday: false,
  };

  private picker: HTMLSpanElement;

  context: ConfigContextValue;

  constructor(props: any, context: ConfigContextValue) {
    super(props, context);
    const value = props.value || props.defaultValue || [];
    if (
      (value[0] && !isMoment(value[0])) ||
      (value[1] && !isMoment(value[1]))
    ) {
      throw new Error('The value/defaultValue of RangePicker must be a moment object array');
    }
    const pickerValue = !value || isEmptyArray(value) ? props.defaultPickerValue : value;
    this.state = {
      value,
      showDate: pickerValueAdapter(pickerValue || moment()),
      open: props.open,
      hoverValue: [],
    };
  }

  componentWillReceiveProps(nextProps: any) {
    if ('value' in nextProps) {
      const { showDate } = this.state;
      const value = nextProps.value || [];
      this.setState({
        value,
        showDate: getShowDateFromValue(value) || showDate,
      });
    }
    if ('open' in nextProps) {
      this.setState({
        open: nextProps.open,
      });
    }
  }

  clearSelection: MouseEventHandler<HTMLElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ value: [] });
    this.handleChange([]);
  };

  clearHoverValue = () => this.setState({ hoverValue: [] });

  handleChange = (value: RangePickerValue) => {
    const props = this.props;
    if (!('value' in props)) {
      this.setState(({ showDate }) => ({
        value,
        showDate: getShowDateFromValue(value) || showDate,
      }));
    }
    props.onChange(value, [
      formatValue(value[0], props.format),
      formatValue(value[1], props.format),
    ]);
  };

  handleOpenChange = (open: boolean) => {
    if (!('open' in this.props)) {
      this.setState({ open });
    }

    if (open === false) {
      this.clearHoverValue();
    }

    const { onOpenChange } = this.props;
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  handleShowDateChange = (showDate: RangePickerValue) => this.setState({ showDate });

  handleHoverChange = (hoverValue: any) => this.setState({ hoverValue });

  handleRangeMouseLeave = () => {
    const { open } = this.state;
    if (open) {
      this.clearHoverValue();
    }
  };

  handleCalendarInputSelect = (value: RangePickerValue) => {
    if (!value[0]) {
      return;
    }
    this.setState(({ showDate }) => ({
      value,
      showDate: getShowDateFromValue(value) || showDate,
    }));
  };

  handleRangeClick = (value: RangePickerPresetRange) => {
    if (typeof value === 'function') {
      value = value();
    }

    this.setValue(value, true);

    const { onOk } = this.props;
    if (onOk) {
      onOk(value);
    }
  };

  setValue(value: RangePickerValue, hidePanel?: boolean) {
    this.handleChange(value);
    const { props } = this;
    if ((hidePanel || !props.showTime) && !('open' in props)) {
      this.setState({ open: false });
    }
  }

  focus() {
    this.picker.focus();
  }

  blur() {
    this.picker.blur();
  }

  savePicker = (node: HTMLSpanElement) => {
    this.picker = node;
  };

  renderFooter = (...args: any[]) => {
    const { ranges, renderExtraFooter } = this.props;
    const prefixCls = this.getPrefixCls();
    if (!ranges && !renderExtraFooter) {
      return null;
    }
    const customFooter = renderExtraFooter ? (
      <div className={`${prefixCls}-footer-extra`} key="extra">
        {renderExtraFooter(...args)}
      </div>
    ) : null;
    const operations = Object.keys(ranges || {}).map(range => {
      const value = ranges[range];
      return (
        <a
          key={range}
          onClick={() => this.handleRangeClick(value)}
          onMouseEnter={() => this.setState({ hoverValue: value })}
          onMouseLeave={this.handleRangeMouseLeave}
        >
          {range}
        </a>
      );
    });
    const rangeNode = (
      <div className={`${prefixCls}-footer-extra ${prefixCls}-range-quick-selector`} key="range">
        {operations}
      </div>
    );
    return [rangeNode, customFooter];
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('calendar', prefixCls);
  }

  render() {
    const { state, props } = this;
    const { value, showDate, hoverValue, open } = state;
    const {
      popupStyle,
      style,
      disabledDate,
      disabledTime,
      showTime,
      showToday,
      ranges,
      onOk,
      locale,
      localeCode,
      format,
      dateRender,
      onCalendarChange,
    } = props;

    fixLocale(value, localeCode);
    fixLocale(showDate, localeCode);

    warning(!('onOK' in props), 'It should be `RangePicker[onOk]`, instead of `onOK`!');

    const prefixCls = this.getPrefixCls();
    const calendarClassName = classNames({
      [`${prefixCls}-time`]: showTime,
      [`${prefixCls}-range-with-ranges`]: ranges,
    });

    // 需要选择时间时，点击 ok 时才触发 onChange
    const pickerChangeHandler = {
      onChange: this.handleChange,
    };
    let calendarProps: any = {
      onOk: this.handleChange,
    };
    if (props.timePicker) {
      pickerChangeHandler.onChange = changedValue => this.handleChange(changedValue);
    } else {
      calendarProps = {};
    }
    if ('mode' in props) {
      calendarProps.mode = props.mode;
    }

    const startPlaceholder =
      'placeholder' in props ? props.placeholder[0] : locale.lang.rangePlaceholder[0];
    const endPlaceholder =
      'placeholder' in props ? props.placeholder[1] : locale.lang.rangePlaceholder[1];

    const calendar = (
      <RangeCalendar
        {...calendarProps}
        onChange={onCalendarChange}
        format={format}
        prefixCls={prefixCls}
        className={calendarClassName}
        renderFooter={this.renderFooter}
        timePicker={props.timePicker}
        disabledDate={disabledDate}
        disabledTime={disabledTime}
        dateInputPlaceholder={[startPlaceholder, endPlaceholder]}
        locale={locale.lang}
        onOk={onOk}
        dateRender={dateRender}
        value={showDate}
        onValueChange={this.handleShowDateChange}
        hoverValue={hoverValue}
        onHoverChange={this.handleHoverChange}
        onPanelChange={props.onPanelChange}
        showToday={showToday}
        onInputSelect={this.handleCalendarInputSelect}
      />
    );

    // default width for showTime
    const pickerStyle = {} as any;
    if (props.showTime) {
      pickerStyle.width = (style && style.width) || 350;
    }

    const clearIcon =
      !props.disabled && props.allowClear && value && (value[0] || value[1]) ? (
        <Button
          shape="circle"
          size={Size.small}
          onClick={this.clearSelection}
          className={`${prefixCls}-picker-clear`}
          icon="close"
        />
      ) : null;

    const input = ({ value: inputValue }: { value: any }) => {
      const start = inputValue[0];
      const end = inputValue[1];
      return (
        <span className={`${prefixCls}-range-picker ${props.pickerWrapperInputClass}`}>
          <span className={props.pickerInputClass}>
            <input
              disabled={props.disabled}
              readOnly
              value={(start && start.format(props.format)) || ''}
              placeholder={startPlaceholder}
              className={`${prefixCls}-range-picker-input`}
              tabIndex={-1}
            />
            <span className={`${prefixCls}-range-picker-separator`}> ~ </span>
            <input
              disabled={props.disabled}
              readOnly
              value={(end && end.format(props.format)) || ''}
              placeholder={endPlaceholder}
              className={`${prefixCls}-range-picker-input`}
              tabIndex={-1}
            />
            {clearIcon}
            <span className={`${props.inputPrefixCls}-suffix`}>
              <Icon type="date_range" className={`${prefixCls}-picker-icon`} />
            </span>
          </span>
        </span>
      );
    };

    return (
      <span
        ref={this.savePicker}
        id={props.id}
        className={classNames(props.className, props.pickerClass)}
        style={{ ...style, ...pickerStyle }}
        tabIndex={props.disabled ? -1 : 0}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      >
        <RcDatePicker
          {...props}
          {...pickerChangeHandler}
          calendar={calendar}
          value={value}
          open={open}
          onOpenChange={this.handleOpenChange}
          prefixCls={`${prefixCls}-picker-container`}
          style={popupStyle}
        >
          {input}
        </RcDatePicker>
      </span>
    );
  }
}
