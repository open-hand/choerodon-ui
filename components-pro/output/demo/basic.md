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
import { Output, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <Output value="hello" />
    </Col>
    <Col span={8}>
      <Output />
    </Col>
    <Col span={8}>
      <Output />
    </Col>
  </Row>,
  mountNode
);
````
