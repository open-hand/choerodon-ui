import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Col, Row } from 'choerodon-ui';

class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.lessLoaded = false;
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
                  <a href="http://choerodon.io/">Choerodon</a>
                </div>
              </div>
            </Col>
            <Col md={6} sm={24} xs={24}>
              <div className="footer-center">
                <h2><FormattedMessage id="app.footer.help" /></h2>
                <div>
                  <a target="_blank " href="https://github.com/open-hand/choerodon-ui">
                    GitLab
                  </a>
                </div>
                <div>
                  <a href="/changelog">
                    <FormattedMessage id="app.footer.change-log" />
                  </a>
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-hand/choerodon-ui/issues">
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
