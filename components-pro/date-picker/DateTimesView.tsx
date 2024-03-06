import React, { ReactNode } from 'react';
import moment, { Moment } from 'moment';
import noop from 'lodash/noop';
import classNames from 'classnames';
import { DatePickerKeyboardEvent } from './DatePicker';
import DaysView, { alwaysValidDate, DateViewProps } from './DaysView';
import TimesView, { TimesViewProps } from './TimesView';
import autobind from '../_util/autobind';
import { ViewMode } from './enum';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { getDateFormatByFieldType } from '../field/utils';

export default class DateTimesView<T extends DateViewProps> extends DaysView<T> implements DatePickerKeyboardEvent {
  static displayName = 'DateTimesView';

  static type = FieldType.dateTime;

  get comboRangeMode(): boolean | undefined {
    return false;
  }

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-datetime`;
  }

  @autobind
  handleTimeSelect() {
    this.changeViewMode(ViewMode.time);
  }

  handleCellClick(date: Moment): void {
    this.changeSelectedDate(date);
  }

  handleKeyDownRight(e) {
    if (e.altKey) {
      this.changeViewMode(ViewMode.time);
    } else {
      this.changeCursorDate(this.getCloneDate().add(1, 'd'));
    }
  }

  getFirstDay(date) {
    const firstDay = date.clone().subtract(1, 'M');
    const hour = firstDay.hour();
    const minute = firstDay.minute();
    const second = firstDay.second();
    firstDay.date(firstDay.daysInMonth()).startOf('w');
    firstDay.hour(hour);
    firstDay.minute(minute);
    firstDay.second(second);
    return firstDay;
  }

  choose(date: Moment, expand = true) {
    const { onSelect = noop, date: selectedDate, isValidDate = alwaysValidDate } = this.props;
    const selected = selectedDate.clone();
    if (isValidDate(date, selected) && isValidDate(date, selected, ViewMode.time)) {
      onSelect(date, expand);
    }
  }

  renderFooter(): ReactNode {
    const {
      prefixCls,
      props: { disabledNow, okButton },
    } = this;
    const footerProps = {
      className: classNames(`${prefixCls}-footer-now-btn`, {
        [`${prefixCls}-now-disabled`]: disabledNow,
      }),
      onClick: !disabledNow ? this.choose.bind(this, moment(), false) : noop,
    };
    return (
      <div className={`${prefixCls}-footer`}>
        <a {...footerProps}>
          {$l('DatePicker', 'now')}
        </a>
        {
          okButton && (
            <a
              className={`${prefixCls}-footer-view-select`}
              onClick={this.choose.bind(this, this.props.date, false)}
            >
              {$l('DatePicker', 'ok')}
            </a>
          )
        }
      </div>
    );
  }

  getTimeProps = () => {
    const { format = getDateFormatByFieldType(TimesView.type) } = this.props;
    const timeProps = {
      ...this.props,
      mode: ViewMode.time,
      datetimeSide: true,
      format,
      renderExtraFooter: undefined,
      comboRangeMode: false,
    } as TimesViewProps;
    return timeProps;
  };

  render() {
    const {
      prefixCls,
      props: { className, extraFooterPlacement },
    } = this;
    const classString = classNames(`${prefixCls}-view`, className, this.getViewClassName());
    return (
      <>
        <div className={`${this.getViewClassName()}-wrapper`}>
          <div className={classString}>
            {this.renderHeader()}
            {this.renderBody()}
          </div>
          <TimesView {...this.getTimeProps()} />
        </div>
        {extraFooterPlacement === 'top' && this.customFooter}
        {this.renderFooter()}
        {extraFooterPlacement === 'bottom' && this.customFooter}
      </>
    );
  }
}
