import 'intersection-observer';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { enquireScreen } from 'enquire-js';
import { addLocaleData, IntlProvider } from 'react-intl';
import { ConfigProvider, configure as UIconfigure, LocaleProvider } from 'choerodon-ui';
import {
  localeContext, ModalProvider,
  // DataSet,
  // Modal,
  // Form,
  // TextField
} from 'choerodon-ui/pro';
// import omit from 'lodash/omit';
import moment from 'moment';
import { configure } from 'mobx';
import Header from './Header';
import enLocale from '../../en-US';
import cnLocale from '../../zh-CN';
import * as utils from '../utils';
import mock from '../../mock';

mock();

configure({ enforceActions: 'always' });

// const ds = new DataSet({
//   autoCreate: true,
//   fields: [{ name: 'H-SECRET-LEVEL', type: 'string', required: true, label: '密级' }],
// });

UIconfigure({
  lovQueryUrl: undefined,
  lovQueryAxiosConfig(code, lovConfig, props) {
    const { params } = props || {};
    return {
      url: `/common/lov/dataset/${code}${code === 'LOV_CODE' && params ? `/${params.pagesize}/${params.page}` : ''}`,
    };
  },
  // 密级配置
  // uploadSecretLevel: () => {
  //   return new Promise((resolve) => {
  //     Modal.open({
  //       title: '密级选择',
  //       children: <Form dataSet={ds}><TextField name="H-SECRET-LEVEL" /></Form>,
  //       onOk: async () => {
  //         if (await ds.get(0).validate()) {
  //           resolve(omit(ds.get(0).toData(), ['__dirty']));
  //           ds.reset();
  //         } else {
  //           return false;
  //         }
  //       },
  //       onCancel: () => {
  //         ds.reset();
  //         resolve(false);
  //       }
  //     });
  //   });
  // },
});

export const uiConfigure = {
  performanceEnabled: { Table: true },
  onPerformance(key, event) {
    if (event) {
      const { timing } = event;
      console.log(key, {
        fetch: timing.fetchEnd - timing.fetchStart,
        load: timing.loadEnd - timing.loadStart,
        render: timing.renderEnd - timing.renderStart,
      });
    }
  },
};

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
        <ConfigProvider {...uiConfigure}>
          <LocaleProvider locale={componentsLocale}>
            <div className="page-wrapper">
              <ModalProvider location={location}>
                <Header {...restProps} />
                {children}
              </ModalProvider>
            </div>
          </LocaleProvider>
        </ConfigProvider>
      </IntlProvider>
    );
  }
}
