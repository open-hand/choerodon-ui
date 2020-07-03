import React from 'react';
import ReactDOM from 'react-dom';
import { TextArea, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <TextArea placeholder="Basic usage" />
    </Col>
    <Col span={8}>
      <TextArea placeholder="readOnly" readOnly />
    </Col>
    <Col span={8}>
      <TextArea placeholder="disabled" disabled />
    </Col>
  </Row>,
  document.getElementById('container'),
);
