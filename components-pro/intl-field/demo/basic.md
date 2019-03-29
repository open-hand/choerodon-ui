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
import { IntlField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log('[basic]', value);
}

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <IntlField placeholder="请输入" onChange={log} />
    </Col>
    <Col span={12}>
      <IntlField placeholder="默认英文" onChange={log} lang="en_GB" />
    </Col>
  </Row>,
  mountNode
);
````
