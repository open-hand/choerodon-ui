import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'choerodon-ui';
import { DataSet, PercentField, Row, Col } from 'choerodon-ui/pro';
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

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'age',
        type: 'percentage',
        required: true,
        precision: 3,
        defaultValue: 0.125,
      },
      {
        name: 'ageRange',
        type: 'percentage',
        required: true,
        precision: 3,
        range: true,
        defaultValue: [0.1, 0.25],
      },
      {
        name: 'ageMultiple',
        type: 'percentage',
        required: true,
        precision: 3,
        multiple: true,
        defaultValue: [0.125, 0.25],
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField dataSet={this.ds} name="age" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField dataSet={this.ds} name="ageRange" placeholder="range" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField
            dataSet={this.ds}
            name="ageMultiple"
            placeholder="multiple"
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <ConfigProvider useZeroFilledDecimal inputDecimalSeparatorFollowLang>
    <App />
  </ConfigProvider>,
  document.getElementById('container'),
);
