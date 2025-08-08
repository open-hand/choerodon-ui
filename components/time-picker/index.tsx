import React, { Component, CSSProperties, ReactElement } from 'react';
import { Moment, isMoment } from 'moment';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import RcTimePicker from '../rc-components/time-picker';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export function generateShowHourMinuteSecond(format: string) {
  // Ref: http://momentjs.com/docs/#/parsing/string-format/
  return {
    showHour: format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1,
    showMinute: format.indexOf('m') > -1,
    showSecond: format.indexOf('s') > -1,
  };
}

export interface TimePickerProps {
  className?: string;
  size?: Size;
  value?: Moment;
  defaultValue?: Moment | Moment[];
  open?: boolean;
  format?: string;
  onChange?: (time: Moment, timeString: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  prefixCls?: string;
  hideDisabledOptions?: boolean;
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
  style?: CSSProperties;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  addon?: Function;
  use12Hours?: boolean;
  focusOnOpen?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  allowEmpty?: boolean;
  inputReadOnly?: boolean;
  clearText?: string;
  defaultOpenValue?: Moment;
  popupClassName?: string;
  label?: any;
  component?: any;
}

export interface TimePickerLocale {
  placeholder: string;
}

export default class TimePicker extends Component<TimePickerProps, any> {
  static displayName = 'TimePicker';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    align: {
      offset: [0, -2],
    },
    disabled: false,
    disabledHours: undefined,
    disabledMinutes: undefined,
    disabledSeconds: undefined,
    hideDisabledOptions: false,
    placement: 'bottomLeft',
    transitionName: 'slide-up',
    focusOnOpen: true,
  };

  context: ConfigContextValue;

  private timePickerRef: any;

  constructor(props: TimePickerProps) {
    super(props);
    const value = props.value || props.defaultValue;
    if (value && !isMoment(value)) {
      throw new Error('The value/defaultValue of TimePicker must be a moment object');
    }
    this.state = {
      value,
    };
  }

  componentWillReceiveProps(nextProps: TimePickerProps) {
    if ('value' in nextProps) {
      this.setState({ value: nextProps.value });
    }
  }

  handleChange = (value: Moment) => {
    if (!('value' in this.props)) {
      this.setState({ value });
    }
    const { onChange, format = 'HH:mm:ss' } = this.props;
    if (onChange) {
      onChange(value, (value && value.format(format)) || '');
    }
  };

  handleOpenClose = ({ open }: { open: boolean }) => {
    const { onOpenChange } = this.props;
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  saveTimePicker = (timePickerRef: RcTimePicker | null) => {
    this.timePickerRef = timePickerRef;
  };

  focus() {
    this.timePickerRef.focus();
  }

  blur() {
    this.timePickerRef.blur();
  }

  getDefaultFormat() {
    const { format, use12Hours } = this.props;
    if (format) {
      return format;
    }
    if (use12Hours) {
      return 'h:mm:ss a';
    }
    return 'HH:mm:ss';
  }

  renderTimePicker = (locale: TimePickerLocale) => {
    const props: TimePickerProps & { children?: any } = {
      ...this.props,
    };
    const { value } = this.state;
    const { getPrefixCls } = this.context;
    delete props.defaultValue;
    const prefixCls = getPrefixCls('time-picker', props.prefixCls);
    const format = this.getDefaultFormat();
    const className = classNames(props.className, {
      [`${prefixCls}-${props.size}`]: !!props.size,
    });

    const addon = (panel: ReactElement<any>) =>
      props.addon ? <div className={`${prefixCls}-panel-addon`}>{props.addon(panel)}</div> : null;

    return (
      <RcTimePicker
        {...generateShowHourMinuteSecond(format)}
        {...props}
        prefixCls={prefixCls}
        ref={this.saveTimePicker}
        format={format}
        className={className}
        value={value}
        placeholder={props.placeholder === undefined ? locale.placeholder : props.placeholder}
        onChange={this.handleChange}
        onOpen={this.handleOpenClose}
        onClose={this.handleOpenClose}
        addon={addon}
      />
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="TimePicker" defaultLocale={getRuntimeLocale().TimePicker || {}}>
        {this.renderTimePicker}
      </LocaleReceiver>
    );
  }
}
