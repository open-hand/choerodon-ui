---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用。

## en-US

Basic Usage.

```jsx
import { Select } from 'choerodon-ui';

const Option = Select.Option;

function handleChange(value) {
  console.log(`selected ${value}`);
}

ReactDOM.render(
  <div>
    <Select
      label="Select"
      placeholder="Please Select"
      allowClear
      style={{ width: 200 }}
      onChange={handleChange}
    >
      <Option value="jack">Jack</Option>
      <Option value="lucy">Lucy</Option>
      <Option value="disabled" disabled>
        Disabled
      </Option>
      <Option value="Yiminghe">yiminghe</Option>
    </Select>
    <Select defaultValue="lucy" style={{ width: 200 }} allowClear disabled>
      <Option value="lucy">Lucy</Option>
    </Select>
  </div>,
  mountNode,
);
```
