---
order: 5
title:
  zh-CN: 两种大小
  en-US: Two sizes
---

## zh-CN

`size="large"` 表示大号开关。`size="small"` 表示小号开关。

## en-US

`size="large"` represents a large sized switch.`size="small"` represents a small sized switch.

````jsx
import { Switch } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch size="large" defaultChecked />
    <br />
    <Switch defaultChecked />
    <br />
    <Switch size="small" defaultChecked />
  </div>,
  mountNode);
````
