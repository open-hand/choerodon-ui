import React, { CSSProperties, ReactNode } from 'react';
import moment, { Moment } from 'moment';
import classNames from 'classnames';
import throttle from 'lodash/throttle';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import autobind from '../_util/autobind';
import { TimeUnit, ViewMode } from './enum';
import DaysView, { alwaysValidDate, DateViewProps } from './DaysView';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { preventDefault, stopEvent } from '../_util/EventManager';

const stepMapping = {
  [TimeUnit.hour]: 'hour',
  [TimeUnit.minute]: 'minute',
  [TimeUnit.second]: 'second',
};

export interface TimesViewProps extends DateViewProps {
  /**
   * 是否是dateTime是使用，内部使用
   */
  datetimeSide?: boolean;
}

@observer
export default class TimesView<T extends TimesViewProps> extends DaysView<T> {
  static displayName = 'TimesView';

  static defaultProps = {
    datetimeSide: false,
    ...DaysView.defaultProps,
  };

  static type = FieldType.time;

  @observable currentUnit?: TimeUnit;

  panel: HTMLDivElement | null;

  // 触屏滑动时的起始位置
  startY = 0;

  getViewClassName(): string {
    const { prefixCls } = this;
    return `${prefixCls}-time`;
  }

  get comboRangeMode(): boolean | undefined {
    return false;
  }

  @computed
  get showHour(): boolean {
    const { format } = this.observableProps;
    return format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1;
  }

  @computed
  get showMinute(): boolean {
    const { format } = this.observableProps;
    return format.indexOf('m') > -1;
  }

  @computed
  get showSecond(): boolean {
    const { format } = this.observableProps;
    return format.indexOf('s') > -1;
  }

  @computed
  get use12Hours(): boolean {
    const { format } = this.observableProps;
    return format.indexOf('h') > -1 || format.indexOf('a') > -1 || format.indexOf('A') > -1;
  }

  @computed
  get timeUnitQueue(): TimeUnit[] {
    const { showHour, showMinute, showSecond, use12Hours } = this;
    const queue: TimeUnit[] = [];
    if (showHour) {
      queue.push(TimeUnit.hour);
    }
    if (showMinute) {
      queue.push(TimeUnit.minute);
    }
    if (showSecond) {
      queue.push(TimeUnit.second);
    }
    if (use12Hours) {
      queue.push(TimeUnit.a);
    }
    return queue;
  }

  @computed
  get barStyle(): CSSProperties {
    return {
      width: `${100 / this.timeUnitQueue.length}%`,
    };
  }

  @computed
  get activeStyle(): CSSProperties {
    const { timeUnitQueue } = this;
    const width = 100 / timeUnitQueue.length;
    return {
      width: `${width}%`,
      left: `${timeUnitQueue.indexOf(this.getCurrentUnit()) * width}%`,
    };
  }

  throttleHandleWheel = throttle(this.handleWheel, 80);

  handleTouchStart = (e) => {
    this.startY = e.touches[0].clientY;
    this.panel?.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  handleTouchMove = (e) => {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const deltaY = this.startY - currentY;
    this.startY = currentY;
    e.deltaY = deltaY;
    this.throttleHandleWheel(e);
  }

  handleTouchEnd = () => {
    this.panel?.removeEventListener('touchmove', this.handleTouchMove);
  }

  @autobind
  savePanel(node) {
    this.panel = node;
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      format: props.format,
    };
  }

  componentDidMount(): void {
    super.componentDidMount();
    if (this.panel) {
      // 兼容Firefox wheel为通用事件
      this.panel.addEventListener('wheel', this.throttleHandleWheel, { passive: false });
      this.panel.addEventListener('touchstart', this.handleTouchStart);
      this.panel.addEventListener('touchend', this.handleTouchEnd);
    }
  }

  componentWillUnmount(): void {
    if (this.panel) {
      this.panel.removeEventListener('wheel', this.throttleHandleWheel);
      this.panel.removeEventListener('touchstart', this.handleTouchStart);
      this.panel.removeEventListener('touchend', this.handleTouchEnd);
    }
  }

  @autobind
  handleDateTimeSelect() {
    this.changeViewMode(ViewMode.dateTime);
  }

  handleKeyDownHome(e) {
    this.handleKeyDownPageUp(e);
  }

  handleKeyDownEnd(e) {
    this.handleKeyDownPageDown(e);
  }

  handleKeyDownLeft(e) {
    stopEvent(e);
    if (e.altKey) {
      if (this.props.mode !== ViewMode.time) {
        this.changeViewMode(ViewMode.dateTime);
      }
    } else {
      this.changeUnit(this.getPrevUnit());
    }
  }

  handleKeyDownRight(e) {
    stopEvent(e);
    if (!e.altKey) {
      this.changeUnit(this.getNextUnit());
    }
  }

  handleKeyDownUp(e) {
    stopEvent(e);
    const unit = this.getCurrentUnit();
    const { disabledTimeLoopRoll } = this.props;
    let updateDate;
    if (unit === TimeUnit.a) {
      updateDate = this.getCloneDate().subtract(12, TimeUnit.hour);
    } else {
      const { step } = this.props;
      const unitStep = step[stepMapping[unit]] || 1;
      const date = this.getCloneDate();
      const parentUnit = unit === TimeUnit.second ? TimeUnit.minute : unit === TimeUnit.minute ? TimeUnit.hour : null;
      if (parentUnit) {
        const parentStep = step[stepMapping[parentUnit]];
        if (parentStep) {
          const preValue = date.get(parentUnit);
          date.subtract(unitStep, unit);
          if (preValue !== date.get(parentUnit)) {
            date.subtract(parentStep - 1, parentUnit);
          }
          updateDate = date;
        }
      }
      updateDate = updateDate ?? date.subtract(unitStep, unit);
    }
    const startOfDay = this.getCloneDate().startOf('day');
    if (disabledTimeLoopRoll && updateDate.isBefore(startOfDay)) {
      updateDate = startOfDay.millisecond(updateDate.millisecond());
    }
    this.changeCursorDate(updateDate, ViewMode.time);
  }

  handleKeyDownDown(e) {
    stopEvent(e);
    const unit = this.getCurrentUnit();
    const { disabledTimeLoopRoll } = this.props;
    let updateDate;
    if (unit === TimeUnit.a) {
      updateDate = this.getCloneDate().add(12, TimeUnit.hour);
    } else {
      const { step } = this.props;
      const unitStep = step[stepMapping[unit]] || 1;
      const date = this.getCloneDate();
      const parentUnit = unit === TimeUnit.second ? TimeUnit.minute : unit === TimeUnit.minute ? TimeUnit.hour : null;
      if (parentUnit) {
        const parentStep = step[stepMapping[parentUnit]];
        if (parentStep) {
          const preValue = date.get(parentUnit);
          date.add(unitStep, unit);
          if (preValue !== date.get(parentUnit)) {
            date.add(parentStep - 1, parentUnit);
          }
          updateDate = date;
        }
      }
      updateDate = updateDate ?? date.add(unitStep, unit);
    }
    const endOfDay = this.getCloneDate().endOf('day');
    if (disabledTimeLoopRoll && updateDate.isAfter(endOfDay)) {
      updateDate = endOfDay.millisecond(updateDate.millisecond());
    }
    this.changeCursorDate(updateDate, ViewMode.time);
  }

  handleKeyDownPageUp(e) {
    stopEvent(e);
    const unit = this.getCurrentUnit();
    if (unit === TimeUnit.a) {
      this.changeCursorDate(this.getCloneDate().set(TimeUnit.hour, 0));
    } else {
      this.changeCursorDate(this.getCloneDate().set(unit, 0), ViewMode.time);
    }
  }

  handleKeyDownPageDown(e) {
    stopEvent(e);
    const unit = this.getCurrentUnit();
    if (unit === TimeUnit.a) {
      this.changeCursorDate(this.getCloneDate().set(TimeUnit.hour, 12));
    } else {
      const { step } = this.props;
      const unitStep = step[stepMapping[unit]] || 1;
      const size = unit === TimeUnit.hour ? this.use12Hours ? 12 : 24 : 60;
      this.changeCursorDate(this.getCloneDate().set(unit, size - unitStep), ViewMode.time);
    }
  }

  handleTimeCellClick(date: Moment, unit: TimeUnit) {
    this.changeUnit(unit);
    this.changeSelectedDate(date);
  }

  @autobind
  handleWheel(e) {
    e.preventDefault();
    if (e.deltaY > 1) {
      this.handleKeyDownDown(e);
    } else if (e.deltaY < -1) {
      this.handleKeyDownUp(e);
    }
  }

  handleMouseEnterPanel() {
    // 控件滚动时阻止页面发生滚动
    window.addEventListener('wheel', preventDefault, { passive: false });
  }

  handleMouseLeavePanel() {
    // 鼠标离开控件清除监听
    window.removeEventListener('wheel', preventDefault);
  }

  renderHeader(): ReactNode {
    const {
      prefixCls,
      props: { date, mode },
      observableProps: { format },
    } = this;
    if (mode === ViewMode.time) {
      return (
        <div className={`${prefixCls}-header`}>
          <span className={`${prefixCls}-view-select`}>
            {date.format(format)}
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
    if (this.props.datetimeSide) {
      return;
    }
    const { prefixCls, props: { disabledNow, okButton } } = this;
    const footerProps = {
      className: classNames(`${prefixCls}-footer-now-btn`, {
        [`${prefixCls}-now-disabled`]: disabledNow,
      }),
      onClick: !disabledNow ? this.choose.bind(this, moment(), false) : noop,
      hidden: this.props.datetimeSide,
    };

    return (
      <div className={`${prefixCls}-footer`}>
        <a {...footerProps}>
          {$l('DatePicker', 'now')}
        </a>
        {
          okButton && (
            <a
              className={`${prefixCls}-footer-view-select`}
              onClick={this.choose.bind(this, this.props.date, false)}
            >
              {$l('DatePicker', 'ok')}
            </a>
          )
        }
      </div>
    );
  }

  renderPanel() {
    const className = this.getPanelClass();
    return (
      <div
        ref={this.savePanel}
        className={className}
        onMouseEnter={this.handleMouseEnterPanel}
        onMouseLeave={this.handleMouseLeavePanel}
      >
        <div className={`${className}-inner`}>{this.renderPanelBody()}</div>
      </div>
    );
  }

  renderPanelBody(): ReactNode {
    const { showHour, showMinute, showSecond, use12Hours, activeStyle } = this;
    return [
      showHour && this.getTimeBar(TimeUnit.hour),
      showMinute && this.getTimeBar(TimeUnit.minute),
      showSecond && this.getTimeBar(TimeUnit.second),
      use12Hours && this.getTimeBar(TimeUnit.a),
      <div key="active" style={activeStyle} className={`${this.prefixCls}-time-focus-active`} />,
    ];
  }

  @autobind
  renderCell(props: object): ReactNode {
    return <li {...props} />;
  }

  getTimeBar(unit: TimeUnit): ReactNode {
    const {
      prefixCls,
      use12Hours,
      props: { date, renderer = this.renderCell, isValidDate = alwaysValidDate, step, onDateMouseLeave },
      observableProps: { format },
    } = this;
    const isUpperCase = format.indexOf('A') > -1;
    const items: ReactNode[] = [];
    const selected = date.clone();
    const finalUnit = unit === TimeUnit.a ? TimeUnit.hour : unit;
    const selectedValue = selected.get(finalUnit);
    const size = unit === TimeUnit.a ? 13 : unit === TimeUnit.hour ? use12Hours ? 12 : 24 : 60;
    const begin = unit === TimeUnit.a ? selectedValue % 12 : unit === TimeUnit.hour && use12Hours && selectedValue > 11 ? 12 : 0;
    const pre = date.clone().set(finalUnit, begin);
    const last = pre.clone().add(size, finalUnit);
    while (pre.isBefore(last)) {
      const current = pre.clone();
      const isDisabled = !isValidDate(current, selected, ViewMode.time);
      const text = unit === TimeUnit.a ?
        current.format(isUpperCase ? 'A' : 'a') :
        String(pre.get(unit) - (use12Hours && finalUnit === TimeUnit.hour && pre.get(unit) > 11 ? 12 : 0) || (use12Hours && finalUnit === TimeUnit.hour ? 12 : 0));
      const className = classNames(`${prefixCls}-cell`, {
        [`${prefixCls}-selected`]: unit === TimeUnit.a ? current.get(TimeUnit.hour) === selectedValue : current.isSame(selected, finalUnit),
        [`${prefixCls}-disabled`]: isDisabled,
      });
      const props: any = {
        key: text,
        className,
        children: <div className={`${prefixCls}-cell-inner`}>{text}</div>,
      };
      if (!isDisabled) {
        props.onClick = this.handleTimeCellClick.bind(this, current, unit);
        props.onTouchStart = this.changeUnit.bind(this, unit);
        props.onMouseEnter = this.handleDateMouseEnter.bind(this, current);
        props.onMouseLeave = onDateMouseLeave;
      }
      items.push(renderer(props, text, current, selected));
      pre.add(unit === TimeUnit.a ? 12 : (step[stepMapping[unit]] || 1), finalUnit);
    }
    const top = unit === TimeUnit.a ?
      -Math.floor(selectedValue / 12) :
      (unit === TimeUnit.hour && use12Hours ?
        -selectedValue % 12 :
        -selectedValue) / (step[stepMapping[unit]] || 1);
    return (
      <div
        key={unit}
        className={`${prefixCls}-time-list`}
        onMouseEnter={this.changeUnit.bind(this, unit)}
        style={this.barStyle}
      >
        <ul style={{ top: `${(top + 3.5) * 100}%` }}>{items}</ul>
        <div className={`${prefixCls}-time-focus`} />
      </div>
    );
  }

  getPanelClass(): string {
    return `${this.prefixCls}-time-panel`;
  }

  getCurrentUnit(): TimeUnit {
    const { currentUnit } = this;
    return currentUnit || this.timeUnitQueue[0];
  }

  getPrevUnit(): TimeUnit {
    const { timeUnitQueue } = this;
    return timeUnitQueue[timeUnitQueue.indexOf(this.getCurrentUnit()) - 1];
  }

  getNextUnit(): TimeUnit {
    const { timeUnitQueue } = this;
    return timeUnitQueue[timeUnitQueue.indexOf(this.getCurrentUnit()) + 1];
  }

  @action
  changeUnit(unit?: TimeUnit) {
    if (unit !== undefined && unit !== this.currentUnit) {
      this.currentUnit = unit;
    }
  }

  choose(date: Moment, expand?: boolean) {
    const { mode } = this.props;
    super.choose(date, expand);
    if (mode !== ViewMode.time) {
      this.changeCursorDate(date);
      this.changeViewMode(mode);
    }
  }
}
