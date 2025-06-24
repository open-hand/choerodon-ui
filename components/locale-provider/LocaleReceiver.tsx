import { Component, ReactNode } from 'react';
import { LocaleContext } from './index';

export interface LocaleReceiverProps {
  componentName: string;
  defaultLocale: object | Function | Record<string, any>;
  children: (locale: object, localeCode?: string) => ReactNode;
}

export interface LocaleReceiverContext {
  c7nLocale?: { [key: string]: any };
}

export default class LocaleReceiver extends Component<LocaleReceiverProps> {
  static get contextType(): typeof LocaleContext {
    return LocaleContext;
  }

  context: LocaleReceiverContext;

  getLocale() {
    const { componentName, defaultLocale } = this.props;
    const { c7nLocale } = this.context;
    const localeFromContext = c7nLocale && c7nLocale[componentName];
    return {
      ...(typeof defaultLocale === 'function' ? defaultLocale() : defaultLocale),
      ...(localeFromContext || {}),
    };
  }

  getLocaleCode() {
    const { c7nLocale } = this.context;
    const localeCode = c7nLocale && c7nLocale.locale;
    // Had use LocaleProvide but didn't set locale
    if (c7nLocale && c7nLocale.exist && !localeCode) {
      return 'en-us';
    }
    return localeCode;
  }

  render() {
    const { children } = this.props;
    return children(this.getLocale(), this.getLocaleCode());
  }
}
