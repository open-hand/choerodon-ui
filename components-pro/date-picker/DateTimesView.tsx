import React, { ReactNode } from 'react';
import moment, { Moment } from 'moment';
import noop from 'lodash/noop';
import classNames from 'classnames';
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

  choose(date: Moment, expand: boolean = true) {
    const { onSelect = noop } = this.props;
    onSelect(date, expand);
  }

  renderFooter(): ReactNode {
    const {
      prefixCls,
      props: { date, disabledNow },
    } = this;
    const footerProps = {
      className: classNames(`${prefixCls}-footer-now-btn`,{
        [`${prefixCls}-now-disabled`]: disabledNow,
      }),
      onClick : !disabledNow ? this.choose.bind(this, moment(), false) : noop,
    }
    return (
      <div className={`${prefixCls}-footer`}>
        <a {...footerProps}>
          {$l('DatePicker', 'now')}
        </a>
        <a className={`${prefixCls}-footer-view-select`} onClick={this.handleTimeSelect}>
          {date.format(getDateFormatByFieldType(TimesView.type))}
        </a>
      </div>
    );
  }
}
