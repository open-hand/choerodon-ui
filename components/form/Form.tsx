import React, { Component, ComponentClass, CSSProperties, FormEvent, FormEventHandler, ReactNode, SFC } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import warning from '../_util/warning';
import FormItem from './FormItem';
import { FIELD_DATA_PROP, FIELD_META_PROP } from './constants';
import { createFormField } from '../rc-components/form';
import createDOMForm from '../rc-components/form/createDOMForm';
import PureRenderMixin from '../rc-components/util/PureRenderMixin';
import { FormLayout } from './enum';
import { getPrefixCls } from '../configure';

export interface FormCreateOption<T> {
  onFieldsChange?: (props: T, fields: Array<any>) => void;
  onValuesChange?: (props: T, values: any) => void;
  mapPropsToFields?: (props: T) => void;
  withRef?: boolean;
}

export interface FormProps {
  layout?: FormLayout;
  form?: WrappedFormUtils;
  onSubmit?: FormEventHandler<any>;
  style?: CSSProperties;
  className?: string;
  prefixCls?: string;
  hideRequiredMark?: boolean;
}

export type ValidationRule = {
  /** validation error message */
  message?: string;
  /** built-in validation type, available options: https://github.com/yiminghe/async-validator#type */
  type?: string;
  /** indicates whether field is required */
  required?: boolean;
  /** treat required fields that only contain whitespace as errors */
  whitespace?: boolean;
  /** validate the exact length of a field */
  len?: number;
  /** validate the min length of a field */
  min?: number;
  /** validate the max length of a field */
  max?: number;
  /** validate the value from a list of possible values */
  enum?: string | string[];
  /** validate from a regular expression */
  pattern?: RegExp;
  /** transform a value before validation */
  transform?: (value: any) => any;
  /** custom validate function (Note: callback must be called) */
  validator?: (rule: any, value: any, callback: any, source?: any, options?: any) => any;
};

export type ValidateCallback = (errors: any, values: any, modify?: boolean) => void;

export type GetFieldDecoratorOptions = {
  /** 子节点的值的属性，如 Checkbox 的是 'checked' */
  valuePropName?: string;
  /** 子节点的初始值，类型、可选值均由子节点决定 */
  initialValue?: any;
  /** 收集子节点的值的时机 */
  trigger?: string;
  /** 可以把 onChange 的参数转化为控件的值，例如 DatePicker 可设为：(date, dateString) => dateString */
  getValueFromEvent?: (...args: any[]) => any;
  /** 校验子节点值的时机 */
  validateTrigger?: string | string[];
  /** 校验规则，参见 [async-validator](https://github.com/yiminghe/async-validator) */
  rules?: ValidationRule[];
  /** 是否和其他控件互斥，特别用于 Radio 单选控件 */
  exclusive?: boolean;
  /** Normalize value to form component */
  normalize?: (value: any, prevValue: any, allValues: any) => any;
  /** Whether stop validate on first rule of error for this field.  */
  validateFirst?: boolean;
};

// function create
export type WrappedFormUtils = {
  /** 获取一组输入控件的值，如不传入参数，则获取全部组件的值 */
  getFieldsValue(fieldNames?: Array<string>): Object;
  /** 获取一个输入控件的值*/
  getFieldValue(fieldName: string): any;
  /** 设置一组输入控件的值*/
  setFieldsValue(obj: Object): void;
  /** 设置一组输入控件的值*/
  setFields(obj: Object): void;
  /** 校验并获取一组输入域的值与 Error */
  validateFields(fieldNames: Array<string>, options: Object, callback: ValidateCallback): void;
  validateFields(fieldNames: Array<string>, callback: ValidateCallback): void;
  validateFields(options: Object, callback: ValidateCallback): void;
  validateFields(callback: ValidateCallback): void;
  validateFields(): void;
  /** 与 `validateFields` 相似，但校验完后，如果校验不通过的菜单域不在可见范围内，则自动滚动进可见范围 */
  validateFieldsAndScroll(fieldNames?: Array<string>, options?: Object, callback?: ValidateCallback): void;
  validateFieldsAndScroll(fieldNames?: Array<string>, callback?: ValidateCallback): void;
  validateFieldsAndScroll(options?: Object, callback?: ValidateCallback): void;
  validateFieldsAndScroll(callback?: ValidateCallback): void;
  validateFieldsAndScroll(): void;
  /** 获取某个输入控件的 Error */
  getFieldError(name: string): Object[];
  getFieldsError(names?: Array<string>): Object;
  /** 判断一个输入控件是否在校验状态*/
  isFieldValidating(name: string): boolean;
  isFieldTouched(name: string): boolean;
  isFieldsTouched(names?: Array<string>): boolean;
  /** 重置一组输入控件的值与状态，如不传入参数，则重置所有组件 */
  resetFields(names?: Array<string>): void;
  isModifiedFields(names?: Array<string>): boolean;
  isModifiedField(name: string): boolean;
  getFieldDecorator(id: string, options?: GetFieldDecoratorOptions): (node: ReactNode) => ReactNode;
};

export interface FormComponentProps {
  form: WrappedFormUtils;
}

export interface ComponentDecorator {
  <P extends FormComponentProps>(component: ComponentClass<P> | SFC<P>): ComponentClass<Omit<P, keyof FormComponentProps>>;
}

export default class Form extends Component<FormProps, any> {
  static displayName = 'Form';
  static defaultProps = {
    layout: FormLayout.horizontal,
    hideRequiredMark: false,
    onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
    },
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    layout: PropTypes.oneOf([FormLayout.horizontal, FormLayout.inline, FormLayout.vertical]),
    children: PropTypes.any,
    onSubmit: PropTypes.func,
    hideRequiredMark: PropTypes.bool,
  };

  static childContextTypes = {
    vertical: PropTypes.bool,
  };

  static Item = FormItem;

  static createFormField = createFormField;

  static create = function <TOwnProps>(options: FormCreateOption<TOwnProps> = {}): ComponentDecorator {
    return createDOMForm({
      fieldNameProp: 'id',
      ...options,
      fieldMetaProp: FIELD_META_PROP,
      fieldDataProp: FIELD_DATA_PROP,
    });
  };

  constructor(props: FormProps) {
    super(props);

    warning(!props.form, 'It is unnecessary to pass `form` to `Form`');
  }

  shouldComponentUpdate(...args: any[]) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  getChildContext() {
    const { layout } = this.props;
    return {
      vertical: layout === 'vertical',
    };
  }

  render() {
    const {
      prefixCls: customizePrefixCls, hideRequiredMark, className = '', layout,
    } = this.props;
    const prefixCls = getPrefixCls('form', customizePrefixCls);
    const formClassName = classNames(prefixCls, {
      [`${prefixCls}-${layout}`]: layout,
      [`${prefixCls}-hide-required-mark`]: hideRequiredMark,
    }, className);

    const formProps = omit(this.props, [
      'prefixCls',
      'className',
      'layout',
      'form',
      'hideRequiredMark',
    ]);

    return <form {...formProps} className={formClassName} />;
  }
}
