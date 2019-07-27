---
order: 1
title:
  zh-CN: 高级搜索条
  en-US: Advanced Search Bar
---

## zh-CN

高级搜索条。

## en-US

Advanced Search Bar.

````jsx
import { DataSet, Table, Button } from 'choerodon-ui/pro';

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

class App extends React.Component {

  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      // { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      // { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'sex.text', type: 'string', label: '性别', textField: 'text', valueField: 'value', options: this.optionDs },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      { name: 'sexMultiple', type: 'string', label: '性别（多值）', lookupCode: 'HR.EMPLOYEE_GENDER', multiple: true },
    ],
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      { name: 'sexMultiple', type: 'string', label: '性别（多值）', lookupCode: 'HR.EMPLOYEE_GENDER', multiple: true },
    ],
    events: {
      query: ({ params }) => console.log('filterbar query parameter', params),
    },
  });

  get columns() {
    return [
      { name: 'name', width: 450, editor: true },
      { name: 'age', editor: true },
    ];
  }

  render() {
    return (
      <Table dataSet={this.ds} queryBar="advancedBar" border={false} columns={this.columns} queryFieldsLimit={2} />
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
