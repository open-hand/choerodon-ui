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
import { Input, Row, Col } from 'choerodon-ui';

ReactDOM.render(
  <Row gutter={8}>
    <Col span={12}>
      <Input placeholder="Basic usage" maxLength={50} required label="Basic" copy />
    </Col>
    <Col span={12}>
      <Input defaultValue="123" placeholder="Basic usage" maxLength={20} required label="Basic" disabled />
    </Col>
  </Row>
  , mountNode);
````
