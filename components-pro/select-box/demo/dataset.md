---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源。

## en-US

DataSet Binding

````jsx
import { DataSet, SelectBox, Row, Col, Form } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, '[record.get(name)]', record.get(name));
  console.log(record.toJSONData())
}

const { Option } = SelectBox;

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Huazhen', value: 'huazhen' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

const data = [{
  'first-name': 'huazhen',
  'last-name': 'wu',
}];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    data,
    fields: [
      { name: 'first-name', type: 'string', label: '名', textField: 'text', valueField: 'value', options: this.optionDs },
      { name: 'last-name', type: 'string', label: '姓', multiple: ',' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Form dataSet={this.ds}>
        <Row gutter={10}>
          <Col span={12}>
            <SelectBox name="first-name" />
          </Col>
          <Col span={12}>
            <SelectBox name="last-name">
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="wu">Wu</Option>
            </SelectBox>
          </Col>
        </Row>
      </Form>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
