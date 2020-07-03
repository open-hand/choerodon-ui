import React from 'react';
import ReactDOM from 'react-dom';
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
  document.getElementById('container')
);
