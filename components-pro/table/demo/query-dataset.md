---
order: 9
title:
  zh-CN: 自定义查询 DataSet
  en-US: Customize Query DataSet
---

## zh-CN

自定义查询 DataSet。

## en-US

Customize Query DataSet.

```jsx
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  qds = new DataSet({
    autoQuery: true,
    name: 'user',
    pageSize: 1,
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'code',
        type: 'object',
        label: '代码描述',
        lovCode: 'LOV_CODE',
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        bind: 'code.code',
        ignore: 'always',
      },
      {
        name: 'code_description',
        type: 'string',
        label: '代码描述',
        bind: 'code.description',
        ignore: 'always',
      },
    ],
  });

  ds = new DataSet({
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
    queryDataSet: this.qds,
    selection: 'single',
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    events: {
      query: ({ params, data }) => console.log('customize qds query parameter', params, data),
    },
  });

  render() {
    return (
      <Table dataSet={this.ds}>
        <Column name="name" editor width={450} />
        <Column name="age" editor />
        <Column name="sex" editor />
        <Column name="date.startDate" editor />
        <Column name="sexMultiple" editor />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
