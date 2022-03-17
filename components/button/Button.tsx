import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Children,
  cloneElement,
  MouseEventHandler,
  PureComponent,
  ReactElement,
  ReactNode,
} from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import getReactNodeText from 'choerodon-ui/pro/lib/_util/getReactNodeText';
import { ButtonTooltip } from 'choerodon-ui/pro/lib/button/enum';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import { hide, show } from 'choerodon-ui/pro/lib/tooltip/singleton';
import Icon from '../icon';
import Group from './ButtonGroup';
import Ripple from '../ripple';
import { Size } from '../_util/enum';
import { ProgressType } from '../progress/enum';
import Progress from '../progress';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

// Insert one space between two chinese characters automatically.
function insertSpace(child: React.ReactChild, needInserted: boolean) {
  // Check the child if is undefined or null.
  if (isNil(child)) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  if (typeof child !== 'string' && typeof child !== 'number' &&
    isString(child.type) && isTwoCNChar(child.props.children)) {
    return cloneElement(child, {},
      child.props.children.split('').join(SPACE));
  }
  if (typeof child === 'string') {
    if (isTwoCNChar(child)) {
      child = child.split('').join(SPACE);
    }
    return <span>{child}</span>;
  }
  return child;
}

function defaultRenderIcon(type: string) {
  return <Icon type={type} />;
}

export type ButtonType = 'default' | 'primary' | 'ghost' | 'dashed' | 'danger';
export type ButtonShape = 'circle' | 'circle-outline';
export type ButtonFuncType = 'raised' | 'flat';
export type ButtonHTMLType = 'submit' | 'button' | 'reset';

export interface BaseButtonProps {
  type?: ButtonType;
  htmlType?: string;
  icon?: string;
  shape?: ButtonShape;
  size?: Size;
  onClick?: MouseEventHandler<HTMLElement>;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  twoCNChar?: boolean;
  rippleDisabled?: boolean;
  funcType?: ButtonFuncType;
  children?: ReactNode;
  renderIcon?: (type: string) => ReactElement;
}

export type AnchorButtonProps = {
  href: string;
  target?: string;
} & BaseButtonProps &
  Omit<AnchorHTMLAttributes<any>, 'type' | 'onClick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHTMLType;
} & BaseButtonProps &
  Omit<ButtonHTMLAttributes<any>, 'type' | 'onClick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

export default class Button extends PureComponent<ButtonProps, any> {
  static displayName = 'Button';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Group: typeof Group;

  static __C7N_BUTTON = true;

  static defaultProps = {
    loading: false,
    ghost: false,
    funcType: 'flat',
  };

  context: ConfigContextValue;

  timeout: number;

  delayTimeout: number;

  element: HTMLButtonElement | null;

  isTooltipShown?: boolean;

  saveRef = (element) => {
    this.element = element;
  };

  constructor(props: ButtonProps) {
    super(props);
    this.state = {
      loading: props.loading,
      clicked: false,
      hasTwoCNChar: false,
    };
  }

  componentDidMount() {
    this.fixTwoCNChar();
  }

  componentWillReceiveProps(nextProps: ButtonProps) {
    const { loading: currentLoading } = this.props;
    const { loading } = nextProps;

    if (currentLoading) {
      clearTimeout(this.delayTimeout);
    }

    if (typeof loading !== 'boolean' && loading && loading.delay) {
      this.delayTimeout = window.setTimeout(() => this.setState({ loading }), loading.delay);
    } else {
      this.setState({ loading });
    }
  }

  componentDidUpdate() {
    this.fixTwoCNChar();
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  }

  fixTwoCNChar() {
    const { twoCNChar } = this.props;
    if (twoCNChar) {
      // Fix for HOC usage like <FormatMessage />
      const node = (findDOMNode(this) as HTMLElement);
      const buttonText = node.textContent || node.innerText;
      const { hasTwoCNChar } = this.state;
      if (this.isNeedInserted() && isTwoCNChar(buttonText)) {
        if (!hasTwoCNChar) {
          this.setState({
            hasTwoCNChar: true,
          });
        }
      } else if (hasTwoCNChar) {
        this.setState({
          hasTwoCNChar: false,
        });
      }
    }
  }

  handleClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = e => {
    // Add click effect
    this.setState({ clicked: true });
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.setState({ clicked: false }), 500);

    const { getConfig } = this.context;
    const onButtonClick = getConfig('onButtonClick');
    if (onButtonClick) {
      const { target } = e;
      const { children, icon } = this.props;
      const promise = Promise.resolve(target && (target as HTMLButtonElement | HTMLAnchorElement).textContent || getReactNodeText(children));
      promise.then(title => onButtonClick({ icon, title }));
    }

    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
  };

  handleMouseEnter: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = (e) => {
    const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const { children } = this.props;
    const tooltip = getTooltip('button');
    const { element } = this;
    if (element && (tooltip === ButtonTooltip.always || (tooltip === ButtonTooltip.overflow && isOverflow(element)))) {
      show(element, {
        title: children,
        theme: getTooltipTheme('button'),
        placement: getTooltipPlacement('button'),
      });
      this.isTooltipShown = true;
    }
    const { onMouseEnter = noop } = this.props;
    onMouseEnter(e);
  };

  handleMouseLeave: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = (e) => {
    hide();
    const { onMouseLeave = noop } = this.props;
    onMouseLeave(e);
  };

  isNeedInserted() {
    const { icon, children } = this.props;
    return Children.count(children) === 1 && !icon;
  }

  render() {
    const {
      prefixCls: customizePrefixCls,
      type,
      shape,
      size,
      className,
      htmlType,
      children,
      icon,
      ghost,
      funcType,
      disabled,
      rippleDisabled,
      renderIcon = defaultRenderIcon,
      ...others
    } = this.props;

    const { loading, clicked, hasTwoCNChar } = this.state;
    const { getPrefixCls, getTooltip } = this.context;

    const prefixCls = getPrefixCls('btn', customizePrefixCls);

    const tooltip = getTooltip('button');
    if (tooltip && [ButtonTooltip.always, ButtonTooltip.overflow].includes(tooltip)) {
      others.onMouseEnter = this.handleMouseEnter;
      others.onMouseLeave = this.handleMouseLeave;
    }

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case Size.large:
        sizeCls = 'lg';
        break;
      case Size.small:
        sizeCls = 'sm';
        break;
      default:
    }

    const ComponentProp = others.href ? 'a' : 'button';

    const classes = classNames(prefixCls, className, {
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && icon,
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-clicked`]: clicked,
      [`${prefixCls}-background-ghost`]: ghost,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar,
      [`${prefixCls}-${funcType}`]: funcType,
    });

    const iconNode = loading ? (
      <Progress key="loading" type={ProgressType.loading} size={Size.small} />
    ) : icon ? renderIcon(icon) : null;
    const kids =
      children || children === 0
        ? Children.map(children, (child: any) => insertSpace(child, this.isNeedInserted())) : null;
    const { style, onMouseEnter, onMouseLeave, ...otherProps } = others;
    const useWrapper = disabled && ComponentProp === 'button' && (onMouseEnter || onMouseLeave);
    const button = (
      <Ripple disabled={rippleDisabled || disabled}>
        <ComponentProp
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          {...omit(otherProps, ['loading', 'twoCNChar'])}
          // 如果没有href属性，则表示组件使用button标签，type为'submit' | 'reset' | 'button'
          type={
            others.href ? undefined : (htmlType as ButtonHTMLAttributes<any>['type']) || 'button'
          }
          style={useWrapper ? undefined : style}
          className={useWrapper ? undefined : classes}
          onClick={loading ? undefined : this.handleClick}
          ref={this.saveRef}
        >
          {iconNode}{kids}
        </ComponentProp>
      </Ripple>
    );

    return useWrapper ? (
      <span
        // @ts-ignore
        disabled
        style={style}
        className={classNames(classes, `${prefixCls}-disabled-wrapper`)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {button}
      </span>
    ) : button;
  }
}
