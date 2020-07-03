import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'choerodon-ui';

ReactDOM.render(
  <div style={{ background: '#ECECEC', padding: '30px' }}>
    <Card title="Card title" bordered={false} style={{ width: 300 }}>
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
  </div>,
  document.getElementById('container'));
