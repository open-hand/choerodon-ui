import React, { CSSProperties, Key, PureComponent, ReactNode } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NotificationManager } from 'choerodon-ui/shared';
import { NotificationInterface } from 'choerodon-ui/shared/notification-manager';
import Animate from '../animate';
import createChainedFunction from '../rc-components/util/createChainedFunction';
import Notice, { NoticeProps } from './Notice';

export function newNotificationInstance(properties: NotificationProps & { getContainer?: (() => HTMLElement) | undefined }, callback: (api: NotificationInterface) => void) {
  const { getContainer, ...props } = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  let called = false;

  function ref(notification) {
    if (called) {
      return;
    }
    called = true;
    callback({
      notice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      destroy() {
        unmountComponentAtNode(div);
        const { parentNode } = div;
        if (parentNode) {
          parentNode.removeChild(div);
        }
      },
    });
  }

  render(<Notification {...props} ref={ref} />, div);
}

export interface NotificationProps {
  prefixCls?: string;
  className?: string;
  transitionName?: string;
  animation?: string;
  style?: CSSProperties;
  contentClassName?: string;
  closeIcon?: ReactNode;
  maxCount?: number;
}

export interface NotificationState {
  notices: NoticeProps[];
}

export default class Notification extends PureComponent<NotificationProps, NotificationState> {
  static propTypes = {
    prefixCls: PropTypes.string,
    transitionName: PropTypes.string,
    animation: PropTypes.string,
    style: PropTypes.object,
    closeIcon: PropTypes.node,
    contentClassName: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'c7n-notification',
    animation: 'fade',
    style: {
      top: 65,
      left: '50%',
    },
  };

  static newInstance = newNotificationInstance;

  state: NotificationState = {
    notices: [],
  };

  getTransitionName() {
    const { transitionName, animation, prefixCls } = this.props;
    if (!transitionName && animation) {
      return `${prefixCls}-${animation}`;
    }
    return transitionName;
  }

  add(notice: NoticeProps) {
    if (!notice.key) {
      notice.key = NotificationManager.getUuid();
    }
    const { key } = notice;
    const { maxCount } = this.props;
    this.setState(previousState => {
      const notices = previousState.notices;
      if (!notices.filter(v => v.key === key).length) {
        if (maxCount && notices && notices.length > 0 && notices.length >= maxCount) {
          notices.shift();
        }
        return {
          notices: notices.concat(notice),
        };
      }
    });
  }

  remove(key: Key) {
    this.setState(previousState => {
      return {
        notices: previousState.notices.filter(notice => notice.key !== key),
      };
    });
  }

  render() {
    const { notices } = this.state;
    const { contentClassName, prefixCls, closeIcon, className, style } = this.props;
    const noticeNodes = notices.map(notice => {
      const { key } = notice;
      const onClose = createChainedFunction(this.remove.bind(this, key), notice.onClose);
      return (
        <Notice
          prefixCls={prefixCls}
          contentClassName={contentClassName}
          {...notice}
          onClose={onClose}
          closeIcon={closeIcon}
          key={key}
        />
      );
    });
    return (
      <div className={classNames(prefixCls, className)} style={style}>
        <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
      </div>
    );
  }
}
