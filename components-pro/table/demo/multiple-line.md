---
order: 23
title:
  zh-CN: 多行
  en-US: MultipleLine
---

## zh-CN

一列多行。

## en-US

MultipleLine.

```jsx
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

const { Column } = Table;

class EditButton extends React.Component {
  handleClick = e => {
    const { record, onClick } = this.props;
    onClick(record, e);
  };

  render() {
    return <Button funcType="flat" icon="mode_edit" onClick={this.handleClick} size="small" />;
  }
}

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
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
      { name: 'code_description', bind: 'code.code_description', type: 'string', label: '代码描述' },
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
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
    },
  });

  openModal = (record, isNew) => {
    let isCancel = false;
    Modal.open({
      drawer: true,
      width: 600,
      children: (
        <Form record={record}>
          <TextField name="userid" />
          <TextField name="name" />
          <NumberField name="age" />
          <SelectBox name="sex" />
        </Form>
      ),
      onOk: () => this.userDs.submit(),
      onCancel: () => (isCancel = true),
      afterClose: () => isCancel && isNew && this.userDs.remove(record),
    });
  };

  editUser = record => {
    this.openModal(record);
  };

  renderEdit = ({ record }) => {
    return <EditButton onClick={this.editUser} record={record} />;
  };

  createButton = (
    <Button icon="playlist_add" onClick={this.createUser} key="add">
      新增
    </Button>
  );

  render() {
    const buttons = ['add', 'save', 'delete', 'reset'];
    return (
      <>
        <Button icon="xxx" onClick={()=> console.log(this.userDs.toJSONData(), this.userDs.current.get('code'))} key="this.userDs">
          toJSONData
        </Button>
        <Table key="user" buttons={buttons} dataSet={this.userDs}>
          <Column name="userid" />
          <Column name="age" />
          <Column name="enable" />
          <Column name="sexMultiple" />
          <Column name="name" editor />
          <Column name="code" editor width={300} />
        </Table>
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
