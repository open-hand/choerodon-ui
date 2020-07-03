import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TextField, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'user', type: 'string', label: '用户', defaultValue: '', required: true, multiple: ',' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TextField dataSet={this.ds} name="user" placeholder="数据源多选" />
        </Col>
        <Col span={12}>
          <TextField multiple onChange={handleChange} placeholder="多选" defaultValue={['wu']} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
