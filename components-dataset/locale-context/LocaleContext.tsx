import { action, observable, runInAction } from 'mobx';
import moment from 'moment';
import defaultTo from 'lodash/defaultTo';
import { Lang } from './enum';
import defaultLocale, { Locale } from './locale';
import defaultSupports, { Supports } from './supports';
import { normalizeLanguage, ZH_CN_MOMENT_LOCALE } from '../utils';
import { mobxGet } from '../mobx-helper';

function setMomentLocale(locale: Locale) {
  const localeLang = normalizeLanguage(locale ? locale.lang : defaultLocale.lang);
  moment.locale(localeLang);
  if (localeLang === 'zh-cn') {
    moment.updateLocale("zh-cn", ZH_CN_MOMENT_LOCALE);
  }
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

  getCmp(component: string): object | undefined {
    return mobxGet(this.locale, component);
  }

  get<L extends Locale, T extends keyof Omit<L, 'lang'>>(component: T, key: keyof L[T], defaults?: L): string {
    const componentString = String(component);
    const cmp: object | undefined = mobxGet(this.locale, componentString) || (defaults && mobxGet(defaults, componentString));
    if (key) {
      return defaultTo(cmp && mobxGet(cmp, String(key)), `${componentString}.${key}`);
    }
    return componentString;
  }
}

export default new LocaleContext();
