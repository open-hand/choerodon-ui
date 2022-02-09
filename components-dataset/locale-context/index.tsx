import localeContext from './LocaleContext';
import { Locale } from './locale';
import { formatTemplate } from '../formatter';

export function $l<L extends Locale, T extends keyof Omit<L, 'lang'>>(
  component: T,
  key: keyof L[T],
  defaults?: L,
  injectionOptions?: { [key: string]: string | number },
) {
  const locale: string = localeContext.get<L, T>(component, key, defaults);
  if (injectionOptions) {
    return formatTemplate(locale, injectionOptions);
  }
  return locale;
}

export default localeContext;
