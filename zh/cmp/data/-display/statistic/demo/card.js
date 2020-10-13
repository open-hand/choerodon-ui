import React from 'react';
import ReactDOM from 'react-dom';
import { Statistic, Card, Row, Col, Icon } from 'choerodon-ui';

ReactDOM.render(
  <div style={{ background: '#ececec', padding: '30px' }}>
    <Row gutter={16}>
      <Col span={12}>
        <Card>
          <Statistic
            title="Active"
            value={11.28}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix={<Icon type="backup-o" />}
            suffix="%"
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card>
          <Statistic
            title="Idle"
            value={9.3}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            prefix={<Icon type="cloud_download-o" />}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  </div>,
  document.getElementById('container'),
);
