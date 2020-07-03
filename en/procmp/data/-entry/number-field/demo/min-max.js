import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, NumberField, Row, Col } from 'choerodon-ui/pro';
import moment from 'moment';

function filterDate(currentDate) {
  const dayInWeek = currentDate.get('d');
  return dayInWeek !== 0 && dayInWeek !== 1;
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'start', type: 'number', max: 'end', step: 1 },
      { name: 'end', type: 'number', min: 'start', step: 1 },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={6}>
          <NumberField dataSet={this.ds} name="start" placeholder="start" />
        </Col>
        <Col span={6}>
          <NumberField dataSet={this.ds} name="end" placeholder="end" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
