import React, { Children, Component, CSSProperties, ReactElement, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ColProps } from '../grid/col';
import warning from '../_util/warning';
import { FIELD_DATA_PROP, FIELD_META_PROP } from './constants';
import PureRenderMixin from '../rc-components/util/PureRenderMixin';
import Animate from '../animate';
import { FormItemValidateStatus } from './enum';
import { getPrefixCls } from '../configure';

export interface FormItemProps {
  prefixCls?: string;
  className?: string;
  id?: string;
  label?: ReactNode;
  wrapperCol?: ColProps;
  help?: ReactNode;
  extra?: ReactNode;
  validateStatus?: FormItemValidateStatus;
  hasFeedback?: boolean;
  required?: boolean;
  style?: CSSProperties;
  colon?: boolean;
}

export interface FormItemContext {
  vertical: boolean;
}

export default class FormItem extends Component<FormItemProps, any> {
  static displayName = 'FormItem';

  static defaultProps = {
    hasFeedback: false,
    colon: true,
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    help: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    validateStatus: PropTypes.oneOf([
      FormItemValidateStatus.success,
      FormItemValidateStatus.warning,
      FormItemValidateStatus.error,
      FormItemValidateStatus.validating,
    ]),
    hasFeedback: PropTypes.bool,
    wrapperCol: PropTypes.object,
    className: PropTypes.string,
    id: PropTypes.string,
    children: PropTypes.node,
    colon: PropTypes.bool,
  };

  static contextTypes = {
    vertical: PropTypes.bool,
  };

  context: FormItemContext;

  state = { helpShow: false };

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
    const props = this.props;
    const onlyControl = this.getOnlyControl();
    if (props.help === undefined && onlyControl) {
      const errors = this.getField().errors;
      return errors ? errors.map((e: any) => e.message).join(', ') : '';
    }

    return props.help;
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
        ((child.type as any) === FormItem || (child.type as any).displayName === 'FormItem')
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
    return getPrefixCls('form', prefixCls);
  }

  onHelpAnimEnd = (_key: string, helpShow: boolean) => {
    this.setState({ helpShow });
  };

  renderHelp() {
    const prefixCls = this.getPrefixCls();
    const help = this.getHelpMsg();
    const children = help ? (
      <div className={`${prefixCls}-explain`} key="error">
        {help}
      </div>
    ) : null;
    return (
      <Animate
        transitionName="show-error"
        component=""
        transitionAppear
        key="error"
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
    return (
      <div className={classes}>
        <span className={`${prefixCls}-item-children`}>{c1}</span>
        {c2}
        {c3}
      </div>
    );
  }

  renderWrapper(children: ReactNode) {
    const { wrapperCol } = this.props;
    const prefixCls = this.getPrefixCls();
    const required = this.isRequired();
    const className = classNames(
      `${prefixCls}-item-control-wrapper`,
      wrapperCol && wrapperCol.className,
      {
        'is-required': required,
      },
    );
    return (
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

  renderChildren() {
    const { children } = this.props;
    return [
      // this.renderLabel(),
      this.renderWrapper(
        this.renderValidateWrapper(children, this.renderHelp(), this.renderExtra()),
      ),
    ];
  }

  renderFormItem(children: ReactNode) {
    const props = this.props;
    const { helpShow } = this.state;
    const prefixCls = this.getPrefixCls();
    const style = props.style;
    const itemClassName = {
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-with-help`]: !!this.getHelpMsg() || helpShow,
      [`${prefixCls}-item-no-colon`]: !props.colon,
      [`${props.className}`]: !!props.className,
    };

    return (
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
