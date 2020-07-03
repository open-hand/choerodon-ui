import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Row, Col } from 'choerodon-ui';

ReactDOM.render(
  <Row gutter={8}>
    <Col span={8}>
      <Input placeholder="username" maxLength={50} required label="username" />
    </Col>
    <Col span={8}>
      <Input type="password" placeholder="password" maxLength={20} required label="password" />
    </Col>
    <Col span={8}>
      <Input type="password" showPasswordEye placeholder="password" maxLength={20} required label="password" />
    </Col>
  </Row>,
  document.getElementById('container'));
