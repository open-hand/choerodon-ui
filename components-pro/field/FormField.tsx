import React, { FormEventHandler, ReactInstance, ReactNode } from 'react';
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
import { getPrefixCls } from 'choerodon-ui/lib/configure';
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

const map: { [key: string]: FormField<FormFieldProps>[] } = {};

export type Renderer = (props: {
  value?: any;
  text?: any;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
}) => ReactNode;

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
    renderer: ({ text }) => text,
  };

  emptyValue?: any = null;

  validator: Validator = new Validator();

  @observable name?: string;

  @observable value?: any;

  @observable report?: boolean;

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

  constructor(props, context) {
    super(props, context);
    this.setName(props.name);
    runInAction(() => {
      this.value = props.defaultValue;
    });
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

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'record',
      'defaultValue',
      'dataIndex',
      'onEnterDown',
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
    const { showHelp } = this.props;
    const validationMessage = this.renderValidationMessage();
    return (
      <Tooltip
        title={validationMessage}
        theme="light"
        placement="bottomLeft"
        hidden={!!(this.multiple && this.getValues().length) || this.isValidationMessageHidden(validationMessage)}
      >
        {this.renderWrapper()}
        {showHelp !== ShowHelp.tooltip ? this.renderHelpMessage() : null}
      </Tooltip>
    );
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-invalid`]: !this.isValid,
      [`${prefixCls}-validation-report`]: this.report,
    }, ...args);
  }

  renderWrapper(): ReactNode {
    return;
  }

  renderHelpMessage(): ReactNode {
    const { help, showHelp } = this.props;
    if (showHelp === ShowHelp.none || !help) {
      return null;
    }
    if (showHelp === ShowHelp.tooltip) {
      return this.renderTooltipHelp();
    }
    return (
      <div className={`${getPrefixCls(FIELD_SUFFIX)}-help`}>{help}</div>
    );
  }

  renderTooltipHelp(): ReactNode {
    return null;
  }

  componentDidMount() {
    this.addToForm(this.props, this.context);
  }

  componentWillReceiveProps(nextProps: T, nextContext) {
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
        <div className={getPrefixCls('pro-validation-message')}>
          <Icon type="error" />
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
    if (!e.isDefaultPrevented()) {
      switch (e.keyCode) {
        case KeyCode.ENTER:
          this.handleEnterDown();
          onEnterDown(e);
          break;
        case KeyCode.ESC:
          this.blur();
          break;
        default:
      }
    }
    onKeyDown(e);
  }

  handleEnterDown() {
    this.blur();
  }

  handleMutipleValueRemove(value: any, e) {
    this.setValue(this.getValues().filter(v => v !== value));
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
    return this.isFocus ? text : this.processText(text);
  }

  processText(text?: any) {
    const { record, dataSet, props: { renderer, name } } = this;
    return renderer ? renderer({
      value: this.getValue(),
      text,
      record,
      dataSet,
      name,
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

  addValue(value): void {
    if (this.multiple) {
      const values = this.getValues();
      if (!isEmpty(value)) {
        this.setValue([...values, value]);
      } else if (!values.length) {
        this.setValue(value);
      }
    } else {
      this.setValue(value);
    }
  }

  setValue(value: any): void {
    if (!this.isReadOnly()) {
      if (this.multiple ? isArrayLike(value) && !value.length : isNil(value) || value === '') {
        value = this.emptyValue;
      }
      const { name, dataSet, dataIndex } = this;
      const { onChange = noop } = this.props;
      const { formNode } = this.context;
      const old = this.getOldValue();
      if (dataSet && name) {
        let { record } = this;
        if (!record) {
          record = dataSet.create({}, dataIndex);
        }
        if (record) {
          record.set(name, value);
        }
      } else {
        this.validate(value);
      }
      if (old !== value) {
        onChange(value, toJS(old), formNode);
      }
      runInAction(() => {
        this.value = value;
      });
    }
  }

  renderMultipleValues(readOnly?: boolean) {
    const { prefixCls } = this;
    const validationErrorValues = this.getValidationErrorValues();
    return this.getValues().map((v, index) => {
      const text = this.processText(this.processValue(v));
      if (!isNil(text)) {
        const validationResult = validationErrorValues.find(error => error.value === v);
        const disabled = this.isDisabled() || this.isReadOnly();
        const className = classNames({
          [`${prefixCls}-multiple-block-invalid`]: validationResult,
          [`${prefixCls}-multiple-block-disabled`]: disabled,
        }, `${prefixCls}-multiple-block`);
        const validationMessage = validationResult && this.renderValidationMessage(validationResult);
        const closeBtn = !disabled && <Icon type="close" onClick={this.handleMutipleValueRemove.bind(this, v)} />;
        const inner = readOnly ? <span className={className}>{text}</span> : (
          <li className={className}>
            <div>{text}</div>
            {closeBtn}
          </li>
        );
        return (
          <Tooltip
            key={index}
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
    this.setValue(null);
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

  async reportValidity(): Promise<boolean> {
    const valid = await this.checkValidity();
    if (!valid) {
      runInAction(() => {
        this.report = true;
      });
    }
    return valid;
  }

  isDisabled() {
    const { field, record } = this;
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
    runInAction(() => {
      this.report = false;
    });
  }

  getFieldType(): FieldType {
    const { field } = this;
    return field && field.get('type') || FieldType.string;
  }

  getProp(propName: string) {
    const { field } = this;
    return defaultTo(field && field.get(propName), this.props[propName]);
  }

  get dataSet(): DataSet | null | undefined {
    const { record } = this;
    if (record) {
      return record.dataSet;
    } else {
      return this.props.dataSet || this.context.dataSet;
    }
  }

  get dataIndex(): number | undefined {
    const { dataIndex } = this.props;
    return dataIndex === void 0 ? this.context.dataIndex : dataIndex;
  }

  get record(): Record | undefined {
    const { record, dataSet } = this.props;
    const { dataSet: contextDataSet, record: contextRecord } = this.context;
    const r = record || contextRecord;
    if (r) {
      return r;
    } else {
      const ds = dataSet || contextDataSet;
      if (ds) {
        const { dataIndex } = this;
        if (isNumber(dataIndex)) {
          return ds.get(dataIndex);
        } else {
          return ds.current;
        }
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
}

@observer
export default class ObserverFormField<T extends FormFieldProps> extends FormField<T & FormFieldProps> {
  static defaultProps = FormField.defaultProps;
}
