import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, TimePicker, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'time',
        type: 'time',
        format: 'hh:mm:ss A',
      },
      {
        name: 'time2',
        type: 'time',
        format: 'HH:mm',
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TimePicker
            dataSet={this.ds}
            name="time"
            placeholder="hh:mm:ss A: 12:00:00 凌晨"
          />
        </Col>
        <Col span={12}>
          <TimePicker
            dataSet={this.ds}
            name="time2"
            placeholder="HH:mm : 10:25"
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
