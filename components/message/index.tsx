import * as React from 'react';
import Icon from '../icon';
import Notification from '../rc-components/notification';
import { getPlacementStyle, getPlacementTransitionName } from './util';

let defaultDuration = 3;
let defaultTop: number = 24;
let defaultBottom: number = 24;
let messageInstance: any;
let key = 1;
let prefixCls = 'ant-message';
let transitionName = 'move-up';
let defaultPlacement: Placement = 'top';
let getContainer: () => HTMLElement;

type NoticeType = 'info' | 'success' | 'error' | 'warning' | 'loading';
type Placement =  'top' | 'left' | 'right' | 'bottom' |
  'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' |
  'rightTop' | 'leftTop' | 'rightBottom' | 'leftBottom';

function getMessageInstance(placement: Placement, callback: (i: any) => void) {
  if (messageInstance) {
    callback(messageInstance);
    return;
  }
  Notification.newInstance({
    prefixCls,
    style: getPlacementStyle(placement, defaultTop, defaultBottom),
    transitionName: getPlacementTransitionName(placement, transitionName),
    getContainer,
  }, (instance: any) => {
    if (messageInstance) {
      callback(messageInstance);
      return;
    }
    messageInstance = instance;
    callback(instance);
  });
}

function notice(content: React.ReactNode,
                duration: (() => void) | number = defaultDuration,
                type: NoticeType,
                onClose?: () => void, placement?: Placement) {
  let iconType = ({
    info: 'info',
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    loading: 'loading',
  })[type];

  if (typeof duration === 'function') {
    onClose = duration;
    duration = defaultDuration;
  }

  if (placement !== undefined) {
    defaultPlacement = placement;
  }
  const target = key++;
  getMessageInstance(defaultPlacement, (instance) => {
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

type ConfigContent = React.ReactNode | string;
type ConfigDuration = number | (() => void);
export type ConfigOnClose = () => void;

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
}

export default {
  info(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
    return notice(content, duration, 'info', onClose, placement);
  },
  success(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
    return notice(content, duration, 'success', onClose, placement);
  },
  error(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
    return notice(content, duration, 'error', onClose, placement);
  },
  // Departed usage, please use warning()
  warn(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  warning(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
    return notice(content, duration, 'warning', onClose, placement);
  },
  loading(content: ConfigContent, duration?: ConfigDuration, onClose?: ConfigOnClose, placement?: Placement) {
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
      prefixCls = options.prefixCls;
    }
    if (options.getContainer !== undefined) {
      getContainer = options.getContainer;
    }
    if (options.transitionName !== undefined) {
      transitionName = options.transitionName;
      messageInstance = null; // delete messageInstance for new transitionName
    }
  },
  destroy() {
    if (messageInstance) {
      messageInstance.destroy();
      messageInstance = null;
    }
  },
};
