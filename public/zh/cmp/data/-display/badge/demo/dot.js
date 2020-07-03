import React from 'react';
import ReactDOM from 'react-dom';
import { Badge, Icon } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Badge dot>
      <Icon type="notification" />
    </Badge>
    <Badge count={0} dot>
      <Icon type="notification" />
    </Badge>
    <Badge dot>
      <a href="#">Link something</a>
    </Badge>
  </div>,
  document.getElementById('container'));
