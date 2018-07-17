import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { Row, Col } from 'choerodon-ui';
import ScrollOverPack from 'rc-scroll-anim/lib/ScrollOverPack';
import { FormattedMessage } from 'react-intl';

const page1Data = [
  {
    imgCls: 'feature-1',
    name: '优雅美观',
    nameEn: 'Elegant and beautiful',
    desc: '基于 Ant Design 体系精心设计',
    descEn: 'Designed based on Ant Design system',
  },
  {
    imgCls: 'feature-2',
    name: '常见设计模式',
    nameEn: 'Common design pattern',
    desc: '提炼自中后台应用的典型页面和场景',
    descEn: 'Refine typical pages and scenes from backend applications',
  },
  {
    imgCls: 'feature-3',
    name: '最新技术栈',
    nameEn: 'Latest technology stack',
    desc: '使用 React/dav/antd 等前端前沿技术开发',
    descEn: 'Developed with front-end technology such as React/dav/antd',
  },
  {
    imgCls: 'feature-4',
    name: '最佳实践',
    nameEn: 'Best practices',
    desc: '良好的工程实践助你持续产出高质量代码',
    descEn: 'Good engineering practices help you consistently produce high quality code',
  },
  {
    imgCls: 'feature-5',
    name: '主题',
    nameEn: 'Theme',
    desc: '可配置的主题满足多样化的品牌诉求',
    descEn: 'Configurable themes to meet diverse brand appeals',
  },
  {
    imgCls: 'feature-6',
    name: '国际化',
    nameEn: 'Internation',
    desc: '内建业界通用的国际化方案（敬请期待）',
    descEn: 'General internationalization soultion',
  },
];

export default class Page1 extends React.PureComponent {
  getSvgChild = child => child.map((item, i) => {
    const props = { ...item.props };
    if (item.type === 'g') {
      props.transform = null;
    } else {
      ['x', 'y', 'cx', 'cy'].forEach((str) => {
        if (str in props) {
          props[str] = null;
        }
      });
    }
    return (
      <g key={i.toString()}>
        {React.cloneElement(item, props)}
      </g>
    );
  });

  render() {
    const { locale } = this.props;
    const isZhCN = locale === 'zh-CN';
    const children = page1Data.map((item) => {
      return (
        <Col key={item.nameEn} md={8} xs={24}>
          <QueueAnim
            className="page1-block"
            type="bottom"
          >
            <div className="page1-image">
              <div className={item.imgCls} />
            </div>
            <h3>{isZhCN ? item.name : item.nameEn}</h3>
            <p>{isZhCN ? item.desc : item.descEn}</p>
          </QueueAnim>
        </Col>
      );
    });
    return (
      <div className="home-page-wrapper page1">
        <div className="page">
          <h2>Choerodon UI <FormattedMessage id="app.home.feature" /></h2>
          <ScrollOverPack playScale="0.3">
            <QueueAnim
              component={Row}
              key="queue"
              type="bottom"
              ease={['easeOutQuart', 'easeInQuart']}
              leaveReverse
            >
              {children}
            </QueueAnim>
          </ScrollOverPack>
        </div>
      </div>
    );
  }
}
