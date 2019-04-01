---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { Pagination } from 'choerodon-ui/pro';

function handleChange(page, pageSize) {
  console.log('[pagination]', page, pageSize);
}

ReactDOM.render(
  <Pagination total={50} onChange={handleChange} />,
  mountNode
);
````
