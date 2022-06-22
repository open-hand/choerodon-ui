import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize, count, onlyCount } }) {
        if (onlyCount === 'Y') {
          return {
            url: '/dataset/user/count',
          };
        }
        if (count === 'N') {
          return {
            url: `/dataset/user/page/asynccount/${pagesize}/${page}`,
          };
        }
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    autoCount: false,
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

  render() {
    return (
      <Table
        autoHeight={{ type: 'maxHeight' }}
        key="user"
        dataSet={this.userDs}
      >
        <Column name="userid" />
        <Column name="age" />
        <Column name="enable" />
        <Column name="name" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
