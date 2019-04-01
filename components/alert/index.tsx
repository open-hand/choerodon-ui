import React, { Component, CSSProperties, MouseEvent, MouseEventHandler, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Icon from '../icon';
import Animate from '../animate';
import { getPrefixCls } from '../configure';

export interface AlertProps {
  /**
   * Type of Alert styles, options:`success`, `info`, `warning`, `error`
   */
  type?: 'success' | 'info' | 'warning' | 'error';
  /** Whether Alert can be closed */
  closable?: boolean;
  /** Close text to show */
  closeText?: ReactNode;
  /** Content of Alert */
  message: ReactNode;
  /** Additional content of Alert */
  description?: ReactNode;
  /** Callback when close Alert */
  onClose?: MouseEventHandler<HTMLAnchorElement>;
  /** Trigger when animation ending of Alert */
  afterClose?: () => void;
  /** Whether to show icon */
  showIcon?: boolean;
  iconType?: string;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  banner?: boolean;
}

export default class Alert extends Component<AlertProps, any> {
  static displayName = 'Alert';

  state = {
    closing: true,
    closed: false,
  };

  handleClose = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    let dom = findDOMNode(this) as HTMLElement;
    dom.style.height = `${dom.offsetHeight}px`;
    // Magic code
    // 重复一次后才能正确设置 height
    dom.style.height = `${dom.offsetHeight}px`;

    this.setState({
      closing: false,
    });
    (this.props.onClose || noop)(e);
  };
  animationEnd = () => {
    this.setState({
      closed: true,
      closing: true,
    });
    (this.props.afterClose || noop)();
  };

  render() {
    let {
      closable, description, type, prefixCls: customizePrefixCls, message, closeText, showIcon, banner,
      className = '', style, iconType,
    } = this.props;
    const prefixCls = getPrefixCls('alert', customizePrefixCls);

    // banner模式默认有 Icon
    showIcon = banner && showIcon === undefined ? true : showIcon;
    // banner模式默认为警告
    type = banner && type === undefined ? 'warning' : type || 'info';

    if (!iconType) {
      switch (type) {
        case 'success':
          iconType = 'check-circle';
          break;
        case 'info':
          iconType = 'info-circle';
          break;
        case 'error':
          iconType = 'cross-circle';
          break;
        case 'warning':
          iconType = 'exclamation-circle';
          break;
        default:
          iconType = 'default';
      }

      // use outline icon in alert with description
      if (!!description) {
        iconType += '-o';
      }
    }

    let alertCls = classNames(prefixCls, {
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-close`]: !this.state.closing,
      [`${prefixCls}-with-description`]: !!description,
      [`${prefixCls}-no-icon`]: !showIcon,
      [`${prefixCls}-banner`]: !!banner,
    }, className);

    // closeable when closeText is assigned
    if (closeText) {
      closable = true;
    }

    const closeIcon = closable ? (
      <a onClick={this.handleClose} className={`${prefixCls}-close-icon`}>
        {closeText || <Icon type="cross" />}
      </a>
    ) : null;

    return this.state.closed ? null : (
      <Animate
        component=""
        hiddenProp="hidden"
        transitionName={`${prefixCls}-slide-up`}
        onEnd={this.animationEnd}
      >
        <div hidden={!this.state.closing} className={alertCls} style={style}>
          {showIcon ? <Icon className={`${prefixCls}-icon`} type={iconType} /> : null}
          <span className={`${prefixCls}-message`}>{message}</span>
          <span className={`${prefixCls}-description`}>{description}</span>
          {closeIcon}
        </div>
      </Animate>
    );
  }
}
