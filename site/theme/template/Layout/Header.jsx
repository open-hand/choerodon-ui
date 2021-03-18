import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'bisheng/router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Button, Col, Icon, Menu, Popover, Row, Select } from 'choerodon-ui';
import * as utils from '../utils';
import { version as c7nUIVersion } from '../../../../package.json';
import logo from '../../static/images/logo-title.svg';

const { Option } = Select;

function getStyle() {
  return `
    #header .c7n-select-selection {
      height: 24px;
      padding-top: 0;
    }
  `;
}

function getPathnameRegExp(pathname) {
  if (pathname === '/') {
    return /\/$/;
  }
  if (pathname.startsWith('/')) {
    return new RegExp(pathname);
  }
  return new RegExp(`/${pathname}`);
}

export default class Header extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
  };

  state = {
    menuVisible: false,
  };

  componentDidMount() {
    const { router } = this.context;
    router.listen(this.handleHideMenu);
  }

  handleShowMenu = () => {
    this.setState({
      menuVisible: true,
    });
  };

  handleHideMenu = () => {
    this.setState({
      menuVisible: false,
    });
  };

  onMenuVisibleChange = (visible) => {
    this.setState({
      menuVisible: visible,
    });
  };

  handleVersionChange = (url) => {
    const currentUrl = window.location.href;
    const currentPathname = window.location.pathname;
    window.location.href = currentUrl.replace(window.location.origin, url)
      .replace(currentPathname, utils.getLocalizedPathname(currentPathname));
  };

  handleLangChange = () => {
    const { location } = window;
    const { location: { pathname } } = this.props;
    const isZhCn = utils.isZhCN(pathname);

    if (utils.isLocalStorageNameSupported()) {
      localStorage.setItem('locale', isZhCn ? 'en-US' : 'zh-CN');
    }

    location.href = location.href.replace(
      getPathnameRegExp(pathname),
      utils.getLocalizedPathname(pathname, !isZhCn),
    );
  };

  render() {
    const { menuVisible } = this.state;
    const { isMobile } = this.context;
    const menuMode = isMobile ? 'inline' : 'horizontal';
    const {
      location, themeConfig,
    } = this.props;
    const docVersions = { ...themeConfig.docVersions, [c7nUIVersion]: c7nUIVersion };
    const versionOptions = Object.keys(docVersions)
      .map(version => <Option value={docVersions[version]} key={version}>{version}</Option>);
    const module = location.pathname.replace(/(^\/|\/$)/g, '').split('/').slice(0, -1).join('/');
    let activeMenuItem = module || 'home';
    if (location.pathname === 'changelog') {
      activeMenuItem = 'docs/react';
    }
    const { intl: { locale } } = this.context;
    const isZhCN = locale === 'zh-CN';

    const headerClassName = classNames({
      clearfix: true,
    });

    const menu = [
      <Button ghost size="small" onClick={this.handleLangChange} className="header-lang-button" key="lang-button">
        <FormattedMessage id="app.header.lang" />
      </Button>,
      <Select
        key="version"
        className="version"
        size="small"
        dropdownMatchSelectWidth={false}
        defaultValue={c7nUIVersion}
        onChange={this.handleVersionChange}
        getPopupContainer={trigger => trigger.parentNode}
      >
        {versionOptions}
      </Select>,
      <Menu className="menu-site" mode={menuMode} selectedKeys={[activeMenuItem]} id="nav" key="nav">
        <Menu.Item key="home">
          <Link to={utils.getLocalizedPathname('/', isZhCN)}>
            <FormattedMessage id="app.header.menu.home" />
          </Link>
        </Menu.Item>
        <Menu.Item key="gitee">
          <a href="https://graysheep.gitee.io/choerodon-ui/index-cn">
            <FormattedMessage id="app.header.menu.gitee" />
          </a>
        </Menu.Item>
        <Menu.Item key="docs/react">
          <Link to={utils.getLocalizedPathname('/docs/react/introduce', isZhCN)}>
            <FormattedMessage id="app.header.menu.doc" />
          </Link>
        </Menu.Item>
        <Menu.Item key="components">
          <Link to={utils.getLocalizedPathname('/components/button/', isZhCN)}>
            <FormattedMessage id="app.header.menu.components" />
          </Link>
        </Menu.Item>
        <Menu.Item key="components-pro">
          <Link to={utils.getLocalizedPathname('/components-pro/data-set/', isZhCN)}>
            <FormattedMessage id="app.header.menu.pro-components" />
          </Link>
        </Menu.Item>
      </Menu>,
    ];

    // const searchPlaceholder = locale === 'zh-CN' ? '在 choerodon-ui 中搜索' : 'Search in choerodon-ui';
    return (
      <header id="header" className={headerClassName}>
        {isMobile && (
          <Popover
            overlayClassName="popover-menu"
            placement="bottomRight"
            content={menu}
            trigger="click"
            visible={menuVisible}
            arrowPointAtCenter
            onVisibleChange={this.onMenuVisibleChange}
          >
            <Icon
              className="nav-phone-icon"
              type="menu"
              onClick={this.handleShowMenu}
            />
          </Popover>
        )}
        <Row>
          <Col xxl={4} xl={5} lg={5} md={5} sm={24} xs={24}>
            <Link to={utils.getLocalizedPathname('/', isZhCN)} id="logo">
              <img
                alt="logo"
                src={logo}
              />
            </Link>
          </Col>
          <Col xxl={20} xl={19} lg={19} md={18} sm={0} xs={0}>
            {!isMobile && menu}
          </Col>
        </Row>
        <style dangerouslySetInnerHTML={{ __html: getStyle() }} />
      </header>
    );
  }
}
