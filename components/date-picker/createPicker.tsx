import React, { Component, ComponentClass, MouseEvent } from 'react';
import moment, { isMoment, Moment } from 'moment';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isFunction from 'lodash/isFunction';
import Button from '../button';
import Icon from '../icon';
import Input from '../input';
import warning from '../_util/warning';
import MonthCalendar from '../rc-components/calendar/MonthCalendar';
import RcDatePicker from '../rc-components/calendar/Picker';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface PickerProps {
  value?: Moment;
  prefixCls: string;
}

export default function createPicker(TheCalendar: ComponentClass): any {
  return class CalenderWrapper extends Component<any, any> {
    static displayName = 'CalenderWrapper';

    static get contextType(): typeof ConfigContext {
      return ConfigContext;
    }

    static defaultProps = {
      allowClear: true,
      showToday: true,
    };

    private input: any;

    private picker: any;

    context: ConfigContextValue;

    constructor(props: any, context: ConfigContextValue) {
      super(props, context);
      const value = props.value || props.defaultValue;
      if (value && !isMoment(value)) {
        throw new Error(
          'The value/defaultValue of DatePicker or MonthPicker must be a moment object',
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
      const { renderExtraFooter } = this.props;
      const prefixCls = this.getPrefixCls();
      return renderExtraFooter ? (
        <div className={`${prefixCls}-footer-extra`}>{renderExtraFooter(...args)}</div>
      ) : null;
    };

    clearSelection = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleChange(null);
    };

    onPickerIconClick = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const { disabled } = this.props;
      if (disabled) {
        return;
      }
      const { focused } = this.state;
      this.picker.setOpen(!focused);
    };

    handleChange = (_value: Moment | null) => {
      const props = this.props;
      const { processValue: processV } = props;
      const value = isFunction(processV) ? processV(_value) : _value;
      if (!('value' in props)) {
        this.setState({
          value,
          showDate: value,
        });
      }
      props.onChange(value, (value && value.format(props.format)) || '');
    };

    handleCalendarChange = (value: Moment) => {
      this.setState({ showDate: value });
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

    getPrefixCls() {
      const { prefixCls } = this.props;
      const { getPrefixCls } = this.context;
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

      let pickerProps: Record<string, any> = {};
      let calendarProps: any = {};
      if (props.showTime) {
        calendarProps = {
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

      warning(
        !('onOK' in props),
        'It should be `DatePicker[onOk]` or `MonthPicker[onOk]`, instead of `onOK`!',
      );
      const calendar = (
        <TheCalendar
          {...calendarProps}
          disabledDate={props.disabledDate}
          disabledTime={disabledTime}
          locale={locale.lang}
          timePicker={props.timePicker}
          defaultValue={props.defaultPickerValue || moment()}
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

      const clearIcon =
        !props.disabled && props.allowClear && value ? (
          <Button
            className={`${prefixCls}-picker-clear`}
            onClick={this.clearSelection}
            shape="circle"
            icon="close"
            size={Size.small}
          />
        ) : null;

      const suffix = (
        <span className={`${prefixCls}-picker-icon-wrapper`} onClick={this.onPickerIconClick}>
          {clearIcon}
          <Icon type="date_range" className={`${prefixCls}-picker-icon`} />
        </span>
      );

      const inputProps = {
        label,
        disabled,
        placeholder,
        suffix,
        focused,
      };

      const input = ({ value: inputValue }: { value: Moment | null }) => (
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
