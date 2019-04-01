---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { NumberField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log(value);
}

ReactDOM.render(
  <div>
    <Row gutter={10}>
      <Col span={12}>
        <NumberField placeholder="请输入整数" step={1} onChange={log} />
      </Col>
      <Col span={12}>
        <NumberField placeholder="精确两位小数" step={0.01} min={0} />
      </Col>
    </Row>
    <Row gutter={10}>
      <Col span={12}>
        <NumberField placeholder="step = 1.1, min = 0.3, max = 9" onChange={log} step={1.1} min={0.3} max={9} />
      </Col>
      <Col span={12}>
        <NumberField placeholder="step = 1.1, min = -0.3" onChange={log} step={1.1} min={-0.3} />
      </Col>
    </Row>
  </div>,
  mountNode
);
````
