import { action, get, observable, runInAction } from 'mobx';
import moment from 'moment';
import { Lang } from './enum';
import defaultLocale, { Locale } from './locale';
import defaultSupports, { Supports } from './supports';
import normalizeLanguage from '../_util/normalizeLanguage';

function setMomentLocale(locale: Locale) {
  moment.locale(normalizeLanguage(locale ? locale.lang : defaultLocale.lang));
}

export class LocaleContext {
  @observable locale: Locale;

  // 数字格式化使用的国际化语言编码， 未设置时使用 locale.lang
  @observable numberFormatLanguage: Lang;

  @observable supports: Supports;

  constructor() {
    runInAction(() => {
      this.locale = defaultLocale;
      this.supports = defaultSupports;
    });
  }

  @action
  setLocale(locale: Locale) {
    setMomentLocale(locale);
    this.locale = locale;
  }

  @action
  setNumberFormatLanguage(numberFormatLanguage: Lang) {
    this.numberFormatLanguage = numberFormatLanguage;
  }

  @action
  setSupports(supports: Supports) {
    this.supports = supports;
  }

  get(component: string, key: string) {
    const cmp = get(this.locale, component);
    return (cmp && get(cmp, key)) || `${component}.${key}`;
  }
}

export default new LocaleContext();
