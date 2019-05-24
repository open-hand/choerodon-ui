import Map from 'core-js/library/fn/map';
import React, { cloneElement, FormEventHandler, isValidElement, ReactInstance, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import defaultTo from 'lodash/defaultTo';
import { isMoment, Moment } from 'moment';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import { getDateFormatByField } from '../data-set/utils';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import Validity from '../validator/Validity';
import FormContext from '../form/FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Form from '../form/Form';
import isEmpty from '../_util/isEmpty';
import { FieldType } from '../data-set/enum';
import ValidationResult from '../validator/ValidationResult';
import { ShowHelp } from './enum';
import { ValidatorProps } from '../validator/rules';
import { FIELD_SUFFIX } from '../form/utils';
import { LabelLayout } from '../form/enum';
import Animate from '../animate';
import CloseButton from './CloseButton';

const map: { [key: string]: FormField<FormFieldProps>[] } = {};

export type RenderProps = {
  value?: any;
  text?: any;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
  repeat?: number;
}

export type Renderer = (props: RenderProps) => ReactNode;

export function getFieldsById(id): FormField<FormFieldProps>[] {
  if (!map[id]) {
    map[id] = [];
  }
  return map[id];
}

export interface FormFieldProps extends DataSetComponentProps {
  /**
   * 标签名
   */
  label?: string;
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
  multiple?: boolean,
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
}

export class FormField<T extends FormFieldProps> extends DataSetComponent<T> {

  static contextType = FormContext;

  static propTypes = {
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
     * 表单下控件跨越的列数
     */
    colSpan: PropTypes.number,
    /**
     * 校验器
     * (value: any, name?: string, form?: ReactInstance) => string | boolean | Promise<string | boolean>
     */
    validator: PropTypes.func,
    /**
     * 校验提示渲染器
     * (validationMessage: string, validity: Validity, name?: string) => ReactNode
     */
    validationRenderer: PropTypes.func,
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
    showHelp: PropTypes.oneOf([
      ShowHelp.tooltip,
      ShowHelp.newLine,
      ShowHelp.none,
    ]),
    renderer: PropTypes.func,
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
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    readOnly: false,
    noValidate: false,
    showHelp: 'newLine',
  };

  emptyValue?: any = null;

  validator: Validator = new Validator();

  @observable name?: string;

  @observable value?: any;

  get hasFloatLabel(): boolean {
    const { labelLayout } = this.context;
    const { label } = this.props;
    return labelLayout === LabelLayout.float && !!label;
  }

  get isControlled(): boolean {
    return this.props.value !== void 0;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    return null;
  }

  @computed
  get editable(): boolean {
    return !this.isReadOnly();
  }

  @computed
  get dataSet(): DataSet | undefined {
    const { record } = this;
    if (record) {
      return record.dataSet;
    } else {
      return this.observableProps.dataSet;
    }
  }

  @computed
  get record(): Record | undefined {
    const { record, dataSet, dataIndex } = this.observableProps;
    if (record) {
      return record;
    } else if (dataSet) {
      if (isNumber(dataIndex)) {
        return dataSet.get(dataIndex);
      } else {
        return dataSet.current;
      }
    }
  }

  @computed
  get field(): Field | undefined {
    const { record, dataSet, name } = this;
    const { displayName } = this.constructor as any;
    warning(dataSet && displayName !== 'Output' ? !!name : true, `${displayName} with binding DataSet need property name.`);
    if (name) {
      const recordField = record ? record.getField(name) : void 0;
      const dsField = dataSet ? dataSet.getField(name) : void 0;
      if (recordField) {
        return recordField;
      } else {
        return dsField;
      }
    }
  }

  constructor(props, context) {
    super(props, context);
    this.setName(props.name);
    runInAction(() => {
      this.value = props.defaultValue;
    });
  }

  @autobind
  defaultRenderer({ text }: RenderProps) {
    return text;
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
    if (hidden || (!this.record && noValidate) || !message) {
      return true;
    }
  }

  isEmpty() {
    const value = this.getValue();
    return isArrayLike(value) ? !value.length : isEmpty(value);
  }

  getObservableProps(props, context) {
    return {
      record: props.record || context.record,
      dataSet: props.dataSet || context.dataSet,
      dataIndex: defaultTo(props.dataIndex, context.dataIndex),
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
    ]);
    if (!this.isDisabled() && !this.isReadOnly()) {
      otherProps.onChange = this.handleChange;
    }
    otherProps.onKeyDown = this.handleKeyDown;
    return otherProps;
  }

  render() {
    const validationMessage = this.renderValidationMessage();
    const wrapper = this.renderWrapper();
    const help = this.renderHelpMessage();
    return this.hasFloatLabel ? [
      isValidElement(wrapper) && cloneElement(wrapper, { key: 'wrapper' }),
      <Animate
        transitionName="show-error"
        component=""
        transitionAppear
        key="validation-message"
      >
        {validationMessage}
      </Animate>,
      help,
    ] : (
      <Tooltip
        title={validationMessage}
        theme="light"
        placement="bottomLeft"
        hidden={!!(this.multiple && this.getValues().length) || this.isValidationMessageHidden(validationMessage)}
      >
        {wrapper}
        {help}
      </Tooltip>
    );
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-invalid`]: !this.isValid,
      [`${prefixCls}-has-label`]: this.hasFloatLabel,
      [`${prefixCls}-required`]: this.getProp('required'),
    }, ...args);
  }

  renderWrapper(): ReactNode {
    return;
  }

  renderHelpMessage(): ReactNode {
    const { showHelp } = this.props;
    const help = this.getProp('help');
    if (showHelp === ShowHelp.newLine && help) {
      return (
        <div key="help" className={`${getProPrefixCls(FIELD_SUFFIX)}-help`}>{help}</div>
      );
    }
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const prefixCls = getProPrefixCls(FIELD_SUFFIX);
      const required = this.getProp('required');
      const classString = classNames(`${prefixCls}-label`, {
        [`${prefixCls}-required`]: required,
      });
      return <div className={classString}>{this.props.label}</div>;
    }
  }

  renderUnderLine(): ReactNode {
    if (this.hasFloatLabel) {
      const { prefixCls } = this;
      return (
        <div className={`${prefixCls}-underline`}>
          <span className={`${prefixCls}-ripple`} />
        </div>
      );
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
    this.setName(nextProps.name);
  }

  @action
  setName(name) {
    this.name = name;
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
        map[form] = fields = [];
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
    const { name } = this;
    const type = this.getFieldType();
    const required = this.getProp('required');
    const customValidator = this.getProp('validator');
    return {
      type,
      required,
      customValidator,
      name,
      form: this.context.formNode as Form,
    };
  }

  @computed
  get isValid(): boolean {
    const { field } = this;
    if (field) {
      return field.isValid();
    } else {
      return this.validator.validity.valid;
    }
  }

  @computed
  get multiple(): boolean {
    return this.getProp('multiple');
  }

  getValidityState(): Validity {
    const { field } = this;
    if (field) {
      return field.getValidityState();
    } else {
      return this.validator.validity;
    }
  }

  getValidationMessage(validationResult?: ValidationResult): string | undefined {
    const { field, defaultValidationMessages } = this;
    if (defaultValidationMessages) {
      const fieldValidity = this.getValidityState();
      const found = Object.keys(defaultValidationMessages).find(key => validationResult ? validationResult.ruleName === key : fieldValidity[key]);
      if (found) {
        return defaultValidationMessages[found];
      }
    }
    if (validationResult) {
      return validationResult.validationMessage;
    }
    if (field) {
      return field.getValidationMessage();
    }
    return this.validator.validationMessage;
  }

  getValidationErrorValues(): any[] {
    const { field } = this;
    if (field) {
      return field.getValidationErrorValues();
    } else {
      return this.validator.validationErrorValues;
    }
  }

  @autobind
  handleChange(e) {
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
      const { value } = e.target;
      if (value !== '') {
        this.addValue(value);
        e.preventDefault();
      }
    } else {
      this.blur();
    }
  }

  @autobind
  handleMutipleValueRemove(e, value: any, index: number) {
    this.removeValue(value, index);
    e.stopPropagation();
  }

  getDateFormat() {
    return getDateFormatByField(this.field, this.getFieldType());
  }

  processValue(value: any): any {
    if (!isNil(value)) {
      if (isMoment(value)) {
        return (value as Moment).format(this.getDateFormat());
      }
      return value;
    }
    return '';
  }

  isReadOnly(): boolean {
    return this.getProp('readOnly') as boolean || (this.isControlled && !this.props.onChange);
  }

  getDataSetValue(): any {
    const { record } = this;
    if (record) {
      return record.get(this.name);
    }
  }

  getText(): ReactNode {
    const text = this.processValue(this.getValue());
    return this.isFocused && this.editable ? text : this.processText(text);
  }

  processText(text?: any, value: any = this.getValue(), repeat?: number) {
    const { record, dataSet, props: { renderer = this.defaultRenderer, name } } = this;
    return renderer ? renderer({
      value,
      text,
      record,
      dataSet,
      name,
      repeat,
    }) : text;
  }

  getOldValue(): any {
    return this.getValue();
  }

  getValue(): any {
    const { name } = this;
    const { value } = this.props;
    if (this.dataSet && name) {
      return this.getDataSetValue();
    } else if (value !== void 0) {
      return value;
    } else {
      return this.value;
    }
  }

  getValues(): any[] {
    const old = this.getValue();
    return isEmpty(old) ? [] : isArrayLike(old) ? old.slice() : [old];
  }

  addValues(values: any[]): void {
    if (this.multiple) {
      const oldValues = this.getValues();
      if (values.length) {
        this.setValue([...oldValues, ...values]);
      } else if (!oldValues.length) {
        this.setValue(null);
      }
    } else {
      this.setValue(values[values.length - 1]);
    }
  }

  addValue(value): void {
    this.addValues(isEmpty(value) ? [] : [value]);
  }

  removeValues(values: any[], index: number = 0) {
    let repeat: number;
    this.setValue(values.reduce((oldValues, value) => (repeat = 0, oldValues.filter((v) => {
      if (v === value) {
        if (repeat === index) {
          this.afterRemoveValue(value, repeat);
          repeat += 1;
          return false;
        }
        repeat += 1;
      }
      return true;
    })), this.getValues()));
  }

  removeValue(value: any, index: number = 0) {
    this.removeValues([value], index);
  }

  afterRemoveValue(_value, _repeat: number) {
  }

  @action
  setValue(value: any): void {
    if (!this.isReadOnly()) {
      if (this.multiple ? isArrayLike(value) && !value.length : isNil(value) || value === '') {
        value = this.emptyValue;
      }
      const { name, dataSet, observableProps: { dataIndex } } = this;
      const { onChange = noop } = this.props;
      const { formNode } = this.context;
      const old = this.getOldValue();
      if (dataSet && name) {
        (this.record || dataSet.create({}, dataIndex)).set(name, value);
      } else {
        this.validate(value);
      }
      if (old !== value) {
        onChange(value, toJS(old), formNode);
      }
      this.value = value;
    }
  }

  renderMultipleValues(readOnly?: boolean) {
    const { prefixCls } = this;
    const validationErrorValues = this.getValidationErrorValues();
    const repeats: Map<any, number> = new Map<any, number>();
    return this.getValues().map((v) => {
      const repeat = repeats.get(v) || 0;
      const text = this.processText(this.processValue(v), v, repeat);
      repeats.set(v, repeat + 1);
      if (!isNil(text)) {
        const validationResult = validationErrorValues.find(error => error.value === v);
        const disabled = this.isDisabled() || this.isReadOnly();
        const className = classNames({
          [`${prefixCls}-multiple-block-invalid`]: validationResult,
          [`${prefixCls}-multiple-block-disabled`]: disabled,
        }, `${prefixCls}-multiple-block`);
        const validationMessage = validationResult && this.renderValidationMessage(validationResult);
        const closeBtn = !disabled && <CloseButton onClose={this.handleMutipleValueRemove} value={v} index={repeat} />;
        const inner = readOnly ? <span className={className}>{text}</span> : (
          <li className={className}>
            <div>{text}</div>
            {closeBtn}
          </li>
        );
        return (
          <Tooltip
            key={`${v}-${text}-${repeat}`}
            title={validationMessage}
            theme="light"
            placement="bottomLeft"
            hidden={this.isValidationMessageHidden(validationMessage)}
          >
            {inner}
          </Tooltip>
        );
      }
    });
  }

  clear() {
    const { onClear = noop } = this.props;
    this.setValue(this.emptyValue);
    onClear();
  }

  async checkValidity(): Promise<boolean> {
    const { field, name } = this;
    let valid;
    if (field) {
      valid = await field.checkValidity();
    } else {
      valid = await this.validate();
    }
    const { onInvalid = noop } = this.props;
    if (!valid) {
      onInvalid(this.getValidationErrorValues(), this.getValidityState(), name);
    }
    return valid;
  }

  async validate(value?: any): Promise<boolean> {
    let invalid = false;
    if (!this.props.noValidate) {
      if (value === void 0) {
        value = this.multiple ? this.getValues() : this.getValue();
      }
      const { validator } = this;
      validator.reset();
      validator.setProps(this.getValidatorProps());
      invalid = !await validator.checkValidity(value);
    }
    return !invalid;
  }

  isDisabled() {
    const { disabled } = this.context;
    const { field, record } = this;
    if (disabled) {
      return disabled;
    }
    if (field) {
      const cascadeMap = field.get('cascadeMap');
      if (cascadeMap && (!record || Object.keys(cascadeMap).some(cascade => !record.get(cascadeMap[cascade])))) {
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

  getFieldType(): FieldType {
    const { field } = this;
    return field && field.get('type') || FieldType.string;
  }

  getProp(propName: string) {
    const { field } = this;
    return defaultTo(field && field.get(propName), this.props[propName]);
  }
}

@observer
export default class ObserverFormField<T extends FormFieldProps> extends FormField<T & FormFieldProps> {
  static defaultProps = FormField.defaultProps;
}
