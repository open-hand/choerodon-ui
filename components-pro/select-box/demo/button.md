---
order: 6
title:
  zh-CN: 按钮视图
  en-US: Button View Mode
---

## zh-CN

按钮视图。

## en-US

Button View Mode.

```jsx
import { SelectBox, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button new]', value, '[button old]', oldValue);
}

const { Option } = SelectBox;

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <SelectBox mode="button" onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
    <Col span={12}>
      <SelectBox mode="button" multiple onChange={handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </SelectBox>
    </Col>
  </Row>,
  mountNode,
);
```
