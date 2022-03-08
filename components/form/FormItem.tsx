import React, { isValidElement, cloneElement, Children, Component, CSSProperties, ReactElement, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import flatMap from 'lodash/flatMap';
import classNames from 'classnames';
import Col, { ColProps } from '../grid/col';
import warning from '../_util/warning';
import { FIELD_DATA_PROP, FIELD_META_PROP } from './constants';
import PureRenderMixin from '../rc-components/util/PureRenderMixin';
import Animate from '../animate';
import Row from '../grid/row';
import { FormItemValidateStatus } from './enum';
import FormContext, { FormContextValue } from './FormContext';

function intersperse(arr: Array<any>, inter: any) {
  return flatMap(arr, (a, i) => i ? [inter, a] : [a]);
}

export interface FormItemProps {
  prefixCls?: string;
  rowPrefixCls?: string;
  colPrefixCls?: string;
  className?: string;
  id?: string;
  label?: ReactNode;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  help?: ReactNode;
  extra?: ReactNode;
  validateStatus?: FormItemValidateStatus;
  hasFeedback?: boolean;
  required?: boolean;
  style?: CSSProperties;
  colon?: boolean;
  labelLayout?: 'float' | 'none' | 'horizontal';
  helpTransitionName?: string;
}

export default class FormItem extends Component<FormItemProps, any> {
  static displayName = 'FormItem';

  static defaultProps = {
    hasFeedback: false,
    colon: true,
    labelLayout: 'float',
  };

  static __FORM_ITEM = true;

  static get contextType(): typeof FormContext {
    return FormContext;
  }

  context: FormContextValue;

  helpShow = false;

  componentDidMount() {
    const { children } = this.props;
    warning(
      this.getControls(children, true).length <= 1,
      '`Form.Item` cannot generate `validateStatus` and `help` automatically, ' +
      'while there are more than one `getFieldDecorator` in it.',
    );
  }

  shouldComponentUpdate(...args: any[]) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  getHelpMsg() {
    const { help } = this.props;
    if (help === undefined && this.getOnlyControl()) {
      const errors = this.getField().errors;
      if (errors) {
        return intersperse(errors.map((e: any, index: number) => (
          isValidElement(e.message)
            ? cloneElement(e.message, { key: index })
            : e.message
        )), ' ');
      }
      return '';
    }

    return help;
  }

  getControls(children: ReactNode, recursively: boolean) {
    let controls: ReactElement<any>[] = [];
    const childrenArray = Children.toArray(children);
    for (let i = 0; i < childrenArray.length; i++) {
      if (!recursively && controls.length > 0) {
        break;
      }

      const child = childrenArray[i] as ReactElement<any>;
      if (
        child.type &&
        ((child.type as any) === FormItem || (child.type as any).displayName === 'FormItem' || (child.type as any).__FORM_ITEM)
      ) {
        continue;
      }
      if (!child.props) {
        continue;
      }
      if (FIELD_META_PROP in child.props) {
        // And means FIELD_DATA_PROP in chidl.props, too.
        controls.push(child);
      } else if (child.props.children) {
        controls = controls.concat(this.getControls(child.props.children, recursively));
      }
    }
    return controls;
  }

  getOnlyControl() {
    const { children } = this.props;
    const child = this.getControls(children, false)[0];
    return child !== undefined ? child : null;
  }

  getChildProp(prop: string) {
    const child = this.getOnlyControl() as ReactElement<any>;
    return child && child.props && child.props[prop];
  }

  getId() {
    return this.getChildProp('id');
  }

  getMeta() {
    return this.getChildProp(FIELD_META_PROP);
  }

  getField() {
    return this.getChildProp(FIELD_DATA_PROP);
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('form', prefixCls);
  }

  onHelpAnimEnd = (_key: string, helpShow: boolean) => {
    this.helpShow = helpShow;
    if (!helpShow) {
      this.setState({});
    }
  };

  renderHelp() {
    const { helpTransitionName = 'show-error' } = this.props;
    const prefixCls = this.getPrefixCls();
    const help = this.getHelpMsg();
    const children = help ? (
      <div className={`${prefixCls}-explain`} key="help">
        {help}
      </div>
    ) : null;
    if (children) {
      this.helpShow = !!children;
    }
    return (
      <Animate
        transitionName={helpTransitionName}
        component=""
        transitionAppear
        key="help"
        onEnd={this.onHelpAnimEnd}
      >
        {children}
      </Animate>
    );
  }

  renderExtra() {
    const { extra } = this.props;
    const prefixCls = this.getPrefixCls();
    return extra ? <div className={`${prefixCls}-extra`}>{extra}</div> : null;
  }

  getValidateStatus(): FormItemValidateStatus | undefined {
    const onlyControl = this.getOnlyControl();
    if (onlyControl) {
      const field = this.getField();
      if (field.validating) {
        return FormItemValidateStatus.validating;
      }
      if (field.errors) {
        return FormItemValidateStatus.error;
      }
      const fieldValue = 'value' in field ? field.value : this.getMeta().initialValue;
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        return FormItemValidateStatus.success;
      }
    }
  }

  renderValidateWrapper(c1: ReactNode, c2: ReactNode, c3: ReactNode) {
    const props = this.props;
    const prefixCls = this.getPrefixCls();
    const onlyControl = this.getOnlyControl();
    const validateStatus =
      props.validateStatus === undefined && onlyControl
        ? this.getValidateStatus()
        : props.validateStatus;

    let classes = `${prefixCls}-item-control`;
    if (validateStatus) {
      classes = classNames(`${prefixCls}-item-control`, {
        'has-feedback': props.hasFeedback || validateStatus === FormItemValidateStatus.validating,
        'has-success': validateStatus === FormItemValidateStatus.success,
        'has-warning': validateStatus === FormItemValidateStatus.warning,
        'has-error': validateStatus === FormItemValidateStatus.error,
        'is-validating': validateStatus === FormItemValidateStatus.validating,
      });
    }

    // 必输字段,输入框加黄色背景, 解决表格行内编辑,没有label的情况下没有提示必输标示的问题
    const required = this.isRequired();
    if (required) {
      classes = classNames(classes, [`${prefixCls}-item-required`]);
    }

    return (
      <div className={classes}>
        <span className={`${prefixCls}-item-children`}>{c1}</span>
        {c2}
        {c3}
      </div>
    );
  }

  renderWrapper(children: ReactNode) {
    const { wrapperCol, labelLayout, colPrefixCls } = this.props;
    const prefixCls = this.getPrefixCls();
    const required = this.isRequired();
    const isHorizontal = labelLayout === 'horizontal';
    const className = classNames(
      `${prefixCls}-item-control-wrapper`,
      wrapperCol && wrapperCol.className,
      {
        'is-required': isHorizontal ? undefined : required,
      },
    );
    return isHorizontal ? (
      <Col prefixCls={colPrefixCls} {...wrapperCol} className={className} key="wrapper">
        {children}
      </Col>
    ) : (
      <div className={className} key="wrapper">
        {children}
      </div>
    );
  }

  isRequired() {
    const { required } = this.props;
    if (required !== undefined) {
      return required;
    }
    if (this.getOnlyControl()) {
      const meta = this.getMeta() || {};
      const validate = meta.validate || [];

      return validate
        .filter((item: any) => !!item.rules)
        .some((item: any) => {
          return item.rules.some((rule: any) => rule.required);
        });
    }
    return false;
  }

  // Resolve duplicated ids bug between different forms

  onLabelClick = (e: any) => {
    const { label, id: propId } = this.props;
    const id = propId || this.getId();
    if (!id) {
      return;
    }
    const controls = document.querySelectorAll(`[id="${id}"]`);
    if (controls.length !== 1) {
      // Only prevent in default situation
      // Avoid preventing event in `label={<a href="xx">link</a>}``
      if (typeof label === 'string') {
        e.preventDefault();
      }
      const control = (findDOMNode(this) as HTMLElement).querySelector(
        `[id="${id}"]`,
      ) as HTMLElement;
      if (control && control.focus) {
        control.focus();
      }
    }
  };

  renderLabel() {
    const { prefixCls, label, labelCol, colon, id, colPrefixCls } = this.props;
    const context = this.context;
    const required = this.isRequired();

    const labelColClassName = classNames(
      `${prefixCls}-item-label`,
      labelCol && labelCol.className,
    );
    const labelClassName = classNames({
      [`${prefixCls}-item-required`]: required,
    });

    let labelChildren = label;
    // Keep label is original where there should have no colon
    const haveColon = colon && !context.vertical;
    // Remove duplicated user input colon
    if (haveColon && typeof label === 'string' && (label as string).trim() !== '') {
      labelChildren = (label as string).replace(/[：|:]\s*$/, '');
    }

    return label ? (
      <Col prefixCls={colPrefixCls} {...labelCol} className={labelColClassName} key="label">
        <label
          htmlFor={id || this.getId()}
          className={labelClassName}
          title={typeof label === 'string' ? label : ''}
          onClick={this.onLabelClick}
        >
          {labelChildren}
        </label>
      </Col>
    ) : null;
  }

  renderChildren() {
    const { children, labelLayout } = this.props;
    return [
      labelLayout === 'horizontal' && this.renderLabel(),
      this.renderWrapper(
        this.renderValidateWrapper(children, this.renderHelp(), this.renderExtra()),
      ),
    ];
  }

  renderFormItem(children: ReactNode) {
    const props = this.props;
    const prefixCls = this.getPrefixCls();
    const style = props.style;
    const itemClassName = {
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-with-help`]: this.helpShow,
      [`${prefixCls}-item-no-colon`]: !props.colon,
      [`${props.className}`]: !!props.className,
    };

    return props.labelLayout === 'horizontal' ? (
      <Row prefixCls={props.rowPrefixCls} className={classNames(itemClassName)} style={style}>
        {children}
      </Row>
    ) : (
      <div className={classNames(itemClassName)} style={style}>
        {children}
      </div>
    );
  }

  render() {
    const children = this.renderChildren();
    return this.renderFormItem(children);
  }
}
