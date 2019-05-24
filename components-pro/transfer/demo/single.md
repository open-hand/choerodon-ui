---
order: 5
title:
  zh-CN: 单选
  en-US: Radio select
---

## zh-CN

单选。

## en-US

Radio select.

````jsx
import { Transfer, Switch } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = Transfer;

ReactDOM.render(
  <Transfer multiple={false} onChange={handleChange}>
    <Option value="jack">Jack</Option>
    <Option value="lucy">Lucy</Option>
    <Option value="wu">Wu</Option>
  </Transfer>,
  mountNode
);
````
