---
order: 1
title:
  zh-CN: 在表格中显示
  en-US: Display in Table
---

## zh-CN

在表格中显示

## en-US

```jsx
import { Table, DataSet, SecretField } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'secretField',
            type: 'secret',
            label: '脱敏组件',
            readOnly: true,
          },
        ],
        data: [
          {
            secretField: 'test1',
          },
          {},
          {},
        ],
      }),
    [],
  );
  const columns = React.useMemo(
    () => [
      {
        name: 'secretField',
        renderer: ({ record }) => {
          return <SecretField record={record} name="secretField" border={false} />;
        },
      },
    ],
    [],
  );

  return <Table dataSet={ds} columns={columns} />;
};

ReactDOM.render(<App />, mountNode);
```
