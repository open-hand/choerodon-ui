import React from 'react';
import ReactDOM from 'react-dom';
import { Badge } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Badge count={25} />
    <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} />
    <Badge count={109} style={{ backgroundColor: '#52c41a' }} />
  </div>,
  document.getElementById('container'));
