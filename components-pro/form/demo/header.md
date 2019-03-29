---
order: 6
title:
  zh-CN: 表单头
  en-US: Form Header
---

## zh-CN

表单头。

## en-US

Form Header.

````jsx
import { Form, TextField, Password, NumberField, EmailField, UrlField, DatePicker, Select, SelectBox, Button } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

ReactDOM.render(
  <Form header="Custom Header">
    <TextField label="手机号" pattern="1[3-9]\d{9}" name="phone" required clearButton />
    <Password label="密码" name="password" form="basic" required />
    <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} />
    <NumberField label="年龄" name="age" min={18} step={1} required />
    <SelectBox label="性别" name="sex" required>
      <Option value="M">男</Option>
      <Option value="F">女</Option>
    </SelectBox>
    <Select label="语言" name="language" required>
      <Option value="zh-cn">简体中文</Option>
      <Option value="en-us">英语(美国)</Option>
      <Option value="ja-jp">日本語</Option>
    </Select>
    <EmailField label="邮箱" name="email" required />
    <UrlField label="个人主页" name="homepage" required />
    <DatePicker label="生日" name="birth" required />
    <div>
      <Button type="submit">注册</Button>
      <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
    </div>
  </Form>,
  mountNode
);
````
