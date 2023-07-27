import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Output, Row, Col } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'user',
        type: 'string',
        label: '用户',
        defaultValue: 'Jack,Rose,Hugh',
        required: true,
        multiple: ',',
      },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <span>绑定数据源：</span>
          <Output dataSet={this.ds} name="user" />
        </Col>
        <Col span={12}>
          <span>直接使用：</span>
          <Output multiple value={['wu', 'zoe', 'jasson']} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
