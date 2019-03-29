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
  mountNode
);
````
