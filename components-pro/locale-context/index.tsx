import { ReactNode } from 'react';
import localeContext from './LocaleContext';
import formatReactTemplate from '../_util/formatReactTemplate';

export function $l(component: string, key: string, injectionOptions?: { [key: string]: ReactNode }) {
  const locale = localeContext.get(component, key);
  if (injectionOptions) {
    return formatReactTemplate(locale, injectionOptions);
  }
  return locale;
}

export default localeContext;
