import { ReactNode } from 'react';
import localeContext from './LocaleContext';
import { formatReactTemplate } from '../formatter/formatReactTemplate';
import { Locale } from './locale';
import enUS from './en_US';

export function $l<T extends keyof Omit<Locale, 'lang'>>(
  component: T,
  key: keyof Locale[T],
): string;
export function $l<T extends keyof Omit<Locale, 'lang'>, P extends object>(
  component: T,
  key: keyof Locale[T],
  injectionOptions: P,
): P extends { [key: string]: infer V } ? V : string;
export function $l<T extends keyof Omit<Locale, 'lang'>>(
  component: T,
  key: keyof Locale[T],
  injectionOptions?: { [key: string]: ReactNode },
): ReactNode {
  const locale: string = localeContext.get<Locale, T>(component, key, enUS);
  if (injectionOptions) {
    return formatReactTemplate(locale, injectionOptions);
  }
  return locale;
}

export default localeContext;
