import React, {
  Children,
  createElement,
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
  defaultLabelWidth,
  FIELD_SUFFIX,
  getProperty,
  normalizeLabelWidth,
} from './utils';

/**
 * 表单name生成器
 */
const NameGen: IterableIterator<string> = (function*(start: number) {
  while (true) {
    start += 1;
    yield `form-${start}`;
  }
})(0);

export type LabelWidth = number | number[];

export type LabelWidthType = LabelWidth | { [key in ResponsiveKeys]: LabelWidth };
export type LabelAlignType = LabelAlign | { [key in ResponsiveKeys]: LabelAlign };
export type LabelLayoutType = LabelLayout | { [key in ResponsiveKeys]: LabelLayout };
export type ColumnsType = number | { [key in ResponsiveKeys]: number };

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
   * 表单头，若提供则同时显示表单头和表单头下方的分隔线
   *
   * @type {string} 暂定为string方便写样式
   * @memberof FormProps
   */
  header?: string;
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
  axios?: AxiosInstance;
}

const labelWidthPropTypes = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.arrayOf(PropTypes.number),
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
    return this.observableProps.dataSet;
  }

  @computed
  get record(): Record | undefined {
    return this.observableProps.record;
  }

  @computed
  get dataIndex(): number | undefined {
    return this.observableProps.dataIndex;
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

  isDisabled() {
    return super.isDisabled() || this.context.disabled;
  }

  getObservableProps(props, context) {
    return {
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      record: 'record' in props ? props.record : context.record,
      dataIndex: defaultTo(props.dataIndex, context.dataIndex),
      labelLayout: 'labelLayout' in props ? props.labelLayout : context.labelLayout,
      labelAlign: 'labelAlign' in props ? props.labelAlign : context.labelAlign,
      labelWidth: defaultTo(props.labelWidth, context.labelWidth),
      pristine: 'pristine' in props ? props.pristine : context.pristine,
      columns: props.columns,
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

  rasterizedChildren() {
    const {
      dataSet,
      record,
      columns,
      labelLayout,
      labelAlign,
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
    Children.forEach(children, child => {
      if (isValidElement(child)) {
        if (
          noLabel === true &&
          labelLayout === LabelLayout.horizontal &&
          getProperty(child.props, 'label', dataSet, record)
        ) {
          noLabel = false;
        }
        childrenArray.push(child);
      }
    });

    function completeLine() {
      if (cols.length) {
        rows.push(<tr key={`row-${rowIndex}`}>{cols}</tr>);
        cols = [];
      }
      rowIndex++;
      colIndex = 0;
      matrix[rowIndex] = matrix[rowIndex] || [];
    }

    for (let index = 0, len = childrenArray.length; index < len; ) {
      const { props, key, type } = childrenArray[index];
      const label = getProperty(props, 'label', dataSet, record);
      const required = getProperty(props, 'required', dataSet, record);
      const {
        rowSpan = 1,
        colSpan = 1,
        newLine,
        className,
        placeholder,
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
      const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, {
        [`${prefixCls}-required`]: required,
        [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
        [`${prefixCls}-label-output`]: isOutput,
      });
      const wrapperClassName = classNames(`${prefixCls}-wrapper`, {
        [`${prefixCls}-output`]: isOutput,
      });
      if (!noLabel) {
        cols.push(
          <td
            key={`row-${rowIndex}-col-${colIndex}-label`}
            className={labelClassName}
            rowSpan={rowSpan}
          >
            <label>{label}</label>
          </td>,
        );
      }
      const fieldElementProps: any = {
        key,
        className: classNames(prefixCls, className),
        placeholder: label && labelLayout === LabelLayout.placeholder ? label : placeholder,
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
    if (!noLabel) {
      for (let i = 0; i < columns; i++) {
        cols.push(
          <col key={`label-${i}`} style={{ width: labelWidth[i % columns] }} />,
          <col key={`wrapper-${i}`} />,
        );
      }
    }
    return [
      this.getHeader(),
      <table key="form-body">
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
    const { dataSet, onReset = noop } = this.props;
    onReset(e);
    if (!e.isDefaultPrevented()) {
      if (dataSet) {
        dataSet.reset();
      } else {
        this.getFields().forEach(field => field.reset());
      }
    }
  }

  checkValidity() {
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
