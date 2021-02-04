import React from 'react';
import ReactDOM from 'react-dom';
import { List, Avatar, Icon } from 'choerodon-ui';

const listData = [];
for (let i = 0; i < 5; i += 1) {
  listData.push({
    href: 'https://open-hand.github.io/choerodon-ui/',
    title: `choerodon ui part ${i}`,
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    description:
      'Choerodon UI, An enterprise-class UI design language and React-based implementation.',
    content:
      'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
  });
}

const pagination = {
  pageSize: 10,
  current: 1,
  total: listData.length,
  onChange: () => {},
};

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

ReactDOM.render(
  <List
    itemLayout="vertical"
    size="large"
    pagination={pagination}
    dataSource={listData}
    renderItem={item => (
      <List.Item
        key={item.title}
        actions={[
          <IconText key="star-o" type="star-o" text="156" />,
          <IconText key="like-o" type="like-o" text="156" />,
          <IconText key="message" type="message" text="2" />,
        ]}
        extra={
          <img
            width={272}
            alt="logo"
            src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
          />
        }
      >
        <List.Item.Meta
          avatar={<Avatar src={item.avatar} />}
          title={<a href={item.href}>{item.title}</a>}
          description={item.description}
        />
        {item.content}
      </List.Item>
    )}
  />,
  document.getElementById('container'),
);
