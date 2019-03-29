---
order: 0
title:
  zh-CN: 基本使用
  en-US: SelectBox
---

## zh-CN

按钮选则框。

## en-US

SelectBox.

````jsx
import { SelectBox, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = SelectBox;

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <SelectBox onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
    <Col span={12}>
      <SelectBox disabled>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
  </Row>,
  mountNode
);
````
