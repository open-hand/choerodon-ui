import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <div>
      <Avatar size={64} icon="person" />
      <Avatar size="large" icon="person" />
      <Avatar icon="person" />
      <Avatar size="small" icon="person" />
    </div>
    <div>
      <Avatar shape="square" size={64} icon="person" />
      <Avatar shape="square" size="large" icon="person" />
      <Avatar shape="square" icon="person" />
      <Avatar shape="square" size="small" icon="person" />
    </div>
  </div>,
  document.getElementById('container'));
