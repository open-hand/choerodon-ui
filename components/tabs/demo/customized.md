---
order: 12
title:
  zh-CN: 个性化
  en-US: Customized
---

## zh-CN

个性化。

## en-US

Customized.

```jsx
import { Tabs } from 'choerodon-ui';

const TabPane = Tabs.TabPane;

function callback(key) {
  console.log(key);
}

const App = () => {
  const tabARender = React.useCallback((title) => <span style={{ color: 'red' }}>{title}</span>, []);
  return (
    <Tabs keyboard={false} defaultActiveKey="1" onChange={callback} customizable customizedCode="customized">
      <TabPane tab={tabARender} title="Tab A" key="1" count={117}>
        Content of Tab Pane 1
      </TabPane>
      <TabPane tab="Tab B" key="2" count={26}>
        Content of Tab Pane 2
      </TabPane>
      <TabPane tab="Tab C" key="3" count={66}>
        Content of Tab Pane 3
      </TabPane>
      <TabPane tab="Tab D" key="4" count={1}>
        Content of Tab Pane 4
      </TabPane>
      <TabPane tab="Tab E" key="5" count={2}>
        Content of Tab Pane 5
      </TabPane>
    </Tabs>
  )
};

ReactDOM.render(
  <App />,
  mountNode,
);
```
