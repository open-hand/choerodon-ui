---
order: 3
title:
  zh-CN: 行内编辑
  en-US: Inline Edit
---

## zh-CN

行内编辑。

## en-US

Inline Edit.

```jsx
import { DataSet, Table, Button, TextArea } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    pageSize: 5,
    cacheSelection: true,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        unique: true,
        help: '主键，区分用户',
      },
      { name: 'name', type: 'intl', label: '姓名' },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
        help: '用户年龄，可以排序',
      },
      {
        name: 'numberMultiple',
        type: 'number',
        label: '数值多值',
        multiple: true,
        min: 10,
        max: 100,
        step: 0.5,
      },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      {
        name: 'code_code',
        bind: 'code.code',
        type: 'string',
        label: '代码',
        maxLength: 11,
        required: true,
      },
      { name: 'code_description', bind: 'code.description', type: 'string', label: '代码描述' },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        required: true,
      },
      {
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'codeMultiple_code',
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      {
        name: 'accountMultiple',
        type: 'string',
        bind: 'account.multiple',
        label: '多值拼接',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      { name: 'account', type: 'object' },
      { name: 'enable', type: 'boolean', label: '是否开启', unique: 'uniqueGroup' },
      { name: 'frozen', type: 'boolean', label: '是否冻结', trueValue: 'Y', falseValue: 'N' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      { name: 'date.endDate', type: 'dateTime', range: true, label: '结束日期' },
    ],
  });

  buttons = [
    'add',
    <Button key="create" funcType="flat" icon="add" onClick={() => this.ds.create()}>
      自定义新增
    </Button>,
  ];

  commands = ({ record }) => [
    'edit',
    ['delete', { color: 'red' }],
    <Button key="add" icon="add" onClick={() => console.log(this.ds.current.toData())} />,
  ];

  render() {
    return (
      <Table dataSet={this.ds} buttons={this.buttons} editMode="inline" addNewButton>
        <Column name="userid" style={{ color: 'red' }} editor width={150} lock sortable />
        <Column name="enable" editor width={50} minWidth={50} lock />
        <Column name="age" editor width={150} sortable />
        <Column name="name" editor={<TextArea autoSize />} width={150} sortable />
        <Column name="code" editor width={150} sortable />
        <Column name="code_code" editor width={150} />
        <Column name="code_select" editor width={150} />
        <Column name="codeMultiple" editor width={150} />
        <Column name="codeMultiple_code" width={150} />
        <Column name="sex" editor width={150} />
        <Column name="sexMultiple" editor width={150} />
        <Column name="accountMultiple" editor width={150} />
        <Column name="date.startDate" editor width={150} />
        <Column name="date.endDate" editor width={150} />
        <Column name="numberMultiple" editor width={150} minWidth={50} />
        <Column name="frozen" editor width={50} minWidth={50} lock="right" />
        <Column header="操作" width={150} command={this.commands} lock="right" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
