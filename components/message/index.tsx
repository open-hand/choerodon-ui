import React, { ReactNode } from 'react';
import noop from 'lodash/noop';
import isString from 'lodash/isString';
import Icon from '../icon';
import Notification from '../rc-components/notification';
import { getPlacementStyle, getPlacementTransitionName } from './util';
import { getPrefixCls } from '../configure';

let defaultDuration = 3;
let defaultTop: number = 24;
let defaultBottom: number = 24;
let messageInstance: any;
let key = 1;
let customizePrefixCls;
let transitionName = 'move-up';
let defaultPlacement: Placement = 'leftBottom';
let getContainer: () => HTMLElement;

type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';
type Placement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topRight'
  | 'topLeft'
  | 'bottomRight'
  | 'bottomLeft'
  | 'rightTop'
  | 'leftTop'
  | 'rightBottom'
  | 'leftBottom';

type ConfigContent = ReactNode;
type ConfigDuration = number | Placement | (() => void);
export type ConfigOnClose = (() => void) | Placement;

function getCustomizePrefixCls() {
  return getPrefixCls('message', customizePrefixCls);
}

function getMessageInstance(placement: Placement, callback: (i: any) => void) {
  if (messageInstance) {
    callback(messageInstance);
    return;
  }
  Notification.newInstance(
    {
      prefixCls: getCustomizePrefixCls(),
      style: getPlacementStyle(placement, defaultTop, defaultBottom),
      transitionName: getPlacementTransitionName(placement, transitionName),
      getContainer,
    },
    (instance: any) => {
      if (messageInstance) {
        callback(messageInstance);
        return;
      }
      messageInstance = instance;
      callback(instance);
    },
  );
}

function notice(
  content: ReactNode,
  duration: ConfigDuration = defaultDuration,
  type: NoticeType,
  onClose?: ConfigOnClose,
  placement?: Placement,
) {
  const iconType = {
    info: 'info',
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    loading: 'loading',
  }[type];

  if (isString(onClose)) {
    placement = onClose;
    onClose = noop;
  }

  if (typeof duration === 'function') {
    onClose = duration;
    duration = defaultDuration;
  } else if (isString(duration)) {
    placement = duration;
  }

  const target = key++;
  const prefixCls = getCustomizePrefixCls();
  getMessageInstance(placement || defaultPlacement, instance => {
    instance.notice({
      key: target,
      duration,
      style: {},
      content: (
        <div className={`${prefixCls}-custom-content ${prefixCls}-${type}`}>
          <Icon type={iconType} />
          <span>{content}</span>
        </div>
      ),
      onClose,
    });
  });
  return () => {
    if (messageInstance) {
      messageInstance.removeNotice(target);
    }
  };
}

export interface ConfigOptions {
  top?: number;
  duration?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement;
  transitionName?: string;
  /**
   * 消息距离视窗位置
   */
  bottom?: number;
  placement?: Placement;
}

export default {
  info(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'info', onClose, placement);
  },
  success(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'success', onClose, placement);
  },
  error(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'error', onClose, placement);
  },
  // Departed usage, please use warning()
  warn(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  warning(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  loading(
    content: ConfigContent,
    duration?: ConfigDuration,
    onClose?: ConfigOnClose,
    placement?: Placement,
  ) {
    return notice(content, duration, 'loading', onClose, placement);
  },
  config(options: ConfigOptions) {
    if (options.top !== undefined) {
      defaultTop = options.top;
      messageInstance = null; // delete messageInstance for new defaultTop
    }
    if (options.bottom !== undefined) {
      defaultBottom = options.bottom;
      messageInstance = null; // delete messageInstance for new defaultBottom
    }
    if (options.duration !== undefined) {
      defaultDuration = options.duration;
    }
    if (options.prefixCls !== undefined) {
      customizePrefixCls = options.prefixCls;
    }
    if (options.getContainer !== undefined) {
      getContainer = options.getContainer;
    }
    if (options.transitionName !== undefined) {
      transitionName = options.transitionName;
      messageInstance = null; // delete messageInstance for new transitionName
    }
    if (options.placement !== undefined) {
      defaultPlacement = options.placement;
    }
  },
  destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }
  },
};
