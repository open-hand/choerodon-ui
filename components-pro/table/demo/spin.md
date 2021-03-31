---
order: 11
title:
  zh-CN: Spin 受控
  en-US: Spin
---

## zh-CN

Table Spin 受控。

## en-US

Table Spin.

```jsx
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
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    pageSize: 5,
    cacheSelection: true, // 缓存选中记录
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

  handleUp = () => {
    this.setState({ spinProps:  { indicator: this.c7nIcon, size: 'large', spinning: true } });
    message.success('启用自定义Spin');
  }
  
  handleClose = () => {
    this.setState({ spinProps:  { spinning: false } });
    message.success('禁用table spin 并停止loading.');
  }

  handleReset = () => {
    this.setState({ spinProps: {} });
    // spin pro 可绑定数据源
    // this.setState({ spinProps: { spinning: false, dataSet: this.ds } };
    message.success('启用 table spin, 点击查询测试.');
  }
  
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
        <Column name="userid" style={{ color: 'red' }} editor width={150} lock sortable />
        <Column name="age" editor width={150} sortable />
        <Column name="enable" editor width={50} minWidth={50} lock />
        <Column name="name" editor width={150} sortable />
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
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
```css

.custom-spin-dot {
  transform: rotate(45deg);
  animation: c7nRotate 1.2s infinite linear;
}
.custom-spin-dot i {
  width: 45%;
  height: 45%;
  border-radius: 100%;
  background-color: #3f51b5;
  transform: scale(.75);
  display: block;
  position: absolute;
  opacity: .3;
  animation: c7nSpinMove 1s infinite linear alternate;
  transform-origin: 50% 50%;
}
.custom-spin-dot i:nth-child(1) {
  left: 0;
  top: 0;
}
.custom-spin-dot i:nth-child(2) {
  right: 0;
  top: 0;
  animation-delay: .4s;
}
.custom-spin-dot i:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: .8s;
}
.custom-spin-dot i:nth-child(4) {
  left: 0;
  bottom: 0;
  animation-delay: 1.2s;
}
@keyframes c7nSpinMove {
  to {
    opacity: 1;
  }
}
@keyframes c7nRotate {
  to {
    transform: rotate(405deg);
  }
}
```
