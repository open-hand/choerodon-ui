---
order: 3
title:
  zh-CN: 在表单中使用
  en-US: Use in Form
---

## zh-CN

表单绑定数据源，与其他字段混合使用。

## en-US

Use with other `FormField`s in a `Form` with `DataSet`.

````jsx
import { DataSet, Form, Output, EmailField, NumberField, IntlField } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    tlsUrl: '/dataset/user/languages',
    fields: [
      { name: 'first-name', type: 'intl', defaultValue: 'Zhangsan', required: true, label: '姓名' },
      { name: 'last-name', type: 'intl', defaultValue: '描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述', required: true, label: '名称' },
      { name: 'phone', defaultValue: '15888888888', type: 'string', label: '手机号', required: true },
      { name: 'age', defaultValue: 18, type: 'number', label: '年龄' },
      { name: 'sex', defaultValue: 'F', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
      { name: 'language', defaultValue: 'zh-CN', type: 'string', label: '语言' },
      { name: 'email', defaultValue: 'some@example.com', type: 'string', label: '邮箱' },
      { name: 'homepage', defaultValue: 'www.baidu.com', type: 'string', label: '个人主页' },
      { name: 'birth', defaultValue: '2018-12-26', type: 'date', label: '生日' },
      { name: 'currency', defaultValue: 12, type: 'currency', label: '金额' },
      { name: 'description', defaultValue: '描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述', type: 'string', label: '描述' },
    ],
  });

  render() {
    return (
      <Form dataSet={this.ds} style={{ width: '3.5rem' }} useColon labelLayout="float" columns={2}>
        <IntlField name="first-name" displayOutput />
        <IntlField name="last-name" type="multipleLine" displayOutput />
        <Output name="phone" />
        <NumberField name="age" />
        <Output name="sex" />
        <Output name="language" />
        <EmailField name="email" />
        <Output name="homepage" />
        <Output name="birth" />
        <Output name="currency" currency="CNY" />
        <Output name="description" />
      </Form>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
