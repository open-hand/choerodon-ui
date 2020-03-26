---
order: 0
title: 
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源。

## en-US

DataSet Binding.

````jsx
import { DataSet, Form, TextField, NumberField, SelectBox, Switch, Button, Spin } from 'choerodon-ui/pro';

const { Option } = SelectBox;

class App extends React.Component {
 ds = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    fields:  [
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
  });


  render() {
    return (
      <Spin dataSet={this.ds}>
        <Form header="刷新表单" dataSet={this.ds}>
          <TextField name="userid" />
          <TextField name="name" />
          <NumberField name="age" />
          <SelectBox name="sex">
            <Option value="M">男</Option>
            <Option value="F">女</Option>
          </SelectBox>
          <Switch name="enable" />
        </Form>
        <div>
           <Button onClick={() => this.ds.query()}>
             点击触发DS查询
           </Button>
        </div>
      </Spin>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
