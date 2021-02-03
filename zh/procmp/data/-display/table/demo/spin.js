import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinProps: {},
    };
  }

  ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
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
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
  });

  handleUp = () => {
    this.setState({
      spinProps: { indicator: this.c7nIcon, size: 'large', spinning: true },
    });
    message.success('启用自定义Spin');
  };

  handleClose = () => {
    this.setState({ spinProps: { spinning: false } });
    message.success('禁用table spin 并停止loading.');
  };

  handleReset = () => {
    this.setState({ spinProps: {} });
    // spin pro 可绑定数据源
    // this.setState({ spinProps: { spinning: false, dataSet: this.ds } };
    message.success('启用 table spin, 点击查询测试.');
  };

  buttons = [
    <Button key="up" funcType="flat" onClick={this.handleUp}>
      启用自定义 spin
    </Button>,
    <Button key="close" funcType="flat" onClick={this.handleClose}>
      禁用 table spin
    </Button>,
    <Button key="table" funcType="flat" onClick={this.handleReset}>
      默认 table spin
    </Button>,
  ];

  c7nIcon = (
    <span className="custom-spin-dot">
      <i />
      <i />
      <i />
      <i />
    </span>
  );

  render() {
    return (
      <Table
        spin={this.state.spinProps}
        dataSet={this.ds}
        buttons={this.buttons}
      >
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
        <Column name="name" editor width={150} sortable />
        <Column name="code" editor width={150} sortable />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
