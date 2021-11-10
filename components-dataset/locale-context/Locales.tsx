import { Lang } from './enum';

export default class Locales {
  constructor(locales: any) {
    Object.assign(this, locales);
  }

  get(lang: Lang) {
    return this[lang];
  }

  set(lang: Lang, value: any) {
    this[lang] = value;
  }
}
