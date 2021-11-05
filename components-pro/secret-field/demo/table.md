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
import { Table, DataSet, SecretField, TextField } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'secretField',
            type: 'secret',
            label: '脱敏组件查看',
          },
          {
            name: 'secretField1',
            type: 'secret',
            label: '脱敏组件编辑',
          },
          {
            name: 'textField',
            label: '文本',
            readOnly: false,
          },
        ],
        data: [
          {
            secretField: 'test1',
            secretField1: 'test1',
            textField: 'test1',
            _token:'111',
          },
          {
            secretField: 'test2',
            secretField1: 'test2',
            textField: 'test2',
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
        editor:<SecretField readOnly={true}/>,
      },
      {
        name: 'secretField1',
        editor:<SecretField readOnly={false}/>,
      },
      {
        name: 'textField',
        editor:<TextField />,
      },
    ],
    [],
  );

  return <Table dataSet={ds} columns={columns}/>;
};

ReactDOM.render(<App />, mountNode);
```
