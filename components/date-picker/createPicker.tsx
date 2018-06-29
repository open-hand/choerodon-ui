import * as React from 'react';
import * as moment from 'moment';
import classNames from 'classnames';
import omit from 'omit.js';
import Button from '../button';
import Icon from '../icon';
import Input from '../input';
import warning from '../_util/warning';
import interopDefault from '../_util/interopDefault';
import MonthCalendar from '../rc-components/calendar/MonthCalendar';
import RcDatePicker from '../rc-components/calendar/Picker';

export interface PickerProps {
  value?: moment.Moment;
  prefixCls: string;
}

export default function createPicker(TheCalendar: React.ComponentClass): any {
  return class CalenderWrapper extends React.Component<any, any> {
    static defaultProps = {
      prefixCls: 'ant-calendar',
      allowClear: true,
      showToday: true,
    };

    private input: any;
    private picker: any;
    constructor(props: any) {
      super(props);
      const value = props.value || props.defaultValue;
      if (value && !interopDefault(moment).isMoment(value)) {
        throw new Error(
          'The value/defaultValue of DatePicker or MonthPicker must be ' +
          'a moment object after `antd@2.0`, see: https://u.ant.design/date-picker-value',
        );
      }
      this.state = {
        value,
        showDate: value,
        focused: false,
      };
    }

    componentWillReceiveProps(nextProps: PickerProps) {
      if ('value' in nextProps) {
        this.setState({
          value: nextProps.value,
          showDate: nextProps.value,
        });
      }
    }

    renderFooter = (...args: any[]) => {
      const { prefixCls, renderExtraFooter } = this.props;
      return renderExtraFooter ? (
        <div className={`${prefixCls}-footer-extra`}>
          {renderExtraFooter(...args)}
        </div>
      ) : null;
    }

    clearSelection = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleChange(null);
    }

    onPickerIconClick = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const { focused } = this.state;
      this.picker.setOpen(!focused);
    }

    handleChange = (value: moment.Moment | null) => {
      const props = this.props;
      if (!('value' in props)) {
        this.setState({
          value,
          showDate: value,
        });
      }
      props.onChange(value, (value && value.format(props.format)) || '');
    }

    handleCalendarChange = (value: moment.Moment) => {
      this.setState({ showDate: value });
    }

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
    }

    focus() {
      this.input.focus();
    }

    blur() {
      this.input.blur();
    }

    saveInput = (node: any) => {
      this.input = node;
    }

    savePicker = (node: any) => {
      this.picker = node;
    }

    render() {
      const { value, showDate, focused } = this.state;
      const props = omit(this.props, ['onChange']);
      const { prefixCls, label, disabled, pickerInputClass, locale, localeCode } = props;

      const placeholder = ('placeholder' in props)
        ? props.placeholder : locale.lang.placeholder;

      const disabledTime = props.showTime ? props.disabledTime : null;

      const calendarClassName = classNames({
        [`${prefixCls}-time`]: props.showTime,
        [`${prefixCls}-month`]: MonthCalendar === TheCalendar,
      });

      if (value && localeCode) {
        value.locale(localeCode);
      }

      let pickerProps: Object = {};
      let calendarProps: any = {};
      if (props.showTime) {
        calendarProps = {
          // fix https://github.com/ant-design/ant-design/issues/1902
          onSelect: this.handleChange,
        };
      } else {
        pickerProps = {
          onChange: this.handleChange,
        };
      }
      if ('mode' in props) {
        calendarProps.mode = props.mode;
      }

      warning(!('onOK' in props), 'It should be `DatePicker[onOk]` or `MonthPicker[onOk]`, instead of `onOK`!');
      const calendar = (
        <TheCalendar
          {...calendarProps}
          disabledDate={props.disabledDate}
          disabledTime={disabledTime}
          locale={locale.lang}
          timePicker={props.timePicker}
          defaultValue={props.defaultPickerValue || interopDefault(moment)()}
          dateInputPlaceholder={placeholder}
          prefixCls={prefixCls}
          className={calendarClassName}
          onOk={props.onOk}
          dateRender={props.dateRender}
          format={props.format}
          showToday={props.showToday}
          monthCellContentRender={props.monthCellContentRender}
          renderFooter={this.renderFooter}
          onPanelChange={props.onPanelChange}
          onChange={this.handleCalendarChange}
          value={showDate}
        />
      );

      const clearIcon = (!props.disabled && props.allowClear && value) ? (
        <Button
          className={`${prefixCls}-picker-clear`}
          onClick={this.clearSelection}
          shape="circle"
          icon="close"
          size="small"
        />
      ) : null;

      const suffix = (<span
        className={`${prefixCls}-picker-icon-wrapper`}
        style={{ minWidth: clearIcon ? '42px' : '18px' }}
        onClick={this.onPickerIconClick}
      >
        {clearIcon}
        <Icon type="date_range" className={`${prefixCls}-picker-icon`} />
      </span>);

      const inputProps = {
        label,
        disabled,
        placeholder,
        suffix,
        focused,
      };

      const input = ({ value: inputValue }: { value: moment.Moment | null }) => (
        <Input
          {...inputProps}
          ref={this.saveInput}
          value={(inputValue && inputValue.format(props.format)) || ''}
          className={pickerInputClass}
          readOnly
        />
      );

      return (
        <span
          id={props.id}
          className={classNames(props.className, props.pickerClass)}
          style={props.style}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        >
          <RcDatePicker
            {...props}
            {...pickerProps}
            onOpenChange={this.handleOpenChange}
            calendar={calendar}
            value={value}
            prefixCls={`${prefixCls}-picker-container`}
            style={props.popupStyle}
            ref={this.savePicker}
          >
            {input}
          </RcDatePicker>
        </span>
      );
    }
  };
}
