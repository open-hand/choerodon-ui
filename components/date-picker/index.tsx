import { ClassicComponentClass } from 'react';
import createPicker from './createPicker';
import wrapPicker from './wrapPicker';
import RangePicker from './RangePicker';
import WeekPicker from './WeekPicker';
import { DatePickerProps, DatePickerDecorator } from './interface';
import RcCalendar from '../rc-components/calendar';
import MonthCalendar from '../rc-components/calendar/MonthCalendar';

const DatePicker = wrapPicker(createPicker(RcCalendar)) as ClassicComponentClass<DatePickerProps>;

const MonthPicker = wrapPicker(createPicker(MonthCalendar), 'YYYY-MM');

Object.assign(DatePicker, {
  RangePicker: wrapPicker(RangePicker),
  MonthPicker,
  WeekPicker: wrapPicker(WeekPicker, 'gggg-wo'),
});

export default DatePicker as DatePickerDecorator;
