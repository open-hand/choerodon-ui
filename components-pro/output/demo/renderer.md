---
order: 1
title:
  zh-CN: 使用renderer
  en-US: Use renderer
---

## zh-CN

使用renderer属性覆盖默认渲染行为。

## en-US

Use `renderer` property to override the default render process.

````jsx
import { Output } from 'choerodon-ui/pro';

function rendererOne(param) {
  const { text } = param;
  return <span style={{ color: 'red' }}>{text}</span>;
}

ReactDOM.render(
  <Output value="hello" renderer={rendererOne} />,
  mountNode
);
````
