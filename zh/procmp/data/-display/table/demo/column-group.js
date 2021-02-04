import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
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
  });

  render() {
    return (
      <Table dataSet={this.ds}>
        <Column header="组合">
          <Column name="name" width={100} />
          <Column name="age" />
        </Column>
        <Column header="组合3">
          <Column header="组合2">
            <Column name="sex" />
            <Column name="date.startDate" />
          </Column>
          <Column name="sexMultiple" />
        </Column>
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
