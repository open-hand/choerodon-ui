import React, { Children, createElement, FormEvent, FormEventHandler, isValidElement, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { action as mobxAction, computed, isArrayLike, observable } from 'mobx';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { AxiosInstance } from 'axios';
import { getPrefixCls } from 'choerodon-ui/lib/configure';
import axios from '../axios';
import autobind from '../_util/autobind';
import { FormField, FormFieldProps, getFieldsById } from '../field/FormField';
import FormContext, { FormContextValue } from './FormContext';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import measureTextWidth from '../_util/measureTextWidth';
import { LabelAlign, LabelLayout, ResponsiveKeys } from './enum';
import { defaultColumns, defaultLabelLayout, defaultLabelWidth, FIELD_SUFFIX, getProperty, normalizeLabelWidth } from './utils';
import exception from '../_util/exception';
import EventManager from '../_util/EventManager';

/**
 * 表单name生成器
 */
const NameGen: IterableIterator<string> = function* (start: number) {
  while (true) {
    start += 1;
    yield `form-${start}`;
  }
}(0);

export type LabelWidth = number | number[];

export type LabelWidthType = LabelWidth | { [key in ResponsiveKeys]: LabelWidth };
export type LabelAlignType = LabelAlign | { [key in ResponsiveKeys]: LabelAlign };
export type LabelLayoutType = LabelLayout | { [key in ResponsiveKeys]: LabelLayout };
export type ColumnsType = number | { [key in ResponsiveKeys]: number };

export interface FormState {
  dataSet?: DataSet;
  record?: Record;
  dataIndex?: number;
  columns?: ColumnsType;
  labelWidth?: LabelWidthType;
  labelAlign?: LabelAlignType;
  labelLayout?: LabelLayoutType;
}

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

const labelWidthPropTypes = PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]);
const labelAlignPropTypes = PropTypes.oneOf([LabelAlign.left, LabelAlign.center, LabelAlign.right]);
const labelLayoutPropTypes = PropTypes.oneOf([LabelLayout.horizontal, LabelLayout.vertical, LabelLayout.placeholder, LabelLayout.float]);

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
    suffixCls: 'pro-form',
    columns: defaultColumns,
    labelWidth: defaultLabelWidth,
    labelLayout: defaultLabelLayout,
    axios,
  };

  static contextType = FormContext;

  fields: FormField<FormFieldProps>[] = [];

  @observable responsiveKey: ResponsiveKeys;

  @observable derivedState: FormState;

  @observable derivedContext: FormContextValue;

  resizeEvent: EventManager = new EventManager(typeof window !== 'undefined' && window);

  name = NameGen.next().value;

  @computed
  get dataSet(): DataSet | undefined {
    return this.derivedState.dataSet || this.derivedContext.dataSet;
  }

  @computed
  get record(): Record | undefined {
    return this.derivedState.record || this.derivedContext.record;
  }

  @computed
  get dataIndex(): number | undefined {
    return this.derivedState.dataIndex || this.derivedContext.dataIndex;
  }

  @computed
  get columns(): number {
    const { columns } = this.derivedState;
    if (isNumber(columns)) {
      return columns;
    } else if (columns) {
      return columns[this.responsiveKey] || defaultColumns;
    }
    return defaultColumns;
  }

  @computed
  get labelWidth(): LabelWidth {
    const { labelWidth } = this.derivedState;
    if (isNumber(labelWidth) || isArrayLike(labelWidth)) {
      return labelWidth;
    } else if (labelWidth) {
      return labelWidth[this.responsiveKey] || defaultLabelWidth;
    } else if (this.derivedContext.labelWidth) {
      return this.derivedContext.labelWidth;
    }
    return defaultLabelWidth;
  }

  @computed
  get labelAlign(): LabelAlign {
    const { labelAlign } = this.derivedState;
    const defaultLabelAlign = this.labelLayout === LabelLayout.vertical ? LabelAlign.left : LabelAlign.right;
    if (isString(labelAlign)) {
      return labelAlign;
    } else if (labelAlign) {
      return labelAlign[this.responsiveKey] || defaultLabelAlign;
    } else if (this.derivedContext.labelAlign) {
      return this.derivedContext.labelAlign;
    }
    return defaultLabelAlign;
  }

  @computed
  get labelLayout(): LabelLayout {
    const { labelLayout } = this.derivedState;
    if (isString(labelLayout)) {
      return labelLayout;
    } else if (labelLayout) {
      return labelLayout[this.responsiveKey] || defaultLabelLayout;
    } else if (this.derivedContext.labelLayout) {
      return this.derivedContext.labelLayout;
    }
    return defaultLabelLayout;
  }

  constructor(props, context) {
    super(props, context);
    this.setResponsiveKey();
    this.initResponsive(props, context);
  }

  handleResize = () => {
    this.setResponsiveKey();
  };

  componentDidMount() {
    this.setResponsiveKey();
  }

  componentWillReceiveProps(props, context) {
    this.initResponsive(props, context);
  }

  componentWillUnmount() {
    this.clear();
  }

  clear() {
    this.resizeEvent.clear();
  }

  @mobxAction
  setResponsiveKey(): void {
    let responsiveKey = ResponsiveKeys.xs;
    const { element } = this;
    if (element && typeof window !== 'undefined') {
      const { content } = document.defaultView.getComputedStyle(element);
      if (content) {
        try {
          responsiveKey = JSON.parse(content) as ResponsiveKeys;
        } catch (e) {
          exception(e);
          responsiveKey = content as ResponsiveKeys;
        }
      }
    }
    if (responsiveKey && responsiveKey !== this.responsiveKey) {
      this.responsiveKey = responsiveKey;
    }
  }

  @mobxAction
  initResponsive({ columns, labelWidth, labelAlign, labelLayout, dataSet, record, dataIndex },
                 {
                   labelWidth: contextLabelWidth,
                   labelAlign: contextLabelAlign,
                   labelLayout: contextLabelLayout,
                   dataSet: contextDataSet,
                   record: contextRecord,
                   dataIndex: contextDataIndex,
                 }) {
    this.derivedState = {
      dataSet,
      record,
      dataIndex,
      columns,
      labelWidth,
      labelAlign,
      labelLayout,
    };
    this.derivedContext = {
      dataSet: contextDataSet,
      record: contextRecord,
      dataIndex: contextDataIndex,
      labelWidth: contextLabelWidth,
      labelAlign: contextLabelAlign,
      labelLayout: contextLabelLayout,
    };
    this.clear();
    if (!isNumber(columns) || !(isNumber(labelWidth) || isArrayLike(labelWidth))) {
      this.resizeEvent.addEventListener('resize', this.handleResize);
    }
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
    const { props: { header }, prefixCls } = this;
    if (header) {
      return <div key="form-header" className={`${prefixCls}-header`}>{header}</div>;
    }
  }

  rasterizedChildren() {
    const { dataSet, record, columns, labelLayout, labelAlign, props: { children } } = this;
    const prefixCls = getPrefixCls(FIELD_SUFFIX);
    const labelWidth = normalizeLabelWidth(this.labelWidth, columns);
    const rows: ReactElement<any>[] = [];
    let cols: ReactElement<any>[] = [];
    let rowCount = 0;
    let colCount = [0];
    const childrenArray = Children.toArray(children);
    const noLabel = labelLayout !== LabelLayout.horizontal || childrenArray.every(child => (
      isValidElement(child) && !getProperty(child.props, 'label', dataSet, record)
    ));
    Children.forEach(children, (child, index) => {
      if (isValidElement(child)) {
        const { props, key } = child;
        const label = getProperty(props, 'label', dataSet, record);
        const required = getProperty(props, 'required', dataSet, record);
        const help = getProperty(props, 'help', dataSet, record);
        let { rowSpan = 1, colSpan = 1, newLine, ...otherProps } = props as any;
        if (newLine) {
          let count = colCount[rowCount];
          while (count) {
            cols.push(<td key={`empty-${rowCount}`} colSpan={(columns - count) * (noLabel ? 1 : 2)} />);
            rows.push((
              <tr key={`row-${rowCount}`}>
                {cols}
              </tr>
            ));
            cols = [];
            count = colCount[++rowCount];
          }
        }
        if (colSpan + colCount[rowCount] > columns) {
          colSpan = columns - colCount[rowCount];
        }
        for (let i = rowCount; i < rowSpan + rowCount; i++) {
          colCount[i] = colSpan + (colCount[i] || 0);
        }
        const labelClassName = classNames(`${prefixCls}-label`, `${prefixCls}-label-${labelAlign}`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-label-vertical`]: labelLayout === LabelLayout.vertical,
        });
        const wrapperClassName = `${prefixCls}-wrapper`;
        if (!noLabel) {
          cols.push((
            <td
              key={`row-${rowCount}-col-${colCount[rowCount]}-label`}
              className={labelClassName}
              rowSpan={rowSpan}
            >
              <label title={label && measureTextWidth(label) > labelWidth[index % columns] - (required ? 20 : 10) ? label : void 0}>
                {label}
              </label>
            </td>
          ));
        }
        const fieldElementProps = {
          key,
          className: prefixCls,
          placeholder: labelLayout === LabelLayout.placeholder ? label : void 0,
          help,
          ...otherProps,
        };
        cols.push(
          <td
            key={`row-${rowCount}-col-${colCount[rowCount]}-field`}
            colSpan={noLabel ? colSpan : colSpan * 2 - 1}
            rowSpan={rowSpan}
          >
            {labelLayout === LabelLayout.vertical && <label className={labelClassName}>{label}</label>}
            <div className={wrapperClassName}>
              {createElement(child.type, fieldElementProps)}
            </div>
          </td>,
        );
        if (colCount[rowCount] >= columns || index === childrenArray.length - 1) {
          if (cols.length) {
            rows.push((
              <tr key={`row-${rowCount}`}>
                {cols}
              </tr>
            ));
          }
          cols = [];
          rowCount++;
        }
      }
    });
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
      (
        <table key="form-body">
          {cols.length ? <colgroup>{cols}</colgroup> : void 0}
          <tbody>
          {rows}
          </tbody>
        </table>
      ),
    ];
  }

  render() {
    const { labelWidth, labelAlign, labelLayout, dataSet, record, dataIndex } = this;
    const { formNode } = this.context;
    const value = {
      formNode: formNode || this,
      dataSet,
      dataIndex,
      record,
      labelWidth,
      labelAlign,
      labelLayout,
    };
    let children: ReactNode = this.rasterizedChildren();
    if (!formNode) {
      children = (
        <form {...this.getMergedProps()} noValidate>
          {children}
        </form>
      );
    }
    // header按照现在的实现方法，不属于Form的子元素
    // 如果把header放在Form内，样式不好处理
    return (
      <FormContext.Provider value={value}>
        {children}
      </FormContext.Provider>
    );
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
            onSuccess(await this.props.axios![method || 'get'](action, processParams(e)));
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
        this.getFields().forEach((field) => field.reset());
      }
    }
  }

  checkValidity() {
    return Promise.all(this.getFields().map((field) => field.checkValidity()))
      .then(results => results.every(result => result));
  }

  getFields(): FormField<FormFieldProps>[] {
    const { id } = this.props;
    if (id) {
      return ([] as FormField<FormFieldProps>[]).concat(this.fields, getFieldsById(id));
    } else {
      return this.fields;
    }
  }

  getField(name: string): FormField<FormFieldProps> | undefined {
    return this.getFields().find((field) => field.props.name === name);
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
