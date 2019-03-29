import localeContext from './LocaleContext';

export function $l(component: string, key: string) {
  return localeContext.get(component, key);
}

export default localeContext;
