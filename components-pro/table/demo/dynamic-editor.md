---
order: 15
title:
  zh-CN: 切换字段编辑器
  en-US: Switch editor
---

## zh-CN

切换字段编辑器，根据其他字段值决定为 lov / select.

## en-US

Switch field editor to lov /select. based on other field values.

```jsx
import { DataSet, Table, Button, Switch, Select } from 'choerodon-ui/pro';

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
        name: "base",
        type: "string",
        label: "基础"
      },
      {
        name: 'sex',
        label: '性别',
        dynamicProps: {
          type: ({ dataSet, record, name }) => {
            return record.get("base") === "Lov" ? "object" : 'string';
          },
          lovCode: ({ dataSet, record, name }) => {
            return record.get("base") === "Lov" ? "LOV_CODE" : null;
          },
          options: ({ dataSet, record, name }) => {
             return record.get("base") === "Lov" ? null : this.optionDs;
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


  render() {
    const buttons = [
      'add',
      'delete',
      'reset',
    ];
    return (
      <Table key="user" buttons={buttons} dataSet={this.userDs}>
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
        <Column name="sex" editor={true} />
        <Column name="name" editor={true} />
        <Column name="age" editor={true} />
        <Column name="enable" editor={<Switch />} />
      </Table>
    );
  }
}
ReactDOM.render(<App />, mountNode);
```
