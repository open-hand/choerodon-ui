import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

const nameDynamicProps = {
  // 当Sex为M(男)的时候 该属性为必须输入字段 即为 field 中 require = true
  required({ record }) {
    return record.get('sex') === 'M';
  },
};

class App extends React.Component {
  options = new DataSet({
    fields: [
      {
        name: 'value',
        type: 'string',
      },
      {
        name: 'meaning',
        type: 'string',
      },
    ],
  });

  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 10,
    transport: {
      read: {
        url: '/dataset/user/queries',
      },
      create: {
        url: '/dataset/user/mutations',
        method: 'put',
      },
    },
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
        unique: true, // 唯一索引或联合唯一索引组名 设置可编辑只有新增才能编辑,确保该字段或字段组唯一性
        help: '主键，区分用户',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        dynamicProps: nameDynamicProps,
        ignore: 'clean',
      },
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
        name: 'email',
        type: 'string',
        label: '邮箱',
        help: '用户邮箱，可以自动补全',
      },
    ],
    events: {
      indexchange: ({ record }) => console.log('current user', record),
    },
  });

  render() {
    const buttons = ['add', ['delete', { color: 'red' }], 'remove', 'reset'];
    return (
      <Table
        key="user"
        buttons={buttons}
        dataSet={this.userDs}
        header="User"
        style={{ height: 400 }}
        useMouseBatchChoose
      >
        <Column
          name="userid"
          style={{ color: 'red' }}
          tooltip="overflow"
          editor
          width={150}
          lock
          sortable
        />
        <Column name="age" editor width={150} sortable />
        <Column name="email" />
        <Column name="name" editor width={150} sortable tooltip="always" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
