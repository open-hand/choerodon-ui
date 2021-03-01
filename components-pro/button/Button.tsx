import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { Cancelable, DebounceSettings } from 'lodash';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import { computed, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import FormContext from '../form/FormContext';
import Progress from '../progress';
import Ripple from '../ripple';
import { ButtonColor, ButtonType, FuncType } from './enum';
import { DataSetStatus } from '../data-set/enum';
import { WaitType, Size } from '../core/enum';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import autobind from '../_util/autobind';

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
   * 按钮类型
   * @default 'button'
   */
  type?: ButtonType;
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
    let loading = false;
    if ('loading' in props) {
      loading = props.loading;
    }
    return {
      ...super.getObservableProps(props, context),
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      loading,
      type: props.type,
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let loading = this.loading;
    if ('loading' in nextProps) {
      loading = nextProps.loading;
    }
    super.componentWillReceiveProps({
      ...nextProps,
      loading,
    }, nextContext);
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
      if (afterClick && afterClick instanceof Promise) {
        try {
          this.loading = true;
          await afterClick;
        } finally {
          this.loading = false;
        }
      }
    }
  }

  isDisabled(): boolean {
    const { disabled } = this.context;
    return disabled || super.isDisabled() || this.loading;
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'icon',
      'funcType',
      'color',
      'loading',
      'wait',
      'waitType',
    ]);
    if (!this.isDisabled()) {
      otherProps.onClick = this.handleClickIfBubble;
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
      },
      ...props,
    );
  }

  render() {
    const { children, icon, href } = this.props;
    const buttonIcon: any = this.loading ? (
      <Progress key="loading" type={ProgressType.loading} size={Size.small} />
    ) : (
      icon && <Icon type={icon} />
    );
    const hasString = Children.toArray(children).some(child => isString(child));
    const Cmp = href ? 'a' : 'button';
    const props = this.getMergedProps();
    return (
      <Ripple disabled={this.isDisabled()}>
        <Cmp {...(href ? omit(props, ['type']) : props)}>
          {buttonIcon}
          {hasString ? <span>{children}</span> : children}
        </Cmp>
      </Ripple>
    );
  }
}
