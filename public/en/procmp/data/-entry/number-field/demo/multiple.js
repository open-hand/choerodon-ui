import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, NumberField, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const data = [{
  user: [31],
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'size', type: 'number', label: '尺码', multiple: true, step: 1, max: 10, min: 5, required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <NumberField dataSet={this.ds} name="size" placeholder="数据源多选" />
        </Col>
        <Col span={12}>
          <NumberField multiple onChange={handleChange} placeholder="多选" step={1} max={10} min={5} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
