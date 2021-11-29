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
        autoCreate: true,
        autoQuery: true,
        fields: [
          {
            name: 'secretField',
            type: 'secret',
            label: '脱敏组件查看',
            readOnly: true,
          },
          {
            name: 'secretField1',
            type: 'secret',
            label: '脱敏组件编辑',
            readOnly: false,
          },
        ],
        transport: {
          read() {
            return {
              url: `/secretField/table/query`,
            }
          },
        },
      }),
    [],
  );
  const columns = React.useMemo(
    () => [
      {
        name: 'secretField',
        editor:<SecretField />,
      },
      {
        name: 'secretField1',
        editor:<SecretField />,
      },
    ],
    [],
  );

  return <Table dataSet={ds} columns={columns}/>;
};

ReactDOM.render(<App />, mountNode);
```
