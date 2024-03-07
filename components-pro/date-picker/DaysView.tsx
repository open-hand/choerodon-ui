import React, { MouseEventHandler, ReactNode, CSSProperties } from 'react';
import moment, { Moment } from 'moment';
import classNames from 'classnames';
import noop from 'lodash/noop';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import autobind from '../_util/autobind';
import Icon from '../icon';
import { DatePickerKeyboardEvent, RenderFunction, TimeStep } from './DatePicker';
import { ViewMode } from './enum';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { stopEvent } from '../_util/EventManager';

export function alwaysValidDate() {
  return true;
}

export interface DateViewProps extends ViewComponentProps {
  date: Moment;
  min?: Moment;
  max?: Moment;
  mode: ViewMode;
  format: string;
  step: TimeStep;
  renderer?: RenderFunction;
  isValidDate?: (currentDate: Moment, selected: Moment, mode?: ViewMode) => boolean;
  isExistValue?: boolean;
  onSelect?: (selectedDate: Moment, expand?: boolean) => void;
  onSelectedDateChange?: (selectedDate: Moment, mode?: ViewMode) => void;
  onCursorDateChange?: (cursorDate: Moment, selectedDate: Moment, mode?: ViewMode) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  renderExtraFooter?: () => ReactNode;
  extraFooterPlacement?: 'top' | 'bottom';
  disabledNow?: boolean;
  okButton?: boolean;
  onDateMouseEnter?: (date?: Moment) => void;
  onDateMouseLeave?: () => void;
  comboRangeMode?: boolean;
  dateRangeValue?: [Moment | undefined, Moment | undefined];
  rangeTarget?: 0 | 1;
  hoverValue?: Moment | undefined;
}

export default class DaysView<T extends DateViewProps> extends ViewComponent<T>
  implements DatePickerKeyboardEvent {
  static displayName = 'DaysView';

  static defaultProps = {
    suffixCls: 'calendar',
    extraFooterPlacement: 'bottom',
  };

  static type = FieldType.date;

  get comboRangeMode(): boolean | undefined {
    const { comboRangeMode } = this.props;
    return comboRangeMode;
  }

  get startDate(): Moment | undefined {
    const { dateRangeValue, rangeTarget, hoverValue } = this.props;
    if (rangeTarget === undefined || !dateRangeValue) return hoverValue;
    if (hoverValue) {
      const another = dateRangeValue[rangeTarget === 0 ? 1 : 0];
      return hoverValue.isBefore(another) ? hoverValue : another;
    }
    return dateRangeValue[0] || dateRangeValue[1];
  }

  get endDate(): Moment | undefined {
    const { dateRangeValue, rangeTarget, hoverValue } = this.props;
    if (rangeTarget === undefined || !dateRangeValue) return hoverValue;
    if (hoverValue) {
      const another = dateRangeValue[rangeTarget === 0 ? 1 : 0];
      return hoverValue.isAfter(another) ? hoverValue : another;
    }
    return dateRangeValue[1] || dateRangeValue[0];
  }

  getTargetDate(target?: 0 | 1): Moment {
    const { comboRangeMode } = this;
    const { date, dateRangeValue, rangeTarget } = this.props;
    if (!comboRangeMode || !dateRangeValue || rangeTarget === undefined || target === undefined) return date;

    if (dateRangeValue[0] && dateRangeValue[1] && dateRangeValue[0].isSame(dateRangeValue[1], 'M')) {
      return target === 1 ? date.clone().add(1, 'M') : date;
    }
    if (rangeTarget === 0) {
      if (!dateRangeValue[0] && dateRangeValue[1]) {
        return target === 0 ? date.clone().add(-1, 'M') : date;
      }
      return target === 1 ? date.clone().add(1, 'M') : date;
    }
    if (rangeTarget === 1) {
      if (!dateRangeValue[1]) {
        return target === 1 ? date.clone().add(1, 'M') : date;
      }
      return target === 0 ? date.clone().add(-1, 'M') : date;
    }
    return date;
  }

  getViewClassName(): string {
    return '';
  }

  renderSingle(target?: 0 | 1) {
    const {
      prefixCls,
      props: { className, extraFooterPlacement },
    } = this;
    const classString = classNames(`${prefixCls}-view`, className, this.getViewClassName());
    return (
      <div className={classString} key={target}>
        {this.renderHeader(target)}
        {this.renderBody(target)}
        {target !== 1 && extraFooterPlacement === 'top' && this.customFooter}
        {target !== 1 && this.renderFooter()}
        {target !== 1 && extraFooterPlacement === 'bottom' && this.customFooter}
      </div>
    );
  }

  render() {
    const {
      prefixCls,
      comboRangeMode,
    } = this;
    if (comboRangeMode) {
      return (
        <div className={`${prefixCls}-view-combo`}>
          {this.renderSingle(0)}
          {this.renderSingle(1)}
        </div>
      );
    }
    return this.renderSingle();
  }

  @autobind
  handlePrevYearClick() {
    this.changeCursorDate(this.getCloneDate().subtract(1, 'y'), ViewMode.year);
  }

  @autobind
  handlePrevMonthClick() {
    this.changeCursorDate(this.getCloneDate().subtract(1, 'M'), ViewMode.month);
  }

  @autobind
  handleMonthSelect() {
    this.changeViewMode(ViewMode.month);
  }

  @autobind
  handleYearSelect() {
    this.changeViewMode(ViewMode.year);
  }

  @autobind
  handleNextYearClick() {
    this.changeCursorDate(this.getCloneDate().add(1, 'y'), ViewMode.year);
  }

  @autobind
  handleNextMonthClick() {
    this.changeCursorDate(this.getCloneDate().add(1, 'M'), ViewMode.month);
  }

  handleKeyDownHome(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().startOf('M'));
  }

  handleKeyDownEnd(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().endOf('M'));
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    if (e.altKey) {
      this.changeViewMode(ViewMode.month);
    } else {
      this.changeCursorDate(this.getCloneDate().subtract(1, 'd'));
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    if (!e.altKey) {
      this.changeCursorDate(this.getCloneDate().add(1, 'd'));
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(1, 'w'));
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(1, 'w'));
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().subtract(1, e.altKey ? 'y' : 'M'));
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    if (this.comboRangeMode) return;
    this.changeCursorDate(this.getCloneDate().add(1, e.altKey ? 'y' : 'M'));
  }

  handleKeyDownEnter(e) {
    e.preventDefault();
    if (this.comboRangeMode) return;
    this.choose(this.props.date);
  }

  handleCellClick(date: Moment): void {
    this.choose(date);
  }

  choose(date: Moment, expand?: boolean) {
    const { onSelect = noop } = this.props;
    onSelect(date, expand);
  }

  changeSelectedDate(selectedDate: Moment, mode?: ViewMode) {
    const { onSelectedDateChange = noop } = this.props;
    onSelectedDateChange(selectedDate, mode);
  }

  changeCursorDate(cursor: Moment, mode?: ViewMode) {
    const { onCursorDateChange = noop, date } = this.props;
    onCursorDateChange(cursor, date, mode);
  }

  changeViewMode(mode: ViewMode) {
    const { onViewModeChange = noop } = this.props;
    onViewModeChange(mode);
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
        <a className={`${prefixCls}-prev-month`} onClick={this.handlePrevMonthClick}  style={endStyle}>
          <Icon type="navigate_before" />
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleMonthSelect}>
          {date.localeData().monthsShort(date)}
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {date.year()}
        </a>
        <a className={`${prefixCls}-next-year`} style={startStyle}>
          <Icon type="last_page" onClick={this.handleNextYearClick} />
        </a>
        <a className={`${prefixCls}-next-month`} onClick={this.handleNextMonthClick} style={startStyle}>
          <Icon type="navigate_next" />
        </a>
      </div>
    );
  }

  renderBody(target?: 0 | 1) {
    return <div className={`${this.prefixCls}-body`}>{this.renderPanel(target)}</div>;
  }

  renderPanel(target?: 0 | 1) {
    return (
      <table className={this.getPanelClass()} cellSpacing={0}>
        {this.renderPanelHead()}
        <tbody>{this.renderPanelBody(target)}</tbody>
      </table>
    );
  }

  renderPanelHead(): ReactNode {
    return (
      <thead>
        <tr>{this.getDaysOfWeek()}</tr>
      </thead>
    );
  }

  get customFooter() {
    const {
      prefixCls,
      props: { renderExtraFooter },
    } = this;
    return renderExtraFooter ? (
      <div className={`${prefixCls}-footer-extra`}>
        {renderExtraFooter()}
      </div>
    ) : null;
  }

  renderFooter(): ReactNode {
    const {
      prefixCls,
      props: { disabledNow, isExistValue },
    } = this;
    const footerProps = {
      className: classNames({
        [`${prefixCls}-now-disabled`]: disabledNow,
        [`${prefixCls}-now-selected`]: isExistValue,
      }),
      onClick: !disabledNow ? this.choose.bind(this, moment(), false) : noop,
    };
    return (
      <div className={`${prefixCls}-footer`}>
        <a {...footerProps}>{$l('DatePicker', 'today')}</a>
      </div>
    );
  }

  @autobind
  renderCell(props: object): ReactNode {
    return <td {...props} />;
  }

  renderInner(text) {
    const { prefixCls } = this;
    return <div className={`${prefixCls}-cell-inner`}>{text}</div>;
  }

  getFirstDay(date) {
    const firstDay = date.clone().subtract(1, 'M');
    return firstDay.date(firstDay.daysInMonth()).startOf('w');
  }

  handleDateMouseEnter = (currentDate?: Moment): MouseEventHandler => {
    const { onDateMouseEnter = noop } = this.props;
    return onDateMouseEnter(currentDate);
  };

  isInRange = (currentDate?: Moment): boolean => {
    const { startDate, endDate } = this;
    return !!(startDate && endDate && currentDate && currentDate.isBetween(startDate, endDate));
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
    const prevMonth = this.getFirstDay(date);
    const currentYear = date.year();
    const currentMonth = date.month();
    const lastDay = prevMonth.clone().add(42, 'd');
    const rows: ReactNode[] = [];
    let cells: ReactNode[] = [];
    const today = moment();
    while (prevMonth.isBefore(lastDay)) {
      const currentDate = prevMonth.clone();
      const isDisabled = !isValidDate(currentDate, selected);
      const isOld = prevMonth.year() < currentYear ||
      (prevMonth.year() === currentYear && prevMonth.month() < currentMonth);
      const isNew = prevMonth.year() > currentYear ||
      (prevMonth.year() === currentYear && prevMonth.month() > currentMonth);
      const isStart = comboRangeMode && !isOld && !isNew && startDate && prevMonth.isSame(startDate, 'd');
      const isEnd = comboRangeMode && !isOld && !isNew && endDate && prevMonth.isSame(endDate, 'd');
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-old`]: isOld,
        [`${prefixCls}-new`]: isNew,
        [`${prefixCls}-selected`]: (!comboRangeMode && prevMonth.isSame(selected, 'd')) ||
        (comboRangeMode && (isStart || isEnd)),
        [`${prefixCls}-today`]: prevMonth.isSame(today, 'd'),
        [`${prefixCls}-disabled`]: isDisabled,
        [`${prefixCls}-in-range`]: comboRangeMode && !isOld && !isNew && this.isInRange(prevMonth),
        [`${prefixCls}-range-start`]: isStart,
        [`${prefixCls}-range-end`]: isEnd,
      });
      const text = String(currentDate.date());
      const dayProps: any = {
        key: prevMonth.format('M_D'),
        className,
        children: this.renderInner(text),
      };

      if (!isDisabled) {
        dayProps.onClick = this.handleCellClick.bind(this, currentDate);
        dayProps.onMouseEnter = this.handleDateMouseEnter.bind(this, currentDate);
        dayProps.onMouseLeave = onDateMouseLeave;
      }

      cells.push(renderer(dayProps, text, currentDate, selected));

      if (cells.length === 7) {
        rows.push(<tr key={prevMonth.format('M_D')}>{cells}</tr>);
        cells = [];
      }

      prevMonth.add(1, 'd');
    }

    return rows;
  }

  getPanelClass(): string {
    return `${this.prefixCls}-day-panel`;
  }

  getDaysOfWeek(): ReactNode[] {
    const locale = this.props.date.localeData();
    const days = locale.weekdaysMin();
    const first = locale.firstDayOfWeek();
    const dow: ReactNode[] = [];
    let i = 0;
    days.forEach(day => {
      dow[(7 + i++ - first) % 7] = (
        <th key={day} title={day}>
          {day}
        </th>
      );
    });

    return dow;
  }

  getCloneDate(): Moment {
    return this.props.date.clone();
  }
}
