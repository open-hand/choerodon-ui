---
order: 4
title:
  zh-CN: 微型
  en-US: Tiny size
---

## zh-CN

微型版本。

## en-US

Tiny size pagination.

````jsx
import { Pagination } from 'choerodon-ui';

function showTotal(total) {
  return `Total ${total} items`;
}

ReactDOM.render(
  <div>
    <Pagination total={50} />
    <Pagination total={50} showSizeChanger showQuickJumper />
    <Pagination total={50} showTotal={showTotal} />
  </div>
, mountNode);
````

<style>
#components-pagination-demo-mini .ant-pagination:not(:last-child) {
  margin-bottom: 24px;
}
</style>
