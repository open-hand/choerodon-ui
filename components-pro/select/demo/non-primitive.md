---
order: 12
title:
  zh-CN: 非原始值
  en-US: Non Primitive Value
---

## zh-CN

非原始值。

## en-US

Non Primitive Value.

````jsx
import { Select } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[primitive new]', value, '[basic old]', oldValue);
}

const { Option } = Select;

ReactDOM.render(
  <Select placeholder="请选择" primitiveValue={false} onChange={handleChange}>
    <Option value="jack">Jack</Option>
    <Option value="lucy">Lucy</Option>
    <Option value="wu">Wu</Option>
  </Select>,
  mountNode
);
````
