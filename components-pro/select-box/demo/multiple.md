---
order: 5
title:
  zh-CN: 多选
  en-US: Multiple
---

## zh-CN

通过属性`multiple`设置多选。

## en-US

Multiple selection via property `multiple`.

````jsx
import { DataSet, SelectBox, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = SelectBox;

const data = [{
  user: ['wu'],
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户', multiple: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <SelectBox dataSet={this.ds} name="user">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </SelectBox>
        </Col>
        <Col span={12}>
          <SelectBox multiple onChange={handleChange}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </SelectBox>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
