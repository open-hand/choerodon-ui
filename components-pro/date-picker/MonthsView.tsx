import React, { ReactNode } from 'react';
import { Moment } from 'moment';
import classNames from 'classnames';
import Icon from '../icon';
import DaysView, { alwaysValidDate, DateViewProps } from './DaysView';
import { ViewMode } from './enum';
import { FieldType } from '../data-set/enum';
import { stopEvent } from '../_util/EventManager';

export default class MonthsView<T extends DateViewProps> extends DaysView<T> {
  static displayName = 'MonthsView';

  static type = FieldType.month;

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-month`;
  }

  handleKeyDownHome(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().startOf('y'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().endOf('y'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (e.altKey) {
      this.changeViewMode(ViewMode.year);
    } else {
      this.changeSelectedDate(this.getCloneDate().subtract(1, 'M'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (e.altKey) {
      const { mode } = this.props;
      if (mode !== ViewMode.month) {
        this.changeViewMode(mode);
      }
    } else {
      this.changeSelectedDate(this.getCloneDate().add(1, 'M'));
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().subtract(3, 'M'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().add(3, 'M'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().subtract(e.altKey ? 10 : 1, 'y'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().add(e.altKey ? 10 : 1, 'y'));
  }

  renderHeader(): ReactNode {
    const {
      prefixCls,
      props: { date },
    } = this;
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-prev-year`} onClick={this.handlePrevYearClick}>
          <Icon type="first_page" />
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {date.year()}
        </a>
        <a className={`${prefixCls}-next-year`}>
          <Icon type="last_page" onClick={this.handleNextYearClick} />
        </a>
      </div>
    );
  }

  renderPanelHead(): ReactNode {
    return undefined;
  }

  renderPanelBody(): ReactNode {
    const {
      prefixCls,
      props: { date, renderer = this.renderCell, isValidDate = alwaysValidDate },
    } = this;
    const selected = date.clone();
    const prevMonth = date.clone().startOf('y');
    const lastMonth = prevMonth.clone().add(12, 'M');
    const rows: ReactNode[] = [];
    let cells: ReactNode[] = [];

    while (prevMonth.isBefore(lastMonth)) {
      const currentMonth = prevMonth.clone();
      const isDisabled = !isValidDate(currentMonth, selected);
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-selected`]: prevMonth.isSame(selected, 'M'),
        [`${prefixCls}-disabled`]: isDisabled,
      });
      const text = prevMonth.localeData().monthsShort(prevMonth);

      const monthProps: any = {
        key: text,
        className,
        children: this.renderInner(text),
      };
      if (!isDisabled) {
        monthProps.onClick = this.handleCellClick.bind(this, currentMonth);
      }

      cells.push(renderer(monthProps, text, currentMonth, selected));

      if (cells.length === 3) {
        rows.push(<tr key={text}>{cells}</tr>);
        cells = [];
      }

      prevMonth.add(1, 'M');
    }

    return rows;
  }

  renderFooter(): ReactNode {
    return undefined;
  }

  getPanelClass(): string {
    return `${this.prefixCls}-month-panel`;
  }

  choose(date: Moment) {
    const { mode } = this.props;
    if (mode !== ViewMode.month) {
      this.changeSelectedDate(date);
      this.changeViewMode(mode);
    } else {
      super.choose(date);
    }
  }
}
