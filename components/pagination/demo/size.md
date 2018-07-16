---
order: 4
title:
  zh-CN: 尺寸
  en-US: size
---

## zh-CN

尺寸。

## en-US

Size.

````jsx
import { Pagination } from 'choerodon-ui';

function showTotal(total) {
  return `Total ${total} items`;
}

ReactDOM.render(
  <div>
    <Pagination tiny={false} size="large" total={50} showTotal={false} showSizeChanger={false} />
    <Pagination tiny={false} size="large" total={50} showTotal={false} showSizeChanger showQuickJumper />
    <Pagination tiny={false} size="large" total={50} showTotal={showTotal} showSizeChanger={false} />
    <Pagination tiny={false} size="small" total={50} showTotal={false} showSizeChanger={false} />
    <Pagination tiny={false} size="small" total={50} showTotal={false} showSizeChanger showQuickJumper />
    <Pagination tiny={false} size="small" total={50} showTotal={showTotal} showSizeChanger={false} />
  </div>,
  mountNode);
````

<style>
#components-pagination-demo-mini .ant-pagination:not(:last-child) {
  margin-bottom: 24px;
}
</style>
