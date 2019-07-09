import React, { createElement, CSSProperties, KeyboardEventHandler, ReactNode } from 'react';
import PropTypes from 'prop-types';
import moment, { isMoment, Moment, MomentInput } from 'moment';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import format from 'string-template';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import noop from 'lodash/noop';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import DaysView, { DateViewProps } from './DaysView';
import DateTimesView from './DateTimesView';
import WeeksView from './WeeksView';
import TimesView from './TimesView';
import MonthsView from './MonthsView';
import YearsView from './YearsView';
import DecadeYearsView from './DecadeYearsView';
import { ValidationMessages } from '../validator/Validator';
import autobind from '../_util/autobind';
import { ViewMode } from './enum';
import { stopEvent } from '../_util/EventManager';
import warning from 'choerodon-ui/lib/_util/warning';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';

export type RenderFunction = (props: object, text: string, currentDate: Moment, selected: Moment) => ReactNode;

const viewComponents: { [x: string]: typeof DaysView } = {
  [ViewMode.decade]: DecadeYearsView,
  [ViewMode.year]: YearsView,
  [ViewMode.month]: MonthsView,
  [ViewMode.date]: DaysView,
  [ViewMode.dateTime]: DateTimesView,
  [ViewMode.week]: WeeksView,
  [ViewMode.time]: TimesView,
};

export interface DatePickerProps extends TriggerFieldProps {
  /**
   * 日期格式，如 `YYYY-MM-DD HH:mm:ss`
   */
  format?: string;
  /**
   * 显示模式date|dateTime|time|year|month|week
   */
  mode?: ViewMode;
  /**
   * 单元格渲染
   */
  cellRenderer?: (mode: ViewMode) => RenderFunction | undefined;
  filter?: (currentDate: Moment, selected: Moment) => boolean;
  min?: MomentInput;
  max?: MomentInput;
}

export interface DatePickerKeyboardEvent {
  handleKeyDownRight: KeyboardEventHandler<any>;
  handleKeyDownLeft: KeyboardEventHandler<any>;
  handleKeyDownDown: KeyboardEventHandler<any>;
  handleKeyDownUp: KeyboardEventHandler<any>;
  handleKeyDownEnd: KeyboardEventHandler<any>;
  handleKeyDownHome: KeyboardEventHandler<any>;
  handleKeyDownPageUp: KeyboardEventHandler<any>;
  handleKeyDownPageDown: KeyboardEventHandler<any>;
  handleKeyDownEnter: KeyboardEventHandler<any>;
}

@observer
export default class DatePicker extends TriggerField<DatePickerProps> implements DatePickerKeyboardEvent {
  static displayName = 'DatePicker';

  static propTypes = {
    /**
     * 日期格式，如 `YYYY-MM-DD HH:mm:ss`
     */
    format: PropTypes.string,
    /**
     * 显示模式date|dateTime|time|year|month|week
     */
    mode: PropTypes.string,
    /**
     * 单元格渲染
     */
    cellRenderer: PropTypes.func,
    /**
     * 日期过滤
     */
    filter: PropTypes.func,
    /**
     * 最小日期
     */
    min: PropTypes.any,
    /**
     * 最大日期
     */
    max: PropTypes.any,
    ...TriggerField.propTypes,
  };

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'calendar-picker',
    mode: ViewMode.date,
  };

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    const label = this.getProp('label');
    return {
      valueMissing: format($l('DatePicker', label ? 'value_missing_with_label' : 'value_missing'), { label }),
    };
  }

  @computed
  get editable(): boolean {
    return false;
  }

  get min(): Moment | undefined {
    return this.getLimit('min');
  }

  get max(): Moment | undefined {
    return this.getLimit('max');
  }

  view: DatePickerKeyboardEvent | null;

  @observable selectedDate?: Moment;

  @observable mode?: ViewMode;

  getOtherProps() {
    return omit(super.getOtherProps(), ['mode', 'filter', 'cellRenderer']);
  }

  getDefaultViewMode() {
    const { mode } = this.props;
    if (mode === ViewMode.decade || mode === void 0) {
      return ViewMode.date;
    }
    return mode;
  }

  getEditor(): ReactNode {
    return (
      <input
        {...this.getOtherProps()}
        placeholder={this.hasFloatLabel ? null : this.getPlaceholder()}
        value={this.getText() || ''}
        readOnly={!this.editable}
      />
    );
  }

  getPopupContent() {
    const mode = this.getViewMode();
    return createElement(
      viewComponents[mode],
      {
        ref: (node) => this.view = node,
        date: this.getSelectedDate(),
        mode: this.getDefaultViewMode(),
        renderer: this.getCellRenderer(mode),
        onSelect: this.handleSelect,
        onSelectedDateChange: this.handleSelectedDateChange,
        onViewModeChange: this.handelViewModeChange,
        isValidDate: this.isValidDate,
      } as DateViewProps,
    );
  }

  getCellRenderer(mode: ViewMode): RenderFunction | undefined {
    const { cellRenderer = noop } = this.props;
    return cellRenderer(mode);
  }

  getTriggerIconFont() {
    return 'date_range';
  }

  getFieldType(): FieldType {
    return viewComponents[this.getDefaultViewMode()].type;
  }

  getViewMode(): ViewMode {
    const { mode = this.getDefaultViewMode() } = this;
    return mode;
  }

  getValue(): any {
    const value = super.getValue();
    if (value) {
      if (!isMoment(value)) {
        const fieldMsg = this.record ? ` Please check the field<${this.props.name}> of DataSet.` : '';
        warning(false, `DatePicker: The value of DatePicker is not moment.${fieldMsg}`);
        return moment(value, this.getDateFormat());
      }
    }
    return value;
  }

  getSelectedDate(): Moment {
    const { selectedDate = this.getValue() || this.getValidDate(moment().startOf('d')) } = this;
    return selectedDate.clone();
  }

  getLimit(type: string) {
    const limit = this.getProp(type);
    if (limit !== void 0) {
      const { record } = this;
      if (record && isString(limit) && record.getField(limit)) {
        return record.get(limit);
      }
      return moment(limit);
    }
  }

  getPopupStyleFromAlign(): CSSProperties | undefined {
    return;
  }

  @autobind
  handleSelectedDateChange(selectedDate: Moment, mode?: ViewMode) {
    if (this.isUnderRange(selectedDate, mode)) {
      this.changeSelectedDate(selectedDate);
    }
  }

  @autobind
  handelViewModeChange(mode: ViewMode) {
    runInAction(() => {
      this.mode = mode;
    });
  }

  handlePopupAnimateAppear() {
  }

  @autobind
  handlePopupAnimateEnd(key, exists) {
    if (!exists && key === 'align') {
      runInAction(() => {
        this.selectedDate = void 0;
        this.mode = void 0;
      });
    }
  }

  @autobind
  handleSelect(date: Moment) {
    this.choose(date);
  }

  @autobind
  handleKeyDown(e) {
    if (!this.isDisabled() && !this.isReadOnly()) {
      const el = this.popup ? this.view || this : this;
      switch (e.keyCode) {
        case KeyCode.RIGHT:
          stopEvent(e);
          el.handleKeyDownRight(e);
          break;
        case KeyCode.LEFT:
          stopEvent(e);
          el.handleKeyDownLeft(e);
          break;
        case KeyCode.DOWN:
          stopEvent(e);
          el.handleKeyDownDown(e);
          break;
        case KeyCode.UP:
          stopEvent(e);
          el.handleKeyDownUp(e);
          break;
        case KeyCode.END:
          stopEvent(e);
          el.handleKeyDownEnd(e);
          break;
        case KeyCode.HOME:
          stopEvent(e);
          el.handleKeyDownHome(e);
          break;
        case KeyCode.PAGE_UP:
          stopEvent(e);
          el.handleKeyDownPageUp(e);
          break;
        case KeyCode.PAGE_DOWN:
          stopEvent(e);
          el.handleKeyDownPageDown(e);
          break;
        case KeyCode.ENTER:
          if (this.popup) {
            e.preventDefault();
          }
          el.handleKeyDownEnter(e);
          break;
        case KeyCode.TAB:
          this.handleKeyDownTab();
          break;
        case KeyCode.ESC:
          this.handleKeyDownEsc(e);
          break;
        case KeyCode.SPACE:
          this.handleKeyDownSpace(e);
          break;
        default:
      }
    }
    super.handleKeyDown(e);
  }

  handleKeyDownHome() {
    this.choose(this.getSelectedDate().startOf('M'));
  }

  handleKeyDownEnd() {
    this.choose(this.getSelectedDate().endOf('M'));
  }

  handleKeyDownLeft() {
    this.choose(this.getSelectedDate().subtract(1, 'd'));
  }

  handleKeyDownRight() {
    this.choose(this.getSelectedDate().add(1, 'd'));
  }

  handleKeyDownUp() {
    this.choose(this.getSelectedDate().subtract(1, 'w'));
  }

  handleKeyDownDown() {
    this.choose(this.getSelectedDate().add(1, 'w'));
  }

  handleKeyDownPageUp(e) {
    this.choose(this.getSelectedDate().subtract(1, e.altKey ? 'y' : 'M'));
  }

  handleKeyDownPageDown(e) {
    this.choose(this.getSelectedDate().add(1, e.altKey ? 'y' : 'M'));
  }

  handleKeyDownEnter() {
    this.choose(this.getSelectedDate());
  }

  handleKeyDownEsc(e) {
    if (this.popup) {
      e.preventDefault();
      this.collapse();
    }
  }

  handleKeyDownTab() {
    this.collapse();
  }

  handleKeyDownSpace(e) {
    e.preventDefault();
    if (!this.popup) {
      this.expand();
    }
  }

  @action
  changeSelectedDate(selectedDate: Moment) {
    this.selectedDate = this.getValidDate(selectedDate);
  }

  choose(date: Moment) {
    date = this.getValidDate(date);
    this.setValue(date);
    this.changeSelectedDate(date);
    this.collapse();
  }

  getValidDate(date: Moment): Moment {
    const { min, max } = this;
    if (min && date.isBefore(min)) {
      date = min;
    } else if (max && date.isAfter(max)) {
      date = max;
    }
    return date;
  }

  @autobind
  isUnderRange(date: Moment, mode?: ViewMode): boolean {
    const { min, max } = this;
    if (min || max) {
      let start = (min || date).clone();
      let end = (max || date).clone();
      switch (mode || this.getViewMode()) {
        case ViewMode.month:
          start = start.startOf('M');
          end = end.endOf('M');
          break;
        case ViewMode.year:
          start = start.startOf('y');
          end = end.endOf('y');
          break;
        case ViewMode.decade:
          start = start.startOf('y').subtract(start.year() % 10, 'y');
          end = end.endOf('y').add(9 - end.year() % 10, 'y');
        case ViewMode.dateTime:
          start = start.startOf('d');
          end = end.endOf('d');
        default:
      }
      return date.isBetween(start, end, void 0, '[]');
    }
    return true;
  }

  @autobind
  isValidDate(currentDate: Moment, selected: Moment): boolean {
    const { filter } = this.props;
    const isValid = this.isUnderRange(currentDate);
    if (isValid && filter) {
      return filter(currentDate, selected);
    }
    return isValid;
  }
}
