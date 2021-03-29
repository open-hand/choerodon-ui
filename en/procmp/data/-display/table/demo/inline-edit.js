import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button, TextArea } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    cacheSelection: true,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
        unique: true,
        help: '主键，区分用户',
      },
      { name: 'name', type: 'intl', label: '姓名' },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        unique: 'uniqueGroup',
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
      {
        name: 'code_description',
        bind: 'code.description',
        type: 'string',
        label: '代码描述',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'account', type: 'object' },
      {
        name: 'enable',
        type: 'boolean',
        label: '是否开启',
        unique: 'uniqueGroup',
      },
      {
        name: 'frozen',
        type: 'boolean',
        label: '是否冻结',
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
    ],
  });

  buttons = [
    'add',
    <Button
      key="create"
      funcType="flat"
      icon="add"
      onClick={() => this.ds.create()}
    >
      自定义新增
    </Button>,
  ];

  commands = ({ record }) => [
    'edit',
    ['delete', { color: 'red' }],
    <Button
      key="add"
      icon="add"
      onClick={() => console.log(this.ds.current.toData())}
    />,
  ];

  render() {
    return (
      <Table dataSet={this.ds} buttons={this.buttons} editMode="inline">
        <Column
          name="userid"
          style={{ color: 'red' }}
          editor
          width={150}
          lock
          sortable
        />
        <Column name="age" editor width={150} sortable />
        <Column name="enable" editor width={50} minWidth={50} lock />
        <Column name="name" editor={<TextArea />} width={150} sortable />
        <Column name="code" editor width={150} sortable />
        <Column name="code_code" editor width={150} />
        <Column name="sex" editor width={150} />
        <Column name="date.startDate" editor width={150} />
        <Column name="frozen" editor width={50} minWidth={50} lock="right" />
        <Column
          header="操作"
          width={150}
          command={this.commands}
          lock="right"
        />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
