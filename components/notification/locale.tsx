import defaultLocale from '../locale-provider/default';

export interface NoticeLocale {
  total: string;
  message: string;
  closeAll: string;
}

let runtimeLocale: NoticeLocale = {
  ...defaultLocale.Notification,
};

export function changeNoticeLocale(newLocale?: NoticeLocale) {
  if (newLocale) {
    runtimeLocale = {
      ...runtimeLocale,
      ...newLocale,
    };
  } else {
    runtimeLocale = {
      ...defaultLocale.Notification,
    };
  }
}

export function getNoticeLocale() {
  return runtimeLocale;
}
