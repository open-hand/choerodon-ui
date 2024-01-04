import React, {
  Children,
  cloneElement,
  createElement,
  FormEvent,
  FormEventHandler,
  isValidElement,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { action as mobxAction, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import isNil from 'lodash/isNil';
import raf from 'raf';
import { AxiosInstance } from 'axios';
import { Form as IForm } from 'choerodon-ui/dataset/interface';
import Responsive, { hasBreakPointMap, isBreakPointMap } from 'choerodon-ui/lib/responsive/Responsive';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import isFunction from 'lodash/isFunction';
import axios from '../axios';
import autobind from '../_util/autobind';
import isFragment from '../_util/isFragment';
import { FormField, FormFieldProps, getFieldsById, HighlightRenderer } from '../field/FormField';
import FormContext, { FormContextValue, FormProvider } from './FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import DataSet, { ValidationErrors } from '../data-set/DataSet';
import Record from '../data-set/Record';
import { FormLayout, LabelAlign, LabelLayout, RequiredMarkAlign, ResponsiveKeys, ShowValidation, SpacingType } from './enum';
import {
  defaultColumns,
  defaultExcludeUseColonTag,
  defaultLabelWidth,
  FIELD_SUFFIX,
  getProperty,
  getPropertyDSFirst,
  getRequiredMarkAlign,
  getSpacingFieldStyle,
  getSpacingLabelStyle,
  getSpacingProperties,
  hasParentElement,
  normalizeLabelWidth,
  normalizeSeparateSpacing,
  normalizeSpacingType,
} from './utils';
import FormVirtualGroup from './FormVirtualGroup';
import { Tooltip as LabelTooltip } from '../core/enum';
import { DataSetEvents } from '../data-set/enum';
import Item from './Item';
import FormItemLabel from './FormItemLabel';
import ItemGroup from './ItemGroup';
import { ShowHelp } from '../field/enum';
import Icon from '../icon';
import { hide, show } from '../tooltip/singleton';
import { TooltipProps } from '../tooltip/Tooltip';

/**
 * 表单name生成器
 */
const NameGen: IterableIterator<string> = (function* (start: number) {
  while (true) {
    start += 1;
    yield `form-${start}`;
  }
})(0);

export type LabelWidth = number | 'auto' | (number | 'auto')[];

export type LabelWidthType = LabelWidth | { [key in ResponsiveKeys]: LabelWidth };
export type LabelAlignType = LabelAlign | { [key in ResponsiveKeys]: LabelAlign };
export type LabelLayoutType = LabelLayout | { [key in ResponsiveKeys]: LabelLayout };
export type ColumnsType = number | { [key in ResponsiveKeys]: number };
export type SeparateSpacing = { width: number; height: number }
export type SpacingTypeMap = { width: SpacingType; height: SpacingType }

export interface FormProps extends DataSetComponentProps {
  /**
   * 表单提交请求地址
   */
  action?: string;
  /**
   * 表单提交的HTTP Method
   * 可选值：POST | GET
   * @default POST
   */
  method?: string;
  /**
   * 表单提交的目标
   * 当表单设置了设置target且没有dataSet时作浏览器默认提交，否则作Ajax提交
   */
  target?: string;
  /**
   * Ajax提交时的参数回调
   */
  processParams?: (e: FormEvent<any>) => any;
  /**
   * 是否使用冒号
   */
  useColon?: boolean;
  /**
   * 必输星号位置
   */
  requiredMarkAlign?: RequiredMarkAlign;
  /**
   * @deprecated
   * 不使用冒号的列表
   */
  excludeUseColonTagList?: string[];
  /**
   * 内部控件的标签的宽度
   */
  labelWidth?: LabelWidthType;
  /**
   * 设置标签是否换行显示
   */
  labelWordBreak?: boolean;
  /**
   * 标签文字对齐方式
   * 可选值： 'left' | 'center' | 'right'
   * @default right;
   */
  labelAlign?: LabelAlignType;
  /**
   * 标签位置
   * 可选值： 'horizontal' | 'vertical' | 'placeholder' | 'none'
   */
  labelLayout?: LabelLayoutType;
  /**
   * 用tooltip显示标签内容
   * 可选值：`none` `always` `overflow`
   * 扩展 tooltip 属性：tooltip={['always', { theme: 'light', ... }]}
   */
  labelTooltip?: LabelTooltip | [LabelTooltip, TooltipProps];
  /**
   * 表单列数
   */
  columns?: ColumnsType;
  /**
   * 显示原始值
   */
  pristine?: boolean;
  /**
   * 表单头，若提供则同时显示表单头和表单头下方的分隔线
   *
   * @type {string} 暂定为string方便写样式
   * @memberof FormProps
   */
  header?: string;
  /**
   * 只读
   */
  readOnly?: boolean;
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
   * 高亮渲染器
   */
  fieldHighlightRenderer?: HighlightRenderer;
  /**
   * 提交回调
   */
  onSubmit?: FormEventHandler<any>;
  /**
   * 重置回调
   */
  onReset?: FormEventHandler<any>;
  /**
   * 提交成功回调
   */
  onSuccess?: (resp: any) => void;
  /**
   * 提交失败回调
   */
  onError?: (error: Error) => void;
  /**
   * 布局
   */
  layout?: FormLayout;
  /**
   * 切分单元格间隔，当label布局为默认值horizontal时候使用padding修改单元格横向间距可能需要结合labelwidth效果会更好
   */
  separateSpacing?: number | [number, number] | SeparateSpacing;
  /**
   * 切分单元格间隔类型
   * @default SpacingType.around
   */
  spacingType?: SpacingType | [SpacingType, SpacingType] | SpacingTypeMap;
  axios?: AxiosInstance;
  acceptCharset?: string;
  encType?: string;
  showValidation?: ShowValidation;
  showHelp?: ShowHelp;
  /**
   * 校验失败自动定位
   */
  autoValidationLocate?: boolean;
}

@observer
export default class Form extends DataSetComponent<FormProps, FormContextValue> implements IForm {
  static displayName = 'Form';

  static ItemGroup = ItemGroup;

  static FormVirtualGroup = FormVirtualGroup;

  static Item = Item;

  static defaultProps = {
    suffixCls: 'form',
    columns: defaultColumns,
    labelWidth: defaultLabelWidth,
    layout: FormLayout.table,
  };

  static get contextType(): typeof FormContext {
    return FormContext;
  }

  fields: FormField<FormFieldProps>[] = [];

  @observable responsiveItems: any[];

  @observable isUnderForm?: boolean;

  name = NameGen.next().value;

  validating = false;

  prepareForReport: { result?: boolean; timeout?: number } = {};

  isTooltipShown?: boolean;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.responsiveItems = [];
    });
  }

  @computed
  get axios(): AxiosInstance {
    return this.observableProps.axios || this.getContextConfig('axios') || axios;
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
  get useColon(): boolean {
    const { useColon } = this.observableProps;

    if (useColon !== undefined) {
      return useColon;
    }

    const configUseColon = this.getContextConfig('useColon');
    if (configUseColon !== undefined) {
      return configUseColon;
    }

    return false;
  }

  @computed
  get requiredMarkAlign(): RequiredMarkAlign {
    const { requiredMarkAlign } = this.observableProps;

    if ([RequiredMarkAlign.left, RequiredMarkAlign.right].includes(requiredMarkAlign)) {
      return requiredMarkAlign;
    }

    const configRequiredMarkAlign = this.getContextConfig('requiredMarkAlign');
    if ([RequiredMarkAlign.left, RequiredMarkAlign.right].includes(configRequiredMarkAlign)) {
      return configRequiredMarkAlign;
    }

    return RequiredMarkAlign.left;
  }

  @computed
  get excludeUseColonTagList(): string[] {
    const { excludeUseColonTagList } = this.observableProps;

    if (excludeUseColonTagList !== undefined) {
      return excludeUseColonTagList;
    }

    const configExcludeUseColonTagList = this.getContextConfig('excludeUseColonTagList');
    if (configExcludeUseColonTagList !== undefined) {
      return configExcludeUseColonTagList;
    }

    return defaultExcludeUseColonTag;
  }

  @computed
  get columns(): number {
    const { columns } = this.observableProps;
    if (isNumber(columns)) {
      return columns;
    }
    if (columns) {
      const responsiveColumns = this.responsiveItems[0];
      if (responsiveColumns) {
        return responsiveColumns;
      }
    }
    return defaultColumns;
  }

  @computed
  get labelWidth(): LabelWidth {
    const { labelWidth } = this.observableProps;
    if (labelWidth === 'auto') {
      return labelWidth;
    }
    if (isNumber(labelWidth) || (isArrayLike(labelWidth) && !hasBreakPointMap(labelWidth))) {
      return labelWidth;
    }
    if (labelWidth) {
      const responsiveWidth = this.responsiveItems[1];
      if (responsiveWidth !== undefined) {
        return responsiveWidth;
      }
    }
    return defaultLabelWidth;
  }

  @computed
  get labelWordBreak(): boolean {
    const { labelWordBreak } = this.observableProps;
    return labelWordBreak;
  }

  @computed
  get labelAlign(): LabelAlign {
    const { labelAlign } = this.observableProps;
    if (isString(labelAlign)) {
      return labelAlign as LabelAlign;
    }
    if (labelAlign) {
      const responsiveAlign = this.responsiveItems[2];
      if (responsiveAlign) {
        return responsiveAlign;
      }
    }
    return (this.labelLayout === LabelLayout.vertical
      ? LabelAlign.left
      : this.getContextConfig('labelAlign') || LabelAlign.right);
  }

  @computed
  get labelLayout(): LabelLayout {
    const { labelLayout } = this.observableProps;
    if (isString(labelLayout)) {
      return labelLayout as LabelLayout;
    }
    if (labelLayout) {
      const responsiveLabelLayout = this.responsiveItems[3];
      if (responsiveLabelLayout) {
        return responsiveLabelLayout;
      }
    }
    return this.getContextConfig('labelLayout') || LabelLayout.horizontal;
  }

  @computed
  get labelTooltip(): LabelTooltip | [LabelTooltip, TooltipProps] |undefined {
    const { labelTooltip } = this.observableProps;
    if (labelTooltip) {
      return labelTooltip;
    }
    const { getTooltip } = this.context;
    return getTooltip('label');
  }

  @computed
  get readOnly(): boolean {
    return this.observableProps.readOnly;
  }

  @computed
  get pristine(): boolean {
    return this.observableProps.pristine;
  }

  @computed
  get fieldHighlightRenderer(): boolean {
    return this.observableProps.fieldHighlightRenderer;
  }

  @computed
  get showValidation(): ShowValidation {
    return this.observableProps.showValidation;
  }

  @computed
  get showHelp(): ShowHelp {
    const { showHelp } = this.observableProps;
    if (isString(showHelp)) {
      return showHelp as ShowHelp;
    }
    return this.getContextConfig('showHelp') || ShowHelp.newLine;
  }

  @computed
  get separateSpacing(): SeparateSpacing | undefined {
    const { separateSpacing } = this.observableProps;
    if (separateSpacing) {
      const { width = 0, height = 0 } = normalizeSeparateSpacing(separateSpacing);
      if (width || height) {
        return {
          width,
          height,
        };
      }
      if (isBreakPointMap(separateSpacing)) {
        const responsiveSeparateSpacing = this.responsiveItems[4];
        if (responsiveSeparateSpacing) {
          const { width = 0, height = 0 } = responsiveSeparateSpacing;
          return {
            width,
            height,
          };
        }
      }
    }
    return undefined;
  }

  get spacingType(): SpacingTypeMap {
    const { spacingType } = this.props;
    return normalizeSpacingType(spacingType);
  }

  isReadOnly() {
    return this.readOnly;
  }

  isDisabled(): boolean {
    const disabled = super.isDisabled();
    if (disabled) {
      return disabled;
    }
    const { record } = this;
    if (record) {
      return record.disabled;
    }
    return false;
  }

  getObservableProps(props, context) {
    const observableProps: any = {
      ...super.getObservableProps(props, context),
      contextDataSet: context.dataSet,
      contextRecord: context.record,
      dataIndex: props.dataIndex,
      contextDataIndex: context.dataIndex,
      labelLayout: 'labelLayout' in props ? props.labelLayout : context.labelLayout,
      labelAlign: 'labelAlign' in props ? props.labelAlign : context.labelAlign,
      showValidation: 'showValidation' in props ? props.showValidation : context.showValidation,
      showHelp: 'showHelp' in props ? props.showHelp : context.showHelp,
      labelTooltip: 'labelTooltip' in props ? props.labelTooltip : context.labelTooltip,
      disabled: 'disabled' in props ? props.disabled : context.disabled,
      readOnly: 'readOnly' in props ? props.readOnly : context.readOnly,
      labelWidth: defaultTo(props.labelWidth, context.labelWidth),
      labelWordBreak: 'labelWordBreak' in props ? props.labelWordBreak : context.labelWordBreak,
      pristine: 'pristine' in props ? props.pristine : context.pristine,
      columns: props.columns,
      useColon: props.useColon,
      requiredMarkAlign: props.requiredMarkAlign,
      excludeUseColonTagList: props.excludeUseColonTagList,
      separateSpacing: props.separateSpacing,
      fieldHighlightRenderer: 'fieldHighlightRenderer' in props ? props.fieldHighlightRenderer : context.fieldHighlightRenderer,
    };
    if ('record' in props) {
      observableProps.record = props.record;
    }
    return observableProps;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'record',
      'dataIndex',
      'onSuccess',
      'onError',
      'processParams',
      'labelWidth',
      'labelAlign',
      'labelLayout',
      'labelTooltip',
      'columns',
      'pristine',
      'axios',
      'useColon',
      'requiredMarkAlign',
      'excludeUseColonTagList',
      'separateSpacing',
      'spacingType',
      'fieldHighlightRenderer',
      'layout',
      'showValidation',
      'showHelp',
      'labelWordBreak',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.onSubmit = this.handleSubmit;
    otherProps.onReset = this.handleReset;
    if (!otherProps.name) {
      otherProps.name = this.name;
    }
    return otherProps;
  }

  getHeader(): ReactNode {
    const {
      props: { header },
      prefixCls,
    } = this;
    if (header) {
      return (
        <div key="form-header" className={`${prefixCls}-header`}>
          {header}
        </div>
      );
    }
  }

  getClassName(...props): string | undefined {
    const { prefixCls, labelLayout, columns } = this;
    return super.getClassName({
      ...props,
      [`${prefixCls}-float-label`]: labelLayout === LabelLayout.float,
      [`${prefixCls}-${labelLayout}`]: !isNil(labelLayout),
      [`${prefixCls}-${columns > 1 ? "multi" : "single"}`]: true,
    });
  }

  componentWillMount() {
    this.processDataSetListener(true);
  }

  componentDidMount() {
    this.componentDidMountOrUpdate();
    this.handleFormFocus();
    super.componentDidMount();
  }

  componentDidUpdate() {
    this.componentDidMountOrUpdate();
  }

  componentWillUnmount() {
    this.processDataSetListener(false);
    if (this.isTooltipShown) {
      hide();
      delete this.isTooltipShown;
    }
    this.bubbleValidationReport(false);
  }

  handleFormFocus() {
    // 聚焦到form内第一个可编辑组件上
    const fields: FormField<FormFieldProps>[] = this.getFields();
    let editableField: FormField<FormFieldProps> | undefined;
    for (let i = 0; i < fields.length; i++) {
      const field: FormField<FormFieldProps> = fields[i];
      if (field.props.autoFocus) {
        break;
      }
      if (field.editable && !editableField) {
        editableField = field;
      }
      if (i === fields.length - 1 && editableField && this.getContextConfig('formAutoFocus')) {
        editableField.focus();
      }
    }
  }

  @mobxAction
  componentDidMountOrUpdate() {
    const { formNode } = this.context;
    const { element } = this;
    if (formNode && element) {
      const isUnderForm = hasParentElement(element.parentElement, 'form');
      if (isUnderForm !== this.isUnderForm) {
        this.isUnderForm = isUnderForm;
      }
    }
  }

  processDataSetListener(flag: boolean) {
    const { dataSet } = this;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, DataSetEvents.validate, this.handleDataSetValidate);
      handler.call(dataSet, DataSetEvents.reset, this.handleDataSetReset);
      handler.call(dataSet, DataSetEvents.remove, this.handleDataSetRemove);
    }
  }

  bubbleValidationReport(showInvalid: boolean) {
    const { pristine } = this.props;
    if (!pristine) {
      const onComponentValidationReport = this.getContextConfig('onComponentValidationReport');
      if (onComponentValidationReport) {
        onComponentValidationReport({
          showInvalid,
          component: this,
        });
      }
    }
  }

  @autobind
  handleDataSetReset({ record, dataSet }) {
    if (record) {
      const errors = dataSet.getAllValidationErrors();
      this.bubbleValidationReport(errors.dataSet.length > 0 || errors.records.length > 0);
    } else {
      this.bubbleValidationReport(false);
    }
  }
  
  @autobind
  handleDataSetRemove({ records, dataSet }) {
    if (records) {
      const errors = dataSet.getAllValidationErrors();
      this.bubbleValidationReport(errors.dataSet.length > 0 || errors.records.length > 0);
    }
  }

  // 处理校验失败定位
  @autobind
  handleDataSetValidate(props: { dataSet: DataSet; valid: boolean; errors: ValidationErrors[]; noLocate?: boolean }) {
    const { valid, errors: validationErrors, noLocate } = props;
    this.bubbleValidationReport(!valid);
    const { autoValidationLocate } = this.props;
    if (autoValidationLocate !== false && !noLocate && !valid) {
      const [firstInvalidRecord] = validationErrors;
      if (firstInvalidRecord) {
        const { errors } = firstInvalidRecord;
        if (errors.length) {
          const [{ field: { name } }] = errors;
          const field = this.getFields().find(item => item.props.name === name);
          if (field) {
            raf(() => {
              field.focus();
            });
          }
        }
      }
    }
  }

  @autobind
  handleHelpMouseEnter(e: MouseEvent, help: ReactNode, helpTooltipProps: TooltipProps) {
    const { target } = e;
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    show(target as HTMLElement, {
      title: help,
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
      ...helpTooltipProps,
    });
    this.isTooltipShown = true;
  }

  @autobind
  handleHelpMouseLeave() {
    hide();
  }

  renderTooltipHelp(help, helpTooltipProps) {
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={(e) => this.handleHelpMouseEnter(e, help, helpTooltipProps)}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  rasterizedChildren() {
    const {
      dataSet,
      record,
      columns,
      labelLayout,
      labelAlign,
      labelTooltip,
      useColon,
      requiredMarkAlign,
      excludeUseColonTagList,
      readOnly: formReadOnly,
      showHelp,
      labelWordBreak: formLabelWordBreak,
      props: { children },
    } = this;
    const prefixCls = this.getContextProPrefixCls(FIELD_SUFFIX);
    const labelWidth = normalizeLabelWidth(this.labelWidth, columns);
    const rows: ReactElement<any>[] = [];
    let cols: ReactElement<any>[] = [];
    let rowIndex = 0;
    let colIndex = 0;
    const matrix: (boolean | undefined)[][] = [[]];
    let noLabel = true;
    const childrenArray: (ReactElement<any> & { ref })[] = [];
    const { separateSpacing } = this;
    const isLabelLayoutHorizontal = labelLayout === LabelLayout.horizontal;
    const spacingProperties = separateSpacing ? getSpacingProperties(separateSpacing, this.spacingType, isLabelLayoutHorizontal) : undefined;
    let isAllOutputCom = true;
    Children.forEach<ReactNode>(children, (child) => {
      if (isValidElement(child)) {
        const setChild = (arr: ReactElement<any>[], outChild: ReactElement<any>, groupProps = {}) => {
          const { type, props: outChildProps } = outChild;
          if (outChildProps.hidden) return null;
          if (type) {
            if (isAllOutputCom &&
              isFunction(type) && !(type as any).__PRO_OUTPUT &&
              !((type as any).displayName === 'IntlField' && outChildProps && outChildProps.displayOutput)) {
              isAllOutputCom = false;
            }

            if (
              noLabel === true &&
              isLabelLayoutHorizontal &&
              getProperty(outChildProps, 'label', dataSet, record)
            ) {
              noLabel = false;
            }
            const { children: outChildChildren, ...otherOutChildProps } = outChildProps;
            const isFragmentElement = isFragment(outChild);
            if (isFragmentElement || (type as typeof FormVirtualGroup).__PRO_FORM_VIRTUAL_GROUP) {
              Children.forEach<ReactElement<any>>(outChildChildren, (c) => {
                if (isValidElement<any>(c)) {
                  setChild(arr, c, isFragmentElement ? groupProps : { ...groupProps, ...otherOutChildProps });
                }
              });
            } else {
              arr.push(Object.keys(groupProps).length ? cloneElement<any>(outChild, {
                ...groupProps,
                ...outChildProps,
              }) : outChild);
            }
          }
        };
        setChild(childrenArray, child);
      }
    });

    function completeLine() {
      if (cols.length) {
        const maxRowSpan = Math.max(...cols.map(x => x.props.rowSpan));
        if (rows[rowIndex]) {
          rows[rowIndex] = <tr key={`row-${rowIndex}`}>{cols}</tr>;
        } else {
          rows.push((<tr key={`row-${rowIndex}`}>{cols}</tr>));
        }
        if (maxRowSpan > 1) {
          new Array(maxRowSpan - 1).fill(0).forEach(() => rows.push(<tr />));
        }
        cols = [];
      }
      rowIndex++;
      colIndex = 0;
      matrix[rowIndex] = matrix[rowIndex] || [];
    }

    for (let index = 0, len = childrenArray.length; index < len;) {
      const { props, key, type, ref } = childrenArray[index];

      const TagName = isFunction(type) ? (type as any).displayName : type;
      const label = getProperty(props, 'label', dataSet, record);
      const help = getProperty(props, 'help', dataSet, record);
      const fieldLabelWidth = getProperty(props, 'labelWidth', dataSet, record);
      const fieldLabelWordBreak = getProperty(props, 'labelWordBreak', dataSet, record);
      const required = getPropertyDSFirst(props, 'required', dataSet, record);
      const readOnly = getProperty(props, 'readOnly', dataSet, record) || formReadOnly;
      const labelWordBreak = !isNil(fieldLabelWordBreak) ? fieldLabelWordBreak : formLabelWordBreak;
      const intlFieldOutput = TagName === 'IntlField' && props && props.displayOutput;
      const {
        rowSpan = 1,
        colSpan = 1,
        newLine,
        className,
        fieldClassName,
        useColon: fieldUseColon = useColon,
        requiredMarkAlign: fieldRequiredMarkAlign = requiredMarkAlign,
        ...otherProps
      } = props as any;
      let newColSpan = colSpan;
      const currentRow = matrix[rowIndex];
      if (newLine) {
        if (colIndex !== 0) {
          completeLine();
          continue;
        }
      }
      while (currentRow[colIndex]) {
        colIndex++;
      }
      if (colIndex >= columns) {
        completeLine();
        continue;
      }
      if (newColSpan + colIndex > columns) {
        newColSpan = columns - colIndex;
      }
      for (let i = colIndex, k = colIndex + newColSpan; i < k; i++) {
        if (currentRow[i]) {
          newColSpan = i - colIndex;
          break;
        }
      }
      for (let i = rowIndex; i < rowSpan + rowIndex; i++) {
        for (let j = colIndex, k = newColSpan + colIndex; j < k; j++) {
          if (!matrix[i]) {
            matrix[i] = [];
          }
          matrix[i][j] = true;
        }
      }
      const fieldElementProps: any = {
        ref,
        key,
        className: classNames(prefixCls, className),
        ...otherProps,
      };
      const isOutput = (type as any).__PRO_OUTPUT || intlFieldOutput;
      const outputMix = !isAllOutputCom && isOutput ? 'mix' : '';
      const isLabelShowHelp = (fieldElementProps.showHelp || showHelp) === ShowHelp.label;
      const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, fieldClassName, {
        [`${prefixCls}-required`]: required && !isOutput,
        [`${prefixCls}-readonly`]: readOnly,
        [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
        [`${prefixCls}-label-output`]: isLabelLayoutHorizontal && isOutput,
        [`${prefixCls}-label-output-${outputMix}`]: isLabelLayoutHorizontal && isOutput && outputMix,
        [`${prefixCls}-label-useColon`]: label && fieldUseColon && !excludeUseColonTagList.find(v => v === TagName),
        [`${prefixCls}-label-required-mark-${getRequiredMarkAlign(fieldRequiredMarkAlign)}`]: isLabelLayoutHorizontal && required && !isOutput && getRequiredMarkAlign(fieldRequiredMarkAlign),
        [`${prefixCls}-label-help`]: isLabelShowHelp,
        [`${prefixCls}-label-word-break`]: labelWordBreak,
      });
      const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
        [`${prefixCls}-output`]: isLabelLayoutHorizontal && isOutput,
        [`${prefixCls}-output-${outputMix}`]: isLabelLayoutHorizontal && isOutput && outputMix,
      });
      if (!noLabel && !(type as typeof Item).__PRO_FORM_ITEM) {
        const columnLabelWidth = labelWidth[colIndex];
        if (!isNaN(fieldLabelWidth) && columnLabelWidth !== 'auto') {
          labelWidth[colIndex] = Math.max(columnLabelWidth, fieldLabelWidth);
        }
        const tooltip = 'labelTooltip' in props ? props.labelTooltip : labelTooltip;
        cols.push(
          <FormItemLabel
            key={`row-${rowIndex}-col-${colIndex}-label`}
            className={labelClassName}
            rowSpan={rowSpan}
            style={spacingProperties ? getSpacingLabelStyle(spacingProperties, isLabelLayoutHorizontal, rowIndex) : undefined}
            tooltip={tooltip}
            help={isLabelShowHelp ? this.renderTooltipHelp(help, fieldElementProps.helpTooltipProps) : undefined}
            labelWordBreak={labelWordBreak}
          >
            {toJS(label)}
          </FormItemLabel>,
        );
      }
      if (!isString(type)) {
        fieldElementProps.rowIndex = rowIndex;
        fieldElementProps.colIndex = colIndex;
      }
      const currentColSpan = noLabel ? newColSpan : newColSpan * 2 - ((type as typeof Item).__PRO_FORM_ITEM ? 0 : 1);
      cols.push(
        <td
          key={`row-${rowIndex}-col-${colIndex}-field`}
          colSpan={currentColSpan}
          rowSpan={rowSpan}
          className={fieldClassName}
          style={spacingProperties ? getSpacingFieldStyle(spacingProperties, isLabelLayoutHorizontal, rowIndex) : undefined}
        >
          {labelLayout === LabelLayout.vertical && !!label && (
            <>
              <label className={labelClassName}>
                {toJS(label)}
              </label>
              {isLabelShowHelp ? this.renderTooltipHelp(help, fieldElementProps.helpTooltipProps) : null}
            </>
          )}
          <div className={wrapperClassName}>{createElement(type, fieldElementProps)}</div>
        </td>,
      );
      if (index === len - 1) {
        completeLine();
      } else {
        colIndex++;
      }
      index++;
    }
    cols = [];
    const isAutoWidth = !noLabel && labelWidth.some(w => w === 'auto');
    if (!noLabel) {
      for (let i = 0; i < columns; i++) {
        const key = `label-${i}`;
        const columnLabelWidth = labelWidth[i % columns];
        if (columnLabelWidth === 'auto') {
          cols.push(<col key={key} />);
        } else {
          cols.push(
            <col
              key={key}
              // 优化当使用 separateSpacing label 宽度太窄问题
              style={{ width: pxToRem(spacingProperties ? spacingProperties.paddingHorizontal + columnLabelWidth : columnLabelWidth) }}
            />,
          );
        }
        cols.push(
          <col key={`wrapper-${i}`} style={isAutoWidth ? { width: `${100 / columns}%` } : undefined} />,
        );
      }
    } else {
      for (let i = 0; i < columns; i++) {
        cols.push(
          <col key={`wrapper-${i}`} />,
        );
      }
    }

    return (
      <table key="form-body" style={spacingProperties && spacingProperties.style} className={`${isAutoWidth ? 'auto-width' : ''}`}>
        {cols.length ? <colgroup>{cols}</colgroup> : undefined}
        <tbody>{rows}</tbody>
      </table>
    );
  }

  getMergedProps(props = {}) {
    const mergedProps = super.getMergedProps(props);
    if (this.spacingType.width === SpacingType.between && this.separateSpacing && this.separateSpacing.width > 0) {
      mergedProps.style = {
        ...mergedProps.style,
        overflowX: 'hidden',
      };
    }
    return mergedProps;
  }

  render() {
    const {
      labelWidth,
      labelAlign,
      labelLayout,
      labelTooltip,
      pristine,
      dataSet,
      record,
      dataIndex,
      observableProps,
      disabled,
      readOnly,
      fieldHighlightRenderer,
      props,
      useColon,
      requiredMarkAlign,
      showValidation,
      showHelp,
      labelWordBreak,
    } = this;
    const { formNode, getConfig, getProPrefixCls, getPrefixCls, getCustomizable, getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const value: FormContextValue = {
      formNode: formNode || this,
      dataSet,
      dataIndex,
      record,
      labelWidth,
      labelAlign,
      labelLayout,
      labelTooltip,
      pristine,
      disabled,
      readOnly,
      fieldHighlightRenderer,
      useColon,
      requiredMarkAlign,
      showValidation,
      showHelp,
      labelWordBreak,
      getConfig,
      getPrefixCls,
      getProPrefixCls,
      getCustomizable,
      getTooltip,
      getTooltipTheme,
      getTooltipPlacement,
    };
    const children: ReactNode = [
      this.getHeader(),
      props.layout === FormLayout.table ? this.rasterizedChildren() : props.children,
    ];
    return (
      <Responsive
        items={[
          observableProps.columns,
          observableProps.labelWidth,
          observableProps.labelAlign,
          observableProps.labelLayout,
          observableProps.separateSpacing,
        ]}
        onChange={this.handleResponsive}
      >
        <FormProvider value={value}>
          {
            this.isUnderForm ? children :
              formNode && this.isUnderForm === undefined ? (
                <div {...this.getMergedProps()}>
                  {children}
                </div>
              ) : (
                <form {...this.getMergedProps()} noValidate>
                  {children}
                </form>
              )
          }
        </FormProvider>
      </Responsive>
    );
  }

  @autobind
  @mobxAction
  handleResponsive(items) {
    this.responsiveItems = items;
  }

  @autobind
  async handleSubmit(e) {
    e.preventDefault();
    e.persist();
    if (await this.checkValidity()) {
      const {
        target,
        action,
        dataSet,
        method,
        processParams = noop,
        onSuccess = noop,
        onError = noop,
        onSubmit = noop,
      } = this.props;
      onSubmit(e);
      try {
        if (dataSet) {
          onSuccess(await dataSet.submit());
        } else if (action) {
          if (target && this.element) {
            this.element.submit();
          } else {
            onSuccess(await this.axios[method || 'get'](action, processParams(e)));
          }
        }
      } catch (error) {
        onError(error);
      }
    }
  }

  @autobind
  handleReset(e) {
    const { onReset = noop } = this.props;
    const { record } = this;
    onReset(e);
    if (!e.isDefaultPrevented()) {
      if (record) {
        record.reset();
      } else {
        this.getFields().forEach(field => field.reset());
      }
    }
  }

  reportValidity(result: boolean) {
    const { prepareForReport } = this;
    if (!result) {
      prepareForReport.result = result;
    }
    if (prepareForReport.timeout) {
      window.clearTimeout(prepareForReport.timeout);
    }
    prepareForReport.timeout = window.setTimeout(() => {
      if (!prepareForReport.result) {
        const field = this.getFields().find(one => !one.valid);
        if (field) {
          field.focus();
        }
      }
      this.prepareForReport = {};
    }, 200);
  }

  checkValidity() {
    const { dataSet } = this;
    if (dataSet) {
      if (!dataSet.length) {
        dataSet.create();
      }
      return dataSet.validate();
    }
    this.validating = true;
    return Promise.all(this.getFields().map(field => field.checkValidity())).then((results) => {
      const valid = results.every(result => result);
      this.reportValidity(valid);
      this.validating = false;
      return valid;
    }).catch((error) => {
      this.validating = false;
      throw error;
    });
  }

  getFields(): FormField<FormFieldProps>[] {
    const { id } = this.props;
    if (id) {
      return ([] as FormField<FormFieldProps>[]).concat(this.fields, getFieldsById(id));
    }
    return this.fields;
  }

  getField(name: string): FormField<FormFieldProps> | undefined {
    return this.getFields().find(field => field.props.name === name);
  }

  addField(field: FormField<FormFieldProps>) {
    this.fields.push(field);
  }

  removeField(field) {
    const index = this.fields.indexOf(field);
    if (index !== -1) {
      this.fields.splice(index, 1);
    }
  }
}
