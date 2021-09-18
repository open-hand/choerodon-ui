---
order: 2
title:
  zh-CN: 跳转
  en-US: QuickJumper
---

## zh-CN

快速跳转到某一页。

## en-US

Quickly jump to a page.

````jsx
import { DataSet, Pagination, Button, Form, Switch } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

function handleChange(page, pageSize) {
  console.log('[pagination]', page, pageSize);
}

const App = observer(() => {
  const ds = React.useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      { name: 'goButton', type: 'boolean', label: 'goButton', defaultValue: false },
    ],
  }), []);
  return (
    <div>
      <Form columns={4} dataSet={ds} labelWidth={150}>
        <Switch name="goButton" />
      </Form>
      <Pagination
        showQuickJumper={{ goButton: ds.current.get('goButton') }}
        total={90}
        onChange={handleChange}
        pageSizeEditable
      />
    </div>
  );
});

ReactDOM.render(
  <App />,
  mountNode
);
````
