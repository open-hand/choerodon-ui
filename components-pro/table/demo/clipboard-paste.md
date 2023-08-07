---
order: 30
title:
  zh-CN: 粘贴复制
  en-US: clipboard-paste
---

## zh-CN

实现 Table 与 Excel 表格之间的双向复制。

## en-US

Two-way copy between Table and Excel table.

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
        return {
          url: `/dataset/user/page/10/${page}`,
        };
      },
    },
    autoQuery: true,
    combineSort: true,
    pageSize: 5,
    // paging: false,
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
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'codeMultiple_code',
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      { 
        name: 'enable', 
        type: 'boolean', 
        label: '是否开启',
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
    ],
  });

  userDs1 = new DataSet({
    primaryKey: 'userid',
    data: [{}],
    combineSort: true,
    pageSize: 5,
    paging: false,
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
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        lovQueryAxiosConfig:(code, lovConfig, props)=>{
          return {
            method: 'post',
            url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/lov',
            data: props.data,
          }
        },
        multiple: true,
        required: true,
      },
      {
        name: 'codeMultiple_code',
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
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
        // textField: 'description',
        // valueField: 'code',
        // lookupAxiosConfig:()=>{
        //   return {
        //     url: "https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/c7n/lookup",
        //     method: "post",
        //   }
        // },
        multiple: ',',
      },
      { name: 'date.startDate', type: 'date', multiple: true, label: '开始日期' },
      { name: 'date.endDate', type: 'dateTime', label: '结束日期', multiple: true },
      { name: 'month', type: 'month', label: '月份', multiple: true },
      { name: 'week', type: 'week', multiple: true, label: '周' },
      { name: 'time', type: 'time', multiple: true, label: '时间' },
      { name: 'year', type: 'year', label: '年', multiple: true },
    ],
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

  render() {
    return (
      <>
        <p>复制功能</p>
        <Table 
          queryBar="none" 
          key="user" 
          dataSet={this.userDs} 
          // columnEditorBorder={false}
          clipboard={{paste: true, copy: true, autoAdd: true}}
        >
          <Column name="userid" filter />
          <Column 
            name="age" 
            filter 
            width={100} 
            editor
            />
          <Column 
            name="enable" 
            sortable 
            width={100} 
            editor
          />
          <Column name="name" sortable width={100} />
          <Column name="sex" sortable width={100} />
          <Column name="codeMultiple" sortable width={200} editor />
          <Column name="sexMultiple" sortable width={100} />
          <Column header="操作" align="center" renderer={this.renderEdit} lock="right" />
        </Table>

        <br />
        <p>粘贴功能</p>
        <Table 
          queryBar="none" 
          key="user1" 
          buttons={['add']} 
          dataSet={this.userDs1} 
          columnEditorBorder={false}
          clipboard={{ paste: true}}
        >
          <Column name="userid" filter editor />
          <Column 
            name="age" 
            filter 
            width={100}
            editor
            />
          <Column 
            name="enable" 
            sortable 
            width={100} 
          />
          <Column name="name" sortable width={100} editor />
          <Column name="sex" sortable width={100} editor />
          <Column name="codeMultiple" sortable width={200} editor />
          <Column name="sexMultiple" sortable width={300} editor />
          <Column name="date.startDate" sortable width={200} editor />
          <Column name="date.endDate" sortable width={200} editor />
          <Column name="month" width={100} editor />
          <Column name="week" width={100} editor />
          <Column name="time" width={100} editor />
          <Column name="year" width={100} editor />
          <Column header="操作" align="center" renderer={this.renderEdit} lock="right" />
        </Table>
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```