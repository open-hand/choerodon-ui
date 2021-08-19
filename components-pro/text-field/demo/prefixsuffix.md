---
order: 5
title:
  zh-CN: 前后缀
  en-US: Prefix & suffix
---

## zh-CN

前后缀。

## en-US

Prefix & suffix.

````jsx
import { TextField, Row, Col, Icon } from 'choerodon-ui/pro';

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <TextField placeholder="前缀" prefix={<Icon type="person" />} />
    </Col>
    <Col span={12}>
      <TextField placeholder="后缀" suffix={<Icon type="person" clearButton />} />
    </Col>
  </Row>,
  mountNode
);
````
