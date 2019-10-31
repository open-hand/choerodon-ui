import { createElement, CSSProperties, KeyboardEventHandler, ReactNode } from 'react';
import PropTypes from 'prop-types';
import moment, { isMoment, Moment, MomentInput } from 'moment';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
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
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { ValidatorProps } from '../validator/rules';

export type RenderFunction = (
  props: object,
  text: string,
  currentDate: Moment,
  selected: Moment,
) => ReactNode;

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
export default class DatePicker extends TriggerField<DatePickerProps>
  implements DatePickerKeyboardEvent {
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
  get value(): any | undefined {
    const { value } = this.observableProps;
    const { range } = this;
    if (isArrayLike(value)) {
      return value.map(item => {
        if (isArrayLike(item)) {
          return item.map(this.checkMoment, this);
        }
        return this.checkMoment(item);
      });
    }
    if (isArrayLike(range)) {
      if (isPlainObject(value)) {
        const [start, end] = range;
        return {
          [start]: this.checkMoment(value[start]),
          [end]: this.checkMoment(value[end]),
        };
      }
    }
    return this.checkMoment(value);
  }

  set value(value: any | undefined) {
    runInAction(() => {
      this.observableProps.value = value;
    });
  }

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('DatePicker', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
    };
  }

  @computed
  get editable(): boolean {
    return true;
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
    if (mode === ViewMode.decade || mode === undefined) {
      return ViewMode.date;
    }
    return mode;
  }

  getPopupContent() {
    const mode = this.getViewMode();
    return createElement(viewComponents[mode], {
      ref: node => (this.view = node),
      date: this.getSelectedDate(),
      mode: this.getDefaultViewMode(),
      renderer: this.getCellRenderer(mode),
      onSelect: this.handleSelect,
      onSelectedDateChange: this.handleSelectedDateChange,
      onViewModeChange: this.handelViewModeChange,
      isValidDate: this.isValidDate,
    } as DateViewProps);
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

  checkMoment(item) {
    if (!isNil(item) && !isMoment(item)) {
      warning(false, `DatePicker: The value of DatePicker is not moment.`);
      const format = this.getDateFormat();
      if (item instanceof Date) {
        item = moment(item).format(format);
      }
      return moment(item, format);
    }
    return item;
  }

  // processValue(value: any): ReactNode {
  //   return super.processValue(this.checkMoment(value));
  // }

  getSelectedDate(): Moment {
    const { range, multiple, rangeTarget, rangeValue } = this;
    const selectedDate =
      this.selectedDate ||
      (range && !multiple && rangeTarget !== undefined && rangeValue && rangeValue[rangeTarget]) ||
      (!multiple && this.getValue());
    if (isMoment(selectedDate) && selectedDate.isValid()) {
      return selectedDate.clone();
    }
    return this.getValidDate(moment().startOf('d'));
  }

  getLimit(minOrMax: 'min' | 'max') {
    const limit = this.getProp(minOrMax);
    if (limit !== undefined) {
      const { record } = this;
      if (record && isString(limit) && record.getField(limit)) {
        return record.get(limit);
      }
      return this.getLimitWithType(moment(limit), minOrMax);
    }
  }

  getLimitWithType(limit: Moment, minOrMax: 'min' | 'max') {
    if (minOrMax === 'min') {
      return limit.startOf('d');
    }
    return limit.endOf('d');
  }

  getPopupStyleFromAlign(): CSSProperties | undefined {
    return undefined;
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

  handlePopupAnimateAppear() {}

  @autobind
  handlePopupAnimateEnd(key, exists) {
    if (!exists && key === 'align') {
      runInAction(() => {
        this.selectedDate = undefined;
        this.mode = undefined;
      });
    }
  }

  @autobind
  handleSelect(date: Moment) {
    if (this.multiple && this.isSelected(date)) {
      this.unChoose(date);
    } else {
      this.choose(date);
    }
  }

  @autobind
  handleKeyDown(e) {
    if (!this.isDisabled() && !this.isReadOnly()) {
      const el = this.popup ? this.view || this : this;
      switch (e.keyCode) {
        case KeyCode.RIGHT:
          el.handleKeyDownRight(e);
          break;
        case KeyCode.LEFT:
          el.handleKeyDownLeft(e);
          break;
        case KeyCode.DOWN:
          el.handleKeyDownDown(e);
          break;
        case KeyCode.UP:
          el.handleKeyDownUp(e);
          break;
        case KeyCode.END:
          el.handleKeyDownEnd(e);
          break;
        case KeyCode.HOME:
          el.handleKeyDownHome(e);
          break;
        case KeyCode.PAGE_UP:
          el.handleKeyDownPageUp(e);
          break;
        case KeyCode.PAGE_DOWN:
          el.handleKeyDownPageDown(e);
          break;
        case KeyCode.ENTER:
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

  handleKeyDownHome(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().startOf('M'));
    }
  }

  handleKeyDownEnd(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().endOf('M'));
    }
  }

  handleKeyDownLeft(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().subtract(1, 'd'));
    }
  }

  handleKeyDownRight(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().add(1, 'd'));
    }
  }

  handleKeyDownUp(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().subtract(1, 'w'));
    }
  }

  handleKeyDownDown(e) {
    if (this.multiple) {
      this.expand();
    } else if (!this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().add(1, 'w'));
    }
  }

  handleKeyDownPageUp(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().subtract(1, e.altKey ? 'y' : 'M'));
    }
  }

  handleKeyDownPageDown(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getSelectedDate().add(1, e.altKey ? 'y' : 'M'));
    }
  }

  handleKeyDownEnter(_e) {
    if (!this.multiple && !this.editable) {
      this.choose(this.getSelectedDate());
    }
  }

  handleKeyDownEsc(e) {
    if (this.popup) {
      e.preventDefault();
      this.collapse();
    }
  }

  handleKeyDownTab() {
    // this.collapse();
  }

  handleKeyDownSpace(e) {
    e.preventDefault();
    if (!this.popup) {
      this.expand();
    }
  }

  handleEnterDown(e) {
    super.handleEnterDown(e);
    if (this.multiple && this.range) {
      this.beginRange();
    }
  }

  syncValueOnBlur(value) {
    if (value) {
      if (!this.range) {
        this.addValue(this.checkMoment(value));
      }
    } else if (!this.multiple) {
      this.setValue(this.emptyValue);
    }
  }

  getValueKey(v: any) {
    if (isArrayLike(v)) {
      return v.map(this.getValueKey, this).join(',');
    }
    if (isMoment(v)) {
      return v.format();
    }
    return v;
  }

  @action
  changeSelectedDate(selectedDate: Moment) {
    this.selectedDate = this.getValidDate(selectedDate);
  }

  isSelected(date: Moment) {
    return this.getValues().some(value => date.isSame(value));
  }

  unChoose(date: Moment) {
    this.removeValue(date, -1);
  }

  choose(date: Moment) {
    date = this.getValidDate(date);
    this.prepareSetValue(date);
    this.changeSelectedDate(date);
    if (this.range ? this.rangeTarget === 1 : !this.multiple) {
      this.collapse();
    }
    if (this.range && this.rangeTarget === 0 && this.popup) {
      this.setRangeTarget(1);
    }
  }

  @action
  setRangeTarget(target) {
    if (target !== undefined && target !== this.rangeTarget) {
      this.expand();
    }
    this.selectedDate = undefined;
    super.setRangeTarget(target);
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

  isLowerRange(m1: Moment, m2: Moment): boolean {
    return m1.isBefore(m2);
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
          start = start
            .startOf('y')
            .subtract(start.year() % 10, 'y')
            .startOf('d');
          end = end
            .endOf('y')
            .add(9 - (end.year() % 10), 'y')
            .endOf('d');
          break;
        case ViewMode.dateTime:
          start = start.startOf('d');
          end = end.endOf('d');
          break;
        default:
      }
      return date.isBetween(start, end, undefined, '[]');
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

  getValidatorProps(): ValidatorProps {
    const { min, max } = this;
    return {
      ...super.getValidatorProps(),
      min,
      max,
      format: this.getDateFormat(),
    };
  }
}
