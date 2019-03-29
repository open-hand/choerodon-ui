import React, { CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';
import { observer } from 'mobx-react';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import DropDownMenu from './DropDownMenu';
import Record from '../data-set/Record';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ValidationMessages } from '../validator/Validator';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import { DataSetEvents, DataSetSelection, DataSetStatus, FieldType } from '../data-set/enum';
import DataSet from '../data-set/DataSet';
import lookupStore from '../stores/LookupCodeStore';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';
import isChildrenEqual from '../_util/isChildrenEqual';
import { isSame, isSameLike } from '../data-set/utils';
import noop from 'lodash/noop';

export interface SelectProps extends TriggerFieldProps {
  /**
   * 复合输入值
   * @default false
   */
  combo?: boolean;
  /**
   * 可搜索
   * @default false
   */
  searchable?: boolean;
  /**
   * 选项过滤
   * @param {Record} record
   * @return {boolean}
   */
  optionsFilter?: (record: Record) => boolean;
}

@observer
export default class Select extends TriggerField<SelectProps> {
  static displayName = 'Select';

  static propTypes = {
    /**
     * 复合输入值
     * @default false
     */
    combo: PropTypes.bool,
    /**
     * 过滤器
     * @default false
     */
    searchable: PropTypes.bool,
    ...TriggerField.propTypes,
  };

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'pro-select',
    combo: false,
    searchable: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  comboOptions: Record[] = [];

  @observable loading: boolean;

  @observable options: DataSet;

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    return {
      valueMissing: $l('Select', 'value_missing'),
    };
  }

  @computed
  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  @computed
  get valueField(): string {
    return this.getProp('valueField') || 'value';
  }

  get currentComboOption(): Record | undefined {
    return this.comboOptions.filter(record => !record.isSelected)[0];
  }

  @computed
  get filteredOptions() {
    const { optionsFilter, searchable } = this.props;
    if (this.options) {
      let { data } = this.options;
      if (optionsFilter) {
        data = data.filter(optionsFilter);
      }
      if (searchable && this.text) {
        data = data.filter(record => record.get(this.textField).indexOf(this.text) !== -1);
      }
      return this.filterByCascade(data);
    }
    return [];
  }

  @computed
  get editable(): boolean {
    const { searchable, combo } = this.props;
    return !this.isReadOnly() && (!!searchable || !!combo);
  }

  @computed
  get multiple(): boolean {
    return this.getProp('multiple') || (this.options && this.options.selection === DataSetSelection.multiple);
  }

  constructor(props, context) {
    super(props, context);
    this.initOptions(props);
    reaction(() => this.field && [lookupStore.getKey(this.field), this.field.getOptions()], () => this.initOptions(this.props));
    reaction(() => this.processSelectedData(), noop);
    reaction(() => this.filterByCascade(this.options.data), () => this.processSelectedData());
  }

  processOptionsListener(flag: boolean) {
    const { options } = this;
    if (options) {
      const handler = flag ? options.addEventListener : options.removeEventListener;
      handler.call(options, DataSetEvents.select, this.handleOptionSelect);
      handler.call(options, DataSetEvents.unSelect, this.handleOptionUnSelect);
      handler.call(options, DataSetEvents.unSelectAll, this.handleOptionUnSelectAll);
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    if (!isChildrenEqual(nextProps.children, this.props.children)) {
      this.initOptions(nextProps);
    }
  }

  componentDidUpdate() {
    this.forcePopupAlign();
  }

  componentWillUnmount() {
    this.processOptionsListener(false);
  }

  @action
  initOptions(props): void {
    this.processOptionsListener(false);
    const { field, textField, valueField, multiple } = this;
    this.options = normalizeOptions({ field, textField, valueField, multiple, children: props.children });
    this.processOptionsListener(true);
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'searchable',
      'combo',
      'multiple',
      'value',
      'name',
      'optionsFilter',
    ]);
    return otherProps;
  }

  getEditor(): ReactNode {
    const { name } = this;
    return [
      super.getEditor(),
      <input key="value" type="hidden" value={this.toValueString(this.getValue()) || ''} name={name} />,
    ];
  }

  getPopupProps() {
    const { options, textField, valueField } = this;
    return {
      dataSet: options,
      textField,
      valueField,
    };
  }

  getPopupContent() {
    const { prefixCls, options, loading } = this;
    const data = this.filteredOptions;
    return data.length ? (
      <Spin spinning={loading || options.status === DataSetStatus.loading}>
        <DropDownMenu
          {...this.getPopupProps()}
          options={data}
          className={`${prefixCls}-menu`}
          onOptionClick={this.handleOptionClick}
        />
      </Spin>
    ) : null;
  }

  @autobind
  getPopupStyleFromAlign(target): CSSProperties | undefined {
    if (target) {
      return {
        minWidth: pxToRem(target.getBoundingClientRect().width),
      };
    }
  }

  getTriggerIconFont() {
    return 'baseline-arrow_drop_down';
  }

  @autobind
  handleKeyDown(e) {
    e.persist();
    if (!this.isDisabled() && !this.isReadOnly()) {
      let opposition = false;
      switch (e.keyCode) {
        case KeyCode.RIGHT:
          opposition = true;
        case KeyCode.LEFT:
          this.handleKeyDownLeftRight(e, opposition);
          break;
        case KeyCode.DOWN:
          opposition = true;
        case KeyCode.UP:
          this.handleKeyDownUpDown(e, opposition);
          break;
        case KeyCode.ENTER:
          this.handleKeyDownEnter(e);
          break;
        case KeyCode.END:
        case KeyCode.PAGE_DOWN:
          opposition = true;
        case KeyCode.HOME:
        case KeyCode.PAGE_UP:
          this.handleKeyDownFirstLast(e, opposition);
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

  async handleKeyDownFirstLast(e, opposition: boolean) {
    stopEvent(e);
    if (!this.editable || this.popup) {
      try {
        await this.options[opposition ? 'last' : 'first']();
      } catch (e) {
      }
    }
    if (!this.editable && !this.popup) {
      this.choose();
    }
  }

  async handleKeyDownLeftRight(e, opposition: boolean) {
    if (!this.editable) {
      stopEvent(e);
      if (!this.popup && !this.multiple) {
        try {
          await this.options[opposition ? 'next' : 'pre']();
        } catch (e) {
        }
        this.choose();
      }
    }
  }

  async handleKeyDownUpDown(e, opposition: boolean) {
    stopEvent(e);
    try {
      await this.options[opposition ? 'next' : 'pre']();
    } catch (e) {
    }
    if (!this.popup && !this.multiple) {
      this.choose();
    }
  }

  handleKeyDownEnter(e) {
    if (this.popup) {
      e.preventDefault();
      this.choose();
    }
  }

  handleKeyDownEsc(e) {
    if (this.popup) {
      e.preventDefault();
      this.collapse();
    }
  }

  handleKeyDownSpace(e) {
    if (!this.editable) {
      e.preventDefault();
      if (!this.popup) {
        this.expand();
      }
    }
  }

  @autobind
  handleOptionClick(record: Record) {
    this.choose(record);
  }

  @autobind
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      super.handleBlur(e);
    }
  }

  syncValueOnBlur(value) {
    if (value) {
      const record = this.findByText(value);
      if (record) {
        this.choose(record);
      }
    }
  }

  findByText(text): Record | undefined {
    const { textField, options } = this;
    return this.filterByCascade(options.data).find(record => isSameLike(record.get(textField), text));
  }

  findByValue(value): Record | undefined {
    const { valueField, options } = this;
    const autoType = this.getProp('type') === FieldType.auto;
    return this.filterByCascade(options.data).find(record =>
      autoType ? isSameLike(record.get(valueField), value) : isSame(record.get(valueField), value),
    );
  }

  generateComboOption(value: string, callback?: (text: string) => void): void {
    const { currentComboOption, textField, valueField, options } = this;
    if (value) {
      let found = this.findByText(value) || this.findByValue(value);
      if (found) {
        const text = found.get(textField);
        if (callback && text !== value) {
          callback(text);
        }
        this.removeComboOption();
      } else {
        if (currentComboOption) {
          currentComboOption.set(textField, value);
          currentComboOption.set(valueField, value);
        } else {
          this.comboOptions.unshift(options.create({
            [textField]: value,
            [valueField]: value,
          }));
        }
        found = this.currentComboOption;
      }
      options.current = found;
    } else {
      this.removeComboOption();
    }
  }

  removeComboOptions() {
    this.comboOptions.forEach(record => this.removeComboOption(record));
  }

  removeComboOption(record?: Record): void {
    if (!record) {
      record = this.currentComboOption;
    }
    if (record && !record.isSelected) {
      const index = this.comboOptions.indexOf(record);
      if (index !== -1) {
        this.options.remove(record);
        this.comboOptions.splice(index, 1);
      }
    }
  }

  handlePopupAnimateAppear() {
  }

  @autobind
  handlePopupAnimateEnd(key, exists) {
    if (!exists && key === 'align') {
      this.resetFilter();
    }
  }

  handleMutipleValueRemove(value: any, e) {
    const record = this.findByValue(value);
    if (record) {
      this.options.unSelect(record);
    }
    e.stopPropagation();
  }

  @autobind
  handleOptionSelect({ record }) {
    const newValue = record.get(this.valueField);
    this.addValue(newValue);
  }

  @autobind
  handleOptionUnSelect({ record }) {
    const newValue = record.get(this.valueField);
    const autoType = this.getProp('type') === FieldType.auto;
    this.setValue(this.getValues().filter(v => autoType ? !isSameLike(v, newValue) : !isSame(v, newValue)));
    this.removeComboOption(record);
  }

  @autobind
  handleOptionUnSelectAll() {
    this.setText(void 0);
    this.setValue(null);
    this.removeComboOptions();
  }

  @autobind
  handleChange(e) {
    const { value } = e.target;
    this.setText(value);
    if (!this.popup) {
      this.expand();
    }
    if (this.props.combo) {
      this.generateComboOption(value, (text) => {
        this.setText(text);
      });
    }
  }

  processValue(value) {
    const { field, textField, valueField } = this;
    if (field) {
      const lookupKey = lookupStore.getKey(field);
      if (lookupKey) {
        return super.processValue(lookupStore.getText(lookupKey, value, valueField, textField));
      }
    }
    const found = this.findByValue(value);
    return super.processValue(found && found.get(textField));
  }

  toValueString(value: any): string | undefined {
    if (isArray[value]) {
      return value.join(',');
    }
    return value;
  }

  clear() {
    this.options.unSelectAll();
  }

  resetFilter() {
    this.setText(void 0);
    this.removeComboOption();
    this.forcePopupAlign();
  }

  @autobind
  reset() {
    super.reset();
    this.resetFilter();
  }

  async choose(record?: Record | null) {
    const { options } = this;
    record = record || options.current;
    if (record) {
      if (this.multiple && options.selected.indexOf(record) !== -1) {
        options.unSelect(record);
      } else {
        await options.select(record);
      }
    }
    if (!this.multiple) {
      this.collapse();
    }
  }

  @autobind
  async handlePopupHiddenChange(hidden: boolean) {
    if (!hidden) {
      this.forcePopupAlign();
    }
    super.handlePopupHiddenChange(hidden);
  }

  filterByCascade(data) {
    const { record, field } = this;
    if (field) {
      const cascadeMap = field.get('cascadeMap');
      if (cascadeMap) {
        if (record) {
          const cascades = Object.keys(cascadeMap);
          return data.filter(item => cascades.every(cascade => isSameLike(record.get(cascadeMap[cascade]), item.get(cascade))));
        } else {
          return [];
        }
      }
    }
    return data;
  }

  async processSelectedData() {
    this.comboOptions = [];
    const values = this.getValues();
    if (values) {
      const { field } = this;
      if (field) {
        await field.ready();
      }
      const { options, textField, valueField } = this;
      const { combo } = this.props;
      runInAction(() => {
        const newValues = values.filter(value => {
          let record = this.findByValue(value);
          if (!record && combo) {
            record = options.create({
              [textField]: value,
              [valueField]: value,
            });
            this.comboOptions.unshift(record);
          }
          if (record) {
            record.isSelected = true;
            return true;
          }
          return false;
        });
        if (options.length && !isEqual(newValues, values)) {
          this.setValue(this.multiple ? newValues : newValues[0]);
        }
      });
    }
  };

}
