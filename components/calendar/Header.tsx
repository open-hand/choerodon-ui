import React, { Component, ReactElement } from 'react';
import { Moment } from 'moment';
import { Size } from '../_util/enum';
import Select, { SelectProps } from '../select';
import { Button, Group, RadioChangeEvent, RadioProps } from '../radio';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

const Option = Select.Option;

export interface HeaderProps {
  prefixCls?: string;
  selectProps?: SelectProps;
  radioProps?: RadioProps;
  locale?: any;
  fullscreen?: boolean;
  yearSelectOffset?: number;
  yearSelectTotal?: number;
  type?: string;
  onValueChange?: (value: Moment) => void;
  onTypeChange?: (type: string) => void;
  value: any;
  validRange?: [Moment, Moment];
}

export default class Header extends Component<HeaderProps, any> {
  static displayName = 'Header';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    yearSelectOffset: 10,
    yearSelectTotal: 20,
  };

  context: ConfigContextValue;

  private calenderHeaderNode: HTMLDivElement;

  getYearSelectElement(year: number) {
    const { yearSelectOffset, yearSelectTotal, locale, prefixCls, selectProps, fullscreen, validRange } = this.props;
    let start = year - (yearSelectOffset as number);
    let end = start + (yearSelectTotal as number);
    if (validRange) {
      start = validRange[0].get('year');
      end = validRange[1].get('year') + 1;
    }
    const suffix = locale.year === '年' ? '年' : '';
    const options: ReactElement<any>[] = [];
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{index + suffix}</Option>);
    }
    return (
      <Select
        {...selectProps}
        size={fullscreen ? Size.default : Size.small}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-year-select`}
        onChange={this.onYearChange}
        value={String(year)}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }

  getMonthsLocale(value: Moment) {
    const current = value.clone();
    const localeData = value.localeData();
    const months: any[] = [];
    for (let i = 0; i < 12; i++) {
      current.month(i);
      months.push(localeData.monthsShort(current));
    }
    return months;
  }

  getMonthSelectElement(month: number, months: number[]) {
    const props = this.props;
    const { prefixCls, selectProps, fullscreen, validRange, value } = props;
    const options: ReactElement<any>[] = [];
    let start = 0;
    let end = 12;
    if (validRange) {
      const [rangeStart, rangeEnd] = validRange;
      const currentYear = value.get('year');
      if (rangeEnd.get('year') === currentYear) {
        end = rangeEnd.get('month') + 1;
      } else {
        start = rangeStart.get('month');
      }
    }
    for (let index = start; index < end; index++) {
      options.push(<Option key={`${index}`}>{months[index]}</Option>);
    }
    return (
      <Select
        {...selectProps}
        size={fullscreen ? Size.default : Size.small}
        dropdownMatchSelectWidth={false}
        className={`${prefixCls}-month-select`}
        value={String(month)}
        onChange={this.onMonthChange}
        getPopupContainer={() => this.calenderHeaderNode}
      >
        {options}
      </Select>
    );
  }

  onYearChange = (year: string) => {
    const { value, validRange } = this.props;
    const newValue = value.clone();
    newValue.year(parseInt(year, 10));
    // switch the month so that it remains within range when year changes
    if (validRange) {
      const [start, end] = validRange;
      const newYear = newValue.get('year');
      const newMonth = newValue.get('month');
      if (newYear === end.get('year') && newMonth > end.get('month')) {
        newValue.month(end.get('month'));
      }
      if (newYear === start.get('year') && newMonth < start.get('month')) {
        newValue.month(start.get('month'));
      }
    }

    const { onValueChange } = this.props;
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  onMonthChange = (month: string) => {
    const { onValueChange, value } = this.props;
    const newValue = value.clone();
    newValue.month(parseInt(month, 10));
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  onTypeChange = (e: RadioChangeEvent) => {
    const { onTypeChange } = this.props;
    if (onTypeChange) {
      onTypeChange(e.target.value);
    }
  };

  getCalenderHeaderNode = (node: HTMLDivElement) => {
    this.calenderHeaderNode = node;
  };

  render() {
    const { type, value, prefixCls, radioProps, locale, fullscreen } = this.props;
    const yearSelect = this.getYearSelectElement(value.year());
    const monthSelect =
      type === 'date'
        ? this.getMonthSelectElement(value.month(), this.getMonthsLocale(value))
        : null;
    const typeSwitch = (
      <Group
        {...radioProps}
        onChange={this.onTypeChange}
        value={type}
        size={fullscreen ? Size.default : Size.small}
      >
        <Button {...radioProps} value="date">{locale.month}</Button>
        <Button {...radioProps} value="month">{locale.year}</Button>
      </Group>
    );

    return (
      <div className={`${prefixCls}-header`} ref={this.getCalenderHeaderNode}>
        {yearSelect}
        {monthSelect}
        {typeSwitch}
      </div>
    );
  }
}
