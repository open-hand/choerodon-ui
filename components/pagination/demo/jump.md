---
order: 3
title:
  zh-CN: 跳转
  en-US: Jumper
---

## zh-CN

快速跳转到某一页。

## en-US

Jump to a page directly.

```jsx
import { Pagination } from 'choerodon-ui';

function onChange(pageNumber) {
  console.log('Page: ', pageNumber);
}

ReactDOM.render(
  <Pagination
    tiny={false}
    showSizeChangerLabel={false}
    showTotal={false}
    showSizeChanger={false}
    showQuickJumper
    defaultCurrent={2}
    total={500}
    onChange={onChange}
  />,
  mountNode,
);
```
