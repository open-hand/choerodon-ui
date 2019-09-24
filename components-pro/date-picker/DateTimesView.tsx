import React, { ReactNode } from 'react';
import moment from 'moment';
import { DatePickerKeyboardEvent } from './DatePicker';
import DaysView from './DaysView';
import TimesView from './TimesView';
import autobind from '../_util/autobind';
import { ViewMode } from './enum';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { getDateFormatByFieldType } from '../field/utils';

export default class DateTimesView extends DaysView implements DatePickerKeyboardEvent {
  static displayName = 'DateTimesView';

  static type = FieldType.dateTime;

  @autobind
  handleTimeSelect() {
    this.changeViewMode(ViewMode.time);
  }

  handleKeyDownRight(e) {
    if (e.altKey) {
      this.changeViewMode(ViewMode.time);
    } else {
      this.changeSelectedDate(this.getCloneDate().add(1, 'd'));
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

  renderFooter(): ReactNode {
    const {
      prefixCls,
      props: { date },
    } = this;
    return (
      <div className={`${prefixCls}-footer`}>
        <a className={`${prefixCls}-footer-now-btn`} onClick={this.choose.bind(this, moment())}>
          {$l('DatePicker', 'now')}
        </a>
        <a className={`${prefixCls}-footer-view-select`} onClick={this.handleTimeSelect}>
          {date.format(getDateFormatByFieldType(TimesView.type))}
        </a>
      </div>
    );
  }
}
