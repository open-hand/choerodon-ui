---
order: 10
title:
  zh-CN: 多值
  en-US: Multiple
---

## zh-CN

通过属性`multiple`设置为多值。

## en-US

Multiple values via property `multiple`.

````jsx
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Select;

const data = [{
  user: ['wu'],
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户', multiple: true, required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24}>
          <Select dataSet={this.ds} name="user" placeholder="数据源多选" maxTagCount={2} maxTagTextLength={3} maxTagPlaceholder={restValues => `+${restValues.length}...`}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple placeholder="多选" onChange={handleChange} defaultValue={['jack', 'wu', 'lucy']}>
            <Option value="jack">Jack</Option>
            <Option disabled value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple searchable placeholder="多选+搜索" onChange={handleChange} style={{ height: 30 }}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple combo placeholder="多选+复合" onChange={handleChange}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple combo searchable placeholder="多选+复合+过滤" onChange={handleChange}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple placeholder="多选+禁用" disabled defaultValue={['jack', 'wu']}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select multiple placeholder="多选+只读" readOnly defaultValue={['jack', 'wu']}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
            <Option value="a1">a1</Option>
            <Option value="b2">b2</Option>
            <Option value="c3">c3</Option>
          </Select>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
