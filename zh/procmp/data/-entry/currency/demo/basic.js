import React from 'react';
import ReactDOM from 'react-dom';
import { Currency, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Row gutter={10}>
      <Col span={12}>
        <Currency defaultValue={10000} />
      </Col>
      <Col span={12}>
        <Currency currency="CNY" defaultValue={10000} />
      </Col>
    </Row>
  </div>,
  document.getElementById('container')
);
