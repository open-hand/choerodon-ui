---
order: 3
title:
  zh-CN: 指定容器渲染
  en-US: Specify container rendering
---

## zh-CN

使用 getContainer 属性指定容器渲染

## en-US

Use the getcontainer property to specify container rendering

````jsx
import React from 'react';
import { WaterMark } from 'choerodon-ui';

ReactDOM.render(
  <>
    <WaterMark content="Choerodon-ui" getContainer={()=> document.getElementById('water-mark')} />
    <div style={{ height: 500 }} id="water-mark" />
  </>,
  mountNode);
````
