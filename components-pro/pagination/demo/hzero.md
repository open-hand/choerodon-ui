---
order: 3
title:
  zh-CN: Hzero定制
  en-US: Hzero theme
---

## zh-CN

Hzero 定制。

## en-US

Hzero theme.

```jsx
import { Form, Switch, DataSet, Pagination, Icon } from 'choerodon-ui/pro';

function pagerRenderer(page, type) {
  switch (type) {
    case 'first':
      return <Icon type="fast_rewind" />;
    case 'last':
      return <Icon type="fast_forward" />;
    case 'prev':
      return <Icon type="navigate_before" />;
    case 'next':
      return <Icon type="navigate_next" />;
    case 'jump-prev':
    case 'jump-next':
      return '•••';
    default:
      return page;
  }
}

function sizeChangerRenderer({ text }) {
  return `${text} 条/页`;
}

ReactDOM.render(
  <Pagination
    showSizeChangerLabel={false}
    showTotal={false}
    showPager
    sizeChangerPosition="right"
    sizeChangerOptionRenderer={sizeChangerRenderer}
    itemRender={pagerRenderer}
    total={50}
    pageSize={10}
    page={1}
  />,
  mountNode,
);
```
