---
order: 1
title:
  zh-CN: 级联
  en-US: Cascade
---

## zh-CN

级联。

## en-US

Cascade.

```jsx
import { DataSet, Table, TextField, DateTimePicker, Modal, Button, Tabs } from 'choerodon-ui/pro';

const { Column } = Table;
const { TabPane } = Tabs;

function editorRenderer(record) {
  return record.status === 'add' ? <TextField /> : null;
}

function maleFilter(record) {
  return record.get('sex') === 'M' || !record.get('sex');
}

function femaleFilter(record) {
  return record.get('sex') === 'F';
}

class App extends React.Component {
  friendsDs = new DataSet({
    queryUrl: '/dataset/user/queries',
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
    ],
    events: {
      query: ({ params, data }) => console.log('friend query parameter', params, data),
    },
  });

  enemyFriendsDs = new DataSet({
    selection: 'single',
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
    ],
  });

  enemyDs = new DataSet({
    primaryKey: 'userid',
    autoQuery: false,
    fields: [
      { name: 'name', type: 'intl', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
    ],
    children: {
      friends: this.enemyFriendsDs,
    },
    events: {
      indexChange: ({ record }) =>
        record && console.log('enemyRecord cascadeParent', record.cascadeParent),
    },
  });

  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: false,
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
    events: {
      submit: ({ data }) => console.log('submit data', data),
      load: ({ dataSet }) => console.log('header ds', dataSet.slice()),
    },
    children: {
      friends: this.friendsDs,
      'other.enemy': this.enemyDs,
    },
  });

  openModal = record => {
    let isCancel = false;
    Modal.open({
      drawer: true,
      width: 600,
      children: (
        <Tabs>
          <TabPane tab="Friends(M)">
            <Table
              buttons={['add', 'delete']}
              dataSet={this.friendsDs}
              rowHeight={40}
              filter={maleFilter}
            >
              <Column name="name" editor={editorRenderer} sortable />
              <Column name="age" editor sortable />
              <Column name="sex" editor width={150} />
            </Table>
          </TabPane>
          <TabPane tab="Friends(F)">
            <Table dataSet={this.friendsDs} rowHeight={40} filter={femaleFilter}>
              <Column name="name" editor={editorRenderer} sortable />
              <Column name="age" editor sortable />
              <Column name="sex" editor width={150} />
            </Table>
          </TabPane>
        </Tabs>
      ),
      onCancel: () => (isCancel = true),
      afterClose: () => record && isCancel && this.userDs.remove(record),
    });
  };

  createUser = () => {
    this.openModal(this.userDs.create({}, 0));
    this.friendsDs.create({});
  };

  editUser = () => {
    this.openModal();
  };

  renderEdit = () => {
    return <Button funcType="flat" icon="mode_edit" onClick={this.editUser} size="small" />;
  };

  createButton = (
    <Button funcType="flat" color="primary" icon="playlist_add" onClick={this.createUser} key="add">
      新增
    </Button>
  );

  render() {
    const buttons = [this.createButton, 'save', 'delete', 'query'];
    return [
      <Table key="user" buttons={buttons} dataSet={this.userDs} header="User">
        <Column name="userid" />
        <Column name="age" width={150} />
        <Column name="enable" width={50} />
        <Column name="name" width={150} />
        <Column header="编辑Friends" align="center" renderer={this.renderEdit} lock="right" />
      </Table>,
      <Table
        key="cascade1"
        header="Cascade Level 1"
        buttons={['add', 'delete']}
        dataSet={this.enemyDs}
        pagination={{ position: 'both' }}
      >
        <Column name="name" editor sortable />
        <Column name="age" editor sortable />
        <Column name="sex" editor width={150} />
      </Table>,
      <Table
        key="cascade2"
        header="Cascade Level 2"
        buttons={['add', 'delete']}
        dataSet={this.enemyFriendsDs}
        pagination={{ position: 'top' }}
      >
        <Column name="name" editor={editorRenderer} sortable />
        <Column name="age" editor sortable />
        <Column name="sex" editor width={150} />
      </Table>,
    ];
  }
}

ReactDOM.render(<App />, mountNode);
```
