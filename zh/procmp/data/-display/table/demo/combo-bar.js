import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Menu, Dropdown, Icon } from 'choerodon-ui';

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
        options: this.optionDs,
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
        console.log('combo bar query parameter', params, data),
    },
  });

  render() {
    const columns = [
      { name: 'name', width: 450 },
      { name: 'age' },
      { name: 'sex' },
      { name: 'date.startDate' },
      { name: 'userid', lock: 'right' },
    ];
    const menu = () => (
      <Menu>
        <Menu.Item key="1">类别</Menu.Item>
        <Menu.Item key="2">明细</Menu.Item>
      </Menu>
    );
    return (
      <Table
        dataSet={this.ds}
        queryBar="comboBar"
        style={{ height: 400 }}
        queryBarProps={{
          title: '组合筛选条',
          dropDownArea: () => (
            <Dropdown overlay={menu}>
              <Icon type="menu" />
            </Dropdown>
          ),
          fold: true,
          buttonArea: () => <Button>默认按钮</Button>,
          searchable: true,
        }}
        columns={columns}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
