import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Currency, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

function handleChange(value, oldValue) {
  console.log('[range newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'age',
        type: 'bigNumber',
        step: 2,
        required: true,
        max: '12345678901234567890123456',
        min: '-12345678901234567890123456',
        defaultValue: '123456789012345678',
        currency: 'USD',
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={16}>
        <Col span={24}>
          <Currency dataSet={this.ds} name="age" />
        </Col>
        <Col span={24}>
          <Currency
            stringMode
            max="1234567890"
            min="-1234567890"
            step="0.0000000001"
            precision={10}
            defaultValue="10000000.0000000001"
            onChange={handleChange}
            currency="CNY"
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
