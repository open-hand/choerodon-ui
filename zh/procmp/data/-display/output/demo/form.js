import React from 'react';
import ReactDOM from 'react-dom';
import {
  DataSet,
  Form,
  Output,
  EmailField,
  NumberField,
} from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'phone',
        defaultValue: '15888888888',
        type: 'string',
        label: '手机号',
        required: true,
      },
      { name: 'age', defaultValue: 18, type: 'number', label: '年龄' },
      {
        name: 'sex',
        defaultValue: 'F',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
      },
      {
        name: 'language',
        defaultValue: 'zh-CN',
        type: 'string',
        label: '语言',
      },
      {
        name: 'email',
        defaultValue: 'some@example.com',
        type: 'string',
        label: '邮箱',
      },
      {
        name: 'homepage',
        defaultValue: 'www.baidu.com',
        type: 'string',
        label: '个人主页',
      },
      {
        name: 'birth',
        defaultValue: '2018-12-26',
        type: 'date',
        label: '生日',
      },
    ],
  });

  render() {
    return (
      <Form dataSet={this.ds} style={{ width: '3.5rem' }}>
        <Output name="phone" />
        <NumberField name="age" />
        <Output name="sex" />
        <Output name="language" />
        <EmailField name="email" />
        <Output name="homepage" />
        <Output name="birth" />
      </Form>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
