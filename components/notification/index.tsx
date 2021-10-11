import React, { CSSProperties, ReactNode } from 'react';
import Icon from '../icon';
import Notification from '../rc-components/notification';
import { getPrefixCls } from '../configure';

export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type IconType = 'success' | 'info' | 'error' | 'warning';

const notificationInstance: { [key: string]: any } = {};
let defaultDuration = 4.5;
let defaultTop = 24;
let defaultBottom = 24;
let defaultPlacement: NotificationPlacement = 'topRight';
let defaultGetContainer: () => HTMLElement;
let defaultMaxCount;

export interface ConfigProps {
  top?: number;
  bottom?: number;
  duration?: number;
  placement?: NotificationPlacement;
  getContainer?: () => HTMLElement;
  maxCount?: number;
}

function setNotificationConfig(options: ConfigProps) {
  const { duration, placement, bottom, top, getContainer, maxCount } = options;
  if (duration !== undefined) {
    defaultDuration = duration;
  }
  if (placement !== undefined) {
    defaultPlacement = placement;
  }
  if (bottom !== undefined) {
    defaultBottom = bottom;
  }
  if (top !== undefined) {
    defaultTop = top;
  }
  if (getContainer !== undefined) {
    defaultGetContainer = getContainer;
  }
  if (maxCount !== undefined) {
    defaultMaxCount = maxCount;
  }
}

function getPlacementStyle(placement: NotificationPlacement) {
  let style;
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: defaultTop,
        bottom: 'auto',
      };
      break;
    case 'topRight':
      style = {
        right: 0,
        top: defaultTop,
        bottom: 'auto',
      };
      break;
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: defaultBottom,
      };
      break;
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: defaultBottom,
      };
      break;
  }
  return style;
}

function getNotificationInstance(
  prefixCls: string,
  placement: NotificationPlacement,
  callback: (n: any) => void,
) {
  const cacheKey = `${prefixCls}-${placement}`;
  if (notificationInstance[cacheKey]) {
    callback(notificationInstance[cacheKey]);
    return;
  }
  (Notification as any).newInstance(
    {
      prefixCls,
      className: `${prefixCls}-${placement}`,
      style: getPlacementStyle(placement),
      getContainer: defaultGetContainer,
      closeIcon: <Icon className={`${prefixCls}-close-icon`} type="close" />,
      defaultMaxCount,
    },
    (notification: any) => {
      notificationInstance[cacheKey] = notification;
      callback(notification);
    },
  );
}

const typeToIcon = {
  success: 'check',
  info: 'info',
  error: 'error',
  warning: 'warning',
};

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
  const duration = args.duration === undefined ? defaultDuration : args.duration;

  let iconNode: ReactNode = null;
  if (args.icon) {
    iconNode = <span className={`${prefixCls}-icon`}>{args.icon}</span>;
  } else if (args.type) {
    const iconType = typeToIcon[args.type];
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
    args.placement || defaultPlacement,
    (notification: any) => {
      notification.notice({
        content: (
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
    Object.keys(notificationInstance).forEach(cacheKey =>
      notificationInstance[cacheKey].removeNotice(key),
    );
  },
  config: setNotificationConfig,
  destroy() {
    Object.keys(notificationInstance).forEach(cacheKey => {
      notificationInstance[cacheKey].destroy();
      delete notificationInstance[cacheKey];
    });
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
