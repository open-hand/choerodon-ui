---
order: 10
title:
  zh-CN: 上一步和下一步
  en-US: Prev and next
---

## zh-CN

修改上一步和下一步为文字链接。

## en-US

Use text link for prev and next button.

````jsx
import { Pagination } from 'choerodon-ui';

function itemRender(current, type, originalElement) {
  if (type === 'prev') {
    return <a>Previous</a>;
  }
  if (type === 'next') {
    return <a>Next</a>;
  }
  return originalElement;
}

ReactDOM.render(
  <Pagination tiny={false} showTotal={false} showSizeChanger={false} total={500} itemRender={itemRender} />,
  mountNode);
````
