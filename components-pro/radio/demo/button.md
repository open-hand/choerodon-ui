---
order: 5
title:
  zh-CN: 按钮显示效果
  en-US: Button display
---

## zh-CN

显示成按钮。

## en-US

Button display.

````jsx
import { Radio } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <form>
    <Radio mode="button" name="base" value="A" onChange={handleChange} defaultChecked>A</Radio>
    <Radio mode="button" name="base" value="B" onChange={handleChange}>B</Radio>
    <Radio mode="button" name="base" value="C" onChange={handleChange}>C</Radio>
  </form>,
  mountNode
);
````
