---
order: 1
title:
  zh-CN: 数据源
  en-US: DataSet  
---

## zh-CN

表单绑定数据源。

## en-US

Bind DataSet.

```jsx
import {
  DataSet,
  Form,
  TextField,
  NumberField,
  Password,
  EmailField,
  UrlField,
  DatePicker,
  Select,
  SelectBox,
  Switch,
  Lov,
  Button,
} from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, record) {
  if (value !== record.get('password')) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

const defaultValidationMessages = {
  valueMissing: '请输入{label}。（自定义）',
};

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'phone',
        type: 'string',
        label: '手机号',
        labelWidth: 150,
        required: true,
        pattern: '^1[3-9]\\d{9}$',
      },
      {
        name: 'password',
        type: 'string',
        label: '密码',
        required: true,
        defaultValidationMessages,
      },
      {
        name: 'confirmPassword',
        type: 'string',
        label: '确认密码',
        required: true,
        validator: passwordValidator,
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        required: true,
        min: 18,
        step: 1,
        help: '我们需要确定你的年龄',
      },
      { name: 'sex', type: 'string', label: '性别', required: true },
      {
        name: 'language',
        type: 'string',
        label: '语言（labelWidth为auto自适应）',
        required: true,
        help: '超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息',
      },
      { name: 'email', type: 'email', label: '邮箱', required: true },
      { name: 'homepage', type: 'url', label: '个人主页', required: true },
      { name: 'birth', type: 'date', label: '生日', required: true },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE', placeholder:"d1" },
      { name: 'frozen', type: 'boolean', label: '是否冻结' },
    ],
  });

  clear = () => {
    this.ds.loadData([])
  };

  validateCurrent = () => {
    const { current } = this.ds;
    current.validate();
  };

  validatePhone = () => {
    const { current } = this.ds;
    const field = current.getField('phone');
    field.checkValidity();
  };

  render() {
    return (
      <Form dataSet={this.ds} style={{ width: '4.5rem' }} labelWidth="auto">
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
        <Lov name="code" placeholder="d2" />
        <Switch name="frozen" />
        <div>
          <Button type="submit">注册</Button>
          <Button type="reset">
            重置
          </Button>
          <Button onClick={this.clear}>
            清空
          </Button>
        </div>
        <div>
          <Button onClick={this.validateCurrent}>校验当前记录</Button>
          <Button onClick={this.validatePhone}>校验手机</Button>
        </div>
      </Form>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
