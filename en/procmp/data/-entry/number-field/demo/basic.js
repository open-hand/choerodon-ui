import React from 'react';
import ReactDOM from 'react-dom';
import { NumberField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log(value);
}

ReactDOM.render(
  <div>
    <Row style={{ marginBottom: 10 }} gutter={10}>
      <Col span={12}>
        <h4>限制输入整数，步距为 1</h4>
        <NumberField
          placeholder="请输入整数"
          precision={0}
          step={1}
          onChange={log}
        />
      </Col>
    </Row>
    <Row style={{ marginBottom: 10 }} gutter={10}>
      <Col span={12}>
        <h4>步距为 2</h4>
        <NumberField
          placeholder="请输入整数"
          precision={0}
          step={2}
          onChange={log}
        />
      </Col>
      <Col span={12}>
        <h4>精确两位小数</h4>
        <NumberField placeholder="精确两位小数" precision={2} min={0} />
      </Col>
    </Row>
    <Row gutter={10}>
      <Col span={12}>
        <h4>小数步距，且限制最大、最小值</h4>
        <NumberField
          placeholder="step = 1.1, min = 0.3, max = 9"
          onChange={log}
          step={1.1}
          min={0.3}
          max={9}
        />
      </Col>
      <Col span={12}>
        <h4>小数步距，且限制最小值</h4>
        <NumberField
          placeholder="step = 1.1, min = -0.3"
          onChange={log}
          step={1.1}
          min={-0.3}
        />
      </Col>
    </Row>
  </div>,
  document.getElementById('container'),
);
