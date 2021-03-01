---
order: 9
title:
  zh-CN: 禁用
  en-US: Disabled
---

## zh-CN

表单。

## en-US

Form.

````jsx
import { Form, TextField, Password, NumberField, EmailField, UrlField, DatePicker, Select, SelectBox, Button, Menu, Dropdown, Icon } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.io/">1st menu item</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.com.cn/">2nd menu item</a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-hand/choerodon-ui">3rd menu item</a>
    </Menu.Item>
  </Menu>
);

const dropdown = (
  <Dropdown overlay={menu}>
    <Button funcType="flat" size="small">
      Click me <Icon type="arrow_drop_down" />
    </Button>
  </Dropdown>
);

ReactDOM.render(
  <Form disabled style={{ width: '4rem' }}>
    <TextField label="手机号" pattern="1[3-9]\d{9}" name="phone" required clearButton addonBefore="+86" addonAfter="中国大陆" />
    <Password label="密码" name="password" required />
    <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} help="请输入与上方相同的密码" showHelp="tooltip" />
    <NumberField label="年龄" name="age" min={18} step={1} required help="我们需要确定你的年龄" addonAfter="周岁" />
    <SelectBox label="性别" name="sex" required>
      <Option value="M">男</Option>
      <Option value="F">女</Option>
    </SelectBox>
    <Select label="语言" name="language" required help="超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息">
      <Option value="zh-cn">简体中文</Option>
      <Option value="en-us">英语(美国)</Option>
      <Option value="ja-jp">日本語</Option>
    </Select>
    <EmailField label="邮箱" name="email" required addonAfter={dropdown} />
    <UrlField label="个人主页" name="homepage" required addonBefore="Http://" />
    <DatePicker label="生日" name="birth" required />
    <Form>
      <div>
        <Button type="submit">注册</Button>
        <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
      </div>
    </Form>
  </Form>,
  mountNode
);
````
