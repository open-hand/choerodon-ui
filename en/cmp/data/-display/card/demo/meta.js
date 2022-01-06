import React from 'react';
import ReactDOM from 'react-dom';
import { Card, Icon, Avatar } from 'choerodon-ui';

const { Meta } = Card;

ReactDOM.render(
  <Card
    style={{ width: 300 }}
    cover={
      <img
        alt="example"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      />
    }
    actions={[
      <Icon key="setting" type="settings-o" />,
      <Icon key="edit" type="mode_edit" />,
      <Icon key="ellipsis" type="more_horiz" />,
    ]}
  >
    <Meta
      avatar={
        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      }
      title="Card title"
      description="This is the description"
    />
  </Card>,
  document.getElementById('container'),
);
