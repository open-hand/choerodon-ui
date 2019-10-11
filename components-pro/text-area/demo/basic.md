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

```jsx
import { TextArea, Row, Col } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <TextArea placeholder="Basic usage" />
    </Col>
    <Col span={8}>
      <TextArea placeholder="readOnly" readOnly />
    </Col>
    <Col span={8}>
      <TextArea placeholder="disabled" disabled />
    </Col>
  </Row>,
  mountNode,
);
```
