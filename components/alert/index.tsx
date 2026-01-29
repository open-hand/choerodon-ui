import React, { CSSProperties, MouseEventHandler, PureComponent, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import Icon from '../icon';
import Animate from '../animate';
import getDataOrAriaProps from '../_util/getDataOrAriaProps';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  iconOutline?: boolean;
}

export default class Alert extends PureComponent<AlertProps, any> {
  static displayName = 'Alert';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  context: ConfigContextValue;

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
      iconOutline,
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
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('alert', customizePrefixCls);

    // banner模式默认有 Icon
    showIcon = banner && showIcon === undefined ? true : showIcon;
    // banner模式默认为警告
    type = banner && type === undefined ? 'warning' : type || 'info';

    if (!iconType) {
      // use outline icon in alert with description
      if (iconOutline) {
        switch (type) {
          case 'success':
            iconType = 'check_circle_outline-o';
            break;
          case 'info':
            iconType = 'info-o';
            break;
          case 'error':
            iconType = 'error_outline';
            break;
          case 'warning':
            iconType = 'warning_amber-o-2';
            break;
          default:
            iconType = 'default';
        }
      } else {
        switch (type) {
          case 'success':
            iconType = 'check_circle';
            break;
          case 'info':
            iconType = 'info';
            break;
          case 'error':
            iconType = 'error';
            break;
          case 'warning':
            iconType = 'warning';
            break;
          default:
            iconType = 'default';
        }
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
        [`${prefixCls}-closable`]: closable || closeText,
      },
      className,
    );

    // closeable when closeText is assigned
    if (closeText) {
      closable = true;
    }

    const closeIcon = closable ? (
      <button type="button" className={`${prefixCls}-close-wrapper`}>
        <a onClick={this.handleClose} className={`${prefixCls}-close-icon`}>
          {closeText || <Icon type="close" />}
        </a>
      </button>
    ) : null;

    const dataOrAriaProps = getDataOrAriaProps(this.props);

    return closed ? null : (
      <Animate
        component=""
        hiddenProp="hidden"
        transitionName={`${prefixCls}-slide-up`}
        onEnd={this.animationEnd}
      >
        <div hidden={!closing} className={alertCls} style={style} {...dataOrAriaProps} lang="en">
          {showIcon ? <Icon className={`${prefixCls}-icon`} type={iconType} /> : null}
          <div className={`${prefixCls}-content`}>
            <span className={`${prefixCls}-message`}>{message}</span>
            <span className={`${prefixCls}-description`}>{description}</span>
          </div>
          {closeIcon}
        </div>
      </Animate>
    );
  }
}
