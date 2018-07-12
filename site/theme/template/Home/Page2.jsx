import React from 'react';
import { Row, Col } from 'choerodon-ui';
import QueueAnim from 'rc-queue-anim';
import ScrollOverPack from 'rc-scroll-anim/lib/ScrollOverPack';
import { FormattedMessage } from 'react-intl';

export default function Page2({ locale }) {
  const isZhCN = locale === 'zh-CN';
  return (
    <div className="home-page-wrapper page2" id="page2">
      <div className="page2-bg">
        <div className="page" >
          <h2>Let’s Pro</h2>
          <h3 className="label"><FormattedMessage id="app.home.pro-label" /></h3>
          <ScrollOverPack component={Row} className="page2-content" playScale="0.4">
            <QueueAnim
              component={Col}
              componentProps={{ xs: 24, md: 24 }}
              className="page2-pro"
              key="left"
              type="bottom"
              leaveReverse
            >
              <p key="p">
                <div>$ <a>git clone</a> git@github.com:ant-design/ant-design-pro.git --depth=1</div>
                <div>$ cd ant-design-pro</div>
                <div>$ npm install</div>
                <div>$ npm start</div>
              </p>
            </QueueAnim>
          </ScrollOverPack>
          <h3 className="desc">
            <div>需要帮助? 请先阅读 <a>开发文档</a> 和 <a>常见问题</a>，如果未能解决，可以到Github上 <a>进行提问</a></div>
          </h3>
          <div key="b" className="btn">
            {isZhCN ? '下载' : 'Download'} Pro
          </div>
        </div>
      </div>
    </div>
  );
}
