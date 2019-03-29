---
order: 9
title:
  zh-CN: 复合下拉框
  en-US: ComboBox
---

## zh-CN

复合下拉框。

## en-US

ComboBox.

````jsx
import { Select, Row, Col } from 'choerodon-ui/pro';

function handleChange(value) {
  console.log('[combo]', value);
}

const { Option } = Select;

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <Select placeholder="复合" onChange={handleChange} combo>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>
    </Col>
    <Col span={12}>
      <Select placeholder="复合+可搜索" onChange={handleChange} combo searchable>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>
    </Col>
  </Row>,
  mountNode
);
````
