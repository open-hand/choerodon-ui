import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Avatar icon="person" />
    <Avatar>U</Avatar>
    <Avatar>USER</Avatar>
    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>U</Avatar>
    <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
  </div>,
  document.getElementById('container'));
