---
order: 18
title:
  zh-CN: 查询过渡
  en-US: Lookup Code
---

## zh-CN

值列表代码查询过渡。

## en-US

Lookup Code

```jsx
import { DataSet, Select, Output, Button, Row, Col, Table } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

function handleOption({ record }) {
  return {
    disabled: record.index === 0,
  };
}

class App extends React.Component {
  flag = false;

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'user', type: 'string', lookupCode: 'USER', valueField: 'code', textField: 'name', defaultValue: 'zf', lookupUrl: 'https://7b3fb464-bab8-478c-9350-1957e484162f.mock.pstmn.io/user' },
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
      {
        name: 'lov2',
        type: 'string',
        lookupCode: 'SHI',
        defaultValue: ['QP', 'XH'],
        multiple: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });


 userDs = new DataSet({
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
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
      },
      {
        name: 'name',
        type: 'string',
        label: '姓名',
        lookupCode: 'USER', valueField: 'code', textField: 'name', defaultValue: 'zf', lookupUrl: 'https://7b3fb464-bab8-478c-9350-1957e484162f.mock.pstmn.io/user',
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
        lookupCode: 'USER', valueField: 'code', textField: 'name', defaultValue: 'zf', lookupUrl: 'https://7b3fb464-bab8-478c-9350-1957e484162f.mock.pstmn.io/user',
        required: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
  });

  get columns() {
    return [
      { name: 'userid' },
      { name: 'name', editor: true },
      { name: 'age', editor: true },
      { name: 'sex', editor: true },
      { name: 'enable', editor: true },
    ];
  }
  render() {
    if (!this.ds.current) {
      return null;
    }
    return (
      <Row gutter={10}>
        <Col span={24}>
          <Table
            buttons={['add', 'query']}
            queryBar="filterBar"
            key="basic"
            rowNumber={({ text }) => `#${text}`}
            dataSet={this.userDs}
            columns={this.columns}
          />
        </Col>
        <Col span={24}>
          <br />
        </Col>
        <Col span={24}>
          <Select dataSet={this.ds} noCache name="user" placeholder="USER" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
