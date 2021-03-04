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
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import defaultTo from 'lodash/defaultTo';
import { AxiosInstance } from 'axios';
import Responsive from 'choerodon-ui/lib/responsive/Responsive';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import axios from '../axios';
import autobind from '../_util/autobind';
import { FormField, FormFieldProps, getFieldsById } from '../field/FormField';
import FormContext from './FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelAlign, LabelLayout, ResponsiveKeys } from './enum';
import {
  defaultColumns,
  defaultExcludeUseColonTag,
  defaultLabelWidth,
  FIELD_SUFFIX,
  findFirstInvalidElement,
  getProperty,
  normalizeLabelWidth,
} from './utils';
import FormVirtualGroup from './FormVirtualGroup';

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
export type SeparateSpacing = { width: number, height: number }

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
  useColon?: boolean,
  /**
   * 不使用冒号的列表
   */
  excludeUseColonTagList?: string[],
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
   * 切分单元格间隔，当label布局为默认值horizontal时候使用padding修改单元格横向间距可能需要结合labelwidth效果会更好
   */
  separateSpacing?: SeparateSpacing;
  axios?: AxiosInstance;
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
]);

@observer
export default class Form extends DataSetComponent<FormProps> {
  static displayName = 'Form';

  static FormVirtualGroup = FormVirtualGroup;

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
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'form',
    columns: defaultColumns,
    labelWidth: defaultLabelWidth,
  };

  static contextType = FormContext;

  fields: FormField<FormFieldProps>[] = [];

  @observable responsiveItems: any[];

  name = NameGen.next().value;

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
  get dataIndex(): number | undefined {
    return this.observableProps.dataIndex;
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
    if (isNumber(labelWidth) || isArrayLike(labelWidth)) {
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
    const defaultLabelLayout = (getConfig('labelLayout') as LabelLayout) || LabelLayout.horizontal;
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
    return defaultLabelLayout;
  }

  @computed
  get pristine(): boolean {
    return this.observableProps.pristine;
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

  isDisabled(): boolean {
    return super.isDisabled() || this.context.disabled;
  }

  isReadOnly() {
    return this.props.readOnly || this.context.readOnly;
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      record: 'record' in props ? props.record : context.record,
      dataIndex: defaultTo(props.dataIndex, context.dataIndex),
      labelLayout: 'labelLayout' in props ? props.labelLayout : context.labelLayout,
      labelAlign: 'labelAlign' in props ? props.labelAlign : context.labelAlign,
      labelWidth: defaultTo(props.labelWidth, context.labelWidth),
      pristine: 'pristine' in props ? props.pristine : context.pristine,
      columns: props.columns,
      useColon: props.useColon,
      excludeUseColonTagList: props.excludeUseColonTagList,
      separateSpacing: props.separateSpacing,
    };
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'record',
      'dataIndex',
      'onSuccess',
      'onError',
      'processParams',
      'labelWidth',
      'labelAlign',
      'labelLayout',
      'columns',
      'pristine',
      'axios',
      'useColon',
      'excludeUseColonTagList',
      'separateSpacing',
    ]);
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


  componentWillUnmount() {
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { dataSet } = this;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, 'validate', this.handleDataSetValidate);
    }
  }

  // 处理校验失败定位
  @autobind
  async handleDataSetValidate({ result }) {
    if (!await result) {
      const item = this.element ? findFirstInvalidElement(this.element) : null;
      if (item) {
        item.focus();
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
      useColon,
      excludeUseColonTagList,
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
    const childrenArray: ReactElement<any>[] = [];
    const separateSpacingWidth: number = this.separateSpacing ? this.separateSpacing.width / 2 : 0;
    Children.forEach(children, child => {
      if (isValidElement(child)) {
        const setChild = (arr, outChild, groupProps = {}) => {
          if (
            noLabel === true &&
            labelLayout === LabelLayout.horizontal &&
            getProperty(outChild.props, 'label', dataSet, record)
          ) {
            noLabel = false;
          }
          if (!outChild?.type) {
            return;
          }
          if (outChild?.type && (outChild.type as any).displayName === 'FormVirtualGroup') {
            if (!outChild.props.children) {
              return;
            }
            if (isArray(outChild.props.children)) {
              outChild.props.children.forEach((c) => {
                setChild(arr, c, omit(outChild.props, ['children']));
              });
            } else if (outChild?.type && (outChild.type as any).displayName === 'FormVirtualGroup') {
              setChild(arr, outChild.props.children, omit(outChild.props, ['children']));
            } else {
              arr.push(cloneElement(outChild.props.children, {
                ...groupProps,
                ...outChild.props.children.props,
              }));
            }
          } else {
            arr.push(cloneElement(outChild, {
              ...groupProps,
              ...outChild.props,
            }));
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
      const { props, key, type } = childrenArray[index];

      let TagName = type;
      if (isFunction(type)) {
        TagName = (type as any).displayName;
      }

      const label = getProperty(props, 'label', dataSet, record);
      const fieldLabelWidth = getProperty(props, 'labelWidth', dataSet, record);
      const required = getProperty(props, 'required', dataSet, record);
      const readOnly = getProperty(props, 'readOnly', dataSet, record) || this.isReadOnly();
      const {
        rowSpan = 1,
        colSpan = 1,
        newLine,
        className,
        fieldClassName,
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
      const isOutput =
        labelLayout === LabelLayout.horizontal && (type as any).displayName === 'Output';
      const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, fieldClassName, {
        [`${prefixCls}-required`]: required,
        [`${prefixCls}-readonly`]: readOnly,
        [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
        [`${prefixCls}-label-output`]: isOutput,
        [`${prefixCls}-label-useColon`]: useColon && !excludeUseColonTagList.find(v => v === TagName),
      });
      const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
        [`${prefixCls}-output`]: isOutput,
      });
      if (!noLabel) {
        if (!isNaN(fieldLabelWidth)) {
          labelWidth[colIndex] = Math.max(labelWidth[colIndex], fieldLabelWidth);
        }
        cols.push(
          <td
            key={`row-${rowIndex}-col-${colIndex}-label`}
            className={labelClassName}
            rowSpan={rowSpan}
            style={this.labelLayout === LabelLayout.horizontal
            && separateSpacingWidth
              ? { paddingLeft: pxToRem(separateSpacingWidth + 5) } : undefined}
          >
            <label title={isString(label) ? label : ''}>
              <span>
                {label}
              </span>
            </label>
          </td>,
        );
      }
      const fieldElementProps: any = {
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
          colSpan={noLabel ? newColSpan : newColSpan * 2 - 1}
          rowSpan={rowSpan}
          className={fieldClassName}
          style={this.labelLayout === LabelLayout.horizontal
          && separateSpacingWidth
            ? { paddingRight: pxToRem(separateSpacingWidth + 5) } : undefined}
        >
          {labelLayout === LabelLayout.vertical && (
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
    // 优化当使用separateSoacing label宽度太窄问题
    const labelWidthProcess = (widthInner: number) => {
      if (isNumber(widthInner)) {
        if (this.labelLayout === LabelLayout.horizontal) {
          return separateSpacingWidth + widthInner;
        }
        return widthInner;
      }
      return separateSpacingWidth + defaultLabelWidth;
    };
    if (!noLabel) {
      for (let i = 0; i < columns; i++) {
        cols.push(
          <col key={`label-${i}`} style={{ width: pxToRem(labelWidthProcess(labelWidth[i % columns])) }} />,
          <col key={`wrapper-${i}`} />,
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
      if (this.labelLayout === LabelLayout.horizontal) {
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

    const isAutoWidth = this.labelWidth === 'auto' || (isArrayLike(this.labelWidth) && this.labelWidth.some(w => w === 'auto'));

    return [
      this.getHeader(),
      <table style={tableStyle} key="form-body" className={`${isAutoWidth ? 'auto-width' : ''}`}>
        {cols.length ? <colgroup>{cols}</colgroup> : undefined}
        <tbody>{rows}</tbody>
      </table>,
    ];
  }

  render() {
    const {
      labelWidth,
      labelAlign,
      labelLayout,
      pristine,
      dataSet,
      record,
      dataIndex,
      observableProps,
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
      pristine,
      disabled: this.isDisabled(),
      readOnly: this.isReadOnly(),
    };
    let children: ReactNode = this.rasterizedChildren();
    if (!formNode) {
      children = (
        <form {...this.getMergedProps()} noValidate>
          {children}
        </form>
      );
    }
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
        <FormContext.Provider value={value}>{children}</FormContext.Provider>
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

  checkValidity() {
    const { dataSet } = this;
    if (dataSet) {
      if (!dataSet.length) {
        dataSet.create();
      }
      return dataSet.validate();
    }
    return Promise.all(this.getFields().map(field => field.checkValidity())).then(results =>
      results.every(result => result),
    );
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
