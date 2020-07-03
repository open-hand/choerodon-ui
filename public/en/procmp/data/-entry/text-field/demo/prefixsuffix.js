import React from 'react';
import ReactDOM from 'react-dom';
import { TextField, Row, Col, Icon } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <TextField placeholder="前缀" prefix={<Icon type="person" />} />
    </Col>
    <Col span={12}>
      <TextField placeholder="后缀" suffix={<Icon type="person" />} />
    </Col>
  </Row>,
  document.getElementById('container')
);
