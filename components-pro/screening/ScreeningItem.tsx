import React, { ReactElement, isValidElement, Key, ReactNode } from 'react';
import { observer } from 'mobx-react';
import Icon from 'choerodon-ui/lib/icon';
import warning from 'choerodon-ui/lib/_util/warning';
import { observable, isArrayLike, runInAction, action, computed, toJS } from 'mobx';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import { isMoment, Moment } from 'moment';
import defaultTo from 'lodash/defaultTo';
import { ColProps } from 'choerodon-ui/lib/col';
import Row, { RowProps } from 'choerodon-ui/lib/row';
import classNames from 'classnames';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import ScreeningOption, { ScreeningOptionProps } from './ScreeningOption';
import DataSet from '../data-set/DataSet';
import Field from '../data-set/Field';
import Record from '../data-set/Record';
import normalizeOptions from '../option/normalizeOptions';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import { getDateFormatByField, toMultipleValue } from '../field/utils';
import { FieldType } from '../data-set/enum';
import { formatString } from '../formatter';
import isSame from '../_util/isSame';
import isSameLike from '../_util/isSameLike';
import ObserverButton from '../button/Button';
import { $l } from '../locale-context';

const disabledField = '__disabled';


const expandedButton = (iconExpanded) => {
  if (iconExpanded === true) {
    return (
      <>
        <span>{`${$l('Screening', 'pack_up')}`}</span>
        <Icon type="expand_less" />
      </>
    )
  }
  return (
    <>
      <span>{`${$l('Screening', 'more')}`}</span>
      <Icon type="expand_more" />
    </>
  )
}

export function getItemKey(record: Record, text: ReactNode, value: any) {
  return `item-${value || record.id}-${(isValidElement(text) ? text.key : text) || record.id}`;
}

function getSimpleValue(value, valueField) {
  if (isPlainObject(value)) {
    return ObjectChainValue.get(value, valueField);
  }
  return value;
}

export type RenderProps = {
  options?: DataSet,
  name?: string,
  dataSet?: DataSet,
  onConfirm?: (confirm: Confirm) => void,
  record?: Record,
};

export type Renderer = (props: RenderProps) => ReactNode;

export interface Confirm {
  value: string;
  fieldName: string | undefined;
}


export interface ScreeningItemProps extends DataSetComponentProps {
  multiple?: boolean;
  dataSet?: DataSet;
  name: string;
  primitiveValue?: boolean;
  onChange?: (value, oldValue, formNode) => void;
  renderer?: Renderer;
  onConfirm: (confirm: Confirm) => void;
  onRef?: (ref) => void;
  colProps?: ColProps;
  rowProps?: RowProps;
  optionRenderer?: ({ text, value, record }: { text: string, value: any, record: Record }) => ReactElement<any>;
}

@observer
export default class Screening extends DataSetComponent<ScreeningItemProps> {

  static displayName = 'ScreeningItem';

  @observable iconExpanded: boolean;

  @observable observableProps: any;

  @observable screeningMultiple: boolean;

  emptyValue?: any = null;

  text?: any = null;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.iconExpanded = false;
      this.screeningMultiple = false;
      if (this.name && this.dataSet && this.record) {
        const value = this.record.get(this.name)
        if (!isNil(value)) {
          this.value = value;
        }
      }
    });
  }

  static defaultProps = {
    suffixCls: 'screening-item',
    multiple: false,
    colProps: {
      span: 4,
    },
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this)
    }
  }

  /**
   * return the record: dataIndex record, current, undefined
   */
  @computed
  get record(): Record | undefined {
    const { record, dataSet, dataIndex } = this.observableProps;
    if (record) {
      return record;
    }
    if (dataSet) {
      if (isNumber(dataIndex)) {
        return dataSet.get(dataIndex);
      }
      return dataSet.current;
    }
    return undefined;
  }

  @computed
  get value(): any | undefined {
    return this.observableProps.value;
  }

  set value(value: any | undefined) {
    runInAction(() => {
      this.observableProps.value = value;
    });
  }

  // @computed
  get editable(): boolean {
    return !this.isDisabled() && !this.isReadOnly();
  }

  /**
   * 判断是否展示更多按钮
   */
  @computed
  get needExpandButton(): boolean {
    const { colProps } = this.props;
    if (colProps) {
      const { span } = colProps
      if (isNumber(span) && span >= 1) {
        const colNumber = 24 / span;
        if (this.options && (this.options.length < colNumber)) {
          return false;
        }
      }
    }
    return true;
  }

  @computed
  get name(): string | undefined {
    return this.observableProps.name;
  }

  @computed
  get primitive(): boolean {
    const type = this.getProp('type');
    return this.observableProps.primitiveValue !== false && type !== FieldType.object;
  }

  /**
   * get field message: recordField,dsField,undefined
   */
  @computed
  get field(): Field | undefined {
    const { record, dataSet, name, observableProps } = this;
    const { displayName } = this.constructor as any;
    if (displayName !== 'Output' && !name) {
      warning(!observableProps.dataSet, `${displayName} with binding DataSet need property name.`);
      warning(!observableProps.record, `${displayName} with binding Record need property name.`);
    }
    if (name) {
      const recordField = record ? record.getField(name) : undefined;
      const dsField = dataSet ? dataSet.getField(name) : undefined;
      if (recordField) {
        return recordField;
      }
      return dsField;
    }
    return undefined;
  }

  getProp(propName: string) {
    const { field } = this;
    return defaultTo(field && field.get(propName), this.props[propName]);
  }

  @autobind
  handleChange(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  @computed
  get options(): DataSet {
    const {
      field,
      textField,
      valueField,
      multiple,
      observableProps: { children, options },
    } = this;
    return (
      options ||
      (field && field.options) ||
      normalizeOptions({ textField, valueField, disabledField, multiple, children })
    );
  }

  @computed
  get multiple(): boolean {
    return toJS(this.screeningMultiple) || !!this.getProp('multiple');
  }

  @computed
  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  @computed
  get valueField(): string {
    return this.getProp('valueField') || 'value';
  }

  getFieldType(): FieldType {
    const { field } = this;
    return (field && field.get('type')) || FieldType.string;
  }

  getDateFormat(): string {
    return getDateFormatByField(this.field, this.getFieldType());
  }

  @action
  handleExpanedClick = () => {
    this.iconExpanded = !this.iconExpanded
  }

  choose(record?: Record | null) {
    if (record) {
      this.handleOptionSelect(record);
    }
  }

  unChoose(record?: Record | null) {
    if (record) {
      this.handleOptionUnSelect(record);
    }
  }

  handleOptionSelect(record: Record) {
    this.prepareSetValue(this.processRecordToObject(record));
  }

  handleOptionUnSelect(record: Record) {
    const { valueField } = this;
    const newValue = record.get(valueField);
    this.removeValue(newValue, -1);
  }

  getDataSetValue(): any {
    const { record, name } = this;
    if (record) {
      return record.get(name);
    }
  }

  getValue(): any {
    const { name, multiple } = this;
    if (multiple) {
      return this.value;
    }
    if (this.dataSet && name) {
      return this.getDataSetValue();
    }
    return this.value;
  }

  getValues(): any[] {
    return toMultipleValue(this.getValue(), false);
  }

  getOldValue(): any {
    return this.getValue();
  }

  addValue(...values) {
    if (this.multiple) {
      const oldValues = this.getValues();
      if (values.length) {
        this.setValue([...oldValues, ...values]);
      } else if (!oldValues.length) {
        this.setValue(this.emptyValue);
      }
    } else {
      this.setValue(values.pop());
    }
  }

  getValueKey(v: any) {
    if (isArrayLike(v)) {
      return v.join(',');
    }
    return v;
  }

  removeValues(values: any[], index: number = 0) {
    let repeat: number;
    this.setValue(
      values.reduce((oldValues, value) => {
        repeat = 0;
        return oldValues.filter(v => {
          if (this.getValueKey(v) === this.getValueKey(value)) {
            if (index === -1 || repeat === index) {
              this.afterRemoveValue(value, repeat++);
              return false;
            }
            repeat++;
          }
          return true;
        });
      }, this.getValues()),
    );
  }

  afterRemoveValue(_value, _repeat: number) {
  }

  removeValue(value: any, index: number = 0) {
    this.removeValues([value], index);
  }

  isReadOnly(): boolean {
    return (
      (this.getProp('readOnly') as boolean) ||
      (!this.props.onChange)
    );
  }

  @action
  setValue(value: any): void {
    const { onConfirm } = this.props;
    if (!this.isReadOnly()) {
      if (
        this.multiple
          ? isArrayLike(value) && !value.length
          : isNil(value) || value === ''
      ) {
        value = this.emptyValue;
      }
      const {
        name,
        dataSet,
        observableProps: { dataIndex },
      } = this;
      const { onChange = noop } = this.props;
      const { formNode } = this.context;
      const old = this.getOldValue();
      if (dataSet && name && !this.multiple) {
        (this.record || dataSet.create({}, dataIndex)).set(name, value);
      } else {
        value = formatString(value, {
        });
      }
      // 转成实际的数据再进行判断
      if (!isSame(toJS(old), toJS(value))) {
        onChange(value, toJS(old), formNode);

        if (this.multiple && value) {
          this.text = value.map((item) => {
            return this.processValue(item)
          })
        } else if (value) {
          this.text = this.processValue(value)
          if (onConfirm) {
            onConfirm({
              value,
              fieldName: this.name,
            })
          }
        }
      }
      this.value = value;
    }
  }

  /**
   * 提交值，触发dataSet修改和提交方法。
   */
  handleConfirm = () => {
    const { onConfirm } = this.props;
    const { value, dataSet, name, observableProps: { dataIndex } } = this
    if (value && name && dataSet) {
      (this.record || dataSet.create({}, dataIndex)).set(name, value);
      if (onConfirm) {
        onConfirm({
          value: this.value,
          fieldName: this.name,
        })
      }
    }
  }

  @action
  prepareSetValue(...value: any[]): void {
    const values = value.filter(item => !isEmpty(item));
    this.addValue(...values);
  }


  handleSelect = (info) => {
    const record = info.value
    this.choose(record)
  }

  handleDeselect = (info) => {
    const record = info.value
    this.unChoose(record)
  }

  handleClick = (_info) => {
  }

  findByValue(value): Record | undefined {
    const { valueField } = this;
    const autoType = this.getProp('type') === FieldType.auto;
    value = getSimpleValue(value, valueField);
    return this.options.find(record =>
      autoType ? isSameLike(record.get(valueField), value) : isSame(record.get(valueField), value),
    );
  }

  processObjectValue(value, textField) {
    if (!isNil(value)) {
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, textField);
      }
      const found = this.findByValue(value);
      if (found) {
        return found.get(textField);
      }
    }
  }

  processValueNormal(value: any): string {
    if (!isNil(value)) {
      if (isMoment(value)) {
        return (value as Moment).format(this.getDateFormat());
      }
      return value.toString();
    }
    return '';
  }

  processLookupValue(value) {
    const { field, textField, primitive } = this;
    if (primitive && field && field.lookup) {
      return this.processValueNormal(field.getText(value));
    }
    return this.processValueNormal(this.processObjectValue(value, textField));
  }

  processValue(value: any): string {
    const text = this.processLookupValue(value);
    if (isEmpty(text)) {
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, this.valueField) || '';
      }
      return this.processValueNormal(value);
    }
    return text;
  }


  processRecordToObject(record: Record) {
    const { primitive, valueField } = this;
    return primitive ? record.get(valueField) : record.toData();
  }

  getTextNode(): ReactNode {
    const text =
      this.isFocused && this.editable
        ? this.processValue(this.getValue())
        : this.processRenderer(this.getValue());
    return text;
  }

  getText(value: any): string {
    return this.processValue(value);
  }

  processText(value: string): string {
    return value;
  }

  processRenderer(value?: any): ReactNode {
    const {
      record,
      dataSet,
      props: { renderer, onConfirm },
    } = this;
    const text = this.processText(this.getText(value));
    return renderer
      ? renderer({
        options: this.options,
        name: this.name,
        dataSet,
        onConfirm,
        record,
      })
      : text;
  }


  getScreeningOption = () => {
    const { colProps, optionRenderer } = this.props;
    const {
      options,
      textField,
      valueField,
      multiple,
    } = this;
    if (!options) {
      return null;
    }
    const { data } = options;

    if (!isEmpty(data)) {
      return data.map((record) => {
        const value = record.get(valueField);
        const text = record.get(textField);
        const key: Key = getItemKey(record, text, value);
        let isSelected: boolean = false;
        const valueRecord = this.processRecordToObject(record);
        const selectedValue = toJS(this.value)
        if (multiple) {
          if (selectedValue && selectedValue.length > 0) {
            isSelected = selectedValue.some(itemValue => {
              return isSame(itemValue, valueRecord)
            })
          }
        } else if (isSame(valueRecord, selectedValue)) {
          isSelected = true;
        }
        const textNode = (<span className={`${this.prefixCls}-option-text`}>{text}</span>)
        const screeningOptionProps = {
          ...colProps,
          onSelect: this.handleSelect,
          onDeselect: this.handleDeselect,
          onClick: this.handleClick,
          value: record,
          optionkey: key,
          multiple,
          isSelected,
          prefixCls: this.prefixCls,
          children: textNode,
        } as ScreeningOptionProps

        if (optionRenderer) {
          screeningOptionProps.optionRender = optionRenderer({ record, text, value })
        }

        return (
          <ScreeningOption key={key} {...screeningOptionProps} />
        )
      })
    }
    return null
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      name: props.name,
      record: 'record' in props ? props.record : context.record,
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      dataIndex: defaultTo(props.dataIndex, context.dataIndex),
      value: this.observableProps || 'value' in props ? props.value : props.defaultValue,
      primitiveValue: props.primitiveValue,
    };
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'record',
      'defaultValue',
      'dataIndex',
      'onEnterDown',
      'onClear',
      'readOnly',
      'renderer',
      'pristine',
      'primitiveValue',
      'trim',
      'onRef',
      'onConfirm',
      'colProps',
    ]);
    otherProps.onChange = !this.isDisabled() ? this.handleChange : noop;
    return otherProps;
  }

  getLabel() {
    return this.getProp('label');
  }

  @action
  handleMultiple = () => {
    this.screeningMultiple = !this.screeningMultiple
  }

  @action
  handleClear = () => {
    this.setValue(this.emptyValue);
    this.value = this.emptyValue;
    this.text = this.emptyValue;
  }

  handleCancel = () => {
    this.handleClear()
    this.handleMultiple()
  }



  render() {
    const { iconExpanded, prefixCls, multiple } = this;
    const { renderer, onConfirm } = this.props;
    const label = this.getLabel();
    const multipleButton = (
      <div className={`${prefixCls}-multiple`} onClick={this.handleMultiple} >
        <Icon type="add" />
        <span>{`${$l('Screening', 'multi_select')}`}</span>
      </div>
    )
    const expandButtonContainer = this.needExpandButton && (<div className={`${prefixCls}-expanded`} onClick={this.handleExpanedClick}>{expandedButton(iconExpanded)}</div>)
    const labelNode = (<span className={`${prefixCls}-label`}>{`${label}:`}</span>)
    const allClassName = classNames(
      {
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-more`]: iconExpanded,
      },
      this.getMergedClassNames(),
    )
    return (
      <div {...this.getMergedProps()} className={allClassName}>
        {
          renderer ? renderer(
            {
              options: this.options,
              name: this.name,
              dataSet: this.dataSet,
              onConfirm,
              record: this.record,
            },
          ) : (
              <>
                <div className={`${prefixCls}-title`}>{labelNode}</div>
                <div className={`${prefixCls}-content`}>
                  <div className={`${prefixCls}-scroll`}>
                    <Row>
                      {this.getScreeningOption()}
                    </Row>
                  </div>
                </div>
                {!this.multiple && (
                  <div className={`${prefixCls}-operation`} >
                    {expandButtonContainer}
                    {multipleButton}
                  </div>
                )}
                {this.multiple && (
                  <div className={`${prefixCls}-footer`}>
                    <ObserverButton onClick={this.handleConfirm}>{`${$l('Screening', 'confirm')}`}</ObserverButton>
                    <ObserverButton onClick={this.handleCancel}>{`${$l('Screening', 'cancel')}`}</ObserverButton>
                  </div>
                )}
              </>
            )
        }
      </div>
    );
  }
}
