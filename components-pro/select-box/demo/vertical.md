---
order: 7
title:
  zh-CN: 垂直排列
  en-US: Vertical align
---

## zh-CN

垂直排列。

## en-US

Vertical align.

````jsx
import { SelectBox, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button new]', value, '[button old]', oldValue);
}

const { Option } = SelectBox;

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <SelectBox vertical mode="button" onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
    <Col span={12}>
      <SelectBox vertical mode="button" multiple onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
  </Row>,
  mountNode
);
````
