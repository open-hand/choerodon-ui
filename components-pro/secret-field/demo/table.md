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
            _inTable: true,
          },
          {
            name: 'secretField1',
            type: 'secret',
            label: '脱敏组件1',
            _inTable: true,
          },
        ],
        data: [
          {
            secretField: 'test1',
            secretField1: 'test1',
            _token:'111',
          },
          {
            secretField: 'test2',
            secretField1: 'test2',
          },
          {},
        ],
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
