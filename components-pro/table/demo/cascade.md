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
import {
  DataSet,
  Table,
  TextField,
  DateTimePicker,
  Modal,
  Button,
  Lov,
  Tabs,
} from 'choerodon-ui/pro';

const { Column } = Table;
const { TabPane } = Tabs;

function editorRenderer(record) {
  return record.status === 'add' ? <TextField /> : null;
}

function maleFilter(record) {
  return record.get('sex') === 'M' || !record.get('sex');
}
// 过滤展示数据 结合 table filter
function femaleFilter(record) {
  return record.get('sex') === 'F';
}

class App extends React.Component {
  friendsDs = new DataSet({
    dataToJSON: 'normal',
    queryUrl: '/dataset/user/queries',
    cascadeParams(parent) {
      console.log('cascadeParams',parent.toData())
      // 级联查询参数 (record, primaryKey) => object
      return {
        __parent: parent.toData(),
      };
    },
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', step: 1 },
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
    dataToJSON: 'normal',
    selection: 'single',
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', step: 1 },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'code_code', type: 'string', bind: 'code.code' },
      { name: 'code_description', type: 'string', bind: 'code.description' },
    ],
  });

  enemyDs = new DataSet({
    primaryKey: 'userid',
    autoQuery: false,
    autoCreate: true,
    fields: [
      { name: 'name', type: 'intl', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', step: 1 },
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
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: false,
    autoCreate: true,
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

  toData = () => {
    console.log('toData', this.userDs.toData());
  };

  toJSONData = () => {
    console.log('toJSONData', this.userDs.toJSONData());
  };

  renderEdit = () => {
    return <Button funcType="flat" icon="mode_edit" onClick={this.editUser} size="small" />;
  };

  createButton = (
    <Button icon="playlist_add" onClick={this.createUser} key="add">
      新增
    </Button>
  );

  toDataButton = (
    <Button onClick={this.toData} key="toData">
      toData
    </Button>
  );

  toJSONDataButton = (
    <Button onClick={this.toJSONData} key="toJSONData">
      toJSONData
    </Button>
  );

  render() {
    const buttons = [
      this.createButton,
      'save',
      'delete',
      'query',
      this.toDataButton,
      this.toJSONDataButton,
    ];
    return [
      <Table key="user" buttons={buttons} dataSet={this.userDs} header="User" rowHeight="auto" columnDraggable rowNumber={({ text }) => `#${text}`}>
        <Column name="userid" editor />
        <Column name="age" editor width={150} />
        <Column name="enable" editor width={50} />
        <Column name="name" editor width={150} />
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
        buttons={[
          'add',
          'delete',
          <Lov dataSet={this.enemyFriendsDs} name="code" mode="button" clearButton={false}>
            Lov
          </Lov>,
        ]}
        dataSet={this.enemyFriendsDs}
        pagination={{ position: 'top' }}
      >
        <Column name="name" editor={editorRenderer} sortable />
        <Column name="age" editor sortable />
        <Column name="code" editor width={150} />
        <Column name="sex" editor width={150} />
      </Table>,
    ];
  }
}

ReactDOM.render(<App />, mountNode);
```
