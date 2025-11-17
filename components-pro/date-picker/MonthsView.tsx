import React, { ReactNode, CSSProperties } from 'react';
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

  getTargetDate(target?: 0 | 1): Moment {
    const { comboRangeMode } = this;
    const { date, dateRangeValue, rangeTarget } = this.props;
    if (!comboRangeMode || !dateRangeValue || rangeTarget === undefined || target === undefined) return date;

    if (dateRangeValue[0] && dateRangeValue[1] && dateRangeValue[0].isSame(dateRangeValue[1], 'y')) {
      return target === 1 ? date.clone().add(1, 'y') : date;
    }
    if (rangeTarget === 0) {
      if (!dateRangeValue[0] && dateRangeValue[1]) {
        return target === 0 ? date.clone().add(-1, 'y') : date;
      }
      return target === 1 ? date.clone().add(1, 'y') : date;
    }
    if (rangeTarget === 1) {
      if (!dateRangeValue[1]) {
        return target === 1 ? date.clone().add(1, 'y') : date;
      }
      return target === 0 ? date.clone().add(-1, 'y') : date;
    }
    return date;
  }

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-month`;
  }

  handleKeyDownHome(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().startOf('y'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().endOf('y'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    if (e.altKey) {
      this.changeViewMode(ViewMode.year);
    } else {
      this.changeCursorDate(this.getCloneDate().subtract(1, 'M'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    if (e.altKey) {
      const { mode } = this.props;
      if (mode !== ViewMode.month) {
        this.changeViewMode(mode);
      }
    } else {
      this.changeCursorDate(this.getCloneDate().add(1, 'M'));
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(3, 'M'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(3, 'M'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(e.altKey ? 10 : 1, 'y'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(e.altKey ? 10 : 1, 'y'));
  }

  renderHeader(target?: 0 | 1): ReactNode {
    const {
      prefixCls,
      comboRangeMode,
    } = this;
    const date = this.getTargetDate(target);
    const startStyle: CSSProperties = comboRangeMode && target === 0 ? { visibility: 'hidden' } : {};
    const endStyle: CSSProperties = comboRangeMode && target === 1 ? { visibility: 'hidden' } : {};
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-prev-year`} onClick={this.handlePrevYearClick} style={endStyle}>
          <Icon type="first_page" />
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {date.year()}
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
    const prevMonth = date.clone().startOf('y');
    const lastMonth = prevMonth.clone().add(12, 'M');
    const rows: ReactNode[] = [];
    let cells: ReactNode[] = [];

    while (prevMonth.isBefore(lastMonth)) {
      const currentMonth = prevMonth.clone();
      const isDisabled = !isValidDate(currentMonth, selected);
      const isStart = comboRangeMode && startDate && prevMonth.isSame(startDate, 'M');
      const isEnd = comboRangeMode && endDate && prevMonth.isSame(endDate, 'M');
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-selected`]: (!comboRangeMode && prevMonth.isSame(selected, 'M')) ||
        (comboRangeMode && (isStart || isEnd)),
        [`${prefixCls}-disabled`]: isDisabled,
        [`${prefixCls}-in-range`]: comboRangeMode && this.isInRange(prevMonth),
        [`${prefixCls}-range-start`]: isStart,
        [`${prefixCls}-range-end`]: isEnd,
      });
      const text = prevMonth.localeData().monthsShort(prevMonth);

      const monthProps: any = {
        key: text,
        className,
        children: this.renderInner(text),
      };
      if (!isDisabled) {
        monthProps.onClick = this.handleCellClick.bind(this, currentMonth);
        monthProps.onMouseEnter = this.handleDateMouseEnter.bind(this, currentMonth);
        monthProps.onMouseLeave = onDateMouseLeave;
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
      this.changeCursorDate(date);
      this.changeViewMode(mode);
    } else {
      super.choose(date);
    }
  }
}
