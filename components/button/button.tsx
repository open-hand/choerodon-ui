import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'omit.js';
import Icon from '../icon';
import Group from './button-group';
import Ripple from '../ripple';

export type ButtonType = 'primary' | 'ghost' | 'dashed' | 'danger';
export type ButtonShape = 'circle' | 'circle-outline';
export type ButtonSize = 'small' | 'default' | 'large';
export type ButtonFuncType = 'raised' | 'flat';

export interface ButtonProps {
  type?: ButtonType;
  htmlType?: string;
  icon?: string;
  shape?: ButtonShape;
  size?: ButtonSize;
  onClick?: React.FormEventHandler<any>;
  onMouseUp?: React.FormEventHandler<any>;
  onMouseDown?: React.FormEventHandler<any>;
  onKeyPress?: React.KeyboardEventHandler<any>;
  onKeyDown?: React.KeyboardEventHandler<any>;
  tabIndex?: number;
  loading?: boolean | { delay?: number };
  disabled?: boolean;
  style?: React.CSSProperties;
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  target?: string;
  href?: string;
  download?: string;
  funcType?: ButtonFuncType;
}

export default class Button extends React.Component<ButtonProps, any> {
  static Group: typeof Group;
  static __ANT_BUTTON = true;

  static defaultProps = {
    prefixCls: 'ant-btn',
    loading: false,
    ghost: false,
    funcType: 'flat',
  };

  static propTypes = {
    type: PropTypes.string,
    shape: PropTypes.oneOf(['circle', 'circle-outline']),
    size: PropTypes.oneOf(['large', 'default', 'small']),
    htmlType: PropTypes.oneOf(['submit', 'button', 'reset']),
    onClick: PropTypes.func,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    className: PropTypes.string,
    icon: PropTypes.string,
    funcType: PropTypes.oneOf(['raised', 'flat']),
  };

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
    const currentLoading = this.props.loading;
    const loading = nextProps.loading;

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

  handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.setState({ clicked: false }), 500);

    const onClick = this.props.onClick;
    if (onClick) {
      onClick(e);
    }
  };

  render() {
    const {
      type, shape, size, className, htmlType, children, icon, prefixCls, ghost, funcType, ...others,
    } = this.props;

    const { loading, clicked } = this.state;

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case 'large':
        sizeCls = 'lg';
        break;
      case 'small':
        sizeCls = 'sm';
      default:
        break;
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
      <div className="btn-loading">
        <span className="dot1" />
        <span className="dot2" />
        <span className="dot3" />
      </div>
    ) : iconNode;
    const kids = (children || children === 0)
      ? React.Children.map(children, child => {
        if (typeof child === 'string') {
          return <span>{child}</span>;
        }
        return child;
      }) : null;

    return (
      <Ripple>
        <ComponentProp
          {...omit(others, ['loading'])}
          type={others.href ? undefined : (htmlType || 'button')}
          className={classes}
          onClick={this.handleClick}
        >
          {iconNode}
          {kids}
        </ComponentProp>
      </Ripple>
    );
  }
}
