import React, { ReactNode } from 'react';
import { Moment } from 'moment';
import classNames from 'classnames';
import autobind from '../_util/autobind';
import Icon from '../icon';
import DaysView, { alwaysValidDate } from './DaysView';
import { ViewMode } from './enum';
import { stopEvent } from '../_util/EventManager';

export default class DecadeYearsView extends DaysView {
  static displayName = 'DecadeYearView';

  @autobind
  handlePrevYearClick() {
    this.changeSelectedDate(this.getCloneDate().subtract(100, 'y'));
  }

  @autobind
  handleNextYearClick() {
    this.changeSelectedDate(this.getCloneDate().add(100, 'y'));
  }

  handleKeyDownHome(e) {
    stopEvent(e);
    const date = this.getCloneDate();
    this.changeSelectedDate(date.subtract(date.year() % 100, 'y'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    const date = this.getCloneDate();
    this.changeSelectedDate(date.add(90 - (date.year() % 100), 'y'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (!e.altKey) {
      this.changeSelectedDate(this.getCloneDate().subtract(10, 'y'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (e.altKey) {
      this.changeViewMode(ViewMode.year);
    } else {
      this.changeSelectedDate(this.getCloneDate().add(10, 'y'));
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().subtract(30, 'y'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().add(30, 'y'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().subtract(100, 'y'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    this.changeSelectedDate(this.getCloneDate().add(100, 'y'));
  }

  renderHeader(): ReactNode {
    const {
      prefixCls,
      props: { date },
    } = this;
    const year = date.year() % 100;
    const from = date.clone().subtract(year, 'y');
    const to = from.clone().add(99, 'y');
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-prev-year`} onClick={this.handlePrevYearClick}>
          <Icon type="first_page" />
        </a>
        <span className={`${prefixCls}-view-select`}>
          {from.year()} - {to.year()}
        </span>
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
    const selected = date.clone().subtract(date.year() % 10, 'y');
    const from = date
      .clone()
      .startOf('y')
      .subtract(date.year() % 100, 'y');
    const to = from.clone().add(100, 'y');
    const prevYear = from.clone().subtract(10, 'y');
    const lastYear = to.clone().add(10, 'y');
    const rows: ReactNode[] = [];
    let cells: ReactNode[] = [];

    while (prevYear.isBefore(lastYear)) {
      const currentYear = prevYear.clone();
      const isDisabled = !isValidDate(currentYear, selected);
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-old`]: currentYear.isBefore(from, 'y'),
        [`${prefixCls}-new`]: currentYear.isSame(to, 'y'),
        [`${prefixCls}-selected`]: prevYear.isSame(selected, 'y'),
        [`${prefixCls}-disabled`]: isDisabled,
      });
      const text = `${prevYear.year()}-${prevYear
        .clone()
        .add(9, 'y')
        .year()}`;

      const decadeProps: any = {
        key: text,
        className,
      };
      if (!isDisabled) {
        decadeProps.onClick = this.handleCellClick.bind(this, currentYear);
        decadeProps.children = this.renderInner(text);
      }

      cells.push(renderer(decadeProps, text, currentYear, selected));

      if (cells.length === 3) {
        rows.push(<tr key={text}>{cells}</tr>);
        cells = [];
      }

      prevYear.add(10, 'y');
    }

    return rows;
  }

  renderFooter(): ReactNode {
    return undefined;
  }

  getPanelClass(): string {
    return `${this.prefixCls}-year-panel`;
  }

  choose(date: Moment): void {
    this.changeSelectedDate(date);
    this.changeViewMode(ViewMode.year);
  }
}
