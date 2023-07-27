import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, NumberField, Row, Col } from 'choerodon-ui/pro';
import { configure, Divider } from 'choerodon-ui';

configure({
  // 开启补零显示，不影响真实值
  useZeroFilledDecimal: true,
});

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
      { name: 'age', type: 'number', precision: 3 },
      { name: 'ageRange', type: 'number', precision: 2, range: true },
      { name: 'ageMultiple', type: 'number', precision: 2, multiple: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Divider orientation="left">precision: 3</Divider>
        <Col span={24}>
          <NumberField dataSet={this.ds} name="age" />
        </Col>
        <Divider orientation="left">precision: 2, range 模式</Divider>
        <Col span={24}>
          <NumberField dataSet={this.ds} name="ageRange" />
        </Col>
        <Divider orientation="left">precision: 2, multiple 模式</Divider>
        <Col span={24}>
          <NumberField
            dataSet={this.ds}
            name="ageMultiple"
            placeholder="multiple"
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
