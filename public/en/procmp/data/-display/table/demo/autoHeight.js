import React from 'react';
import ReactDOM from 'react-dom';
import {
  DataSet,
  Table,
  Form,
  TextField,
  NumberField,
  SelectBox,
  Modal,
  Button,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const { Column } = Table;

class App extends React.Component {
  userDs = new DataSet({
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

 demoDs = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'autoHeight', defaultValue: true },
    ],
  });
  
  render() {
    return (
      <div style={{ height: '500px' }}>
        <div style={{ height: '100%' }}>
          <Table autoHeight key="user" dataSet={this.userDs} pristine>
            <Column name="userid" />
            <Column name="age" />
            <Column name="enable" />
            <Column name="name" />
          </Table>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
