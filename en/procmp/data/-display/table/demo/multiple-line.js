import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    fields: [
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        required: true,
      },
      {
        name: 'code',
        type: 'object',
        label: '代码描述',
        ignore: 'always',
        multiLine: true,
      },
      {
        name: 'code_code',
        bind: 'code.code_code',
        type: 'string',
        label: '代码',
        maxLength: 11,
        required: true,
      },
      {
        name: 'code_description',
        bind: 'code.code_description',
        type: 'string',
        label: '代码描述',
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
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
    },
  });

  toJSONButton = (
    <Button
      onClick={() =>
        console.log(this.userDs.toJSONData(), this.userDs.current.get('code'))
      }
      key="toJSONData"
    >
      toJSONData
    </Button>
  );

  render() {
    const buttons = ['add', 'save', 'delete', 'reset', this.toJSONButton];
    return (
      <Table key="user" buttons={buttons} dataSet={this.userDs}>
        <Column name="age" />
        <Column name="name" editor />
        <Column name="code" editor width={300} />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
