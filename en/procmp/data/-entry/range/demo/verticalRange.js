import React from 'react';
import ReactDOM from 'react-dom';
import { Range, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <>
    <Row>
      <Col span={1}>
        <div style={{ height: 200 }}>
          <Range vertical min={0} max={100} step={5} defaultValue={30} />
        </div>
      </Col>
      <Col span={1}>
        <Range
          vertical
          style={{ height: 200 }}
          min={0}
          max={100}
          step={5}
          defaultValue={60}
        />
      </Col>
    </Row>
  </>,
  document.getElementById('container'),
);
