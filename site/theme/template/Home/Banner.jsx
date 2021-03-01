import React from 'react';
import PropTypes from 'prop-types';
import QueueAnim from 'rc-queue-anim';
import { Link } from 'bisheng/router';
import { FormattedMessage } from 'react-intl';
import * as utils from '../utils';


class Banner extends React.PureComponent {
  static contextTypes = {
    intl: PropTypes.object.isRequired,
  };

  static propTypes = {
    className: PropTypes.string,
  };

  static defaultProps = {
    className: 'banner',
  };

  render() {
    const { className, isMobile } = this.props;
    const { intl: { locale } } = this.context;
    const isZhCN = locale === 'zh-CN';
    return (
      <div className="home-page-wrapper banner-wrapper" id="banner">
        <QueueAnim className={`${className} page`} type="alpha" delay={150}>
          {isMobile && (
            <div className="img-wrapper" key="image">
              <div className="banner-image" />
            </div>
          )}
          <QueueAnim
            className="text-wrapper"
            key="text"
            type="bottom"
          >
            <h1 key="h1">
              Choerodon UI
            </h1>
            <h3 key="h3">
              <FormattedMessage id="app.home.based-on-ant-design" />
            </h3>
            <p key="p">
              <FormattedMessage id="app.home.introduce" />
            </p>
            <div className="banner-btns" key="buttons">
              <Link className="banner-btn components" to={utils.getLocalizedPathname('/docs/react/introduce', isZhCN)}>
                <FormattedMessage id="app.home.getting-started" />
              </Link>
              <a className="banner-btn github" target="_black" rel="noopener noreferrer" href="https://github.com/open-hand/choerodon-ui">
                Github
              </a>
            </div>
          </QueueAnim>
          {!isMobile && (
            <div className="img-wrapper" key="image">
              <div className="banner-image" />
            </div>
          )}
        </QueueAnim>
      </div>
    );
  }
}

export default Banner;
