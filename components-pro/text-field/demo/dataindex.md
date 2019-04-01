---
order: 4
title:
  zh-CN: 数据索引
  en-US: Data Index
---

## zh-CN

使用`dataIndex`进行指定数据所在数据源的索引，默认取数据源的当前索引。

## en-US

Use `dataIndex` to specify the data source of the data index, the default data source to take the current index

````jsx
import { DataSet, TextField, Row, Col } from 'choerodon-ui/pro';

const data = [
  { bind: 'data1' },
  { bind: 'data2' },
  { bind: 'data3' },
];

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'bind' },
    ],
    data,
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span="8">
          <TextField dataSet={this.ds} name="bind" dataIndex={0} />
        </Col>
        <Col span="8">
          <TextField dataSet={this.ds} name="bind" dataIndex={1} />
        </Col>
        <Col span="8">
          <TextField dataSet={this.ds} name="bind" dataIndex={2} />
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
