import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, value, oldValue }) {
  console.log('[dataset]', value, '[oldValue]', oldValue, '[record.toJSONData()]', record.toJSONData());
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'sheng',
        label: '省',
        lookupCode: 'SHENG',
        valueField: 'codeValueId',
        defaultValue: '10206',
      },
      {
        name: 'shi',
        type: 'number',
        valueField: 'codeValueId',
        label: '市',
        lookupCode: 'SHI',
        cascadeMap: { parentCodeValueId: 'sheng' },
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
          <Select dataSet={this.ds} name="sheng" />
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="shi" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
