---
order: 0
title:
  zh-CN: 自定义格式
  en-US: formatter
---

## zh-CN

自定义格式。

## en-US

formatter

````jsx
import { NumberField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log(value);
}

ReactDOM.render(
  <div>
    <Row gutter={10}>
      <Col span={12} style={{ marginBottom: 10 }}>
        <NumberField formatterOptions={{options:{useGrouping:false}}} placeholder="请输入整数" step={1} onChange={log} />
      </Col>
      <Col span={12} style={{ marginBottom: 10 }}>
        <NumberField formatterOptions={{lang:'en-IN'}} placeholder="请输入小数" step={0.1} onChange={log} />
      </Col>
      <Col span={12} style={{ marginBottom: 10 }}>
        <NumberField formatter={(value)=>value} placeholder="请输入整数" step={1} onChange={log} />
      </Col>
    </Row>
  </div>,
  mountNode,
);
````
