import React from 'react';
import ReactDOM from 'react-dom';
import { Badge } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Badge count={5}>
      <a href="#" className="head-example" />
    </Badge>
    <Badge count={0} showZero>
      <a href="#" className="head-example" />
    </Badge>
  </div>,
  document.getElementById('container'));
