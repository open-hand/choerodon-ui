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
        defaultValue: [1, 10],
        required: true,
        range: true,
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
          <Output range value={[20, 30]} />
        </Col>
        <Col span={24}>
          <span>range 配置 ['start', 'end']：</span>
          <Output range={['start', 'end']} value={{ start: 30, end: 50 }} />
        </Col>
        <Col span={24}>
          <span>multiple & range：</span>
          <Output
            multiple
            range
            value={[
              [1, 10],
              [20, 30],
              [30, 50],
            ]}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
