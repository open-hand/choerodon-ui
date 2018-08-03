---
order: 2
title:
  zh-CN: 文字
  en-US: Text & icon
---

## zh-CN

带有文字和图标。

## en-US

With text and icon.

````jsx
import { Switch } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
    <br />
    <Switch checkedChildren="1" unCheckedChildren="0" />
  </div>,
  mountNode);
````
