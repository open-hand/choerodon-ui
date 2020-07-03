import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Badge } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <span style={{ marginRight: 24 }}>
      <Badge count={1}><Avatar shape="square" icon="person" /></Badge>
    </span>
    <span>
      <Badge dot><Avatar shape="square" icon="person" /></Badge>
    </span>
  </div>,
  document.getElementById('container'));
