---
order: 15
title:
  zh-CN: 栅格布局
  en-US: Grid layout
---

## zh-CN

栅格布局。

## en-US

Grid layout.

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
  Row,
  Col,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const { Option } = Select;
const { FormVirtualGroup } = Form;

function passwordValidator(value, name, record) {
  if (value !== record.get('password')) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

@observer
class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'phone', type: 'string', label: '手机号手机号', required: true },
      { name: 'password', type: 'string', label: '密码', required: true },
      { name: 'confirmPassword', type: 'string', label: '确认密码', required: true, validator: passwordValidator },
      { name: 'age', type: 'number', label: '年龄', required: true, help: '我们需要确定你的年龄' },
      { name: 'sex', type: 'string', label: '性别', required: true },
      { name: 'language', type: 'string', label: '语言', required: true, help: '超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息' },
      { name: 'email', type: 'email', label: '邮箱', required: true },
      { name: 'homepage', type: 'url', label: '个人主页', required: true },
      { name: 'birth', type: 'date', label: '生日', required: true },
      { name: 'code', type: 'object', label: '代码描述代码描述代码描述代码描述代码描述代码描述代码描述代码描述代码描述代码描述', lovCode: 'LOV_CODE' },
    ],
  });

  settingDs = new DataSet({
    data: [
      { labelLayout: 'horizontal', labelWidthType: 'size', labelWidth: 100, labelAlign: 'right', useColon: true, requiredMarkAlign: 'left' },
    ],
  });

  render() {
    const { current } = this.settingDs;
    return (
      <>
        <Form record={current} columns={2} useColon labelTooltip="overflow">
          <Form.Item name="labelLayout" label="labelLayout">
            <SelectBox mode="button">
              <Option value="none">none</Option>
              <Option value="placeholder">placeholder</Option>
              <Option value="vertical">vertical</Option>
              <Option value="horizontal">horizontal</Option>
              <Option value="float">float</Option>
            </SelectBox>
          </Form.Item>
          <Form.Item label="labelWidth" name="labelWidthType">
            <SelectBox>
              <Option value="auto">auto</Option>
              <Option value="size"><NumberField name="labelWidth" disabled={current.get('labelWidthType') === 'auto'} /></Option>
            </SelectBox>
          </Form.Item>
          <Form.Item name="labelAlign" label="labelAlign">
            <SelectBox>
              <Option value="left">left</Option>
              <Option value="right">right</Option>
            </SelectBox>
          </Form.Item>
          <Form.Item name="requiredMarkAlign" label="requiredMarkAlign">
            <SelectBox>
              <Option value="left">left</Option>
              <Option value="right">right</Option>
            </SelectBox>
          </Form.Item>
          <Switch name="useColon" label="useColon" />
        </Form>
        <Form
          labelTooltip="overflow"
          header="栅格布局"
          record={this.ds.current}
          layout="none"
          showHelp='label'
          useColon={current.get('useColon')}
          labelAlign={current.get('labelAlign')}
          labelLayout={current.get('labelLayout')}
          labelWidth={current.get('labelWidthType') === 'auto' ? 'auto' : current.get('labelWidth')}
          requiredMarkAlign={current.get('requiredMarkAlign')}
        >
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item help='请正确填写手机号'>
                <TextField pattern="1[3-9]\d{9}" name="phone" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Password name="password"  help='请正确填写密码' showHelp='label' />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Password name="confirmPassword" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <NumberField name="age" min={18} step={1} addonAfter="周岁" showHelp="tooltip" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item>
                <SelectBox name="sex">
                  <Option value="M">男</Option>
                  <Option value="F">女</Option>
                </SelectBox>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Select name="language">
                  <Option value="zh-cn">简体中文</Option>
                  <Option value="en-us">英语(美国)</Option>
                  <Option value="ja-jp">日本語</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <EmailField name="email" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <UrlField name="homepage" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={6}>
              <Form.Item useColon={false}>
                <DatePicker name="birth" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <FormVirtualGroup useColon={false}>
                <Form.Item name="code">
                  <Lov />
                </Form.Item>
              </FormVirtualGroup>
            </Col>
          </Row>
          <Form.Item>
            <div>
              <Button type="submit">注册</Button>
              <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
            </div>
          </Form.Item>
        </Form>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
