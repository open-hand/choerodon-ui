import React, { createElement, CSSProperties, KeyboardEventHandler, ReactNode } from 'react';
import PropTypes from 'prop-types';
import moment, { isMoment, Moment, MomentInput, MomentParsingFlags } from 'moment';
import classNames from 'classnames';
import raf from 'raf';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import { TimeStep } from 'choerodon-ui/dataset/interface';
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
import isSame from '../_util/isSame';
import Field from '../data-set/Field';
import { RenderProps } from '../field/FormField';
import ObserverTextField from '../text-field/TextField';

export type RenderFunction = (
  props: object,
  text: string,
  currentDate: Moment,
  selected: Moment,
) => ReactNode;

export { TimeStep };

export type TimeZone = string | ((moment: Moment) => string);

const viewComponents: { [x: string]: typeof DaysView } = {
  [ViewMode.decade]: DecadeYearsView,
  [ViewMode.year]: YearsView,
  [ViewMode.month]: MonthsView,
  [ViewMode.date]: DaysView,
  [ViewMode.dateTime]: DateTimesView,
  [ViewMode.week]: WeeksView,
  [ViewMode.time]: TimesView,
};

const createDefaultTime = () => moment('00:00:00', 'HH:mm:ss');

export interface DatePickerProps extends TriggerFieldProps {
  /**
   * 显示模式date|dateTime|time|year|month|week
   */
  mode?: ViewMode;
  /**
   * 单元格渲染
   */
  cellRenderer?: (mode: ViewMode) => RenderFunction | undefined;
  filter?: (currentDate: Moment, selected: Moment, mode?: ViewMode) => boolean;
  min?: MomentInput | null;
  max?: MomentInput | null;
  step?: TimeStep;
  renderExtraFooter?: () => ReactNode;
  extraFooterPlacement?: 'top' | 'bottom';
  /**
   * 时区显示
   */
  timeZone?: TimeZone;
  /**
   * 编辑器在下拉框中显示
   */
  editorInPopup?: boolean;
  /**
   * 默认显示
   */
  defaultTime?: Moment | [Moment, Moment];
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
    /**
     * 时间步距
     */
    step: PropTypes.shape({
      hour: PropTypes.number,
      minute: PropTypes.number,
      second: PropTypes.number,
    }),
    /**
     * 时区显示
     */
    timeZone: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 编辑器在下拉框中显示
     */
    editorInPopup: PropTypes.bool,
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

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('DatePicker', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
    };
  }

  @computed
  get min(): Moment | undefined | null {
    return this.getLimit('min');
  }

  @computed
  get max(): Moment | undefined | null {
    return this.getLimit('max');
  }

  view: DatePickerKeyboardEvent | null;

  @observable selectedDate?: Moment;

  @observable mode?: ViewMode;

  popupRangeEditor?: HTMLInputElement | null;

  @autobind
  savePopupRangeEditor(node: HTMLInputElement | null) {
    this.popupRangeEditor = node;
    if (node && this.popup) {
      raf(() => {
        node.focus();
      });
    }
  }

  isEditable(): boolean {
    return super.isEditable() && !this.isEditableLike() && this.getViewMode() !== ViewMode.week;
  }

  isEditableLike(): boolean {
    return this.popup && this.observableProps.editorInPopup;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'mode',
      'filter',
      'cellRenderer',
      'maxLength',
      'minLength',
      'timeZone',
      'editorInPopup',
      'defaultTime',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    delete otherProps.maxLength;
    return otherProps;
  }

  getObservableProps(props, context): any {
    return {
      ...super.getObservableProps(props, context),
      editorInPopup: props.editorInPopup,
    };
  }

  @autobind
  defaultRenderer(props: RenderProps): ReactNode {
    const renderedText = super.defaultRenderer(props);
    const mode = this.getDefaultViewMode();
    const { value } = props;
    if (value && [ViewMode.time, ViewMode.dateTime].includes(mode)) {
      const { timeZone = this.getContextConfig('formatter').timeZone } = this.props;
      if (timeZone) {
        const renderedTimeZone = typeof timeZone === 'function' ? timeZone(value) : value.format(timeZone);
        if (isString(renderedTimeZone)) {
          return `${renderedText}${renderedTimeZone}`;
        }
        return [renderedText, renderedTimeZone];
      }
    }
    return renderedText;
  }

  getDefaultTime(): [Moment, Moment] {
    const { defaultTime = createDefaultTime() } = this.props;
    if (isArrayLike(defaultTime)) {
      return [defaultTime[0] || createDefaultTime(), defaultTime[1] || createDefaultTime()];
    }
    return [defaultTime, defaultTime];
  }

  getDefaultViewMode() {
    const { mode } = this.props;
    if (mode === ViewMode.decade || mode === undefined) {
      return ViewMode.date;
    }
    return mode;
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    return classNames(
      super.getPopupClassName(defaultClassName), {
        [`${this.prefixCls}-popup-${this.getViewMode()?.toLowerCase()}`]: this.getViewMode(),
      },
    );
  }

  getPopupEditor() {
    const { editorInPopup } = this.observableProps;
    if (editorInPopup) {
      const { prefixCls, range, text } = this;
      const className = `${prefixCls}-popup-editor`;
      const [startPlaceholder, endPlaceHolder = startPlaceholder] = this.getPlaceholders();
      if (range) {
        const { rangeTarget } = this;
        const [startValue = '', endValue = ''] = this.processRangeValue(this.rangeValue);
        const startText = this.getText(startValue) as string;
        const endText = this.getText(endValue) as string;
        return (
          <span key="popup-editor" className={classNames(className, `${prefixCls}-range-text`)}>
            <input
              className={`${prefixCls}-range-start`}
              onChange={this.handleChange}
              onFocus={this.handleRangeStart}
              value={rangeTarget === 0 && text !== undefined ? text : startText}
              placeholder={startPlaceholder}
              ref={rangeTarget === 0 ? this.savePopupRangeEditor : undefined}
            />
            <span className={`${prefixCls}-range-split`}>~</span>
            <input
              className={`${prefixCls}-range-end`}
              onChange={this.handleChange}
              onFocus={this.handleRangeEnd}
              value={rangeTarget === 1 && text !== undefined ? text : endText}
              placeholder={endPlaceHolder}
              ref={rangeTarget === 1 ? this.savePopupRangeEditor : undefined}
            />
          </span>
        );
      }
      return (
        <ObserverTextField
          key="popup-editor"
          value={this.getTextNode()}
          onInput={this.handleChange}
          border={false}
          className={className}
          placeholder={startPlaceholder}
        />
      );
    }
  }

  getPopupContent() {
    const mode = this.getViewMode();
    const date = this.getSelectedDate();
    return (
      <>
        {
          this.getPopupEditor()
        }
        {
          createElement(viewComponents[mode], {
            ref: node => (this.view = node),
            date,
            mode: this.getDefaultViewMode(),
            disabledNow: !this.isValidNowDate(date),
            renderer: this.getCellRenderer(mode),
            onSelect: this.handleSelect,
            onSelectedDateChange: this.handleSelectedDateChange,
            onViewModeChange: this.handelViewModeChange,
            isValidDate: this.isValidDate,
            format: this.getDateFormat(),
            step: this.getProp('step') || {},
            renderExtraFooter: this.getProp('renderExtraFooter'),
            extraFooterPlacement: this.getProp('extraFooterPlacement') || 'bottom',
          } as DateViewProps)
        }
      </>
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

  toMoment(item: Moment | Date | string | undefined, field: Field | undefined = this.field, noCheck = false): Moment | undefined {
    if (isNil(item)) {
      return undefined;
    }
    if (isMoment(item)) {
      return item;
    }
    warning(noCheck, `DatePicker: The value of DatePicker is not moment.`);
    const format = this.getDateFormat(field);
    if (item instanceof Date) {
      item = moment(item).format(format);
    }
    const { range, rangeTarget } = this;
    const date = moment(item, format);
    if (date.isValid()) {
      const { unusedTokens }: MomentParsingFlags = date.parsingFlags();
      if (unusedTokens.includes('HH') && unusedTokens.includes('mm') && unusedTokens.includes('ss')) {
        const defaultTime: Moment = this.getDefaultTime()[range && rangeTarget !== undefined ? rangeTarget : 0];
        date.hour(defaultTime.hour());
        date.minute(defaultTime.minute());
        date.second(defaultTime.second());
      }
    }
    return date;
  }

  checkMoment(item) {
    return this.toMoment(item);
  }

  @autobind
  compare(oldValue, newValue) {
    return isSame(this.momentToTimestamp(oldValue), this.momentToTimestamp(newValue));
  }

  setText(text?: string) {
    super.setText(text);
    if (text) {
      const date = this.toMoment(text);
      if (date && date.isValid()) {
        this.changeSelectedDate(date);
      }
    }
  }

  afterSetValue() {
    super.afterSetValue();
    this.setText(undefined);
  }

  momentToTimestamp(value) {
    if (isMoment(value)) {
      return moment(value).valueOf();
    }
    return value;
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
    return this.getValidDate(this.getDefaultTime()[range && rangeTarget !== undefined ? rangeTarget : 0]);
  }

  getLimit(minOrMax: 'min' | 'max'): Moment | undefined {
    const limit = this.getProp(minOrMax);
    if (!isNil(limit)) {
      const { record } = this;
      if (record && isString(limit)) {
        const field = record.dataSet.getField(limit);
        if (field) {
          const value = record.get(limit);
          if (value) {
            const momentValue = this.toMoment(value, field, true);
            if (momentValue) {
              return this.getLimitWithType(momentValue.clone(), minOrMax);
            }
          }
          return undefined;
        }
      }
      return this.getLimitWithType(moment(limit), minOrMax);
    }
  }

  getLimitWithType(limit: Moment, minOrMax: 'min' | 'max'): Moment {
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

  handlePopupAnimateAppear() {
    // noop
  }

  @autobind
  handlePopupAnimateEnd(key, exists) {
    if (key === 'align') {
      if (exists) {
        const { popupRangeEditor } = this;
        if (popupRangeEditor) {
          raf(() => {
            popupRangeEditor.focus();
          });
        }
      } else {
        runInAction(() => {
          this.selectedDate = undefined;
          this.mode = undefined;
        });
      }
    }
  }

  @autobind
  handleSelect(date: Moment, expand?: boolean) {
    if (this.multiple && this.isSelected(date)) {
      this.unChoose(date);
    } else {
      this.choose(date, expand);
    }
  }

  @autobind
  handleKeyDown(e) {
    if (!this.disabled && !this.readOnly) {
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
    if (!this.isEditable()) {
      e.preventDefault();
    }
    if (!this.popup) {
      this.expand();
    }
  }

  @action
  handleEnterDown(e) {
    super.handleEnterDown(e);
    if (this.multiple && this.range) {
      this.setRangeTarget(0);
      this.beginRange();
      this.expand();
    }
  }

  prepareSetValue(...value: any[]): void {
    super.prepareSetValue(...value.map(v => v === null ? null : this.checkMoment(v)));
  }

  syncValueOnBlur(value) {
    if (value) {
      this.prepareSetValue(value);
    } else if (!this.multiple) {
      this.prepareSetValue(this.emptyValue);
    }
  }

  @autobind
  getValueKey(v: any) {
    if (isArrayLike(v)) {
      return v.map(this.getValueKey, this).join(',');
    }
    if (isMoment(v)) {
      return v.format();
    }
    return v;
  }

  exchangeRangeValue(start: Moment, end: Moment) {
    const { defaultTime } = this.props;
    if (defaultTime) {
      const [startDefaultTime, endDefaultTime] = this.getDefaultTime();
      const startHour = start.hour();
      const startMinute = start.minute();
      const startSecond = start.second();
      const startDefaultHour = startDefaultTime.hour();
      const startDefaultMinute = startDefaultTime.minute();
      const startDefaultSecond = startDefaultTime.second();
      const endHour = end.hour();
      const endMinute = end.minute();
      const endSecond = end.second();
      const endDefaultHour = endDefaultTime.hour();
      const endDefaultMinute = endDefaultTime.minute();
      const endDefaultSecond = endDefaultTime.second();
      if (startHour === startDefaultHour && startMinute === startDefaultMinute && startSecond === startDefaultSecond) {
        end.hour(startHour);
        end.minute(startMinute);
        end.second(startSecond);
      }
      if (endHour === endDefaultHour && endMinute === endDefaultMinute && endSecond === endDefaultSecond) {
        start.hour(endHour);
        start.minute(endMinute);
        start.second(endSecond);
      }
    }
    super.exchangeRangeValue(start, end);
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

  /**
   *
   * @param date 返回的时间
   * @param expand 是否保持时间选择器的展开
   */
  choose(date: Moment, expand?: boolean) {
    date = this.getValidDate(date);
    this.prepareSetValue(date);
    this.changeSelectedDate(date);
    const { range, rangeTarget } = this;
    if (range ? rangeTarget === 1 : !this.multiple) {
      if (!expand) {
        this.collapse();
      }
    }
    if (range && rangeTarget === 0 && this.popup && !expand) {
      this.setRangeTarget(1);
    }
  }

  @action
  setRangeTarget(target) {
    if (this.isFocused && (target !== undefined && target !== this.rangeTarget)) {
      this.expand();
    }
    this.selectedDate = undefined;
    super.setRangeTarget(target);
  }

  getValidDate(date: Moment): Moment {
    const { min, max } = this;
    if (min && date.isSameOrBefore(min)) {
      date = min;
    } else if (max && date.isSameOrAfter(max)) {
      date = max;
    }
    return date;
  }

  isLowerRange(m1: any, m2: any): boolean {
    const moment1 = this.toMoment(m1);
    if (moment1) {
      return moment1.isBefore(this.toMoment(m2));
    }
    return false;
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
      return filter(currentDate, selected, this.getViewMode());
    }
    return isValid;
  }

  @autobind
  isValidNowDate(selected: Moment): boolean {
    const { filter } = this.props;
    const isValid = this.isUnderRange(moment());
    if (isValid && filter) {
      return filter(moment(), selected);
    }
    return isValid;
  }

  getValidatorProp(key: string) {
    if (['maxLength', 'minLength'].includes(key)) {
      return;
    }
    switch (key) {
      case 'min':
      case 'max':
        return this[key];
      case 'format':
        return this.getDateFormat();
      default:
        return super.getValidatorProp(key);
    }
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }
}
