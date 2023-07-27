import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    name: 'large-user',
    autoQuery: true,
    pageSize: 10,
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
        name: 'numberMultiple',
        type: 'number',
        label: '数值多值',
        multiple: true,
        min: 10,
        max: 100,
        step: 0.5,
      },
      {
        name: 'code',
        type: 'object',
        label: '代码描述',
      },
      {
        name: 'code.v',
        type: 'number',
      },
      {
        name: 'code.d.v',
        type: 'number',
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        required: true,
      },
      {
        name: 'code_description',
        type: 'string',
        label: '代码描述',
      },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        required: true,
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
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      {
        name: 'accountMultiple',
        type: 'string',
        bind: 'account.multiple',
        label: '多值拼接',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      { name: 'account', type: 'object', ignore: 'always' },
      {
        name: 'enable',
        type: 'boolean',
        label: '是否开启',
        unique: 'uniqueGroup',
      },
      {
        name: 'frozen',
        type: 'boolean',
        label: '是否冻结',
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'date.startDate',
        type: 'date',
        label: '开始日期',
        defaultValue: new Date(),
      },
      { name: 'date.endDate', type: 'time', range: true, label: '结束日期' },
    ],
  });

  render() {
    const columns = [
      {
        name: 'userid',
      },
      {
        name: 'age',
        editor: true,
      },
      {
        name: 'name',
        editor: true,
      },
      {
        name: 'code_code',
      },
      {
        name: 'code_select',
      },
      {
        name: 'codeMultiple',
      },
      {
        name: 'codeMultiple_code',
      },
      {
        name: 'sex',
      },
      {
        name: 'sexMultiple',
      },
      {
        name: 'accountMultiple',
      },
      {
        name: 'date.startDate',
      },
      {
        name: 'date.endDate',
      },
      {
        name: 'numberMultiple',
      },
      {
        name: 'frozen',
      },
    ];

    // 设置 virtualSpin 开启滚动loading效果，与 table spin 效果一致

    return (
      <Table
        key="user"
        virtual
        dataSet={this.userDs}
        style={{ height: 300 }}
        columns={columns}
        pagination={{
          pageSizeOptions: ['10', '50', '100', '200'],
        }}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
