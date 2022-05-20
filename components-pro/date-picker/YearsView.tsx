import React, { ReactNode } from 'react';
import { Moment } from 'moment';
import classNames from 'classnames';
import autobind from '../_util/autobind';
import Icon from '../icon';
import { ViewMode } from './enum';
import DaysView, { alwaysValidDate, DateViewProps } from './DaysView';
import { FieldType } from '../data-set/enum';
import { stopEvent } from '../_util/EventManager';

export default class YearsView<T extends DateViewProps> extends DaysView<T> {
  static displayName = 'YearsView';

  static type = FieldType.year;

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-year`;
  }

  @autobind
  handlePrevYearClick() {
    this.changeCursorDate(this.getCloneDate().subtract(10, 'y'), ViewMode.decade);
  }

  @autobind
  handleYearSelect() {
    this.changeViewMode(ViewMode.decade);
  }

  @autobind
  handleNextYearClick() {
    this.changeCursorDate(this.getCloneDate().add(10, 'y'), ViewMode.decade);
  }

  handleKeyDownHome(e) {
    stopEvent(e);
    const date = this.getCloneDate();
    this.changeCursorDate(date.subtract(date.year() % 10, 'y'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    const date = this.getCloneDate();
    this.changeCursorDate(date.add(9 - (date.year() % 10), 'y'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (e.altKey) {
      this.changeViewMode(ViewMode.decade);
    } else {
      this.changeCursorDate(this.getCloneDate().subtract(1, 'y'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (e.altKey) {
      if (this.props.mode !== ViewMode.year) {
        this.changeViewMode(ViewMode.month);
      }
    } else {
      this.changeCursorDate(this.getCloneDate().add(1, 'y'));
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    this.changeCursorDate(this.getCloneDate().subtract(3, 'y'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    this.changeCursorDate(this.getCloneDate().add(3, 'y'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    this.changeCursorDate(this.getCloneDate().subtract(e.altKey ? 100 : 10, 'y'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    this.changeCursorDate(this.getCloneDate().add(e.altKey ? 100 : 10, 'y'));
  }

  renderHeader(): ReactNode {
    const {
      prefixCls,
      props: { date },
    } = this;
    const year = date.year() % 10;
    const from = date.clone().subtract(year, 'y');
    const to = from.clone().add(9, 'y');
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-prev-year`} onClick={this.handlePrevYearClick}>
          <Icon type="first_page" />
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {from.year()} - {to.year()}
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
      props: { date, renderer = this.renderCell, isValidDate = alwaysValidDate, onDateMouseLeave },
    } = this;
    const selected = date.clone();
    const from = date
      .clone()
      .startOf('y')
      .subtract(date.year() % 10, 'y');
    const to = from.clone().add(10, 'y');
    const prevYear = from.clone().subtract(1, 'y');
    const lastYear = to.clone().add(1, 'y');
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

      const text = String(prevYear.year());

      const yearProps: any = {
        key: text,
        className,
        children: this.renderInner(text),
      };

      if (!isDisabled) {
        yearProps.onClick = this.handleCellClick.bind(this, currentYear);
        yearProps.onMouseEnter = this.handleDateMouseEnter.bind(this, currentYear);
        yearProps.onMouseLeave = onDateMouseLeave;
      }

      cells.push(renderer(yearProps, text, currentYear, selected));

      if (cells.length === 3) {
        rows.push(<tr key={text}>{cells}</tr>);
        cells = [];
      }

      prevYear.add(1, 'y');
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
    const { mode } = this.props;
    if (mode !== ViewMode.year) {
      this.changeCursorDate(date);
      this.changeViewMode(ViewMode.month);
    } else {
      super.choose(date);
    }
  }
}
