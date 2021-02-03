import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <div>
      <span style={{ marginRight: 10 }}>
        <Avatar size={64} icon="person" />
      </span>
      <span style={{ marginRight: 10 }}>
        <Avatar size="large" icon="person" />
      </span>
      <span style={{ marginRight: 10 }}>
        <Avatar icon="person" />
      </span>
      <Avatar size="small" icon="person" />
    </div>
    <div>
      <span style={{ marginRight: 10 }}>
        <Avatar shape="square" size={64} icon="person" />
      </span>
      <span style={{ marginRight: 10 }}>
        <Avatar shape="square" size="large" icon="person" />
      </span>
      <span style={{ marginRight: 10 }}>
        <Avatar shape="square" icon="person" />
      </span>
      <Avatar shape="square" size="small" icon="person" />
    </div>
  </div>,
  document.getElementById('container'),
);
