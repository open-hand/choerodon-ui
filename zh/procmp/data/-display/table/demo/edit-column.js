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

const { Column } = Table;

class EditButton extends React.Component {
  handleClick = (e) => {
    const { record, onClick } = this.props;
    onClick(record, e);
  };

  render() {
    return (
      <Button
        funcType="flat"
        icon="mode_edit"
        onClick={this.handleClick}
        size="small"
      />
    );
  }
}

const columnsNew = [
  { name: 'age', header: '芳龄' },
  { name: 'name', header: '贵姓' },
  { name: 'userid', header: '排位' },
  { name: 'enable', header: '甄选' },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editColumns: 'order',
      columnsNew: columnsNew,
      isDragColumn: true,
    };
  }

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
        help: '用户年龄，可以排序',
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
        </Form>
      ),
      onOk: () => this.userDs.submit(),
      onCancel: () => (isCancel = true),
      afterClose: () => isCancel && isNew && this.userDs.remove(record),
    });
  };

  editUser = (record) => {
    this.openModal(record);
  };

  renderEdit = ({ record }) => {
    return <EditButton onClick={this.editUser} record={record} />;
  };

  handleEditType = (editType) => {
    console.log(editType);
    this.setState({
      editColumns: editType,
    });
  };

  handleColumns = () => {
    console.log(this.state.columnsNew.length);
    if (this.state.columnsNew.length > 2) {
      this.setState({
        columnsNew: columnsNew.slice(0, 2),
      });
    } else {
      this.setState({
        columnsNew: columnsNew,
      });
    }
  };

  handleDrageColmns = () => {
    this.setState({
      isDragColumn: !this.state.isDragColumn,
    });
  };

  editAll = (
    <Button
      icon="brightness_o"
      key="all"
      onClick={() => {
        this.handleEditType('all');
      }}
    >
      全修改
    </Button>
  );

  editHeader = (
    <Button
      icon="brightness_2-o"
      key="header"
      onClick={() => {
        this.handleEditType('header');
      }}
    >
      只触发表头修改
    </Button>
  );

  editOrder = (
    <Button
      icon="brightness_3-o"
      key="order"
      onClick={() => {
        this.handleEditType('order');
      }}
    >
      只触发位置修改
    </Button>
  );

  editColmns = (
    <Button
      icon="brightness_4-o"
      key="columns"
      onClick={() => {
        this.handleColumns();
      }}
    >
      更改合并列
    </Button>
  );

  DrageColmns = (
    <Button
      icon="brightness_5-o"
      key="drag"
      onClick={() => {
        this.handleDrageColmns();
      }}
    >
      是否可拖拽列
    </Button>
  );

  columnsOnChange = (data) => {
    console.log(data);
  };

  render() {
    const buttons = [
      this.editAll,
      this.editHeader,
      this.editOrder,
      this.editColmns,
      this.DrageColmns,
    ];
    return (
      <Table
        columnsOnChange={this.columnsOnChange}
        columnsEditType={this.state.editColumns}
        columnsMergeCoverage={this.state.columnsNew}
        dragColumn={this.state.isDragColumn}
        dragRow
        key="user"
        buttons={buttons}
        dataSet={this.userDs}
        pristine
      >
        <Column name="userid" />
        <Column sortable name="age" header="年龄fucker" />
        <Column name="enable" />
        <Column name="name" />
        <Column
          header="操作"
          align="center"
          renderer={this.renderEdit}
          lock="right"
        />
      </Table>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
