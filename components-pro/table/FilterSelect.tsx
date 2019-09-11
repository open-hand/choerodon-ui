import Set from 'core-js/library/fn/set';
import React, { cloneElement, CSSProperties, ReactElement, ReactNode } from 'react';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import { observer } from 'mobx-react';
import {
  action,
  computed,
  get,
  IReactionDisposer,
  isArrayLike,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Icon from '../icon';
import Field from '../data-set/Field';
import { TextField, TextFieldProps } from '../text-field/TextField';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import autobind from '../_util/autobind';
import { FormFieldProps, RenderProps } from '../field/FormField';
import measureTextWidth from '../_util/measureTextWidth';
import { getEditorByField } from './utils';
import ObserverSelect, { SelectProps } from '../select/Select';
import processFieldValue from '../_util/processFieldValue';
import lookupStore from '../stores/LookupCodeStore';
import { isSameLike } from '../data-set/utils';
import Option, { OptionProps } from '../option/Option';

export interface FilterSelectProps extends TextFieldProps {
  paramName?: string;
  optionDataSet: DataSet;
  dropdownMenuStyle?: CSSProperties;
}

@observer
export default class FilterSelect extends TextField<FilterSelectProps> {
  static defaultProps = {
    ...TextField.defaultProps,
    optionDataSet: DataSet,
    multiple: true,
    clearButton: true,
    prefix: <Icon type="filter_list" />,
    dropdownMenuStyle: { minWidth: pxToRem(180) },
  };

  @observable selectField?: Field;

  @observable filterText?: string;

  queryDataSet?: DataSet;

  reaction: IReactionDisposer;

  @computed
  get value(): any | undefined {
    const { value } = this.observableProps;
    if (value) {
      return value;
    }
    const {
      optionDataSet: { queryDataSet },
      paramName,
    } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        const result: string[] = [];
        [...new Set([...queryDataSet.fields.keys(), paramName])].forEach(key => {
          if (key) {
            const values = current.get(key);
            if (isArrayLike(values)) {
              values.forEach(item => !isNil(item) && result.push(key));
            } else if (!isNil(values)) {
              result.push(key);
            }
          }
        });
        return result;
      }
    }
    return undefined;
  }

  set value(value: any | undefined) {
    runInAction(() => {
      this.observableProps.value = value;
    });
  }

  private setFilterText = debounce(
    action((text?: string) => {
      this.filterText = text;
    }),
    500,
  );

  constructor(props, context) {
    super(props, context);
    const { optionDataSet } = props;
    this.on(optionDataSet.queryDataSet);
    this.reaction = reaction(() => optionDataSet.queryDataSet, this.on);
  }

  on(ds?: DataSet) {
    this.off();
    if (ds) {
      ds.addEventListener('update', this.handleDataSetUpdate);
    }
    this.queryDataSet = ds;
  }

  off() {
    const { queryDataSet } = this;
    if (queryDataSet) {
      queryDataSet.removeEventListener('update', this.handleDataSetUpdate);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.setFilterText.cancel();
    this.off();
    this.reaction();
  }

  @action
  setText(text) {
    super.setText(text);
    this.setFilterText(text);
  }

  getPlaceholders(): string[] {
    if (!this.selectField) {
      return super.getPlaceholders();
    }
    return [];
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['paramName', 'optionDataSet', 'dropdownMenuStyle']);
  }

  @autobind
  getRootDomNode() {
    return this.element;
  }

  @autobind
  defaultRenderer({ value, repeat = 0 }: RenderProps) {
    const {
      optionDataSet: { queryDataSet },
      paramName,
    } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        let fieldValue = current.get(value);
        if (value === paramName) {
          return (fieldValue || [])[repeat];
        }
        const field = queryDataSet.getField(value);
        if (field) {
          if (field.get('multiple')) {
            fieldValue = (fieldValue || [])[repeat];
          }
          return `${this.getFieldLabel(field)}: ${processFieldValue(
            super.processValue(fieldValue),
            field,
            this.lang,
          )}`;
        }
        return value;
      }
    }
  }

  getQueryRecord(): Record | undefined {
    const {
      optionDataSet: { queryDataSet },
    } = this.props;
    if (queryDataSet) {
      return queryDataSet.current;
    }
  }

  getQueryField(fieldName): Field | undefined {
    const {
      optionDataSet: { queryDataSet },
    } = this.props;
    if (queryDataSet) {
      return queryDataSet.getField(fieldName);
    }
  }

  addQueryParams(value) {
    const { paramName } = this.props;
    if (paramName) {
      const values = this.getQueryValues(paramName);
      this.setQueryValue(paramName!, values.concat(value));
    }
  }

  afterRemoveValue(value, repeat: number) {
    const values = this.getQueryValues(value);
    if (repeat === -1) {
      values.pop();
    } else {
      values.splice(repeat, 1);
    }
    const multiple = this.getQueryFieldMultiple(value);
    this.setQueryValue(value, multiple ? values : values[0]);
  }

  getQueryFieldMultiple(value) {
    const { paramName } = this.props;
    if (paramName !== value) {
      const field = this.getQueryField(value);
      if (field && !field.get('multiple')) {
        return false;
      }
    }
    return true;
  }

  @autobind
  handleDataSetUpdate({ name, value }) {
    const values = this.getValues();
    if (isArrayLike(value)) {
      const { length } = value;
      if (length) {
        let repeat = 0;
        const filtered = values.filter(item => {
          if (item === name) {
            repeat += 1;
            if (repeat > length) {
              return false;
            }
          }
          return true;
        });
        for (let i = 0, n = length - repeat; i < n; i += 1) {
          filtered.push(name);
        }
        this.setValue(filtered);
      } else {
        this.setValue(values.filter(item => item === name));
      }
    } else if (isNil(value)) {
      this.setValue(values.filter(item => item === name));
    } else if (values.indexOf(name) === -1) {
      values.push(name);
      this.setValue(values);
    }
    this.props.optionDataSet.query();
  }

  @autobind
  handleBlur(e) {
    super.handleBlur(e);
    this.setSelectField(undefined);
  }

  @autobind
  handleFieldChange(value) {
    const { selectField } = this;
    if (selectField) {
      const { name } = selectField;
      this.setQueryValue(name, value);
    } else if (isString(value)) {
      this.addQueryParams(value);
      if (this.isFocused) {
        this.element.expand();
      }
    } else {
      this.setSelectField(value);
    }
  }

  @autobind
  handleInput(e) {
    this.setText(e.target.value);
  }

  @autobind
  handleFieldEnterDown() {
    defer(() => this.focus());
  }

  @autobind
  handleKeyDown(e) {
    if (this.selectField) {
      if (e.keyCode === KeyCode.BACKSPACE && !this.text) {
        this.setSelectField(undefined);
      }
    } else {
      super.handleKeyDown(e);
    }
  }

  @autobind
  handleEnterDown() {}

  @action
  setSelectField(value) {
    this.selectField = value;
    this.setFilterText(undefined);
  }

  getQueryValues(fieldName) {
    const current = this.getQueryRecord();
    if (current) {
      return [].concat(toJS(current.get(fieldName)) || []);
    }
    return [];
  }

  syncValueOnBlur() {}

  @action
  setQueryValue(fieldName: string, value: any) {
    const current = this.getQueryRecord();
    if (current) {
      current.set(fieldName, value);
    }
    this.setSelectField(undefined);
  }

  getFieldLabel(field: Field): ReactNode {
    return field.get('label') || field.name;
  }

  multipleFieldExistsValue(field: Field, current?: Record): boolean {
    if (field.get('multiple')) {
      const lookupKey = lookupStore.getKey(field);
      if (lookupKey) {
        const lookupData = lookupStore.get(lookupKey);
        if (lookupData && current) {
          const values = current.get(field.name);
          return lookupData.some(
            obj => !values.some(value => isSameLike(get(obj, field.get('valueField')), value)),
          );
        }
      }
    }
    return false;
  }

  getInputFilterOptions(filterText: string): ReactElement<OptionProps>[] {
    const {
      optionDataSet,
      optionDataSet: { fields },
    } = this.props;
    const values: Set<string> = new Set<string>();
    optionDataSet.forEach(record => {
      [...fields.keys()].forEach(key => {
        const value = record.get(key);
        if (isString(value) && value.toLowerCase().indexOf(filterText.toLowerCase()) !== -1) {
          values.add(value);
        }
      });
    });
    return [...values].map(value => (
      <Option key={value} value={value}>
        {value}
      </Option>
    ));
  }

  getFieldSelectOptions(): ReactElement<OptionProps>[] {
    const {
      props: {
        optionDataSet: { queryDataSet },
        paramName,
      },
    } = this;
    const data: ReactElement<OptionProps>[] = [];
    if (queryDataSet) {
      [...queryDataSet.fields.entries()].forEach(([key, field]) => {
        if (
          key !== paramName &&
          (this.getValues().indexOf(key) === -1 ||
            this.multipleFieldExistsValue(field, this.getQueryRecord()))
        ) {
          data.push(
            <Option key={key} value={field}>
              {this.getFieldLabel(field)}
            </Option>,
          );
        }
      });
    }
    return data;
  }

  getFieldEditor(props, selectField: Field): ReactElement<FormFieldProps> {
    const editor: ReactElement<FormFieldProps> = getEditorByField(selectField);
    const editorProps: FormFieldProps = {
      ...props,
      key: 'value',
      record: this.getQueryRecord(),
      name: selectField.name,
      autoFocus: true,
      onInput: this.handleInput,
      onEnterDown: this.handleFieldEnterDown,
      renderer: noop,
    };

    if (editor.type === (ObserverSelect as any)) {
      (editorProps as SelectProps).dropdownMenuStyle = this.props.dropdownMenuStyle;
    }
    return cloneElement<FormFieldProps>(editor, editorProps);
  }

  getFieldSelect(props): ReactElement<SelectProps> {
    const {
      filterText,
      props: { dropdownMenuStyle },
    } = this;
    return (
      <ObserverSelect
        {...props}
        key="key"
        combo
        searchable
        value={null}
        onInput={this.handleInput}
        onEnterDown={this.handleFieldEnterDown}
        autoFocus={this.isFocused}
        checkValueOnOptionsChange={false}
        dropdownMenuStyle={dropdownMenuStyle}
      >
        {filterText ? this.getInputFilterOptions(filterText) : this.getFieldSelectOptions()}
      </ObserverSelect>
    );
  }

  @action
  clear() {
    const record = this.getQueryRecord();
    if (record) {
      record.clear();
    }
  }

  renderMultipleEditor(props: FilterSelectProps) {
    const { text, selectField, prefixCls } = this;
    const editorProps: FilterSelectProps = {
      ...omit(props, ['multiple', 'prefixCls']),
      clearButton: false,
      prefix: null,
      suffix: null,
      elementClassName: `${prefixCls}-inner-editor`,
      onChange: this.handleFieldChange,
    };
    if (text) {
      editorProps.style = { width: pxToRem(measureTextWidth(text)) };
    }
    return (
      <li key="text">
        {selectField ? (
          <span className={`${prefixCls}-select-field`}>{this.getFieldLabel(selectField)}:</span>
        ) : null}
        {selectField
          ? this.getFieldEditor(editorProps, selectField)
          : this.getFieldSelect(editorProps)}
      </li>
    );
  }
}
