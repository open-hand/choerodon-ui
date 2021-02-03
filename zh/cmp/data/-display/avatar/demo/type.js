import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <span style={{ marginRight: 10 }}>
      <Avatar icon="person" />
    </span>
    <span style={{ marginRight: 10 }}>
      <Avatar>U</Avatar>
    </span>
    <span style={{ marginRight: 10 }}>
      <Avatar>USER</Avatar>
    </span>
    <span style={{ marginRight: 10 }}>
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    </span>
    <span style={{ marginRight: 10 }}>
      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
        U
      </Avatar>
    </span>
    <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
  </div>,
  document.getElementById('container'),
);
