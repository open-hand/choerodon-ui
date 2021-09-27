import { ClassicComponentClass, CSSProperties, ReactNode } from 'react';
import { Moment } from 'moment';
import { TimePickerProps } from '../time-picker';
import { Size } from '../_util/enum';

export interface PickerProps {
  id?: number | string;
  prefixCls?: string;
  inputPrefixCls?: string;
  format?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  style?: CSSProperties;
  popupStyle?: CSSProperties;
  dropdownClassName?: string;
  locale?: any;
  size?: Size;
  getCalendarContainer?: (triggerNode: Element) => HTMLElement;
  open?: boolean;
  onOpenChange?: (status: boolean) => void;
  disabledDate?: (current: Moment) => boolean;
  renderExtraFooter?: () => ReactNode;
  dateRender?: (current: Moment, today: Moment) => ReactNode;
}

export interface SinglePickerProps {
  value?: Moment;
  defaultValue?: Moment;
  defaultPickerValue?: Moment;
  onChange?: (date: Moment, dateString: string) => void;
}

export interface DatePickerProps extends PickerProps, SinglePickerProps {
  className?: string;
  showTime?: TimePickerProps | boolean;
  processValue?: (value: Moment) => Moment;
  showToday?: boolean;
  open?: boolean;
  disabledTime?: (current: Moment) => {
    disabledHours?: () => number[];
    disabledMinutes?: () => number[];
    disabledSeconds?: () => number[];
  };
  onOpenChange?: (status: boolean) => void;
  onOk?: (selectedTime: Moment) => void;
  placeholder?: string;
}

export interface MonthPickerProps extends PickerProps, SinglePickerProps {
  className?: string;
  placeholder?: string;
}

export type RangePickerValue =
  undefined[] |
  [Moment] |
  [undefined, Moment] |
  [Moment, Moment];
export type RangePickerPresetRange = RangePickerValue | (() => RangePickerValue);

export interface RangePickerProps extends PickerProps {
  className?: string;
  value?: RangePickerValue;
  defaultValue?: RangePickerValue;
  defaultPickerValue?: RangePickerValue;
  onChange?: (dates: RangePickerValue, dateStrings: [string, string]) => void;
  onCalendarChange?: (dates: RangePickerValue, dateStrings: [string, string]) => void;
  onOk?: (selectedTime: Moment) => void;
  showTime?: TimePickerProps | boolean;
  ranges?: {
    [range: string]: RangePickerPresetRange;
  };
  placeholder?: [string, string];
  mode?: string | string[];
  disabledTime?: (current: Moment, type: string) => {
    disabledHours?: () => number[];
    disabledMinutes?: () => number[];
    disabledSeconds?: () => number[];
  };
  onPanelChange?: (value?: RangePickerValue, mode?: string | string[]) => void;
}

export interface WeekPickerProps extends PickerProps, SinglePickerProps {
  className?: string;
  placeholder?: string;
}

export interface DatePickerDecorator extends ClassicComponentClass<DatePickerProps> {
  RangePicker: ClassicComponentClass<RangePickerProps>;
  MonthPicker: ClassicComponentClass<MonthPickerProps>;
  WeekPicker: ClassicComponentClass<WeekPickerProps>;
}
