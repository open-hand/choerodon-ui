import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Row, Col } from 'choerodon-ui';

ReactDOM.render(
  <Row gutter={8}>
    <Col span={12}>
      <Input placeholder="Basic usage" maxLength={50} required label="Basic" copy />
    </Col>
    <Col span={12}>
      <Input defaultValue="123" placeholder="Basic usage" maxLength={20} required label="Basic" disabled />
    </Col>
  </Row>,
  document.getElementById('container'));
