import isPromise from 'is-promise';
import { ConfigProps as NotificationConfigProps, NotificationInterface, NotificationPlacement } from '../notification-manager';

export type MessagePlacement = NotificationPlacement
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'rightTop'
  | 'leftTop'
  | 'rightBottom'
  | 'leftBottom';


export interface ConfigProps extends NotificationConfigProps<MessagePlacement> {
  prefixCls?: string;
  transitionName: string;
}

export interface MessageManagerType {
  key: number;

  config: ConfigProps;

  instance?: NotificationInterface | Promise<NotificationInterface>;

  remove(key: string);

  clear();

  getUuid(): string;
}

const manager: MessageManagerType = {
  key: 1,
  config: {
    duration: 3,
    top: 24,
    bottom: 24,
    placement: 'leftBottom',
    transitionName: 'move-up',
    icons: {
      info: 'info',
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      loading: 'loading',
    },
  },
  remove(key: string) {
    const { instance } = this;
    if (instance) {
      if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
        instance.then(ins => ins.removeNotice(key));
      } else {
        instance.removeNotice(key);
      }
    }
  },
  clear() {
    const { instance } = this;
    if (instance) {
      if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
        instance.then(ins => ins.destroy());
      } else {
        instance.destroy();
      }
      delete this.instance;
    }
  },
  getUuid() {
    return `${this.key++}`;
  },
};

export default manager;
