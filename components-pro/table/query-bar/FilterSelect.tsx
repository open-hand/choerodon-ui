import React, { cloneElement, CSSProperties, ReactElement, ReactNode } from 'react';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isString from 'lodash/isString';
import { observer } from 'mobx-react';
import { isMoment } from 'moment';
import { action, computed, IReactionDisposer, isArrayLike, observable, reaction, runInAction, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Icon from '../../icon';
import Field from '../../data-set/Field';
import { TextField, TextFieldProps } from '../../text-field/TextField';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import autobind from '../../_util/autobind';
import { FormFieldProps, RenderProps } from '../../field/FormField';
import { getEditorByField } from '../utils';
import ObserverSelect, { SelectProps } from '../../select/Select';
import Option, { OptionProps } from '../../option/Option';
import isSameLike from '../../_util/isSameLike';
import { DataSetEvents, FieldType } from '../../data-set/enum';
import { processFieldValue, toRangeValue, processValue, ProcessValueOptions } from '../../field/utils';

export interface FilterSelectProps extends TextFieldProps {
  paramName?: string;
  optionDataSet: DataSet;
  queryDataSet?: DataSet;
  dropdownMenuStyle?: CSSProperties;
  editable?: boolean;
  hiddenIfNone?: boolean;
  filter?: (string) => boolean;
  editorProps?: (props: { name: string, record?: Record, editor: ReactElement<FormFieldProps> }) => object;
  onBeforeQuery?: () => (Promise<boolean | void> | boolean | void);
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class FilterSelect extends TextField<FilterSelectProps> {
  static displayName = 'FilterSelect';

  static defaultProps = {
    ...TextField.defaultProps,
    multiple: true,
    clearButton: true,
    editable: true,
    dropdownMenuStyle: { minWidth: pxToRem(180) },
  };

  getPrefix(): ReactNode {
    const { prefix = <Icon type="filter_list" /> } = this.props;
    if (prefix) {
      return this.wrapperPrefix(prefix);
    }
  }

  @observable selectField?: Field;

  @observable filterText?: string;

  queryDataSet?: DataSet;

  reaction: IReactionDisposer;

  isDoClear: boolean;

  @computed
  get value(): any {
    const { filter } = this.props;
    const { value, queryDataSet } = this.observableProps;
    if (value) {
      return filter ? value.filter(filter) : value;
    }
    const { paramName } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        const result: string[] = [];
        const keys = queryDataSet.fields.keys();
        (paramName ? [...new Set([...keys, paramName])] : [...keys]).forEach((key: string) => {
          if (key && (!filter || filter(key))) {
            const values = current.get(key);
            if (isArrayLike(values)) {
              const field = current.getField(key);
              if (field && field.get('multiple', current)) {
                values.forEach(item => !isNil(item) && result.push(key));
              } else if (values.some(item => !isNil(item))) {
                result.push(key);
              }
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

  set value(value: any) {
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
    const { observableProps } = this;
    this.on(observableProps.queryDataSet);
    this.reaction = reaction(() => observableProps.queryDataSet, this.on);
  }

  getObservableProps(props, context: any) {
    return {
      ...super.getObservableProps(props, context),
      optionDataSet: props.optionDataSet,
      queryDataSet: props.queryDataSet,
    };
  }

  @autobind
  on(ds?: DataSet) {
    this.off();
    if (ds) {
      ds.addEventListener(DataSetEvents.update, this.handleDataSetUpdate);
      ds.addEventListener(DataSetEvents.reset, this.handleDataSetReset);
    }
    this.queryDataSet = ds;
  }

  off() {
    const { queryDataSet } = this;
    if (queryDataSet) {
      queryDataSet.removeEventListener(DataSetEvents.update, this.handleDataSetUpdate);
      queryDataSet.removeEventListener(DataSetEvents.reset, this.handleDataSetReset);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.setFilterText.cancel();
    this.off();
    this.reaction();
  }

  doQuery = throttle(async () => {
    const { onQuery = noop, onBeforeQuery = noop } = this.props;
    const { optionDataSet } = this.observableProps;
    if (await onBeforeQuery() === false) {
      return;
    }
    optionDataSet.query();
    onQuery();
  }, 500);

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

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'paramName',
      'optionDataSet',
      'queryDataSet',
      'dropdownMenuStyle',
      'hiddenIfNone',
      'editable',
      'filter',
    ]);
  }

  @autobind
  getRootDomNode() {
    return this.element;
  }

  @autobind
  defaultRenderer({ value, repeat = 0 }: RenderProps) {
    const { paramName } = this.props;
    const { queryDataSet } = this.observableProps;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        let fieldValue = current.get(value);
        if (value === paramName) {
          return fieldValue;
        }
        const field = queryDataSet.getField(value);
        if (field) {
          const range = field.get('range', current);
          if (field.get('multiple', current)) {
            fieldValue = (fieldValue || [])[repeat];
          }
          const showInvalidDate = this.getContextConfig('showInvalidDate');
          const processValueOptions: ProcessValueOptions = {
            dateFormat: this.getDateFormat(field),
            showInvalidDate,
            isNumber: [FieldType.number, FieldType.currency, FieldType.bigNumber].includes(field.get('type', current)),
            precision: field && field.get('precision', current),
            useZeroFilledDecimal: this.getContextConfig('useZeroFilledDecimal'),
            numberRoundMode: field && field.get('numberRoundMode', current),
          };
          if (range) {
            return `${this.getFieldLabel(field, current)}: ${toRangeValue(fieldValue, range).map(v => {
              return processFieldValue(
                isPlainObject(v) ? v : processValue(v, processValueOptions),
                field,
                {
                  getProp: (name) => this.getProp(name),
                  getValue: () => this.getValue(),
                  lang: this.lang,
                  getDisplayProp: (name) => this.getDisplayProp(name),
                }, true, current, this.getContextConfig);
            }).join(this.rangeSeparator)}`;
          }
          if (field.get('bind', current) || isNil(fieldValue)) return;
          const text = this.processText(isNil(fieldValue)
            ? processValue(value, processValueOptions)
            : isMoment(fieldValue) ? processValue(fieldValue, processValueOptions) : fieldValue);
          return `${this.getFieldLabel(field, current)}: ${processFieldValue(
            isPlainObject(fieldValue) ? fieldValue : text,
            field,
            {
              getProp: (name) => this.getProp(name),
              getValue: () => this.getValue(),
              lang: this.lang,
              getDisplayProp: (name) => this.getDisplayProp(name),
            }, true, current, this.getContextConfig,
          )}`;
        }
        return value;
      }
    }
  }

  getQueryRecord(): Record | undefined {
    const { queryDataSet } = this.observableProps;
    if (queryDataSet) {
      return queryDataSet.current;
    }
  }

  getQueryField(fieldName): Field | undefined {
    const { queryDataSet } = this.observableProps;
    if (queryDataSet) {
      return queryDataSet.getField(fieldName);
    }
  }

  addQueryParams(value) {
    const { paramName } = this.props;
    if (paramName) {
      this.setQueryValue(paramName!, value);
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
      if (field && field.get('multiple', this.getQueryRecord())) {
        return true;
      }
    }
    return false;
  }

  @autobind
  handleDataSetReset() {
    const { onReset = noop } = this.props;
    this.setValue(undefined);
    onReset();
  }

  @autobind
  @action
  handleDataSetUpdate({ name, value, record }) {
    const values = this.getValues();
    if (isArrayLike(value)) {
      const { length } = value;
      if (length) {
        const field = record.getField(name);
        if (field && field.get('multiple', record)) {
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
        } else if (values.indexOf(name) === -1) {
          values.push(name);
          this.setValue(values);
        }
      } else {
        this.setValue(values.filter(item => item !== name));
      }
    } else if (isNil(value)) {
      this.setValue(values.filter(item => item !== name));
    } else {
      if (values.indexOf(name) === -1) {
        values.push(name);
      }
      this.setValue(values);
    }
    if (!this.isDoClear) {
      this.doQuery();
    }
  }

  @autobind
  handleBlur(e) {
    super.handleBlur(e);
    if (!e.isDefaultPrevented()) {
      this.setSelectField(undefined);
    }
  }

  isEditorReadOnly(): boolean {
    const { paramName, editable } = this.props;
    return (this.getQueryValues(paramName).length > 0 && !this.selectField) || !editable;
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
  handleEnterDown() {
    // noop
  }

  @action
  setSelectField(value) {
    this.selectField = value;
    this.setFilterText(undefined);
  }

  getQueryValues(fieldName) {
    const current = this.getQueryRecord();
    const field = this.getQueryField(fieldName);
    const range = field && field.get('range', current);

    if (current) {
      const value = toJS(current.get(fieldName)) || [];
      return [].concat(!range ? value : [value]);
    }
    return [];
  }

  syncValueOnBlur() {
    // noop
  }

  @action
  setQueryValue(fieldName: string, value: any) {
    const current = this.getQueryRecord();
    if (current) {
      current.set(fieldName, value);
    }
    this.setSelectField(undefined);
  }

  getFieldLabel(field: Field, record?: Record): ReactNode {
    return field.get('label', record) || field.name;
  }

  multipleFieldExistsValue(field: Field, current?: Record): boolean {
    if (field.get('multiple', current)) {
      const options = field.getOptions(current);
      if (options && current) {
        const values = current.get(field.name);
        const valueField = field.get('valueField', current);
        return options.some(r => !values.some(value => isSameLike(r.get(valueField), value)));
      }
    }
    return false;
  }

  getInputFilterOptions(filterText: string): ReactElement<OptionProps>[] {
    const {
      optionDataSet,
      optionDataSet: { fields },
    } = this.observableProps;
    const values: Set<string> = new Set<string>();
    optionDataSet.forEach(record => {
      fields.forEach((_, key) => {
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
    const { paramName } = this.props;
    const { queryDataSet } = this.observableProps;
    const data: ReactElement<OptionProps>[] = [];
    if (queryDataSet) {
      const { current } = queryDataSet;
      queryDataSet.fields.forEach((field, key) => {
        if (
          key !== paramName &&
          (this.getValues().indexOf(key) === -1 ||
            this.multipleFieldExistsValue(field, current)) &&
          !field.get('bind', current)
        ) {
          data.push(
            <Option key={String(key)} value={field}>
              {this.getFieldLabel(field, current)}
            </Option>,
          );
        }
      });
    }
    return data;
  }

  getFieldEditor(props, selectField: Field): ReactElement<FormFieldProps> { // TODO
    const current = this.queryDataSet ? this.queryDataSet.current : undefined;
    const editor: ReactElement<FormFieldProps> = getEditorByField(selectField, current, true);
    const record = this.getQueryRecord();
    const { editorProps = noop } = this.props;
    const editorFunProps = editorProps({name: selectField.name, record, editor});
    const editorMergeProps: FormFieldProps = {
      ...editorFunProps,
      ...props,
      key: 'value',
      record,
      name: selectField.name,
      autoFocus: true,
      onInput: this.handleInput,
      onEnterDown: this.handleFieldEnterDown,
      renderer: noop,
      isFlat: true,
    };

    if ((editor.type as any).__PRO_SELECT) {
      (editorMergeProps as SelectProps).dropdownMenuStyle = this.props.dropdownMenuStyle;
      (editorMergeProps as SelectProps).dropdownMatchSelectWidth = false;
    }
    return cloneElement<FormFieldProps>(editor, editorMergeProps);
  }

  getFieldSelect(props): ReactElement<SelectProps> {
    const {
      filterText,
      props: { dropdownMenuStyle },
    } = this;
    const editable = !this.isEditorReadOnly();
    const options =
      editable && filterText
        ? this.getInputFilterOptions(filterText)
        : this.getFieldSelectOptions();
    return (
      <ObserverSelect
        {...props}
        key="key"
        combo={editable}
        searchable={editable}
        value={null}
        onInput={this.handleInput}
        onEnterDown={this.handleFieldEnterDown}
        autoFocus={this.isFocused}
        dropdownMenuStyle={dropdownMenuStyle}
        dropdownMatchSelectWidth={false}
      >
        {options}
      </ObserverSelect>
    );
  }

  @action
  clear() {
    const record = this.getQueryRecord();
    this.isDoClear = true;
    if (record) {
      record.clear();
      this.doQuery();
    }
    this.setValue(undefined);
    this.setSelectField(undefined);
    this.element.text = undefined;
    this.isDoClear = false;
  }

  renderWrapper(): ReactNode {
    const { hiddenIfNone } = this.props;
    if (this.isEmpty() && hiddenIfNone) {
      return null;
    }
    return super.renderWrapper();
  }

  renderMultipleEditor(props: FilterSelectProps) {
    const { selectField, prefixCls } = this;
    const editorProps: FilterSelectProps = {
      ...omit(props, ['multiple', 'prefixCls']),
      clearButton: false,
      prefix: null,
      suffix: null,
      elementClassName: `${prefixCls}-inner-editor`,
      onChange: this.handleFieldChange,
    };
    editorProps.style = { width: 'auto' };
    return (
      <li key="text">
        {selectField ? (
          <span className={`${prefixCls}-select-field`}>{this.getFieldLabel(selectField, this.getQueryRecord())}:</span>
        ) : null}
        {selectField
          ? this.getFieldEditor(editorProps, selectField)
          : this.getFieldSelect(editorProps)}
      </li>
    );
  }

  @autobind
  handleMouseDown(e) {
    if (e.target !== this.element) {
      if (!this.isFocused) {
        this.focus();
      }
    }
  }
}
