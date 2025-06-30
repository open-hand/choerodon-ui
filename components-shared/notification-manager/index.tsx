import isPromise from 'is-promise';

export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ConfigProps<P = NotificationPlacement> {
  top: number;
  bottom: number;
  duration: number | ((type?: string) => number);
  placement: P;
  getContainer?: () => HTMLElement;
  maxCount?: number;
  foldCount?: number;
  icons: {
    success: string;
    info: string;
    error: string;
    warning: string;
    loading: string;
  };
}

export interface NotificationInterface {
  notice(noticeProps);

  removeNotice(key: string);

  destroy();
}

const now = Date.now();

let seed = 0;

export interface NotificationManagerType {
  config: ConfigProps,

  instances: Map<string, NotificationInterface | Promise<NotificationInterface>>;

  remove(key: string);

  clear();

  getUuid(): string;
}

const manager: NotificationManagerType = {
  config: {
    duration: 4.5,
    top: 24,
    bottom: 24,
    placement: 'topRight',
    icons: {
      success: 'check',
      info: 'info',
      error: 'error',
      warning: 'warning',
      loading: 'loading',
    },
  },
  instances: new Map<string, NotificationInterface | Promise<NotificationInterface>>(),
  remove(key: string) {
    this.instances.forEach(instance => {
      if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
        instance.then(ins => ins.removeNotice(key));
      } else {
        instance.removeNotice(key);
      }
    });
  },
  clear() {
    const { instances } = this;
    instances.forEach(instance => {
      if (isPromise<NotificationInterface, NotificationInterface>(instance)) {
        instance.then(ins => ins.destroy());
      } else {
        instance.destroy();
      }
    });
    instances.clear();
  },
  getUuid() {
    return `c7nNotification_${now}_${seed++}`;
  },
};

export default manager;
