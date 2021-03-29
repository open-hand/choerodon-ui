import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Output, Row, Col } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'first-name',
        type: 'string',
        defaultValue: 'Zhangsan',
        required: true,
      },
      {
        name: 'number',
        type: 'number',
        defaultValue: 18888.11,
        required: true,
        precision: 4,
        formatterOptions: { options: { useGrouping: false } },
      },
    ],
  });

  render() {
    return (
      <Row>
        <Col span={12}>
          <Output dataSet={this.ds} name="first-name" />
        </Col>
        <Col span={12}>
          <Output dataSet={this.ds} name="number" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
