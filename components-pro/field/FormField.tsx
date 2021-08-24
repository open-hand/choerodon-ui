import React, { cloneElement, FormEventHandler, isValidElement, ReactInstance, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import isPromise from 'is-promise';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import isLdEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import uniqWith from 'lodash/uniqWith';
import isFunction from 'lodash/isFunction';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { getTooltip, getTooltipTheme } from 'choerodon-ui/lib/_util/TooltipUtils';
import { Tooltip as TextTooltip } from '../core/enum';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field, { HighlightProps } from '../data-set/Field';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import Validity from '../validator/Validity';
import FormContext from '../form/FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import Form from '../form/Form';
import isEmpty from '../_util/isEmpty';
import { FieldFormat, FieldTrim, FieldType } from '../data-set/enum';
import ValidationResult from '../validator/ValidationResult';
import { ShowHelp } from './enum';
import { ValidatorProps } from '../validator/rules';
import { FIELD_SUFFIX } from '../form/utils';
import { LabelLayout, ShowValidation } from '../form/enum';
import Animate from '../animate';
import {
  defaultRenderer,
  fromRangeValue,
  getDateFormatByField,
  getValueKey,
  isFieldValueEmpty,
  processValue,
  renderMultipleValues,
  renderRangeValue,
  renderValidationMessage,
  showValidationMessage,
  toMultipleValue,
  toRangeValue,
  transformHighlightProps,
} from './utils';
import isSame from '../_util/isSame';
import formatString from '../formatter/formatString';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';

const map: { [key: string]: FormField<FormFieldProps>[]; } = {};

export type Comparator = (v1: any, v2: any) => boolean;

export type RenderProps = {
  value?: any;
  text?: ReactNode;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
  repeat?: number;
  maxTagTextLength?: number;
  multiLineFields?: Field[];
};

export type Renderer<T extends RenderProps = RenderProps> = (props: T) => ReactNode;

export type HighlightRenderer = (highlightProps: HighlightProps, element: ReactNode) => ReactNode;

export function getFieldsById(id): FormField<FormFieldProps>[] {
  if (!map[id]) {
    map[id] = [];
  }
  return map[id];
}

export interface FormFieldProps<V = any> extends DataSetComponentProps {
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
   * 用tooltip显示标签内容
   * 可选值：`none` `always` `overflow`
   */
  labelTooltip?: TextTooltip;
  tooltip?: TextTooltip;
  /**
   * 是否使用冒号
   */
  useColon?: boolean;
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
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
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
   * 值变化前回调
   */
  onBeforeChange?: (value: any, oldValue: any, form?: ReactInstance) => boolean | Promise<boolean>;
  /**
   * 值变化回调
   */
  onChange?: (value: V, oldValue: V, form?: ReactInstance) => void;
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
  /**
   * 高亮
   */
  highlight?: boolean | ReactNode | HighlightProps;
  /**
   * 高亮渲染器
   */
  highlightRenderer?: HighlightRenderer;
  /**
   * 值变化前，拦截并返回新的值
   */
  processValue?: (value: any, range?: 0 | 1) => any;
}

export class FormField<T extends FormFieldProps = FormFieldProps> extends DataSetComponent<T> {
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
     * 值变化前回调
     * (value: any, oldValue: any) => boolean
     */
    onBeforeChange: PropTypes.func,
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
    /**
     * 高亮
     */
    highlight: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    /**
     * 高亮渲染器
     */
    highlightRenderer: PropTypes.func,
    /**
     * 是否使用冒号
     */
    useColon: PropTypes.bool,
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

  lock?: boolean;

  tooltipShown?: boolean;

  // 多选中出现了校验值的数量大于一那么输入框不需要存在校验信息展示
  multipleValidateMessageLength: number = 0;

  @observable floatLabelOffsetX?: number;

  @observable rangeTarget?: 0 | 1;

  @observable rangeValue?: [any, any] | undefined;

  @observable $validator?: Validator | undefined;

  get validator(): Validator | undefined {
    const { field } = this;
    if (field) {
      return field.validator;
    }
    return this.$validator;
  }

  get name(): string | undefined {
    return this.observableProps.name;
  }

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

  get labelTooltip() {
    return this.props.labelTooltip || this.context.labelTooltip || getTooltip('label');
  }

  get hasFloatLabel(): boolean {
    const { labelLayout } = this;
    return labelLayout === LabelLayout.float;
  }

  get isControlled(): boolean {
    return this.getControlled(this.props);
  }

  get pristine(): boolean {
    return this.observableProps.pristine;
  }

  get defaultValidationMessages(): ValidationMessages {
    return {};
  }

  @computed
  get editable(): boolean {
    return this.isEditable();
  }

  @computed
  get dataSet(): DataSet | undefined {
    const { record } = this;
    if (record) {
      return record.dataSet;
    }
    const { observableProps } = this;
    if ('dataSet' in observableProps) {
      return observableProps.dataSet;
    }
    return observableProps.contextDataSet;
  }

  @computed
  get record(): Record | undefined {
    const { observableProps } = this;
    if ('record' in observableProps) {
      return observableProps.record;
    }
    const { dataSet, dataIndex } = observableProps;
    if (dataSet) {
      if (isNumber(dataIndex)) {
        return dataSet.get(dataIndex);
      }
      return dataSet.current;
    }
    if (isNumber(dataIndex)) {
      const { contextDataSet } = observableProps;
      if (contextDataSet) {
        return contextDataSet.get(dataIndex);
      }
    }
    return observableProps.contextRecord;
  }

  @computed
  get dataIndex(): number | undefined {
    const { dataIndex, contextDataIndex } = this.observableProps;
    return defaultTo(dataIndex, contextDataIndex);
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
      if (recordField) {
        return recordField;
      }
      if (dataSet) {
        return dataSet.getField(name);
      }
    }
    return undefined;
  }

  @computed
  get isValid(): boolean {
    if (this.pristine) {
      return true;
    }
    const { field } = this;
    if (field) {
      return field.valid;
    }
    const { validator } = this;
    return validator ? validator.validity.valid : true;
  }

  get multiple(): boolean {
    return this.getProp('multiple');
  }

  /**
   * 获取字段货币属性
   */
  get currency(): string {
    return this.getProp('currency');
  }

  get trim(): FieldTrim | undefined {
    return this.getProp('trim');
  }

  get format(): FieldFormat | string | undefined {
    return this.getProp('format');
  }

  get range(): boolean | [string, string] {
    return this.getProp('range');
  }

  @computed
  get readOnly(): boolean {
    return this.isReadOnly();
  }

  get highlight(): boolean | ReactNode {
    return this.getProp('highlight');
  }

  @computed
  get highlightRenderer(): HighlightRenderer {
    const { highlightRenderer = getConfig('highlightRenderer') } = this.observableProps;
    return highlightRenderer;
  }

  getControlled(props): boolean {
    return props.value !== undefined;
  }

  @autobind
  defaultRenderer(renderProps: RenderProps): ReactNode {
    return defaultRenderer(renderProps);
  }

  /**
   * 判断是否应该显示验证信息, 作为属性传给Tooltip
   *
   * @readonly
   * @type {(undefined | boolean)}
   * @memberof FormField
   */
  @autobind
  isValidationMessageHidden(message?: ReactNode): boolean {
    const { hidden, noValidate } = this.props;
    return !!(hidden || !message || this.pristine || (!this.record && noValidate));
  }

  isEmpty() {
    const { field } = this;
    const value = this.getValue();
    return isFieldValueEmpty(value, this.range, field?.get('valueField'));
  }

  isReadOnly(): boolean {
    const { readOnly } = this.observableProps;
    if (readOnly || this.pristine) {
      return true;
    }
    const { field } = this;
    return field ? field.get('readOnly') : false;
  }

  isEditable() {
    return !this.disabled && !this.readOnly;
  }

  getObservablePropsExcludeOutput(props, context): object | undefined {
    return {
      readOnly: context.readOnly || props.readOnly || (this.getControlled(props) && !props.onChange && !props.onInput),
    };
  }

  getObservableProps(props, context) {
    const observableProps: any = {
      ...super.getObservableProps(props, context),
      ...this.getObservablePropsExcludeOutput(props, context),
      label: props.label,
      name: props.name,
      contextDataSet: context.dataSet,
      contextRecord: context.record,
      dataIndex: props.dataIndex,
      contextDataIndex: context.dataIndex,
      value: 'value' in props ? props.value : this.observableProps ? this.observableProps.value : props.defaultValue,
      disabled: context.disabled || props.disabled,
      pristine: context.pristine || props.pristine,
      highlight: props.highlight,
      highlightRenderer: 'highlightRenderer' in props ? props.highlightRenderer : context.fieldHighlightRenderer,
    };
    if ('record' in props) {
      observableProps.record = props.record;
    }
    return observableProps;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'record',
      'defaultValue',
      'dataIndex',
      'onEnterDown',
      'onClear',
      'onBeforeChange',
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
      'highlight',
      'highlightRenderer',
      'labelTooltip',
      'isFlat',
      'useColon',
    ]);
  }

  getOtherPropsExcludeOutput(otherProps) {
    otherProps.onChange = !this.disabled && !this.readOnly ? this.handleChange : noop;
    otherProps.onKeyDown = this.handleKeyDown;
    otherProps.onCompositionStart = this.handleCompositionStart;
    otherProps.onCompositionEnd = this.handleChange;
    return otherProps;
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.onMouseEnter = this.handleMouseEnter;
    otherProps.onMouseLeave = this.handleMouseLeave;
    return this.getOtherPropsExcludeOutput(otherProps);
  }

  getWrapperClassNamesExcludeOutput(prefixCls, empty): object | undefined {
    return {
      [`${prefixCls}-empty`]: empty,
      [`${prefixCls}-readonly`]: this.readOnly,
    };
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    const required = this.getProp('required');
    const empty = this.isEmpty();
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-highlight`]: this.highlight,
        [`${prefixCls}-invalid`]: !this.isValid,
        [`${prefixCls}-float-label`]: this.hasFloatLabel,
        [`${prefixCls}-required`]: required,
        [`${prefixCls}-required-colors`]: required && (empty || !getConfig('showRequiredColorsOnlyEmpty')),
      },
      this.getWrapperClassNamesExcludeOutput(prefixCls, empty),
      ...args,
    );
  }

  renderWrapper(): ReactNode {
    return undefined;
  }

  renderHelpMessage(): ReactNode {
    const { showHelp } = this.props;
    if (showHelp === ShowHelp.newLine) {
      const help = this.getProp('help');
      if (help) {
        return (
          <div key="help" className={`${getProPrefixCls(FIELD_SUFFIX)}-help`}>
            {help}
          </div>
        );
      }
    }
  }

  getLabel() {
    return this.getProp('label');
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const label = this.getLabel();
      if (label) {
        const { labelTooltip, floatLabelOffsetX } = this;
        const prefixCls = getProPrefixCls(FIELD_SUFFIX);
        const required = this.getProp('required');
        const classString = classNames(`${prefixCls}-label`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-readonly`]: this.readOnly,
        });
        const style = floatLabelOffsetX ? {
          marginLeft: floatLabelOffsetX,
        } : undefined;
        return (
          <div className={`${prefixCls}-label-wrapper`} style={style}>
            <div
              className={classString}
              title={isString(label) && ![TextTooltip.always, TextTooltip.overflow].includes(labelTooltip) ? label : undefined}
              onMouseEnter={this.handleFloatLabelMouseEnter}
              onMouseLeave={this.handleFloatLabelMouseLeave}
            >
              {toJS(label)}
            </div>
          </div>
        );
      }
    }
  }

  componentDidMount() {
    super.componentDidMount();
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
    if (this.tooltipShown) {
      hide();
      this.tooltipShown = false;
    }
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

  @autobind
  renderValidationResult(validationResult?: ValidationResult): ReactNode {
    const validationMessage = this.getValidationMessage(validationResult);
    const { labelLayout, showValidation } = this.context;
    if (validationMessage) {
      const showIcon = !(labelLayout === LabelLayout.float || showValidation === ShowValidation.newLine);
      return renderValidationMessage(validationMessage, showIcon);
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

  getValidationMessage(validationResult: ValidationResult | undefined): ReactNode {
    const { validator } = this;
    if (validator) {
      if (validationResult === undefined && validator) {
        validationResult = validator.currentValidationResult;
      }
      const {
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
  }

  showTooltip(e): boolean {
    const { showValidation } = this.context;
    if (!this.hasFloatLabel && showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message);
        return true;
      }
    }
    return false;
  }

  @autobind
  handleMouseEnter(e) {
    if (this.showTooltip(e)) {
      this.tooltipShown = true;
    }
    const { onMouseEnter = noop } = this.props;
    onMouseEnter(e);
  }

  @autobind
  handleMouseLeave(e) {
    if (this.tooltipShown) {
      hide();
      this.tooltipShown = false;
    }
    const { onMouseLeave = noop } = this.props;
    onMouseLeave(e);
  }

  @autobind
  handleFloatLabelMouseEnter(e) {
    const { labelTooltip } = this;
    const { currentTarget } = e;
    if (labelTooltip === TextTooltip.always || (labelTooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, {
        title: this.getLabel(),
        placement: 'top',
        theme: getTooltipTheme('label'),
      });
    }
  }

  handleFloatLabelMouseLeave() {
    hide();
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
    if (this.range && this.isEditable()) {
      this.endRange();
    }
  }

  @autobind
  handleCompositionStart() {
    this.lock = true;
  }

  @autobind
  handleChange(e) {
    delete this.lock;
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

  processValue(value: any): ReactNode {
    return processValue(value, this.getDateFormat());
  }

  getDataSetValue(): any {
    const { record, pristine, name } = this;
    if (record) {
      return pristine ? record.getPristineValue(name) : record.get(name);
    }
  }

  getTextNode(value: any = this.getValue()): ReactNode {
    return this.getTextByValue(value);
  }

  getTextByValue(value: any): ReactNode {
    const { preventRenderer } = this.props;
    const text =
      this.editable && (preventRenderer || this.isFocused)
        ? this.processValue(value)
        : this.processRenderer(value);
    return text;
  }

  getText(value: any): ReactNode {
    return this.processValue(value);
  }

  processText(value: ReactNode): ReactNode {
    return value;
  }

  @autobind
  processRenderer(value?: any, repeat?: number): ReactNode {
    const {
      field,
      record,
      dataSet,
      props: { renderer = this.defaultRenderer, name, maxTagTextLength },
    } = this;
    let processedValue;
    if (field && (field.lookup || field.get('options') || field.get('lovCode'))) {
      processedValue = field.getText(value) as string;
    }
    // 值集中不存在 再去取直接返回的值
    const text = this.processText(isNil(processedValue) ? this.processValue(value) : processedValue);
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
    return value || [];
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
        this.setValue(uniqWith([...oldValues, ...values], this.compare));
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
    const processV = this.getProp('processValue');
    const { range } = this;
    let values = value.filter(item => isNumber(item) || !isEmpty(item));
    if (range) {
      const { rangeTarget, rangeValue } = this;
      if (rangeTarget !== undefined && rangeValue) {
        const [start, end] = rangeValue;
        let newValue = values.pop();
        if (isFunction(processV)) {
          newValue = processV(newValue, rangeTarget);
        }
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
      if (isFunction(processV)) {
        values = values.map(v => processV(v, undefined));
      }
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

  @autobind
  compare(oldValue, newValue) {
    return isSame(toJS(oldValue), toJS(newValue));
  }

  @action
  setValue(value: any): void {
    if (!this.readOnly) {
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
        dataIndex,
      } = this;
      const { onChange = noop, onBeforeChange = noop } = this.props;
      const old = toJS(this.getOldValue());
      if (!dataSet || !name) {
        value = formatString(value, {
          trim,
          format,
        });
      }
      const updateAndValidate = () => {
        if (dataSet && name) {
          const { record = dataSet.create({}, dataIndex) } = this;
          const { field } = this;
          if (field && !field.get('defaultValidationMessages')) {
            field.set('defaultValidationMessages', this.defaultValidationMessages);
          }
          record.set(name, value);
        } else {
          this.validate(value, false);
        }
      };
      // 转成实际的数据再进行判断
      if (!this.compare(old, toJS(value))) {
        const { formNode } = this.context;
        const storedValue = this.value;
        const beforeChange = onBeforeChange(value, old, formNode);
        const resolveCallback = action(() => {
          updateAndValidate();
          onChange(value, old, formNode);
          this.afterSetValue();
        });
        if (isPromise<boolean>(beforeChange)) {
          this.value = value;
          const rejectCallback = () => {
            this.value = storedValue;
          };
          beforeChange.then(result => result === false ? rejectCallback() : resolveCallback());
        } else if (beforeChange !== false) {
          resolveCallback();
          this.value = value;
        }
      } else {
        updateAndValidate();
      }
    }
  }

  afterSetValue() {
  }

  renderRangeValue(value: any, repeat?: number): ReactNode {
    return renderRangeValue(value, { repeat, processRenderer: this.processRenderer });
  }

  getValueKey(v: any) {
    return getValueKey(v);
  }

  @autobind
  isMultipleBlockDisabled(_v): boolean {
    return this.disabled;
  }

  renderMultipleValues(readOnly?: boolean) {
    const {
      prefixCls,
      range,
      disabled,
      validator,
      props: { maxTagCount, maxTagPlaceholder },
    } = this;
    const values = renderMultipleValues(this.getValue(), {
      range,
      maxTagCount,
      maxTagPlaceholder,
      prefixCls,
      disabled,
      readOnly: this.readOnly || readOnly,
      validator,
      isMultipleBlockDisabled: this.isMultipleBlockDisabled,
      processRenderer: this.processRenderer,
      renderValidationResult: this.renderValidationResult,
      handleMutipleValueRemove: this.handleMutipleValueRemove,
      isValidationMessageHidden: this.isValidationMessageHidden,
      showValidationMessage,
      getKey: this.getValueKey,
    });
    this.multipleValidateMessageLength = values.multipleValidateMessageLength;
    return values.tags;
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
      const { validator } = this;
      if (validator) {
        const { validationResults, validity } = validator;
        onInvalid(validationResults, validity, name);
      }
    }
    return valid;
  }

  @action
  validate(value?: any, report: boolean = true): Promise<boolean> {
    if (!this.props.noValidate) {
      if (value === undefined) {
        value = this.multiple ? this.getValues() : this.getValue();
      }
      let { validator } = this;
      if (validator) {
        validator.reset();
      } else {
        const { field } = this;
        if (field) {
          validator = new Validator(field);
          field.validator = validator;
        } else {
          validator = new Validator(undefined, this);
          this.$validator = validator;
        }
      }
      return validator.checkValidity(value).then((valid) => {
        if (report) {
          const { formNode } = this.context;
          if (formNode && !formNode.validating) {
            formNode.reportValidity(valid);
          }
        }
        return valid;
      });
    }
    return Promise.resolve(true);
  }

  isDisabled(): boolean {
    if (super.isDisabled()) {
      return true;
    }
    const { field } = this;
    if (field) {
      const disabled = field.get('disabled');
      if (disabled) {
        return true;
      }
      const cascadeMap = field.get('cascadeMap');
      const { record } = this;
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
    return false;
  }

  @autobind
  reset() {
    if (!this.isControlled && !this.dataSet) {
      this.setValue(this.props.defaultValue);
    }
    const { validator } = this;
    if (validator) {
      validator.reset();
    }
  }

  getFieldType(field: Field | undefined = this.field): FieldType {
    return (field && field.get('type')) || FieldType.string;
  }

  getProp(propName: string) {
    const { field, observableProps } = this;
    return defaultTo(field && field.get(propName), propName in observableProps ? observableProps[propName] : this.props[propName]);
  }

  @autobind
  getTooltipValidationMessage(): ReactNode {
    const { _inTable } = this.props;
    if (!_inTable && !(!!(this.multiple && this.getValues().length) && !this.getProp('validator') || this.multipleValidateMessageLength > 0)) {
      const validationMessage = this.renderValidationResult();
      if (!this.isValidationMessageHidden(validationMessage)) {
        return validationMessage;
      }
    }
  }

  renderHighLight() {
    const wrapper = this.renderWrapper();
    const { highlight, dataSet, record, name } = this;
    if (highlight) {
      const { showValidation } = this.context;
      const hidden = !(this.hasFloatLabel || showValidation === ShowValidation.newLine || this.isValid);
      const highlightWrapper = this.highlightRenderer(transformHighlightProps(highlight, { dataSet, record, name, hidden }), wrapper);
      if (isValidElement(highlightWrapper)) {
        return highlightWrapper;
      }
    }
    return wrapper;
  }

  render() {
    const wrapper = this.renderHighLight();
    const help = this.renderHelpMessage();
    const { showValidation } = this.context;
    if (this.hasFloatLabel || showValidation === ShowValidation.newLine) {
      const message = this.renderValidationResult();
      return [
        isValidElement(wrapper) ? cloneElement(wrapper, { key: 'wrapper' }) : wrapper,
        message && (
          <Animate transitionName="show-error" component="" transitionAppear key="validation-message">
            {message}
          </Animate>
        ),
        help,
      ];
    }
    return (
      <>
        {wrapper}
        {help}
      </>
    );
  }
}

@observer
export default class ObserverFormField<T extends FormFieldProps> extends FormField<T & FormFieldProps> {
  static defaultProps = FormField.defaultProps;
}
