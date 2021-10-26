import React, {
  Children,
  cloneElement,
  createElement,
  CSSProperties,
  FormEvent,
  FormEventHandler,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { action as mobxAction, computed, isArrayLike, observable, runInAction } from 'mobx';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import { AxiosInstance } from 'axios';
import Responsive, { hasBreakPointMap } from 'choerodon-ui/lib/responsive/Responsive';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getTooltip } from 'choerodon-ui/lib/_util/TooltipUtils';
import isFunction from 'lodash/isFunction';
import axios from '../axios';
import autobind from '../_util/autobind';
import isFragment from '../_util/isFragment';
import { FormField, FormFieldProps, getFieldsById, HighlightRenderer } from '../field/FormField';
import FormContext from './FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import DataSet, { ValidationErrors } from '../data-set/DataSet';
import Record from '../data-set/Record';
import { FormLayout, LabelAlign, LabelLayout, ResponsiveKeys, ShowValidation } from './enum';
import {
  defaultColumns,
  defaultExcludeUseColonTag,
  defaultLabelWidth,
  FIELD_SUFFIX,
  getProperty,
  hasParentElement,
  normalizeLabelWidth,
} from './utils';
import FormVirtualGroup from './FormVirtualGroup';
import { Tooltip as LabelTooltip } from '../core/enum';
import { DataSetEvents } from '../data-set/enum';
import Item from './Item';
import FormItemLabel from './FormItemLabel';

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
   * @deprecated
   * 不使用冒号的列表
   */
  excludeUseColonTagList?: string[];
  /**
   * 内部控件的标签的宽度
   */
  labelWidth?: LabelWidthType;
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
   */
  labelTooltip?: LabelTooltip;
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
  separateSpacing?: SeparateSpacing;
  axios?: AxiosInstance;
  acceptCharset?: string;
  encType?: string;
  showValidation?: ShowValidation;
}

const labelWidthPropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.oneOf(['auto']),
  PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])])),
]);
const labelAlignPropTypes = PropTypes.oneOf([LabelAlign.left, LabelAlign.center, LabelAlign.right]);
const labelLayoutPropTypes = PropTypes.oneOf([
  LabelLayout.horizontal,
  LabelLayout.vertical,
  LabelLayout.placeholder,
  LabelLayout.float,
  LabelLayout.none,
]);

@observer
export default class Form extends DataSetComponent<FormProps> {
  static displayName = 'Form';

  static FormVirtualGroup = FormVirtualGroup;

  static Item = Item;

  static propTypes = {
    /**
     * 表单提交请求地址
     */
    action: PropTypes.string,
    /**
     * 表单提交的HTTP Method
     * 可选值：POST | GET
     * @default POST
     */
    method: PropTypes.string,
    /**
     * 表单提交的目标
     * 当表单设置了设置target且没有dataSet时作浏览器默认提交，否则作Ajax提交
     */
    target: PropTypes.string,
    /**
     * Ajax提交时的参数回调
     */
    processParams: PropTypes.func,
    /**
     * 只读
     */
    readOnly: PropTypes.bool,
    /**
     * 内部控件的标签的宽度
     */
    labelWidth: PropTypes.oneOfType([
      labelWidthPropTypes,
      PropTypes.shape({
        [ResponsiveKeys.xs]: labelWidthPropTypes,
        [ResponsiveKeys.sm]: labelWidthPropTypes,
        [ResponsiveKeys.md]: labelWidthPropTypes,
        [ResponsiveKeys.lg]: labelWidthPropTypes,
        [ResponsiveKeys.xl]: labelWidthPropTypes,
        [ResponsiveKeys.xxl]: labelWidthPropTypes,
      }),
    ]),
    useColon: PropTypes.bool,
    excludeUseColonTagList: PropTypes.array,
    /**
     * 标签文字对齐方式
     * 可选值： 'left' | 'center' | 'right'
     */
    labelAlign: PropTypes.oneOfType([
      labelAlignPropTypes,
      PropTypes.shape({
        [ResponsiveKeys.xs]: labelAlignPropTypes,
        [ResponsiveKeys.sm]: labelAlignPropTypes,
        [ResponsiveKeys.md]: labelAlignPropTypes,
        [ResponsiveKeys.lg]: labelAlignPropTypes,
        [ResponsiveKeys.xl]: labelAlignPropTypes,
        [ResponsiveKeys.xxl]: labelAlignPropTypes,
      }),
    ]),
    /**
     * 标签位置
     * 可选值： 'horizontal' | 'vertical' | 'placeholder' | 'float' | 'none'
     */
    labelLayout: PropTypes.oneOfType([
      labelLayoutPropTypes,
      PropTypes.shape({
        [ResponsiveKeys.xs]: labelLayoutPropTypes,
        [ResponsiveKeys.sm]: labelLayoutPropTypes,
        [ResponsiveKeys.md]: labelLayoutPropTypes,
        [ResponsiveKeys.lg]: labelLayoutPropTypes,
        [ResponsiveKeys.xl]: labelLayoutPropTypes,
        [ResponsiveKeys.xxl]: labelLayoutPropTypes,
      }),
    ]),
    /**
     * 表单列数
     */
    columns: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        [ResponsiveKeys.xs]: PropTypes.number,
        [ResponsiveKeys.sm]: PropTypes.number,
        [ResponsiveKeys.md]: PropTypes.number,
        [ResponsiveKeys.lg]: PropTypes.number,
        [ResponsiveKeys.xl]: PropTypes.number,
        [ResponsiveKeys.xxl]: PropTypes.number,
      }),
    ]),
    pristine: PropTypes.bool,
    /**
     * 表单头
     */
    header: PropTypes.string,
    /**
     * 高亮渲染器
     */
    fieldHighlightRenderer: PropTypes.func,
    /**
     * 提交回调
     */
    onSubmit: PropTypes.func,
    /**
     * 重置回调
     */
    onReset: PropTypes.func,
    /**
     * 提交成功回调
     */
    onSuccess: PropTypes.func,
    /**
     * 提交失败回调
     */
    onError: PropTypes.func,
    separateSpacing: PropTypes.object,
    /**
     * 校验信息提示方式
     */
    showValidation: PropTypes.string,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'form',
    columns: defaultColumns,
    labelWidth: defaultLabelWidth,
    layout: FormLayout.table,
  };

  static contextType = FormContext;

  fields: FormField<FormFieldProps>[] = [];

  @observable responsiveItems: any[];

  @observable isUnderForm?: boolean;

  name = NameGen.next().value;

  validating = false;

  prepareForReport: { result?: boolean; timeout?: number } = {};

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.responsiveItems = [];
    });
  }

  @computed
  get axios(): AxiosInstance {
    return this.observableProps.axios || getConfig('axios') || axios;
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

    const configUseColon = getConfig('useColon');
    if (configUseColon !== undefined) {
      return configUseColon;
    }

    return false;
  }

  @computed
  get excludeUseColonTagList(): string[] {
    const { excludeUseColonTagList } = this.observableProps;

    if (excludeUseColonTagList !== undefined) {
      return excludeUseColonTagList;
    }

    const configExcludeUseColonTagList = getConfig('excludeUseColonTagList');
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
  get labelAlign(): LabelAlign {
    const { labelAlign } = this.observableProps;
    const defaultLabelAlign =
      this.labelLayout === LabelLayout.vertical ? LabelAlign.left : LabelAlign.right;
    if (isString(labelAlign)) {
      return labelAlign as LabelAlign;
    }
    if (labelAlign) {
      const responsiveAlign = this.responsiveItems[2];
      if (responsiveAlign) {
        return responsiveAlign;
      }
    }
    return defaultLabelAlign;
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
    return getConfig('labelLayout') || LabelLayout.horizontal;
  }

  @computed
  get labelTooltip(): LabelTooltip | undefined {
    const { labelTooltip } = this.observableProps;
    if (labelTooltip) {
      return labelTooltip;
    }
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
  get separateSpacing(): SeparateSpacing | undefined {
    const { separateSpacing } = this.observableProps;
    if (separateSpacing) {
      const { width = 0, height = 0 } = separateSpacing;
      if (width || height) {
        return {
          width,
          height,
        };
      }
    }
    return undefined;
  }

  isReadOnly() {
    return this.readOnly;
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
      labelTooltip: 'labelTooltip' in props ? props.labelTooltip : context.labelTooltip,
      disabled: 'disabled' in props ? props.disabled : context.disabled,
      readOnly: 'readOnly' in props ? props.readOnly : context.readOnly,
      labelWidth: defaultTo(props.labelWidth, context.labelWidth),
      pristine: 'pristine' in props ? props.pristine : context.pristine,
      columns: props.columns,
      useColon: props.useColon,
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
      'excludeUseColonTagList',
      'separateSpacing',
      'fieldHighlightRenderer',
      'layout',
      'showValidation',
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
    const { prefixCls, labelLayout } = this;
    return super.getClassName({
      ...props,
      [`${prefixCls}-float-label`]: labelLayout === LabelLayout.float,
    });
  }

  componentWillMount() {
    this.processDataSetListener(true);
  }

  componentDidMount() {
    this.componentDidMountOrUpdate();
    super.componentDidMount();
  }

  componentDidUpdate() {
    this.componentDidMountOrUpdate();
  }

  componentWillUnmount() {
    this.processDataSetListener(false);
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
    }
  }

  // 处理校验失败定位
  @autobind
  handleDataSetValidate({ valid, errors: validationErrors, noLocate }: { valid: boolean; errors: ValidationErrors[]; noLocate?: boolean }) {
    if (!noLocate && !valid) {
      const [firstInvalidRecord] = validationErrors;
      if (firstInvalidRecord) {
        const { errors } = firstInvalidRecord;
        if (errors.length) {
          const [{ field: { name } }] = errors;
          const field = this.getFields().find(item => item.props.name === name);
          if (field) {
            field.focus();
          }
        }
      }
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
      excludeUseColonTagList,
      readOnly: formReadOnly,
      props: { children },
    } = this;
    const prefixCls = getProPrefixCls(FIELD_SUFFIX);
    const labelWidth = normalizeLabelWidth(this.labelWidth, columns);
    const rows: ReactElement<any>[] = [];
    let cols: ReactElement<any>[] = [];
    let rowIndex = 0;
    let colIndex = 0;
    const matrix: (boolean | undefined)[][] = [[]];
    let noLabel = true;
    const childrenArray: (ReactElement<any> & { ref })[] = [];
    const separateSpacingWidth: number = this.separateSpacing ? this.separateSpacing.width / 2 : 0;
    const isLabelLayoutHorizontal = labelLayout === LabelLayout.horizontal;
    Children.forEach<ReactNode>(children, (child) => {
      if (isValidElement(child)) {
        const setChild = (arr: ReactElement<any>[], outChild: ReactElement<any>, groupProps = {}) => {
          const { type, props: outChildProps } = outChild;
          if (outChildProps.hidden) return null;
          if (type) {
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
              arr.push(cloneElement<any>(outChild, {
                ...groupProps,
                ...outChildProps,
              }));
            }
          }
        };
        setChild(childrenArray, child);
      }
    });

    function completeLine() {
      if (cols.length) {
        rows.push((<tr key={`row-${rowIndex}`}>{cols}</tr>));
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
      const fieldLabelWidth = getProperty(props, 'labelWidth', dataSet, record);
      const required = getProperty(props, 'required', dataSet, record);
      const readOnly = getProperty(props, 'readOnly', dataSet, record) || formReadOnly;
      const {
        rowSpan = 1,
        colSpan = 1,
        newLine,
        className,
        fieldClassName,
        useColon: fieldUseColon = useColon,
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
      const isOutput = (type as any).displayName === 'Output';
      const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, fieldClassName, {
        [`${prefixCls}-required`]: required && !isOutput,
        [`${prefixCls}-readonly`]: readOnly,
        [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
        [`${prefixCls}-label-output`]: isLabelLayoutHorizontal && isOutput,
        [`${prefixCls}-label-useColon`]: label && fieldUseColon && !excludeUseColonTagList.find(v => v === TagName),
      });
      const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
        [`${prefixCls}-output`]: isLabelLayoutHorizontal && isOutput,
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
            paddingLeft={this.labelLayout === LabelLayout.horizontal && separateSpacingWidth ? pxToRem(separateSpacingWidth + 5) : undefined}
            tooltip={tooltip}
          >
            {label}
          </FormItemLabel>,
        );
      }
      const fieldElementProps: any = {
        ref,
        key,
        className: classNames(prefixCls, className),
        ...otherProps,
      };
      if (!isString(type)) {
        fieldElementProps.rowIndex = rowIndex;
        fieldElementProps.colIndex = colIndex;
      }
      cols.push(
        <td
          key={`row-${rowIndex}-col-${colIndex}-field`}
          colSpan={noLabel ? newColSpan : newColSpan * 2 - ((type as typeof Item).__PRO_FORM_ITEM ? 0 : 1)}
          rowSpan={rowSpan}
          className={fieldClassName}
          style={this.labelLayout === LabelLayout.horizontal
          && separateSpacingWidth
            ? { paddingRight: pxToRem(separateSpacingWidth + 5) } : undefined}
        >
          {labelLayout === LabelLayout.vertical && !!label && (
            <label className={labelClassName}>{label}</label>
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
              // 优化当使用separateSoacing label宽度太窄问题
              style={{ width: pxToRem(labelLayout === LabelLayout.horizontal ? separateSpacingWidth + columnLabelWidth : columnLabelWidth) }}
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

    let tableStyle: CSSProperties | undefined;
    const { separateSpacing } = this;
    if (separateSpacing) {
      if (labelLayout === LabelLayout.horizontal) {
        tableStyle = {
          borderCollapse: 'separate',
          borderSpacing: `0rem ${pxToRem(separateSpacing.height)}`,
        };
      } else {
        tableStyle = {
          borderCollapse: 'separate',
          borderSpacing: `${pxToRem(separateSpacing.width)} ${pxToRem(separateSpacing.height)}`,
        };
      }
    }

    return (
      <table key="form-body" style={tableStyle} className={`${isAutoWidth ? 'auto-width' : ''}`}>
        {cols.length ? <colgroup>{cols}</colgroup> : undefined}
        <tbody>{rows}</tbody>
      </table>
    );
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
      showValidation,
    } = this;
    const { formNode } = this.context;
    const value = {
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
      showValidation,
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
        ]}
        onChange={this.handleResponsive}
      >
        <FormContext.Provider value={value}>
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
        </FormContext.Provider>
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
        const field = this.getFields().find(one => !one.isValid);
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
