import React from 'react';
import ReactDOM from 'react-dom';
import { Card, Col, Row } from 'choerodon-ui';

ReactDOM.render(
  <div style={{ background: '#ECECEC', padding: '30px' }}>
    <Row gutter={16}>
      <Col span={8}>
        <Card title="Card title" bordered={false}>Card content</Card>
      </Col>
      <Col span={8}>
        <Card title="Card title" bordered={false}>Card content</Card>
      </Col>
      <Col span={8}>
        <Card title="Card title" bordered={false}>Card content</Card>
      </Col>
    </Row>
  </div>,
  document.getElementById('container'));
