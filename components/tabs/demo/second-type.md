---
order: 13
title:
  zh-CN: 二级样式页签
  en-US: Second type tab
---

## zh-CN

二级样式的页签，不提供对应的垂直样式。

## en-US

Another type Tabs, which doesn't support vertical mode.

```jsx
import { Tabs } from 'choerodon-ui';

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

ReactDOM.render(
  <Tabs onChange={callback} type="second-level">
    <TabPane tab="Tab 1" key="1">
      Content of Tab Pane 1
    </TabPane>
    <TabPane tab="Tab 2" key="2">
      Content of Tab Pane 2
    </TabPane>
    <TabPane tab="Tab 3" key="3">
      Content of Tab Pane 3
    </TabPane>
  </Tabs>,
  mountNode,
);
```
