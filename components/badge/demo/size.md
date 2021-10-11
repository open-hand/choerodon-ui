---
order: 7
title:
  zh-CN: 大小
  en-US: Size
---

## zh-CN

可以设置有数字徽标的大小。

## en-US

Set size of numeral Badge.

````jsx
import { Badge } from 'choerodon-ui';

ReactDOM.render(
  <>
    <Badge count={8} size="default">
      <a href="#" className="head-example" />
    </Badge>
    <Badge count={8} size="small">
      <a href="#" className="head-example" />
    </Badge>
  </>,
  mountNode,
);
````