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
import { Form, TextField, Password, NumberField, EmailField, UrlField, DatePicker, Switch, CheckBox, Select, SelectBox, TextArea, CodeArea, Range, Icon, Button, Output, RichText } from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

const fixedLabelWidth = '60,70,90';

const App = () => {
  const [labelLayout, setLabelLayout] = React.useState('horizontal');
  const [labelWidth, setLabelWidth] = React.useState(fixedLabelWidth);
  const [labelAlign, setLabelAlign] = React.useState('right');
  const [useColon, setUseColon] = React.useState(true);
  const [requiredMarkAlign, setRequiredMarkAlign] = React.useState('left');
  const [showHelp, setShowHelp] = React.useState('label');
  const [separateSpacingHorizontal, setSeparateSpacingHorizontal] = React.useState(0);
  const [separateSpacingVertical, setSeparateSpacingVertical] = React.useState(0);
  const [spacingType, setSpacingType] = React.useState('around');
  return (
    <>
      <Form
        columns={2}
        labelLayout="vertical"
        separateSpacing={{ width: 100, height: 20 }}
        spacingType="between"
      >
        <SelectBox label="labelLayout" value={labelLayout} onChange={setLabelLayout}>
          <Option value="horizontal">horizontal</Option>
          <Option value="vertical">vertical</Option>
          <Option value="placeholder">placeholder</Option>
          <Option value="float">float</Option>
          <Option value="none">none</Option>
        </SelectBox>
        <SelectBox label="labelAlign" value={labelAlign} onChange={setLabelAlign}>
          <Option value="right">right</Option>
          <Option value="left">left</Option>
        </SelectBox>
        <SelectBox label="useColon" value={useColon} onChange={setUseColon}>
          <Option value={true}>true</Option>
          <Option value={false}>false</Option>
        </SelectBox>
        <SelectBox label="requiredMarkAlign" value={requiredMarkAlign} onChange={setRequiredMarkAlign}>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </SelectBox>
        <SelectBox label="showHelp" value={showHelp} onChange={setShowHelp}>
          <Option value="label">label</Option>
          <Option value="newLine">newLine</Option>
          <Option value="tooltip">tooltip</Option>
          <Option value="none">none</Option>
        </SelectBox>
        <Range
          label="separateSpacing.width"
          value={separateSpacingHorizontal}
          onChange={setSeparateSpacingHorizontal}
          marks={{ 0: 0, 100: 100 }}
        />
        <Range
          label="separateSpacing.height"
          value={separateSpacingVertical}
          onChange={setSeparateSpacingVertical}
          marks={{ 0: 0, 100: 100 }}
        />
        <SelectBox label="spacingType" value={spacingType} onChange={setSpacingType}>
          <Option value="around">around</Option>
          <Option value="between">between</Option>
          <Option value="evenly">evenly</Option>
        </SelectBox>
        {
          labelLayout === 'horizontal' && (
            <SelectBox label="labelWidth" value={labelWidth} onChange={setLabelWidth}>
              <Option value={fixedLabelWidth}>固定宽度[{fixedLabelWidth}]</Option>
              <Option value="auto">自动宽度auto</Option>
            </SelectBox>
          )
        }
      </Form>
      <Form
        labelWidth={labelWidth === 'auto' ? labelWidth : labelWidth.split(',').map(width => Number(width))}
        labelLayout={labelLayout}
        labelTooltip="overflow"
        labelAlign={labelAlign}
        useColon={useColon}
        requiredMarkAlign={requiredMarkAlign}
        showHelp={showHelp}
        columns={3}
        separateSpacing={{ width: separateSpacingHorizontal, height: separateSpacingVertical }}
        spacingType={spacingType}
        style={{ backgroundColor: '#eeeeee' }}
      >
        <TextField labelTooltip={['always', { title: 'ceshi', mouseEnterDelay: 1 }]} colSpan={3} label="手机号" placeholder="请输入手机号" pattern="1[3-9]\d{9}" name="phone" addonBefore="+86" addonAfter="中国大陆" help="请输入你的手机号" showHelp="tooltip" required highlight="高亮" />
        <RichText label="富文本" required />
        <Password label="密码" name="password" required />
        <NumberField rowSpan={2} label="年龄—请填写大于18的数字" name="age" min={18} step={1} required addonAfter="周岁" />
        <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} help="请输入与左侧相同的密码" showHelp="tooltip" />
        <Output label="文本展示" value="这里是Output文本展示" />
        <Switch label="是否冻结" name="flozen" unCheckedChildren="未冻结" required>冻结（内容溢出时，默认 tooltip 展示。内容溢出时，默认 tooltip 展示。）</Switch>
        <CheckBox label="是否开启" name="enabled" help="是否开启" />
        <Select label="语言" placeholder="请选择语言" name="language" required multiple>
          <Option value="zh-cn">简体中文</Option>
          <Option value="en-us">英语(美国)</Option>
          <Option value="ja-jp">日本語</Option>
        </Select>
        <EmailField label="邮箱" name="email" prefix={<Icon type="mail_outline" />} multiple />
        <TextArea resize="both" rowSpan={2} colSpan={2} label="简介" placeholder="请输入简介" name="description" style={{ height: 80 }} help="请输入100~300个字符请输入100~300个字符请输入100~300个字符" />
        <CodeArea colSpan={3} rows={4} label="代码" name="code" required />
        <UrlField label={<span>个人主页</span>} name="homepage" required help="请输入你的个人主页，如Github Pages个人博客" />
        <DatePicker label="生日" placeholder="请选择生日日期" name="birth" required />
        <div newLine colSpan={3}>
          <Button type="submit">注册</Button>
          <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
        </div>
      </Form>
    </>
  );
};

ReactDOM.render(
  <App />,
  mountNode
);
````
