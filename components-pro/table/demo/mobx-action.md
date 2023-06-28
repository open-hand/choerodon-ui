---
order: 14
title:
  zh-CN: 按钮受控
  en-US: Button controlled
---

## zh-CN

结合 mobx 处理一些按钮状态控制。

## en-US

Combined with mobx to handle some button state control.

```jsx
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Table,
  Button,
} from 'choerodon-ui/pro';

const HeaderButtons = observer(props => {
  const isDisabled = props.dataSet.selected.length === 0;

  return (
    <Button icon="delete" disabled={isDisabled}>
      删除
    </Button>
  );
});

const App = observer(() => {
  const userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
    },
  });

  const buttons = [<HeaderButtons dataSet={userDs} key='header-buttons'/>];
  const columns = [
    {
      name: 'userid',
    }, {
      name: 'name',
    },
    {
      name: 'age',
    }, {
      name: 'sex',
    },
    {
      name: 'enable',
    },
  ];

  return (
    <Table
      key="user"
      buttons={buttons}
      dataSet={userDs}
      columns={columns}
    />
  );
});

ReactDOM.render(<App />, document.getElementById('container'));
```
