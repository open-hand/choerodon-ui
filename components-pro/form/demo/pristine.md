---
order: 9
title:
  zh-CN: 显示原始值
  en-US: Show Pristine Value
---

## zh-CN

显示原始值。

## en-US

Show Pristine Value.

````jsx
import { DataSet, Form, TextField, NumberField, Password, EmailField, UrlField, DatePicker, Select, SelectBox, Switch, Lov, Button, Row, Col } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, record) {
  if (value !== record.get('password')) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

class App extends React.Component {
  ds = new DataSet({
    data: [{
      phone: 1800000000,
      age: 18,
      sex: 'F',
      language: 'zh-cn',
      email: 'xxx@choerodon.io',
      homepage: 'https://choerodon.io',
      birth: '1984-11-22',
      code: 'HR.EMPLOYEE_GENDER',
      frozen: 'true',
    }],
    fields: [
      { name: 'phone', type: 'string', label: '手机号', required: true, pattern: '^1[3-9]\\d{9}$' }, // /^1[3-9]\d{9}$/
      { name: 'password', type: 'string', label: '密码', required: true },
      { name: 'confirmPassword', type: 'string', label: '确认密码', required: true, validator: passwordValidator },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, step: 1, help: '我们需要确定你的年龄' },
      { name: 'sex', type: 'string', label: '性别', required: true },
      { name: 'language', type: 'string', label: '语言', required: true, help: '超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息' },
      { name: 'email', type: 'email', label: '邮箱', required: true },
      { name: 'homepage', type: 'url', label: '个人主页', required: true },
      { name: 'birth', type: 'date', label: '生日', required: true },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'frozen', type: 'boolean', label: '是否冻结' },
    ],
  });

  render() {
    return (
      <Row>
        <Col span={12}>
          <Form pristine dataSet={this.ds} style={{ width: '4rem' }}>
            <TextField name="phone" />
            <Password name="password" />
            <Password name="confirmPassword" />
            <NumberField name="age" addonAfter="周岁" showHelp="tooltip" />
            <SelectBox name="sex">
              <Option value="M">男</Option>
              <Option value="F">女</Option>
            </SelectBox>
            <Select name="language">
              <Option value="zh-cn">简体中文</Option>
              <Option value="en-us">英语(美国)</Option>
              <Option value="ja-jp">日本語</Option>
            </Select>
            <EmailField name="email" />
            <UrlField name="homepage" />
            <DatePicker name="birth" />
            <Lov name="code" />
            <Switch name="frozen" />
          </Form>
        </Col>
        <Col span={12}>
          <Form dataSet={this.ds} style={{ width: '4rem' }}>
            <TextField name="phone" />
            <Password name="password" />
            <Password name="confirmPassword" />
            <NumberField name="age" addonAfter="周岁" showHelp="tooltip" />
            <SelectBox name="sex">
              <Option value="M">男</Option>
              <Option value="F">女</Option>
            </SelectBox>
            <Select name="language">
              <Option value="zh-cn">简体中文</Option>
              <Option value="en-us">英语(美国)</Option>
              <Option value="ja-jp">日本語</Option>
            </Select>
            <EmailField name="email" />
            <UrlField name="homepage" />
            <DatePicker name="birth" />
            <Lov name="code" />
            <Switch name="frozen" />
            <div>
              <Button type="submit">注册</Button>
              <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
            </div>
          </Form>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
