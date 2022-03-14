---
order: 1
title:
  zh-CN: 绑定数据源
  en-US: Bind DataSet
---

## zh-CN


## en-US


```jsx
import { Tabs } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField } from 'choerodon-ui/pro';

const TabPane = Tabs.TabPane;
const TabGroup = Tabs.TabGroup;

const App = () => {
  const ds = useDataSet(() => ({
    autoCreate: true,
    fields: [{ name: 'name', required: true, label: '姓名' }],
  }), []);

  return (
    <>
      <Button onClick={() => ds.validate()}>validate</Button>
      <Tabs>
        <TabGroup tab="Group 1">
          <TabPane tab="Auto expand by dataSet" key="1" dataSet={ds}>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
          <TabPane tab="Auto expand by context but need forceRender" key="2" forceRender>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
        </TabGroup>
        <TabGroup tab="Group 2">
          <TabPane tab="Auto expand by dataSet" key="3" dataSet={ds}>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
          <TabPane tab="Disabled will not auto expand" key="4" disabled dataSet={ds}>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
        </TabGroup>
      </Tabs>
    </>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
