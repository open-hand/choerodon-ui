import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData } from 'react-intl';
import collect from 'bisheng/collect';
import moment from 'moment';
import { ConfigProvider, LocaleProvider } from 'choerodon-ui';
import { localeContext } from 'choerodon-ui/pro';
import { uiConfigure } from '../Layout';
import * as utils from '../utils';
import cnLocale from '../../zh-CN';
import enLocale from '../../en-US';

export default collect(async (nextProps) => {
  const { pathname } = nextProps.location;
  const appLocale = utils.isZhCN(pathname) ? cnLocale : enLocale;
  addLocaleData(appLocale.data);
  const [, demoId, ...pageDataPath] = pathname.replace('-cn', '').split('/');
  const demosFetcher = nextProps.utils.get(nextProps.data, [...pageDataPath, 'demo']);
  if (demosFetcher) {
    const demos = await demosFetcher();
    const demo = demos[demoId];
    if (demo) {
      return { demo, appLocale };
    }
  }
  throw 404; // eslint-disable-line no-throw-literal
})(({ demo, appLocale: { locale, componentsLocale, proComponentsLocale } }) => {
  useEffect(() => {
    moment.locale(locale);
    localeContext.setLocale(proComponentsLocale);
  }, []);
  return (
    <ConfigProvider {...uiConfigure}>
      <LocaleProvider locale={componentsLocale}>
        {demo.preview(React, ReactDOM)}
      </LocaleProvider>
    </ConfigProvider>
  );
});
