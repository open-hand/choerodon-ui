import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Currency, NumberField, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'precision', type: 'number', defaultValue: 4, min: 0, max: 100 },
      { name: 'money', type: 'number', defaultValue: 1000000.123, required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span="12">
          <NumberField placeholder="精度" dataSet={this.ds} name="precision" />
        </Col>
        <Col span="12">
          <Currency 
            dataSet={this.ds} 
            name="money" 
            renderer={({ value, record }) => {
              // 仅为示例，具体精度处理根据需求调整
              return record.get('precision') > 99 || record.get('precision') < 0  ? value : value.toFixed(record.get('precision'));
             }
            } 
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
