---
order: 1
title:
  zh-CN: 绑定数据源
  en-US: Bind DataSet
---

## zh-CN

可以同时展开多个面板，这个例子默认展开了第一个。

## en-US

More than one panel can be expanded at a time, the first panel is initialized to be active in this case.

```jsx
import { Collapse } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField } from 'choerodon-ui/pro';

const Panel = Collapse.Panel;

function callback(key) {
  console.log(key);
}

const App = () => {
  const ds = useDataSet(() => ({
    autoCreate: true,
    fields: [{ name: 'name', required: true, label: '姓名' }],
  }), []);

  return (
    <Collapse defaultActiveKey={['1']} onChange={callback}>
      <Panel header="This is panel header 1" key="1">
        <Button onClick={() => ds.validate()}>validate</Button>
      </Panel>
      <Panel header="This is panel header 2" key="2" dataSet={ds}>
        <Form dataSet={ds}>
          <TextField name="name" />
        </Form>
      </Panel>
      <Panel header="This is panel header 3" key="3" disabled>
        <Form dataSet={ds}>
          <TextField name="name" />
        </Form>
      </Panel>
    </Collapse>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
```

<style>
p {
  margin: 0;
}
</style>
