import React, { cloneElement, FormEventHandler, isValidElement, ReactInstance, ReactNode } from 'react';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import isPromise from 'is-promise';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isLdEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import uniqWith from 'lodash/uniqWith';
import isFunction from 'lodash/isFunction';
import findLastIndex from 'lodash/findLastIndex';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import warning from 'choerodon-ui/lib/_util/warning';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Tooltip as TextTooltip } from '../core/enum';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field, { HighlightProps } from '../data-set/Field';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import Validity from '../validator/Validity';
import FormContext, { FormContextValue } from '../form/FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import Form from '../form/Form';
import isEmpty from '../_util/isEmpty';
import { FieldFormat, FieldTrim, FieldType } from '../data-set/enum';
import ValidationResult from '../validator/ValidationResult';
import { ShowHelp } from './enum';
import { ValidatorBaseProps, ValidatorProps } from '../validator/rules';
import { FIELD_SUFFIX } from '../form/utils';
import { LabelLayout, RequiredMarkAlign, ShowValidation } from '../form/enum';
import Animate from '../animate';
import {
  defaultRenderer,
  fromRangeValue,
  getDateFormatByField,
  getValueKey,
  isFieldValueEmpty,
  processValue,
  ProcessValueOptions,
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
import { TooltipProps } from '../tooltip/Tooltip';
import isOverflow from '../overflow-tip/util';

const map: { [key: string]: FormField<FormFieldProps>[] } = {};

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

export type TagRendererProps = {
  value?: any;
  text?: any;
  key?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onClose?: (e: any) => void;
  inputBoxIsFocus?: boolean;
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
  _inTable?: boolean;
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
   * 设置标签是否换行显示
   */
  labelWordBreak?: boolean;
  /**
   * 用tooltip显示标签内容
   * 可选值：`none` `always` `overflow`
   * 扩展 tooltip 属性：tooltip={['always', { theme: 'light', ... }]}
   */
  labelTooltip?: TextTooltip | [TextTooltip, TooltipProps];
  /**
   * 是否使用冒号
   */
  useColon?: boolean;
   /**
   * 必输星号位置
   */
   requiredMarkAlign?: RequiredMarkAlign;
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
   * @type {ReactNode}
   * @memberof FormFieldProps
   */
  help?: ReactNode;
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
  helpTooltipProps?: TooltipProps;
  showValidation?: ShowValidation;
  /**
   * 渲染器
   */
  renderer?: Renderer;
  /**
   * 校验信息渲染器
   */
  validationRenderer?: (result: ValidationResult, props: ValidatorProps) => ReactNode;
  /**
   * 多值 Tag 渲染器
   */
  tagRenderer?: (props: TagRendererProps) => ReactNode;
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
   * 多值超过 maxTagCount 时是否显示 tooltip，或者设置自定义内容
   * @default true;
   */
  overMaxTagCountTooltip?: boolean | ((options: { title: string, record?: Record }) => ReactNode);
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
  colSpan?: number;
  rowSpan?: number;
}

export class FormField<T extends FormFieldProps = FormFieldProps> extends DataSetComponent<T, FormContextValue> {
  static get contextType(): typeof FormContext {
    return FormContext;
  }

  static defaultProps = {
    readOnly: false,
    disabled: false,
    noValidate: false,
    trim: FieldTrim.both,
    overMaxTagCountTooltip: true,
  };

  emptyValue?: any = null;

  lock?: boolean;

  tooltipShown?: boolean;

  // 多选中出现了校验值的数量大于一那么输入框不需要存在校验信息展示
  multipleValidateMessageLength = 0;

  @observable floatLabelOffsetX?: number;

  @observable rangeTarget?: 0 | 1;

  @observable rangeValue?: [any, any] | undefined;

  @observable $validator?: Validator | undefined;

  @observable validationResults?: ValidationResult[] | undefined;

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

  get labelLayout(): LabelLayout | undefined {
    return this.props.labelLayout || this.context.labelLayout;
  }

  get labelTooltip(): TextTooltip | [TextTooltip, TooltipProps] | undefined {
    return this.props.labelTooltip || this.context.labelTooltip || this.context.getTooltip('label');
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
    const { dataSet, name, observableProps } = this;
    const { displayName } = this.constructor as any;
    if (displayName !== 'Output' && !name) {
      warning(!observableProps.dataSet, `${displayName} with binding DataSet need property name.`);
      warning(!observableProps.record, `${displayName} with binding Record need property name.`);
    }
    if (name) {
      // const recordField = record ? record.getField(name) : undefined;
      // if (recordField) {
      //   return recordField;
      // }
      if (dataSet) {
        return dataSet.getField(name);
      }
    }
    return undefined;
  }

  @computed
  get valid(): boolean {
    return this.isValid();
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
    const { field, observableProps, record } = this;
    if (field) {
      return field && field.get('range', record);
    }
    return 'range' in observableProps ? observableProps('range') : this.props.range;
  }

  @computed
  get readOnly(): boolean {
    return this.isReadOnly();
  }

  get highlight(): boolean | ReactNode {
    return this.getDisplayProp('highlight');
  }

  @computed
  get showValidation(): ShowValidation {
    const { showValidation = this.getContextConfig('showValidation') } = this.observableProps;
    return showValidation;
  }

  @computed
  get showHelp(): ShowHelp {
    const { showHelp = this.getContextConfig('showHelp') } = this.observableProps;
    return showHelp;
  }

  get helpTooltipProps(): TooltipProps {
    const { helpTooltipProps } = this.observableProps;
    return helpTooltipProps;
  }

  @computed
  get highlightRenderer(): HighlightRenderer {
    const { highlightRenderer = this.getContextConfig('highlightRenderer') } = this.observableProps;
    return highlightRenderer;
  }

  get rangeSeparator(): string {
    const rangeSeparator = this.getContextConfig('rangeSeparator');
    return rangeSeparator || '~';
  }

  /**
   * blur 时特殊需要执行 endRange
   */
  get doEndRange(): boolean {
    return false;
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

  @autobind
  showValidationMessage(e, message?: ReactNode) {
    showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'), this.getContextConfig);
  }

  isEmpty() {
    const value = this.getValue();
    return isFieldValueEmpty(value, this.range, this.multiple);
  }

  isValid() {
    if (this.pristine) {
      return true;
    }
    const { field } = this;
    if (field) {
      return field.isValid(this.record);
    }
    const { validationResults } = this;
    if (validationResults) {
      return !validationResults.length;
    }
    return true;
  }

  isReadOnly(): boolean {
    const { readOnly } = this.observableProps;
    if (readOnly || this.pristine) {
      return true;
    }
    const { field } = this;
    return field ? field.get('readOnly', this.record) : false;
  }

  isEditable() {
    return !this.disabled && !this.readOnly;
  }

  isEditableLike(): boolean {
    return false;
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
      showValidation: 'showValidation' in props ? props.showValidation : context.showValidation,
      showHelp: 'showHelp' in props ? props.showHelp : context.showHelp,
      helpTooltipProps: props.helpTooltipProps,
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
      'helpTooltipProps',
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
      'requiredMarkAlign',
      'showValidation',
      'tagRenderer',
      'labelWordBreak',
      'overMaxTagCountTooltip',
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
        [`${prefixCls}-invalid`]: !this.valid,
        [`${prefixCls}-float-label`]: this.hasFloatLabel,
        [`${prefixCls}-required`]: required,
        [`${prefixCls}-required-colors`]: required && (empty || !this.getContextConfig('showRequiredColorsOnlyEmpty')),
      },
      this.getWrapperClassNamesExcludeOutput(prefixCls, empty),
      ...args,
    );
  }

  renderWrapper(): ReactNode {
    return undefined;
  }

  renderHelpMessage(): ReactNode {
    const { showHelp } = this;
    if (showHelp === ShowHelp.newLine) {
      const help = this.getDisplayProp('help');
      if (help) {
        return (
          <div key="help" className={`${this.getContextProPrefixCls(FIELD_SUFFIX)}-help`}>
            {help}
          </div>
        );
      }
    }
  }

  getLabel() {
    return toJS(this.getDisplayProp('label'));
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const label = this.getLabel();
      if (label) {
        const { floatLabelOffsetX } = this;
        const prefixCls = this.getContextProPrefixCls(FIELD_SUFFIX);
        const required = this.getProp('required');
        const classString = classNames(`${prefixCls}-label`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-readonly`]: this.readOnly,
        });
        const style = floatLabelOffsetX ? {
          marginLeft: pxToRem(floatLabelOffsetX, true),
        } : undefined;
        return (
          <div className={`${prefixCls}-label-wrapper`} style={style}>
            <div
              className={classString}
              onMouseEnter={this.handleFloatLabelMouseEnter}
              onMouseLeave={this.handleFloatLabelMouseLeave}
            >
              {label}
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
    const { labelLayout, getProPrefixCls } = this.context;
    if (validationMessage) {
      const showIcon = !(labelLayout === LabelLayout.float || this.showValidation === ShowValidation.newLine);
      return renderValidationMessage(validationMessage, showIcon, getProPrefixCls);
    }
  }

  getValidatorProp(key: string) {
    switch (key) {
      case 'type':
        return this.getFieldType();
      case 'customValidator':
        return this.getProp('validator');
      case 'range':
        return this.range;
      case 'multiple':
        return this.multiple;
      case 'defaultValidationMessages':
        return {
          ...this.defaultValidationMessages,
          ...this.getContextConfig('defaultValidationMessages'),
        };
      default:
        return this.getProp(key);
    }
  }

  getValidatorProps(): ValidatorBaseProps {
    const { name } = this;
    return {
      name,
      form: this.context.formNode as Form,
    };
  }

  getValidationResults(): ValidationResult[] | undefined {
    const { field, record } = this;
    if (field) {
      return field.getValidationErrorValues(record);
    }
    return this.validationResults;
  }

  getValidationMessage(validationResult: ValidationResult | undefined): ReactNode {
    if (validationResult === undefined) {
      const results = this.getValidationResults();
      if (results && results.length) {
        validationResult = results[0];
      }
    }
    const {
      props: { validationRenderer },
    } = this;
    if (validationResult) {
      if (validationRenderer) {
        const validationMessage = validationRenderer(validationResult, validationResult.validationProps);
        if (validationMessage) {
          return validationMessage;
        }
      }
      return validationResult.validationMessage;
    }
  }

  showTooltip(e): boolean {
    if (!this.hasFloatLabel && this.showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'), this.getContextConfig);
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
    const { labelTooltip, context: { getTooltipTheme, getTooltipPlacement } } = this;
    const { currentTarget } = e;
    if (labelTooltip === TextTooltip.always || (labelTooltip === TextTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, {
        title: this.getLabel(),
        placement: getTooltipPlacement('label'),
        theme: getTooltipTheme('label'),
      });
      this.tooltipShown = true;
    } else if (isArrayLike(labelTooltip)) {
      const tooltipType = labelTooltip[0];
      const labelTooltipProps = labelTooltip[1] || {};
      const duration: number = (labelTooltipProps.mouseEnterDelay || 0.1) * 1000;
      if (tooltipType === TextTooltip.always || (tooltipType === TextTooltip.overflow && isOverflow(currentTarget))) {
        show(currentTarget, {
          theme: getTooltipTheme('label'),
          placement: getTooltipPlacement('label'),
          title: labelTooltipProps.title ? labelTooltipProps.title : this.getLabel(),
          ...labelTooltipProps,
        }, duration);
        this.tooltipShown = true;
      }
    }
  }

  handleFloatLabelMouseLeave() {
    hide();
  }

  @autobind
  handleFocus(e) {
    super.handleFocus(e);
    if (this.range && !this.rangeValue) {
      this.beginRange();
    }
  }

  @autobind
  handleBlur(e) {
    super.handleBlur(e);
    if (this.range && (this.editable || this.isEditableLike() || this.doEndRange)) {
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
    return getDateFormatByField(field, this.getFieldType(field), this.record);
  }

  getProcessValueOptions(): ProcessValueOptions {
    return {
      dateFormat: this.getDateFormat(),
      showInvalidDate: this.getContextConfig('showInvalidDate'),
    };
  }

  processValue(value: any): ReactNode {
    return processValue(value, this.getProcessValueOptions());
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
    const showValueIfNotFound = this.getContextConfig('showValueIfNotFound');
    let processedValue;

    if (field && (field.getLookup(record) || field.get('options', record) || field.get('lovCode', record) || field.get('lookupCode', record))) {
      // Cascader 值集处理
      if (isArrayLike(value)) {
        const isCascader = !field.get('multiple', record) || value.some(v => isArrayLike(v));
        processedValue = value.map(v => field.getText(v, showValueIfNotFound, record)).join(isCascader ? '/' : '、');
      } else {
        processedValue = field.getText(value, undefined, record) as string;
      }
    }
    // 值集中不存在 再去取直接返回的值
    const text = this.processText((isNil(processedValue) && showValueIfNotFound) ? this.processValue(value) : processedValue);
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

  processRangeValue(value?: any): [any, any] {
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
        const { range } = this;
        this.setValue(uniqWith([...(isArrayLike(range) ? oldValues.map(v => fromRangeValue(v, range)) : oldValues), ...values], this.compare));
      } else if (!oldValues.length) {
        this.setValue(this.emptyValue);
      } else {
        this.validate(oldValues, false);
      }
    } else {
      this.setValue(values.pop());
    }
  }

  isLowerRange(_value1: any, _value2: any): boolean {
    return false;
  }

  exchangeRangeValue(start, end) {
    const { rangeValue } = this;
    if (rangeValue) {
      rangeValue[0] = end;
      rangeValue[1] = start;
    }
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
          this.exchangeRangeValue(newValue, end);
        }
        if (rangeTarget === 1 && (newValue || isNumber(newValue)) && (start || isNumber(start)) && this.isLowerRange(newValue, start)) {
          this.exchangeRangeValue(start, newValue);
        }
      }
    } else {
      if (isFunction(processV)) {
        values = values.map(v => processV(v, undefined));
      }
      this.addValue(...values);
    }
  }

  @action
  removeValues(values: any[], index = 0) {
    let repeat: number;
    const newValues = values.reduce((oldValues, value) => {
      repeat = 0;
      const valueKey = this.getValueKey(value);
      return oldValues.filter(v => {
        if (this.getValueKey(v) === valueKey) {
          if (index === -1 || repeat === index) {
            this.afterRemoveValue(value, repeat++);
            return false;
          }
          repeat++;
        }
        return true;
      });
    }, this.getValues());
    const { range } = this;
    this.setValue(isArrayLike(range) ? newValues.map(v => fromRangeValue(v, range)) : newValues);
  }

  removeValue(value: any, index = 0) {
    this.removeValues([value], index);
  }

  @action
  removeLastValue(): any {
    const values = this.getValues();
    const index = findLastIndex(values, (value) => !this.isMultipleBlockDisabled(value));
    if (index !== -1) {
      const [value] = values.splice(index, 1);
      const { range } = this;
      this.setValue(isArrayLike(range) ? values.map(v => fromRangeValue(v, range)) : values);
      this.afterRemoveValue(fromRangeValue(value, range), -1);
      return value;
    }
  }

  afterRemoveValue(_value, _repeat: number) {
    // noop
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
    this.setRangeTarget(undefined);
  }

  @action
  setRangeTarget(target?: 0 | 1) {
    this.rangeTarget = target;
  }

  @autobind
  compare(oldValue, newValue) {
    return isSame(toJS(oldValue), toJS(newValue));
  }

  autoCreate(): Record | undefined {
    const { record } = this;
    if (record) {
      return record;
    }
    const { dataSet, name, dataIndex } = this;
    if (dataSet && name) {
      return dataSet.create({}, dataIndex);
    }
  }

  @action
  setValue(value: any, noVaidate?: boolean): void {
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
          const record = this.autoCreate();
          if (record) {
            const { field } = this;
            if (field && !field.get('defaultValidationMessages', record)) {
              field.set('defaultValidationMessages', { ...this.defaultValidationMessages, label: this.getProp('label') });
            }
            record.set(name, value);
          }
        } else if (!noVaidate) {
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
        if (isPromise(beforeChange)) {
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
    // noop
  }

  renderRangeValue(value: any, repeat?: number): ReactNode {
    return renderRangeValue(value, { repeat, processRenderer: this.processRenderer, rangeSeparator: this.rangeSeparator });
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
      props: {
        maxTagCount = this.getContextConfig('fieldMaxTagCount'),
        maxTagPlaceholder = this.getContextConfig('fieldMaxTagPlaceholder'),
        tagRenderer,
      },
    } = this;
    const values = renderMultipleValues(this.getValue(), {
      range,
      maxTagCount,
      maxTagPlaceholder,
      prefixCls,
      disabled,
      tagRenderer,
      readOnly: this.readOnly || readOnly,
      validationResults: this.getValidationResults(),
      isMultipleBlockDisabled: this.isMultipleBlockDisabled,
      processRenderer: this.processRenderer,
      renderValidationResult: this.renderValidationResult,
      handleMultipleValueRemove: this.handleMutipleValueRemove,
      isValidationMessageHidden: this.isValidationMessageHidden,
      showValidationMessage: this.showValidationMessage,
      getKey: this.getValueKey,
      rangeSeparator: this.rangeSeparator,
      inputBoxIsFocus: this.isFocused,
    });
    this.multipleValidateMessageLength = values.multipleValidateMessageLength;
    return values;
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
      const validationResults = this.getValidationResults();
      if (validationResults) {
        const currentValidationResult = validationResults[0];
        onInvalid(validationResults, new Validity(currentValidationResult ? { [currentValidationResult.ruleName]: true } : undefined), name);
      }
    }
    return valid;
  }

  @action
  validate(value?: any, report = true): Promise<boolean> {
    if (!this.props.noValidate) {
      if (value === undefined) {
        value = this.multiple ? this.getValues() : this.getValue();
      }
      const { field, record, name, dataSet } = this;
      return Validator.checkValidity(
        value,
        field && record ? {
          dataSet,
          record,
          name,
        } : this.getValidatorProps(),
        field && record ? field.getValidatorPropGetter(record) : this.getValidatorProp.bind(this),
      ).then(action(({ valid, validationResults, validatorProps }) => {
        if (record && name) {
          record.setValidationError(name, validationResults);
        } else {
          this.validationResults = validationResults;
        }
        if (report) {
          Validator.report(validationResults, validatorProps);
          const { formNode } = this.context;
          if (formNode && !formNode.validating) {
            formNode.reportValidity(valid);
          }
        }
        return valid;
      }));
    }
    return Promise.resolve(true);
  }

  isDisabled(): boolean {
    if (super.isDisabled()) {
      return true;
    }
    const { field, record } = this;
    if (field) {
      const disabled = field.get('disabled', record);
      if (disabled) {
        return true;
      }
      const cascadeMap = field.get('cascadeMap', record);
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
  @action
  reset() {
    if (!this.isControlled && !this.dataSet) {
      this.setValue(this.props.defaultValue, true);
    }
    const { record, name } = this;
    if (record && name) {
      record.clearValidationError(name);
    } else {
      this.validationResults = undefined;
    }
  }

  getFieldType(field: Field | undefined = this.field): FieldType {
    return (field && field.get('type', this.record)) || FieldType.string;
  }

  getProp(propName: string, fieldPropName = propName) {
    const { field, observableProps, record } = this;
    return defaultTo(field && field.get(fieldPropName, record), propName in observableProps ? observableProps[propName] : this.props[propName]);
  }

  /**
   * 显示类属性值获取（组件属性优先级高于 DataSet Field 属性优先级）
   * @param propName 组件属性名
   * @param fieldPropName Field 字段属性名
   * @returns 
   */
  getDisplayProp(propName: string, fieldPropName = propName) {
    const { field, observableProps, record } = this;
    return defaultTo(propName in observableProps ? observableProps[propName] : this.props[propName], field && field.get(fieldPropName, record));
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
      const hidden = !(this.hasFloatLabel || this.showValidation === ShowValidation.newLine || this.valid);
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
    if (this.hasFloatLabel || this.showValidation === ShowValidation.newLine) {
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

  forcePositionChanged() {
    // noop
  }
}

@observer
export default class ObserverFormField<T extends FormFieldProps> extends FormField<T & FormFieldProps> {
  static defaultProps = FormField.defaultProps;
}
