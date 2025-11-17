import React, { ReactNode, CSSProperties } from 'react';
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

  getTargetDate(target?: 0 | 1): Moment {
    const { comboRangeMode } = this;
    const { date, dateRangeValue, rangeTarget } = this.props;
    if (!comboRangeMode || !dateRangeValue || rangeTarget === undefined || target === undefined) return date;

    if (dateRangeValue[0] && dateRangeValue[1] &&
      Math.floor(dateRangeValue[0].year() / 10) === Math.floor(dateRangeValue[1].year() / 10)) {
      return target === 1 ? date.clone().add(10, 'y') : date;
    }
    if (rangeTarget === 0) {
      if (!dateRangeValue[0] && dateRangeValue[1]) {
        return target === 0 ? date.clone().add(-10, 'y') : date;
      }
      return target === 1 ? date.clone().add(10, 'y') : date;
    }
    if (rangeTarget === 1) {
      if (!dateRangeValue[1]) {
        return target === 1 ? date.clone().add(10, 'y') : date;
      }
      return target === 0 ? date.clone().add(-10, 'y') : date;
    }
    return date;
  }

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
    if (this.comboRangeMode) return;
    const date = this.getCloneDate();
    this.changeCursorDate(date.subtract(date.year() % 10, 'y'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    const date = this.getCloneDate();
    this.changeCursorDate(date.add(9 - (date.year() % 10), 'y'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    if (e.altKey) {
      this.changeViewMode(ViewMode.decade);
    } else {
      this.changeCursorDate(this.getCloneDate().subtract(1, 'y'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
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
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(3, 'y'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(3, 'y'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(e.altKey ? 100 : 10, 'y'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(e.altKey ? 100 : 10, 'y'));
  }

  renderHeader(target?: 0 | 1): ReactNode {
    const {
      prefixCls,
      comboRangeMode,
    } = this;
    const date = this.getTargetDate(target);
    const startStyle: CSSProperties = comboRangeMode && target === 0 ? { visibility: 'hidden' } : {};
    const endStyle: CSSProperties = comboRangeMode && target === 1 ? { visibility: 'hidden' } : {};
    const year = date.year() % 10;
    const from = date.clone().subtract(year, 'y');
    const to = from.clone().add(9, 'y');
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-prev-year`} onClick={this.handlePrevYearClick} style={endStyle}>
          <Icon type="first_page" />
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {from.year()} - {to.year()}
        </a>
        <a className={`${prefixCls}-next-year`} onClick={this.handleNextYearClick} style={startStyle}>
          <Icon type="last_page" />
        </a>
      </div>
    );
  }

  renderPanelHead(): ReactNode {
    return undefined;
  }

  renderPanelBody(target?: 0 | 1): ReactNode {
    const {
      prefixCls,
      comboRangeMode,
      startDate,
      endDate,
      props: { renderer = this.renderCell, isValidDate = alwaysValidDate, onDateMouseLeave },
    } = this;
    const date = this.getTargetDate(target);
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
      const isOld = currentYear.isBefore(from, 'y');
      const isNew = currentYear.isSame(to, 'y');
      const isStart = comboRangeMode && !isOld && !isNew && startDate && currentYear.isSame(startDate, 'y');
      const isEnd = comboRangeMode && !isOld && !isNew && endDate && currentYear.isSame(endDate, 'y');
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-old`]: isOld,
        [`${prefixCls}-new`]: isNew,
        [`${prefixCls}-selected`]: (!comboRangeMode && prevYear.isSame(selected, 'y')) ||
        (comboRangeMode && (isStart || isEnd)),
        [`${prefixCls}-disabled`]: isDisabled,
        [`${prefixCls}-in-range`]: comboRangeMode && !isOld && !isNew && this.isInRange(currentYear),
        [`${prefixCls}-range-start`]: isStart,
        [`${prefixCls}-range-end`]: isEnd,
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
      this.changeViewMode(mode === ViewMode.quarter ? ViewMode.quarter : ViewMode.month);
    } else {
      super.choose(date);
    }
  }
}
