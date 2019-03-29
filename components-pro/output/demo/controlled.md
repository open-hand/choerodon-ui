---
order: 1
title:
  zh-CN: 受控
  en-US: Under Control
---

## zh-CN

受控。

## en-US

Under control.

````jsx
import { Output, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <Output value="1" />
    </Col>
    <Col span={8}>
      <Output value="2" />
    </Col>
    <Col span={8}>
      <Output value="3" />
    </Col>
  </Row>,
  mountNode
);
````
