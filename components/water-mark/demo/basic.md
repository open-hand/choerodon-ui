---
order: 0
title:
  zh-CN: 文字水印
  en-US: Basic
---

## zh-CN

水印的基础使用

## en-US

The basic usage of WaterMark.

````jsx
import React from 'react';
import { WaterMark } from 'choerodon-ui';

const content = "This is\nChoerodon-ui";

ReactDOM.render(
  <>
    <WaterMark content={content} gapX={100} gapY={100} height={50}>
      <div style={{ height: 500 }} />
    </WaterMark>
  </>,
  mountNode);
````
