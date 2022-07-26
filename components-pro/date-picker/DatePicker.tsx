import React, { createElement, CSSProperties, KeyboardEventHandler, ReactNode } from 'react';
import moment, { isMoment, Moment, MomentInput, MomentParsingFlags } from 'moment';
import classNames from 'classnames';
import raf from 'raf';
import defaultTo from 'lodash/defaultTo';
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
import measureTextWidth from '../_util/measureTextWidth';
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

function createDefaultTime() {
  return moment('00:00:00', 'HH:mm:ss');
}

function getInRangeDefaultTime(defaultTime = createDefaultTime(), min?: Moment | null, max?: Moment | null): Moment {
  if (min && defaultTime.isBefore(min)) {
    defaultTime.year(min.year());
    defaultTime.month(min.month());
    defaultTime.date(min.date());
    if (defaultTime.isBefore(min)) {
      defaultTime.add(1, 'd');
    }
  }
  if (max && defaultTime.isAfter(max)) {
    defaultTime.year(max.year());
    defaultTime.month(max.month());
    defaultTime.date(max.date());
    if (defaultTime.isAfter(max)) {
      defaultTime.subtract(1, 'd');
    }
  }
  return defaultTime;
}

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
  /**
   * 允许使用非法日期
   */
  useInvalidDate?: boolean;
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

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'calendar-picker',
    mode: ViewMode.date,
    useInvalidDate: true,
  };

  componentWillUnmount() {
    if (this.timeID) {
      clearTimeout(this.timeID);
      delete this.timeID;
    }
  }

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

  @observable cursorDate?: Moment | undefined;

  @observable mode?: ViewMode;

  timeID?: number;

  rangeValueExchange?: boolean;

  /**
   * hover 时显示值
   */
  @observable hoverValue?: Moment | undefined;

  popupInputEditor?: HTMLInputElement | ObserverTextField | null;

  @autobind
  savePopupInputEditor(node: HTMLInputElement | ObserverTextField | null) {
    this.popupInputEditor = node;
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
      'useInvalidDate',
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
    const { min, max } = this;
    if (isArrayLike(defaultTime)) {
      return [getInRangeDefaultTime(defaultTime[0], min, max), getInRangeDefaultTime(defaultTime[1], min, max)];
    }
    const inRangeDefaultTime = getInRangeDefaultTime(defaultTime, min, max);
    return [inRangeDefaultTime, inRangeDefaultTime];
  }

  getDefaultViewMode() {
    const mode = this.getProp('mode', 'dateMode');
    if (mode === ViewMode.decade || mode === undefined) {
      return ViewMode.date;
    }
    return mode;
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    const viewMode = this.getViewMode();
    return classNames(
      super.getPopupClassName(defaultClassName), {
        [`${this.prefixCls}-popup-${String(viewMode).toLowerCase()}`]: viewMode,
      },
    );
  }

  @autobind
  @action
  handlePopupRangeEditorBlur() {
    const { text } = this;
    if (text) {
      this.syncValueOnBlur(text);
    }
  }

  getPopupEditor() {
    const { editorInPopup } = this.observableProps;
    if (editorInPopup) {
      const { prefixCls, range, text, rangeTarget, multiple } = this;
      const popupHoverValue = this.getHoverValue(true);
      const className = classNames(`${prefixCls}-popup-editor`, {
        [`${prefixCls}-popup-hover-value`]: !isNil(popupHoverValue) && !range,
        [`${prefixCls}-popup-hover-value-start`]: !isNil(popupHoverValue) && range && rangeTarget === 0,
        [`${prefixCls}-popup-hover-value-end`]: !isNil(popupHoverValue) && range && rangeTarget === 1,
      });
      const [startPlaceholder, endPlaceHolder = startPlaceholder] = this.getPlaceholders();
      if (range) {
        const [startValue = '', endValue = ''] = this.processRangeValue(this.rangeValue);
        const startText = this.getText(startValue) as string;
        const endText = this.getText(endValue) as string;
        return (
          <span key="popup-editor" className={classNames(className, `${prefixCls}-range-text`)}>
            <input
              className={`${prefixCls}-range-start`}
              onChange={this.handleChange}
              onFocus={this.handleRangeStart}
              onBlur={this.handlePopupRangeEditorBlur}
              value={rangeTarget === 0 ? defaultTo(defaultTo(popupHoverValue, text), startText) : startText}
              placeholder={startPlaceholder}
              ref={rangeTarget === 0 ? this.savePopupInputEditor : undefined}
              onKeyDown={this.handlePopupEditorKeyDown}
            />
            <span className={`${prefixCls}-range-split`}>~</span>
            <input
              className={`${prefixCls}-range-end`}
              onChange={this.handleChange}
              onFocus={this.handleRangeEnd}
              onBlur={this.handlePopupRangeEditorBlur}
              value={rangeTarget === 1 ? defaultTo(defaultTo(popupHoverValue, text), endText) : endText}
              placeholder={endPlaceHolder}
              ref={rangeTarget === 1 ? this.savePopupInputEditor : undefined}
              onKeyDown={this.handlePopupEditorKeyDown}
            />
          </span>
        );
      }
      const value = isNil(popupHoverValue) ? (multiple ? defaultTo(text, '') : this.getTextNode()) : popupHoverValue;
      return (
        <ObserverTextField
          key="popup-editor"
          value={value}
          onInput={this.handleChange}
          border={false}
          className={className}
          placeholder={startPlaceholder}
          onKeyDown={this.handlePopupEditorKeyDown}
          ref={this.savePopupInputEditor}
        />
      );
    }
  }

  getHoverValue(isPopup: boolean): string | undefined {
    const { editorInPopup } = this.props;
    if (((isPopup && editorInPopup) || (!isPopup && !editorInPopup))) {
      const { hoverValue } = this;
      if (hoverValue) {
        return hoverValue.format(this.getDateFormat());
      }
    }
  }

  @action
  handleDateMouseEnter = (currentDate?: Moment): void => {
    this.hoverValue = currentDate;
  };

  @action
  handleDateMouseLeave = (): void => {
    this.hoverValue = undefined;
  };

  // 处理 hover 值显示
  getEditorTextInfo(rangeTarget?: 0 | 1): { text: string; width: number; placeholder?: string } {
    const { isFlat } = this.props;
    const hoverValue = this.getHoverValue(false);
    if (hoverValue !== undefined) {
      if (rangeTarget === undefined || (rangeTarget === 0 && this.rangeTarget === 0) || (rangeTarget === 1 && this.rangeTarget === 1)) {
        return {
          text: hoverValue,
          width: isFlat ? measureTextWidth(hoverValue) : 0,
        };
      }
    }
    return super.getEditorTextInfo(rangeTarget);
  }

  getRangeInputValue(startText: string, endText: string): string {
    const hoverValue = this.getHoverValue(false);
    if (hoverValue === undefined) {
      return super.getRangeInputValue(startText, endText);
    }
    return hoverValue;
  }

  getInputClassString(className: string): string {
    const { prefixCls } = this;
    const hoverValue = this.getHoverValue(false);
    return classNames(className, {
      [`${prefixCls}-hover-value`]: !isNil(hoverValue),
    });
  }

  getPopupContent() {
    const mode = this.getViewMode();
    const date = this.getCursorDate();
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
            onCursorDateChange: this.handleCursorDateChange,
            onViewModeChange: this.handelViewModeChange,
            isValidDate: this.isValidDate,
            format: this.getDateFormat(),
            step: this.getProp('step') || {},
            renderExtraFooter: this.getProp('renderExtraFooter'),
            extraFooterPlacement: this.getProp('extraFooterPlacement') || 'bottom',
            onDateMouseEnter: this.handleDateMouseEnter,
            onDateMouseLeave: this.handleDateMouseLeave,
            okButton: this.getContextConfig('dateTimePickerOkButton'),
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
        this.changeCursorDate(date);
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

  getSelectedDate(): Moment {
    return this.getCursorDate();
  }

  getCursorDate(): Moment {
    const { range, multiple, rangeTarget, rangeValue } = this;
    let cursorDate =
      this.cursorDate ||
      (range && rangeTarget !== undefined && rangeValue && rangeValue[rangeTarget]) ||
      (!multiple && this.getValue());
    if (range && !multiple && rangeTarget !== undefined && !isNil(cursorDate) && !isMoment(cursorDate)) {
      cursorDate = typeof range === 'object' ? cursorDate[range[rangeTarget]] : cursorDate[rangeTarget];
    }
    if (isMoment(cursorDate) && cursorDate.isValid()) {
      return cursorDate.clone();
    }
    return this.getValidDate(this.getDefaultTime()[range && rangeTarget !== undefined ? rangeTarget : 0]);
  }

  getLimit(minOrMax: 'min' | 'max'): Moment | undefined {
    let limit = this.getProp(minOrMax);
    if (isNil(limit)) {
      const configLimit = this.getContextConfig(minOrMax);
      if (configLimit) {
        limit = configLimit(this.getFieldType());
      }
    }

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
  handleCursorDateChange(cursorDate: Moment, selectedDate: Moment, mode?: ViewMode) {
    if (
      this.isUnderRange(cursorDate, mode) && ((mode && mode !== ViewMode.date) || this.isDateOutOfFilter(cursorDate, selectedDate, mode))
    ) {
      this.changeCursorDate(cursorDate);
    }
  }

  @autobind
  handleSelectedDateChange(selectedDate: Moment, mode?: ViewMode) {
    if (this.isUnderRange(selectedDate, mode) && this.isDateOutOfFilter(selectedDate, selectedDate, mode)) {
      this.setText(selectedDate.format(this.getDateFormat()));
    }
  }

  @autobind
  handelViewModeChange(mode: ViewMode) {
    runInAction(() => {
      this.hoverValue = undefined;
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
        const { popupInputEditor } = this;
        if (popupInputEditor) {
          raf(() => {
            popupInputEditor.focus();
          });
        }
      } else {
        runInAction(() => {
          this.cursorDate = undefined;
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
        case KeyCode.BACKSPACE:
          this.handleKeyDownBackSpace(e);
          break;
        case KeyCode.DELETE:
          this.handleKeyDownDelete(e);
          break;
        default:
      }
    }
    super.handleKeyDown(e);
  }

  handleKeyDownHome(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().startOf('M'));
    }
  }

  handleKeyDownEnd(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().endOf('M'));
    }
  }

  handleKeyDownLeft(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().subtract(1, 'd'));
    }
  }

  handleKeyDownRight(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().add(1, 'd'));
    }
  }

  handleKeyDownUp(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().subtract(1, 'w'));
    }
  }

  handleKeyDownDown(e) {
    if (this.multiple) {
      this.expand();
    } else if (!this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().add(1, 'w'));
    }
  }

  handleKeyDownPageUp(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().subtract(1, e.altKey ? 'y' : 'M'));
    }
  }

  handleKeyDownPageDown(e) {
    if (!this.multiple && !this.editable) {
      stopEvent(e);
      this.choose(this.getCursorDate().add(1, e.altKey ? 'y' : 'M'));
    }
  }

  handleKeyDownEnter(_e) {
    if (!this.multiple && !this.editable) {
      this.choose(this.getCursorDate());
    }
  }

  handleKeyDownEsc(e) {
    if (this.popup) {
      e.preventDefault();
      this.collapse();
    }
  }

  @action
  handleKeyDownTab() {
    // this.collapse();
    if ((!this.range || this.rangeTarget === 1) && !isNil(this.hoverValue)) {
      this.hoverValue = undefined;
    }
  }

  handleKeyDownSpace(e) {
    if (!this.isEditable()) {
      e.preventDefault();
    }
    if (!this.popup) {
      this.expand();
    }
  }

  handleKeyDownBackSpace(e) {
    if (!this.isEditable() && !this.popup) {
      e.preventDefault();
    }
    if (this.cursorDate && this.afterKeyDownInputIsClear(e)) {
      runInAction(() => {
        this.cursorDate = undefined;
      });
    }
  }

  handleKeyDownDelete(e) {
    this.handleKeyDownBackSpace(e);
  }

  afterKeyDownInputIsClear(event) {
    const { keyCode, target: { value, selectionStart, selectionEnd } } = event;
    if (isNil(value)) {
      return true;
    }
    const length = String(value).length;
    const selectedLength = Math.abs(selectionEnd - selectionStart);
    if (length === selectedLength) {
      return true;
    }
    if (selectedLength !== 0) {
      return false;
    }
    if ((keyCode === KeyCode.BACKSPACE && (length === 1 && selectionStart === 1)) ||
      (keyCode === KeyCode.DELETE && (length === 1 && selectionStart === 0))) {
      return true;
    }
    return false;
  }

  @autobind
  handlePopupEditorKeyDown(e) {
    if (!this.disabled && !this.readOnly) {
      switch (e.keyCode) {
        case KeyCode.BACKSPACE:
          this.handleKeyDownBackSpace(e);
          break;
        case KeyCode.DELETE:
          this.handleKeyDownDelete(e);
          break;
        default:
      }
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

  @action
  prepareSetValue(...value: any[]): void {
    let cursorDate;
    const { useInvalidDate } = this.props;
    super.prepareSetValue(...value.reduce((values, v) => {
      if (v === null) {
        values.push(null);
      } else {
        const m = this.checkMoment(v);
        if (m) {
          if (useInvalidDate || m.isValid()) {
            cursorDate = cursorDate || this.getCursorDate();
            if (this.isDateOutOfFilter(m, cursorDate)) {
              values.push(m);
            }
          } else {
            this.setText();
          }
        } else {
          values.push(m);
        }
      }
      return values;
    }, []));
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
    this.rangeValueExchange = true;
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
  changeCursorDate(cursorDate: Moment) {
    if (this.rangeValueExchange) {
      if (this.range && !isNil(this.rangeTarget) && this.rangeValue) {
        const [start, end] = [...this.rangeValue];
        cursorDate = this.rangeTarget === 0 ? start : end;
      }
      this.setText(undefined);
    }
    this.rangeValueExchange = false;
    this.cursorDate = cursorDate && this.getValidDate(cursorDate);
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
    if (this.isDateOutOfFilter(date, date)) {
      this.prepareSetValue(date);
      this.changeCursorDate(date);
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
  }

  @action
  setRangeTarget(target) {
    if (this.isFocused && (target !== undefined && target !== this.rangeTarget)) {
      this.expand();
    }
    if (!isNil(target)) {
      this.cursorDate = undefined;
    } else {
      if (isNil(this.cursorDate)) {
        this.cursorDate = this.getCursorDate();
      }
      this.timeID = window.setTimeout(action(() => {
        this.cursorDate = undefined;
      }), (this.props.triggerHiddenDelay || 50) + 20);
    }
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

  isDateOutOfFilter(currentDate: Moment, selected: Moment, mode?: ViewMode): boolean {
    const { filter } = this.props;
    if (filter) {
      return filter(currentDate, selected, mode || this.getViewMode());
    }
    return true;
  }

  @autobind
  isValidDate(currentDate: Moment, selected: Moment, mode?: ViewMode): boolean {
    return this.isUnderRange(currentDate, mode) && this.isDateOutOfFilter(currentDate, selected, mode);
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
