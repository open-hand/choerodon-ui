import React, { Children, CSSProperties, ReactNode } from 'react';
import { DebouncedFunc, DebounceSettings, isFunction } from 'lodash';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import { computed, observable, runInAction, action, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import isPromise from 'is-promise';
import { isFragment as isReactFragment } from 'react-is';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import Icon from '../icon';
import FormContext from '../form/FormContext';
import Progress from '../progress';
import Ripple from '../ripple';
import { ButtonColor, ButtonTooltip, ButtonType, FuncType } from './enum';
import { DataSetStatus } from '../data-set/enum';
import { Size, WaitType } from '../core/enum';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import { TooltipProps } from '../tooltip/Tooltip';
import autobind from '../_util/autobind';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';
import getReactNodeText from '../_util/getReactNodeText';
import { cloneElement } from '../_util/reactNode';

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
   * 可选值：`none` `always` `overflow` 或自定义 tooltip
   * 配置自定义tooltip属性：tooltip={['always', { theme: 'light', ... }]}
   */
  tooltip?: ButtonTooltip | [ButtonTooltip, TooltipProps];
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
  children?: ReactNode;
}

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

// Insert one space between two chinese characters automatically.
function insertSpace(child: React.ReactChild, needInserted: boolean) {
  // Check the child if is undefined or null.
  if (child == null) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  if (typeof child === 'string') {
    return isTwoCNChar(child) ? <span>{child.split('').join(SPACE)}</span> : <span>{child}</span>;
  }
  if (isReactFragment(child)) {
    return <span>{child}</span>;
  }
  return child;
}

function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure = false;
  const childList: React.ReactNode[] = [];
  React.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  // Pass to React.Children.map to auto fill key
  return React.Children.map(childList, child =>
    insertSpace(child as React.ReactChild, needInserted),
  );
}

@observer
export default class Button extends DataSetComponent<ButtonProps> {
  static displayName = 'Button';

  // eslint-disable-next-line camelcase
  static __PRO_BUTTON = true;

  static get contextType(): typeof FormContext {
    return FormContext;
  }

  static defaultProps = {
    suffixCls: 'btn',
    type: ButtonType.button,
    waitType: WaitType.throttle,
  };

  @observable hasTwoCNChar: boolean;

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

  isTooltipShown?: boolean;

  handleClickWait: DebouncedFunc<(e) => Promise<void>>;

  constructor(props, context) {
    super(props, context);
    this.handleClickWait = this.getHandleClick(props);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      dataSet: 'dataSet' in props ? props.dataSet : context.dataSet,
      loading: 'loading' in props ? props.loading : this.observableProps ? this.observableProps.loading : false,
      type: props.type,
      disabled: context.disabled || props.disabled,
    };
  }

  @autobind
  @action
  fixTwoCNChar() {
    // For HOC usage
    const autoInsertSpace = this.getContextConfig('autoInsertSpaceInButton') !== false;
    if (!this.element || !autoInsertSpace) {
      return;
    }
    const buttonText = this.element.textContent;
    if (this.isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!this.hasTwoCNChar) {
        this.hasTwoCNChar = true;
      }
    } else if (this.hasTwoCNChar) {
      this.hasTwoCNChar = false;
    }
  }

  componentDidMount(): void {
    super.componentDidMount();
    this.fixTwoCNChar();
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
    if (this.isTooltipShown) {
      hide();
      delete this.isTooltipShown;
    }
  }

  getHandleClick(props): DebouncedFunc<(e) => Promise<void>> {
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
    if (isFunction(e.persist)) e.persist();
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
    const onButtonClick = this.context.getConfig('onButtonClick');
    if (onButtonClick && e) {
      const { target } = e;
      const { children, icon } = this.props;
      const promise = Promise.resolve(target && (target as HTMLButtonElement | HTMLAnchorElement).textContent || getReactNodeText(children));
      promise.then(title => onButtonClick({ icon, title }));
    }
    const { onClick } = this.props;
    if (onClick) {
      const afterClick: any = onClick(e);
      if (isPromise(afterClick)) {
        try {
          this.loading = true;
          await afterClick;
        } finally {
          this.loading = false;
        }
      }
    }
  }

  @autobind
  handleMouseEnter(e) {
    const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const { tooltip = getTooltip('button'), children } = this.props;
    const { element } = this;
    if (tooltip === ButtonTooltip.always || (tooltip === ButtonTooltip.overflow && isOverflow(element))) {
      show(element, {
        title: children,
        theme: getTooltipTheme('button'),
        placement: getTooltipPlacement('button'),
      });
      this.isTooltipShown = true;
    } else if (isArrayLike(tooltip)){
      const tooltipType = tooltip[0];
      const buttonTooltipProps = tooltip[1] || {};
      const duration: number = (buttonTooltipProps.mouseEnterDelay || 0.1) * 1000;
      if (tooltipType === ButtonTooltip.always || (tooltipType === ButtonTooltip.overflow && isOverflow(element))) {
        show(element, {
          theme: getTooltipTheme('button'),
          placement: getTooltipPlacement('button'),
          title: buttonTooltipProps.title ? buttonTooltipProps.title : children,
          ...buttonTooltipProps,
        }, duration);
        this.isTooltipShown = true;
      }
    }
    const { onMouseEnter = noop } = this.props;
    onMouseEnter(e);
  }

  @autobind
  handleMouseLeave(e) {
    if (this.isTooltipShown) {
      const { getTooltip } = this.context;
      const { tooltip = getTooltip('button') } = this.props;
      if(isArrayLike(tooltip)) {
        const buttonTooltipProps = tooltip[1] || {};
        const duration: number = (buttonTooltipProps.mouseLeaveDelay || 0.1) * 1000;
        hide(duration);
      } else {
        hide();
      }
      delete this.isTooltipShown;
    }
    const { onMouseLeave = noop } = this.props;
    onMouseLeave(e);
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
      'onClick',
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    const { getTooltip } = this.context;
    const { tooltip = getTooltip('button') } = this.props;
    if (!this.disabled && !this.loading) {
      otherProps.onClick = this.handleClickIfBubble;
    }
    if ((
      isString(tooltip) && [ButtonTooltip.always, ButtonTooltip.overflow].includes(tooltip)) ||
      isArrayLike(tooltip) && [ButtonTooltip.always, ButtonTooltip.overflow].includes(tooltip[0])
    ) {
      otherProps.onMouseEnter = this.handleMouseEnter;
      otherProps.onMouseLeave = this.handleMouseLeave;
    }
    return otherProps;
  }

  isNeedInserted() {
    const {
      props: {
        funcType = this.getContextConfig('buttonFuncType'),
        children,
        icon,
      },
    } = this;
    return Children.count(children) === 1 && !icon && !(funcType === FuncType.link || funcType === FuncType.flat);
  }


  getClassName(...props): string | undefined {
    const {
      prefixCls,
      props: {
        color = this.getContextConfig('buttonColor'),
        funcType = this.getContextConfig('buttonFuncType'),
        children,
        icon,
        block,
      },
    } = this;
    const childrenCount = Children.count(children);
    const autoInsertSpace = this.getContextConfig('autoInsertSpaceInButton') !== false;
    return super.getClassName(
      {
        [`${prefixCls}-${funcType}`]: funcType,
        [`${prefixCls}-${color}`]: color,
        [`${prefixCls}-icon-only`]: icon
          ? childrenCount === 0 || children === false
          : childrenCount === 1 && (children as any).type && (children as any).type.__C7N_ICON,
        [`${prefixCls}-block`]: block,
        [`${prefixCls}-loading`]: this.loading,
        [`${prefixCls}-two-chinese-chars`]: this.hasTwoCNChar && autoInsertSpace,
      },
      ...props,
    );
  }

  render() {
    const { children, icon, href, funcType, hidden } = this.props;
    const { loading, disabled } = this;
    const autoInsertSpace = this.getContextConfig('autoInsertSpaceInButton') !== false;
    const iconHiddenStyle: CSSProperties = {
      color: 'transparent',
      backgroundColor: 'transparent',
      transition: 'none',
      position: 'absolute',
    };
    const buttonIcon = (
      <>
        {icon && <Icon type={icon} style={loading ? iconHiddenStyle : {}} />}
        {loading && <Progress key="loading" type={ProgressType.loading} size={Size.small} />}
      </>
    );
    const hasString = Children.toArray(children).some(child => isString(child));
    const Cmp = href ? 'a' : 'button';
    const props = this.getMergedProps();
    const { onMouseEnter, onMouseLeave } = props;
    const tooltipWrapper = disabled && !href && (onMouseEnter || onMouseLeave);
    const omits: string[] = [];
    if (tooltipWrapper) {
      omits.push('className', 'style');
    }
    if (href) {
      omits.push('type');
      if (disabled || loading) {
        omits.push('href');
      }
    }
    const kids =
      children || children === 0
        ? spaceChildren(children, this.isNeedInserted() && autoInsertSpace)
        : null;
    const button = (
      <Ripple disabled={disabled || funcType === FuncType.link}>
        <Cmp {...omit(props, omits)}>
          {buttonIcon}
          {hasString ? <span>{kids}</span> : kids}
        </Cmp>
      </Ripple>
    );
    return tooltipWrapper ? (
      <span
        className={classNames(props.className, `${this.prefixCls}-disabled-wrapper`)}
        style={props.style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        hidden={hidden}
      >
        {button}
      </span>
    ) : button;
  }
}
