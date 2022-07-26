import React, { ReactNode } from 'react';
import isPromise from 'is-promise';
import noop from 'lodash/noop';
import isString from 'lodash/isString';
import { MessageManager } from 'choerodon-ui/shared';
import { NotificationInterface } from 'choerodon-ui/shared/notification-manager';
import { MessagePlacement, ConfigProps } from 'choerodon-ui/shared/message-manager';
import Icon from '../icon';
import Progress from '../progress';
import { ProgressType } from '../progress/enum';
import { Size } from '../_util/enum';
import { newNotificationInstance } from '../notification/Notification';
import { getPlacementStyle, getPlacementTransitionName } from './util';
import { getPrefixCls } from '../configure/utils';

const { config } = MessageManager;

type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';

type ConfigContent = ReactNode;
type ConfigDuration = number | MessagePlacement | (() => void);
export type ConfigOnClose = (() => void) | MessagePlacement;

function getCustomizePrefixCls() {
  return getPrefixCls('message', config.prefixCls);
}

function getMessageInstance(placement: MessagePlacement, callback: (i: NotificationInterface) => void, contentClassName: string): Promise<NotificationInterface> {
  const { instance } = MessageManager;
  if (instance) {
    if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
      instance.then(callback);
      return instance;
    }
    callback(instance);
    return Promise.resolve(instance);
  }
  const promise: Promise<NotificationInterface> = new Promise((resolve) => {
    newNotificationInstance(
      {
        prefixCls: getCustomizePrefixCls(),
        style: getPlacementStyle(placement, config.top, config.bottom),
        transitionName: getPlacementTransitionName(placement, config.transitionName),
        getContainer: config.getContainer,
        contentClassName,
        maxCount: config.maxCount,
      },
      (instance: NotificationInterface) => {
        resolve(instance);
        MessageManager.instance = instance;
        callback(instance);
      },
    );
  });
  MessageManager.instance = promise;
  return promise;
}

export interface ThenableArgument {
  (_: any): any;
}

export interface MessageType {
  (): void;

  then: (fill: ThenableArgument, reject: ThenableArgument) => Promise<any>;
  promise: Promise<any>;
}

function notice(
  content: ReactNode,
  duration: ConfigDuration = config.duration,
  type: NoticeType,
  onClose?: ConfigOnClose,
  placement?: MessagePlacement,
): MessageType {
  const iconType = config.icons[type];

  if (isString(onClose)) {
    placement = onClose;
    onClose = noop;
  }

  if (typeof duration === 'function') {
    onClose = duration;
    duration = config.duration;
  } else if (isString(duration)) {
    placement = duration;
  }

  const target = MessageManager.getUuid();
  const prefixCls = getCustomizePrefixCls();
  const icon = iconType === 'loading' ?
    <Progress type={ProgressType.loading} size={Size.small} /> :
    <Icon type={iconType} />;
  let promise: Promise<NotificationInterface>;
  const closePromise = new Promise(resolve => {
    promise = getMessageInstance(placement || config.placement, instance => {
      instance.notice({
        key: target,
        duration,
        style: {},
        contentClassName: `${prefixCls}-content-${type}`,
        children: (
          <div className={`${prefixCls}-custom-content ${prefixCls}-${type}`}>
            {icon}
            <span>{content}</span>
          </div>
        ),
        onClose() {
          if (typeof onClose === 'function') {
            onClose();
          }
          resolve();
        },
      });
    }, `${prefixCls}-content-${type}`);
  });
  const result: any = () => {
    if (promise) {
      promise.then((ins) => ins.removeNotice(target));
    }
  };
  result.then = (filled: ThenableArgument, rejected: ThenableArgument) => closePromise.then(filled, rejected);
  result.promise = closePromise;
  return result;
}

export type ConfigOptions = Partial<ConfigProps> & { icons?: Partial<ConfigProps['icons']> };

export default {
  info(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'info', onClose, placement);
  },
  success(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'success', onClose, placement);
  },
  error(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'error', onClose, placement);
  },
  // Departed usage, please use warning()
  warn(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  warning(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  loading(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: MessagePlacement,
  ) {
    return notice(content, duration, 'loading', onClose, placement);
  },
  config(options: ConfigOptions) {
    if (options.top !== undefined) {
      config.top = options.top;
      MessageManager.clear();
    }
    if (options.bottom !== undefined) {
      config.bottom = options.bottom;
      MessageManager.clear();
    }
    if (options.duration !== undefined) {
      config.duration = options.duration;
    }
    if (options.prefixCls !== undefined) {
      config.prefixCls = options.prefixCls;
    }
    if (options.getContainer !== undefined) {
      config.getContainer = options.getContainer;
    }
    if (options.transitionName !== undefined) {
      config.transitionName = options.transitionName;
      MessageManager.clear();
    }
    if (options.placement !== undefined) {
      config.placement = options.placement;
    }
    if (options.maxCount !== undefined) {
      config.maxCount = options.maxCount;
    }
    if (options.icons !== undefined) {
      config.icons = {
        ...config.icons,
        ...options.icons,
      };
    }
  },
  destroy() {
    MessageManager.clear();
  },
};
