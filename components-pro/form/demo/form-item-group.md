---
order: 16
title:
  zh-CN: 组合输入
  en-US: Item group
---

## zh-CN

组合输入。

## en-US

Item group.

```jsx
import {
  DataSet,
  Form,
  TextField,
  NumberField,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
} from 'choerodon-ui/pro';

const { Option } = Select;
const { ItemGroup } = Form;

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'phonePrefix',
        type: 'string',
        label: '手机区号',
        required: true,
      },
      {
        name: 'phone',
        type: 'string',
        label: '手机号',
        labelWidth: 150,
        required: true,
        pattern: '^1[3-9]\\d{9}$',
      },
      {
        name: 'ageLevel',
        type: 'string',
        label: '年龄阶段',
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
      { name: 'birthDate', type: 'date', label: '生日日期', required: true },
      { name: 'birthTime', type: 'time', label: '生日时间', required: true },
    ],
  });

  clear = () => {
    const { current } = this.ds;
    current.reset();
  };

  validateCurrent = () => {
    const { current } = this.ds;
    current.validate();
  };

  validatePhone = () => {
    const { current } = this.ds;
    const field = current.getField('phone');
    const fieldPrefix = current.getField('phonePrefix');
    field.checkValidity();
    fieldPrefix.checkValidity();
  };

  render() {
    return (
      <div>
        <div>
          <h2>非Form下使用：</h2>
          <Row>
            <Col span={10}>
              <ItemGroup compact>
                <Select style={{ width: '30%' }} required>
                  <Option value="China">中国</Option>
                  <Option value="America">美国</Option>
                  <Option value="Japan">日本</Option>
                </Select>
                <TextField style={{ width: '50%' }} required clearButton />
              </ItemGroup>
            </Col>
            <Col span={10} offset={2}>
              <ItemGroup>
                <TextField style={{ width: '30%' }} help="这里是提示信息" required clearButton />
                <TextField style={{ width: '50%' }} required clearButton />
              </ItemGroup>
            </Col>
          </Row>
        </div>
        <br/>
        <h2>Form下使用：</h2>
        <Form dataSet={this.ds} style={{ width: '4.5rem' }} labelWidth={120}>
          <ItemGroup label="手机号(compact)" help="请正确填写手机号" required useColon compact>
            <TextField name="phonePrefix" placeholder="例：+86" style={{ width: '40%' }} help="手机区号" />
            <TextField name="phone" style={{ width: '50%' }} />
          </ItemGroup>
          <ItemGroup label="手机号手机号手机号" help="请正确填写手机号" required useColon>
            <Form.Item>
              <TextField name="phonePrefix" placeholder="例：+86" style={{ width: '40%' }} help="手机区号" />
            </Form.Item>
            <Form.Item>
              <TextField name="phone" style={{ width: '50%' }} />
            </Form.Item>
          </ItemGroup>
          <ItemGroup label="年龄" help="正确输入年龄" required useColon compact>
            <Select name="ageLevel" style={{ width: '40%' }} required>
              <Option value="young">青年</Option>
              <Option value="old">老年</Option>
            </Select>
            <NumberField name="age" addonAfter="周岁" showHelp="tooltip" />
          </ItemGroup>
          <ItemGroup label="生日" required useColon compact>
            <DatePicker name="birthDate" mode="date" />
            <DatePicker name="birthTime" mode="time" />
          </ItemGroup>

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
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
