---
order: 2
title:
  zh-CN: 显示原始值
  en-US: Pristine
only: true  
---

## zh-CN

显示原始值。

## en-US

Pristine.

```jsx
import { DataSet, Table, Button } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    columns: [
      { name: 'userid' },
      { name: 'name', editor: true },
      { name: 'age', editor: true },
      { name: 'sex', editor: true },
      { name: 'enable', editor: true },
    ]
  }
  
  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号1',
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
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
        lookupCode: 'HR.EMPLOYEE_GENDER',
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
  
  addColumn = () => {
    this.userDs.addField('test', {
      label: '测试',
      type: 'string',
      required: true,
    })
    const cols = [...this.state.columns];
    cols.push({
      name: 'test', editor: true
    })
    console.log('add', cols)
    this.setState({
      columns: cols
    })
  }

  render() {
    const buttons = [this.createButton, 'save', 'delete', 'reset'];
    return (
      <Table
        key="basic"
        buttons={[<Button onClick={this.addColumn}>新增列</Button>]}
        rowNumber={({ text }) => `#${text}`}
        dataSet={this.userDs}
        columns={this.state.columns}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
