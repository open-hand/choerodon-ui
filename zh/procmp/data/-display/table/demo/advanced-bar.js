import React from 'react';
import ReactDOM from 'react-dom';
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
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs, // 下拉框组件的菜单数据集
        defaultValue: 'F',
      },
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
      { name: 'userid', type: 'string', label: '编号', required: true },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄', max: 100, step: 1 },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
    events: {
      query: ({ params, data }) =>
        console.log('advanced bar query parameter', params, data),
    },
  });

  get columns() {
    return [{ name: 'name', width: 450 }, { name: 'age' }];
  }

  render() {
    return (
      <Table
        buttons={['add']}
        dataSet={this.ds}
        queryBar="advancedBar"
        border={false}
        columns={this.columns}
        queryFieldsLimit={2}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
