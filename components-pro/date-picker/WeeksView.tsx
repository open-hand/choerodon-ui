import React, { ReactNode } from 'react';
import moment, { Moment } from 'moment';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { DatePickerKeyboardEvent } from './DatePicker';
import DaysView, { DateViewProps } from './DaysView';
import { ViewMode } from './enum';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { stopEvent } from '../_util/EventManager';

export default class WeeksView<T extends DateViewProps> extends DaysView<T> implements DatePickerKeyboardEvent {
  static displayName = 'WeeksView';

  static type = FieldType.week;

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-week`;
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (e.altKey) {
      this.changeViewMode(ViewMode.month);
    } else {
      this.changeCursorDate(this.getCloneDate().subtract(1, 'M'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (!e.altKey) {
      this.changeCursorDate(this.getCloneDate().add(1, 'M'));
    }
  }

  renderPanelBody(): ReactNode {
    const {
      prefixCls,
      props: { date, renderer = this.renderCell, onDateMouseLeave },
    } = this;
    const selected = date.clone();
    const firstDay = this.getFirstDay(date);
    const lastDay = firstDay.clone().add(42, 'd');
    const rows: ReactNode[] = [];
    let cells: ReactNode[] = [];

    while (firstDay.isBefore(lastDay)) {
      const currentDate = firstDay.clone();
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-selected`]: firstDay.isSame(selected, 'w'),
      });

      const text = String(currentDate.date());

      const dayProps: any = {
        key: firstDay.format('M_D'),
        className,
        children: this.renderInner(text),
      };

      if (cells.length === 0) {
        const weekProps: any = {
          key: firstDay.format('Wo'),
          className: `${className} ${prefixCls}-week-cell`,
        };
        cells.push(this.getWeekCell(weekProps, firstDay.week()));
      }

      cells.push(renderer(dayProps, text, currentDate, selected));

      if (cells.length === 8) {
        rows.push(
          <tr
            onClick={this.handleCellClick.bind(this, currentDate)}
            key={firstDay.format('M_D')}
            onMouseEnter={this.handleDateMouseEnter.bind(this, currentDate)}
            onMouseLeave={onDateMouseLeave}
          >
            {cells}
          </tr>,
        );
        cells = [];
      }

      firstDay.add(1, 'd');
    }

    return rows;
  }

  choose(date: Moment) {
    super.choose(date.startOf('W'));
  }

  getPanelClass(): string {
    return `${this.prefixCls}-week-panel`;
  }

  renderFooter(): ReactNode {
    const { prefixCls, props: { disabledNow, isExistValue } } = this;
    const footerProps = {
      className: classNames(`${prefixCls}-footer-now-btn`, {
        [`${prefixCls}-now-disabled`]: disabledNow,
        [`${prefixCls}-now-selected`]: isExistValue,
      }),
      onClick: !disabledNow ? this.choose.bind(this, moment()) : noop,
    }
    return (
      <div className={`${prefixCls}-footer`}>
        <a {...footerProps}>{$l('DatePicker', 'this_week')}</a>
      </div>
    );
  }

  getWeekCell(props: object, text: string) {
    const { prefixCls } = this;
    return (
      <td {...props}>
        <div className={`${prefixCls}-cell-inner`}>W{text}</div>
      </td>
    );
  }

  getDaysOfWeek(): ReactNode[] {
    return [<th key="null">&nbsp;</th>, ...super.getDaysOfWeek()];
  }
}
