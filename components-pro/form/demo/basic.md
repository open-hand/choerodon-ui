---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

表单。

## en-US

Form.

```jsx
import {
  Form,
  TextField,
  Password,
  NumberField,
  EmailField,
  UrlField,
  DatePicker,
  Select,
  SelectBox,
  Button,
  Menu,
  Dropdown,
  Icon,
} from 'choerodon-ui/pro';

const { Option } = Select;

function passwordValidator(value, name, form) {
  if (value !== form.getField('password').getValue()) {
    return '您两次输入的密码不一致，请重新输入';
  }
  return true;
}

function validationRenderer(error, props) {
  if (error.ruleName === 'valueMissing' && props.name === 'password') {
    return <span style={{ color: 'blue' }}>{error.validationMessage}(自定义)</span>;
  }
}

const menu = (
  <Menu>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.io/">
        1st menu item
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://choerodon.com.cn/">
        2nd menu item
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-hand/choerodon-ui">
        3rd menu item
      </a>
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

const App = () => {
  const phoneRef = React.useRef();
  const validatePhone = React.useCallback(() => {
    const { current } = phoneRef;
    if (current) {
      current.checkValidity();
    }
  }, [phoneRef]);
  const style = React.useMemo(() => ({ width: '4rem' }), []);

  return (
    <Form id="basic" style={style} labelWidth="auto">
      <TextField
        ref={phoneRef}
        label="手机号"
        labelWidth={150}
        pattern={/1[3-9]\d{9}/g}
        name="phone"
        required
        clearButton
        showValidation="newLine"
        addonBefore="+86"
        addonAfter="中国大陆"
      />
      <TextField
        label="手机号的label自动宽度"
        pattern="1[3-9]\d{9}"
        name="phone"
        required
        clearButton
        addonBefore="+86"
        addonAfter="中国大陆"
      />
      <Password label="密码" name="password" required validationRenderer={validationRenderer} />
      <Password
        label="确认密码"
        name="confirmPassword"
        required
        validator={passwordValidator}
        help="请输入与上方相同的密码"
        showHelp="tooltip"
        helpTooltipProps={{ placement: 'bottom',popupClassName:'custom-cls'}}
      />
      <NumberField
        label="年龄"
        name="age"
        min={18}
        step={1}
        required
        help="我们需要确定你的年龄"
        addonAfter="周岁"
      />
      <SelectBox highlight label="性别" name="sex" required>
        <Option value="M">男</Option>
        <Option value="F">女</Option>
      </SelectBox>
      <Select
        label="语言"
        name="language"
        required
        help="超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息"
      >
        <Option value="zh-cn">简体中文</Option>
        <Option value="en-us">英语(美国)</Option>
        <Option value="ja-jp">日本語</Option>
      </Select>
      <EmailField label="邮箱" name="email" required addonAfter={dropdown} />
      <UrlField label="个人主页" name="homepage" required addonBefore="Http://" />
      <DatePicker highlight="生日高亮" label="生日" name="birth" required />
      <div>
        <Button type="submit">注册</Button>
        <Button type="reset" style={{ marginLeft: 8 }}>
          重置
        </Button>
        <Button onClick={validatePhone}>校验手机</Button>
      </div>
    </Form>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
```

```css
.custom-cls .c7n-pro-tooltip-popup-inner {
  background: #3f51b5;
  color: white;
  max-width: 999px;
}
.custom-cls.c7n-pro-tooltip-popup-placement-top .c7n-pro-tooltip-popup-arrow {
  border-top-color: #3f51b5;
}
.custom-cls.c7n-pro-tooltip-popup-placement-right .c7n-pro-tooltip-popup-arrow {
  border-right-color: #3f51b5;
}
.custom-cls.c7n-pro-tooltip-popup-placement-bottom .c7n-pro-tooltip-popup-arrow {
  border-bottom-color: #3f51b5;
}
.custom-cls.c7n-pro-tooltip-popup-placement-left .c7n-pro-tooltip-popup-arrow {
  border-left-color: #3f51b5;
}
```