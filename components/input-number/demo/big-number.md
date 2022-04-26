---
order: 4
title:
    zh-CN: 大数字
    en-US: Big Number
---

## zh-CN

大数字。

## en-US

Big Number.

```jsx
import { InputNumber } from 'choerodon-ui';

function onChange(value) {
  console.log('changed', value);
}

ReactDOM.render(
  <InputNumber label="数字" defaultValue="123456789.123456789" step={1} onChange={onChange} />,
  mountNode);
```
