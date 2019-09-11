import React, { Component, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
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

  handleClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const dom = findDOMNode(this) as HTMLElement;
    dom.style.height = `${dom.offsetHeight}px`;
    // Magic code
    // 重复一次后才能正确设置 height
    dom.style.height = `${dom.offsetHeight}px`;

    this.setState({
      closing: false,
    });
    const { onClose } = this.props;
    if (onClose) {
      onClose(e);
    }
  };

  animationEnd = () => {
    this.setState({
      closed: true,
      closing: true,
    });
    const { afterClose } = this.props;
    if (afterClose) {
      afterClose();
    }
  };

  render() {
    const { props } = this;
    const {
      description,
      prefixCls: customizePrefixCls,
      message,
      closeText,
      banner,
      className = '',
      style,
    } = props;
    let { closable, showIcon, type, iconType } = props;
    const { closing, closed } = this.state;
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
      if (description) {
        iconType += '-o';
      }
    }

    const alertCls = classNames(
      prefixCls,
      {
        [`${prefixCls}-${type}`]: true,
        [`${prefixCls}-close`]: !closing,
        [`${prefixCls}-with-description`]: !!description,
        [`${prefixCls}-no-icon`]: !showIcon,
        [`${prefixCls}-banner`]: !!banner,
      },
      className,
    );

    // closeable when closeText is assigned
    if (closeText) {
      closable = true;
    }

    const closeIcon = closable ? (
      <a onClick={this.handleClose} className={`${prefixCls}-close-icon`}>
        {closeText || <Icon type="cross" />}
      </a>
    ) : null;

    return closed ? null : (
      <Animate
        component=""
        hiddenProp="hidden"
        transitionName={`${prefixCls}-slide-up`}
        onEnd={this.animationEnd}
      >
        <div hidden={!closing} className={alertCls} style={style}>
          {showIcon ? <Icon className={`${prefixCls}-icon`} type={iconType} /> : null}
          <span className={`${prefixCls}-message`}>{message}</span>
          <span className={`${prefixCls}-description`}>{description}</span>
          {closeIcon}
        </div>
      </Animate>
    );
  }
}
