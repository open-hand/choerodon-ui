---
order: 11
title:
  zh-CN: 柔性布局
  en-US: Flex Layout
---

## zh-CN

当为整个Tabs设置固定高度或者使用flex=1撑满整个外部容器时，内部标签头部能固定而内容柔性并出现滚动条。

## en-US

When setting a fixed height for the entire Tabs or using flex=1 to fill the entire outer container, the header of the inner label can be fixed but the content is flexible and scroll bars appear.

```jsx
import { Tabs, Select } from 'choerodon-ui';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

function callback(key) {
  console.log(key);
}

const App = () => {
  const [mode, setMode] = React.useState('top');

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        Tab position：
        <Select
          value={mode}
          onChange={setMode}
          dropdownMatchSelectWidth={false}
        >
          <Option value="top">top</Option>
          <Option value="bottom">bottom</Option>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </Select>
      </div>
      <Tabs defaultActiveKey="1" onChange={callback} flex tabPosition={mode} style={{ height: 300 }}>
        <TabPane tab="Tab 1" key="1">
          <div style={{ height: 400 }}>
            Content of Tab Pane 1
          </div>
        </TabPane>
        <TabPane tab="Tab 2" key="2">
          Content of Tab Pane 2
        </TabPane>
        <TabPane tab="Tab 3" key="3">
          Content of Tab Pane 3
        </TabPane>
      </Tabs>
    </div>
  )
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
