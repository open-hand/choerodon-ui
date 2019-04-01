---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

## en-US

````jsx
import { CheckBox } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <div>
    <CheckBox name="base" value="A" onChange={handleChange} defaultChecked>A</CheckBox>
    <CheckBox name="base" value="B" onChange={handleChange}>B</CheckBox>
    <CheckBox name="base" value="C" onChange={handleChange}>C</CheckBox>
    <CheckBox name="base" value="C" onChange={handleChange}>C</CheckBox>
  </div>,
  mountNode
);
````
