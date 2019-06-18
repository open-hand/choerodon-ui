---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

最简单的用法。

## en-US

The most basic usage.

````jsx
import { DataSet, Table, TextField, NumberField, Modal, Button, Tabs } from 'choerodon-ui/pro';

const { Column } = Table;
const { TabPane } = Tabs;

function editorRenderer(record) {
  return record.status === 'add' ? <TextField /> : null;
}

function sexIdRenderer({ record }) {
  return record.getField('sex').getLookupData().codeValueId;
}

function handleUserDSLoad({ dataSet }) {
  const first = dataSet.get(0);
  if (first) {
    first.selectable = false;
  }
}

function maleFilter(record) {
  return record.get('sex') === 'M' || !record.get('sex');
}

function femaleFilter(record) {
  return record.get('sex') === 'F';
}

function renderColumnFooter(dataset, name) {
  const max = Math.max(0, ...dataset.data.map(record => record.get(name)).filter(value => !isNaN(value)));
  return `最大年龄：${NumberField.format(max)}`;
}

function renderColumnHeader(dataset, name) {
   const field = dataset.getField(name);
   return <span><i>-=</i>{field ? field.get('label') : ''}<i>=-</i></span>;
}

function nameDynamicProps({ record }) {
  return { required: record.get('sex') === 'M' };
}

function codeDynamicProps({ record }) {
  return { textField: record.get('sex') === 'M' ? 'description' : 'description2' };
}

function codeDescriptionDynamicProps({ record }) {
  return { bind: record.get('sex') === 'M' ? 'code.description' : 'code.description2' };
}

class App extends React.Component {
  friendsDs = new DataSet({
    queryUrl: '/dataset/user/queries',
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER', required: true },
    ],
    events: {
      query: ({ params }) => console.log('friend query parameter', params),
    },
  });

  enemyFriendsDs = new DataSet({
    selection: 'single',
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER', required: true },
    ],
  });

  enemyDs = new DataSet({
    primaryKey: 'userid',
    fields: [
      { name: 'name', type: 'intl', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER', required: true },
    ],
    children: {
      friends: this.enemyFriendsDs,
    },
    events: {
      indexChange: ({ record }) => record && console.log('enemyRecord cascadeParent', record.cascadeParent),
    },
  });

  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    transport: {
      read: ({ dataSet }) => dataSet.length ? {
        url: '/dataset/user/mutations',
      } : {
        url: '/dataset/user/queries',
      },
      create: {
        url: '/dataset/user/mutations',
        method: 'put',
      },
      update: ({ data }) => data.length ? {
        url: `/dataset/user/mutations/${data[0].userid}`,
        data: data[0],
      }: null,
      destroy: {
        url: '/dataset/user/mutations',
        method: 'delete',
      },
    },
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
    ],
    fields: [
      { name: 'userid', type: 'string', label: '编号', required: true, unique: true, help: '主键，区分用户' },
      { name: 'name', type: 'intl', label: '姓名', dynamicProps: nameDynamicProps, ignore: 'clean' },
      { name: 'age', type: 'number', label: '年龄', unique: 'uniqueGroup', max: 100, step: 1, help: '用户年龄，可以排序' },
      { name: 'numberMultiple', type: 'number', label: '数值多值', multiple: true, min: 10, max: 100, step: 0.5 },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE', dynamicProps: codeDynamicProps },
      { name: 'code_code', bind: 'code.code', type: 'string', label: '代码', maxLength: 11, required: true },
      { name: 'code_description', dynamicProps: codeDescriptionDynamicProps, type: 'string', label: '代码描述' },
      { name: 'code_select', type: 'string', label: '代码描述(下拉)', lovCode: 'LOV_CODE', required: true },
      { name: 'codeMultiple', type: 'object', label: '代码描述（多值）', lovCode: 'LOV_CODE', multiple: true, required: true },
      { name: 'codeMultiple_code', bind: 'codeMultiple.code', type: 'string', label: '代码（多值）', multiple: true },
      { name: 'codeMultiple_description', bind: 'codeMultiple.description', type: 'string', label: '代码描述', multiple: ',' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER', required: true },
      { name: 'sexMultiple', type: 'string', label: '性别（多值）', lookupCode: 'HR.EMPLOYEE_GENDER', multiple: true },
      { name: 'accountMultiple', type: 'string', bind: 'account.multiple', label: '多值拼接', lookupCode: 'HR.EMPLOYEE_GENDER', multiple: ',' },
      { name: 'account', type: 'object', ignore: 'always' },
      { name: 'enable', type: 'boolean', label: '是否开启', unique: 'uniqueGroup' },
      { name: 'frozen', type: 'boolean', label: '是否冻结', trueValue: 'Y', falseValue: 'N' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      { name: 'date.endDate', type: 'dateTime', label: '结束日期' },
    ],
    events: {
      selectAll: ({ dataSet }) => console.log('select all', dataSet.selected),
      indexchange: ({ record }) => console.log('current user', record),
      submit: ({ data }) => console.log('submit data', data),
      load: handleUserDSLoad,
      query: ({ params }) => console.log('user query parameter', params),
      export: ({ params }) => console.log('user export parameter', params),
    },
    children: {
      friends: this.friendsDs,
      'other.enemy': this.enemyDs,
    },
  });

  copy = () => {
    const { userDs } = this;
    const { selected } = userDs;
    if (selected.length > 0) {
      userDs.unshift(...selected.map(record => record.clone()));
    } else {
      Modal.warning('请选择记录');
    }
  };

  insert = () => {
    const { userDs } = this;
    const { selected } = userDs;
    if (selected.length > 0) {
      userDs.splice(0, 0, ...selected);
    } else {
      Modal.warning('请选择记录');
    }
  };

  openModal = (record) => {
    let isCancel = false;
    Modal.open({
      drawer: true,
      width: 600,
      children: (
        <div>
          <Table buttons={['add', 'delete']} dataSet={this.friendsDs} header="Friends(M)" rowHeight={40} filter={maleFilter}>
            <Column name="name" editor={editorRenderer} sortable />
            <Column name="age" editor sortable />
            <Column name="sex" editor width={150} />
          </Table>
          <Table dataSet={this.friendsDs} header="Friends(F)" rowHeight={40} filter={femaleFilter}>
            <Column name="name" editor={editorRenderer} sortable />
            <Column name="age" editor sortable />
            <Column name="sex" editor width={150} />
          </Table>
        </div>
      ),
      onCancel: () => isCancel = true,
      afterClose: () => record && isCancel && this.userDs.remove(record),
    });
  }

  importData = () => {
    const { userDs } = this;
    console.log(userDs.toJSONData());
    console.log(userDs.toJSONData(true));
    console.log(userDs.toJSONData(false, true));
    userDs.create({ other: { enemy: [{}, {}] } });
  };

  createUser = () => {
    this.openModal(this.userDs.create({}, 0));
    this.friendsDs.create({});
  };

  editUser = () => {
    this.openModal();
  };

  renderEdit = () => {
    return <Button funcType="flat" icon="mode_edit" onClick={this.editUser} />;
  };

  copyButton = (
    <Button funcType="flat" color="blue" icon="baseline-file_copy" onClick={this.copy} key="copy">复制</Button>
  );

  insertButton = (
    <Button funcType="flat" color="blue" icon="merge_type" onClick={this.insert} key="insert">插入</Button>
  );

  createButton = (
    <Button funcType="flat" color="blue" icon="playlist_add" onClick={this.createUser} key="add">新增</Button>
  );

  importButton = (
    <Button funcType="flat" color="blue" icon="get_app" onClick={this.importData} key="import">导入</Button>
  );

  save = async () => {
    console.log('submit result', await this.userDs.submit());
  };

  render() {
    const buttons = [
      this.createButton,
      ['save', { onClick: this.save }],
      ['delete', { color: 'red' }],
      'remove',
      'reset',
      'export',
      this.importButton,
      this.copyButton,
      this.insertButton,
    ];
    return [
      <Table key="user" buttons={buttons} dataSet={this.userDs} header="User" style={{ height: 200 }}>
        <Column name="userid" header={renderColumnHeader} style={{ color: 'red' }} editor width={150} lock sortable />
        <Column name="age" editor width={150} sortable footer={renderColumnFooter} />
        <Column name="enable" editor width={50} minWidth={50} lock />
        <Column name="name" editor width={150} sortable />
        <Column name="code" editor width={150} sortable />
        <Column name="code_code" editor width={150} />
        <Column name="code_select" editor width={150} />
        <Column name="codeMultiple" editor width={150} />
        <Column name="codeMultiple_code" width={150} />
        <Column name="sex" editor width={150} />
        <Column header="性别id" renderer={sexIdRenderer} />
        <Column name="sexMultiple" editor width={150} />
        <Column name="accountMultiple" editor width={150} />
        <Column name="date.startDate" editor width={150} />
        <Column name="date.endDate" editor width={150} />
        <Column name="numberMultiple" editor width={150} minWidth={50} />
        <Column name="frozen" editor width={50} minWidth={50} lock="right" />
        <Column header={<span style={{ color: 'red' }}>编辑Friends</span>} align="center" renderer={this.renderEdit} lock="right" />
      </Table>,
      <Tabs key="tabs">
        <TabPane tab="Enemy">
          <Table key="enemy" highLightRow={false} buttons={['add', 'delete']} dataSet={this.enemyDs} pagination={{ position: 'both' }}>
            <Column name="name" editor sortable />
            <Column name="age" editor sortable />
            <Column name="sex" editor width={150} />
          </Table>
        </TabPane>
        <TabPane tab="Enemy Friends">
          <Table key="friends" buttons={['add', 'delete']} dataSet={this.enemyFriendsDs} pagination={{ position: 'top' }}>
            <Column name="name" editor={editorRenderer} sortable />
            <Column name="age" editor sortable />
            <Column name="sex" editor width={150} />
          </Table>
        </TabPane>
      </Tabs>,
    ];
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
