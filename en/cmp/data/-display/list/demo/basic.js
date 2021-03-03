import React from 'react';
import ReactDOM from 'react-dom';
import { List, Avatar } from 'choerodon-ui';

const data = [
  {
    title: 'Choerodon UI Title 1',
  },
  {
    title: 'Choerodon UI Title 2',
  },
  {
    title: 'Choerodon UI Title 3',
  },
  {
    title: 'Choerodon UI Title 4',
  },
];

ReactDOM.render(
  <List
    itemLayout="horizontal"
    dataSource={data}
    renderItem={(item) => (
      <List.Item>
        <List.Item.Meta
          avatar={
            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
          }
          title={
            <a href="https://open-hand.github.io/choerodon-ui/">{item.title}</a>
          }
          description="Choerodon"
        />
      </List.Item>
    )}
  />,
  document.getElementById('container'),
);
