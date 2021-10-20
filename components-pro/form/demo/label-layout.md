---
order: 3
title:
  zh-CN: 标签布局
  en-US: Label Layout
---

## zh-CN

标签布局。

## en-US

Label Layout.

````jsx
import { Form, TextField, Password, NumberField, EmailField, UrlField, DatePicker, Switch, CheckBox, Select, SelectBox, TextArea, CodeArea, Icon, Button } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

const fixedLabelWidth = '60,70,50';

const App = () => {
  const [labelLayout, setLabelLayout] = React.useState('horizontal');
  const [labelWidth, setLabelWidth] = React.useState(fixedLabelWidth);
  return (
    <Form
      labelWidth={labelWidth === 'auto' ? labelWidth : labelWidth.split(',').map(width => Number(width))}
      labelLayout={labelLayout}
      labelTooltip="overflow"
      columns={3}
    >
      <SelectBox colSpan={labelLayout === 'horizontal' ? 2 : 3} label="labelLayout" value={labelLayout} onChange={setLabelLayout}>
        <Option value="horizontal">horizontal</Option>
        <Option value="vertical">vertical</Option>
        <Option value="placeholder">placeholder</Option>
        <Option value="float">float</Option>
        <Option value="none">none</Option>
      </SelectBox>
      {
         labelLayout === 'horizontal' && (
          <SelectBox label="labelWidth" value={labelWidth} onChange={setLabelWidth}>
            <Option value={fixedLabelWidth}>固定宽度[{fixedLabelWidth}]</Option>
            <Option value="auto">自动宽度auto</Option>
          </SelectBox>
         )
      }
      <TextField colSpan={3} label="手机号" pattern="1[3-9]\d{9}" name="phone" addonBefore="+86" addonAfter="中国大陆" required highlight="高亮" />
      <Password label="密码" name="password" required />
      <NumberField rowSpan={2} label="年龄——请填写大于18的数字" name="age" min={18} step={1} required addonAfter="周岁" />
      <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} help="请输入与左侧相同的密码" />
      <Switch label="是否冻结" name="flozen" required />
      <CheckBox label="是否开启" name="enabled" required />
      <Select label="语言" name="language" required multiple>
        <Option value="zh-cn">简体中文</Option>
        <Option value="en-us">英语(美国)</Option>
        <Option value="ja-jp">日本語</Option>
      </Select>
      <EmailField label="邮箱" name="email" prefix={<Icon type="mail_outline" />} multiple />
      <TextArea resize="both" rowSpan={2} colSpan={2} label="简介" name="description" required style={{ height: 80 }} help="请输入100~300个字符请输入100~300个字符请输入100~300个字符" />
      <CodeArea colSpan={3} rows={4} label="代码" name="code" required />
      <UrlField label={<span>个人主页</span>} name="homepage" required help="请输入你的个人主页，如Github Pages个人博客" showHelp="tooltip" />
      <DatePicker label="生日" name="birth" required />
      <div newLine colSpan={3}>
        <Button type="submit">注册</Button>
        <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
      </div>
    </Form>
  );
}

ReactDOM.render(
  <App />,
  mountNode
);
````
