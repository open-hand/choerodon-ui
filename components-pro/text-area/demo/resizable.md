---
order: 1
title:
  zh-CN: 拖拽调整大小
  en-US: Resizable 
---

## zh-CN

拖拽调整大小

## en-US

Resizable.

````jsx
import { TextArea, Row, Col } from 'choerodon-ui/pro';


ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <TextArea placeholder="resize both" resize="both" cols={40} />
    </Col>
    <Col span={8}>
      <TextArea placeholder="resize vertical" resize="vertical" cols={40} />
    </Col>
    <Col span={8}>
      <TextArea placeholder="resize horizontal" resize="horizontal" cols={40} />
    </Col>
  </Row>,
  mountNode
);
````
