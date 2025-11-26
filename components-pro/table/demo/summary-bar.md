---
order: 24
title:
  zh-CN: 头部汇总条
  en-US: Summary Bar
---

## zh-CN

头部汇总条。

## en-US

Summary Bar.

```jsx
import { DataSet, Table } from 'choerodon-ui/pro';

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
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
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
    return [
      { name: 'name', width: 450, editor: true },
      { name: 'age', editor: true },
    ];
  }

  render() {
    return (
      <Table
        buttons={['add', 'delete', 'remove', 'query', 'collapseAll', 'reset']}
        dataSet={this.ds}
        queryBar="professionalBar"
        border={false}
        columns={this.columns}
        queryFieldsLimit={2}
        summaryBarConfigProps={{
          placement: 'topRight',
          separator: <span>||</span>,
          groupStyle: { background: '#fae0e0' },
          moreStyle: { background: '#fae0e0' },
          useColon: true,
          labelStyle: { width: 90 },
        }}
        summaryBar={[
          'age',
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试测试测试测试测试测试测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
          ({ dataSet }) => {
            return { label: <span style={{ color: 'red' }}>测试</span>, value: <span style={{ color: 'red' }}>值</span>};
          },
        ]}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
