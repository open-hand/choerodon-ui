---
order: 8
title:
  zh-CN: 只读
  en-US: Read Only
---

## zh-CN

只读。

## en-US

Read Only.

````jsx
import { DataSet, SelectBox, Row, Col } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Huazhen', value: 'huazhen' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

const data = [{
  name: 'huazhen',
}];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    data,
    fields: [
      { name: 'name', textField: 'text', valueField: 'value', options: this.optionDs, readOnly: true },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <SelectBox readOnly>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </SelectBox>
        </Col>
        <Col span={12}>
          <SelectBox dataSet={this.ds} name="name" />
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
