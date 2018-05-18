---
order: 6
title:
  zh-CN: 自定义指示符
  en-US: Custom spinning indicator
---

## zh-CN

使用自定义指示符。

## en-US

Use custom loading indicator.

````jsx
import { Spin } from 'choerodon-ui';

const antIcon = (
  <span className="ant-spin-dot ant-spin-dot-spin" style={{ width: 20, height: 20 }}>
    <i />
    <i />
    <i />
    <i />
  </span>
);

ReactDOM.render(<Spin indicator={antIcon} />, mountNode);
````
