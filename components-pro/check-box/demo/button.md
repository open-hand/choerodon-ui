---
order: 4
title:
  zh-CN: 按钮显示效果
  en-US: Button display
---

## zh-CN

显示成按钮。

## en-US

Button display.

````jsx
import { CheckBox } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <div>
    <CheckBox mode="button" name="base" value="A" onChange={handleChange} defaultChecked>A</CheckBox>
    <CheckBox mode="button" name="base" value="B" onChange={handleChange}>B</CheckBox>
    <CheckBox mode="button" name="base" value="C" onChange={handleChange}>C</CheckBox>
  </div>,
  mountNode
);
````
