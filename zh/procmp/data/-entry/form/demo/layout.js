import React from 'react';
import ReactDOM from 'react-dom';
import { Form, TextField, Password, NumberField, EmailField, UrlField, DatePicker, Select, SelectBox, TextArea, Button } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

ReactDOM.render(
  <Form labelWidth={[60, 70, 50]} columns={3}>
    <TextField colSpan={3} label="手机号" pattern="1[3-9]\d{9}" name="phone" required />
    <Password label="密码" name="password" required />
    <NumberField rowSpan={2} label="年龄" name="age" min={18} step={1} required addonAfter="周岁" />
    <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} />
    <SelectBox colSpan={2} label="性别" name="sex" required>
      <Option value="M">男</Option>
      <Option value="F">女</Option>
    </SelectBox>
    <Select label="语言" name="language" required>
      <Option value="zh-cn">简体中文</Option>
      <Option value="en-us">英语(美国)</Option>
      <Option value="ja-jp">日本語</Option>
    </Select>
    <EmailField label="邮箱" name="email" />
    <TextArea rowSpan={2} colSpan={2} label="简介" name="description" required style={{ height: 80 }} help="请输入100~300个字符请输入100~300个字符请输入100~300个字符" />
    <UrlField label={<span>个人主页</span>} name="homepage" required help="请输入你的个人主页，如Github Pages个人博客" showHelp="tooltip" />
    <DatePicker label="生日" name="birth" required />
    <div newLine colSpan={3}>
      <Button type="submit">注册</Button>
      <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
    </div>
  </Form>,
  document.getElementById('container')
);
