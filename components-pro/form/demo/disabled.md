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
import {
  DataSet,
  Form,
  TextField,
  Password,
  NumberField,
  EmailField,
  UrlField,
  Lov,
  Switch,
  DatePicker,
  Select,
  SelectBox,
  Button,
  Menu,
  Dropdown,
  Icon,
  IntlField,
  Currency,
  Cascader,
  TreeSelect,
  ColorPicker,
  IconPicker,
} from 'choerodon-ui/pro';

const { Option } = Select;
const { TreeNode } = TreeSelect;

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

const App = () => {
  const [disabled, setDisabled] = React.useState(true);
  const ds = React.useMemo(() => new DataSet({
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
      },
      {
        name: 'confirmPassword',
        type: 'string',
        label: '确认密码',
        required: true,
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
      { name: 'sex', type: 'string', label: '性别', required: true, highlight: true },
      {
        name: 'language',
        type: 'string',
        label: '语言（labelWidth为auto自适应）',
        required: true,
        help: '超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息',
      },
      { name: 'email', type: 'email', label: '邮箱', required: true, highlight: '生日高亮' },
      { name: 'homepage', maxLength: 12, type: 'url', label: '个人主页', required: true },
      { name: 'birth', type: 'date', label: '生日', required: true },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE', placeholder:"d1" },
      { name: 'frozen', type: 'boolean', label: '是否冻结' },
    ],
    record: {
      dynamicProps: {
        disabled: (record) => record.isCurrent,
      },
    },
  }), []);
  return (
    <>
      <Button onClick={() => setDisabled(!disabled)}>{disabled ? '启用' : '禁用'}</Button>
      <Form header="Basic" disabled={disabled} style={{ width: '4rem' }}>
        <IntlField label='多语言' />
        <TextField label="手机号" tooltip="overflow" defaultValue="1588888888822158888888882215888888888221588888888822" pattern="1[3-9]\d{9}" name="phone" required clearButton addonBefore="+86" addonAfter="中国大陆" />
        <Password label="密码" defaultValue="1588888888822158888888882215888888888221588888888822" name="password" required />
        <Password label="确认密码" name="confirmPassword" required validator={passwordValidator} help="请输入与上方相同的密码" showHelp="tooltip" />
        <NumberField label="年龄" name="age" min={18} step={1} required help="我们需要确定你的年龄" addonAfter="周岁" />
        <Currency label='货币' step={1} />
        <SelectBox label="性别" name="sex" required>
          <Option value="M">男</Option>
          <Option value="F">女</Option>
        </SelectBox>
        <Select label="语言" name="language" required help="超过两行的帮助信息超过两行的帮助信息超过两行的帮助信息">
          <Option value="zh-cn">简体中文</Option>
          <Option value="en-us">英语(美国)</Option>
          <Option value="ja-jp">日本語</Option>
        </Select>
        <Cascader label='级联选择' options={[]} />
        <EmailField label="邮箱" name="email" required addonAfter={dropdown} />
        <UrlField label="个人主页" name="homepage" required addonBefore="Http://" />
        <DatePicker label="生日" name="birth" required />
        <TreeSelect
          label='树选择'
          placeholder="请选择"
          treeDefaultExpandAll
        >
          <TreeNode value="parent 1" title="parent 1">
            <TreeNode value="parent 1-0" title="parent 1-0">
              <TreeNode value="leaf1" title="my leaf" />
              <TreeNode value="leaf2" title="your leaf" />
            </TreeNode>
          </TreeNode>
        </TreeSelect>
        <ColorPicker label='颜色选择' defaultValue="#f1c7f2" />
        <IconPicker label='图标选择' value="person" />
        <Form>
          <div>
            <Button type="submit">注册</Button>
            <Button type="reset" style={{ marginLeft: 8 }}>重置</Button>
          </div>
        </Form>
      </Form>
      <Form header="DataSet" dataSet={ds} style={{ width: '4.5rem' }}>
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
        <UrlField name="homepage" showLengthInfo valueChangeAction="input" />
        <DatePicker name="birth" />
        <Lov name="code" placeholder="d2" />
        <Switch name="frozen" />
        <div>
          <Button type="submit">注册</Button>
          <Button type="reset">重置</Button>
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
