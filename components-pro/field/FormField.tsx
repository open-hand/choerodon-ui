import Map from 'core-js/library/fn/map';
import React, { cloneElement, FormEventHandler, isValidElement, ReactInstance, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import isLdEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import { isMoment, Moment } from 'moment';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import Row from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import { findBindFields } from '../data-set/utils';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import Validity from '../validator/Validity';
import FormContext from '../form/FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Form from '../form/Form';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import { FieldFormat, FieldTrim, FieldType, RecordStatus } from '../data-set/enum';
import ValidationResult from '../validator/ValidationResult';
import { ShowHelp } from './enum';
import { ValidatorProps } from '../validator/rules';
import { FIELD_SUFFIX } from '../form/utils';
import { LabelLayout } from '../form/enum';
import Animate from '../animate';
import CloseButton from './CloseButton';
import { fromRangeValue, getDateFormatByField, toMultipleValue, toRangeValue } from './utils';
import isSame from '../_util/isSame';
import formatString from '../formatter/formatString';
import formatCurrency from '../formatter/formatCurrency';

const map: { [key: string]: FormField<FormFieldProps>[]; } = {};

export type Comparator = (v1: any, v2: any) => boolean;

export type RenderProps = {
  value?: any;
  text?: string;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
  repeat?: number;
  maxTagTextLength?: number;
  multiLineFields?: Field[];
};

export type Renderer = (props: RenderProps) => ReactNode;

export function getFieldsById(id): FormField<FormFieldProps>[] {
  if (!map[id]) {
    map[id] = [];
  }
  return map[id];
}

export interface FormFieldProps extends DataSetComponentProps {
  /**
   * 内部属性,标记该组件是否位于table中,适用于CheckBox以及switch等组件
   */
  _inTable?: boolean,
  /**
   * 标签名
   */
  label?: string | ReactNode;
  /**
   * 标签布局
   */
  labelLayout?: LabelLayout;
  /**
   * 标签宽度
   */
  labelWidth?: number;
  /**
   * 字段名
   */
  name?: string;
  /**
   * <受控>当前值
   */
  value?: any;
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 是否必输
   */
  required?: boolean;
  /**
   * 是否只读
   */
  readOnly?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 对照表单id
   */
  form?: string;
  /**
   * 对照record在DataSet中的index
   * @default dataSet.currentIndex
   */
  dataIndex?: number;
  /**
   * 对照record
   * 优先级高于dataSet和dataIndex
   */
  record?: Record;
  /**
   * 是否是多值
   * @default false
   */
  multiple?: boolean;
  /**
   * 是否是范围值
   * @default false
   */
  range?: boolean | [string, string];
  /**
   * 校验器
   */
  validator?: CustomValidator;
  /**
   * 不校验
   */
  noValidate?: boolean;
  /**
   * 额外信息，常用作提示
   *
   * @type {string}
   * @memberof FormFieldProps
   */
  help?: string;
  /**
   * 另起新行
   */
  newLine?: boolean;
  /**
   * 显示提示信息的方式
   *
   * @type {ShowHelp}
   * @memberof FormFieldProps
   */
  showHelp?: ShowHelp;
  /**
   * 渲染器
   */
  renderer?: Renderer;
  /**
   * 校验信息渲染器
   */
  validationRenderer?: (result: ValidationResult, props: ValidatorProps) => ReactNode;
  /**
   * 多值标签超出最大数量时的占位描述
   */
  maxTagPlaceholder?: ReactNode | ((omittedValues: any[]) => ReactNode);
  /**
   * 多值标签最大数量
   */
  maxTagCount?: number;
  /**
   * 多值标签文案最大长度
   */
  maxTagTextLength?: number;
  /**
   * 显示原始值
   */
  pristine?: boolean;
  /**
   * 字符串值是否去掉首尾空格
   * 可选值: both left right none
   * @default: both
   */
  trim?: FieldTrim;
  /**
   * 日期格式，如 `YYYY-MM-DD HH:mm:ss`
   * 字符串格式，如 `uppcase` `lowercase` `capitalize`
   */
  format?: string | FieldFormat;
  /**
   * 校验失败回调
   */
  onInvalid?: (validationResults: ValidationResult[], validity: Validity, name?: string) => void;
  /**
   * 值变化回调
   */
  onChange?: (value: any, oldValue: any, form?: ReactInstance) => void;
  /**
   * 输入回调
   */
  onInput?: FormEventHandler<any>;
  /**
   * 键盘回车回调
   */
  onEnterDown?: FormEventHandler<any>;
  /**
   * 值清空回调
   */
  onClear?: () => void;
  /**
   * 字段 td 类名传递 支持个性化隐藏字段
   */
  fieldClassName?: string;
  /**
   * 阻止使用渲染器
   */
  preventRenderer?: boolean;
}

export class FormField<T extends FormFieldProps> extends DataSetComponent<T> {
  static contextType = FormContext;

  static propTypes = {
    _inTable: PropTypes.bool,
    type: PropTypes.string,
    /**
     * 字段名
     */
    name: PropTypes.string,
    /**
     * <受控>当前值
     */
    value: PropTypes.any,
    /**
     * 默认值
     */
    defaultValue: PropTypes.any,
    /**
     * 是否必输
     */
    required: PropTypes.bool,
    /**
     * 是否只读
     */
    readOnly: PropTypes.bool,
    /**
     * 对照表单id
     */
    form: PropTypes.string,
    /**
     * 对照record在DataSet中的index
     * @default dataSet.currentIndex
     */
    dataIndex: PropTypes.number,
    /**
     * 是否是多值
     * @default false
     */
    multiple: PropTypes.bool,
    /**
     * 表单下控件跨越的行数
     */
    rowSpan: PropTypes.number,
    /**
     * 另起新行
     */
    newLine: PropTypes.bool,
    /**
     * 表单下控件跨越的列数
     */
    colSpan: PropTypes.number,
    /**
     * 校验器
     * (value: any, name?: string, form?: ReactInstance) => string | boolean | Promise<string | boolean>
     */
    validator: PropTypes.func,
    /**
     * 校验失败回调
     * (validationMessage: ReactNode, validity: Validity, name?: string) => void
     */
    onInvalid: PropTypes.func,
    /**
     * 额外信息，常用作提示
     */
    help: PropTypes.string,
    /**
     * 显示提示信息的方式
     */
    showHelp: PropTypes.oneOf([ShowHelp.tooltip, ShowHelp.newLine, ShowHelp.none]),
    /**
     * 渲染器
     */
    renderer: PropTypes.func,
    /**
     * 校验信息渲染器
     */
    validationRenderer: PropTypes.func,
    /**
     * 多值标签超出最大数量时的占位描述
     */
    maxTagPlaceholder: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 多值标签最大数量
     */
    maxTagCount: PropTypes.number,
    /**
     * 多值标签文案最大长度
     */
    maxTagTextLength: PropTypes.number,
    /**
     * 显示原始值
     */
    pristine: PropTypes.bool,
    /**
     * 字符串值是否去掉首尾空格
     * 可选值: both left right none
     * @default: both
     */
    trim: PropTypes.oneOf([FieldTrim.both, FieldTrim.left, FieldTrim.right, FieldTrim.none]),
    /**
     * 值变化回调
     * (value: any, oldValue: any, form?: ReactInstance) => void
     */
    onChange: PropTypes.func,
    /**
     * 输入回调
     */
    onInput: PropTypes.func,
    /**
     * 键盘回车回调
     */
    onEnterDown: PropTypes.func,
    /**
     * 键盘回车回调
     */
    fieldClassName: PropTypes.string,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    readOnly: false,
    disabled: false,
    noValidate: false,
    showHelp: 'newLine',
    trim: FieldTrim.both,
  };

  emptyValue?: any = null;

  lock: boolean = false;

  // 多选中出现了校验值的数量大于一那么输入框不需要存在校验信息展示
  mutipleValidateMessageLength: number = 0;

  @observable rangeTarget?: 0 | 1;

  @observable rangeValue?: [any, any] | undefined;

  @computed
  get validator(): Validator {
    const { field } = this;
    if (field) {
      if (!field.get('defaultValidationMessages')) {
        field.validator.props.defaultValidationMessages = this.getValidatorProps().defaultValidationMessages;
      }
      return field.validator;
    }
    return new Validator(undefined, this);
  }

  @computed
  get name(): string | undefined {
    return this.observableProps.name;
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

  get labelLayout() {
    return this.props.labelLayout || this.context.labelLayout;
  }

  get hasFloatLabel(): boolean {
    const { labelLayout } = this;
    return labelLayout === LabelLayout.float;
  }

  get isControlled(): boolean {
    return this.props.value !== undefined;
  }

  get pristine(): boolean {
    return this.props.pristine || this.context.pristine;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages {
    return {};
  }

  // @computed
  get editable(): boolean {
    return !this.isDisabled() && !this.isReadOnly();
  }

  @computed
  get dataSet(): DataSet | undefined {
    const { record } = this;
    if (record) {
      return record.dataSet;
    }
    return this.observableProps.dataSet;
  }

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

  @computed
  get isValid(): boolean {
    return this.pristine || (this.field ? this.field.valid : this.validator.validity.valid);
  }

  @computed
  get multiple(): boolean {
    return this.getProp('multiple');
  }

  /**
   * 获取字段多行属性
   */
  @computed
  get multiLine(): boolean {
    return this.getProp('multiLine');
  }

  /**
   * 获取字段货币属性
   */
  @computed
  get currency(): string {
    return this.getProp('currency');
  }

  @computed
  get trim(): FieldTrim | undefined {
    return this.getProp('trim');
  }

  @computed
  get format(): FieldFormat | string | undefined {
    return this.getProp('format');
  }

  @computed
  get range(): boolean | [string, string] {
    return this.getProp('range');
  }

  @autobind
  defaultRenderer({ text, repeat, maxTagTextLength }: RenderProps): ReactNode {
    return repeat !== undefined &&
    maxTagTextLength &&
    isString(text) &&
    text.length > maxTagTextLength
      ? `${text.slice(0, maxTagTextLength)}...`
      : text;
  }

  /**
   * 处理多行关联字段校验
   * @param field
   */
  multiLineValidator(field): Validator {
    if (field) {
      if (!field.get('defaultValidationMessages')) {
        field.validator.props.defaultValidationMessages = this.getValidatorProps().defaultValidationMessages;
      }
      return field.validator;
    }
    return new Validator(undefined, this);
  }

  /**
   * 判断是否应该显示验证信息, 作为属性传给Tooltip
   *
   * @readonly
   * @type {(undefined | boolean)}
   * @memberof FormField
   */
  isValidationMessageHidden(message?: ReactNode): undefined | boolean {
    const { hidden, noValidate } = this.props;
    if (hidden || this.pristine || (!this.record && noValidate) || !message) {
      return true;
    }
  }

  isEmpty() {
    const value = this.getValue();
    return isArrayLike(value) ? !value.length : isEmpty(value);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      name: props.name,
      record: 'record' in props ? props.record : context.record,
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      dataIndex: defaultTo(props.dataIndex, context.dataIndex),
      value: 'value' in props ? props.value : this.observableProps ? this.observableProps.value : props.defaultValue,
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
      'validator',
      'validationRenderer',
      'help',
      'showHelp',
      'renderer',
      'maxTagPlaceholder',
      'maxTagCount',
      'maxTagTextLength',
      'rowIndex',
      'colIndex',
      'labelLayout',
      '_inTable',
      'labelWidth',
      'pristine',
      'range',
      'trim',
      'newLine',
      'fieldClassName',
      'preventRenderer',
    ]);
    otherProps.onChange = !this.isDisabled() && !this.isReadOnly() ? this.handleChange : noop;
    otherProps.onKeyDown = this.handleKeyDown;
    otherProps.onCompositionStart = this.handleCompositionStart;
    otherProps.onCompositionEnd = this.handleChange;
    return otherProps;
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-invalid`]: !this.isValid,
        [`${prefixCls}-float-label`]: this.hasFloatLabel,
        [`${prefixCls}-required`]: this.getProp('required'),
        [`${prefixCls}-readonly`]: this.getProp('readOnly'),
      },
      ...args,
    );
  }

  renderWrapper(): ReactNode {
    return undefined;
  }

  renderHelpMessage(): ReactNode {
    const { showHelp } = this.props;
    const help = this.getProp('help');
    if (showHelp === ShowHelp.newLine && help) {
      return (
        <div key="help" className={`${getProPrefixCls(FIELD_SUFFIX)}-help`}>
          {help}
        </div>
      );
    }
  }

  getLabel() {
    return this.getProp('label');
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const label = this.getLabel();
      if (label) {
        const prefixCls = getProPrefixCls(FIELD_SUFFIX);
        const required = this.getProp('required');
        const readOnly = this.getProp('readOnly');
        const classString = classNames(`${prefixCls}-label`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-readonly`]: readOnly,
        });
        return (
          <div className={`${prefixCls}-label-wrapper`}>
            <div className={classString}>{label}</div>
          </div>
        );
      }
    }
  }

  componentDidMount() {
    this.addToForm(this.props, this.context);
  }

  componentWillReceiveProps(nextProps: T, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    this.removeFromForm(this.props, this.context);
    this.addToForm(nextProps, nextContext);
    if (!this.record && this.props.value !== nextProps.value) {
      this.validate(nextProps.value);
    }
  }

  componentWillUnmount() {
    this.removeFromForm(this.props, this.context);
  }

  addToForm(props, context) {
    const { form } = props;
    const { formNode } = context;
    if (form) {
      let fields = map[form];
      if (!fields) {
        fields = [];
        map[form] = fields;
      }
      fields.push(this);
    } else if (formNode) {
      formNode.addField(this);
    }
  }

  removeFromForm(props, context) {
    const { form } = props;
    const { formNode } = context;
    if (form) {
      const fields = map[form];
      if (fields) {
        const index = fields.indexOf(this);
        if (index !== -1) {
          fields.splice(index, 1);
        }
      }
    } else if (formNode) {
      formNode.removeField(this);
    }
  }

  renderValidationMessage(validationResult?: ValidationResult): ReactNode {
    const validationMessage = this.getValidationMessage(validationResult);
    if (validationMessage) {
      return (
        <div className={getProPrefixCls('validation-message')}>
          {this.context.labelLayout !== LabelLayout.float && <Icon type="error" />}
          <span>{validationMessage}</span>
        </div>
      );
    }
  }

  getValidatorProps(): ValidatorProps {
    const { name, range, multiple, defaultValidationMessages } = this;
    const type = this.getFieldType();
    const required = this.getProp('required');
    const customValidator = this.getProp('validator');
    const label = this.getProp('label');
    return {
      type,
      required,
      customValidator,
      name,
      label,
      range,
      multiple,
      defaultValidationMessages,
      form: this.context.formNode as Form,
    };
  }

  getValidationMessage(
    validationResult: ValidationResult | undefined = this.validator.currentValidationResult,
  ): ReactNode {
    const {
      validator,
      props: { validationRenderer },
    } = this;
    if (validationResult) {
      if (validationRenderer) {
        const validationMessage = validationRenderer(validationResult, validator.props);
        if (validationMessage) {
          return validationMessage;
        }
      }
      return validationResult.validationMessage;
    }
  }

  @autobind
  handleFocus(e) {
    super.handleFocus(e);
    if (this.range) {
      this.beginRange();
    }
  }

  @autobind
  handleBlur(e) {
    super.handleBlur(e);
    if (this.range) {
      this.endRange();
    }
  }

  @autobind
  handleCompositionStart() {
    this.lock = true;
  }

  @autobind
  handleChange(e) {
    this.lock = false;
    e.preventDefault();
    e.stopPropagation();
  }

  @autobind
  handleKeyDown(e) {
    const { onKeyDown = noop, onEnterDown = noop } = this.props;
    onKeyDown(e);
    if (!e.isDefaultPrevented()) {
      switch (e.keyCode) {
        case KeyCode.ENTER:
          this.handleEnterDown(e);
          onEnterDown(e);
          break;
        case KeyCode.ESC:
          this.blur();
          break;
        default:
      }
    }
  }

  handleEnterDown(e) {
    if (this.multiple) {
      if (this.range) {
        this.endRange();
        e.preventDefault();
      } else {
        const { value } = e.target;
        if (value !== '') {
          this.syncValueOnBlur(value);
          e.preventDefault();
        }
      }
    } else {
      this.blur();
    }
  }

  syncValueOnBlur(value) {
    this.prepareSetValue(value);
  }

  @autobind
  handleMutipleValueRemove(e, value: any, index: number) {
    this.removeValue(value, index);
    e.stopPropagation();
  }

  getDateFormat(field: Field | undefined = this.field): string {
    return getDateFormatByField(field, this.getFieldType(field));
  }

  processValue(value: any): string {
    if (!isNil(value)) {
      if (isMoment(value)) {
        return (value as Moment).format(this.getDateFormat());
      }
      if (isValidElement(value)) {
        // For Select's Option and TreeSelect's TreeNode which type may be ReactElement
        // @ts-ignore
        return value;
      }
      return value.toString();
    }
    return '';
  }

  isReadOnly(): boolean {
    const { readOnly } = this.context;
    return (
      readOnly ||
      (this.getProp('readOnly') as boolean) ||
      this.pristine ||
      (this.isControlled && !this.props.onChange && !this.props.onInput)
    );
  }

  getDataSetValue(): any {
    const { record, pristine, name } = this;
    if (record) {
      return pristine ? record.getPristineValue(name) : record.get(name);
    }
  }

  getTextNode(): ReactNode {
    const { preventRenderer } = this.props;
    const text =
      this.editable && (preventRenderer || this.isFocused)
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

  processRenderer(value?: any, repeat?: number): ReactNode {
    const {
      field,
      record,
      dataSet,
      props: { renderer = this.defaultRenderer, name, maxTagTextLength },
    } = this;
    let processValue;
    if (field && (field.lookup || field.options)) {
      processValue = field.getText(value) as string;
    }
    // 值集中不存在 再去取直接返回的值
    const text = this.processText(isNil(processValue) ? this.getText(value) : processValue);
    return renderer
      ? renderer({
        value,
        text,
        record,
        dataSet,
        name,
        repeat,
        maxTagTextLength,
      })
      : text;
  }

  processRangeValue(value?: any, repeat?: number): [any, any] {
    if (repeat === undefined) {
      value = this.rangeValue;
    }
    if (value === undefined && !this.multiple) {
      value = toRangeValue(this.getValue(), this.range);
    }
    return (value || []).map(item => this.processRenderer(item, repeat)) as [any, any];
  }

  getOldValue(): any {
    return this.getValue();
  }

  getValue(): any {
    const { name } = this;
    if (this.dataSet && name) {
      return this.getDataSetValue();
    }
    return this.value;
  }

  getValues(): any[] {
    return toMultipleValue(this.getValue(), this.range);
  }

  addValue(...values) {
    if (this.multiple) {
      const oldValues = this.getValues();
      if (values.length) {
        this.setValue([...new Set([...oldValues, ...values])]);
      } else if (!oldValues.length) {
        this.setValue(this.emptyValue);
      }
    } else {
      this.setValue(values.pop());
    }
  }

  isLowerRange(_value1: any, _value2: any): boolean {
    return false;
  }

  @action
  prepareSetValue(...value: any[]): void {
    const { rangeTarget, range, rangeValue } = this;
    const values = value.filter(item => isNumber(item) || !isEmpty(item));
    if (range) {
      if (rangeTarget !== undefined && rangeValue) {
        const [start, end] = rangeValue;
        const newValue = values.pop();
        rangeValue[rangeTarget] = newValue;
        if (rangeTarget === 0 && (newValue || isNumber(newValue)) && (end || isNumber(end)) && this.isLowerRange(end, newValue)) {
          rangeValue[rangeTarget] = end;
          rangeValue[1] = newValue;
        }
        if (rangeTarget === 1 && (newValue || isNumber(newValue)) && (start || isNumber(start)) && this.isLowerRange(newValue, start)) {
          rangeValue[rangeTarget] = start;
          rangeValue[0] = newValue;
        }
      }
    } else {
      this.addValue(...values);
    }
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

  removeValue(value: any, index: number = 0) {
    this.removeValues([value], index);
  }

  afterRemoveValue(_value, _repeat: number) {
  }

  @action
  beginRange() {
    this.setRangeTarget(this.rangeTarget || 0);
    this.rangeValue = this.multiple
      ? [undefined, undefined]
      : toRangeValue(this.getValue(), this.range);
  }

  @action
  endRange() {
    if (this.rangeValue) {
      const values = this.rangeValue.slice();
      this.rangeValue = undefined;
      if (!this.multiple || !values.every(isNil)) {
        this.addValue(fromRangeValue(values, this.range));
      }
    }
  }

  @action
  setRangeTarget(target?: 0 | 1) {
    this.rangeTarget = target;
  }

  @action
  setValue(value: any): void {
    if (!this.isReadOnly()) {
      if (
        this.multiple || this.range
          ? isArrayLike(value) && !value.length
          : isNil(value) || value === ''
      ) {
        value = this.emptyValue;
      }
      const {
        name,
        dataSet,
        trim,
        format,
        observableProps: { dataIndex },
      } = this;
      const { onChange = noop } = this.props;
      const { formNode } = this.context;
      const old = this.getOldValue();
      if (dataSet && name) {
        (this.record || dataSet.create({}, dataIndex)).set(name, value);
      } else {
        value = formatString(value, {
          trim,
          format,
        });
        this.validate(value);
      }
      // 转成实际的数据再进行判断
      if (!isSame(toJS(old), toJS(value))) {
        onChange(value, toJS(old), formNode);
      }
      this.value = value;
    }
  }

  renderRangeValue(readOnly?: boolean, value?: any, repeat?: number): ReactNode {
    const rangeValue = this.processRangeValue(value, repeat);
    if (readOnly) {
      if (rangeValue.length) {
        return (
          <>
            {rangeValue[0]}~{rangeValue[1]}
          </>
        );
      }
    }
  }


  /**
   * 渲染货币格式化
   * @param readOnly
   */
  renderCurrency(readOnly?: boolean): ReactNode {
    const {
      currency,
      lang,
      props: { renderer },
    } = this;
    if (renderer) {
      return this.getTextNode();
    }
    if (readOnly) {
      const formatOptions = {
        currency,
      };
      const value = this.getValue();
      return formatCurrency(value, lang, formatOptions);
    }
  }

  /**
   * 只读模式下多行单元格渲染
   * @param readOnly
   */
  renderMultiLine(readOnly?: boolean): ReactNode {
    const {
      name,
      record,
      field,
      dataSet,
      prefixCls,
      props: { renderer },
    } = this;
    const multiLineFields = findBindFields(field as Field, record!.fields, true);
    if (renderer) {
      return renderer({
        multiLineFields,
        record,
        dataSet,
        name,
      });
    }
    if (readOnly) {
      if (multiLineFields.length) {
        this.mutipleValidateMessageLength = 0;
        return (
          <>
            {multiLineFields.map(fieldItem => {
              if (fieldItem) {
                const { validationResults } = this.multiLineValidator(fieldItem);
                const required = defaultTo(fieldItem && fieldItem.get('required'), this.props.required);
                const repeats: Map<any, number> = new Map<any, number>();
                const validationResult = validationResults.find(error => error.value === record?.get(fieldItem.get('name')));
                const validationMessage =
                  validationResult && this.renderValidationMessage(validationResult);
                const key = this.getValueKey(record?.get(fieldItem.get('name')));
                const repeat = repeats.get(key) || 0;
                const validationHidden = this.isValidationMessageHidden(validationMessage);
                let processValue = '';
                if (fieldItem && fieldItem.get('lovCode')) {
                  if (!isNil(fieldItem.getValue())) {
                    if (isPlainObject(fieldItem.getValue())) {
                      processValue = ObjectChainValue.get(fieldItem.getValue(), fieldItem.get('textField') || 'meaning');
                    }
                  }
                }
                // 值集中不存在 再去取直接返回的值
                const text = this.processText(processValue || this.getText(record?.get(fieldItem.get('name'))));
                this.mutipleValidateMessageLength++;
                const inner = record?.status === RecordStatus.add ? '' :
                  <span className={`${prefixCls}-multi-value-invalid`}>{text}</span>;
                const validationInner = validationHidden ? inner : (
                  <Tooltip
                    suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
                    key={`${key}-${repeat}`}
                    title={validationMessage}
                    theme="light"
                    placement="bottomLeft"
                    hidden={validationHidden}
                  >
                    {validationMessage}
                  </Tooltip>
                );
                const label = fieldItem.get('label');
                return (
                  <Row key={`${record?.index}-multi-${fieldItem.get('name')}`} className={`${prefixCls}-multi`}>
                    {label && (
                      <Col
                        span={8}
                        className={required ? `${prefixCls}-multi-label ${prefixCls}-multi-label-required` : `${prefixCls}-multi-label`}
                      >
                        {fieldItem.get('label')}
                      </Col>
                    )}
                    <Col
                      span={label ? 16 : 24}
                      className={
                        validationHidden ?
                          `${prefixCls}-multi-value` :
                          `${prefixCls}-multi-value ${prefixCls}-multi-value-invalid`
                      }
                    >
                      {record?.get(fieldItem.get('name')) ?
                        (
                          <Tooltip
                            suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
                            key={`${key}-${repeat}`}
                            title={validationMessage}
                            theme="light"
                            placement="bottomLeft"
                            hidden={validationHidden}
                          >
                            {text}
                          </Tooltip>
                        ) : validationInner
                      }
                    </Col>
                  </Row>
                );
              }
              return null;
            })}
          </>
        );
      }
    }
  }

  getValueKey(v: any) {
    if (isArrayLike(v)) {
      return v.join(',');
    }
    return v;
  }

  isMultipleBlockDisabled(_v): boolean {
    return this.isDisabled();
  }

  renderMultipleValues(readOnly?: boolean) {
    const values = this.getValues();
    const valueLength = values.length;
    const {
      prefixCls,
      range,
      props: { maxTagCount = valueLength, maxTagPlaceholder },
    } = this;
    const { validationResults } = this.validator;
    const repeats: Map<any, number> = new Map<any, number>();
    const blockClassName = classNames(
      {
        [`${prefixCls}-multiple-block-disabled`]: this.isDisabled(),
      },
      `${prefixCls}-multiple-block`,
    );
    this.mutipleValidateMessageLength = 0;
    const tags = values.slice(0, maxTagCount).map((v, index) => {
      const key = this.getValueKey(v);
      const repeat = repeats.get(key) || 0;
      const text = range ? this.renderRangeValue(true, v, repeat) : this.processRenderer(v, repeat);
      repeats.set(key, repeat + 1);
      if (!isNil(text)) {
        const validationResult = validationResults.find(error => error.value === v);
        const disabled = this.isMultipleBlockDisabled(v);
        const className = classNames(
          {
            [`${prefixCls}-multiple-block-invalid`]: validationResult,
            [`${prefixCls}-multiple-block-disabled`]: disabled,
          },
          `${prefixCls}-multiple-block`,
        );
        const validationMessage =
          validationResult && this.renderValidationMessage(validationResult);
        if (validationMessage) {
          this.mutipleValidateMessageLength++;
        }
        const closeBtn = !disabled && !this.isReadOnly() && (
          <CloseButton onClose={this.handleMutipleValueRemove} value={v} index={repeat} />
        );
        const inner = readOnly ? (
          <span className={className}>{text}</span>
        ) : (
          <li className={className}>
            <div>{text}</div>
            {closeBtn}
          </li>
        );
        return (
          <Tooltip
            suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
            key={String(index)}
            title={validationMessage}
            theme="light"
            placement="bottomLeft"
            hidden={this.isValidationMessageHidden(validationMessage)}
          >
            {inner}
          </Tooltip>
        );
      }
      return undefined;
    });

    if (valueLength > maxTagCount) {
      let content: ReactNode = `+ ${valueLength - maxTagCount} ...`;
      if (maxTagPlaceholder) {
        const omittedValues = values.slice(maxTagCount, valueLength);
        content =
          typeof maxTagPlaceholder === 'function'
            ? maxTagPlaceholder(omittedValues)
            : maxTagPlaceholder;
      }
      tags.push(
        <li key="maxTagPlaceholder" className={blockClassName}>
          <div>{content}</div>
        </li>,
      );
    }

    return tags;
  }

  @action
  clear() {
    const { onClear = noop } = this.props;
    this.setValue(this.emptyValue);
    this.rangeValue = this.isFocused ? [undefined, undefined] : undefined;
    onClear();
  }

  async checkValidity(): Promise<boolean> {
    const { name } = this;
    const valid = await this.validate();
    const { onInvalid = noop } = this.props;
    if (!valid) {
      const { validationResults, validity } = this.validator;
      onInvalid(validationResults, validity, name);
    }
    return valid;
  }

  async validate(value?: any): Promise<boolean> {
    let invalid = false;
    if (!this.props.noValidate) {
      if (value === undefined) {
        value = this.multiple ? this.getValues() : this.getValue();
      }
      const { validator } = this;
      validator.reset();
      invalid = !(await validator.checkValidity(value));
    }
    return !invalid;
  }

  isDisabled(): boolean {
    const { disabled } = this.context;
    if (disabled || this.getProp('disabled')) {
      return true;
    }
    const { field, record } = this;
    if (field) {
      const cascadeMap = field.get('cascadeMap');
      if (
        cascadeMap &&
        (!record || Object.keys(cascadeMap).some(cascade => {
          if (isObject(record.get(cascadeMap[cascade]))) {
            return isLdEmpty(record.get(cascadeMap[cascade]));
          }
          return isNil(record.get(cascadeMap[cascade]));
        }))
      ) {
        return true;
      }
    }
    return super.isDisabled();
  }

  @autobind
  reset() {
    if (!this.isControlled && !this.dataSet) {
      this.setValue(this.props.defaultValue);
    }
    this.validator.reset();
  }

  getFieldType(field: Field | undefined = this.field): FieldType {
    return (field && field.get('type')) || FieldType.string;
  }

  getProp(propName: string) {
    const { field, observableProps } = this;
    return defaultTo(field && field.get(propName), propName in observableProps ? observableProps[propName] : this.props[propName]);
  }

  render() {
    const validationMessage = this.renderValidationMessage();
    const wrapper = this.renderWrapper();
    const help = this.renderHelpMessage();
    const { _inTable } = this.props;
    /**
     * 用户自定义校验存在的话说明用户保证校验情况那么多选这些应该存在校验信息
     * If the user-defined verification exists, it means that the user guarantees
     * that the verification situation is so many. These should have verification information
     */
    const customValidator = this.getProp('validator');
    return this.hasFloatLabel ? (
        [
          isValidElement(wrapper) && cloneElement(wrapper, { key: 'wrapper' }),
          <Animate transitionName="show-error" component="" transitionAppear key="validation-message">
            {validationMessage}
          </Animate>,
          help,
        ]
      ) :
      _inTable ?
        <>
          {wrapper}
          {help}
        </>
        : (
          <Tooltip
            suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
            title={
              (!!(this.multiple && this.getValues().length) && !customValidator || this.mutipleValidateMessageLength > 0) ||
              this.isValidationMessageHidden(validationMessage)
                ? null
                : validationMessage
            }
            theme="light"
            placement="bottomLeft"
          >
            {wrapper}
            {help}
          </Tooltip>
        );
  }
}

@observer
export default class ObserverFormField<T extends FormFieldProps> extends FormField<T & FormFieldProps> {
  static defaultProps = FormField.defaultProps;
}
