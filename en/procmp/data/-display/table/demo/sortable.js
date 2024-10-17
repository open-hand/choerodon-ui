import React from 'react';
import ReactDOM from 'react-dom';
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
import { runInAction } from 'mobx';

const { Column } = Table;

const EditButton = (props) => {
  const handleClick = (e) => {
    const { record, onClick } = props;
    onClick(record, e);
  };

  return (
    <Button
      funcType="flat"
      icon="mode_edit"
      onClick={handleClick}
      size="small"
    />
  );
};

class App extends React.Component {
  oriRecords;

  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/10/1`,
        };
      },
    },
    autoQuery: true,
    combineSort: true,
    pageSize: 10,
    paging: true,
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
        name: 'code_select',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
      query: ({ data, params }) => console.log('query data', data, params),
      load: ({ dataSet }) => {
        // 记录原始记录, 实际项目中需要注意数据可能被修改
        this.oriRecords = dataSet.records;
      },
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

  editUser = (record) => {
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
    const buttons = ['save', this.createButton, 'delete', 'reset'];
    return (
      <Table
        queryBar="none"
        key="user"
        buttons={buttons}
        dataSet={this.userDs}
        buttonsLimit={2}
        combineColumnFilter
      >
        <Column
          name="userid"
          filter
          sortable={(a, b, s) => {
            console.log('handleClick', s);
            if (s === 'asc') {
              return a.get('userid') - b.get('userid');
            } else if (s === 'desc') {
              return b.get('userid') - a.get('userid');
            } else {
              // 还原排序
              return a.get('userid') - b.get('userid');
            }
          }}
        />
        <Column
          name="age"
          filter
          sortable={(a, b, s) => {
            console.log('handleClick', s);
            if (s === 'asc') {
              return a.get('age') - b.get('age');
            } else {
              return b.get('age') - a.get('age');
            }
          }}
          sortableCallback={({ dataSet, field, order }) => {
            runInAction(() => {
              if (!order) {
                // 自定义还原排序
                dataSet.records = this.oriRecords;
              }
            });
          }}
          width={200}
        />
        <Column
          name="enable"
          filter
          filterPopover={({ setFilterText, footer }) => {
            return (
              <>
                <Button
                  icon="playlist_add"
                  onClick={() => setFilterText(true)}
                  key="add"
                >
                  true
                </Button>
                {footer}
              </>
            );
          }}
          sortable
          width={200}
        />
        <Column
          name="name"
          filter={({ record, filterText }) =>
            filterText === '1' && record.get('name') === '孟艳'
          }
          sortable
          width={200}
        />
        <Column name="sex" filter sortable width={200} />
        <Column name="code_select" filter sortable width={200} />
        <Column name="sexMultiple" filter sortable width={200} />
        <Column name="date.startDate" filter sortable width={200} />
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
