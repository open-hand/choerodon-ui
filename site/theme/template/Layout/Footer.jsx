import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Modal, Row, Col } from 'choerodon-ui';
import { isLocalStorageNameSupported } from '../utils';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.lessLoaded = false;
  }

  componentDidMount() {
    // for some iOS
    // http://stackoverflow.com/a/14555361
    if (!isLocalStorageNameSupported()) {
      return;
    }
    // 大版本发布后全局弹窗提示
    //   1. 点击『知道了』之后不再提示
    //   2. 超过截止日期后不再提示
    if (
      localStorage.getItem('antd@3.0.0-notification-sent') !== 'true' &&
      Date.now() < new Date('2017/12/20').getTime()
    ) {
      this.infoNewVersion();
    }
  }

  infoNewVersion() {
    const { messages } = this.props.intl;
    Modal.info({
      title: messages['app.publish.title'],
      content: (
        <div>
          <img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="Ant Design" />
          <p>
            {messages['app.publish.greeting']}
            <a target="_blank" rel="noopener noreferrer" href="/changelog">antd@3.0.0</a>
            {messages['app.publish.intro']}
            {messages['app.publish.old-version-guide']}
            <a target="_blank" rel="noopener noreferrer" href="http://2x.ant.design">2x.ant.design</a>
            {messages['app.publish.old-version-tips']}
          </p>
        </div>
      ),
      okText: 'OK',
      onOk: () => localStorage.setItem('antd@3.0.0-notification-sent', 'true'),
      className: 'new-version-info-modal',
      width: 470,
    });
  }

  render() {
    return (
      <footer id="footer">
        <div className="footer-wrap">
          <Row>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2><FormattedMessage id="app.footer.resources" /></h2>
                <div>
                  <a href="http://ant-design.gitee.io/">Ant Design</a>
                </div>
                <div>
                  <a href="http://scaffold.ant.design">Scaffolds</a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.scaffolds" />
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/dvajs/dva">dva</a> - <FormattedMessage id="app.footer.dva" />
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="http://motion.ant.design">Ant Motion</a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.motion" />
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="http://library.ant.design/">Axure Library</a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.antd-library" />
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="http://ux.ant.design">Ant UX</a>
                  <span> - </span>
                  <FormattedMessage id="app.footer.antux" />
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2><FormattedMessage id="app.footer.help" /></h2>
                <div>
                  <a target="_blank " href="https://github.com/choerodon/choerodon-ui">
                    GitLab
                  </a>
                </div>
                <div>
                  <a href="/changelog">
                    <FormattedMessage id="app.footer.change-log" />
                  </a>
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/choerodon/choerodon-ui/issues">
                    <FormattedMessage id="app.footer.issues" />
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <Row className="bottom-bar">
          <Col md={4} sm={24} />
          <Col md={20} sm={24}>
            <span style={{ marginRight: 12 }}>Copyright@ The choerodon Author. All rights reserved.</span>
          </Col>
        </Row>
      </footer>
    );
  }
}

export default injectIntl(Footer);
