import { $l } from '..';
import en from '../en_US';
import localeContext from '../LocaleContext';

describe('LocaleContext', () => {
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
