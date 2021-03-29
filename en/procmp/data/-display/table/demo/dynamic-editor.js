import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table, Switch, Select } from 'choerodon-ui/pro';

const { Column } = Table;

class App extends React.Component {
  optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/common/code/HR.EMPLOYEE_GENDER/',
    autoQuery: true,
  });

  userDs = new DataSet({
    autoCreate: true,
    primaryKey: 'userid',
    name: 'user',
    pageSize: 5,
    fields: [
      {
        name: 'base',
        type: 'string',
        label: '基础',
      },
      {
        name: 'sex',
        label: '性别',
        dynamicProps: {
          type: ({ record }) => {
            return record.get('base') === 'Lov' ? 'object' : 'string';
          },
          lovCode: ({ record }) => {
            return record.get('base') === 'Lov' ? 'LOV_CODE' : null;
          },
          options: ({ record }) => {
            return record.get('base') === 'Lov' ? null : this.optionDs;
          },
        },
        required: true,
      },
      {
        name: 'userid',
        type: 'string',
        label: '编号',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        required: true,
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      update: ({ name, value, record }) => {
        console.log('name, value', name, value);
        if (name === 'base') {
          record.set('sex', undefined);
        }
      },
    },
  });

  userTwoDs = new DataSet({
    autoCreate: true,
    primaryKey: 'userid',
    name: 'user',
    pageSize: 5,
    fields: [
      {
        name: 'base',
        type: 'string',
        label: '基础',
      },
      {
        name: 'sex',
        label: '性别',
        dynamicProps: {
          type: ({ record }) => {
            return record.get('base') === 'Lov' ? 'object' : 'string';
          },
          lovCode: ({ record }) => {
            return record.get('base') === 'Lov' ? 'LOV_CODE' : null;
          },
          lookupCode: ({ record }) => {
            return record.get('base') === 'Lov' ? null : 'HR.EMPLOYEE_GENDER';
          },
        },
        required: true,
      },
      {
        name: 'userid',
        type: 'string',
        label: '编号',
      },
      {
        name: 'name',
        type: 'string',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      update: ({ name, value, record }) => {
        console.log('name, value', name, value);
        if (name === 'base') {
          record.set('sex', undefined);
          record.getField('sex').set('options', undefined);
        }
      },
    },
  });

  render() {
    const buttons = ['add', 'delete', 'reset'];
    return (
      <>
        <Table
          header="Method one"
          key="user_one"
          buttons={buttons}
          dataSet={this.userDs}
        >
          <Column name="userid" />
          <Column
            name="base"
            editor={() => {
              return (
                <Select>
                  <Select.Option value="Select">Select</Select.Option>
                  <Select.Option value="Lov">Lov</Select.Option>
                </Select>
              );
            }}
          />
          <Column name="sex" editor />
          <Column name="name" editor />
          <Column name="age" />
          <Column name="enable" editor={<Switch />} />
        </Table>
        <Table
          header="Method Two"
          key="user_two"
          buttons={buttons}
          dataSet={this.userTwoDs}
        >
          <Column name="userid" />
          <Column
            name="base"
            editor={() => {
              return (
                <Select>
                  <Select.Option value="Select">Select</Select.Option>
                  <Select.Option value="Lov">Lov</Select.Option>
                </Select>
              );
            }}
          />
          <Column name="sex" editor />
          <Column name="name" editor />
          <Column name="age" editor />
          <Column name="enable" editor={<Switch />} />
        </Table>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
