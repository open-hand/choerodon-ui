---
order: 6
title:
  zh-CN: 浮动标签
  en-US: Float Label
---

## zh-CN

浮动标签。

## en-US

Float Label.

```jsx
import {
  Form,
  CheckBox,
  TextField,
  Password,
  NumberField,
  EmailField,
  UrlField,
  DatePicker,
  Range,
  Select,
  SelectBox,
  Switch,
  TextArea,
  Button,
  Icon,
} from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

ReactDOM.render(
  <Form labelLayout="float" columns={3} header="Float Label">
    <TextField
      prefix={<Icon type="phone" />}
      colSpan={3}
      label="手机号"
      pattern="1[3-9]\d{9}"
      name="phone"
      required
      placeholder="请输入手机号"
    />
    <Password label="密码" name="password" required />
    <Password
      label="确认密码"
      name="confirmPassword"
      required
      validator={passwordValidator}
      help="请输入与左侧相同的密码"
      disabled
    />
    <NumberField rowSpan={2} label="年龄" name="age" min={18} step={1} required />
    <SelectBox label="性别" name="sex" required>
      <Option value="M">男</Option>
      <Option value="F">女</Option>
    </SelectBox>
    <Select label="语言" name="language" required>
      <Option value="zh-cn">简体中文</Option>
      <Option value="en-us">英语(美国)</Option>
      <Option value="ja-jp">日本語</Option>
    </Select>
    <EmailField label="邮箱" name="email" multiple />
    <TextArea
      rowSpan={2}
      colSpan={2}
      label="简介"
      name="description"
      required
      style={{ height: 80 }}
      placeholder="请输入简介"
    />
    <UrlField
      label="个人主页"
      name="homepage"
      required
      help="请输入你的个人主页，如Github Pages个人博客"
      showHelp="tooltip"
    />
    <DatePicker label="生日" name="birth" required />
    <Range label="阈值" name="threshold" required />
    <Switch label="是否冻结" name="frozen" required />
    <CheckBox label="是否显示" name="frozen" required />
    <div newLine colSpan={3}>
      <Button type="submit">注册</Button>
      <Button type="reset" style={{ marginLeft: 8 }}>
        重置
      </Button>
    </div>
  </Form>,
  mountNode,
);
```
