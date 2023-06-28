import React, { Component, CSSProperties, ReactNode } from 'react';
import moment, { Moment, isMoment } from 'moment';
import noop from 'lodash/noop';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Header from './Header';
import enUS from './locale/en_US';
import FullCalendar from '../rc-components/calendar/FullCalendar';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { RadioProps } from '../radio';
import { SelectProps } from '../select';

export { HeaderProps } from './Header';

function zerofixed(v: number) {
  if (v < 10) {
    return `0${v}`;
  }
  return `${v}`;
}

export type CalendarMode = 'month' | 'year';

export interface CalendarProps {
  prefixCls?: string;
  selectProps?: SelectProps;
  radioProps?: RadioProps;
  className?: string;
  value?: Moment;
  defaultValue?: Moment;
  mode?: CalendarMode;
  fullscreen?: boolean;
  dateCellRender?: (date: Moment) => ReactNode;
  monthCellRender?: (date: Moment) => ReactNode;
  dateFullCellRender?: (date: Moment) => ReactNode;
  monthFullCellRender?: (date: Moment) => ReactNode;
  headerRender?: HeaderRender;
  locale?: any;
  style?: CSSProperties;
  onPanelChange?: (date?: Moment, mode?: CalendarMode) => void;
  onSelect?: (date?: Moment) => void;
  disabledDate?: (current: Moment) => boolean;
  validRange?: [Moment, Moment];
}

export interface CalendarState {
  value: Moment;
  mode?: CalendarMode;
}

export type HeaderRender = (config: {
  value: Moment;
  type: string;
  onChange: (date: Moment) => void;
  onTypeChange: (type: string) => void;
}) => React.ReactNode;

export default class Calendar extends Component<CalendarProps, CalendarState> {
  static displayName = 'Calendar';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    locale: {},
    fullscreen: true,
    mode: 'month',
    onSelect: noop,
    onPanelChange: noop,
  };

  context: ConfigContextValue;

  constructor(props: CalendarProps) {
    super(props);

    const value = props.value || props.defaultValue || moment();
    if (!isMoment(value)) {
      throw new Error('The value/defaultValue of Calendar must be a moment object');
    }
    this.state = {
      value,
      mode: props.mode,
    };
  }

  componentWillReceiveProps(nextProps: CalendarProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value!,
      });
    }
    const { mode } = this.props;
    if ('mode' in nextProps && nextProps.mode !== mode) {
      this.setState({
        mode: nextProps.mode!,
      });
    }
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('fullcalendar', prefixCls);
  }

  monthCellRender = (value: Moment) => {
    const { monthCellRender = noop as Function } = this.props;
    const prefixCls = this.getPrefixCls();
    return (
      <div className={`${prefixCls}-month`}>
        <div className={`${prefixCls}-value`}>{value.localeData().monthsShort(value)}</div>
        <div className={`${prefixCls}-content`}>{monthCellRender(value)}</div>
      </div>
    );
  };

  dateCellRender = (value: Moment) => {
    const { dateCellRender = noop as Function } = this.props;
    const prefixCls = this.getPrefixCls();
    return (
      <div className={`${prefixCls}-date`}>
        <div className={`${prefixCls}-value`}>{zerofixed(value.date())}</div>
        <div className={`${prefixCls}-content`}>{dateCellRender(value)}</div>
      </div>
    );
  };

  setValue = (value: Moment, way: 'select' | 'changePanel') => {
    if (!('value' in this.props)) {
      this.setState({ value });
    }
    if (way === 'select') {
      const { onSelect } = this.props;
      if (onSelect) {
        onSelect(value);
      }
    } else if (way === 'changePanel') {
      const { mode } = this.state;
      this.onPanelChange(value, mode);
    }
  };

  setType = (type: string) => {
    const mode = type === 'date' ? 'month' : 'year';
    const { mode: stateMode, value } = this.state;
    if (stateMode !== mode) {
      this.setState({ mode });
      this.onPanelChange(value, mode);
    }
  };

  onHeaderValueChange = (value: Moment) => {
    this.setValue(value, 'changePanel');
  };

  onHeaderTypeChange = (type: string) => {
    this.setType(type);
  };

  onPanelChange(value: Moment, mode: CalendarMode | undefined) {
    const { onPanelChange } = this.props;
    if (onPanelChange) {
      onPanelChange(value, mode);
    }
  }

  onSelect = (value: Moment) => {
    this.setValue(value, 'select');
  };

  getDateRange = (validRange: [Moment, Moment], disabledDate?: (current: Moment) => boolean) => (
    current: Moment,
  ) => {
    if (!current) {
      return false;
    }
    const [startDate, endDate] = validRange;
    const inRange = !current.isBetween(startDate, endDate, 'days', '[]');
    if (disabledDate) {
      return disabledDate(current) || inRange;
    }
    return inRange;
  };

  renderCalendar = (locale: any, localeCode: string) => {
    const { state, props } = this;
    const { value, mode } = state;
    if (value && localeCode) {
      value.locale(localeCode);
    }
    const { style, className, fullscreen, dateFullCellRender, monthFullCellRender, headerRender } = props;
    const prefixCls = this.getPrefixCls();
    const type = mode === 'year' ? 'month' : 'date';

    let cls = className || '';
    if (fullscreen) {
      cls += ` ${prefixCls}-fullscreen`;
    }

    const monthCellRender = monthFullCellRender || this.monthCellRender;
    const dateCellRender = dateFullCellRender || this.dateCellRender;

    let disabledDate = props.disabledDate;

    if (props.validRange) {
      disabledDate = this.getDateRange(props.validRange, disabledDate);
    }

    return (
      <div className={cls} style={style}>
        {headerRender ? (
          headerRender({
            value: value || moment(),
            type,
            onChange: this.onHeaderValueChange,
            onTypeChange: this.onHeaderTypeChange,
          })
        ) : (
          <Header
            fullscreen={fullscreen}
            type={type}
            value={value}
            locale={locale.lang}
            prefixCls={prefixCls}
            onTypeChange={this.onHeaderTypeChange}
            onValueChange={this.onHeaderValueChange}
            validRange={props.validRange}
            selectProps={props.selectProps}
            radioProps={props.radioProps}
          />
        )}

        <FullCalendar
          {...props}
          disabledDate={disabledDate}
          Select={noop}
          locale={locale.lang}
          type={type}
          prefixCls={prefixCls}
          showHeader={false}
          value={value}
          monthCellRender={monthCellRender}
          dateCellRender={dateCellRender}
          onSelect={this.onSelect}
        />
      </div>
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="Calendar" defaultLocale={enUS}>
        {this.renderCalendar}
      </LocaleReceiver>
    );
  }
}
