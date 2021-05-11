---
order: 6
title:
  zh-CN: 按钮视图
  en-US: Button View Mode
---

## zh-CN

按钮视图。当在此模式下设置了disabled且option中的子元素为一个flex元素时，在选中的情况下会导致该option无法显示,可以给option中的子元素设置z-index提高层叠等级

## en-US

Button View Mode. When disabled in this mode and the sub-element in the option is a flex element, in some cases the option cannot be displayed. You can set the z-index to increase the level of the sub-element in the option.

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
