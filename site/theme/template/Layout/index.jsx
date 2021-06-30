import 'intersection-observer';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { enquireScreen } from 'enquire-js';
import { addLocaleData, IntlProvider } from 'react-intl';
import { LocaleProvider } from 'choerodon-ui';
import { localeContext, ModalProvider } from 'choerodon-ui/pro';
import moment from 'moment';
import { configure } from 'mobx';
import Header from './Header';
import enLocale from '../../en-US';
import cnLocale from '../../zh-CN';
import * as utils from '../utils';
import mock from '../../mock';

mock();

configure({ enforceActions: 'always' });

if (typeof window !== 'undefined') {
  /* eslint-disable global-require */
  require('../../static/style');

  // Expose to iframe
  window.react = React;
  window['react-dom'] = ReactDOM;
  window['choerodon-ui'] = require('choerodon-ui');
  /* eslint-enable global-require */
}

let isMobile = false;
enquireScreen(b => {
  isMobile = b;
});

export default class Layout extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    isMobile: PropTypes.bool,
  };

  getChildContext() {
    const { isMobile: mobile } = this.state;
    return {
      isMobile: mobile,
    };
  }

  constructor(props) {
    super(props);
    const { pathname } = props.location;
    const appLocale = utils.isZhCN(pathname) ? cnLocale : enLocale;
    addLocaleData(appLocale.data);
    this.state = {
      appLocale,
      isMobile,
    };
  }

  componentDidMount() {
    const nprogressHiddenStyle = document.getElementById('nprogress-style');
    if (nprogressHiddenStyle) {
      this.timer = setTimeout(() => {
        nprogressHiddenStyle.parentNode.removeChild(nprogressHiddenStyle);
      }, 0);
    }

    enquireScreen(b => {
      this.setState({
        isMobile: !!b,
      });
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { children, ...restProps } = this.props;
    const { location } = restProps;
    const { appLocale } = this.state;
    const { locale, componentsLocale, proComponentsLocale, messages } = appLocale;
    moment.locale(locale);
    localeContext.setLocale(proComponentsLocale);
    return (
      <IntlProvider locale={locale} messages={messages}>
        <LocaleProvider locale={componentsLocale}>
          <div className="page-wrapper">
            <ModalProvider location={location}>
              <Header {...restProps} />
              {children}
            </ModalProvider>
          </div>
        </LocaleProvider>
      </IntlProvider>
    );
  }
}
