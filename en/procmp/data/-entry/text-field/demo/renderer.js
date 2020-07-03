import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TextField, Icon, Row, Col } from 'choerodon-ui/pro';

function valueRenderer({ value }) {
  return `${value}个`;
}

function colorRenderer({ text }) {
  return <span style={{ color: 'red' }}>{text}</span>;
}

class App extends React.Component {
  ds = new DataSet({
    data: [{ count: '30' }],
    fields: [{ name: 'count' }],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span="12">
          <TextField value="50" renderer={valueRenderer} />
        </Col>
        <Col span="12">
          <TextField
            dataSet={this.ds}
            name="count"
            renderer={colorRenderer}
            prefix={<Icon type="person" />}
            suffix={<Icon type="dehaze" />}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
