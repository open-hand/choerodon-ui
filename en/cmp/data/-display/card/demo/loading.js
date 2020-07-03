import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'choerodon-ui';

ReactDOM.render(
  <Card loading title="Card title" style={{ width: '34%' }}>
    Whatever content
  </Card>,
  document.getElementById('container'));
