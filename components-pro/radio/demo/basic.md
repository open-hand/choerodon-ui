---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

请确保Radio具有相同的name属性以实现单选功能。

## en-US

Make sure that Radio has the same name property to implement the radio function.

````jsx
import { Radio } from 'choerodon-ui/pro';

function handleChange(value) {
  console.log('[basic]', value);
document.addEventListener('click', {handleEvent(e){ console.log(e)}}, {capture:false, once:true})
}

ReactDOM.render(
  <form>
    <Radio name="base" value="A" onChange={handleChange} defaultChecked>A</Radio>
    <Radio name="base" value="B" onChange={handleChange}>B</Radio>
    <Radio name="base" value="C" onChange={handleChange}>C</Radio>
  </form>,
  mountNode
);
````
