import React, { ReactNode } from 'react';
import moment, { Moment, unitOfTime } from 'moment';
import classNames from 'classnames';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import autobind from '../_util/autobind';
import { TimeUnit, ViewMode } from './enum';
import DaysView, { alwaysValidDate } from './DaysView';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { getDateFormatByFieldType } from '../field/utils';

const TimeUnitQueue: unitOfTime.Base[] = [TimeUnit.hour, TimeUnit.minute, TimeUnit.second];

@observer
export default class TimesView extends DaysView {
  static displayName = 'TimesView';

  static type = FieldType.time;

  @observable currentUnit?: unitOfTime.Base;

  @autobind
  handleDateTimeSelect() {
    this.changeViewMode(ViewMode.dateTime);
  }

  handleKeyDownHome() {
    this.changeSelectedDate(this.getCloneDate().set(this.getCurrentUnit(), 0));
  }

  handleKeyDownEnd() {
    const unit = this.getCurrentUnit();
    const size = unit === TimeUnit.hour ? 24 : 60;
    this.changeSelectedDate(this.getCloneDate().set(unit, size - 1));
  }

  handleKeyDownLeft(e) {
    if (e.altKey) {
      if (this.props.mode !== ViewMode.time) {
        this.changeViewMode(ViewMode.dateTime);
      }
    } else {
      this.changeUnit(this.getPrevUnit());
    }
  }

  handleKeyDownRight(e) {
    if (!e.altKey) {
      this.changeUnit(this.getNextUnit());
    }
  }

  handleKeyDownUp() {
    this.changeSelectedDate(this.getCloneDate().subtract(1, this.getCurrentUnit()));
  }

  handleKeyDownDown() {
    this.changeSelectedDate(this.getCloneDate().add(1, this.getCurrentUnit()));
  }

  handleKeyDownPageUp() {
    this.changeSelectedDate(this.getCloneDate().set(this.getCurrentUnit(), 0));
  }

  handleKeyDownPageDown() {
    const unit = this.getCurrentUnit();
    const size = unit === TimeUnit.hour ? 24 : 60;
    this.changeSelectedDate(this.getCloneDate().set(unit, size - 1));
  }

  handleKeyDownEnter() {
    this.choose(this.props.date);
  }

  handleTimeCellClick(date: Moment, unit: unitOfTime.Base) {
    this.changeUnit(unit);
    this.changeSelectedDate(date);
  }

  @autobind
  async handleWheel(e) {
    e.preventDefault();
    if (e.deltaY > 0) {
      await this.changeSelectedDate(this.getCloneDate().add(1, this.getCurrentUnit()));
    } else if (e.deltaY < 0) {
      await this.changeSelectedDate(this.getCloneDate().subtract(1, this.getCurrentUnit()));
    }
  }

  renderHeader(): ReactNode {
    const {
      prefixCls,
      props: { date, mode },
    } = this;
    if (mode === ViewMode.time) {
      return (
        <div className={`${prefixCls}-header`}>
          <span className={`${prefixCls}-view-select`}>
            {date.format(getDateFormatByFieldType(TimesView.type))}
          </span>
        </div>
      );
    }
    return (
      <div className={`${prefixCls}-header`}>
        <a className={`${prefixCls}-view-select`} onClick={this.handleMonthSelect}>
          {date.localeData().monthsShort(date)}
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleDateTimeSelect}>
          {date.date()}
        </a>
        <a className={`${prefixCls}-view-select`} onClick={this.handleYearSelect}>
          {date.year()}
        </a>
      </div>
    );
  }

  renderFooter(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-footer`}>
        <a className={`${prefixCls}-footer-now-btn`} onClick={this.choose.bind(this, moment())}>
          {$l('DatePicker', 'now')}
        </a>
        <a
          className={`${prefixCls}-footer-view-select`}
          onClick={this.choose.bind(this, this.props.date)}
        >
          {$l('DatePicker', 'ok')}
        </a>
      </div>
    );
  }

  renderPanel() {
    const className = this.getPanelClass();
    return (
      <div
        className={`${className} ${this.prefixCls}-${this.getCurrentUnit()}`}
        onWheel={this.handleWheel}
      >
        <div className={`${className}-inner`}>{this.renderPanelBody()}</div>
      </div>
    );
  }

  renderPanelBody(): ReactNode {
    return [
      this.getTimeBar(TimeUnit.hour),
      this.getTimeBar(TimeUnit.minute),
      this.getTimeBar(TimeUnit.second),
      <div key="active" className={`${this.prefixCls}-time-focus-active`} />,
    ];
  }

  @autobind
  renderCell(props: object): ReactNode {
    return <li {...props} />;
  }

  getTimeBar(unit: unitOfTime.Base): ReactNode {
    const {
      prefixCls,
      props: { date, renderer = this.renderCell, isValidDate = alwaysValidDate },
    } = this;
    const size = unit === TimeUnit.hour ? 24 : 60;
    const selected = date.clone();
    const pre = date.clone().set(unit, 0);
    const last = pre.clone().add(size, unit);
    const items: ReactNode[] = [];
    while (pre.isBefore(last)) {
      const current = pre.clone();
      const isDisabled = !isValidDate(current, selected);
      const text = String(pre.get(unit));
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-selected`]: pre.isSame(selected, unit),
        [`${prefixCls}-disabled`]: isDisabled,
      });
      const props: any = {
        key: text,
        className,
        children: <div className={`${prefixCls}-cell-inner`}>{text}</div>,
      };
      if (!isDisabled) {
        props.onClick = this.handleTimeCellClick.bind(this, current, unit);
      }
      items.push(renderer(props, text, current, selected));
      pre.add(1, unit);
    }
    return (
      <div
        key={unit}
        className={`${prefixCls}-time-list`}
        onMouseEnter={this.changeUnit.bind(this, unit)}
      >
        <ul style={{ top: `${(-selected.get(unit) + 4.5) * 100}%` }}>{items}</ul>
        <div className={`${prefixCls}-time-focus`} />
      </div>
    );
  }

  getPanelClass(): string {
    return `${this.prefixCls}-time-panel`;
  }

  getCurrentUnit(): unitOfTime.Base {
    const { currentUnit = TimeUnit.hour } = this;
    return currentUnit;
  }

  getPrevUnit(): unitOfTime.Base {
    return TimeUnitQueue[TimeUnitQueue.indexOf(this.getCurrentUnit()) - 1];
  }

  getNextUnit(): unitOfTime.Base {
    return TimeUnitQueue[TimeUnitQueue.indexOf(this.getCurrentUnit()) + 1];
  }

  @action
  changeUnit(unit) {
    if (unit !== undefined && unit !== this.currentUnit) {
      this.currentUnit = unit;
    }
  }

  choose(date: Moment) {
    const { mode } = this.props;
    if (mode !== ViewMode.time) {
      this.changeSelectedDate(date);
      this.changeViewMode(mode);
    } else {
      super.choose(date);
    }
  }
}
