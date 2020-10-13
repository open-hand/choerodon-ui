import React from 'react';
import ReactDOM from 'react-dom';
import { Statistic, Row, Col, Icon } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Row gutter={16}>
      <Col span={12}>
        <Statistic
          title="Feedback"
          value={1128}
          prefix={<Icon type="people_outline-o" />}
        />
      </Col>
      <Col span={12}>
        <Statistic title="Unmerged" value={93} suffix="/ 100" />
      </Col>
    </Row>
  </div>,
  document.getElementById('container'),
);
