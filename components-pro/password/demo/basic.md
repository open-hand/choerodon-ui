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
import { Password, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log(value);
}

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <Password placeholder="请输入密码" onChange={log} />
    </Col>
    <Col span={12}>
      <Password placeholder="无揭示按钮" reveal={false} />
    </Col>
  </Row>,
  mountNode
);
````
