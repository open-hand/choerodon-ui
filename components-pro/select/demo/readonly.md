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
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

const { Option } = Select;

const data = [{
  'first-name': 'huazhen',
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'first-name', readOnly: true },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <Select name="last-name" placeholder="请选择" readOnly defaultValue="jack">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="first-name" />
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
