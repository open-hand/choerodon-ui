import defaultLocale from './default';
import { Locale } from './index';

let runtimeLocale: Locale = {
  ...defaultLocale,
};

export function changeRuntimeLocale(newLocale?: Locale) {
  if (newLocale && typeof newLocale === 'object') {
    Object.keys(newLocale).forEach(key => {
      if (typeof newLocale[key] === 'object') {
        runtimeLocale[key] = runtimeLocale[key]
          ? {
            ...runtimeLocale[key],
            ...newLocale[key],
          } : { ...newLocale[key] };
      } else {
        runtimeLocale[key] = newLocale[key];
      }
    });
  } else {
    runtimeLocale = {
      ...defaultLocale,
    };
  }
}

export function getRuntimeLocale() {
  return runtimeLocale;
}
