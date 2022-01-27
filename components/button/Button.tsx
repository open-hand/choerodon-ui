import React, { ButtonHTMLAttributes, Children, CSSProperties, KeyboardEventHandler, MouseEventHandler, PureComponent } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import getReactNodeText from 'choerodon-ui/pro/lib/_util/getReactNodeText';
import Icon from '../icon';
import Group from './ButtonGroup';
import Ripple from '../ripple';
import { Size } from '../_util/enum';
import { ProgressType } from '../progress/enum';
import Progress from '../progress';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export type ButtonType = 'primary' | 'ghost' | 'dashed' | 'danger';
export type ButtonShape = 'circle' | 'circle-outline';
export type ButtonFuncType = 'raised' | 'flat';

export interface ButtonProps {
  type?: ButtonType;
  htmlType?: string;
  icon?: string;
  shape?: ButtonShape;
  size?: Size;
  onClick?: MouseEventHandler<any>;
  onMouseUp?: MouseEventHandler<any>;
  onMouseDown?: MouseEventHandler<any>;
  onMouseEnter?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  onKeyPress?: KeyboardEventHandler<any>;
  onKeyDown?: KeyboardEventHandler<any>;
  tabIndex?: number;
  loading?: boolean | { delay?: number };
  disabled?: boolean;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  target?: string;
  href?: string;
  download?: string;
  funcType?: ButtonFuncType;
}

export default class Button extends PureComponent<ButtonProps, any> {
  static displayName = 'Button';

  static get contextType() {
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

  constructor(props: ButtonProps) {
    super(props);
    this.state = {
      loading: props.loading,
      clicked: false,
    };
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

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  }

  handleClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = e => {
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.setState({ clicked: false }), 500);

    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
    const { getConfig } = this.context;
    const onButtonClick = getConfig('onButtonClick');
    if (onButtonClick) {
      const { target } = e;
      const { children, icon } = this.props;
      const promise = Promise.resolve(target && (target as HTMLButtonElement | HTMLAnchorElement).textContent || getReactNodeText(children));
      promise.then(title => onButtonClick({ icon, title }));
    }
  };

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
      onMouseEnter,
      onMouseLeave,
      disabled,
      ...others
    } = this.props;

    const { loading, clicked } = this.state;
    const { getPrefixCls } = this.context;

    const prefixCls = getPrefixCls('btn', customizePrefixCls);

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
      [`${prefixCls}-${funcType}`]: funcType,
    });

    let iconNode: any = icon ? <Icon type={icon} /> : null;
    iconNode = loading ? (
      <Progress key="loading" type={ProgressType.loading} size={Size.small} />
    ) : (
      iconNode
    );
    const kids =
      children || children === 0
        ? Children.map(children, child => {
          if (typeof child === 'string') {
            return <span>{child}</span>;
          }
          return child;
        })
        : null;
    const useWrapper = disabled && ComponentProp === 'button' && (onMouseEnter || onMouseLeave);
    const { style, ...otherProps } = others;
    const button = (
      <Ripple disabled={disabled}>
        <ComponentProp
          disabled={disabled}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          {...omit(otherProps, ['loading'])}
          // 如果没有href属性，则表示组件使用button标签，type为'submit' | 'reset' | 'button'
          type={
            others.href ? undefined : (htmlType as ButtonHTMLAttributes<any>['type']) || 'button'
          }
          style={useWrapper ? undefined : style}
          className={useWrapper ? undefined : classes}
          onClick={this.handleClick}
        >
          {iconNode}
          {kids}
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
