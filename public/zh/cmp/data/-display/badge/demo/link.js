import React from 'react';
import ReactDOM from 'react-dom';
import { Badge } from 'choerodon-ui';

ReactDOM.render(
  <a href="#">
    <Badge count={5}>
      <span className="head-example" />
    </Badge>
  </a>,
  document.getElementById('container'));
