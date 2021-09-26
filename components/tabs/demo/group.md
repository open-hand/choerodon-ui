---
order: 7
title:
  zh-CN: 分组
  en-US: Grouping
---

## zh-CN

分组。

## en-US

Grouping.

```jsx
import { Tabs, Radio } from 'choerodon-ui';

const TabPane = Tabs.TabPane;
const TabGroup = Tabs.TabGroup;

function callback(key) {
  console.log(key);
}

const App = () => {
  const [mode, setMode] = React.useState('top');
  const handleChange = React.useCallback(e => setMode(e.target.value), []);
  return (
    <>
      <Radio.Group onChange={handleChange} value={mode} style={{ marginBottom: 8 }}>
        <Radio.Button value="top">Horizontal</Radio.Button>
        <Radio.Button value="left">Vertical</Radio.Button>
      </Radio.Group>
      <Tabs keyboard={false} defaultActiveKey="1" onChange={callback} tabPosition={mode} customizable customizedCode="customized-group">
        <TabGroup tab="Group 1" key="group-1" defaultActiveKey="2">
          <TabPane tab="Tab A" key="1" count={117}>
            Content of Tab Pane 1
          </TabPane>
          <TabPane tab="Tab B" key="2" count={0}>
            Content of Tab Pane 2
          </TabPane>
          <TabPane tab="Tab C" key="3" count={66}>
            Content of Tab Pane 3
          </TabPane>
        </TabGroup>
        <TabGroup tab="Group 2" key="group-2" defaultActiveKey="5" dot>
          <TabPane tab="Tab D" key="4" count={1}>
            Content of Tab Pane 4
          </TabPane>
          <TabPane tab="Tab E" key="5" count={2}>
            Content of Tab Pane 5
          </TabPane>
        </TabGroup>
        <TabGroup tab="Group 3" key="group-3" disabled />
      </Tabs>
    </>   
  )
};

ReactDOM.render(
  <App />,
  mountNode,
);
```
