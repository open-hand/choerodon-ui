import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { Cancelable, DebounceSettings } from 'lodash';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import { computed, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import isPromise from 'is-promise';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import FormContext from '../form/FormContext';
import Progress from '../progress';
import Ripple from '../ripple';
import { ButtonColor, ButtonTooltip, ButtonType, FuncType } from './enum';
import { DataSetStatus } from '../data-set/enum';
import { Size, WaitType } from '../core/enum';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import autobind from '../_util/autobind';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';

export interface ButtonProps extends DataSetComponentProps {
  /**
   * 按钮展现形式
   * @default 'raised'
   */
  funcType?: FuncType;
  /**
   * 按钮颜色风格
   * @default 'default'
   */
  color?: ButtonColor;
  /**
   * 按钮是否是加载状态
   */
  loading?: boolean;
  /**
   * 按钮图标
   */
  icon?: string;
  /**
   * 点击跳转的地址，指定此属性 button 的行为和 a 链接一致
   */
  href?: string;
  /**
   * 相当于 a 链接的 target 属性，href 存在时生效
   */
  target?: string;
  /**
   * 点击间隔时间
   */
  wait?: number;
  /**
   * 点击间隔类型，可选值：throttle | debounce
   * @default throttle
   */
  waitType?: WaitType;
  /**
   * 用tooltip显示按钮内容
   * 可选值：`none` `always` `overflow`
   */
  tooltip?: ButtonTooltip;
  /**
   * 按钮类型
   * @default 'button'
   */
  type?: ButtonType;
  block?: boolean;
  name?: string;
  value?: any;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
}

@observer
export default class Button extends DataSetComponent<ButtonProps> {
  static displayName = 'Button';

  // eslint-disable-next-line camelcase
  static __PRO_BUTTON = true;

  static contextType = FormContext;

  static propTypes = {
    /**
     * 按钮展现模式
     * 可选值：'flat' | 'raised'
     * @default raised
     */
    funcType: PropTypes.oneOf([FuncType.flat, FuncType.raised]),
    /**
     * 按钮颜色风格
     * 可选值：'default' | 'primary' | 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'dark'
     * @default 'default'
     */
    color: PropTypes.oneOf([
      ButtonColor.default,
      ButtonColor.primary,
      ButtonColor.gray,
      ButtonColor.blue,
      ButtonColor.red,
      ButtonColor.green,
      ButtonColor.yellow,
      ButtonColor.purple,
      ButtonColor.dark,
    ]),
    /**
     * 按钮类型
     * 可选值：'button' | 'submit' | 'reset'
     * @default 'button'
     */
    type: PropTypes.oneOf([ButtonType.button, ButtonType.submit, ButtonType.reset]),
    /**
     * 按钮是否是加载状态
     */
    loading: PropTypes.bool,
    /**
     * 点击跳转的地址，指定此属性 button 的行为和 a 链接一致
     */
    href: PropTypes.string,
    /**
     * 相当于 a 链接的 target 属性，href 存在时生效
     */
    target: PropTypes.string,
    /**
     * 点击等待时间
     */
    wait: PropTypes.number,
    /**
     * 点击间隔类型，可选值：throttle | debounce
     * @default throttle
     */
    waitType: PropTypes.oneOf([WaitType.throttle, WaitType.debounce]),
    /**
     * 用tooltip显示按钮内容
     * 可选值：`none` `always` `overflow`
     */
    tooltip: PropTypes.string,
    /**
     * 将按钮宽度调整为其父宽度的选项
     */
    block: PropTypes.bool,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'btn',
    type: ButtonType.button,
    waitType: WaitType.throttle,
  };

  @computed
  get loading(): boolean {
    const { type, dataSet, loading } = this.observableProps;
    return (
      loading ||
      (type === ButtonType.submit && !!dataSet && dataSet.status === DataSetStatus.submitting)
    );
  }

  set loading(loading: boolean) {
    runInAction(() => {
      this.observableProps.loading = loading;
    });
  }

  handleClickWait: Function & Cancelable;

  constructor(props, context) {
    super(props, context);
    this.handleClickWait = this.getHandleClick(props);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      loading: 'loading' in props ? props.loading : this.observableProps ? this.loading : false,
      type: props.type,
      disabled: context.disabled || props.disabled,
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    const { wait, waitType } = this.props;
    if (wait !== nextProps.wait || waitType !== nextProps.waitType) {
      this.handleClickWait = this.getHandleClick(nextProps);
    }
  }

  componentWillUnmount() {
    this.handleClickWait.cancel();
  }

  getHandleClick(props): Function & Cancelable {
    const { wait, waitType } = props;
    if (wait && waitType) {
      const options: DebounceSettings = { leading: true, trailing: true };
      if (waitType === WaitType.throttle) {
        options.trailing = false;
        options.maxWait = wait;
      } else if (waitType === WaitType.debounce) {
        options.leading = false;
      }
      return debounce(this.handleClick, wait, options);
    }
    return debounce(this.handleClick, 0);
  }

  @autobind
  handleClickIfBubble(e) {
    const { wait, waitType } = this.props;
    if (wait && waitType) {
      e.stopPropagation();
      this.handleClickWait(e);
    } else {
      this.handleClick(e);
    }
  }

  @autobind
  async handleClick(e) {
    const { onClick } = this.props;
    if (onClick) {
      const afterClick: any = onClick(e);
      if (isPromise(afterClick)) {
        try {
          this.loading = true;
          await afterClick;
        } finally {
          this.loading = false;
          // Fix asynchronous out of focus
          this.focus();
        }
      }
    }
  }

  @autobind
  handleMouseEnter(e) {
    const { tooltip = getConfig('buttonTooltip'), children } = this.props;
    const { element } = this;
    if (tooltip === ButtonTooltip.always || (tooltip === ButtonTooltip.overflow && isOverflow(element))) {
      show(element, {
        title: children,
      });
    }
    const { onMouseEnter = noop } = this.props;
    onMouseEnter(e);
  }

  @autobind
  handleMouseLeave(e) {
    hide();
    const { onMouseLeave = noop } = this.props;
    onMouseLeave(e);
  }

  isDisabled(): boolean {
    return super.isDisabled() || this.loading;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'icon',
      'funcType',
      'color',
      'loading',
      'wait',
      'waitType',
      'tooltip',
      'block',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    const { tooltip = getConfig('buttonTooltip') } = this.props;
    if (!this.disabled) {
      otherProps.onClick = this.handleClickIfBubble;
    }
    if ([ButtonTooltip.always, ButtonTooltip.overflow].includes(tooltip)) {
      otherProps.onMouseEnter = this.handleMouseEnter;
      otherProps.onMouseLeave = this.handleMouseLeave;
    }
    return otherProps;
  }

  getClassName(...props): string | undefined {
    const {
      prefixCls,
      props: {
        color = getConfig('buttonColor'),
        funcType = getConfig('buttonFuncType'),
        children,
        icon,
        block,
      },
    } = this;
    const childrenCount = Children.count(children);
    return super.getClassName(
      {
        [`${prefixCls}-${funcType}`]: funcType,
        [`${prefixCls}-${color}`]: color,
        [`${prefixCls}-icon-only`]: icon
          ? childrenCount === 0 || children === false
          : childrenCount === 1 && (children as any).type && (children as any).type.__C7N_ICON,
        [`${prefixCls}-block`]: block,
      },
      ...props,
    );
  }

  render() {
    const { children, icon, href, funcType } = this.props;
    const buttonIcon: any = this.loading ? (
      <Progress key="loading" type={ProgressType.loading} size={Size.small} />
    ) : (
      icon && <Icon type={icon} />
    );
    const hasString = Children.toArray(children).some(child => isString(child));
    const Cmp = href ? 'a' : 'button';
    const props = this.getMergedProps();
    const { disabled } = this;
    const { onMouseEnter, onMouseLeave } = props;
    const tooltipWrapper = disabled && !href && (onMouseEnter || onMouseLeave);
    const buttonProps = tooltipWrapper ? omit(props, ['className', 'style']) : props;
    const rippleDisabled = disabled || funcType === FuncType.link;
    const button = (
      <Ripple disabled={rippleDisabled}>
        <Cmp {...(href ? omit(buttonProps, ['type']) : buttonProps)}>
          {buttonIcon}
          {hasString ? <span>{children}</span> : children}
        </Cmp>
      </Ripple>
    );
    return tooltipWrapper ? (
      <span
        className={classNames(props.className, `${this.prefixCls}-disabled-wrapper`)}
        style={props.style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {button}
      </span>
    ) : button;
  }
}
