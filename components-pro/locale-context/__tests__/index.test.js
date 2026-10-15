import { $l } from '..';
import en from '../en_US';
import enGB from '../en_GB';
import ja from '../ja_JP';
import zh from '../zh_CN';
import localeContext from '../LocaleContext';

describe('LocaleContext', () => {
  beforeEach(() => {
    localeContext.setLocale(zh);
  });

  afterEach(() => {
    localeContext.setLocale(zh);
  });

  it.each([en, enGB, ja, zh])('provides complete ColorPicker resources for $lang', locale => {
    expect(Object.keys(locale.ColorPicker).sort()).toEqual(Object.keys(zh.ColorPicker).sort());
    Object.values(locale.ColorPicker).forEach(value => expect(value.length).toBeGreaterThan(0));
    localeContext.setLocale(locale);
    expect($l('ColorPicker', 'value_missing', { label: 'Theme' })).toBe(locale.ColorPicker.value_missing.replace('{label}', 'Theme'));
    ['no_fill', 'mode_single', 'mode_gradient', 'opacity', 'stop', 'gradient_direction', 'radial', 'gradient_style_value', 'invalid_gradient'].forEach(key => {
      expect($l('ColorPicker', key)).toBe(locale.ColorPicker[key]);
    });
  });

  it('LocaleContext return transfer front', () => {
    const TransferFont = $l('Transfer', 'items');
    expect(TransferFont).toEqual('项');
  });

  it('LocaleContext change lauguage return transfer front', () => {
    localeContext.setLocale(en);
    const TransferFont = $l('Transfer', 'items');
    expect(TransferFont).toEqual('items');
  });

  it('LocaleContext change supports', () => {
    expect(localeContext.supports).toEqual({
      zh_CN: '简体中文',
      en_GB: 'English',
      en_US: 'English(US)',
    });
    localeContext.setSupports({ zh_CN: '简体中文', en_GB: 'English', ja_JP: '日本語' });
    expect(localeContext.supports).toEqual({
      zh_CN: '简体中文',
      en_GB: 'English',
      ja_JP: '日本語',
    });
  });
});
