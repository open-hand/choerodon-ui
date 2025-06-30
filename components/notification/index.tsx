import React, { CSSProperties, ReactNode } from 'react';
import isPromise from 'is-promise';
import isFunction from 'lodash/isFunction';
import { NotificationManager } from 'choerodon-ui/shared';
import { ConfigProps as ConfigOptions, NotificationInterface, NotificationPlacement } from 'choerodon-ui/shared/notification-manager';
import Icon from '../icon';
import { newNotificationInstance } from './Notification';
import { getPrefixCls } from '../configure/utils';

export { NotificationPlacement };

export type IconType = 'success' | 'info' | 'error' | 'warning';
const { config } = NotificationManager;

export type ConfigProps = Partial<ConfigOptions> & { icon?: Partial<ConfigOptions['icons']> }

function setNotificationConfig(options: ConfigProps) {
  const { duration, placement, bottom, top, getContainer, maxCount, foldCount, icons } = options;
  if (duration !== undefined) {
    config.duration = duration;
  }
  if (placement !== undefined) {
    config.placement = placement;
  }
  if (bottom !== undefined) {
    config.bottom = bottom;
  }
  if (top !== undefined) {
    config.top = top;
  }
  if (getContainer !== undefined) {
    config.getContainer = getContainer;
  }
  if (maxCount !== undefined) {
    config.maxCount = maxCount;
  }
  if (foldCount !== undefined) {
    config.foldCount = foldCount;
  }
  if (icons !== undefined) {
    config.icons = {
      ...config.icons,
      ...icons,
    };
  }
}

function getPlacementStyle(placement: NotificationPlacement) {
  let style;
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: config.top,
        bottom: 'auto',
      };
      break;
    case 'topRight':
      style = {
        right: 0,
        top: config.top,
        bottom: 'auto',
      };
      break;
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: config.bottom,
      };
      break;
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: config.bottom,
      };
      break;
  }
  return style;
}

function getNotificationInstance(
  prefixCls: string,
  placement: NotificationPlacement,
  callback: (n: NotificationInterface) => void,
) {
  const cacheKey = `${prefixCls}-${placement}`;
  const instance = NotificationManager.instances.get(cacheKey);
  if (instance) {
    if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
      instance.then(callback);
    } else {
      callback(instance);
    }
    return;
  }
  const { config } = NotificationManager;
  NotificationManager.instances.set(cacheKey, new Promise((resolve) => {
    newNotificationInstance(
      {
        prefixCls,
        className: cacheKey,
        style: getPlacementStyle(placement),
        getContainer: config.getContainer,
        maxCount: config.maxCount,
        foldCount: config.foldCount,
      },
      (notification: any) => {
        resolve(notification);
        NotificationManager.instances.set(cacheKey, notification);
        callback(notification);
      },
    );
  }));
}

export interface ArgsProps {
  message: ReactNode;
  description: ReactNode;
  btn?: ReactNode;
  key?: string;
  onClose?: () => void;
  duration?: number | null;
  icon?: ReactNode;
  placement?: NotificationPlacement;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  readonly type?: IconType;
}

function notice(args: ArgsProps) {
  const outerPrefixCls = getPrefixCls('notification', args.prefixCls);
  const prefixCls = `${outerPrefixCls}-notice`;
  let duration = args.duration === undefined ? config.duration : args.duration;

  if (isFunction(duration)) {
    duration = duration(args.type);
  }

  let iconNode: ReactNode = null;
  if (args.icon) {
    iconNode = <span className={`${prefixCls}-icon`}>{args.icon}</span>;
  } else if (args.type) {
    const iconType = config.icons[args.type];
    iconNode = (
      <Icon className={`${prefixCls}-icon ${prefixCls}-icon-${args.type}`} type={iconType} />
    );
  }

  const autoMarginTag =
    !args.description && iconNode ? (
      <span className={`${prefixCls}-message-single-line-auto-margin`} />
    ) : null;

  getNotificationInstance(
    outerPrefixCls,
    args.placement || config.placement,
    (notification: any) => {
      notification.notice({
        children: (
          <div className={iconNode ? `${prefixCls}-with-icon` : ''}>
            {iconNode}
            <div className={`${prefixCls}-message`}>
              {autoMarginTag}
              {args.message}
            </div>
            {args.description ? <div className={`${prefixCls}-description`}>{args.description}</div> : null}
            {args.btn ? <span className={`${prefixCls}-btn`}>{args.btn}</span> : null}
          </div>
        ),
        duration,
        closable: true,
        onClose: args.onClose,
        key: args.key,
        style: args.style || {},
        className: args.className,
      });
    },
  );
}

const api: any = {
  open: notice,
  close(key: string) {
    NotificationManager.remove(key);
  },
  config: setNotificationConfig,
  destroy() {
    NotificationManager.clear();
  },
};

['success', 'info', 'warning', 'error'].forEach(type => {
  api[type] = (args: ArgsProps) =>
    api.open({
      ...args,
      type,
    });
});

api.warn = api.warning;

export interface NotificationApi {
  success(args: ArgsProps): void;

  error(args: ArgsProps): void;

  info(args: ArgsProps): void;

  warn(args: ArgsProps): void;

  warning(args: ArgsProps): void;

  open(args: ArgsProps): void;

  close(key: string): void;

  config(options: ConfigProps): void;

  destroy(): void;
}

export default api as NotificationApi;
