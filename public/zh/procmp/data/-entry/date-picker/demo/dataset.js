import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, DatePicker, DateTimePicker, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value && value.format(),
    '[oldValue]',
    oldValue && oldValue.format(),
  );
}

const data = [
  {
    birth: '1984-11-22',
    creationTime: '2017-12-22 15:00:00',
  },
];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [{ name: 'birth', type: 'date' }, { name: 'creationTime', type: 'dateTime' }],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="birth" />
        </Col>
        <Col span={12}>
          <DateTimePicker dataSet={this.ds} name="creationTime" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
