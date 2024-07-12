---
order: 2
title:
  zh-CN: 显示原始值
  en-US: Pristine
---

## zh-CN

显示原始值。

## en-US

Pristine.

```jsx
import {
  DataSet,
  Table,
  Form,
  TextField,
  NumberField,
  CheckBox,
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
        console.log('page, pagesize', page, pagesize)
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: true,
    combineSort: true,
    pageSize: 5,
    paging: 'noCount',
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
          <CheckBox name="enable" />
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

  createUser = () => {
    this.openModal(this.userDs.create({}), true);
  };

  createButton = (
    <Button icon="playlist_add" onClick={this.createUser} key="add">
      新增
    </Button>
  );

  render() {
    const buttons = [this.createButton, 'save', 'delete', 'reset'];
    return (
      <Table queryBar="none" key="user" buttons={buttons} dataSet={this.userDs} buttonsLimit={2} pristine>
        <Column name="userid" sortable />
        <Column name="age" sortable width={200} />
        <Column name="enable" width={200} />
        <Column name="name" width={200} />
        <Column header="操作" align="center" renderer={this.renderEdit} lock="right" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
