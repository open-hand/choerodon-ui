import localeContext from './LocaleContext';
import { Locale } from './locale';

export function $l<L extends Locale, T extends keyof Omit<L, 'lang'>>(
  component: T,
  key: keyof L[T],
  defaults?: L,
) {
  return localeContext.get<L, T>(component, key, defaults);
}

export default localeContext;
