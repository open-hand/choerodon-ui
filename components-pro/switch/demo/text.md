---
order: 3
title:
  zh-CN: 文字
  en-US: Text & icon
---

## zh-CN

带有文字和图标。

## en-US

With text and icon.

````jsx
import { Switch, Icon } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch unCheckedChildren="关" defaultChecked>开</Switch>
    <br />
    <Switch unCheckedChildren="0">1</Switch>
    <br />
    <Switch unCheckedChildren={<Icon type="close" />}><Icon type="check" /></Switch>
  </div>,
  mountNode);
````
